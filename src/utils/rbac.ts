import { UserRole, Permission, AuthUser, PharmacyPartner, Medicine } from '../types';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'users.view',
    'users.edit',
    'users.delete',
    'pharmacies.view',
    'pharmacies.register',
    'pharmacies.approve',
    'pharmacies.reject',
    'pharmacies.suspend',
    'medicines.view',
    'medicines.create',
    'medicines.edit',
    'medicines.approve',
    'medicines.reject',
    'medicines.suspend',
    'inventory.view',
    'inventory.manage',
    'orders.view',
    'orders.create',
    'orders.manage',
    'orders.dispense',
    'prescriptions.upload',
    'prescriptions.review',
    'prescriptions.view_audit',
    'payments.view',
    'payments.initiate',
    'payments.refund',
    'support.view',
    'support.manage',
    'support.reply',
    'settings.view',
    'settings.manage',
    'audit.view',
  ],
  admin: [
    'users.view',
    'users.edit',
    'pharmacies.view',
    'pharmacies.approve',
    'pharmacies.reject',
    'pharmacies.suspend',
    'medicines.view',
    'medicines.approve',
    'medicines.reject',
    'medicines.suspend',
    'inventory.view',
    'orders.view',
    'orders.manage',
    'prescriptions.view_audit',
    'payments.view',
    'payments.refund',
    'support.view',
    'support.manage',
    'support.reply',
    'settings.view',
    'settings.manage',
    'audit.view',
  ],
  system_admin: [
    'users.view',
    'users.edit',
    'pharmacies.view',
    'pharmacies.approve',
    'medicines.view',
    'medicines.approve',
    'audit.view',
    'settings.manage',
  ],
  support: [
    'users.view',
    'pharmacies.view',
    'medicines.view',
    'orders.view',
    'payments.view',
    'support.view',
    'support.manage',
    'support.reply',
  ],
  pharmacy: [
    'pharmacies.view',
    'medicines.view',
    'medicines.create',
    'medicines.edit',
    'inventory.view',
    'inventory.manage',
    'orders.view',
    'orders.manage',
    'orders.dispense',
    'prescriptions.review',
    'support.view',
    'support.reply',
  ],
  pharmacy_admin: [
    'pharmacies.view',
    'medicines.view',
    'medicines.create',
    'medicines.edit',
    'inventory.view',
    'inventory.manage',
    'orders.view',
    'orders.manage',
    'orders.dispense',
    'prescriptions.review',
    'support.view',
    'support.reply',
  ],
  customer: [
    'medicines.view',
    'orders.view',
    'orders.create',
    'prescriptions.upload',
    'payments.initiate',
    'support.view',
    'support.reply',
  ],
  driver: [
    'orders.view',
    'orders.manage',
    'support.view',
    'support.reply',
  ],
  subscription: [
    'medicines.view',
    'orders.view',
    'orders.create',
    'prescriptions.upload',
    'payments.initiate',
    'support.view',
    'support.reply',
  ],
  website: [
    'medicines.view',
  ]
};

export const hasPermission = (user: AuthUser | null | undefined, permission: Permission): boolean => {
  if (!user) return false;
  if (user.status === 'suspended' || user.status === 'blocked' || user.status === 'deleted') {
    return false;
  }
  if (user.role === 'super_admin') return true;
  if (user.permissions && user.permissions.includes(permission)) return true;
  const defaultPerms = ROLE_PERMISSIONS[user.role] || [];
  return defaultPerms.includes(permission);
};

export const canPharmacySell = (pharmacy: PharmacyPartner | null | undefined): boolean => {
  if (!pharmacy) return false;
  return pharmacy.approvalStatus === 'approved' && pharmacy.verificationStatus === 'verified';
};

export const canMedicineBeSold = (medicine: Medicine | null | undefined, pharmacy?: PharmacyPartner | null): boolean => {
  if (!medicine) return false;
  if (medicine.approvalStatus !== 'approved') return false;
  if (pharmacy && !canPharmacySell(pharmacy)) return false;
  return true;
};

