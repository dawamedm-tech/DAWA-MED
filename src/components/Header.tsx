import React from 'react';
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
  Globe
} from 'lucide-react';

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
  onOpenAuth?: () => void;
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
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const roleNavItems: { id: UserRole; label: string; icon: React.ReactNode }[] = [
    { id: 'website', label: t.roleWebsite || 'Website', icon: <Globe className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'customer', label: t.roleCustomer || 'Customer', icon: <User className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'pharmacy', label: t.rolePharmacy || 'Pharmacy', icon: <Building2 className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'driver', label: t.roleDriver || 'Driver', icon: <Bike className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'subscription', label: t.roleSubscription || 'Refill', icon: <CalendarCheck className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'admin', label: t.roleAdmin || 'Admin', icon: <Shield className="w-3.5 h-3.5 shrink-0" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#D8E2DC] shadow-xs" id="dawa-main-header">
      {/* Top Regulatory Notice & Low Bandwidth Status Bar */}
      <div className="bg-[#1B4332] text-[#D8F3DC] text-[11px] px-3 sm:px-6 py-1.5 flex items-center justify-between gap-2 border-b border-[#2D6A4F]/40 overflow-hidden">
        <div className="flex items-center gap-1.5 min-w-0 max-w-[60%] sm:max-w-none">
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
              <span className="hidden md:inline">{translate('systemHealthTests', language)}</span>
            </button>
          )}

          {/* Legal and Compliance Trigger */}
          {onOpenLegal && (
            <button
              onClick={onOpenLegal}
              className="hidden sm:inline-flex items-center gap-1 text-[#95D5B2] hover:text-white transition-colors text-[11px] font-semibold cursor-pointer"
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
            <span className="hidden xs:inline">{isLiteMode ? translate('liteModeOn', language) : translate('liteModeOff', language)}</span>
            <span className="xs:hidden">{isLiteMode ? '2G' : '4G'}</span>
          </button>

          {/* Quick Brand Info trigger */}
          <button
            onClick={onOpenSplash}
            className="hidden sm:inline-flex items-center gap-1 text-[#95D5B2] hover:text-white transition-colors text-[11px] font-semibold cursor-pointer"
            title={translate('brandStory', language)}
            id="header-about-btn"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#74C69D]" />
            <span className="hidden md:inline">{translate('brandStory', language)}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        {/* Left: Brand Logo & Current Location */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 min-w-0">
          <button
            onClick={() => onRoleChange('customer')}
            className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] rounded-xl cursor-pointer shrink-0"
            id="header-brand-logo-btn"
          >
            <BrandLogo size="md" showTagline language={language} />
          </button>

          {/* Location indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#F0F7F4] border border-[#D8E2DC] rounded-xl text-xs text-[#1B4332]">
            <MapPin className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
            <span className="font-semibold">{selectedCountry.sampleCity}, {selectedCountry.name}</span>
          </div>
        </div>

        {/* Right Actions: Country, Language, Notifications, Profile, Cart */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Country / Currency Selector */}
          <div className="relative">
            <select
              value={selectedCountry.code}
              onChange={(e) => {
                const found = COUNTRIES.find((c) => c.code === e.target.value);
                if (found) onCountryChange(found);
              }}
              className="appearance-none bg-[#F8FAF9] hover:bg-[#F0F7F4] border border-[#D8E2DC] text-[#1B4332] text-[11px] sm:text-xs font-semibold py-1.5 sm:py-2 px-2 sm:px-2.5 pe-5 sm:pe-6 rounded-xl cursor-pointer transition-colors focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none max-w-[85px] sm:max-w-none"
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
              className="appearance-none bg-[#F8FAF9] hover:bg-[#F0F7F4] border border-[#D8E2DC] text-[#1B4332] text-[11px] sm:text-xs font-bold py-1.5 sm:py-2 px-2 sm:px-2.5 pe-5 sm:pe-6 rounded-xl cursor-pointer transition-colors focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
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
              className="relative p-1.5 sm:p-2 rounded-xl bg-[#F8FAF9] hover:bg-[#F0F7F4] border border-[#D8E2DC] text-[#1B4332] transition-colors cursor-pointer"
              title={translate('notificationsTitle', language)}
              id="header-notifications-btn"
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#52B788] text-white text-[9px] sm:text-[10px] font-black h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {unreadNotifCount}
                </span>
              )}
            </button>
          )}

          {/* User Profile / Login */}
          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1 sm:gap-1.5 py-1.5 px-2 sm:px-3 bg-[#F8FAF9] hover:bg-[#F0F7F4] border border-[#D8E2DC] text-[#1B4332] rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer"
              id="header-profile-btn"
              title={translate('profile', language)}
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#D8F3DC] text-[#2D6A4F] flex items-center justify-center font-black text-[9px] sm:text-[10px]">
                {userProfile?.name?.charAt(0) || 'U'}
              </div>
              <span className="hidden md:inline truncate max-w-[80px]">{userProfile?.name || translate('profile', language)}</span>
            </button>
          )}

          {/* Cart Button */}
          {currentRole === 'customer' && (
            <button
              onClick={onOpenCart}
              className="relative flex items-center justify-center p-1.5 sm:px-3 sm:py-2 bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#2D6A4F]/20 active:scale-95 cursor-pointer"
              id="header-cart-btn"
              aria-label={translate('cart', language)}
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline ms-1.5">{translate('cart', language)}</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#52B788] text-white text-[10px] sm:text-[11px] font-black h-4 w-4 sm:h-5 sm:w-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Role Navigation Strip (Customer, Pharmacy, Driver, Admin, Subscription, Website) */}
      <div className="bg-[#F8FAF9] border-t border-[#D8E2DC] overflow-x-auto no-scrollbar scroll-smooth">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center gap-1.5 py-1.5 min-w-max">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#52B788] pe-1 shrink-0 flex items-center gap-1">
            <Radio className="w-2.5 h-2.5 text-[#2D6A4F] animate-pulse" />
            <span>{translate('portal', language)}</span>
          </span>
          {roleNavItems.map((item) => {
            const isActive = currentRole === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onRoleChange(item.id)}
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
