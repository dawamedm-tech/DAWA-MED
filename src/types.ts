export type UserRole = 
  | 'customer' 
  | 'pharmacy' 
  | 'driver' 
  | 'admin' 
  | 'support'
  | 'super_admin'
  | 'medical_admin'
  | 'operations_admin'
  | 'support_admin'
  | 'subscription' 
  | 'website'
  | 'pharmacy_admin'
  | 'system_admin';

export type Permission = 
  // User Management
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'users.change_password'
  // Pharmacy Network
  | 'pharmacies.view'
  | 'pharmacies.register'
  | 'pharmacies.approve'
  | 'pharmacies.reject'
  | 'pharmacies.suspend'
  | 'pharmacies.delete'
  // Medicines & Catalogue
  | 'medicines.view'
  | 'medicines.create'
  | 'medicines.edit'
  | 'medicines.approve'
  | 'medicines.reject'
  | 'medicines.suspend'
  | 'medicines.delete'
  // Inventory
  | 'inventory.view'
  | 'inventory.manage'
  // Orders & Deliveries
  | 'orders.view'
  | 'orders.create'
  | 'orders.manage'
  | 'orders.dispense'
  | 'orders.cancel'
  // Prescriptions
  | 'prescriptions.upload'
  | 'prescriptions.review'
  | 'prescriptions.view_audit'
  // Payments & Refunds
  | 'payments.view'
  | 'payments.initiate'
  | 'payments.refund'
  | 'payments.manage'
  // Support & Escalations
  | 'support.view'
  | 'support.manage'
  | 'support.reply'
  // Platform & Site Settings
  | 'settings.view'
  | 'settings.manage'
  | 'settings.email_manage'
  | 'settings.site_manage'
  // Monetization & Analytics
  | 'analytics.view'
  | 'monetization.view'
  | 'monetization.manage'
  // Audit Logs
  | 'audit.view'
  // Administrators Management
  | 'administrators.view'
  | 'administrators.create'
  | 'administrators.edit'
  | 'administrators.delete'
  | 'administrators.change_role'
  | 'administrators.manage_permissions'
  | 'administrators.change_password'
  | 'administrators.reset_sessions';

export type MedicineApprovalStatus = 
  | 'draft'
  | 'pending_approval'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'changes_requested'
  | 'suspended'
  | 'archived';

export type PharmacyApprovalStatus = 
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'more_info_required'
  | 'suspended';

export type AccountStatus = 'active' | 'pending' | 'suspended' | 'blocked' | 'deleted';

export type Language = 'en' | 'ar' | 'fr' | 'sw';

export interface CountryConfig {
  code: string;
  name: string;
  nameAr: string;
  nameFr?: string;
  nameSw: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  exchangeRateToUSD: number;
  regulatoryBody: string;
  mobileMoneyProviders: string[];
  ussdCode: string;
  sampleCity: string;
  whatsappSupportNumber?: string;
}

export type MedicineCategory = 
  | 'all'
  | 'pain_fever'
  | 'vitamins'
  | 'chronic' 
  | 'first_aid'
  | 'personal_care'
  | 'antibiotics' 
  | 'respiratory' 
  | 'maternal' 
  | 'gastro'
  | 'other';

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: MedicineCategory;
  dosage: string;
  form: 'tablets' | 'capsules' | 'syrup' | 'inhaler' | 'injection' | 'drops' | 'cream' | 'solution';
  packageSize: string;
  priceUSD: number;
  requiresPrescription: boolean;
  requiresColdChain?: boolean;
  descriptionEn: string;
  descriptionAr: string;
  descriptionFr?: string;
  descriptionSw: string;
  manufacturer: string;
  stockCount: number;
  indications: string[];
  storageCondition: string;
  availablePharmacyIds: string[];
  
  // Approval Workflow Fields (Mandatory for Dawa Med Compliance)
  approvalStatus: MedicineApprovalStatus;
  submittedByPharmacyId?: string;
  submittedByPharmacyName?: string;
  submittedAt?: string;
  reviewedByAdminId?: string;
  reviewedByAdminName?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  changeRequestNotes?: string;
  batchNumber?: string;
  expiryDate?: string;
  activeIngredient?: string;
  regulatoryApprovalNumber?: string;
  documentUrls?: string[];
}

