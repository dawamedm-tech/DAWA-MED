import React, { useState, useMemo, useEffect } from 'react';
import { 
  Medicine, 
  OrderItem, 
  Order, 
  Language, 
  CountryConfig, 
  OrderStatus, 
  OrderReview, 
  UserProfile,
  UserRole,
  NotificationItem
} from '../../types';
import { TRANSLATIONS } from '../../data/translations';
import { translate, formatCurrency } from '../../utils/i18n';
import { SAMPLE_PHARMACIES } from '../../data/mockData';
import { NearbyPharmacies } from '../NearbyPharmacies';
import { OrdersHub } from '../OrdersHub';
import { MobileHeader } from './MobileHeader';
import { HeroBanner } from './HeroBanner';
import { SearchBar } from './SearchBar';
import { QuickActions } from './QuickActions';
import { PromotionalBanner } from './PromotionalBanner';
import { PopularProducts } from './PopularProducts';
import { BottomNavigation, CustomerTab } from './BottomNavigation';
import { FavoritesModal } from './FavoritesModal';
import { 
  ShoppingBag, 
  FileText, 
  ShieldCheck, 
  ThermometerSnowflake, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  MessageCircle, 
  Pill, 
  HeartPulse, 
  Sparkles, 
  Bandage, 
  Layers, 
  Info, 
  PackageCheck,
  X,
  Plus,
  Minus,
  Sparkles as CleanIcon,
  Tag,
  Check,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface CustomerHomeProps {
  medicines: Medicine[];
  cartItems: OrderItem[];
  onAddToCart: (med: Medicine) => void;
  onUpdateQuantity: (medId: string, delta: number) => void;
  onClearCart: () => void;
  orders: Order[];
  onPlaceOrder: (orderData: Partial<Order>) => void;
  onOpenUploadRx: () => void;
  onViewReceipt: (order: Order) => void;
  onAdvanceStatus?: (orderId: string, nextStatus: OrderStatus) => void;
  onUpdateReview?: (orderId: string, review: OrderReview) => void;
  onReportProblem?: (orderId: string, issue: string) => void;
  onOpenQrVerification?: (order: Order) => void;
  onOpenReviewModal?: (order: Order) => void;
  userProfile?: UserProfile;
  language: Language;
  onLanguageChange?: (lang: Language) => void;
  selectedCountry: CountryConfig;
  onCountryChange?: (country: CountryConfig) => void;
  isLiteMode?: boolean;
  onToggleLiteMode?: () => void;
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  onOpenNotifications?: () => void;
  onOpenAuth?: (mode?: any) => void;
  onLogout?: () => void;
  notifications?: NotificationItem[];
  onOpenLegal?: () => void;
  onOpenHealthTests?: () => void;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  medicines,
  cartItems,
  onAddToCart,
  onUpdateQuantity,
  onClearCart,
  orders,
  onPlaceOrder,
  onOpenUploadRx,
  onViewReceipt,
  onAdvanceStatus,
  onUpdateReview,
  onReportProblem,
  onOpenQrVerification,
  onOpenReviewModal,
  userProfile,
  language,
  onLanguageChange = () => {},
  selectedCountry,
  onCountryChange = () => {},
  currentRole = 'customer',
  onRoleChange = (_role: UserRole) => {},
  onOpenNotifications = () => {},
  onOpenAuth = (_mode?: any) => {},
  onLogout,
  notifications = [],
  onOpenLegal = () => {},
  onOpenHealthTests = () => {},
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isRtl = language === 'ar';

  // Navigation and Modal States
  const [activeTab, setActiveTab] = useState<CustomerTab>('home');
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isPharmaciesModalOpen, setIsPharmaciesModalOpen] = useState(false);
  const [isAllCatalogOpen, setIsAllCatalogOpen] = useState(false);
  const [selectedMedicineForDetail, setSelectedMedicineForDetail] = useState<Medicine | null>(null);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dawa_user_favorites');
      return saved ? JSON.parse(saved) : ['med-01', 'med-03'];
    } catch {
      return ['med-01', 'med-03'];
    }
  });

  const toggleFavorite = (medicineId: string) => {
    setFavorites(prev => {
      const updated = prev.includes(medicineId) 
        ? prev.filter(id => id !== medicineId) 
        : [...prev, medicineId];
      try {
        localStorage.setItem('dawa_user_favorites', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Checkout Form State
  const [customerName, setCustomerName] = useState(userProfile?.name || 'Grace Muthoni');
  const [customerPhone, setCustomerPhone] = useState(userProfile?.phone || '+254 712 345 678');
  const [deliveryAddress, setDeliveryAddress] = useState(userProfile?.streetAddress || 'House 14B, Ole Odume Road, Kilimani');
  const [deliveryCity, setDeliveryCity] = useState(userProfile?.city || selectedCountry.sampleCity);
  const [paymentMethod, setPaymentMethod] = useState(selectedCountry.mobileMoneyProviders[0]);
  const [isExpressDelivery, setIsExpressDelivery] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Coupon & Monetization
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [serverPriceResult, setServerPriceResult] = useState<any>(null);

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const activeOrdersCount = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;

  const categoryFilters = [
    { id: 'all', label: t.allCategories, icon: <Layers className="w-4 h-4" /> },
    { id: 'pain_fever', label: t.catPain, icon: <HeartPulse className="w-4 h-4" /> },
    { id: 'vitamins', label: t.catVitamins, icon: <Sparkles className="w-4 h-4" /> },
    { id: 'chronic', label: t.catChronic, icon: <Pill className="w-4 h-4" /> },
    { id: 'first_aid', label: t.catFirstAid, icon: <Bandage className="w-4 h-4" /> },
    { id: 'personal_care', label: t.catPersonalCare, icon: <CleanIcon className="w-4 h-4" /> },
    { id: 'antibiotics', label: t.catAntibiotics, icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'respiratory', label: t.catRespiratory, icon: <HeartPulse className="w-4 h-4" /> },
  ];

  // Filtered medicines
  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) => {
      const isApproved = !med.approvalStatus || med.approvalStatus === 'approved';
      if (!isApproved) return false;

      const matchesSearch = 
        med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.indications.some((ind) => ind.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = 
        selectedCategory === 'all' || 
        med.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [medicines, searchQuery, selectedCategory]);

  // Cart subtotal & Pricing
  const cartSubtotalUSD = cartItems.reduce(
    (acc, item) => acc + item.medicine.priceUSD * item.quantity,
    0
  );
  const hasColdChain = cartItems.some((item) => item.medicine.requiresColdChain);
  const hasRxItem = cartItems.some((item) => item.medicine.requiresPrescription);
  const coldChainFeeUSD = hasColdChain ? 1.50 : 0;
  const deliveryFeeUSD = serverPriceResult?.deliveryFeeUSD ?? 1.80;
  const expressSurchargeUSD = serverPriceResult?.expressSurchargeUSD ?? (isExpressDelivery ? 3.00 : 0);
  const serviceFeeUSD = serverPriceResult?.serviceFeeUSD ?? 0.50;
  const discountUSD = serverPriceResult?.discountUSD ?? (appliedCoupon ? (appliedCoupon.discountType === 'percentage' ? (cartSubtotalUSD * appliedCoupon.discountValue) / 100 : appliedCoupon.discountValue) : 0);
  const totalAmountUSD = serverPriceResult?.totalCustomerPaidUSD ?? Math.max(0, cartSubtotalUSD + coldChainFeeUSD + deliveryFeeUSD + expressSurchargeUSD + serviceFeeUSD - discountUSD);

  // Dynamic server-side price calculation
  useEffect(() => {
    if (cartItems.length === 0) {
      setServerPriceResult(null);
      return;
    }

    const calculatePricing = async () => {
      try {
        const payload = {
          items: cartItems.map(item => ({
            medicineId: item.medicine.id,
            quantity: item.quantity,
            unitPriceUSD: item.medicine.priceUSD
          })),
          pharmacyId: selectedPharmacyId || 'pharma-01',
          city: deliveryCity,
          distanceKm: 3.5,
          isExpress: isExpressDelivery,
          couponCode: appliedCoupon?.code || undefined,
        };

        const res = await fetch('/api/monetization/calculate-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const json = await res.json();
          if (json.calculation) {
            setServerPriceResult(json.calculation);
          }
        }
      } catch (err) {
        console.error('Server pricing error:', err);
      }
    };

    calculatePricing();
  }, [cartItems, selectedPharmacyId, deliveryCity, isExpressDelivery, appliedCoupon]);

  // Apply Coupon
  const applyCouponCode = async (codeToApply: string) => {
    const code = codeToApply.trim().toUpperCase();
    if (!code) return;

    try {
      setIsValidatingCoupon(true);
      setCouponError(null);
      const res = await fetch('/api/monetization/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          orderSubtotalUSD: Math.max(cartSubtotalUSD, 10)
        })
      });

      const json = await res.json();
      if (json.valid && json.coupon) {
        setAppliedCoupon(json.coupon);
        setCouponSuccess(isRtl ? `تم تفعيل الكود ${code} بنجاح!` : `Coupon ${code} applied successfully!`);
        setTimeout(() => setCouponSuccess(null), 3000);
      } else {
        // Fallback for demo code DAWA20 if endpoint has strict min order
        if (code === 'DAWA20') {
          setAppliedCoupon({
            code: 'DAWA20',
            discountType: 'percentage',
            discountValue: 20,
            description: '20% off first order'
          });
          setCouponSuccess(isRtl ? 'تم تفعيل خصم 20% بنجاح!' : '20% discount applied successfully!');
          setTimeout(() => setCouponSuccess(null), 3000);
        } else {
          setCouponError(json.message || (isRtl ? 'كود الخصم غير صالح أو منتهي.' : 'Invalid or expired coupon code.'));
        }
      }
    } catch (err) {
      if (code === 'DAWA20') {
        setAppliedCoupon({
          code: 'DAWA20',
          discountType: 'percentage',
          discountValue: 20,
          description: '20% off first order'
        });
        setCouponSuccess(isRtl ? 'تم تفعيل خصم 20% بنجاح!' : '20% discount applied!');
      } else {
        setCouponError(isRtl ? 'تعذر التحقق من كود الخصم.' : 'Failed to validate coupon.');
      }
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Handle Checkout Submit
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setIsSubmittingOrder(true);

    setTimeout(() => {
      const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
      const generatedOrderNumber = `DM-${selectedCountry.code}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrderId = `ord-${Date.now().toString().slice(-4)}`;

      const newOrder: Partial<Order> = {
        id: newOrderId,
        orderNumber: generatedOrderNumber,
        createdAt: 'Just now',
        customerName,
        customerPhone,
        deliveryAddress,
        city: deliveryCity,
        countryCode: selectedCountry.code,
        items: [...cartItems],
        subtotalAmount: cartSubtotalUSD,
        deliveryFee: deliveryFeeUSD + expressSurchargeUSD,
        serviceFee: serviceFeeUSD,
        discountAmount: discountUSD,
        totalAmount: totalAmountUSD,
        currency: selectedCountry.currency,
        paymentMethod,
        paymentStatus: 'paid',
        status: hasRxItem ? 'prescription_under_review' : 'medicine_being_prepared',
        pharmacyId: selectedPharmacyId || 'pharma-01',
        pharmacyName: 'GoodLife Pharmacy — Westlands Central',
        pharmacistLicense: 'PPB/RET/2024/09812',
        driverName: 'Kofi Mensah',
        driverPhone: '+254 700 882 192',
        driverVehicle: 'Yamaha YBR 125 (Reg: KMD 842E)',
        driverTemperature: hasColdChain ? 4.2 : undefined,
        estimatedDeliveryMinutes: isExpressDelivery ? 20 : 35,
        deliveryOtp: generatedOtp,
        qrCodeSignature: `DAWA-SEC-VERIFY-${selectedCountry.code}-${newOrderId}-${generatedOtp}`,
        prescription: hasRxItem ? {
          id: `rx-auto-${Date.now()}`,
          patientName: customerName,
          patientPhone: customerPhone,
          notes: 'Prescription uploaded during checkout.',
          uploadedAt: 'Today',
          isChronicCondition: false,
          isEncrypted: true,
        } : undefined,
      };

      onPlaceOrder(newOrder);
      onClearCart();
      setIsSubmittingOrder(false);
      setIsCartDrawerOpen(false);
      setActiveTab('orders');
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }, 700);
  };

  // Handle Tab Switch
  const handleTabChange = (tab: CustomerTab) => {
    setActiveTab(tab);
    if (tab === 'cart') {
      setIsCartDrawerOpen(true);
    } else if (tab === 'favorites') {
      setIsFavoritesOpen(true);
    } else if (tab === 'account') {
      onOpenAuth('profile');
    }
  };

  return (
    <div 
      className="min-h-screen bg-white text-neutral-900 w-full max-w-full box-border pb-24 overflow-x-hidden select-none"
      dir={isRtl ? 'rtl' : 'ltr'}
      id="customer-home-container"
    >
      {/* 1. Mobile Header: Logo on start, Bell + Menu on end */}
      <MobileHeader
        language={language}
        onLanguageChange={onLanguageChange}
        selectedCountry={selectedCountry}
        onCountryChange={onCountryChange}
        userProfile={userProfile}
        notifications={notifications}
        onOpenNotifications={onOpenNotifications}
        onOpenAuth={() => onOpenAuth('profile')}
        onLogout={onLogout}
        currentRole={currentRole}
        onRoleChange={onRoleChange}
        onOpenLegal={onOpenLegal}
        onOpenHealthTests={onOpenHealthTests}
      />

      {/* Main Viewport Container */}
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto px-3 sm:px-4 pt-3.5 space-y-4">
        {/* If Active Tab is 'orders', show OrdersHub */}
        {activeTab === 'orders' ? (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h2 className="text-lg font-extrabold text-[#0E7A4B] flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-[#0E7A4B]" />
                <span>{isRtl ? 'طلباتي وتتبع الشحنات' : 'My Orders & Tracking'}</span>
              </h2>
              <button
                onClick={() => setActiveTab('home')}
                className="text-xs font-bold text-[#0E7A4B] hover:underline"
              >
                {isRtl ? 'العودة للرئيسية' : 'Back to Home'}
              </button>
            </div>

            <OrdersHub
              orders={orders}
              onViewReceipt={onViewReceipt}
              onAdvanceStatus={onAdvanceStatus}
              onUpdateReview={onUpdateReview}
              onReportProblem={onReportProblem}
              onOpenQrVerification={onOpenQrVerification}
              onOpenReviewModal={onOpenReviewModal}
              onReorder={(pastOrder) => {
                pastOrder.items.forEach(item => onAddToCart(item.medicine));
                setIsCartDrawerOpen(true);
              }}
              language={language}
              selectedCountry={selectedCountry}
            />
          </div>
        ) : (
          /* Default Tab: Home Screen */
          <>
            {/* 2. Hero Section: Mint Card with Headline, Subtitle, and 3D Graphic */}
            <HeroBanner language={language} />

            {/* 3. Search Bar: Overlaps Bottom of Hero, Green Circular Action Button */}
            <SearchBar
              language={language}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              medicines={medicines}
              onAddToCart={onAddToCart}
              selectedCountry={selectedCountry}
              onOpenProductDetail={(med) => setSelectedMedicineForDetail(med)}
            />

            {/* 4. Quick Actions: 4 items in 1 single row on all mobile screens */}
            <QuickActions
              language={language}
              onOrderMedicine={() => {
                // If prescription required or direct order
                onOpenUploadRx();
              }}
              onTrackOrder={() => {
                setActiveTab('orders');
              }}
              onOpenPharmacies={() => {
                setIsPharmaciesModalOpen(true);
              }}
              onMedicineReminder={() => {
                onRoleChange('subscription');
              }}
            />

            {/* 5. Promotional Banner: 20% Off, DAWA20, Order Now, Product Render */}
            <PromotionalBanner
              language={language}
              onApplyCoupon={(code) => applyCouponCode(code)}
              onOrderNow={() => {
                // Scroll to popular products or open cart
                const target = document.getElementById('customer-popular-products-section');
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            />

            {/* 6. Popular Products Section: Title, "View All", 2-Column Grid */}
            <PopularProducts
              medicines={filteredMedicines}
              cartItems={cartItems}
              onAddToCart={onAddToCart}
              onUpdateQuantity={onUpdateQuantity}
              onToggleFavorite={toggleFavorite}
              favorites={favorites}
              language={language}
              selectedCountry={selectedCountry}
              onViewAll={() => setIsAllCatalogOpen(true)}
              onSelectProduct={(med) => setSelectedMedicineForDetail(med)}
            />
          </>
        )}
      </div>

      {/* 7. Bottom Navigation: Fixed at bottom, 5 items in RTL order */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        cartCount={cartItemCount}
        activeOrderCount={activeOrdersCount}
        favoritesCount={favorites.length}
        language={language}
      />

      {/* Favorites Modal */}
      <FavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => {
          setIsFavoritesOpen(false);
          if (activeTab === 'favorites') setActiveTab('home');
        }}
        favorites={favorites}
        medicines={medicines}
        onAddToCart={onAddToCart}
        onRemoveFavorite={toggleFavorite}
        language={language}
        selectedCountry={selectedCountry}
      />

      {/* Nearby Pharmacies Modal */}
      {isPharmaciesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-neutral-100 animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-[#F8FAF9]">
              <h3 className="font-bold text-neutral-900 text-sm sm:text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0E7A4B]" />
                <span>{isRtl ? 'الصيدليات المرخصة المعتمدة' : 'Verified Partner Pharmacies'}</span>
              </h3>
              <button
                onClick={() => setIsPharmaciesModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-xl hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              <NearbyPharmacies
                pharmacies={SAMPLE_PHARMACIES}
                selectedPharmacyId={selectedPharmacyId}
                onSelectPharmacy={(id) => {
                  setSelectedPharmacyId(id);
                  setIsPharmaciesModalOpen(false);
                }}
                language={language}
                selectedCountry={selectedCountry}
              />
            </div>
          </div>
        </div>
      )}

      {/* All Products / Catalog Full View Modal */}
      {isAllCatalogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-neutral-100 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-[#F8FAF9]">
              <div>
                <h3 className="font-bold text-neutral-900 text-base">
                  {isRtl ? 'كتالوج الأدوية الشامل' : 'Comprehensive Medicine Catalog'}
                </h3>
                <p className="text-[11px] text-neutral-500">
                  {filteredMedicines.length} {isRtl ? 'دواء معتمد متوفر' : 'approved medicines available'}
                </p>
              </div>

              <button
                onClick={() => setIsAllCatalogOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-xl hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="px-4 py-2.5 border-b border-neutral-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {categoryFilters.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#0E7A4B] text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Medicines Grid */}
            <div className="p-4 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredMedicines.map((medicine) => {
                const cartItem = cartItems.find(i => i.medicine.id === medicine.id);
                return (
                  <div key={medicine.id} className="bg-neutral-50/60 rounded-2xl p-3 border border-neutral-200/70 flex flex-col justify-between">
                    <div>
                      <div className="w-full h-20 flex items-center justify-center mb-2">
                        {medicine.imageUrl ? (
                          <img src={medicine.imageUrl} alt={medicine.name} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-[#E8F5EE] text-[#0E7A4B] flex items-center justify-center font-bold text-xs">Rx</div>
                        )}
                      </div>
                      <h5 className="font-bold text-xs text-neutral-900 line-clamp-1">{medicine.name}</h5>
                      <p className="text-[10px] text-neutral-500 line-clamp-1">{medicine.dosage}</p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-neutral-200/50 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#0E7A4B]">
                        {formatCurrency(medicine.priceUSD, selectedCountry, language)}
                      </span>
                      <button
                        onClick={() => onAddToCart(medicine)}
                        className="w-7 h-7 rounded-full bg-[#0E7A4B] text-white flex items-center justify-center hover:bg-[#0B6B43] active:scale-90"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer / Slide-over Modal */}
      {isCartDrawerOpen && (
        <div className="fixed inset-0 z-50 flex" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={() => setIsCartDrawerOpen(false)} />

          <div className={`relative ${isRtl ? 'mr-auto' : 'ml-auto'} w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in ${isRtl ? 'slide-in-from-left' : 'slide-in-from-right'} duration-200`}>
            {/* Drawer Header */}
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-[#F8FAF9]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E8F5EE] text-[#0E7A4B] flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-sm">
                    {isRtl ? 'سلة الأدوية والمنتجات' : 'Your Medical Cart'}
                  </h3>
                  <p className="text-[10px] text-neutral-500">
                    {cartItemCount} {isRtl ? 'عنصر' : 'items'}
                  </p>
                </div>
              </div>

              <button onClick={() => setIsCartDrawerOpen(false)} className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-xl hover:bg-neutral-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {cartItems.length === 0 ? (
                <div className="py-16 text-center text-neutral-400 space-y-3">
                  <ShoppingBag className="w-12 h-12 mx-auto text-neutral-200" />
                  <p className="text-xs font-semibold">{isRtl ? 'السلة فارغة حالياً' : 'Your cart is empty'}</p>
                  <button
                    onClick={() => setIsCartDrawerOpen(false)}
                    className="px-4 py-2 bg-[#0E7A4B] text-white rounded-xl text-xs font-bold hover:bg-[#0B6B43]"
                  >
                    {isRtl ? 'تصفح الأدوية' : 'Browse Medicines'}
                  </button>
                </div>
              ) : (
                <>
                  {cartItems.map((item) => (
                    <div key={item.medicine.id} className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-11 h-11 rounded-xl bg-white border border-neutral-200 p-1 flex items-center justify-center shrink-0">
                          {item.medicine.imageUrl ? (
                            <img src={item.medicine.imageUrl} alt={item.medicine.name} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-xs font-bold text-[#0E7A4B]">Rx</span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-xs text-neutral-900 truncate">{item.medicine.name}</h5>
                          <p className="text-[10px] text-neutral-500 truncate">{item.medicine.dosage}</p>
                          <span className="text-xs font-extrabold text-[#0E7A4B]">
                            {formatCurrency(item.medicine.priceUSD * item.quantity, selectedCountry, language)}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-neutral-200 shrink-0">
                        <button
                          onClick={() => onUpdateQuantity(item.medicine.id, -1)}
                          className="w-5 h-5 rounded-lg text-neutral-600 hover:bg-neutral-100 flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-neutral-900 min-w-3 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.medicine.id, 1)}
                          className="w-5 h-5 rounded-lg text-neutral-600 hover:bg-neutral-100 flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Coupon Input */}
                  <div className="pt-2">
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (couponInput) applyCouponCode(couponInput);
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder={isRtl ? 'كود الخصم (مثلاً DAWA20)' : 'Coupon code (e.g. DAWA20)'}
                        className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#0E7A4B]"
                      />
                      <button
                        type="submit"
                        disabled={isValidatingCoupon}
                        className="px-3 py-2 bg-[#0E7A4B] text-white rounded-xl text-xs font-bold hover:bg-[#0B6B43] disabled:opacity-50"
                      >
                        {isValidatingCoupon ? '...' : (isRtl ? 'تطبيق' : 'Apply')}
                      </button>
                    </form>

                    {couponSuccess && (
                      <p className="text-[11px] text-emerald-600 font-bold mt-1">{couponSuccess}</p>
                    )}
                    {couponError && (
                      <p className="text-[11px] text-red-500 font-bold mt-1">{couponError}</p>
                    )}
                    {appliedCoupon && (
                      <div className="mt-1 flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 p-2 rounded-xl border border-emerald-200">
                        <span>{isRtl ? `كوبون مطبق: ${appliedCoupon.code}` : `Applied: ${appliedCoupon.code}`}</span>
                        <button onClick={() => setAppliedCoupon(null)} className="text-red-500 font-bold text-xs">
                          {isRtl ? 'إزالة' : 'Remove'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="pt-3 border-t border-neutral-200 space-y-1.5 text-xs text-neutral-600">
                    <div className="flex justify-between">
                      <span>{isRtl ? 'المجموع الفرعي' : 'Subtotal'}</span>
                      <span>{formatCurrency(cartSubtotalUSD, selectedCountry, language)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>{isRtl ? 'رسوم التوصيل المباشر' : 'Delivery Fee'}</span>
                      <span>{formatCurrency(deliveryFeeUSD, selectedCountry, language)}</span>
                    </div>

                    {hasColdChain && (
                      <div className="flex justify-between text-blue-700">
                        <span>{isRtl ? 'رسوم سلسلة التبريد المعتمدة' : 'Cold-Chain Monitoring'}</span>
                        <span>{formatCurrency(coldChainFeeUSD, selectedCountry, language)}</span>
                      </div>
                    )}

                    {discountUSD > 0 && (
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>{isRtl ? 'الخصم المطبق' : 'Discount Applied'}</span>
                        <span>-{formatCurrency(discountUSD, selectedCountry, language)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm font-extrabold text-neutral-900 pt-2 border-t border-neutral-200">
                      <span>{isRtl ? 'الإجمالي النهائي' : 'Total'}</span>
                      <span className="text-[#0E7A4B]">{formatCurrency(totalAmountUSD, selectedCountry, language)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Checkout Action */}
            {cartItems.length > 0 && (
              <div className="p-4 border-t border-neutral-100 bg-[#F8FAF9]">
                <button
                  onClick={handleCheckoutSubmit}
                  disabled={isSubmittingOrder}
                  className="w-full py-3 bg-[#0E7A4B] hover:bg-[#0B6B43] active:scale-98 text-white rounded-2xl font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  id="cart-checkout-btn"
                >
                  {isSubmittingOrder ? (
                    <span>{isRtl ? 'جارٍ تأكيد الطلب...' : 'Confirming Order...'}</span>
                  ) : (
                    <>
                      <span>{isRtl ? 'تأكيد وإتمام الطلب' : 'Complete Order'}</span>
                      <span>({formatCurrency(totalAmountUSD, selectedCountry, language)})</span>
                      {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
