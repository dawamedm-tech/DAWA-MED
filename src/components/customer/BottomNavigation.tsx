import React from 'react';
import { Home, Package, ShoppingBag, Heart, User } from 'lucide-react';
import { Language } from '../../types';

export type CustomerTab = 'home' | 'orders' | 'cart' | 'favorites' | 'account';

interface BottomNavigationProps {
  activeTab: CustomerTab;
  onTabChange: (tab: CustomerTab) => void;
  cartCount: number;
  activeOrderCount: number;
  favoritesCount?: number;
  language: Language;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  cartCount,
  activeOrderCount,
  favoritesCount = 0,
  language,
}) => {
  const isRtl = language === 'ar';

  // 4 Primary Navigation Items strictly matching the design:
  // 1. الرئيسية  2. الطلبات  3. المفضلة  4. حسابي
  const navItems: { id: CustomerTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'home',
      label: isRtl ? 'الرئيسية' : language === 'sw' ? 'Mwanzo' : 'Home',
      icon: <Home className="w-5 h-5" strokeWidth={activeTab === 'home' ? 2.4 : 1.8} />,
    },
    {
      id: 'orders',
      label: isRtl ? 'الطلبات' : language === 'sw' ? 'Maagizo' : 'Orders',
      icon: <Package className="w-5 h-5" strokeWidth={activeTab === 'orders' ? 2.4 : 1.8} />,
      badge: activeOrderCount > 0 ? activeOrderCount : undefined,
    },
    {
      id: 'favorites',
      label: isRtl ? 'المفضلة' : language === 'sw' ? 'Pendwa' : 'Favorites',
      icon: <Heart className="w-5 h-5" strokeWidth={activeTab === 'favorites' ? 2.4 : 1.8} />,
      badge: favoritesCount > 0 ? favoritesCount : undefined,
    },
    {
      id: 'account',
      label: isRtl ? 'حسابي' : language === 'sw' ? 'Akaunti' : 'Account',
      icon: <User className="w-5 h-5" strokeWidth={activeTab === 'account' ? 2.4 : 1.8} />,
    },
  ];

  return (
    <>
      {/* Floating Circular Cart Button (Active when cart has items) */}
      {cartCount > 0 && (
        <div className="fixed bottom-18 end-4 sm:end-8 z-40 animate-in zoom-in-75 duration-200">
          <button
            type="button"
            onClick={() => onTabChange('cart')}
            className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#0E7A4B] text-white shadow-xl flex items-center justify-center hover:bg-[#0B6B43] active:scale-95 transition-all cursor-pointer border-2 border-white group"
            aria-label={isRtl ? 'عرض سلة الأدوية' : 'View Shopping Cart'}
            id="floating-cart-btn"
          >
            <ShoppingBag className="w-5.5 h-5.5 text-white transition-transform group-hover:scale-110" />
            {/* Real Cart Items Count Badge */}
            <span className="absolute -top-1 -end-1 min-w-5 h-5 px-1 rounded-full bg-[#EF4444] text-white text-[10.5px] font-black flex items-center justify-center border-2 border-white shadow-xs">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          </button>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-neutral-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] select-none"
        id="customer-bottom-navigation"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 6px)' }}
      >
        <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto px-2 flex items-center justify-around h-14 sm:h-15">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                type="button"
                className={`relative flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer focus:outline-none ${
                  isActive ? 'text-[#0E7A4B]' : 'text-neutral-500 hover:text-neutral-900'
                }`}
                id={`bottom-nav-${item.id}`}
              >
                {/* Icon Container with Badge */}
                <div className="relative">
                  <div className={`transition-transform duration-150 ${isActive ? 'scale-110' : ''}`}>
                    {item.icon}
                  </div>

                  {/* Badge */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -end-2 min-w-4 h-4 px-1 rounded-full bg-[#0E7A4B] text-white text-[9.5px] font-black flex items-center justify-center border-2 border-white shadow-xs">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-[10px] sm:text-[11px] mt-1 font-semibold tracking-tight transition-colors ${
                    isActive ? 'text-[#0E7A4B] font-bold' : 'text-neutral-600'
                  }`}
                >
                  {item.label}
                </span>

                {/* Active Indicator Dot */}
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-[#0E7A4B] mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