export type OrderStatus = 
  | 'order_received'
  | 'waiting_pharmacy'
  | 'prescription_under_review'
  | 'pharmacy_accepted'
  | 'medicine_being_prepared'
  | 'ready_for_pickup'
  | 'driver_assigned'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  // Legacy aliases for backward compatibility
  | 'submitted'
  | 'pharmacist_reviewing'
  | 'approved'
  | 'preparing'
  | 'in_transit'
  | 'rejected';

export interface OrderItem {
  medicine: Medicine;
  quantity: number;
  unitPrice: number;
}

export interface PrescriptionData {
  id: string;
  imageUrl?: string;
  fileName?: string;
  fileType?: 'image' | 'pdf';
  fileSizeKb?: number;
  doctorName?: string;
  clinicName?: string;
  doctorRegNumber?: string;
  patientName: string;
  patientAge?: number;
  patientPhone: string;
  notes?: string;
  uploadedAt: string;
  isChronicCondition: boolean;
  isEncrypted: boolean;
  verifiedByPharmacist?: string;
  pharmacistNotes?: string;
}

export interface OrderReview {
  pharmacyRating?: number;
  pharmacyComment?: string;
  deliveryRating?: number;
  deliveryComment?: string;
  reportedProblem?: string;
  submittedAt?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  city: string;
  countryCode: string;
  customerCoordinates?: { lat: number; lng: number };
  items: OrderItem[];
  subtotalAmount: number;
  deliveryFee: number;
  serviceFee: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'cash_on_delivery';
  status: OrderStatus;
  prescription?: PrescriptionData;
  pharmacyId: string;
  pharmacyName: string;
  pharmacistLicense: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverVehicle?: string;
  driverTemperature?: number; // In Celsius (e.g., 4.2°C for cold-chain)
  driverCoordinates?: { lat: number; lng: number };
  pharmacyCoordinates?: { lat: number; lng: number };
  estimatedDeliveryMinutes: number;
  distanceKm: number;
  deliveryOtp: string;
  qrCodeSignature: string;
  packageBatchNumber?: string;
  expiryDate?: string;
  deliveredAt?: string;
  review?: OrderReview;
}

export interface PharmacyPartner {
  id: string;
  name: string;
  legalName?: string;
  licenseNumber: string;
  city: string;
  countryCode: string;
  pharmacistInCharge: string;
  pharmacistLicenseNumber?: string;
  phone: string;
  email?: string;
  address: string;
  rating: number;
  isOpen: boolean;
  is24_7?: boolean;
  hasColdChain: boolean;
  acceptsEPrescription: boolean;
  distanceKm: number;
  estimatedDeliveryMin: number;
  activeOrdersCount: number;
  coordinates: { lat: number; lng: number };
  openingHours?: string;
  logoUrl?: string;
  verificationStatus: 'verified' | 'pending_verification' | 'suspended' | 'rejected';
  approvalStatus: PharmacyApprovalStatus;
  licenseExpiryDate?: string;
  regulatoryAuthority?: string;
  totalOrdersHandled?: number;
  revenueUSD?: number;
  rejectionReason?: string;
  infoRequestNotes?: string;
  registeredAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  documents?: {
    licenseDoc?: string;
    pharmacistCertificate?: string;
    inspectionCert?: string;
    businessReg?: string;
  };
}

export interface PharmacyInventoryItem {
  id: string;
  pharmacyId: string;
  medicineName: string;
  sku: string;
  category: MedicineCategory;
  dosage: string;
  form: 'tablets' | 'capsules' | 'syrup' | 'inhaler' | 'injection' | 'drops' | 'cream' | 'solution';
  quantity: number;
  priceUSD: number;
  expiryDate: string; // e.g. "2027-11" or "2024-02"
  batchNumber: string;
  storageCondition: string;
  isColdChain: boolean;
  requiresPrescription: boolean;
  availability: 'available' | 'low_stock' | 'out_of_stock' | 'expired_blocked';
  isExpired: boolean;
}

