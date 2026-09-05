import React, { useState } from 'react';
import { 
  Bell, 
  Menu, 
  X, 
  User, 
  Building2, 
  Bike, 
  Shield, 
  Headphones, 
  CalendarCheck, 
  Globe, 
  ChevronRight,
  ChevronLeft,
  LogOut,
  Sparkles,
  Activity
} from 'lucide-react';
import { Language, CountryConfig, UserRole, UserProfile, NotificationItem } from '../../types';
import { COUNTRIES } from '../../data/mockData';

interface MobileHeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  selectedCountry: CountryConfig;
  onCountryChange: (country: CountryConfig) => void;
  userProfile?: UserProfile;
  notifications?: NotificationItem[];
  onOpenNotifications: () => void;
  onOpenAuth: (mode?: any) => void;
  onLogout?: () => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenLegal: () => void;
  onOpenHealthTests: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  language,
  onLanguageChange,
  selectedCountry,
  onCountryChange,
  userProfile,
  notifications = [],
  onOpenNotifications,
  onOpenAuth,
  onLogout,
  currentRole,
  onRoleChange,
  onOpenLegal,
  onOpenHealthTests
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isRtl = language === 'ar';

  // Strict dynamic unread count from user's actual notifications (No hardcoded fallback)
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const roleNavItems: { id: UserRole; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'customer', label: isRtl ? 'المريض / العميل' : 'Patient / Customer', icon: <User className="w-4 h-4" /> },
    { id: 'subscription', label: isRtl ? 'اشتراك DAWA MED الشهري' : 'DAWA MED Monthly', icon: <CalendarCheck className="w-4 h-4 text-emerald-600" /> },
    { id: 'pharmacy', label: isRtl ? 'بوابة الصيدلية المرخصة' : 'Licensed Pharmacy Portal', icon: <Building2 className="w-4 h-4" /> },
    { id: 'driver', label: isRtl ? 'تطبيق مندوب التوصيل' : 'Delivery Driver App', icon: <Bike className="w-4 h-4" /> },
    { id: 'admin', label: isRtl ? 'لوحة تحكم الإدارة (Admin)' : 'Admin Dashboard', icon: <Shield className="w-4 h-4 text-emerald-700" /> },
    { id: 'support', label: isRtl ? 'الدعم وخدمة العملاء' : 'Customer Support Hub', icon: <Headphones className="w-4 h-4" /> },
    { id: 'website', label: isRtl ? 'الموقع التعريفي العام' : 'Public Website', icon: <Globe className="w-4 h-4" /> }
  ];

  return (
    <>
      <header 
        className="w-full bg-white border-b border-[#E5E7EB]/90 sticky top-0 z-40 select-none shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
        id="dawa-mobile-header"
      >
        <div className="w-full h-14 sm:h-[58px] max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto px-3 sm:px-4 flex items-center justify-between">
          {/* Start Side: Menu Icon (Right in RTL, Left in LTR) */}
          <div className="flex items-center">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-1.5 text-neutral-800 hover:text-[#0E7A4B] hover:bg-[#E8F5EE] active:bg-[#D8F3DC] rounded-xl transition-colors cursor-pointer"
              aria-label={isRtl ? 'القائمة' : 'Menu'}
              id="header-hamburger-btn"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.8} />
            </button>
          </div>

          {/* Center: DAWA MED Logo + Tagline */}
          <div 
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-transform active:scale-98"
            onClick={() => onRoleChange('customer')}
            id="mobile-header-brand"
          >
            {/* Medical Shield with '+' inside */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0E7A4B] flex items-center justify-center text-white shadow-2xs shrink-0 relative overflow-hidden">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#0E7A4B" />
                <line x1="12" y1="8" x2="12" y2="16" stroke="white" strokeWidth="2.6" />
                <line x1="8" y1="12" x2="16" y2="12" stroke="white" strokeWidth="2.6" />
              </svg>
            </div>

            {/* Brand Text */}
            <div className="flex flex-col items-start leading-none">
              <span className="text-sm sm:text-base font-black tracking-tight text-[#0E7A4B]">
                DAWA MED
              </span>
              <span className="text-[7px] sm:text-[7.5px] font-bold text-[#0E7A4B]/80 tracking-wider uppercase">
                CARE. CONNECT. DELIVER.
              </span>
            </div>
          </div>

          {/* End Side: Notification Bell (Left in RTL, Right in LTR) */}
          <div className="flex items-center">
            <button
              onClick={onOpenNotifications}
              className="relative p-1.5 text-neutral-800 hover:text-[#0E7A4B] hover:bg-[#E8F5EE] active:bg-[#D8F3DC] rounded-xl transition-colors cursor-pointer"
              aria-label={isRtl ? 'الإشعارات' : 'Notifications'}
              id="header-notification-btn"
            >
              <Bell className="w-5 h-5 sm:w-5.5 sm:h-5.5" strokeWidth={1.8} />
              {/* Badge shown ONLY if unreadNotificationsCount > 0 */}
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 end-1 min-w-4 h-4 px-1 rounded-full bg-[#EF4444] text-white text-[9px] font-black flex items-center justify-center border-2 border-white shadow-xs">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Mobile Navigation Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex" dir={isRtl ? 'rtl' : 'ltr'}>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Body */}
          <div className={`relative ${isRtl ? 'mr-auto' : 'ml-auto'} w-[82%] max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in ${isRtl ? 'slide-in-from-right' : 'slide-in-from-left'} duration-200`}>
            {/* Drawer Header */}
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-[#F8FAF9]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#0E7A4B] flex items-center justify-center text-white text-xs font-black">
                  +
                </div>
                <div>
                  <h4 className="font-extrabold text-neutral-900 text-xs">DAWA MED</h4>
                  <p className="text-[10px] text-neutral-500">{selectedCountry.name} • {selectedCountry.currency}</p>
                </div>
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-xl hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="p-3 overflow-y-auto flex-1 space-y-4">
              {/* User Profile summary if logged in */}
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#E8F5EE] text-[#0E7A4B] font-bold text-xs flex items-center justify-center">
                    {userProfile?.name ? userProfile.name.charAt(0) : 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-neutral-900 truncate">{userProfile?.name || (isRtl ? 'مريض غير مسجل' : 'Guest Patient')}</p>
                    <p className="text-[10px] text-neutral-500 truncate">{userProfile?.phone || selectedCountry.samplePhone}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenAuth('profile');
                  }}
                  className="text-[11px] font-bold text-[#0E7A4B] hover:underline"
                >
                  {isRtl ? 'تعديل' : 'Edit'}
                </button>
              </div>

              {/* Role Navigation Switcher */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2">
                  {isRtl ? 'أقسام المنصة وبوابات التشغيل' : 'Platform Portals'}
                </p>
                {roleNavItems.map((item) => {
                  const isActive = currentRole === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onRoleChange(item.id);
                        setIsDrawerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        isActive 
                          ? 'bg-[#E8F5EE] text-[#0E7A4B]' 
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {isRtl ? <ChevronLeft className="w-3.5 h-3.5 text-neutral-400" /> : <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />}
                    </button>
                  );
                })}
              </div>

              {/* Country Selection */}
              <div className="space-y-1 pt-2 border-t border-neutral-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2">
                  {isRtl ? 'الدولة والعملة' : 'Country & Currency'}
                </p>
                <div className="grid grid-cols-2 gap-1 px-1">
                  {COUNTRIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => onCountryChange(c)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-semibold text-start flex items-center gap-1.5 transition-all ${
                        selectedCountry.code === c.code 
                          ? 'bg-[#0E7A4B] text-white' 
                          : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <span>{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Selection */}
              <div className="space-y-1 pt-2 border-t border-neutral-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2">
                  {isRtl ? 'اللغة' : 'Language'}
                </p>
                <div className="flex items-center gap-1 px-1">
                  {[
                    { id: 'ar', label: 'العربية' },
                    { id: 'en', label: 'English' },
                    { id: 'sw', label: 'Kiswahili' }
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => onLanguageChange(lang.id as Language)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        language === lang.id
                          ? 'bg-[#0E7A4B] text-white shadow-xs'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className="pt-2 border-t border-neutral-100 space-y-1">
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenLegal();
                  }}
                  className="w-full text-start px-2 py-1 text-xs text-neutral-600 hover:text-neutral-900"
                >
                  {isRtl ? 'الشروط والأحكام الطبية' : 'Terms & Medical Disclaimers'}
                </button>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenHealthTests();
                  }}
                  className="w-full text-start px-2 py-1 text-xs text-neutral-600 hover:text-neutral-900"
                >
                  {isRtl ? 'فحص جاهزية النظام والاعتماد' : 'System Readiness Diagnostics'}
                </button>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-neutral-100 bg-[#F8FAF9]">
              {userProfile?.isRegistered && onLogout ? (
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onLogout();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-red-50 text-red-600 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-red-100"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'تسجيل الخروج' : 'Log Out'}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenAuth('login');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-[#0E7A4B] text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#0B6B43]"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'تسجيل الدخول / إنشاء حساب' : 'Log In / Sign Up'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
