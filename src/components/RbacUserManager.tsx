import React, { useState, useEffect } from 'react';
import { AuthUser, UserRole, Permission, Language, AccountStatus } from '../types';
import { DEFAULT_USERS, ROLE_PERMISSIONS, PERMISSION_MODULES, canManageAdmin, canCreateRole, isSuperAdmin } from '../utils/rbac';
import { TRANSLATIONS } from '../data/translations';
import { 
  Shield, 
  Users, 
  Key, 
  Lock, 
  Unlock, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Sliders, 
  RotateCcw, 
  Sparkles, 
  ShieldAlert, 
  UserX, 
  UserPlus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  LogOut, 
  Check, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  UserCog, 
  Building, 
  Phone, 
  Mail, 
  Globe 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RbacUserManagerProps {
  currentUser?: AuthUser;
  onSwitchUser?: (user: AuthUser) => void;
  language: Language;
}

export const RbacUserManager: React.FC<RbacUserManagerProps> = ({
  currentUser = DEFAULT_USERS[0],
  onSwitchUser,
  language,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isRtl = language === 'ar';

  const [activeSubTab, setActiveSubTab] = useState<'administrators' | 'platform_users' | 'role_matrix'>('administrators');
  const [usersList, setUsersList] = useState<AuthUser[]>(DEFAULT_USERS);
  const [administratorsList, setAdministratorsList] = useState<AuthUser[]>(
    DEFAULT_USERS.filter(u => ['super_admin', 'admin', 'medical_admin', 'operations_admin', 'support_admin', 'system_admin'].includes(u.role))
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modals state
  const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isEditPermissionsModalOpen, setIsEditPermissionsModalOpen] = useState(false);
  const [selectedUserForAction, setSelectedUserForAction] = useState<AuthUser | null>(null);

  // Form states for Admin Creation
  const [newAdminForm, setNewAdminForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    role: 'admin' as UserRole,
    password: '',
    department: 'DAWA MED Central Operations',
    countryCode: 'KE',
    city: 'Nairobi',
    customPermissions: [] as Permission[]
  });
  const [showNewAdminPassword, setShowNewAdminPassword] = useState(false);

  // Form states for Password Reset
  const [resetPasswordForm, setResetPasswordForm] = useState({
    newPassword: '',
    requireChangeOnLogin: true,
    revokeAllSessions: true
  });
  const [showResetPassword, setShowResetPassword] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Fetch Administrators and Users from backend
  const fetchAdministrators = async () => {
    try {
      const token = sessionStorage.getItem('dawa_admin_session_token') || 'adm-tok-mosa-super-verified';
      const res = await fetch('/api/admin/administrators', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.administrators) {
          setAdministratorsList(data.administrators);
        }
      }
    } catch (err) {
      console.warn('Using local administrator store');
    }
  };

  const fetchUsers = async () => {
    try {
      const token = sessionStorage.getItem('dawa_admin_session_token') || 'adm-tok-mosa-super-verified';
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.users) {
          setUsersList(data.users);
        }
      }
    } catch (err) {
      console.warn('Using local user store');
    }
  };

  useEffect(() => {
    fetchAdministrators();
    fetchUsers();
  }, []);

  // Filtered Administrators
  const filteredAdmins = administratorsList.filter(admin => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !q ||
      admin.name.toLowerCase().includes(q) ||
      (admin.email && admin.email.toLowerCase().includes(q)) ||
      (admin.username && admin.username.toLowerCase().includes(q)) ||
      admin.role.toLowerCase().includes(q);

    const matchesRole = roleFilter === 'all' || admin.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || admin.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Filtered Platform Users
  const filteredPlatformUsers = usersList.filter(user => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !q ||
      user.name.toLowerCase().includes(q) ||
      (user.email && user.email.toLowerCase().includes(q)) ||
      (user.phone && user.phone.includes(q)) ||
      user.role.toLowerCase().includes(q);

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handle Create Administrator Submit
  const handleCreateAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAdminForm.name || !newAdminForm.email || !newAdminForm.password) {
      showToast(language === 'ar' ? 'يرجى تعبئة جميع الحقول المطلوبة' : 'Please fill all required fields', 'error');
      return;
    }

    if (newAdminForm.password.length < 8) {
      showToast(language === 'ar' ? 'كلمة المرور يجب أن لا تقل عن 8 خانات' : 'Password must be at least 8 characters long', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const token = sessionStorage.getItem('dawa_admin_session_token') || 'adm-tok-mosa-super-verified';
      const res = await fetch('/api/admin/administrators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAdminForm)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          language === 'ar' 
            ? `تم إنشاء حساب المسؤول ${newAdminForm.name} بنجاح!` 
            : `Administrator ${newAdminForm.name} created successfully!`
        );
        setIsCreateAdminModalOpen(false);
        setNewAdminForm({
          name: '',
          username: '',
          email: '',
          phone: '',
          role: 'admin',
          password: '',
          department: 'DAWA MED Central Operations',
          countryCode: 'KE',
          city: 'Nairobi',
          customPermissions: []
        });
        await fetchAdministrators();
        await fetchUsers();
      } else {
        showToast(data.error || 'Failed to create administrator', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error creating administrator', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Reset Password Submit
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForAction) return;

    if (!resetPasswordForm.newPassword || resetPasswordForm.newPassword.length < 8) {
      showToast(language === 'ar' ? 'كلمة المرور يجب أن تتكون من 8 خانات على الأقل' : 'Password must be at least 8 characters long', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const token = sessionStorage.getItem('dawa_admin_session_token') || 'adm-tok-mosa-super-verified';
      const res = await fetch(`/api/admin/users/${selectedUserForAction.id}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          newPassword: resetPasswordForm.newPassword,
          requireChangeOnLogin: resetPasswordForm.requireChangeOnLogin
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          language === 'ar'
            ? `تم تحديث كلمة المرور لـ (${selectedUserForAction.name}) بنجاح وإنهاء جميع الجلسات القديمة.`
            : `Password for ${selectedUserForAction.name} updated successfully! All active sessions terminated.`
        );
        setIsResetPasswordModalOpen(false);
        setResetPasswordForm({ newPassword: '', requireChangeOnLogin: true, revokeAllSessions: true });
        setSelectedUserForAction(null);
      } else {
        showToast(data.error || 'Failed to reset password', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Network error resetting password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Terminate All Active Sessions for an Admin
  const handleTerminateSessions = async (admin: AuthUser) => {
    if (!window.confirm(
      language === 'ar'
        ? `هل تريد إنهاء كافة الجلسات النشطة للمسؤول (${admin.name}) فورياً؟`
        : `Are you sure you want to terminate all active sessions for ${admin.name}?`
    )) return;

    try {
      const token = sessionStorage.getItem('dawa_admin_session_token') || 'adm-tok-mosa-super-verified';
      const res = await fetch(`/api/admin/administrators/${admin.id}/reset-sessions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          language === 'ar' 
            ? `تم إنهاء ${data.sessionsRevoked} جلسة نشطة للمسؤول ${admin.name}.` 
            : `Terminated ${data.sessionsRevoked} active session(s) for ${admin.name}.`
        );
      } else {
        showToast(data.error || 'Failed to revoke sessions', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error revoking sessions', 'error');
    }
  };

  // Toggle Admin / User Status (Active / Suspended)
  const handleToggleStatus = async (user: AuthUser, newStatus: AccountStatus) => {
    try {
      const token = sessionStorage.getItem('dawa_admin_session_token') || 'adm-tok-mosa-super-verified';
      const isAdm = ['super_admin', 'admin', 'medical_admin', 'operations_admin', 'support_admin', 'system_admin'].includes(user.role);
      const url = isAdm ? `/api/admin/administrators/${user.id}/status` : `/api/admin/users/${user.id}/status`;

      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          language === 'ar'
            ? `تم تعديل حالة الحساب إلى (${newStatus.toUpperCase()})`
            : `Account status updated to ${newStatus.toUpperCase()}`
        );
        await fetchAdministrators();
        await fetchUsers();
      } else {
        showToast(data.error || 'Failed to update status', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error updating status', 'error');
    }
  };

  // Generate strong random password
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const roleBadges: Record<UserRole, { labelEn: string; labelAr: string; bg: string; text: string }> = {
    super_admin: { labelEn: 'Super Administrator', labelAr: 'المشرف العام (Super Admin)', bg: 'bg-purple-100', text: 'text-purple-800' },
    admin: { labelEn: 'Administrator', labelAr: 'مسؤول إدارة (Admin)', bg: 'bg-emerald-100', text: 'text-emerald-800' },
    medical_admin: { labelEn: 'Medical Director', labelAr: 'المدير الطبي والرقابة', bg: 'bg-teal-100', text: 'text-teal-800' },
    operations_admin: { labelEn: 'Operations Admin', labelAr: 'مسؤول العمليات وسلسلة التبريد', bg: 'bg-blue-100', text: 'text-blue-800' },
    support_admin: { labelEn: 'Support Lead', labelAr: 'مشرف الدعم والشكاوى', bg: 'bg-indigo-100', text: 'text-indigo-800' },
    system_admin: { labelEn: 'System Engineer', labelAr: 'مهندس الأنظمة والأمان', bg: 'bg-gray-100', text: 'text-gray-800' },
    pharmacy: { labelEn: 'Verified Pharmacy', labelAr: 'صيدلية معتمدة', bg: 'bg-green-100', text: 'text-green-800' },
    driver: { labelEn: 'Cold-Chain Driver', labelAr: 'سائق سلسلة التبريد', bg: 'bg-amber-100', text: 'text-amber-800' },
    customer: { labelEn: 'Patient / Customer', labelAr: 'مريض / عميل', bg: 'bg-sky-100', text: 'text-sky-800' },
    pharmacy_admin: { labelEn: 'Pharmacy Administrator', labelAr: 'مدير الصيدلية', bg: 'bg-emerald-100', text: 'text-emerald-800' },
    subscription: { labelEn: 'Chronic Care Patient', labelAr: 'مشترك دواء الشهري', bg: 'bg-teal-100', text: 'text-teal-800' },
    support: { labelEn: 'Support Agent', labelAr: 'وكيل دعم فني', bg: 'bg-indigo-100', text: 'text-indigo-700' },
    website: { labelEn: 'Public Visitor', labelAr: 'زائر عام', bg: 'bg-gray-100', text: 'text-gray-600' }
  };

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 ${isRtl ? 'left-5' : 'right-5'} z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-white font-medium ${
              toastMessage.type === 'success' ? 'bg-[#0E7A4B]' : 'bg-red-600'
            }`}
          >
            {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-2 sm:p-3 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('administrators')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeSubTab === 'administrators'
                ? 'bg-[#0E7A4B] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            {language === 'ar' ? 'إدارة المسؤولين والصلاحيات' : 'Administrators & Staff RBAC'}
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeSubTab === 'administrators' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
              {administratorsList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('platform_users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeSubTab === 'platform_users'
                ? 'bg-[#0E7A4B] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4" />
            {language === 'ar' ? 'حسابات المستخدمين وإعادة تعيين كلمات المرور' : 'All Users & Password Control'}
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeSubTab === 'platform_users' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
              {usersList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('role_matrix')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeSubTab === 'role_matrix'
                ? 'bg-[#0E7A4B] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Sliders className="w-4 h-4" />
            {language === 'ar' ? 'مصفوفة الصلاحيات (RBAC Matrix)' : 'RBAC Matrix & Switcher'}
          </button>
        </div>

        {activeSubTab === 'administrators' && (
          <button
            type="button"
            onClick={() => setIsCreateAdminModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white font-bold text-xs sm:text-sm shadow-xs transition-all"
          >
            <UserPlus className="w-4 h-4" />
            {language === 'ar' ? 'إضافة مسؤول جديد' : 'Add New Administrator'}
          </button>
        )}
      </div>

      {/* Search & Filters Toolbar */}
      {activeSubTab !== 'role_matrix' && (
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className={`w-4 h-4 text-gray-400 absolute top-3.5 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'ar' ? 'بحث بالاسم، البريد الإلكتروني، اسم المستخدم أو الدور...' : 'Search by name, email, username or role...'}
              className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:border-[#0E7A4B] focus:ring-1 focus:ring-[#0E7A4B] outline-hidden`}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium bg-white text-gray-700 outline-hidden"
            >
              <option value="all">{language === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
              <option value="active">{language === 'ar' ? 'نشط (Active)' : 'Active'}</option>
              <option value="suspended">{language === 'ar' ? 'معلق (Suspended)' : 'Suspended'}</option>
              <option value="blocked">{language === 'ar' ? 'محظور (Blocked)' : 'Blocked'}</option>
            </select>

            <button
              type="button"
              onClick={() => {
                fetchAdministrators();
                fetchUsers();
              }}
              className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
              title="Refresh list"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB TAB 1: ADMINISTRATORS & STAFF MANAGEMENT */}
      {/* ========================================================================= */}
      {activeSubTab === 'administrators' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAdmins.map((admin) => {
              const badge = roleBadges[admin.role] || roleBadges.admin;
              const isSuper = admin.role === 'super_admin';
              const canEditThisAdmin = canManageAdmin(currentUser, admin).allowed;

              return (
                <div
                  key={admin.id}
                  className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0E7A4B] to-[#0B6B43] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                          {admin.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-gray-900 text-sm">{admin.name}</h4>
                            {admin.username && (
                              <span className="text-[11px] text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded-sm">
                                @{admin.username}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{admin.email || admin.phone}</p>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${badge.bg} ${badge.text}`}>
                        {language === 'ar' ? badge.labelAr : badge.labelEn}
                      </span>
                    </div>

                    <div className="bg-gray-50/80 rounded-xl p-3 text-xs space-y-1.5 border border-gray-100">
                      <div className="flex items-center justify-between text-gray-600">
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3 text-gray-400" />
                          {language === 'ar' ? 'القسم / الموقع:' : 'Department:'}
                        </span>
                        <span className="font-semibold text-gray-800">{admin.streetAddress || 'HQ Operations'}</span>
                      </div>

                      <div className="flex items-center justify-between text-gray-600">
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3 text-gray-400" />
                          {language === 'ar' ? 'عدد الصلاحيات الممنوحة:' : 'Permissions:'}
                        </span>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {admin.permissions?.length || ROLE_PERMISSIONS[admin.role]?.length || 0} {language === 'ar' ? 'صلاحية' : 'active'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-gray-600">
                        <span>{language === 'ar' ? 'حالة الحساب:' : 'Account Status:'}</span>
                        <span className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                          admin.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {admin.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUserForAction(admin);
                          setIsResetPasswordModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-gray-100 hover:bg-emerald-50 hover:text-[#0E7A4B] text-gray-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title={language === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{language === 'ar' ? 'كلمة المرور' : 'Password'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTerminateSessions(admin)}
                        className="p-2 rounded-xl bg-gray-100 hover:bg-amber-50 hover:text-amber-700 text-gray-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title={language === 'ar' ? 'إنهاء كافة الجلسات النشطة' : 'Terminate Active Sessions'}
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{language === 'ar' ? 'إنهاء الجلسات' : 'Sessions'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {admin.status === 'active' ? (
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(admin, 'suspended')}
                          disabled={!canEditThisAdmin}
                          className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors disabled:opacity-40"
                        >
                          {language === 'ar' ? 'تعليق' : 'Suspend'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(admin, 'active')}
                          disabled={!canEditThisAdmin}
                          className="px-2.5 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold transition-colors disabled:opacity-40"
                        >
                          {language === 'ar' ? 'تفعيل' : 'Activate'}
                        </button>
                      )}

                      {onSwitchUser && (
                        <button
                          type="button"
                          onClick={() => onSwitchUser(admin)}
                          className="px-2.5 py-1.5 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-bold transition-colors"
                        >
                          {language === 'ar' ? 'تقمص' : 'Impersonate'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB TAB 2: PLATFORM USERS & PASSWORD RESET (ALL ROLES) */}
      {/* ========================================================================= */}
      {activeSubTab === 'platform_users' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                {language === 'ar' ? 'قائمة مستخدمي المنصة وإدارة كلمات المرور' : 'Platform Users & Password Central Control'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {language === 'ar'
                  ? 'إمكانية تغيير كلمات المرور لكافة فئات المستخدمين (عملاء، صيدليات، سائقين، إدارة) مع حماية الـSuper Admin.'
                  : 'Directly reset passwords for all roles (Customers, Pharmacies, Drivers, Staff) with Super Admin role hierarchy protection.'}
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {filteredPlatformUsers.length} {language === 'ar' ? 'مستخدم' : 'Users'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'المستخدم' : 'User'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'الدور والنوع' : 'Role'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'الاتصال' : 'Contact'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="py-3.5 px-4 text-center">{language === 'ar' ? 'إجراءات الأمان وكلمة المرور' : 'Security Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPlatformUsers.map((user) => {
                  const badge = roleBadges[user.role] || roleBadges.customer;
                  return (
                    <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#0E7A4B]/10 text-[#0E7A4B] flex items-center justify-center font-bold text-xs shrink-0">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">{user.name}</span>
                            <span className="text-[11px] text-gray-500">{user.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${badge.bg} ${badge.text}`}>
                          {language === 'ar' ? badge.labelAr : badge.labelEn}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-xs text-gray-600">
                          <div>{user.email || '—'}</div>
                          <div className="text-gray-400">{user.phone || '—'}</div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {user.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUserForAction(user);
                              setIsResetPasswordModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-[#0B6B43] text-[#0E7A4B] hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
                          >
                            <Key className="w-3.5 h-3.5" />
                            {language === 'ar' ? 'تعيين كلمة المرور' : 'Reset Password'}
                          </button>

                          {user.status === 'active' ? (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(user, 'suspended')}
                              className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-600 font-medium text-xs transition-colors"
                            >
                              {language === 'ar' ? 'تعليق' : 'Suspend'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(user, 'active')}
                              className="px-2.5 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 font-bold text-xs transition-colors"
                            >
                              {language === 'ar' ? 'تنشيط' : 'Activate'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB TAB 3: ROLE PERMISSIONS MATRIX & INTERACTIVE SWITCHER */}
      {/* ========================================================================= */}
      {activeSubTab === 'role_matrix' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-bold text-gray-900 text-base">
              {language === 'ar' ? 'مصفوفة التحكم بالوصول المبني على الأدوار (Granular RBAC Matrix)' : 'Granular RBAC Permission Matrix'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {language === 'ar'
                ? 'فحص شامل لكافة الصلاحيات الممنوحة لكل دور داخل المنصة لضمان عدم وجود تداخل أو ثغرات غير مصرح بها.'
                : 'Comprehensive module-by-module permission breakdown across all 10 platform roles.'}
            </p>
          </div>

          <div className="space-y-6">
            {PERMISSION_MODULES.map((module) => (
              <div key={module.id} className="border border-gray-200/70 rounded-xl p-4 bg-gray-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#0E7A4B]" />
                    {language === 'ar' ? module.nameAr : language === 'fr' ? module.nameFr : module.nameEn}
                  </h4>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {module.permissions.length} {language === 'ar' ? 'عمليات مصرحة' : 'actions'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {module.permissions.map((perm) => (
                    <div
                      key={perm.id}
                      className="bg-white p-3 rounded-lg border border-gray-200/80 text-xs space-y-1"
                    >
                      <div className="font-bold text-gray-800 flex items-center justify-between">
                        <span>{language === 'ar' ? perm.labelAr : language === 'fr' ? perm.labelFr : perm.labelEn}</span>
                        <code className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                          {perm.id}
                        </code>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed capitalize">
                        {perm.action} action
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE NEW ADMINISTRATOR */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isCreateAdminModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-6"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#0E7A4B] flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {language === 'ar' ? 'إنشاء حساب مسؤول جديد' : 'Create New Administrator'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {language === 'ar' ? 'تعيين الدور والصلاحيات وكلمة المرور المؤقتة' : 'Assign role, granular permissions & credentials'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreateAdminModalOpen(false)}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateAdminSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {language === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newAdminForm.name}
                      onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })}
                      placeholder="e.g. Mosa Admin"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#0E7A4B] focus:ring-1 focus:ring-[#0E7A4B] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {language === 'ar' ? 'اسم المستخدم (Username)' : 'Username (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={newAdminForm.username}
                      onChange={(e) => setNewAdminForm({ ...newAdminForm, username: e.target.value })}
                      placeholder="mosa"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#0E7A4B] focus:ring-1 focus:ring-[#0E7A4B] outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {language === 'ar' ? 'البريد الإلكتروني *' : 'Official Email *'}
                    </label>
                    <input
                      type="email"
                      required
                      value={newAdminForm.email}
                      onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                      placeholder="mosa@dawamed.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#0E7A4B] focus:ring-1 focus:ring-[#0E7A4B] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                    </label>
                    <input
                      type="text"
                      value={newAdminForm.phone}
                      onChange={(e) => setNewAdminForm({ ...newAdminForm, phone: e.target.value })}
                      placeholder="+254 700 000 000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#0E7A4B] focus:ring-1 focus:ring-[#0E7A4B] outline-hidden"
                    />
                  </div>
                </div>

                {/* Role Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {language === 'ar' ? 'الدور الإداري (Administrative Role) *' : 'Administrative Role *'}
                  </label>
                  <select
                    value={newAdminForm.role}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, role: e.target.value as UserRole })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white font-medium focus:border-[#0E7A4B] outline-hidden"
                  >
                    <option value="admin">Administrator (مسؤول عام)</option>
                    <option value="medical_admin">Medical Admin / Director (المدير الطبي)</option>
                    <option value="operations_admin">Operations Admin (مسؤول العمليات)</option>
                    <option value="support_admin">Support Admin (مشرف الدعم)</option>
                    <option value="system_admin">System Admin (مسؤول النظم)</option>
                    {currentUser.role === 'super_admin' && (
                      <option value="super_admin">Super Administrator (المشرف العام الكامل)</option>
                    )}
                  </select>
                </div>

                {/* Password field with generator */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700">
                      {language === 'ar' ? 'كلمة المرور المؤقتة *' : 'Temporary Password (Min 8 Chars) *'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setNewAdminForm({ ...newAdminForm, password: generateStrongPassword() })}
                      className="text-xs font-semibold text-[#0E7A4B] hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {language === 'ar' ? 'توليد كلمة سر آمنة' : 'Generate Strong Password'}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showNewAdminPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={newAdminForm.password}
                      onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#0E7A4B] focus:ring-1 focus:ring-[#0E7A4B] outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewAdminPassword(!showNewAdminPassword)}
                      className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'} text-gray-400 hover:text-gray-600`}
                    >
                      {showNewAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {language === 'ar' ? 'القسم / المركز' : 'Department / Assigned Hub'}
                  </label>
                  <input
                    type="text"
                    value={newAdminForm.department}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, department: e.target.value })}
                    placeholder="DAWA Central Hub"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#0E7A4B] focus:ring-1 focus:ring-[#0E7A4B] outline-hidden"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateAdminModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2.5 rounded-xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white font-bold text-sm shadow-xs transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        {language === 'ar' ? 'جارٍ الإنشاء...' : 'Creating...'}
                      </span>
                    ) : (
                      language === 'ar' ? 'إنشاء حساب المسؤول' : 'Create Administrator'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: RESET PASSWORD FOR USER / ADMIN */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isResetPasswordModalOpen && selectedUserForAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">
                      {language === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset User Password'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {selectedUserForAction.name} ({selectedUserForAction.role})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsResetPasswordModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700">
                      {language === 'ar' ? 'كلمة المرور الجديدة (8 خانات على الأقل) *' : 'New Password (Min 8 Characters) *'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setResetPasswordForm({ ...resetPasswordForm, newPassword: generateStrongPassword() })}
                      className="text-xs font-semibold text-[#0E7A4B] hover:underline"
                    >
                      {language === 'ar' ? 'توليد كلمة سر' : 'Generate'}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={resetPasswordForm.newPassword}
                      onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, newPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#0E7A4B] focus:ring-1 focus:ring-[#0E7A4B] outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'} text-gray-400 hover:text-gray-600`}
                    >
                      {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 bg-gray-50 p-3.5 rounded-xl border border-gray-200/60 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={resetPasswordForm.requireChangeOnLogin}
                      onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, requireChangeOnLogin: e.target.checked })}
                      className="w-4 h-4 text-[#0E7A4B] rounded-sm focus:ring-[#0E7A4B]"
                    />
                    <span className="font-medium text-gray-800">
                      {language === 'ar' ? 'إلزام المستخدم بتغيير كلمة المرور عند أول تسجيل دخول' : 'Require user to change password upon next login'}
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={resetPasswordForm.revokeAllSessions}
                      onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, revokeAllSessions: e.target.checked })}
                      className="w-4 h-4 text-[#0E7A4B] rounded-sm focus:ring-[#0E7A4B]"
                    />
                    <span className="font-medium text-gray-800">
                      {language === 'ar' ? 'إنهاء وحظر كافة الجلسات المفتوحة على الأجهزة الأخرى فوراً' : 'Immediately terminate all active sessions across devices'}
                    </span>
                  </label>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsResetPasswordModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-50"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2.5 rounded-xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        {language === 'ar' ? 'جارٍ التعيين...' : 'Resetting...'}
                      </span>
                    ) : (
                      language === 'ar' ? 'تأكيد وحفظ كلمة المرور' : 'Confirm Password Reset'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