export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  idNumber: string;
  vehicleType: 'motorcycle' | 'bicycle' | 'electric_scooter' | 'refrigerated_van';
  vehiclePlate: string;
  photoUrl: string;
  status: 'online' | 'offline' | 'busy' | 'on_delivery';
  verificationStatus: 'verified' | 'pending' | 'suspended';
  rating: number;
  totalDeliveries: number;
  onTimeRate: number;
  currentLocation?: { lat: number; lng: number; area: string };
  assignedOrderId?: string;
  temperatureReading?: number;
}

export interface AdminCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  countryCode: string;
  joinedDate: string;
  status: 'active' | 'suspended' | 'blocked';
  totalOrders: number;
  totalSpentUSD: number;
  activeSubscription: boolean;
  notes?: string;
}

export interface ChronicSubscription {
  id: string;
  patientName: string;
  condition: string;
  planName: string;
  monthlyMedicines: { medicine: Medicine; quantity: number }[];
  deliveryDayOfMonth: number;
  nextDeliveryDate: string;
  status: 'active' | 'paused' | 'cancelled';
  pillReminders: { time: string; medicineName: string; dosage: string; period: 'morning' | 'afternoon' | 'evening' | 'night' }[];
  autoRefillDaysBefore: number;
  discountPercentage: number;
}

export type TicketCategory = 
  | 'customer_complaint' 
  | 'pharmacy_complaint' 
  | 'driver_complaint' 
  | 'payment_issue' 
  | 'missing_item' 
  | 'wrong_item' 
  | 'delivery_problem'
  | 'prescription_issue'
  | 'system_access';

export type TicketPriority = 'urgent' | 'urgent_clinical' | 'high' | 'medium' | 'low';
export type TicketStatus = 
  | 'open' 
  | 'in_progress' 
  | 'in_investigation'
  | 'waiting_for_customer' 
  | 'escalated' 
  | 'resolved' 
  | 'closed';

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  timestamp: string;
  attachments?: string[];
  isInternalNote?: boolean;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  category: TicketCategory;
  title: string;
  description: string;
  orderId?: string;
  raisedBy: string;
  customerName?: string;
  userRole: 'customer' | 'pharmacy' | 'driver';
  contactPhone: string;
  contactEmail?: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt?: string;
  closedAt?: string;
  assignedOfficer?: string;
  assignedSupportAgentId?: string;
  messages: TicketMessage[];
  resolutionNotes?: string;
}

export interface DeliveryZone {
  id: string;
  countryCode: string;
  city: string;
  zoneName: string;
  deliveryFeeUSD: number;
  estimatedDeliveryMinutes: number;
  status: 'active' | 'congested' | 'inactive';
}

export interface MarketingBanner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  promoCode?: string;
  discountPercent?: number;
  active: boolean;
  bgColor: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId?: string;
  actorType: 'admin' | 'super_admin' | 'support' | 'pharmacy' | 'driver' | 'customer' | 'system';
  actorName: string;
  actorRole: UserRole;
  action: string;
  target: string;
  targetId?: string;
  details: string;
  ipAddress?: string;
  result: 'success' | 'failed' | 'denied';
  reason?: string;
  isEncryptedVerification?: boolean;
  sha256Hash?: string;
}

export interface UserAddress {
  id: string;
  label: string;
  streetAddress: string;
  city: string;
  countryCode: string;
  isDefault: boolean;
  gpsLocation?: { lat: number; lng: number };
}

export interface AuthUser {
  id: string;
  username?: string;
  name: string;
  phone?: string;
  email?: string;
  passwordHash?: string;
  salt?: string;
  role: UserRole;
  permissions: Permission[];
  status: AccountStatus;
  isVerified: boolean;
  preferredLanguage: Language;
  countryCode: string;
  city: string;
  streetAddress?: string;
  addresses?: UserAddress[];
  pharmacyId?: string;
  pharmacyApprovalStatus?: PharmacyApprovalStatus;
  licenseNumber?: string;
  rejectionReason?: string;
  requires2FA?: boolean;
  is2FAVerified?: boolean;
  twoFactorTicket?: string;
  twoFactorCode?: string;
  twoFactorExpiresAt?: number;
  token?: string;
  tokenExpiresAt?: number;
  mustChangePassword?: boolean;
  lastLoginAt?: string;
  updatedAt?: string;
  avatarUrl?: string;
}

