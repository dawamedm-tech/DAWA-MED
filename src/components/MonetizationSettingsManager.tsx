import React, { useState, useEffect } from 'react';
import { 
  Language, 
  CountryConfig, 
  AuthUser,
  MonetizationSettings,
  PharmacySubscriptionPlan,
  CouponCode,
  PaymentGatewayConfig
} from '../types';
import { 
  Sliders, 
  Save, 
  RotateCcw, 
  Percent, 
  Truck, 
  Sparkles, 
  Building2, 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Tag, 
  CreditCard, 
  Smartphone,
  ChevronRight,
  Info,
  DollarSign,
  HelpCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { SAMPLE_PHARMACIES } from '../data/mockData';

interface MonetizationSettingsManagerProps {
  language: Language;
  selectedCountry: CountryConfig;
  currentUser?: AuthUser;
  onSaved?: (settings: MonetizationSettings) => void;
}

export const MonetizationSettingsManager: React.FC<MonetizationSettingsManagerProps> = ({
  language,
  selectedCountry,
  currentUser,
  onSaved
}) => {
  const isAr = language === 'ar';

  const [activeSubTab, setActiveSubTab] = useState<
    'commissions' | 'delivery' | 'patient_subs' | 'pharmacy_plans' | 'future_streams' | 'coupons' | 'gateways'
  >('commissions');

  const [settings, setSettings] = useState<MonetizationSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Coupon modal / form state
  const [showAddCouponModal, setShowAddCouponModal] = useState<boolean>(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDesc, setNewCouponDesc] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState<number>(10);
  const [newCouponMinOrder, setNewCouponMinOrder] = useState<number>(10);
  const [newCouponMaxDiscount, setNewCouponMaxDiscount] = useState<number>(5);

  // New Custom Pharmacy Commission state
  const [newOverridePharmacyId, setNewOverridePharmacyId] = useState<string>(SAMPLE_PHARMACIES[0]?.id || 'pharma-01');
  const [newOverrideRate, setNewOverrideRate] = useState<number>(10);

  // Fetch settings from server
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/monetization/settings');
      if (res.ok) {
        const json = await res.json();
        if (json.settings) {
          setSettings(json.settings);
        }
      }
    } catch (err) {
      console.error('Failed to load monetization settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save updated settings to server
  const handleSaveSettings = async () => {
    if (!settings) return;
    try {
      setIsSaving(true);
      const res = await fetch('/api/admin/monetization/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        const json = await res.json();
        if (json.settings) {
          setSettings(json.settings);
          if (onSaved) onSaved(json.settings);
        }
        setSaveStatus({
          type: 'success',
          message: isAr ? 'تم حفظ وتطبيق إعدادات التسعير والعمولات بنجاح.' : 'Monetization and pricing rules saved and deployed successfully.'
        });
        setTimeout(() => setSaveStatus(null), 4000);
      } else {
        setSaveStatus({
          type: 'error',
          message: isAr ? 'فشل حفظ الإعدادات، يرجى المحاولة لاحقاً.' : 'Failed to save settings. Please check your permissions.'
        });
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setSaveStatus({
        type: 'error',
        message: 'A network error occurred.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Add Coupon Handler
  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !newCouponCode.trim()) return;

    const newCoupon: CouponCode = {
      id: `coup-${Date.now()}`,
      code: newCouponCode.trim().toUpperCase(),
      description: newCouponDesc || `${newCouponValue}${newCouponType === 'percentage' ? '%' : '$'} promotional discount`,
      descriptionAr: newCouponDesc || `خصم ترويجي بقيمة ${newCouponValue}${newCouponType === 'percentage' ? '%' : '$'}`,
      discountType: newCouponType,
      discountValue: newCouponValue,
      minOrderUSD: newCouponMinOrder,
      maxDiscountUSD: newCouponType === 'percentage' ? newCouponMaxDiscount : undefined,
      usageLimit: 1000,
      usedCount: 0,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true
    };

    setSettings({
      ...settings,
      coupons: [newCoupon, ...settings.coupons]
    });

    setShowAddCouponModal(false);
    setNewCouponCode('');
    setNewCouponDesc('');
  };

  // Remove Coupon Handler
  const handleRemoveCoupon = (couponId: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      coupons: settings.coupons.filter(c => c.id !== couponId)
    });
  };

  // Add/Update Custom Commission Handler
  const handleAddCustomCommission = () => {
    if (!settings) return;
    setSettings({
      ...settings,
      pharmacyCustomCommissions: {
        ...settings.pharmacyCustomCommissions,
        [newOverridePharmacyId]: newOverrideRate
      }
    });
  };

  // Remove Custom Commission Handler
  const handleRemoveCustomCommission = (pharmacyId: string) => {
    if (!settings) return;
    const updated = { ...settings.pharmacyCustomCommissions };
    delete updated[pharmacyId];
    setSettings({
      ...settings,
      pharmacyCustomCommissions: updated
    });
  };

  if (isLoading || !settings) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-[#D8E2DC] text-center">
        <div className="w-8 h-8 border-3 border-[#2D6A4F] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-bold text-gray-600">{isAr ? 'جاري تحميل إعدادات تحقيق الدخل...' : 'Loading monetization settings...'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="monetization-settings-manager">
      {/* Save Status Banner */}
      {saveStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl flex items-center justify-between border shadow-sm ${
            saveStatus.type === 'success'
              ? 'bg-[#D8F3DC] border-[#74C69D] text-[#1B4332]'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-3">
            {saveStatus.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className="text-sm font-bold">{saveStatus.message}</span>
          </div>
        </motion.div>
      )}

      {/* Header Container */}
      <div className="bg-white rounded-3xl p-6 border border-[#D8E2DC] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#D8F3DC] text-[#2D6A4F]">
              {isAr ? 'إدارة التسعير والعمولات' : 'Dynamic Pricing & Commission Engine'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1B4332]">
            {isAr ? 'إعدادات تحقيق الدخل وقواعد التسعير' : 'Monetization & Revenue Settings'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {isAr
              ? 'تعديل نسب عمولات الصيدليات، رسوم التوصيل، باقات الاشتراكات، والكوبونات الترويجية بدون تعديل الكود البرمجي.'
              : 'Control pharmacy commission rates, delivery fee parameters, subscription prices, and coupons in real-time.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSettings}
            className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            {isAr ? 'استعادة الإعدادات' : 'Reset'}
          </button>

          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-2xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
            id="save-monetization-btn"
          >
            <Save className="w-4 h-4" />
            {isSaving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ وتطبيق التغييرات' : 'Save & Deploy Rules')}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveSubTab('commissions')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'commissions' ? 'bg-[#1B4332] text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200 hover:text-gray-900'
          }`}
        >
          <Percent className="w-4 h-4" />
          {isAr ? 'عمولات الصيدليات' : '1. Pharmacy Commissions'}
        </button>

        <button
          onClick={() => setActiveSubTab('delivery')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'delivery' ? 'bg-[#1B4332] text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200 hover:text-gray-900'
          }`}
        >
          <Truck className="w-4 h-4" />
          {isAr ? 'رسوم التوصيل واللوجستيات' : '2. Delivery Pricing Engine'}
        </button>

        <button
          onClick={() => setActiveSubTab('patient_subs')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'patient_subs' ? 'bg-[#1B4332] text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200 hover:text-gray-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          {isAr ? 'اشتراك DAWA MED الشهري ($5)' : '3. DAWA MED MONTHLY ($5)'}
        </button>

        <button
          onClick={() => setActiveSubTab('pharmacy_plans')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'pharmacy_plans' ? 'bg-[#1B4332] text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200 hover:text-gray-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          {isAr ? 'باقات اشتراكات الصيدليات' : '4. Pharmacy SaaS Tiers'}
        </button>

        <button
          onClick={() => setActiveSubTab('coupons')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'coupons' ? 'bg-[#1B4332] text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200 hover:text-gray-900'
          }`}
        >
          <Tag className="w-4 h-4" />
          {isAr ? 'الكوبونات والعروض' : 'Coupons & Promos'}
        </button>

        <button
          onClick={() => setActiveSubTab('future_streams')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'future_streams' ? 'bg-[#1B4332] text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4" />
          {isAr ? 'المصادر الإضافية والمستقبلية' : 'Future Income Streams'}
        </button>

        <button
          onClick={() => setActiveSubTab('gateways')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'gateways' ? 'bg-[#1B4332] text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200 hover:text-gray-900'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          {isAr ? 'بوابات الدفع ومحافظ الهاتف' : 'Payment Gateways'}
        </button>
      </div>

      {/* Tab 1: Pharmacy Commission Settings */}
      {activeSubTab === 'commissions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Default Platform Commission */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-[#D8E2DC] shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-[#1B4332]">
              <Percent className="w-5 h-5 text-[#2D6A4F]" />
              <h3 className="text-base font-black">{isAr ? 'نسبة العمولة الافتراضية' : 'Default Platform Commission'}</h3>
            </div>
            <p className="text-xs text-gray-500">
              {isAr
                ? 'تُطبق هذه النسبة تلقائياً على كل صيدلية جديدة ما لم يتم تخصيص نسبة خاصة لها أدناه.'
                : 'Applied automatically to all orders unless an individual pharmacy override is active.'}
            </p>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {isAr ? 'نسبة العمولة العامة (%)' : 'Default Commission Rate (%)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={settings.minCommissionRate}
                  max={settings.maxCommissionRate}
                  step="0.5"
                  value={settings.defaultPharmacyCommissionRate}
                  onChange={(e) => setSettings({
                    ...settings,
                    defaultPharmacyCommissionRate: parseFloat(e.target.value) || 0
                  })}
                  className="w-full px-4 py-2.5 text-base font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2D6A4F]"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-500">%</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
              <span className="font-bold block">{isAr ? 'قاعدة الأمان المالي:' : 'Financial Integrity Guardrail:'}</span>
              <p>{isAr ? 'يتم احتساب العمولات خادومياً فقط فور تأكيد وتوصيل الطلب لمنع أي تلاعب.' : 'Calculated strictly server-side upon verified order fulfillment.'}</p>
            </div>
          </div>

          {/* Custom Per-Pharmacy Overrides */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#D8E2DC] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#1B4332]">{isAr ? 'استثناءات العمولات المخصصة لكل صيدلية' : 'Custom Pharmacy Commission Overrides'}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{isAr ? 'تحديد نسب تفاوضية خاصة للسلاسل الكبرى أو المستشفيات' : 'Special negotiated rates for hospital networks or enterprise partners'}</p>
              </div>
            </div>

            {/* Add Custom Override Input */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full">
                <label className="text-[11px] font-bold text-gray-500 block mb-1">{isAr ? 'اختر الصيدلية:' : 'Select Pharmacy:'}</label>
                <select
                  value={newOverridePharmacyId}
                  onChange={(e) => setNewOverridePharmacyId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-[#2D6A4F]"
                >
                  {SAMPLE_PHARMACIES.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-32">
                <label className="text-[11px] font-bold text-gray-500 block mb-1">{isAr ? 'النسبة (%):' : 'Rate (%):'}</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={newOverrideRate}
                  onChange={(e) => setNewOverrideRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-bold bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#2D6A4F]"
                />
              </div>

              <div className="w-full sm:w-auto pt-4 sm:pt-4">
                <button
                  type="button"
                  onClick={handleAddCustomCommission}
                  className="w-full sm:w-auto px-4 py-2 bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {isAr ? 'إضافة استثناء' : 'Add Rate'}
                </button>
              </div>
            </div>

            {/* Overrides List */}
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
              {Object.keys(settings.pharmacyCustomCommissions).length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400">
                  {isAr ? 'لا توجد استثناءات مخصصة حالياً. جميع الصيدليات تخضع للنسبة الافتراضية.' : 'No custom overrides active. All pharmacies use standard platform rate.'}
                </div>
              ) : (
                Object.entries(settings.pharmacyCustomCommissions).map(([pharmaId, rate]) => {
                  const pharma = SAMPLE_PHARMACIES.find(p => p.id === pharmaId);
                  return (
                    <div key={pharmaId} className="p-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors">
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">{pharma ? pharma.name : pharmaId}</span>
                        <span className="text-[10px] text-gray-400">{pharmaId}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-[#D8F3DC] text-[#2D6A4F] font-mono text-xs font-black rounded-lg border border-[#74C69D]">
                          {rate}%
                        </span>
                        <button
                          onClick={() => handleRemoveCustomCommission(pharmaId)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Remove override"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Delivery Pricing Settings */}
      {activeSubTab === 'delivery' && (
        <div className="bg-white rounded-3xl p-6 border border-[#D8E2DC] shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-black text-[#1B4332] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#2D6A4F]" />
              {isAr ? 'محرك تسعير رسوم التوصيل واللوجستيات' : 'Logistics & Delivery Pricing Engine'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {isAr ? 'يتم احتساب تكلفة التوصيل وفقاً للمسافة ونوع الخدمة (عادية أو سريعة) والمدينة ونسبة السائقين.' : 'Configurable delivery formula: Base Fee + (Km * Rate) * City Multiplier + Express Surcharge.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {isAr ? 'رسوم التوصيل الأساسية ($ USD)' : 'Base Delivery Fee ($ USD)'}
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={settings.baseDeliveryFeeUSD}
                onChange={(e) => setSettings({ ...settings, baseDeliveryFeeUSD: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-sm font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2D6A4F]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {isAr ? 'سعر الكيلومتر ($ USD / km)' : 'Per-Km Rate ($ USD / km)'}
              </label>
              <input
                type="number"
                min="0"
                step="0.05"
                value={settings.perKmRateUSD}
                onChange={(e) => setSettings({ ...settings, perKmRateUSD: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-sm font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2D6A4F]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {isAr ? 'رسوم التوصيل الفوري السريع ($ USD)' : 'Express Priority Surcharge ($ USD)'}
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={settings.expressDeliveryFeeUSD}
                onChange={(e) => setSettings({ ...settings, expressDeliveryFeeUSD: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-sm font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2D6A4F]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {isAr ? 'حد الطلب للتوصيل المجاني ($ USD)' : 'Free Delivery Order Threshold ($ USD)'}
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={settings.freeDeliveryThresholdUSD}
                onChange={(e) => setSettings({ ...settings, freeDeliveryThresholdUSD: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-sm font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2D6A4F]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {isAr ? 'نسبة مستحقات السائق/المندوب (%)' : 'Driver Courier Payout Split (%)'}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={settings.driverPayoutPercentage}
                onChange={(e) => setSettings({ ...settings, driverPayoutPercentage: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-sm font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2D6A4F]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {isAr ? 'رسوم الخدمة الرقمية الثابتة ($ USD)' : 'Digital Platform Service Fee ($ USD)'}
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={settings.serviceFeeUSD}
                onChange={(e) => setSettings({ ...settings, serviceFeeUSD: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-sm font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2D6A4F]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: DAWA MED MONTHLY Subscription */}
      {activeSubTab === 'patient_subs' && (
        <div className="bg-white rounded-3xl p-6 border border-[#D8E2DC] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-[#1B4332] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                {isAr ? 'اشتراك DAWA MED MONTHLY للمرضى' : 'DAWA MED MONTHLY Patient Subscription'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {isAr ? 'خدمة مخصصة لمرضى الأمراض المزمنة تضمن عدم نسيان أدويتهم وإعادة تعبئتها مع توصيل مجاني.' : 'Adherence and automatic refill service for chronic care patients.'}
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.dawaMonthlyIsActive}
                onChange={(e) => setSettings({ ...settings, dawaMonthlyIsActive: e.target.checked })}
                className="rounded text-[#2D6A4F] focus:ring-[#2D6A4F]"
              />
              <span className="text-xs font-bold text-gray-700">{isAr ? 'تفعيل الخدمة للمرضى' : 'Service Active in App'}</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {isAr ? 'سعر الاشتراك الشهري ($ USD / شهر)' : 'Monthly Subscription Price ($ USD / month)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={settings.dawaMonthlyPriceUSD}
                  onChange={(e) => setSettings({ ...settings, dawaMonthlyPriceUSD: parseFloat(e.target.value) || 5.0 })}
                  className="w-full px-4 py-2.5 text-base font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2D6A4F]"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-500">$ USD</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {isAr ? 'الأيام التجريبية المجانية' : 'Free Trial Days (0 for immediate charge)'}
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={settings.dawaMonthlyTrialDays}
                onChange={(e) => setSettings({ ...settings, dawaMonthlyTrialDays: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 text-base font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2D6A4F]"
              />
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-2">
            <span className="text-xs font-bold text-purple-900 block">{isAr ? 'ميزات الاشتراك المضمنة:' : 'Subscription Features Included:'}</span>
            <ul className="text-xs text-purple-800 space-y-1 list-disc list-inside">
              {(isAr ? settings.dawaMonthlyFeaturesAr : settings.dawaMonthlyFeatures).map((feat, idx) => (
                <li key={idx}>{feat}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab 4: Pharmacy Subscription Plans */}
      {activeSubTab === 'pharmacy_plans' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#D8E2DC] shadow-xs">
            <h3 className="text-base font-black text-[#1B4332] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#2D6A4F]" />
              {isAr ? 'باقات اشتراكات الصيدليات في المنصة (SaaS Tiers)' : 'Pharmacy SaaS Subscription Plans'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {isAr ? 'تتيح للصيدليات الترقية لباقات متقدمة للحصول على عمولات مخفضة وربط المخزون ERP وميزات متطورة.' : 'Configurable tiered SaaS plans offering reduced commissions, ERP inventory sync, and multi-staff accounts.'}
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              {settings.pharmacyPlans.map((plan, idx) => (
                <div key={plan.id} className="bg-white rounded-3xl p-5 border border-[#D8E2DC] shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-base font-black text-[#1B4332]">{isAr ? plan.nameAr : plan.name}</h4>
                        <span className="text-[11px] text-gray-400 uppercase tracking-wider">{plan.id}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={plan.isActive}
                          onChange={(e) => {
                            const updatedPlans = [...settings.pharmacyPlans];
                            updatedPlans[idx].isActive = e.target.checked;
                            setSettings({ ...settings, pharmacyPlans: updatedPlans });
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2D6A4F]" />
                      </label>
                    </div>

                    <div className="mt-4">
                      <label className="text-[11px] font-bold text-gray-500 block mb-1">{isAr ? 'السعر الشهري ($ USD):' : 'Monthly Price ($ USD):'}</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={plan.priceUSD}
                        onChange={(e) => {
                          const updatedPlans = [...settings.pharmacyPlans];
                          updatedPlans[idx].priceUSD = parseFloat(e.target.value) || 0;
                          setSettings({ ...settings, pharmacyPlans: updatedPlans });
                        }}
                        className="w-full px-3 py-1.5 text-sm font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2D6A4F]"
                      />
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <span className="text-[11px] font-bold text-gray-500 block mb-2">{isAr ? 'الميزات المضمنة:' : 'Features:'}</span>
                      <ul className="space-y-1.5 text-xs text-gray-600">
                        {(isAr ? plan.featuresAr : plan.features).map((f, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Coupons & Promo Codes */}
      {activeSubTab === 'coupons' && (
        <div className="bg-white rounded-3xl p-6 border border-[#D8E2DC] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-[#1B4332] flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#2D6A4F]" />
                {isAr ? 'إدارة كوبونات الخصم والعروض الترويجية' : 'Coupon Codes & Discount Engine'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {isAr ? 'إنشاء أكواد خصم بنسبة مئوية أو قيمة ثابتة مع التحقق الصارم خادومياً.' : 'Create promotional codes validated server-side to prevent tampering.'}
              </p>
            </div>

            <button
              onClick={() => setShowAddCouponModal(true)}
              className="px-4 py-2 bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {isAr ? 'إنشاء كود خصم جديد' : 'New Coupon'}
            </button>
          </div>

          {/* Coupons Table */}
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
            {settings.coupons.map((coupon) => (
              <div key={coupon.id} className="p-4 flex items-center justify-between hover:bg-gray-50/80 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 font-mono font-black text-xs rounded-xl">
                    {coupon.code}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">{isAr ? coupon.descriptionAr : coupon.description}</span>
                    <span className="text-[11px] text-gray-400">
                      {isAr ? `الحد الأدنى للطلب: $${coupon.minOrderUSD} | تم الاستخدام: ${coupon.usedCount} مرة` : `Min order: $${coupon.minOrderUSD} | Used: ${coupon.usedCount} times`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-[#1B4332]">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `$${coupon.discountValue} OFF`}
                  </span>
                  <button
                    onClick={() => handleRemoveCoupon(coupon.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Future Extensible Streams */}
      {activeSubTab === 'future_streams' && (
        <div className="bg-white rounded-3xl p-6 border border-[#D8E2DC] shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-black text-[#1B4332] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#2D6A4F]" />
              {isAr ? 'مصادر الدخل المستقبلية المجهزة مسبقاً' : 'Future Income Streams & Expansion Modules'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {isAr ? 'ميزات وتراخيص جاهزة معمارياً لتفعيلها فور التوسع في الأسواق الإفريقية.' : 'Pre-architected revenue channels that can be enabled with a single click.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Express Delivery */}
            <div className="p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-900 block">{isAr ? 'التوصيل الفوري السريع (Express Delivery)' : 'Express Priority Surcharge'}</span>
                <span className="text-[11px] text-gray-400">{isAr ? 'رسوم إضافية $3.00 للطلبات العاجلة خلال 45 دقيقة' : '+$3.00 surcharge for priority 45-minute dispatch'}</span>
              </div>
              <input
                type="checkbox"
                checked={settings.expressDeliveryEnabled}
                onChange={(e) => setSettings({ ...settings, expressDeliveryEnabled: e.target.checked })}
                className="rounded text-[#2D6A4F] focus:ring-[#2D6A4F]"
              />
            </div>

            {/* Family Care Plan */}
            <div className="p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-900 block">{isAr ? 'باقة الرعاية العائلية ($9.99/شهر)' : 'Family Care Multi-Profile ($9.99/mo)'}</span>
                <span className="text-[11px] text-gray-400">{isAr ? 'حتى 6 أفراد مع تنبيهات مشتركة للأدوية وتوصيل موحد' : 'Up to 6 family members with combined refill delivery'}</span>
              </div>
              <input
                type="checkbox"
                checked={settings.familyPlanEnabled}
                onChange={(e) => setSettings({ ...settings, familyPlanEnabled: e.target.checked })}
                className="rounded text-[#2D6A4F] focus:ring-[#2D6A4F]"
              />
            </div>

            {/* Pharmacy Analytics Addon */}
            <div className="p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-900 block">{isAr ? 'تحليلات الصيدليات المتقدمة ($15/شهر)' : 'Pharmacy BI Analytics Addon ($15/mo)'}</span>
                <span className="text-[11px] text-gray-400">{isAr ? 'تقارير الطلب والتنبؤ بالأدوية الراكدة والأكثر مبيعاً' : 'Demand forecasting and slow-moving drug analytics'}</span>
              </div>
              <input
                type="checkbox"
                checked={settings.pharmacyAnalyticsEnabled}
                onChange={(e) => setSettings({ ...settings, pharmacyAnalyticsEnabled: e.target.checked })}
                className="rounded text-[#2D6A4F] focus:ring-[#2D6A4F]"
              />
            </div>

            {/* Corporate Health Plans */}
            <div className="p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-900 block">{isAr ? 'خطط الشركات والتأمين الصحي ($49/شهر)' : 'DAWA Corporate & Employee Health ($49/mo)'}</span>
                <span className="text-[11px] text-gray-400">{isAr ? 'تغطية الأدوية الشهرية لموظفي الشركات الشريكة' : 'Automated chronic prescription benefits for staff'}</span>
              </div>
              <input
                type="checkbox"
                checked={settings.businessCorporateEnabled}
                onChange={(e) => setSettings({ ...settings, businessCorporateEnabled: e.target.checked })}
                className="rounded text-[#2D6A4F] focus:ring-[#2D6A4F]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Payment Gateways */}
      {activeSubTab === 'gateways' && (
        <div className="bg-white rounded-3xl p-6 border border-[#D8E2DC] shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-black text-[#1B4332] flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#2D6A4F]" />
              {isAr ? 'بوابات الدفع الإلكتروني ومحافظ الهاتف الإفريقية' : 'African Mobile Money & Card Gateways'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {isAr ? 'تكامل مع M-Pesa, MTN MoMo, Airtel Money, و Paystack مع تأمين كامل عبر التوكنات.' : 'Tokenized routing with zero stored raw card data (PCI-DSS Compliant).'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings.paymentGateways.map((gw, idx) => (
              <div key={gw.id} className="p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-900 block">{isAr ? gw.nameAr : gw.name}</span>
                  <span className="text-[11px] text-gray-400">
                    {isAr ? `الدول: ${gw.supportedCountries.join(', ')} | رسوم البوابة: ${gw.feePercentage}%` : `Countries: ${gw.supportedCountries.join(', ')} | Switch Fee: ${gw.feePercentage}%`}
                  </span>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gw.isActive}
                    onChange={(e) => {
                      const updatedGateways = [...settings.paymentGateways];
                      updatedGateways[idx].isActive = e.target.checked;
                      setSettings({ ...settings, paymentGateways: updatedGateways });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2D6A4F]" />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Coupon Modal */}
      {showAddCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#D8E2DC] shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#1B4332]">
                {isAr ? 'إنشاء كود خصم ترويجي' : 'Create New Promo Coupon'}
              </h3>
              <button
                onClick={() => setShowAddCouponModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  {isAr ? 'كود الخصم (e.g. HEALTH20)' : 'Coupon Code (e.g. HEALTH20)'}
                </label>
                <input
                  type="text"
                  required
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 text-xs font-mono font-bold uppercase bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2D6A4F]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  {isAr ? 'الوصف' : 'Description'}
                </label>
                <input
                  type="text"
                  value={newCouponDesc}
                  onChange={(e) => setNewCouponDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2D6A4F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    {isAr ? 'نوع الخصم' : 'Discount Type'}
                  </label>
                  <select
                    value={newCouponType}
                    onChange={(e) => setNewCouponType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2D6A4F]"
                  >
                    <option value="percentage">{isAr ? 'نسبة مئوية (%)' : 'Percentage (%)'}</option>
                    <option value="fixed_amount">{isAr ? 'مبلغ ثابت ($)' : 'Fixed Amount ($)'}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    {isAr ? 'قيمة الخصم' : 'Discount Value'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newCouponValue}
                    onChange={(e) => setNewCouponValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2D6A4F]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddCouponModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold transition-colors"
                >
                  {isAr ? 'إنشاء الكود' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
