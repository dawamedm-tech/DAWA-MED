import { UserRole, Permission, AuthUser, PharmacyPartner, Medicine, Language } from '../types';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'users.view',
    'users.create',
    'users.edit',
    'users.delete',
    'users.change_password',
    'pharmacies.view',
    'pharmacies.register',
    'pharmacies.approve',
    'pharmacies.reject',
    'pharmacies.suspend',
    'pharmacies.delete',
    'medicines.view',
    'medicines.create',
    'medicines.edit',
    'medicines.approve',
    'medicines.reject',
    'medicines.suspend',
    'medicines.delete',
    'inventory.view',
    'inventory.manage',
    'orders.view',
    'orders.create',
    'orders.manage',
    'orders.dispense',
    'orders.cancel',
    'prescriptions.upload',
    'prescriptions.review',
    'prescriptions.view_audit',
    'payments.view',
    'payments.initiate',
    'payments.refund',
    'payments.manage',
    'support.view',
    'support.manage',
    'support.reply',
    'settings.view',
    'settings.manage',
    'settings.email_manage',
    'settings.site_manage',
    'audit.view',
    'administrators.view',
    'administrators.create',
    'administrators.edit',
    'administrators.delete',
    'administrators.change_role',
    'administrators.manage_permissions',
    'administrators.change_password',
    'administrators.reset_sessions',
  ],
  admin: [
    'users.view',
    'users.create',
    'users.edit',
    'users.change_password',
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
    'orders.cancel',
    'prescriptions.view_audit',
    'payments.view',
    'payments.refund',
    'support.view',
    'support.manage',
    'support.reply',
    'settings.view',
    'settings.manage',
    'settings.site_manage',
    'settings.email_manage',
    'audit.view',
    'administrators.view',
    'administrators.create',
    'administrators.edit',
    'administrators.change_password',
    'administrators.reset_sessions',
  ],
  medical_admin: [
    'medicines.view',
    'medicines.create',
    'medicines.edit',
    'medicines.approve',
    'medicines.reject',
    'medicines.suspend',
    'prescriptions.upload',
    'prescriptions.review',
    'prescriptions.view_audit',
    'pharmacies.view',
    'audit.view',
  ],
  operations_admin: [
    'orders.view',
    'orders.create',
    'orders.manage',
    'orders.dispense',
    'orders.cancel',
    'pharmacies.view',
    'pharmacies.register',
    'inventory.view',
    'inventory.manage',
    'support.view',
    'support.reply',
  ],
  support_admin: [
    'support.view',
    'support.manage',
    'support.reply',
    'users.view',
    'orders.view',
    'pharmacies.view',
    'medicines.view',
  ],
  system_admin: [
    'users.view',
    'users.create',
    'users.edit',
    'users.change_password',
    'pharmacies.view',
    'pharmacies.approve',
    'medicines.view',
    'medicines.approve',
    'settings.view',
    'settings.manage',
    'settings.site_manage',
    'settings.email_manage',
    'audit.view',
    'administrators.view',
    'administrators.create',
    'administrators.edit',
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

export interface PermissionModule {
  id: string;
  nameEn: string;
  nameAr: string;
  nameFr: string;
  descriptionEn: string;
  descriptionAr: string;
  descriptionFr: string;
  permissions: {
    id: Permission;
    action: 'view' | 'create' | 'edit' | 'approve' | 'reject' | 'delete' | 'manage' | 'other';
    labelEn: string;
    labelAr: string;
    labelFr: string;
  }[];
}

export const PERMISSION_MODULES: PermissionModule[] = [
  {
    id: 'users',
    nameEn: 'Users Management',
    nameAr: 'إدارة المستخدمين',
    nameFr: 'Gestion des Utilisateurs',
    descriptionEn: 'Manage platform customers, patients, and accounts',
    descriptionAr: 'إدارة حسابات المرضى والعملاء في المنصة',
    descriptionFr: 'Gérer les clients, patients et comptes',
    permissions: [
      { id: 'users.view', action: 'view', labelEn: 'View Users', labelAr: 'عرض المستخدمين', labelFr: 'Voir les Utilisateurs' },
      { id: 'users.create', action: 'create', labelEn: 'Create User', labelAr: 'إنشاء مستخدم', labelFr: 'Créer Utilisateur' },
      { id: 'users.edit', action: 'edit', labelEn: 'Edit Profile & Status', labelAr: 'تعديل الملف والحالة', labelFr: 'Modifier Profil' },
      { id: 'users.change_password', action: 'manage', labelEn: 'Change User Password', labelAr: 'تغيير كلمة مرور المستخدم', labelFr: 'Changer Mot de Passe' },
      { id: 'users.delete', action: 'delete', labelEn: 'Delete Account', labelAr: 'حذف الحساب', labelFr: 'Supprimer Compte' },
    ]
  },
  {
    id: 'pharmacies',
    nameEn: 'Pharmacies Network',
    nameAr: 'شبكة الصيدليات',
    nameFr: 'Réseau de Pharmacies',
    descriptionEn: 'Licensure verification, approval and suspension of pharmacy branches',
    descriptionAr: 'فحص تراخيص واعتماد وتعليق فروع الصيدليات',
    descriptionFr: 'Vérification des licences, approbation et suspension des pharmacies',
    permissions: [
      { id: 'pharmacies.view', action: 'view', labelEn: 'View Pharmacies', labelAr: 'عرض الصيدليات', labelFr: 'Voir les Pharmacies' },
      { id: 'pharmacies.register', action: 'create', labelEn: 'Register Pharmacy', labelAr: 'تسجيل صيدلية', labelFr: 'Inscrire Pharmacie' },
      { id: 'pharmacies.approve', action: 'approve', labelEn: 'Approve License', labelAr: 'اعتماد الترخيص', labelFr: 'Approuver Licence' },
      { id: 'pharmacies.reject', action: 'reject', labelEn: 'Reject Application', labelAr: 'رفض طلب الانضمام', labelFr: 'Rejeter Demande' },
      { id: 'pharmacies.suspend', action: 'manage', labelEn: 'Suspend Branch', labelAr: 'تعليق الفرع', labelFr: 'Suspendre Pharmacie' },
      { id: 'pharmacies.delete', action: 'delete', labelEn: 'Delete Pharmacy', labelAr: 'حذف الصيدلية', labelFr: 'Supprimer Pharmacie' },
    ]
  },
  {
    id: 'medicines',
    nameEn: 'Medicines & Safety',
    nameAr: 'الأدوية والسلامة الدوائية',
    nameFr: 'Médicaments & Sécurité',
    descriptionEn: 'Drug catalog review, pharmaceutical approval, dosage rules and suspension',
    descriptionAr: 'مراجعة وتدقيق واعتماد ونشر الأدوية في الكتالوج',
    descriptionFr: 'Révision du catalogue, approbation et suspension des médicaments',
    permissions: [
      { id: 'medicines.view', action: 'view', labelEn: 'View Catalog', labelAr: 'عرض كتالوج الأدوية', labelFr: 'Voir Catalogue' },
      { id: 'medicines.create', action: 'create', labelEn: 'Submit Medicine', labelAr: 'إضافة دواء جديد', labelFr: 'Ajouter Médicament' },
      { id: 'medicines.edit', action: 'edit', labelEn: 'Edit Medicine Info', labelAr: 'تعديل بيانات الدواء', labelFr: 'Modifier Médicament' },
      { id: 'medicines.approve', action: 'approve', labelEn: 'Approve for Sale', labelAr: 'اعتماد الدواء للبيع', labelFr: 'Approuver Vente' },
      { id: 'medicines.reject', action: 'reject', labelEn: 'Reject Drug Entry', labelAr: 'رفض إدراج الدواء', labelFr: 'Rejeter Médicament' },
      { id: 'medicines.suspend', action: 'manage', labelEn: 'Safety Suspension', labelAr: 'تعليق أمني للدواء', labelFr: 'Suspendre Médicament' },
      { id: 'medicines.delete', action: 'delete', labelEn: 'Delete Medicine', labelAr: 'حذف الدواء', labelFr: 'Supprimer Médicament' },
    ]
  },
  {
    id: 'orders',
    nameEn: 'Orders & Dispatch',
    nameAr: 'الطلبات والشحن والتوصيل',
    nameFr: 'Commandes & Livraison',
    descriptionEn: 'Order tracking, driver assignment, cold-chain handover and cancellation',
    descriptionAr: 'متابعة الطلبات وتعيين السائقين ومراقبة سلسلة التبريد',
    descriptionFr: 'Suivi des commandes, attribution des livreurs et chaîne du froid',
    permissions: [
      { id: 'orders.view', action: 'view', labelEn: 'View Live Orders', labelAr: 'عرض الطلبات الحية', labelFr: 'Voir Commandes' },
      { id: 'orders.create', action: 'create', labelEn: 'Place Manual Order', labelAr: 'إنشاء طلب يدوي', labelFr: 'Créer Commande' },
      { id: 'orders.manage', action: 'manage', labelEn: 'Manage Dispatch / Driver', labelAr: 'إدارة السائق والإرسال', labelFr: 'Gérer Expédition' },
      { id: 'orders.dispense', action: 'approve', labelEn: 'Authorize Dispense', labelAr: 'الإذن بالصرف الدوائي', labelFr: 'Autoriser Délivrance' },
      { id: 'orders.cancel', action: 'reject', labelEn: 'Cancel Order', labelAr: 'إلغاء الطلب', labelFr: 'Annuler Commande' },
    ]
  },
  {
    id: 'prescriptions',
    nameEn: 'Prescriptions & e-Rx',
    nameAr: 'الوصفات الطبية الرقمية',
    nameFr: 'Ordonnances Médicales',
    descriptionEn: 'Prescription auditing, clinical dosage checks and pharmacist reviews',
    descriptionAr: 'تدقيق الوصفات الطبية والتحقق من التداخلات والتوقيع الصيدلاني',
    descriptionFr: 'Vérification et validation des ordonnances médicales',
    permissions: [
      { id: 'prescriptions.upload', action: 'create', labelEn: 'Upload Prescription', labelAr: 'رفع وصفة طبية', labelFr: 'Téléverser Ordonnance' },
      { id: 'prescriptions.review', action: 'approve', labelEn: 'Clinical Line-by-Line Review', labelAr: 'مراجعة بنود الوصفة', labelFr: 'Révision Clinique' },
      { id: 'prescriptions.view_audit', action: 'view', labelEn: 'View Rx Audit History', labelAr: 'عرض سجل تدقيق الوصفات', labelFr: 'Audit des Ordonnances' },
    ]
  },
  {
    id: 'payments',
    nameEn: 'Payments & Refunds',
    nameAr: 'المدفوعات والمستردات',
    nameFr: 'Paiements & Remboursements',
    descriptionEn: 'Financial settlement, Mobile Money integration and refund processing',
    descriptionAr: 'معالجة المدفوعات وبوابات الدفع والمستردات المالية',
    descriptionFr: 'Règlements financiers, Mobile Money et remboursements',
    permissions: [
      { id: 'payments.view', action: 'view', labelEn: 'View Transactions', labelAr: 'عرض المعاملات المالية', labelFr: 'Voir Transactions' },
      { id: 'payments.initiate', action: 'create', labelEn: 'Initiate Charge', labelAr: 'بدء عملية دفع', labelFr: 'Initier Paiement' },
      { id: 'payments.refund', action: 'manage', labelEn: 'Issue Refund', labelAr: 'إصدار استرداد مالي', labelFr: 'Effectuer Remboursement' },
      { id: 'payments.manage', action: 'manage', labelEn: 'Manage Gateways', labelAr: 'إدارة بوابات الدفع', labelFr: 'Gérer Passerelles' },
    ]
  },
  {
    id: 'support',
    nameEn: 'Support & Escalations',
    nameAr: 'الدعم الفني والشكاوى',
    nameFr: 'Support & Assistance',
    descriptionEn: 'Customer & pharmacy dispute resolution and officer dispatching',
    descriptionAr: 'معالجة تذاكر الدعم والشكاوى الطارئة وتعيين الضباط',
    descriptionFr: 'Résolution des litiges et gestion des tickets d’assistance',
    permissions: [
      { id: 'support.view', action: 'view', labelEn: 'View Support Tickets', labelAr: 'عرض تذاكر الدعم', labelFr: 'Voir Tickets' },
      { id: 'support.reply', action: 'create', labelEn: 'Reply to Ticket', labelAr: 'الرد على التذكرة', labelFr: 'Répondre au Ticket' },
      { id: 'support.manage', action: 'manage', labelEn: 'Assign & Close Ticket', labelAr: 'إسناد وإغلاق التذاكر', labelFr: 'Assigner & Clôturer' },
    ]
  },
  {
    id: 'site_settings',
    nameEn: 'Site Settings & Logo',
    nameAr: 'إعدادات الموقع والهوية',
    nameFr: 'Paramètres du Site & Logo',
    descriptionEn: 'Central site logo upload, brand colors, taglines, and public site settings',
    descriptionAr: 'رفع شعار الموقع، وتحديث الهوية البصرية، والنصوص التعريفية في كافة الصفحات',
    descriptionFr: 'Téléversement du logo du site, couleurs de marque et paramètres généraux',
    permissions: [
      { id: 'settings.view', action: 'view', labelEn: 'View Site Settings', labelAr: 'عرض إعدادات الموقع', labelFr: 'Voir Paramètres' },
      { id: 'settings.site_manage', action: 'manage', labelEn: 'Manage Logo & Branding', labelAr: 'إدارة الشعار والهوية', labelFr: 'Gérer Logo & Marque' },
    ]
  },
  {
    id: 'email_settings',
    nameEn: 'Email & SMTP Settings',
    nameAr: 'إعدادات البريد و SMTP',
    nameFr: 'Paramètres Email & SMTP',
    descriptionEn: 'Resend & SMTP server configuration, email templates and dispatch logs',
    descriptionAr: 'تهيئة خوادم SMTP و Resend وقوالب الإشعارات وسجلات الإرسال',
    descriptionFr: 'Configuration SMTP/Resend, modèles de courriels et journaux d’envoi',
    permissions: [
      { id: 'settings.email_manage', action: 'manage', labelEn: 'Manage Email & SMTP', labelAr: 'إدارة خوادم البريد الإلكتروني', labelFr: 'Gérer Email & SMTP' },
    ]
  },
  {
    id: 'audit_logs',
    nameEn: 'Security Audit Logs',
    nameAr: 'سجلات الرقابة والأمان',
    nameFr: 'Journaux d’Audit de Sécurité',
    descriptionEn: 'Inspect immutable SHA-256 cryptographic audit trails for compliance',
    descriptionAr: 'فحص سجلات العمليات الإدارية المشفرة والمحمية بنظام SHA-256',
    descriptionFr: 'Consulter les journaux d’audit cryptographiques SHA-256',
    permissions: [
      { id: 'audit.view', action: 'view', labelEn: 'View Security Audit Logs', labelAr: 'عرض سجلات التدقيق والأمان', labelFr: 'Voir Journaux d’Audit' },
    ]
  },
  {
    id: 'administrators',
    nameEn: 'Administrators Management',
    nameAr: 'إدارة الإداريين والصلاحيات',
    nameFr: 'Gestion des Administrateurs',
    descriptionEn: 'Create administrators, assign granular roles, reset sessions, and manage access',
    descriptionAr: 'إنشاء المسؤولين وتعيين الأدوار والصلاحيات وإنهاء الجلسات بأمان',
    descriptionFr: 'Créer administrateurs, assigner rôles, gérer permissions et sessions',
    permissions: [
      { id: 'administrators.view', action: 'view', labelEn: 'View Administrators', labelAr: 'عرض قائمة الإداريين', labelFr: 'Voir Administrateurs' },
      { id: 'administrators.create', action: 'create', labelEn: 'Add Administrator', labelAr: 'إضافة إداري جديد', labelFr: 'Ajouter Administrateur' },
      { id: 'administrators.edit', action: 'edit', labelEn: 'Edit Admin Profile', labelAr: 'تعديل بيانات الإداري', labelFr: 'Modifier Administrateur' },
      { id: 'administrators.change_role', action: 'manage', labelEn: 'Change Admin Role', labelAr: 'تغيير دور الإداري', labelFr: 'Changer Rôle Admin' },
      { id: 'administrators.manage_permissions', action: 'manage', labelEn: 'Customize Granular Permissions', labelAr: 'تخصيص الصلاحيات التفصيلية', labelFr: 'Personnaliser Permissions' },
      { id: 'administrators.change_password', action: 'manage', labelEn: 'Reset Admin Password', labelAr: 'تغيير كلمة مرور الإداري', labelFr: 'Réinitialiser Mot de Passe' },
      { id: 'administrators.reset_sessions', action: 'manage', labelEn: 'Revoke Admin Sessions', labelAr: 'إلغاء جلسات الدخول القديمة', labelFr: 'Révoquer Sessions' },
      { id: 'administrators.delete', action: 'delete', labelEn: 'Delete Administrator', labelAr: 'حذف حساب الإداري', labelFr: 'Supprimer Administrateur' },
    ]
  },
  {
    id: 'system_settings',
    nameEn: 'System Configuration',
    nameAr: 'إعدادات النظام العامة',
    nameFr: 'Configuration Système',
    descriptionEn: 'Global operational parameters, delivery thresholds, and cold-chain ranges',
    descriptionAr: 'تحديد أسعار التوصيل، وحدود سلسلة التبريد، ونطاقات العمليات الدولية',
    descriptionFr: 'Paramètres opérationnels généraux, seuils et chaîne du froid',
    permissions: [
      { id: 'settings.manage', action: 'manage', labelEn: 'Manage Global System Rules', labelAr: 'إدارة قواعد وسياسات النظام', labelFr: 'Gérer Règles Système' },
    ]
  }
];

export const isSuperAdmin = (user: AuthUser | null | undefined): boolean => {
  return !!user && user.role === 'super_admin' && user.status === 'active';
};

export const canManageAdmin = (actor: AuthUser | null | undefined, target: AuthUser | null | undefined): { allowed: boolean; reason?: string } => {
  if (!actor) return { allowed: false, reason: 'Authentication required' };
  if (!target) return { allowed: false, reason: 'Target administrator not found' };

  if (actor.status !== 'active') return { allowed: false, reason: 'Your account is not active' };

  // Actor is Super Admin
  if (actor.role === 'super_admin') {
    return { allowed: true };
  }

  // Target is Super Admin, but actor is NOT Super Admin -> FORBIDDEN
  if (target.role === 'super_admin') {
    return { 
      allowed: false, 
      reason: 'Only a Super Administrator is authorized to modify, reset, or delete a Super Administrator account.' 
    };
  }

  // Actor has administrator management permission
  if (hasPermission(actor, 'administrators.edit') || hasPermission(actor, 'administrators.create') || hasPermission(actor, 'users.edit')) {
    return { allowed: true };
  }

  return { allowed: false, reason: 'Insufficient administrator management permissions.' };
};

export const canCreateRole = (actor: AuthUser | null | undefined, targetRole: UserRole): { allowed: boolean; reason?: string } => {
  if (!actor) return { allowed: false, reason: 'Authentication required' };
  
  if (targetRole === 'super_admin' && actor.role !== 'super_admin') {
    return {
      allowed: false,
      reason: 'Only an existing Super Administrator can provision a new Super Administrator account.'
    };
  }

  if (actor.role === 'super_admin' || hasPermission(actor, 'administrators.create') || hasPermission(actor, 'users.edit')) {
    return { allowed: true };
  }

  return { allowed: false, reason: 'Insufficient permissions to create administrator.' };
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

export const ADMIN_ROLES: { role: UserRole; titleEn: string; titleAr: string; titleFr: string; descriptionEn: string; descriptionAr: string; descriptionFr: string; badgeColor: string }[] = [
  {
    role: 'super_admin',
    titleEn: 'Super Administrator',
    titleAr: 'المسؤول الأعلى (Super Admin)',
    titleFr: 'Super Administrateur',
    descriptionEn: 'Full unconstrained system authority across all modules, administrators, settings and audit trails.',
    descriptionAr: 'صلاحيات كاملة وغير مقيدة على كافة الوحدات والإداريين والإعدادات وسجلات التدقيق.',
    descriptionFr: 'Autorité système complète et sans restriction sur tous les modules et administrateurs.',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  {
    role: 'admin',
    titleEn: 'General Administrator',
    titleAr: 'مسؤول النظام (Admin)',
    titleFr: 'Administrateur Général',
    descriptionEn: 'Daily administrative operations, user management, pharmacy licensure, and medicine catalog.',
    descriptionAr: 'إدارة العمليات اليومية واعتماد الصيدليات والأدوية والمستخدمين والإعدادات العامة.',
    descriptionFr: 'Gestion quotidienne des opérations, licences de pharmacies et catalogue de médicaments.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    role: 'medical_admin',
    titleEn: 'Medical Reviewer & Safety Admin',
    titleAr: 'المسؤول الطبي والرقابي (Medical Admin)',
    titleFr: 'Administrateur Médical & Sécurité',
    descriptionEn: 'Clinical review of medicines, pharmaceutical approval, dosage rules, and prescription verification.',
    descriptionAr: 'مراجعة وتدقيق واعتماد الأدوية والوصفات الطبية الرقمية فقط ضمن النطاق الطبي.',
    descriptionFr: 'Révision clinique des médicaments, validation des ordonnances et sécurité pharmaceutique.',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  {
    role: 'operations_admin',
    titleEn: 'Operations & Dispatch Admin',
    titleAr: 'مسؤول العمليات واللوجستيات (Operations Admin)',
    titleFr: 'Administrateur Opérations & Flotte',
    descriptionEn: 'Order fulfillment, courier fleet monitoring, delivery zones, and pharmacy stock logistics.',
    descriptionAr: 'إدارة الطلبات والشحن وتتبع السائقين وفحص سلسلة التبريد وشبكة الصيدليات.',
    descriptionFr: 'Gestion des commandes, suivi de la flotte de livreurs et zones de livraison.',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  {
    role: 'support_admin',
    titleEn: 'Customer Support Lead',
    titleAr: 'مسؤول الدعم وخدمة العملاء (Support Admin)',
    titleFr: 'Responsable Support Client',
    descriptionEn: 'Support tickets, customer disputes, order investigation without medical approval authority.',
    descriptionAr: 'معالجة الشكاوى وتذاكر الدعم دون صلاحيات اعتماد الأدوية أو الصيدليات.',
    descriptionFr: 'Gestion des tickets de support et résolution des litiges clients.',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300'
  }
];

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
    id: 'usr-driver-1',
    name: 'Samuel Kiprop',
    phone: '+254 722 888 999',
    email: 'driver.samuel@dawamed.com',
    role: 'driver',
    permissions: ROLE_PERMISSIONS.driver,
    status: 'active',
    isVerified: true,
    preferredLanguage: 'sw',
    countryCode: 'KE',
    city: 'Nairobi',
    streetAddress: 'DAWA Logistics Hub, Westlands',
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
    role: 'support_admin',
    permissions: ROLE_PERMISSIONS.support_admin,
    status: 'active',
    isVerified: true,
    preferredLanguage: 'ar',
    countryCode: 'EG',
    city: 'Cairo',
    streetAddress: 'DAWA Regional Clinical Support Center, Nasr City',
    lastLoginAt: new Date().toISOString()
  },
  {
    id: 'usr-admin-mosa',
    username: 'mosa',
    name: 'Mosa (System Administrator)',
    phone: '+966 50 111 2222',
    email: 'mosa@dawamed.com',
    role: 'admin',
    permissions: ROLE_PERMISSIONS.admin,
    status: 'active',
    isVerified: true,
    preferredLanguage: 'ar',
    countryCode: 'SA',
    city: 'Riyadh',
    streetAddress: 'DAWA Central Administrative & Regulatory HQ',
    requires2FA: false,
    is2FAVerified: true,
    lastLoginAt: new Date().toISOString()
  },
  {
    id: 'usr-admin-medical-amina',
    username: 'amina.medical',
    name: 'Dr. Amina Touré (Chief Medical Officer)',
    phone: '+221 77 123 4567',
    email: 'medical.officer@dawamed.com',
    role: 'medical_admin',
    permissions: ROLE_PERMISSIONS.medical_admin,
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
    id: 'usr-admin-ops-david',
    username: 'david.ops',
    name: 'David Ochieng (Operations Lead)',
    phone: '+254 711 555 333',
    email: 'operations@dawamed.com',
    role: 'operations_admin',
    permissions: ROLE_PERMISSIONS.operations_admin,
    status: 'active',
    isVerified: true,
    preferredLanguage: 'en',
    countryCode: 'KE',
    city: 'Nairobi',
    streetAddress: 'DAWA Fleet & Dispatch Operations',
    requires2FA: true,
    is2FAVerified: true,
    lastLoginAt: new Date().toISOString()
  },
  {
    id: 'usr-superadmin-1',
    username: 'superadmin',
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

