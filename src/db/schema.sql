-- ============================================================================
-- DAWA MED PLATFORM: PRODUCTION-GRADE DATABASE SCHEMA (PostgreSQL 14+)
-- Pan-African Licensed e-Pharmacy, Prescription Verification & Cold-Chain Telemetry
-- ============================================================================

-- Enable essential extensions for UUIDs and spatial indexing
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. ENUMS & DOMAINS
-- ============================================================================

CREATE TYPE user_role_enum AS ENUM (
  'customer',
  'pharmacy',
  'driver',
  'admin',
  'super_admin',
  'pharmacy_admin',
  'system_admin'
);

CREATE TYPE order_status_enum AS ENUM (
  'order_received',
  'waiting_pharmacy',
  'prescription_under_review',
  'pharmacy_accepted',
  'medicine_being_prepared',
  'ready_for_pickup',
  'driver_assigned',
  'picked_up',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'refunded'
);

CREATE TYPE rx_status_enum AS ENUM (
  'pending_review',
  'under_review',
  'approved',
  'rejected',
  'clarification_requested',
  'dispensed',
  'expired'
);

CREATE TYPE payment_status_enum AS ENUM (
  'pending',
  'authorized',
  'paid',
  'failed',
  'refunded',
  'chargeback'
);

CREATE TYPE subscription_status_enum AS ENUM (
  'active',
  'trial',
  'paused',
  'payment_failed',
  'cancelled',
  'expired'
);

CREATE TYPE verification_status_enum AS ENUM (
  'pending_verification',
  'under_review',
  'verified',
  'suspended',
  'rejected'
);

-- ============================================================================
-- 2. USERS & ACCESS CONTROL (RBAC)
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(150) NOT NULL,
  role user_role_enum NOT NULL DEFAULT 'customer',
  country_code VARCHAR(5) NOT NULL, -- e.g. 'KE', 'UG', 'TZ', 'RW', 'NG', 'EG'
  city VARCHAR(100) NOT NULL,
  street_address TEXT,
  gps_latitude DECIMAL(10, 8),
  gps_longitude DECIMAL(11, 8),
  preferred_language VARCHAR(5) DEFAULT 'en', -- 'en', 'ar', 'fr', 'sw'
  is_verified BOOLEAN DEFAULT FALSE,
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete support
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_country ON users(country_code);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- 3. LICENSED PHARMACIES & PHARMACISTS
-- ============================================================================

CREATE TABLE pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  license_number VARCHAR(100) NOT NULL UNIQUE,
  regulatory_authority VARCHAR(100) NOT NULL, -- e.g. PPB Kenya, NDA Uganda, TMDA Tanzania
  license_expiry_date DATE NOT NULL,
  pharmacist_in_charge VARCHAR(150) NOT NULL,
  pharmacist_reg_number VARCHAR(100) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(255),
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  country_code VARCHAR(5) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  has_cold_chain_storage BOOLEAN DEFAULT TRUE,
  is_24_hours BOOLEAN DEFAULT FALSE,
  verification_status verification_status_enum DEFAULT 'pending_verification',
  rating DECIMAL(3, 2) DEFAULT 5.00,
  review_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pharmacies_country_city ON pharmacies(country_code, city);
CREATE INDEX idx_pharmacies_status ON pharmacies(verification_status);

-- ============================================================================
-- 4. MEDICINES & INVENTORY BATCHES
-- ============================================================================

CREATE TABLE medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  generic_name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  dosage VARCHAR(50) NOT NULL,
  dosage_form VARCHAR(50) NOT NULL,
  package_size VARCHAR(50) NOT NULL,
  manufacturer VARCHAR(150) NOT NULL,
  requires_prescription BOOLEAN DEFAULT FALSE,
  requires_cold_chain BOOLEAN DEFAULT FALSE, -- 2°C - 8°C
  storage_conditions TEXT,
  description_en TEXT,
  description_ar TEXT,
  description_fr TEXT,
  description_sw TEXT,
  base_price_usd DECIMAL(10, 2) NOT NULL CHECK (base_price_usd >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_medicines_generic_name ON medicines(generic_name);
CREATE INDEX idx_medicines_category ON medicines(category);

CREATE TABLE pharmacy_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE RESTRICT,
  sku VARCHAR(100) NOT NULL,
  batch_number VARCHAR(100) NOT NULL,
  expiry_date DATE NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  unit_price_usd DECIMAL(10, 2) NOT NULL CHECK (unit_price_usd > 0),
  is_expired BOOLEAN GENERATED ALWAYS AS (expiry_date < CURRENT_DATE) STORED,
  low_stock_threshold INT DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT uq_pharmacy_medicine_batch UNIQUE (pharmacy_id, medicine_id, batch_number)
);

