import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { 
  UserRole, 
  Language, 
  CountryConfig, 
  OrderItem,
  UserProfile,
  NotificationItem
} from '../types';
import { COUNTRIES } from '../data/mockData';
import { TRANSLATIONS } from '../data/translations';
import { translate } from '../utils/i18n';
import { 
  ShoppingBag, 
  ShieldCheck, 
  Zap, 
  HelpCircle,
  Building2,
  Bike,
  Shield,
  CalendarCheck,
  User,
  Radio,
  Bell,
  MapPin,
  Globe,
  Headphones,
  LogIn,
  UserPlus,
  LogOut,
  ChevronDown,
  KeyRound,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';
import { AuthMode } from './AuthModal';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  selectedCountry: CountryConfig;
  onCountryChange: (country: CountryConfig) => void;
  cartItems: OrderItem[];
  onOpenCart: () => void;
  onOpenUploadRx: () => void;
  onOpenSplash: () => void;
  onOpenAuth?: (mode?: AuthMode) => void;
  onLogout?: () => void;
  onOpenNotifications?: () => void;
  onOpenLegal?: () => void;
  onOpenHealthTests?: () => void;
  userProfile?: UserProfile;
  notifications?: NotificationItem[];
  isLiteMode: boolean;
  onToggleLiteMode: () => void;
  activeOrderCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  language,
  onLanguageChange,
  selectedCountry,
  onCountryChange,
  cartItems,
  onOpenCart,
  onOpenSplash,
  onOpenAuth,
  onLogout,
  onOpenNotifications,
  onOpenLegal,
  onOpenHealthTests,
  userProfile,
  notifications = [],
  isLiteMode,
  onToggleLiteMode,
  activeOrderCount,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isRtl = language === 'ar';
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const unreadNotifCount = notifications.filter((n) => !n.read).length;
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const roleNavItems: { id: UserRole; label: string; icon: React.ReactNode }[] = [
    { id: 'website', label: t.roleWebsite || translate('roleWebsite', language), icon: <Globe className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'customer', label: t.roleCustomer || translate('roleCustomer', language), icon: <User className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'pharmacy', label: t.rolePharmacy || translate('rolePharmacy', language), icon: <Building2 className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'driver', label: t.roleDriver || translate('roleDriver', language), icon: <Bike className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'subscription', label: t.roleSubscription || translate('roleSubscription', language), icon: <CalendarCheck className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'support', label: t.roleSupport || translate('roleSupport', language), icon: <Headphones className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'admin', label: t.roleAdmin || translate('roleAdmin', language), icon: <Shield className="w-3.5 h-3.5 shrink-0" /> },
  ];

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'customer': return t.roleCustomer || translate('roleCustomer', language);
      case 'pharmacy': return t.rolePharmacy || translate('rolePharmacy', language);
      case 'driver': return t.roleDriver || translate('roleDriver', language);
      case 'admin': return t.roleAdmin || translate('roleAdmin', language);
      case 'super_admin': return t.superAdmin || translate('superAdmin', language);
      default: return role;
    }
  };

  return (
    <header 
      className="sticky top-0 z-40 w-full max-w-full bg-white border-b border-[#D8E2DC] shadow-xs box-border" 
      id="dawa-main-header"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Top Regulatory Notice & Status Bar */}
      <div className="w-full max-w-full bg-[#1B4332] text-[#D8F3DC] text-[11px] px-3 sm:px-6 py-1.5 flex items-center justify-between gap-2 border-b border-[#2D6A4F]/40 box-border overflow-hidden">
        <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
          <ShieldCheck className="w-3.5 h-3.5 text-[#74C69D] shrink-0" />
          <span className="truncate text-[10px] sm:text-xs">
            <strong className="text-white">{selectedCountry.flag} {selectedCountry.name}:</strong> {selectedCountry.regulatoryBody} {translate('verifiedHub', language)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* System Health Audit Trigger */}
          {onOpenHealthTests && (
            <button
              onClick={onOpenHealthTests}
              className="inline-flex items-center gap-1 text-[#95D5B2] hover:text-white transition-colors text-[10px] sm:text-[11px] font-semibold cursor-pointer"
              title={translate('systemHealthTests', language)}
              id="header-health-tests-btn"
            >
              <Radio className="w-3 h-3 text-[#52B788] animate-pulse" />
              <span className="hidden sm:inline">{translate('systemHealthTests', language)}</span>
            </button>
          )}

          {/* Legal and Compliance Trigger */}
          {onOpenLegal && (
            <button
              onClick={onOpenLegal}
              className="hidden md:inline-flex items-center gap-1 text-[#95D5B2] hover:text-white transition-colors text-[11px] font-semibold cursor-pointer"
              title={translate('legalComplianceCenter', language)}
              id="header-legal-btn"
            >
              <ShieldCheck className="w-3 h-3 text-[#74C69D]" />
              <span className="hidden lg:inline">{translate('legalComplianceCenter', language)}</span>
            </button>
          )}

          {/* Low Bandwidth Mode Pill */}
          <button
            onClick={onToggleLiteMode}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
              isLiteMode 
                ? 'bg-[#52B788] text-white shadow-xs' 
                : 'bg-white/10 text-[#D8F3DC] hover:bg-white/20'
            }`}
            title={translate('lowBandwidthMode', language)}
            id="lite-mode-toggle-btn"
          >
            <Zap className={`w-3 h-3 ${isLiteMode ? 'fill-current text-white' : 'text-[#74C69D]'}`} />
            <span className="hidden sm:inline">{isLiteMode ? translate('liteModeOn', language) : translate('liteModeOff', language)}</span>
            <span className="sm:hidden">{isLiteMode ? '2G' : '4G'}</span>
          </button>

          {/* Quick Brand Info trigger */}
          <button
            onClick={onOpenSplash}
            className="hidden lg:inline-flex items-center gap-1 text-[#95D5B2] hover:text-white transition-colors text-[11px] font-semibold cursor-pointer"
            title={translate('brandStory', language)}
            id="header-about-btn"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#74C69D]" />
            <span className="hidden xl:inline">{translate('brandStory', language)}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 box-border">
        {/* Left: Brand Logo & Current Location */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 min-w-0">
          <button
            onClick={() => onRoleChange('customer')}
            className="text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] rounded-xl cursor-pointer shrink-0 min-w-0"
            id="header-brand-logo-btn"
          >
            <BrandLogo size="md" showTagline language={language} />
          </button>

          {/* Location indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-[#F0F7F4] border border-[#D8E2DC] rounded-xl text-xs text-[#1B4332]">
            <MapPin className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
            <span className="font-semibold truncate">{selectedCountry.sampleCity}, {selectedCountry.name}</span>
          </div>
        </div>

        {/* Right Actions: Desktop & Tablet View (Hidden on Small Mobile) */}
        <div className="hidden md:flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Country Selector */}
          <div className="relative">
            <select
              value={selectedCountry.code}
              onChange={(e) => {
                const found = COUNTRIES.find((c) => c.code === e.target.value);
                if (found) onCountryChange(found);
              }}
              className="appearance-none bg-[#F8FAF9] hover:bg-[#F0F7F4] border border-[#D8E2DC] text-[#1B4332] text-xs font-semibold py-1.5 sm:py-2 px-2.5 pe-6 rounded-xl cursor-pointer transition-colors focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
              aria-label={translate('switchCountry', language)}
              id="header-country-select"
            >
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.currency}
                </option>
              ))}
            </select>
          </div>

          {/* Language Switcher */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="appearance-none bg-[#F8FAF9] hover:bg-[#F0F7F4] border border-[#D8E2DC] text-[#1B4332] text-xs font-bold py-1.5 sm:py-2 px-2.5 pe-6 rounded-xl cursor-pointer transition-colors focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
              aria-label={translate('language', language)}
              id="header-language-select"
            >
              <option value="en">🇬🇧 EN</option>
              <option value="ar">🇸🇦 العربية</option>
              <option value="fr">🇫🇷 FR</option>
              <option value="sw">🇹🇿 SW</option>
            </select>
          </div>

          {/* Notifications Bell */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl bg-[#F8FAF9] hover:bg-[#F0F7F4] border border-[#D8E2DC] text-[#1B4332] transition-colors cursor-pointer"
              title={translate('notificationsTitle', language)}
              id="header-notifications-btn"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#52B788] text-white text-[10px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {unreadNotifCount}
                </span>
              )}
            </button>
          )}

          {/* User Auth Section */}
          {userProfile?.isRegistered ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 py-1.5 px-2.5 bg-[#F0F7F4] hover:bg-[#E0F0E8] border border-[#74C69D] text-[#1B4332] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                id="header-user-menu-btn"
              >
                <div className="w-5 h-5 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center font-black text-[10px]">
                  {userProfile?.name?.charAt(0) || 'U'}
                </div>
                <span className="truncate max-w-[90px] font-bold">{userProfile?.name}</span>
                <span className="hidden lg:inline px-1.5 py-0.5 bg-[#D8F3DC] text-[#1B4332] text-[10px] font-extrabold rounded-md uppercase">
                  {getRoleLabel(currentRole)}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#2D6A4F]" />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div 
                  className={`absolute top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#D8E2DC] py-2 z-50 ${
                    isRtl ? 'left-0' : 'right-0'
                  }`}
                  id="header-user-dropdown"
                >
                  <div className="px-3.5 py-2 border-b border-[#D8E2DC] text-xs">
                    <p className="font-black text-[#1B4332] truncate">{userProfile.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{userProfile.email || userProfile.phone}</p>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-[#2D6A4F] font-bold">
                      <CheckCircle2 className="w-3 h-3 text-[#52B788]" />
                      <span>{selectedCountry.sampleCity} ({getRoleLabel(currentRole)})</span>
                    </div>
                  </div>

                  {onOpenAuth && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenAuth('login');
                      }}
                      className="w-full text-start px-3.5 py-2 text-xs font-semibold text-[#1B4332] hover:bg-[#F0F7F4] flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-[#2D6A4F]" />
                      <span>{t.manageAccountAndRoles || translate('manageAccountAndRoles', language)}</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onRoleChange('admin');
                    }}
                    className="w-full text-start px-3.5 py-2 text-xs font-semibold text-[#1B4332] hover:bg-[#F0F7F4] flex items-center gap-2 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>{translate('adminPortalLogin', language) || 'Admin Portal'}</span>
                  </button>

                  <div className="border-t border-[#D8E2DC] my-1" />

                  {onLogout && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-start px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                      id="header-logout-btn"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-600" />
                      <span>{translate('logout', language) || 'Sign Out'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenAuth && onOpenAuth('login')}
                className="flex items-center gap-1.5 py-1.5 px-3 bg-[#F8FAF9] hover:bg-[#F0F7F4] border border-[#D8E2DC] text-[#1B4332] rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                id="header-login-btn"
              >
                <LogIn className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>{translate('login', language) || 'Login'}</span>
              </button>

              <button
                onClick={() => onOpenAuth && onOpenAuth('register')}
                className="flex items-center gap-1.5 py-1.5 px-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-xl text-xs font-bold transition-all shadow-xs shadow-[#2D6A4F]/20 cursor-pointer active:scale-95"
                id="header-register-btn"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#74C69D]" />
                <span>{translate('register', language) || 'Register'}</span>
              </button>
            </div>
          )}

          {/* Cart Button (Desktop) */}
          {currentRole === 'customer' && (
            <button
              onClick={onOpenCart}
              className="relative flex items-center justify-center px-3 py-2 bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#2D6A4F]/20 active:scale-95 cursor-pointer shrink-0"
              id="header-cart-btn"
              aria-label={translate('cart', language)}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="ms-1.5">{translate('cart', language)}</span>
              {cartItemCount > 0 && (
                <span className="ms-1.5 bg-[#52B788] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Right Actions: Mobile Compact Controls */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          {/* Mobile Language Pill */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="appearance-none bg-[#F8FAF9] border border-[#D8E2DC] text-[#1B4332] text-[11px] font-black py-1.5 px-2 rounded-xl cursor-pointer focus:outline-none"
              aria-label={translate('language', language)}
              id="mobile-language-select"
            >
              <option value="en">🇬🇧 EN</option>
              <option value="ar">🇸🇦 ع</option>
              <option value="fr">🇫🇷 FR</option>
              <option value="sw">🇹🇿 SW</option>
            </select>
          </div>

          {/* Mobile Cart Button */}
          {currentRole === 'customer' && (
            <button
              onClick={onOpenCart}
              className="relative p-2 bg-[#2D6A4F] text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 cursor-pointer shrink-0"
              id="mobile-cart-btn"
              aria-label={translate('cart', language)}
            >
              <ShoppingBag className="w-4 h-4" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#52B788] text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border border-white">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-[#F0F7F4] hover:bg-[#E0F0E8] border border-[#74C69D] text-[#1B4332] transition-colors cursor-pointer relative"
            id="mobile-menu-toggle-btn"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-[#2D6A4F]" />
            ) : (
              <Menu className="w-5 h-5 text-[#2D6A4F]" />
            )}
            {(unreadNotifCount > 0 || userProfile?.isRegistered) && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#52B788]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Accordion Menu */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden border-t border-[#D8E2DC] bg-[#F8FAF9] px-4 py-3 space-y-3 shadow-inner w-full max-w-full box-border"
          id="mobile-nav-drawer"
        >
          {/* User Account / Auth bar in Mobile Menu */}
          {userProfile?.isRegistered ? (
            <div className="bg-white rounded-2xl p-3 border border-[#D8E2DC] shadow-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center font-black text-xs shrink-0">
                  {userProfile?.name?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="font-black text-xs text-[#1B4332] truncate">{userProfile.name}</p>
                  <p className="text-[10px] text-gray-500 truncate">{getRoleLabel(currentRole)} • {selectedCountry.sampleCity}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {onOpenAuth && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAuth('login');
                    }}
                    className="p-1.5 rounded-lg bg-[#F0F7F4] text-[#2D6A4F] text-xs font-bold"
                    title={t.manageAccountAndRoles || translate('manageAccountAndRoles', language)}
                  >
                    <User className="w-4 h-4" />
                  </button>
                )}
                {onLogout && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="p-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-bold"
                    title={translate('logout', language)}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAuth && onOpenAuth('login');
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-[#D8E2DC] text-[#1B4332] rounded-xl text-xs font-bold shadow-xs active:scale-95 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-[#2D6A4F]" />
                <span>{translate('login', language) || 'Login'}</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAuth && onOpenAuth('register');
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#2D6A4F] text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-[#74C69D]" />
                <span>{translate('register', language) || 'Register'}</span>
              </button>
            </div>
          )}

          {/* Mobile Country & Quick Settings Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Country Selector */}
            <div className="bg-white rounded-xl p-2 border border-[#D8E2DC]">
              <label className="text-[10px] text-gray-500 font-semibold block mb-1">
                {translate('activeMarketLabel', language) || 'Country'}:
              </label>
              <select
                value={selectedCountry.code}
                onChange={(e) => {
                  const found = COUNTRIES.find((c) => c.code === e.target.value);
                  if (found) onCountryChange(found);
                }}
                className="w-full bg-[#F8FAF9] font-bold text-xs py-1 px-1.5 rounded-lg border border-[#D8E2DC] text-[#1B4332] focus:outline-none"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.currency})
                  </option>
                ))}
              </select>
            </div>

            {/* Notification & Quick Links */}
            <div className="bg-white rounded-xl p-2 border border-[#D8E2DC] flex flex-col justify-between">
              <label className="text-[10px] text-gray-500 font-semibold block mb-1">
                {translate('notificationsTitle', language) || 'Alerts'}:
              </label>
              {onOpenNotifications && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenNotifications();
                  }}
                  className="flex items-center justify-between w-full py-1 px-2 bg-[#F0F7F4] rounded-lg text-xs font-bold text-[#1B4332]"
                >
                  <span className="flex items-center gap-1">
                    <Bell className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>{translate('notificationsTitle', language)}</span>
                  </span>
                  {unreadNotifCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-[#52B788] text-white text-[9px] font-black rounded-full">
                      {unreadNotifCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Quick Utility Links in Mobile Menu */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#D8E2DC]/60 text-[11px]">
            {onOpenLegal && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenLegal();
                }}
                className="text-[#2D6A4F] hover:underline font-semibold flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{translate('legalComplianceCenter', language)}</span>
              </button>
            )}

            {onOpenHealthTests && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenHealthTests();
                }}
                className="text-[#2D6A4F] hover:underline font-semibold flex items-center gap-1"
              >
                <Radio className="w-3.5 h-3.5 text-[#52B788]" />
                <span>{translate('systemHealthTests', language)}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Role Navigation Strip (Customer, Pharmacy, Driver, Admin, Subscription, Website) */}
      <div className="w-full max-w-full bg-[#F8FAF9] border-t border-[#D8E2DC] overflow-x-auto no-scrollbar scroll-smooth box-border">
        <div className="w-max max-w-none px-3 sm:px-6 flex items-center gap-1.5 py-1.5 box-border">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#52B788] pe-1 shrink-0 flex items-center gap-1">
            <Radio className="w-2.5 h-2.5 text-[#2D6A4F] animate-pulse" />
            <span>{translate('portal', language)}</span>
          </span>
          {roleNavItems.map((item) => {
            const isActive = currentRole === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onRoleChange(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`shrink-0 flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#2D6A4F] text-white shadow-xs shadow-[#2D6A4F]/20'
                    : 'text-[#1B4332]/80 hover:bg-[#F0F7F4] hover:text-[#2D6A4F]'
                }`}
                id={`role-nav-${item.id}`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.id === 'customer' && activeOrderCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-[#D8F3DC] text-[#1B4332] text-[9px] sm:text-[10px] font-black rounded-full">
                    {activeOrderCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