export interface UserProfile {
  id: string;
  username?: string;
  name: string;
  email?: string;
  phone: string;
  role?: UserRole;
  permissions?: Permission[];
  mustChangePassword?: boolean;
  countryCode: string;
  city: string;
  streetAddress: string;
  isRegistered: boolean;
  gpsLocation?: {
    lat: number;
    lng: number;
    areaName: string;
  };
  preferredLanguage: Language;
}

export type SubscriptionPlanStatus = 'active' | 'trial' | 'payment_failed' | 'cancelled' | 'expired';

export interface SubscriptionBillingRecord {
  id: string;
  date: string;
  amountUSD: number;
  currency: string;
  paymentMethod: string;
  status: 'paid' | 'failed' | 'refunded';
  receiptNumber: string;
}

export interface DawaMonthlySubscription {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  planName: string; // 'DAWA MED MONTHLY'
  priceUSD: number; // 5.00
  status: SubscriptionPlanStatus;
  startDate: string;
  renewalDate: string;
  paymentMethod: {
    type: 'card' | 'mobile_money' | 'apple_pay' | 'google_pay';
    title: string; // e.g. "Visa •••• 4242" or "M-Pesa +254 712 345678"
    tokenizedId: string;
    gateway: string;
  };
  autoRenew: boolean;
  trialDaysLeft?: number;
  billingHistory: SubscriptionBillingRecord[];
}

export interface ReminderHistoryItem {
  id: string;
  timestamp: string;
  scheduledTime: string;
  action: 'taken' | 'snoozed' | 'skipped';
  snoozeMinutes?: number;
  skipReason?: string;
}

export type ReminderFrequency = 
  | 'daily' 
  | 'twice_daily' 
  | 'three_times_daily' 
  | 'specific_days' 
  | 'weekly' 
  | 'monthly'
  | 'custom';

export interface MedicineReminder {
  id: string;
  medicineName: string;
  genericName?: string;
  dosageInstructions: string;
  frequency: ReminderFrequency;
  frequencyLabel: string;
  startDate: string;
  endDate?: string;
  isOngoing: boolean;
  reminderTimes: string[]; // e.g. ["08:00 AM", "08:00 PM"]
  totalQuantity: number;
  remainingQuantity: number;
  refillDate?: string;
  refillReminderDaysBefore: number; // e.g. 5 days before expected refill
  familyMember: string; // "Myself" | "Mother" | "Father" | "Child" | "Spouse" | etc.
  notes?: string;
  associatedPharmacyId?: string;
  privacyHideName: boolean; // if true, show "Scheduled Medicine" when locked / notification
  history: ReminderHistoryItem[];
  createdAt: string;
}

export type NotificationCategory = 
  | 'order' 
  | 'delivery' 
  | 'medicine_reminder' 
  | 'refill_reminder' 
  | 'subscription' 
  | 'promotional' 
  | 'system'
  | 'rx'
  | 'cold_chain';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: NotificationCategory;
  orderId?: string;
  reminderId?: string;
  doseTime?: string;
  medicineName?: string;
  isRefillAlert?: boolean;
}

export interface NotificationPreferences {
  medicineReminders: boolean;
  refillReminders: boolean;
  orderUpdates: boolean;
  deliveryTracking: boolean;
  subscriptionBilling: boolean;
  promotionalDeals: boolean;
  pushNotifications: boolean;
  smsWhatsAppAlerts: boolean;
  privacyShieldMode: boolean; // Hide medicine names in push alerts
}

export interface ReferralSystemConfig {
  isEnabledByAdmin: boolean;
  rewardType: 'free_month' | 'discount_percent';
  discountPercentage: number;
  freeMonthsPerInvite: number;
  adminNotes: string;
}

export interface UserReferralStats {
  referralCode: string;
  inviteLink: string;
  totalInvited: number;
  activeSubscribers: number;
  freeMonthsEarned: number;
}