export const DEFAULT_USERS: AuthUser[] = [
  {
    id: 'usr-customer-1',
    name: 'Grace Muthoni',
    phone: '+254 712 345 678',
    email: 'patient@dawamed.com',
    role: 'customer',
    permissions: ROLE_PERMISSIONS.customer,
    status: 'active',
    isVerified: true,
    preferredLanguage: 'en',
    countryCode: 'KE',
    city: 'Nairobi',
    streetAddress: 'House 14B, Ole Odume Road, Kilimani',
    addresses: [
      {
        id: 'addr-1',
        label: 'Home (Kilimani)',
        streetAddress: 'House 14B, Ole Odume Road',
        city: 'Nairobi',
        countryCode: 'KE',
        isDefault: true,
        gpsLocation: { lat: -1.2981, lng: 36.7825 }
      }
    ],
    lastLoginAt: new Date().toISOString()
  },
  {
    id: 'usr-pharmacy-approved',
    name: 'Dr. Sarah Nabatanzi',
    phone: '+256 700 112 233',
    email: 'kampala.central@pharmacy.dawamed.com',
    role: 'pharmacy',
    permissions: ROLE_PERMISSIONS.pharmacy,
    status: 'active',
    isVerified: true,
    preferredLanguage: 'en',
    countryCode: 'UG',
    city: 'Kampala',
    streetAddress: 'Plot 14, Jinja Road, Kampala Central',
    pharmacyId: 'pharma-01',
    pharmacyApprovalStatus: 'approved',
    lastLoginAt: new Date().toISOString()
  },
  {
    id: 'usr-pharmacy-pending',
    name: 'Dr. Emmanuel Okafor',
    phone: '+234 802 991 0044',
    email: 'new.care@pharmacy.dawamed.com',
    role: 'pharmacy',
    permissions: ROLE_PERMISSIONS.pharmacy,
    status: 'pending',
    isVerified: true,
    preferredLanguage: 'en',
    countryCode: 'NG',
    city: 'Lagos',
    streetAddress: '12 Admiralty Way, Lekki Phase 1',
    pharmacyId: 'pharma-pending-01',
    pharmacyApprovalStatus: 'pending',
    lastLoginAt: new Date().toISOString()
  },
  {
    id: 'usr-support-1',
    name: 'Tariq Al-Mansoor',
    phone: '+20 100 456 7890',
    email: 'support.agent@dawamed.com',
    role: 'support',
    permissions: ROLE_PERMISSIONS.support,
    status: 'active',
    isVerified: true,
    preferredLanguage: 'ar',
    countryCode: 'EG',
    city: 'Cairo',
    streetAddress: 'DAWA Regional Clinical Support Center, Nasr City',
    lastLoginAt: new Date().toISOString()
  },
  {
    id: 'usr-admin-1',
    name: 'Dr. Amina Touré (Chief Medical Officer)',
    phone: '+221 77 123 4567',
    email: 'admin@dawamed.com',
    role: 'admin',
    permissions: ROLE_PERMISSIONS.admin,
    status: 'active',
    isVerified: true,
    preferredLanguage: 'fr',
    countryCode: 'SN',
    city: 'Dakar',
    streetAddress: 'DAWA Pan-African Regulatory HQ, Dakar',
    requires2FA: true,
    is2FAVerified: true,
    lastLoginAt: new Date().toISOString()
  },
  {
    id: 'usr-superadmin-1',
    name: 'DAWA MED System Super Admin',
    phone: '+254 700 000 001',
    email: 'superadmin@dawamed.com',
    role: 'super_admin',
    permissions: ROLE_PERMISSIONS.super_admin,
    status: 'active',
    isVerified: true,
    preferredLanguage: 'en',
    countryCode: 'KE',
    city: 'Nairobi',
    streetAddress: 'DAWA Global Technology Operations',
    requires2FA: true,
    is2FAVerified: true,
    lastLoginAt: new Date().toISOString()
  }
];
