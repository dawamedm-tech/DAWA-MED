import { UserRole, OrderStatus, Language } from '../types';

export interface DbUser {
  id: string;
  phone: string;
  email?: string;
  fullName: string;
  role: UserRole;
  countryCode: string;
  city: string;
  streetAddress?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  preferredLanguage: Language;
  isVerified: boolean;
  failedLoginAttempts: number;
  lockedUntil?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface DbPharmacy {
  id: string;
  name: string;
  licenseNumber: string;
  regulatoryAuthority: string;
  licenseExpiryDate: string;
  pharmacistInCharge: string;
  pharmacistRegNumber: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  hasColdChainStorage: boolean;
  is24Hours: boolean;
  verificationStatus: 'verified' | 'pending_verification' | 'suspended' | 'rejected';
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface DbMedicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  dosage: string;
  dosageForm: string;
  packageSize: string;
  manufacturer: string;
  requiresPrescription: boolean;
  requiresColdChain: boolean;
  storageConditions: string;
  descriptionEn: string;
  descriptionAr: string;
  descriptionFr?: string;
  descriptionSw: string;
  basePriceUSD: number;
}

export interface DbPharmacyInventory {
  id: string;
  pharmacyId: string;
  medicineId: string;
  sku: string;
  batchNumber: string;
  expiryDate: string;
  stockQuantity: number;
  unitPriceUSD: number;
  isExpired: boolean;
  lowStockThreshold: number;
}

export interface DbPrescription {
  id: string;
  userId: string;
  patientName: string;
  patientPhone: string;
  patientAge?: number;
  doctorName?: string;
  clinicName?: string;
  doctorRegNumber?: string;
  fileUrl: string;
  fileType: string;
  fileHashSha256: string;
  isEncrypted: boolean;
  isChronicCondition: boolean;
  status: 'pending_review' | 'under_review' | 'approved' | 'rejected' | 'clarification_requested' | 'dispensed';
  assignedPharmacyId?: string;
  reviewedByPharmacist?: string;
  pharmacistLicenseNumber?: string;
  pharmacistNotes?: string;
  uploadedAt: string;
}

export interface DbOrder {
  id: string;
  orderNumber: string;
  userId: string;
  pharmacyId: string;
  prescriptionId?: string;
  driverId?: string;
  subtotalUSD: number;
  deliveryFeeUSD: number;
  serviceFeeUSD: number;
  discountAmountUSD: number;
  totalAmountUSD: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'authorized' | 'paid' | 'failed' | 'refunded';
  status: OrderStatus;
  deliveryAddress: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  deliveryOtp: string;
  qrCodeSignature: string;
  requiresColdChain: boolean;
  createdAt: string;
  deliveredAt?: string;
  cancelledAt?: string;
}