export interface OrderStatusHistoryItem {
  id: string;
  status: OrderStatus;
  timestamp: string;
  updatedByRole: UserRole;
  updatedByName: string;
  note?: string;
}

export interface PrescriptionAuditEntry {
  id: string;
  prescriptionId: string;
  action: 'uploaded' | 'opened_for_review' | 'approved' | 'rejected' | 'clarification_requested' | 'dispensed';
  actorName: string;
  actorRole: UserRole;
  pharmacistLicenseNumber?: string;
  timestamp: string;
  notes?: string;
}

export interface PlatformSettings {
  subscriptionPriceUSD: number;
  baseDeliveryFeeUSD: number;
  freeDeliveryThresholdUSD: number;
  coldChainMinTempCelsius: number;
  coldChainMaxTempCelsius: number;
  allowSandboxOtpInDev: boolean;
  smsGatewayProvider: 'africas_talking' | 'twilio' | 'infobip' | 'local_aggregator';
  paymentGatewayProvider: 'mpesa_direct' | 'mtn_momo_direct' | 'paystack' | 'flutterwave' | 'stripe';
  supportedCountries: string[]; // ['KE', 'TZ', 'UG', 'RW', 'NG', 'EG', 'CD', 'CI', 'SN']
  maintenanceMode: boolean;
  autoRefillDaysBefore: number;
}

export interface DataPrivacyRequest {
  id: string;
  userId: string;
  requestType: 'export_health_data' | 'delete_account_and_records';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: string;
  completedAt?: string;
  downloadUrl?: string;
  reason?: string;
}

export interface TelemetryLog {
  id: string;
  orderId: string;
  driverId: string;
  timestamp: string;
  temperatureCelsius: number;
  isCompliant: boolean; // 2°C - 8°C
  lat: number;
  lng: number;
  speedKmH: number;
  batteryPercent: number;
  isSimulated: boolean;
}

export interface LegalPolicyDoc {
  id: 'terms' | 'privacy' | 'medical_disclaimer' | 'refund_policy' | 'cold_chain_policy' | 'pharmacy_agreement' | 'driver_agreement';
  titleEn: string;
  titleAr: string;
  titleFr: string;
  lastUpdated: string;
  contentEn: string[];
  contentAr: string[];
  contentFr: string[];
}

// ============================================================================
// EMAIL SYSTEM TYPES & INTERFACES (PRODUCTION SMTP & RESEND)
// ============================================================================

export type EmailProviderType = 'resend' | 'smtp' | 'custom_smtp';
export type EmailEncryptionType = 'TLS' | 'SSL' | 'STARTTLS' | 'None';
export type EmailStatus = 'queued' | 'sending' | 'sent' | 'failed' | 'bounced';

export interface EmailSettings {
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
  activeProvider: EmailProviderType;
  fallbackEnabled: boolean;
  fallbackProvider?: EmailProviderType;
  resendApiKey?: string;
  resendDomain?: string;
  resendDomainStatus?: 'verified' | 'pending' | 'unverified';
  smtpHost?: string;
  smtpPort?: number;
  smtpEncryption?: EmailEncryptionType;
  smtpUsername?: string;
  smtpPassword?: string;
  hasResendKeySet?: boolean;
  hasSmtpPasswordSet?: boolean;
  lastConnectionTestAt?: string;
  lastConnectionStatus?: 'success' | 'failed' | 'untested';
  lastConnectionMessage?: string;
  lastTestEmailSentAt?: string;
  emailsSentToday?: number;
  emailsFailedToday?: number;
  emailsBouncedToday?: number;
  emailsQueued?: number;
  updatedAt?: string;
}

export type EmailTemplateCategory = 
  | 'auth' 
  | 'orders' 
  | 'payments' 
  | 'prescriptions' 
  | 'pharmacy' 
  | 'medicines' 
  | 'fleet' 
  | 'support' 
  | 'subscriptions' 
  | 'security';

export interface EmailTemplate {
  id: string;
  category: EmailTemplateCategory;
  name: string;
  description: string;
  subjectEn: string;
  subjectAr: string;
  subjectFr: string;
  bodyHtmlEn: string;
  bodyHtmlAr: string;
  bodyHtmlFr: string;
  variables: string[];
  isActive: boolean;
  updatedAt: string;
}