CREATE INDEX idx_inventory_expiry ON pharmacy_inventory(expiry_date);
CREATE INDEX idx_inventory_stock ON pharmacy_inventory(pharmacy_id, stock_quantity);

-- ============================================================================
-- 5. PRESCRIPTIONS & CLINICAL AUDIT LOGS
-- ============================================================================

CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_name VARCHAR(150) NOT NULL,
  patient_phone VARCHAR(30) NOT NULL,
  patient_age INT,
  doctor_name VARCHAR(150),
  clinic_name VARCHAR(200),
  doctor_reg_number VARCHAR(100),
  file_url TEXT NOT NULL,
  file_type VARCHAR(20) NOT NULL, -- 'image/png', 'image/jpeg', 'application/pdf'
  file_hash_sha256 VARCHAR(64) NOT NULL,
  is_encrypted BOOLEAN DEFAULT TRUE,
  is_chronic_condition BOOLEAN DEFAULT FALSE,
  status rx_status_enum DEFAULT 'pending_review',
  assigned_pharmacy_id UUID REFERENCES pharmacies(id),
  reviewed_by_pharmacist VARCHAR(150),
  pharmacist_license_number VARCHAR(100),
  pharmacist_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_prescriptions_user ON prescriptions(user_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);

CREATE TABLE prescription_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'uploaded', 'reviewed', 'approved', 'rejected', 'clarification'
  actor_id UUID NOT NULL REFERENCES users(id),
  actor_role user_role_enum NOT NULL,
  pharmacist_license VARCHAR(100),
  notes TEXT,
  ip_address VARCHAR(45),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rx_audit_prescription ON prescription_audit_logs(prescription_id);

-- ============================================================================
-- 6. COURIER DRIVERS & FLEET
-- ============================================================================

CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  national_id_number VARCHAR(100) NOT NULL UNIQUE,
  vehicle_type VARCHAR(50) NOT NULL, -- 'motorcycle', 'bicycle', 'electric_scooter', 'refrigerated_van'
  vehicle_plate VARCHAR(50) NOT NULL,
  is_cold_chain_certified BOOLEAN DEFAULT TRUE,
  insulated_box_serial VARCHAR(100),
  verification_status verification_status_enum DEFAULT 'pending_verification',
  is_online BOOLEAN DEFAULT FALSE,
  is_busy BOOLEAN DEFAULT FALSE,
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  rating DECIMAL(3, 2) DEFAULT 5.00,
  total_deliveries INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_drivers_status ON drivers(is_online, is_busy, verification_status);

-- ============================================================================
-- 7. ORDERS, ITEMS & LIFECYCLE HISTORY
-- ============================================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE RESTRICT,
  prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  subtotal_usd DECIMAL(10, 2) NOT NULL,
  delivery_fee_usd DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  service_fee_usd DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  discount_amount_usd DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_amount_usd DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status payment_status_enum DEFAULT 'pending',
  status order_status_enum DEFAULT 'order_received',
  delivery_address TEXT NOT NULL,
  delivery_latitude DECIMAL(10, 8),
  delivery_longitude DECIMAL(11, 8),
  delivery_otp VARCHAR(6) NOT NULL, -- 4 or 6 digit secure handover PIN
  qr_code_signature TEXT NOT NULL, -- Non-PII tamper-proof cryptographic token
  requires_cold_chain BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_pharmacy ON orders(pharmacy_id);
CREATE INDEX idx_orders_driver ON orders(driver_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE RESTRICT,
  inventory_batch_id UUID REFERENCES pharmacy_inventory(id) ON DELETE RESTRICT,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price_usd DECIMAL(10, 2) NOT NULL,
  total_price_usd DECIMAL(10, 2) NOT NULL
);

CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status order_status_enum NOT NULL,
  actor_id UUID REFERENCES users(id),
  actor_role user_role_enum NOT NULL,
  notes TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_status_history_order ON order_status_history(order_id);

-- ============================================================================
-- 8. PAYMENTS & TRANSACTION AUDIT
-- ============================================================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  reference_id VARCHAR(100) NOT NULL UNIQUE,
  external_transaction_id VARCHAR(150),
  gateway_provider VARCHAR(50) NOT NULL, -- 'mpesa', 'mtn_momo', 'airtel_money', 'paystack', 'card_stripe'
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  status payment_status_enum DEFAULT 'pending',
  phone_number VARCHAR(30),
  tokenized_card_id VARCHAR(100),
  idempotency_key VARCHAR(100) UNIQUE,
  initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT
);

CREATE INDEX idx_payments_reference ON payments(reference_id);
CREATE INDEX idx_payments_order ON payments(order_id);

-- ============================================================================
-- 9. DAWA MED MONTHLY SUBSCRIPTIONS & INVOICES
-- ============================================================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_name VARCHAR(100) DEFAULT 'DAWA_MED_MONTHLY',
  monthly_price_usd DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
  status subscription_status_enum DEFAULT 'active',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  next_billing_date DATE NOT NULL,
  auto_renew BOOLEAN DEFAULT TRUE,
  payment_method_type VARCHAR(50) NOT NULL,
  tokenized_payment_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_next_billing ON subscriptions(next_billing_date, status);

-- ============================================================================
-- 10. MEDICATION REMINDERS & ADHERENCE TRACKING
-- ============================================================================

CREATE TABLE medication_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  medicine_name VARCHAR(200) NOT NULL,
  generic_name VARCHAR(200),
  dosage_instructions TEXT NOT NULL,
  frequency VARCHAR(50) NOT NULL,
  reminder_times JSONB NOT NULL, -- e.g. ["08:00 AM", "08:00 PM"]
  start_date DATE NOT NULL,
  end_date DATE,
  total_quantity INT NOT NULL,
  remaining_quantity INT NOT NULL CHECK (remaining_quantity >= 0),
  refill_reminder_threshold INT DEFAULT 5,
  family_member VARCHAR(50) DEFAULT 'Myself',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE reminder_adherence_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id UUID NOT NULL REFERENCES medication_reminders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_time VARCHAR(20) NOT NULL,
  action VARCHAR(20) NOT NULL, -- 'taken', 'snoozed', 'skipped'
  snooze_minutes INT,
  skip_reason TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_adherence_reminder ON reminder_adherence_logs(reminder_id);

-- ============================================================================
-- 11. COLD-CHAIN TELEMETRY & IOT TEMPERATURE LOGS
-- ============================================================================

CREATE TABLE cold_chain_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE RESTRICT,
  device_serial VARCHAR(100),
  temperature_celsius DECIMAL(4, 2) NOT NULL,
  is_compliant BOOLEAN GENERATED ALWAYS AS (temperature_celsius >= 2.00 AND temperature_celsius <= 8.00) STORED,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  speed_kmh DECIMAL(5, 2),
  battery_level_percent INT,
  is_simulated BOOLEAN DEFAULT FALSE,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_telemetry_order ON cold_chain_telemetry(order_id);
CREATE INDEX idx_telemetry_compliance ON cold_chain_telemetry(is_compliant);

-- ============================================================================
-- 12. REVIEWS, DISPUTES & AUDIT LOGS
-- ============================================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE RESTRICT,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  pharmacy_rating INT CHECK (pharmacy_rating BETWEEN 1 AND 5),
  pharmacy_comment TEXT,
  delivery_rating INT CHECK (delivery_rating BETWEEN 1 AND 5),
  delivery_comment TEXT,
  reported_problem TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_role user_role_enum NOT NULL,
  actor_name VARCHAR(150) NOT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT NOT NULL,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_timestamp ON audit_logs(created_at);

-- ============================================================================
-- 13. PLATFORM SETTINGS & DATA PRIVACY REQUESTS
-- ============================================================================

CREATE TABLE platform_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_by VARCHAR(150),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE data_privacy_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_type VARCHAR(50) NOT NULL, -- 'export_health_data', 'delete_account_and_records'
  status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected'
  download_url TEXT,
  reason TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);
