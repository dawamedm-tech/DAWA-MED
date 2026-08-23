import React, { useState, useMemo } from 'react';
import { 
  Medicine, 
  OrderItem, 
  Order, 
  Language, 
  CountryConfig, 
  MedicineCategory, 
  PrescriptionData,
  OrderStatus,
  OrderReview,
  UserProfile
} from '../types';
import { TRANSLATIONS } from '../data/translations';
import { SAMPLE_PHARMACIES } from '../data/mockData';
import { NearbyPharmacies } from './NearbyPharmacies';
import { OrdersHub } from './OrdersHub';
import { 
  Search, 
  Plus, 
  Minus, 
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
  Sparkles,
  Zap,
  PhoneCall,
  QrCode,
  Check,
  Building2,
  X,
  MessageCircle,
  Pill,
  HeartPulse,
  Sparkle,
  Bandage,
  Sparkles as CleanIcon,
  Layers,
  Info,
  PackageCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface CustomerViewProps {
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
  selectedCountry: CountryConfig;
  isLiteMode: boolean;
  onToggleLiteMode: () => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({
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
  selectedCountry,
  isLiteMode,
  onToggleLiteMode,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'catalog' | 'orders' | 'whatsapp'>('catalog');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Checkout form fields
  const [customerName, setCustomerName] = useState(userProfile?.name || 'Grace Muthoni');
  const [customerPhone, setCustomerPhone] = useState(userProfile?.phone || '+254 712 345 678');
  const [deliveryAddress, setDeliveryAddress] = useState(userProfile?.streetAddress || 'House 14B, Ole Odume Road, Kilimani');
  const [deliveryCity, setDeliveryCity] = useState(userProfile?.city || selectedCountry.sampleCity);
  const [paymentMethod, setPaymentMethod] = useState(selectedCountry.mobileMoneyProviders[0]);
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);

  // WhatsApp Assistant Simulation state
  const [whatsappChat, setWhatsappChat] = useState([
    { sender: 'bot', text: `Hello ${customerName}! Welcome to DAWA MED ${selectedCountry.name} Automated Health Assistant. Send medicine names, upload a prescription photo, or check your active order status here.` }
  ]);
  const [whatsappMsgInput, setWhatsappMsgInput] = useState('');

  // Explicit Categories requested in Section 2:
  // Medicines (All), Pain Relief, Vitamins, Chronic Care, First Aid, Personal Care, Other Categories
  const categoryFilters = [
    { id: 'all', label: t.allCategories, icon: <Layers className="w-4 h-4" /> },
    { id: 'pain_fever', label: t.catPain, icon: <HeartPulse className="w-4 h-4" /> },
    { id: 'vitamins', label: t.catVitamins, icon: <Sparkle className="w-4 h-4" /> },
    { id: 'chronic', label: t.catChronic, icon: <Pill className="w-4 h-4" /> },
    { id: 'first_aid', label: t.catFirstAid, icon: <Bandage className="w-4 h-4" /> },
    { id: 'personal_care', label: t.catPersonalCare, icon: <CleanIcon className="w-4 h-4" /> },
    { id: 'antibiotics', label: t.catAntibiotics, icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'respiratory', label: t.catRespiratory, icon: <HeartPulse className="w-4 h-4" /> },
    { id: 'gastro', label: t.catGastro, icon: <Pill className="w-4 h-4" /> },
  ];

  // Filtered medicines
  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) => {
      const matchesSearch = 
        med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.indications.some((ind) => ind.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || med.category === selectedCategory;
      const matchesPharmacy = !selectedPharmacyId || med.availablePharmacyIds?.includes(selectedPharmacyId);

      return matchesSearch && matchesCat && matchesPharmacy;
    });
  }, [medicines, searchQuery, selectedCategory, selectedPharmacyId]);

  // Cart Calculations
  const cartSubtotalUSD = cartItems.reduce(
    (acc, item) => acc + item.medicine.priceUSD * item.quantity,
    0
  );
  const hasColdChain = cartItems.some((item) => item.medicine.requiresColdChain);
  const hasRxItem = cartItems.some((item) => item.medicine.requiresPrescription);
  const coldChainFeeUSD = hasColdChain ? 1.50 : 0;
  const deliveryFeeUSD = 1.80;
  const serviceFeeUSD = 0.50;
  const discountUSD = 0.00;
  const totalAmountUSD = cartSubtotalUSD + coldChainFeeUSD + deliveryFeeUSD + serviceFeeUSD - discountUSD;

  const toLocal = (usdAmount: number) => {
    return (usdAmount * selectedCountry.exchangeRateToUSD).toFixed(0);
  };

  const handleCheckout = (e: React.FormEvent) => {
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
        deliveryFee: deliveryFeeUSD,
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
        estimatedDeliveryMinutes: 25,
        deliveryOtp: generatedOtp,
        qrCodeSignature: `DAWA-SEC-VERIFY-${selectedCountry.code}-${newOrderId}-${generatedOtp}`,
        prescription: hasRxItem ? {
          id: `rx-auto-${Date.now()}`,
          patientName: customerName,
          patientPhone: customerPhone,
          notes: 'Prescription uploaded during fast checkout.',
          uploadedAt: 'Today',
          isChronicCondition: false,
          isEncrypted: true,
        } : undefined,
      };

      onPlaceOrder(newOrder);
      onClearCart();
      setIsSubmittingOrder(false);
      setIsCartOpen(false);
      setOrderSuccessId(newOrderId);
      setSelectedTab('orders');
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }, 700);
  };

  const handleReorderFromPast = (pastOrder: Order) => {
    pastOrder.items.forEach((item) => {
      onAddToCart(item.medicine);
    });
    setIsCartOpen(true);
  };

  const handleSendWhatsappMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsappMsgInput.trim()) return;

    const userText = whatsappMsgInput;
    setWhatsappChat((prev) => [...prev, { sender: 'user', text: userText }]);
    setWhatsappMsgInput('');

    setTimeout(() => {
      let botResponse = `Thank you! DAWA MED assistant received: "${userText}". Our pharmacist at GoodLife Pharmacy is ready to verify your medication or prescription.`;
      if (userText.toLowerCase().includes('status') || userText.toLowerCase().includes('order')) {
        botResponse = `Your active order #DM-KE-8492 is currently Out for Delivery with Rider Kofi. ETA is 14 minutes. Handover PIN: 7492.`;
      } else if (userText.toLowerCase().includes('amox') || userText.toLowerCase().includes('antibiotic')) {
        botResponse = `Amoxicillin 625mg is available in stock (KSh 624). Prescription is required by PPB Kenya. Would you like to upload your prescription photo here?`;
      }
      setWhatsappChat((prev) => [...prev, { sender: 'bot', text: botResponse }]);
    }, 800);
  };

  return (
    <div className="space-y-6" id="dawa-customer-main-view">
      {/* Top Banner: Navigation between Medicine Catalog, My Orders, and WhatsApp Quick Bot */}
      <div className="bg-white rounded-3xl p-3 sm:p-4 border border-[#D8E2DC] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedTab('catalog')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
              selectedTab === 'catalog'
                ? 'bg-[#2D6A4F] text-white shadow-xs'
                : 'text-[#1B4332] hover:bg-[#F0F7F4]'
            }`}
            id="tab-btn-catalog"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t.catMedicines} & Catalog</span>
          </button>

          <button
            onClick={() => setSelectedTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
              selectedTab === 'orders'
                ? 'bg-[#2D6A4F] text-white shadow-xs'
                : 'text-[#1B4332] hover:bg-[#F0F7F4]'
            }`}
            id="tab-btn-orders"
          >
            <PackageCheck className="w-4 h-4" />
            <span>{t.orders}</span>
            {orders.filter((o) => o.status !== 'delivered').length > 0 && (
              <span className="px-1.5 py-0.2 bg-[#D8F3DC] text-[#1B4332] text-[10px] font-black rounded-full">
                {orders.filter((o) => o.status !== 'delivered').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setSelectedTab('whatsapp')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
              selectedTab === 'whatsapp'
                ? 'bg-[#25D366] text-white shadow-xs'
                : 'text-[#1B4332] hover:bg-[#F0F7F4]'
            }`}
            id="tab-btn-whatsapp"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{t.openInWhatsApp}</span>
          </button>
        </div>

        {/* Action Button: Upload Prescription */}
        <button
          onClick={onOpenUploadRx}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-linear-to-r from-[#2D6A4F] to-[#1B4332] hover:from-[#1B4332] hover:to-[#0F281E] text-white text-xs font-black rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
          id="hero-upload-rx-btn"
        >
          <FileText className="w-4 h-4 text-[#74C69D]" />
          <span>{t.uploadRxBtn}</span>
        </button>
      </div>

      {/* Main Tab Views */}
      {selectedTab === 'catalog' && (
        <div className="space-y-6">
          {/* Search & Location Bar */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#D8E2DC] shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-gray-400">
                  <Search className="w-4 h-4 text-[#2D6A4F]" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full ps-11 pe-4 py-3 bg-[#F8FAF9] border border-[#D8E2DC] rounded-2xl text-xs sm:text-sm font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none placeholder:text-gray-400"
                  id="main-medicine-search-input"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 end-0 pe-4 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Upload Prescription direct button */}
              <button
                onClick={onOpenUploadRx}
                className="w-full md:w-auto px-5 py-3 bg-[#F0F7F4] hover:bg-[#D8F3DC] text-[#2D6A4F] border border-[#74C69D] rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shrink-0"
                id="search-upload-rx-pill-btn"
              >
                <FileText className="w-4 h-4 text-[#2D6A4F]" />
                <span>{t.uploadRxBtn}</span>
              </button>
            </div>

            {/* Non-diagnostic Legal Disclaimer / Banner */}
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#F8FAF9] border border-[#D8E2DC] text-[11px] text-[#1B4332]">
              <Info className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
              <p className="leading-snug">
                <strong className="text-[#2D6A4F]">Medical Notice: </strong>
                {t.noDiagnosisWarning} {t.licenseDisclaimer}
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
              {categoryFilters.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#2D6A4F] text-white shadow-xs'
                        : 'bg-[#F8FAF9] text-[#1B4332] border border-[#D8E2DC] hover:bg-white'
                    }`}
                    id={`cat-filter-${cat.id}`}
                  >
                    {cat.icon}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Nearby Licensed Pharmacies */}
          <NearbyPharmacies
            pharmacies={SAMPLE_PHARMACIES}
            selectedPharmacyId={selectedPharmacyId}
            onSelectPharmacy={setSelectedPharmacyId}
            language={language}
            selectedCountry={selectedCountry}
          />

          {/* Section: Medicine Catalog Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#1B4332]">
                  {selectedCategory === 'all' ? t.allCategories : categoryFilters.find(c => c.id === selectedCategory)?.label}
                </h3>
                <p className="text-xs text-gray-500">
                  Showing {filteredMedicines.length} verified medicines in {selectedCountry.name}
                </p>
              </div>

              {cartItems.length > 0 && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-2xl text-xs font-black shadow-md transition-all active:scale-95"
                  id="catalog-view-cart-btn"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t.cart} ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})</span>
                </button>
              )}
            </div>

            {filteredMedicines.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#D8E2DC] text-gray-400">
                <Pill className="w-10 h-10 mx-auto mb-2 opacity-40 text-[#2D6A4F]" />
                <p className="text-xs font-semibold">No medicines found matching your search criteria.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedPharmacyId(null); }}
                  className="mt-3 text-xs font-bold text-[#2D6A4F] underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredMedicines.map((med) => {
                  const cartItem = cartItems.find((i) => i.medicine.id === med.id);
                  const priceLocal = toLocal(med.priceUSD);

                  return (
                    <div
                      key={med.id}
                      className="bg-white rounded-3xl p-5 border border-[#D8E2DC] shadow-xs hover:border-[#74C69D] hover:shadow-md transition-all flex flex-col justify-between"
                      id={`med-card-${med.id}`}
                    >
                      <div>
                        {/* Badges Row */}
                        <div className="flex flex-wrap items-center justify-between gap-1 mb-2.5">
                          {med.requiresPrescription ? (
                            <span className="text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                              <FileText className="w-3 h-3 text-amber-600" />
                              <span>{t.rxRequired}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-black bg-green-50 text-green-800 border border-green-200 px-2 py-0.5 rounded-lg">
                              {t.otcAvailable}
                            </span>
                          )}

                          {med.requiresColdChain && (
                            <span className="text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                              <ThermometerSnowflake className="w-3 h-3 text-blue-600" />
                              <span>2-8°C Cold-Chain</span>
                            </span>
                          )}
                        </div>

                        {/* Medicine Title & Generic info */}
                        <h4 className="text-xs sm:text-sm font-black text-[#1B4332] line-clamp-2 mb-1">
                          {med.name}
                        </h4>
                        <p className="text-[11px] text-[#52B788] font-bold mb-1">
                          {med.genericName}
                        </p>

                        {/* Dosage & Packaging */}
                        <div className="text-[11px] text-gray-500 space-y-0.5 mb-3">
                          <p><span className="font-semibold text-gray-700">Form:</span> {med.dosage} ({med.form})</p>
                          <p><span className="font-semibold text-gray-700">Pack:</span> {med.packageSize}</p>
                        </div>

                        {/* Description */}
                        <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed mb-3">
                          {language === 'ar' ? med.descriptionAr : language === 'sw' ? med.descriptionSw : med.descriptionEn}
                        </p>
                      </div>

                      {/* Pricing & Add to Cart */}
                      <div className="pt-3 border-t border-[#D8E2DC]">
                        <div className="flex items-baseline justify-between mb-3">
                          <div>
                            <span className="text-base sm:text-lg font-black text-[#1B4332]">
                              {selectedCountry.currencySymbol} {priceLocal}
                            </span>
                            <span className="text-[10px] text-gray-400 ms-1">
                              (${med.priceUSD.toFixed(2)})
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-[#52B788]">
                            ✓ {t.inStock}
                          </span>
                        </div>

                        {/* Quantity / Add Button */}
                        {cartItem ? (
                          <div className="flex items-center justify-between bg-[#F0F7F4] border border-[#74C69D] rounded-2xl p-1">
                            <button
                              onClick={() => onUpdateQuantity(med.id, -1)}
                              className="w-8 h-8 rounded-xl bg-white text-[#1B4332] flex items-center justify-center font-bold hover:bg-gray-100 shadow-xs active:scale-95"
                              id={`qty-minus-${med.id}`}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-black text-[#1B4332]">
                              {cartItem.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(med.id, 1)}
                              className="w-8 h-8 rounded-xl bg-[#2D6A4F] text-white flex items-center justify-center font-bold hover:bg-[#1B4332] shadow-xs active:scale-95"
                              id={`qty-plus-${med.id}`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => onAddToCart(med)}
                            className="w-full py-2.5 px-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-black rounded-2xl transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                            id={`add-to-cart-${med.id}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{t.addToCart}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orders Hub Tab */}
      {selectedTab === 'orders' && (
        <OrdersHub
          orders={orders}
          onReorder={handleReorderFromPast}
          onViewReceipt={onViewReceipt}
          onAdvanceStatus={onAdvanceStatus}
          onUpdateReview={onUpdateReview}
          onReportProblem={onReportProblem}
          onOpenQrVerification={onOpenQrVerification}
          onOpenReviewModal={onOpenReviewModal}
          language={language}
          selectedCountry={selectedCountry}
        />
      )}

      {/* WhatsApp Support Tab */}
      {selectedTab === 'whatsapp' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#D8E2DC] shadow-xs max-w-2xl mx-auto" id="whatsapp-bot-container">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-xs">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#1B4332]">
                DAWA MED WhatsApp Ordering & Support
              </h3>
              <p className="text-xs text-gray-500">
                Official verified channel: <span className="font-bold text-[#1B4332]">{selectedCountry.whatsappSupportNumber || '+254700000384'}</span>
              </p>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="bg-[#EFEAE2] rounded-2xl p-4 min-h-[280px] max-h-[360px] overflow-y-auto space-y-3">
            {whatsappChat.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#DCF8C6] text-[#1B4332] rounded-tr-xs'
                      : 'bg-white text-gray-800 rounded-tl-xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendWhatsappMsg} className="flex gap-2 mt-4">
            <input
              type="text"
              value={whatsappMsgInput}
              onChange={(e) => setWhatsappMsgInput(e.target.value)}
              placeholder="Type message or paste prescription notes..."
              className="flex-1 px-4 py-2.5 bg-[#F8FAF9] border border-[#D8E2DC] rounded-2xl text-xs font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#25D366] focus:outline-none"
              id="whatsapp-chat-input"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold rounded-2xl shadow-xs transition-colors"
              id="whatsapp-send-btn"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Cart & Checkout Drawer Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs" id="cart-drawer-overlay">
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl flex flex-col justify-between"
            id="cart-drawer-panel"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#D8E2DC] bg-[#1B4332] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-[#74C69D]" />
                <div>
                  <h3 className="text-sm sm:text-base font-black">{t.orderSummary}</h3>
                  <p className="text-[11px] text-[#D8F3DC]">
                    {cartItems.length} {cartItems.length === 1 ? 'medication' : 'medications'} selected
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                id="cart-drawer-close-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Items & Form */}
            <div className="p-5 space-y-6 flex-1 overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-40 text-[#2D6A4F]" />
                  <p className="text-xs font-bold">Your cart is empty.</p>
                </div>
              ) : (
                <>
                  {/* Item List */}
                  <div className="divide-y divide-gray-100 space-y-2">
                    {cartItems.map((item) => (
                      <div key={item.medicine.id} className="pt-2 flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-black text-[#1B4332] truncate">
                            {item.medicine.name}
                          </h4>
                          <p className="text-[11px] text-gray-500">
                            {item.medicine.packageSize} • {selectedCountry.currencySymbol} {toLocal(item.medicine.priceUSD)}
                          </p>
                          {item.medicine.requiresPrescription && (
                            <span className="inline-block text-[9px] font-black bg-amber-50 text-amber-800 px-1.5 py-0.2 rounded-md mt-0.5">
                              Rx Required
                            </span>
                          )}
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-1.5 bg-[#F0F7F4] border border-[#D8E2DC] rounded-xl p-1">
                          <button
                            onClick={() => onUpdateQuantity(item.medicine.id, -1)}
                            className="w-6 h-6 rounded-lg bg-white text-[#1B4332] flex items-center justify-center font-bold text-xs hover:bg-gray-100 shadow-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-black text-[#1B4332] px-1">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.medicine.id, 1)}
                            className="w-6 h-6 rounded-lg bg-[#2D6A4F] text-white flex items-center justify-center font-bold text-xs hover:bg-[#1B4332] shadow-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Checkout Information Form */}
                  <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4 pt-4 border-t border-[#D8E2DC]">
                    <h4 className="text-xs font-black text-[#1B4332] uppercase tracking-wider">
                      {t.deliveryLocation}
                    </h4>

                    <div>
                      <label className="block text-xs font-bold text-[#1B4332] mb-1">
                        {t.patientFullName}
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-xs font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-[#1B4332] mb-1">
                          {t.patientPhoneLabel}
                        </label>
                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-xs font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#1B4332] mb-1">
                          {t.cityArea}
                        </label>
                        <input
                          type="text"
                          required
                          value={deliveryCity}
                          onChange={(e) => setDeliveryCity(e.target.value)}
                          className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-xs font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1B4332] mb-1">
                        {t.streetAddress}
                      </label>
                      <input
                        type="text"
                        required
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Street, Landmark, Apartment number"
                        className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-xs font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                      />
                    </div>

                    {/* Payment Method Selector */}
                    <div>
                      <label className="block text-xs font-bold text-[#1B4332] mb-1">
                        {t.selectPayment}
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-xs font-bold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                      >
                        {selectedCountry.mobileMoneyProviders.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    {/* WhatsApp notification toggle */}
                    <div className="flex items-center gap-2 p-3 bg-[#F0F7F4] border border-[#D8E2DC] rounded-2xl">
                      <input
                        type="checkbox"
                        id="whatsapp-updates-opt"
                        checked={whatsappUpdates}
                        onChange={(e) => setWhatsappUpdates(e.target.checked)}
                        className="rounded border-[#D8E2DC] text-[#2D6A4F] focus:ring-[#2D6A4F]"
                      />
                      <label htmlFor="whatsapp-updates-opt" className="text-[11px] font-bold text-[#1B4332] cursor-pointer">
                        {t.whatsappNotificationOpt}
                      </label>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="bg-[#F8FAF9] p-4 rounded-2xl border border-[#D8E2DC] space-y-2 text-xs">
                      <div className="flex justify-between text-gray-600">
                        <span>{t.medicineSubtotal}</span>
                        <span className="font-bold">{selectedCountry.currencySymbol} {toLocal(cartSubtotalUSD)}</span>
                      </div>

                      {hasColdChain && (
                        <div className="flex justify-between text-blue-700 font-semibold">
                          <span className="flex items-center gap-1">
                            <ThermometerSnowflake className="w-3 h-3" />
                            <span>{t.coldChainFee}</span>
                          </span>
                          <span>{selectedCountry.currencySymbol} {toLocal(coldChainFeeUSD)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-gray-600">
                        <span>{t.deliveryFee}</span>
                        <span className="font-bold">{selectedCountry.currencySymbol} {toLocal(deliveryFeeUSD)}</span>
                      </div>

                      <div className="flex justify-between text-gray-600">
                        <span>{t.serviceFee}</span>
                        <span className="font-bold">{selectedCountry.currencySymbol} {toLocal(serviceFeeUSD)}</span>
                      </div>

                      <div className="pt-2 border-t border-[#D8E2DC] flex justify-between text-sm font-black text-[#1B4332]">
                        <span>{t.totalPayable}</span>
                        <span className="text-base text-[#2D6A4F]">
                          {selectedCountry.currencySymbol} {toLocal(totalAmountUSD)}
                        </span>
                      </div>
                    </div>
                  </form>
                </>
              )}
            </div>

            {/* Drawer Footer Actions */}
            {cartItems.length > 0 && (
              <div className="p-5 border-t border-[#D8E2DC] bg-[#F8FAF9]">
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmittingOrder}
                  className="w-full py-3.5 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-black rounded-2xl text-xs sm:text-sm transition-all shadow-md shadow-[#2D6A4F]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  id="cart-submit-order-btn"
                >
                  {isSubmittingOrder ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin text-[#74C69D]" />
                      <span>Connecting to Licensed Pharmacy...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#74C69D]" />
                      <span>{t.placeOrderBtn} ({selectedCountry.currencySymbol} {toLocal(totalAmountUSD)})</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};