export interface EmailLog {
  id: string;
  recipient: string;
  recipientName?: string;
  templateId: string;
  templateName: string;
  subject: string;
  provider: EmailProviderType;
  status: EmailStatus;
  sentAt: string;
  failureReason?: string;
  relatedEntityId?: string;
  relatedEntityType?: 'order' | 'user' | 'pharmacy' | 'prescription' | 'ticket' | 'payment' | 'test';
  retryCount: number;
  maxRetries: number;
  language: Language;
}

// ============================================================================
// SITE SETTINGS & BRAND IDENTITY INTERFACES
// ============================================================================

export interface SiteSettings {
  siteName: string;
  siteNameAr: string;
  siteNameFr: string;
  tagline: string;
  taglineAr: string;
  taglineFr: string;
  logoUrl?: string; // Custom uploaded logo (data URI / URL)
  logoFileName?: string;
  logoFileType?: string;
  logoFileSizeKb?: number;
  logoUpdatedAt?: string;
  supportEmail: string;
  supportPhone: string;
  primaryBrandColor: string;
  enablePatientRegistration: boolean;
  enablePharmacyRegistration: boolean;
  requireMfaForAdmins: boolean;
  maintenanceMode: boolean;
  announcementNoticeEn?: string;
  announcementNoticeAr?: string;
  announcementNoticeFr?: string;
  showAnnouncementNotice: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

// ============================================================================
// MONETIZATION & REVENUE ARCHITECTURE INTERFACES
// ============================================================================

export type RevenueSource = 
  | 'pharmacy_commission'
  | 'delivery_fees'
  | 'dawa_monthly'
  | 'pharmacy_subscription'
  | 'express_delivery'
  | 'family_plan'
  | 'pharmacy_analytics'
  | 'business_corporate'
  | 'logistics_b2b'
  | 'saas_whitelabel'
  | 'advertising';

export interface PharmacySubscriptionPlan {
  id: string; // 'basic' | 'pro' | 'enterprise' | custom
  name: string;
  nameAr: string;
  nameFr?: string;
  priceUSD: number;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  featuresAr: string[];
  featuresFr?: string[];
  isActive: boolean;
  isPopular?: boolean;
  maxMonthlyOrders?: number; // 0 or undefined for unlimited
  customCommissionRate?: number; // Optional discounted commission rate
}

export interface CouponCode {
  id: string;
  code: string;
  description: string;
  descriptionAr: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number; // e.g. 15 for 15% or 5 for $5
  minOrderUSD: number;
  maxDiscountUSD?: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
}

export interface PaymentGatewayConfig {
  id: string;
  name: string;
  nameAr: string;
  providerCode: 'mpesa_direct' | 'mtn_momo' | 'airtel_money' | 'paystack' | 'flutterwave' | 'stripe' | 'cash_on_delivery';
  supportedCountries: string[]; // ['KE', 'UG', 'TZ', 'RW', 'NG', 'EG']
  type: 'mobile_money' | 'card' | 'bank_transfer' | 'cash';
  feePercentage: number;
  fixedFeeUSD: number;
  isActive: boolean;
  testMode: boolean;
}

export interface MonetizationSettings {
  // 1. Pharmacy Commission %
  defaultPharmacyCommissionRate: number; // e.g. 10 (10%)
  minCommissionRate: number;
  maxCommissionRate: number;
  pharmacyCustomCommissions: Record<string, number>; // pharmacyId -> custom % rate (e.g. { 'pharma-01': 8.5 })

  // 2. Delivery Fees Engine
  baseDeliveryFeeUSD: number; // e.g. 2.50
  perKmRateUSD: number; // e.g. 0.35
  expressDeliveryFeeUSD: number; // e.g. 3.00
  minDeliveryFeeUSD: number; // e.g. 1.50
  maxDeliveryFeeUSD: number; // e.g. 15.00
  freeDeliveryThresholdUSD: number; // e.g. 35.00
  driverPayoutPercentage: number; // e.g. 70% to driver, 30% to DAWA net margin
  cityDeliveryMultipliers: Record<string, number>; // e.g. { 'Nairobi': 1.0, 'Kampala': 0.95, 'Entebbe': 1.1, 'Rural': 1.3 }

  // 4. DAWA MED Monthly ($5/mo)
  dawaMonthlyPriceUSD: number; // 5.00
  dawaMonthlyTrialDays: number;
  dawaMonthlyIsActive: boolean;
  dawaMonthlyFeatures: string[];
  dawaMonthlyFeaturesAr: string[];

  // 5. Family Plan
  familyPlanPriceUSD: number; // 9.99
  familyPlanMaxMembers: number; // 6
  familyPlanEnabled: boolean;

  // 6. Pharmacy Subscriptions
  pharmacyPlans: PharmacySubscriptionPlan[];

  // 7. Additional Future Streams
  expressDeliveryEnabled: boolean;
  pharmacyAnalyticsEnabled: boolean;
  pharmacyAnalyticsPriceUSD: number; // 15.00
  businessCorporateEnabled: boolean;
  businessCorporatePriceUSD: number; // 49.00
  logisticsB2BEnabled: boolean;
  logisticsB2BRatePerStopUSD: number; // 1.80
  saasWhiteLabelEnabled: boolean;
  saasWhiteLabelPriceUSD: number; // 299.00
  advertisingEnabled: boolean;

  // Promotions & Taxes
  coupons: CouponCode[];
  taxVatRatePercentage: number; // e.g. 0%
  serviceFeeUSD: number; // e.g. 0.50
  paymentGateways: PaymentGatewayConfig[];

  updatedAt: string;
  updatedBy: string;
}

export interface FinancialSettlement {
  orderId: string;
  orderNumber: string;
  countryCode: string;
  city: string;
  pharmacyId: string;
  pharmacyName: string;
  customerId: string;
  customerName: string;
  driverId?: string;
  driverName?: string;
  paymentMethod: string;
  currency: string;
  itemsSubtotalUSD: number;
  deliveryFeeUSD: number;
  expressSurchargeUSD: number;
  discountUSD: number;
  serviceFeeUSD: number;
  taxAmountUSD: number;
  totalCustomerPaidUSD: number;
  
  // Commission & Profit Splits
  commissionRateApplied: number;
  pharmacyCommissionUSD: number;
  netPharmacyPayableUSD: number;
  driverPayoutUSD: number;
  dawaNetDeliveryMarginUSD: number;
  gatewayFeeUSD: number;
  dawaGrossRevenueUSD: number;
  dawaNetProfitUSD: number;
  
  settlementStatus: 'pending' | 'earned' | 'settled' | 'refunded' | 'cancelled';
  orderStatus: OrderStatus;
  createdAt: string;
  settledAt?: string;
}

export interface PharmacySubscriptionRecord {
  id: string;
  pharmacyId: string;
  pharmacyName: string;
  licenseNumber: string;
  city: string;
  countryCode: string;
  planId: string;
  planName: string;
  priceUSD: number;
  status: 'active' | 'trial' | 'payment_failed' | 'cancelled' | 'expired';
  startDate: string;
  renewalDate: string;
  paymentMethod: string;
  autoRenew: boolean;
  lastPaymentDate?: string;
  billingHistory: SubscriptionBillingRecord[];
}

export interface RevenueAnalyticsKPIs {
  totalGrossRevenueUSD: number;
  totalNetProfitUSD: number;
  totalPharmacyCommissionsUSD: number;
  totalDeliveryGrossUSD: number;
  totalDeliveryNetMarginUSD: number;
  totalPatientSubscriptionsUSD: number;
  totalPharmacySubscriptionsUSD: number;
  totalOtherRevenueUSD: number;
  
  // Recurring metrics
  mrrUSD: number;
  arrUSD: number;
  activePatientSubscribers: number;
  activePharmacySubscribers: number;
  
  // Operations & Order metrics
  totalCompletedOrders: number;
  averageOrderValueUSD: number;
  revenuePerCustomerUSD: number;
  revenuePerPharmacyUSD: number;
  subscriptionChurnRatePercent: number;
  paymentSuccessRatePercent: number;
  failedPaymentsCount: number;
}

export interface RevenueBySourceBreakdown {
  source: RevenueSource;
  labelEn: string;
  labelAr: string;
  amountUSD: number;
  percentage: number;
  transactionCount: number;
  isPhase1Core: boolean;
  isEnabled: boolean;
}

export interface RevenueAnalyticsResponse {
  timeframe: 'today' | 'this_week' | 'this_month' | 'this_year' | 'all_time' | 'custom';
  kpis: RevenueAnalyticsKPIs;
  bySource: RevenueBySourceBreakdown[];
  dailyTrend: {
    date: string;
    grossRevenue: number;
    commissions: number;
    delivery: number;
    subscriptions: number;
    netProfit: number;
  }[];
  recentSettlements: FinancialSettlement[];
  pharmacyEarningsSummary: {
    pharmacyId: string;
    pharmacyName: string;
    ordersCount: number;
    grossSalesUSD: number;
    commissionRate: number;
    commissionsDeductedUSD: number;
    netPayableUSD: number;
    subscriptionPlan: string;
  }[];
}

// ==========================================
// PHASE A: CORE CLINICAL & CUSTOMER TYPES
// ==========================================

export type FamilyRelationship = 'me' | 'child' | 'parent' | 'dependent' | 'spouse';

export interface FamilyProfile {
  id: string;
  userId: string;
  name: string;
  relationship: FamilyRelationship;
  dob: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  allergies: string[];
  chronicConditions: string[];
  activeMedications: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChronicRefillRecord {
  id: string;
  userId: string;
  profileId: string;
  profileName: string;
  medicineId: string;
  medicineName: string;
  genericName: string;
  dosage: string;
  quantity: number;
  unitPriceUSD: number;
  frequencyDays: number;
  lastRefillDate: string;
  nextRefillDate: string;
  remainingDays: number;
  remainingDoses: number;
  prescriptionId?: string;
  prescriptionExpiry?: string;
  prescriptionValid: boolean;
  autoRefillEnabled: boolean;
  status: 'active' | 'paused' | 'needs_prescription' | 'completed';
}

export interface DrugInteractionWarning {
  severity: 'low' | 'moderate' | 'high';
  drugsInvolved: string[];
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  clinicalAdviceEn: string;
  clinicalAdviceAr: string;
  isDuplicateActiveIngredient: boolean;
  duplicateIngredientName?: string;
  pharmacistReviewRequired: boolean;
}

export interface GenericAlternative {
  id: string;
  originalMedicineId: string;
  name: string;
  genericName: string;
  activeIngredient: string;
  strength: string;
  dosageForm: string;
  manufacturer: string;
  priceUSD: number;
  savingsUSD: number;
  savingsPercentage: number;
  isBioequivalentApproved: boolean;
  inStock: boolean;
  pharmacyId: string;
  pharmacyName: string;
  requiresPharmacistReview: boolean;
}

export interface SymptomGuidanceItem {
  id: string;
  symptomEn: string;
  symptomAr: string;
  category: string;
  isEmergencyRedFlag: boolean;
  redFlagWarningEn?: string;
  redFlagWarningAr?: string;
  recommendedOtcs: {
    genericName: string;
    brandExamples: string[];
    purposeEn: string;
    purposeAr: string;
    maxDurationDays: number;
  }[];
  lifestyleAdviceEn: string[];
  lifestyleAdviceAr: string[];
  whenToSeeDoctorEn: string;
  whenToSeeDoctorAr: string;
}

export interface PrescriptionAiOcrExtraction {
  id: string;
  prescriptionId?: string;
  extractedAt: string;
  doctorName?: string;
  clinicName?: string;
  datePrescribed?: string;
  medicines: {
    name: string;
    genericName?: string;
    dosage: string;
    form?: string;
    frequency: string;
    duration: string;
    instructions?: string;
    isControlledDrug?: boolean;
  }[];
  confidenceScore: number;
  status: 'awaiting_pharmacist_verification' | 'verified_by_pharmacist' | 'rejected_by_pharmacist';
  pharmacistReviewNotes?: string;
  disclaimer: string;
}




