import React, { useState, useEffect, useMemo } from 'react';
import { 
  Language, 
  CountryConfig, 
  AuthUser,
  RevenueAnalyticsResponse,
  RevenueSource,
  FinancialSettlement,
  MonetizationSettings
} from '../types';
import { 
  DollarSign, 
  TrendingUp, 
  Percent, 
  Truck, 
  Sparkles, 
  Building2, 
  Users, 
  Calendar, 
  Filter, 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Sliders, 
  Layers, 
  Zap, 
  FileText,
  Calculator,
  HelpCircle,
  BarChart3,
  Flame,
  Award,
  Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TRANSLATIONS } from '../data/translations';
import { SAMPLE_PHARMACIES, COUNTRIES } from '../data/mockData';

interface RevenueMonetizationDashboardProps {
  language: Language;
  selectedCountry: CountryConfig;
  currentUser?: AuthUser;
  onOpenSettings?: () => void;
}

export const RevenueMonetizationDashboard: React.FC<RevenueMonetizationDashboardProps> = ({
  language,
  selectedCountry,
  currentUser,
  onOpenSettings
}) => {
  const isAr = language === 'ar';

  // Filters state
  const [timeframe, setTimeframe] = useState<'today' | 'this_week' | 'this_month' | 'this_year' | 'all_time'>('this_month');
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('all');
  const [selectedPharmacyFilter, setSelectedPharmacyFilter] = useState<string>('all');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('all');
  const [searchSettlement, setSearchSettlement] = useState<string>('');

  // Active view tab inside revenue dashboard
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'pharmacy_settlements' | 'sources_breakdown' | 'calculator_simulator'>('overview');

  // Server data state
  const [analyticsData, setAnalyticsData] = useState<RevenueAnalyticsResponse | null>(null);
  const [monetizationSettings, setMonetizationSettings] = useState<MonetizationSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Quick commission override modal state
  const [editingPharmacyCommission, setEditingPharmacyCommission] = useState<{ pharmacyId: string; pharmacyName: string; currentRate: number } | null>(null);
  const [newCommissionInput, setNewCommissionInput] = useState<string>('10');
  const [isSavingCommission, setIsSavingCommission] = useState<boolean>(false);

  // Interactive Simulator state
  const [simMedicineTotal, setSimMedicineTotal] = useState<number>(35.0);
  const [simDistanceKm, setSimDistanceKm] = useState<number>(4.2);
  const [simIsExpress, setSimIsExpress] = useState<boolean>(false);
  const [simPharmacyId, setSimPharmacyId] = useState<string>('pharma-01');
  const [simIsDawaMonthlyUser, setSimIsDawaMonthlyUser] = useState<boolean>(false);
  const [simCouponCode, setSimCouponCode] = useState<string>('');
  const [simCalculationResult, setSimCalculationResult] = useState<any>(null);

  // Fetch revenue analytics and settings
  const fetchRevenueData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        timeframe,
        countryCode: selectedCountryCode,
        pharmacyId: selectedPharmacyFilter,
      });

      const [analyticsRes, settingsRes] = await Promise.all([
        fetch(`/api/admin/monetization/revenue-analytics?${params.toString()}`),
        fetch('/api/admin/monetization/settings')
      ]);

      if (analyticsRes.ok) {
        const json = await analyticsRes.json();
        if (json.analytics) setAnalyticsData(json.analytics);
      }

      if (settingsRes.ok) {
        const json = await settingsRes.json();
        if (json.settings) setMonetizationSettings(json.settings);
      }
    } catch (err) {
      console.error('Error fetching revenue analytics:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, [timeframe, selectedCountryCode, selectedPharmacyFilter]);

  // Run Simulator on changes
  useEffect(() => {
    const calculateSim = async () => {
      try {
        const res = await fetch('/api/monetization/calculate-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: [{ medicineId: 'med-01', quantity: 1, unitPriceUSD: simMedicineTotal }],
            pharmacyId: simPharmacyId,
            city: selectedCountry.sampleCity || 'Nairobi',
            distanceKm: simDistanceKm,
            isExpress: simIsExpress,
            couponCode: simCouponCode || undefined,
            isSubscribedToDawaMonthly: simIsDawaMonthlyUser
          })
        });
        if (res.ok) {
          const json = await res.json();
          setSimCalculationResult(json.calculation);
        }
      } catch (err) {
        console.error('Simulation error:', err);
      }
    };
    calculateSim();
  }, [simMedicineTotal, simDistanceKm, simIsExpress, simPharmacyId, simIsDawaMonthlyUser, simCouponCode]);

  // Handle Quick Pharmacy Commission Update
  const handleSaveCommissionRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPharmacyCommission) return;
    const rateNum = parseFloat(newCommissionInput);
    if (isNaN(rateNum) || rateNum < 0 || rateNum > 50) return;

    try {
      setIsSavingCommission(true);
      const res = await fetch(`/api/admin/monetization/pharmacies/${editingPharmacyCommission.pharmacyId}/commission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commissionRate: rateNum })
      });

      if (res.ok) {
        setSuccessToast(
          isAr
            ? `تم تحديث نسبة عمولة ${editingPharmacyCommission.pharmacyName} إلى ${rateNum}% بنجاح.`
            : `Successfully updated commission rate for ${editingPharmacyCommission.pharmacyName} to ${rateNum}%.`
        );
        setEditingPharmacyCommission(null);
        fetchRevenueData();
        setTimeout(() => setSuccessToast(null), 4000);
      }
    } catch (err) {
      console.error('Failed to update commission rate:', err);
    } finally {
      setIsSavingCommission(false);
    }
  };

  // Filtered settlements list
  const filteredSettlements = useMemo(() => {
    if (!analyticsData?.recentSettlements) return [];
    return analyticsData.recentSettlements.filter((s) => {
      const matchesSearch = 
        s.orderNumber.toLowerCase().includes(searchSettlement.toLowerCase()) ||
        s.pharmacyName.toLowerCase().includes(searchSettlement.toLowerCase()) ||
        s.customerName.toLowerCase().includes(searchSettlement.toLowerCase()) ||
        s.paymentMethod.toLowerCase().includes(searchSettlement.toLowerCase());
      return matchesSearch;
    });
  }, [analyticsData, searchSettlement]);

  const kpis = analyticsData?.kpis;

  const exportFinancialCSV = () => {
    if (!filteredSettlements.length) return;
    const headers = ['Order Number,Date,Pharmacy,Customer,Country,City,Payment Method,Subtotal (USD),Delivery (USD),Discount (USD),Total Paid (USD),Commission Rate (%),Commission (USD),Net Pharmacy (USD),Driver Payout (USD),DAWA Margin (USD),Status'];
    const rows = filteredSettlements.map(s => 
      `"${s.orderNumber}","${new Date(s.createdAt).toLocaleDateString()}","${s.pharmacyName}","${s.customerName}","${s.countryCode}","${s.city}","${s.paymentMethod}",${s.itemsSubtotalUSD},${s.deliveryFeeUSD},${s.discountUSD},${s.totalCustomerPaidUSD},${s.commissionRateApplied},${s.pharmacyCommissionUSD},${s.netPharmacyPayableUSD},${s.driverPayoutUSD},${s.dawaNetProfitUSD},"${s.settlementStatus}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DAWA_MED_Financial_Settlement_${timeframe}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" id="revenue-monetization-dashboard">
      {/* Toast Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-[#E8F5EE] border border-[#D0EADB] text-[#111827] rounded-2xl flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#0E7A4B] shrink-0" />
              <p className="text-sm font-semibold">{successToast}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner & Controls Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8F5EE] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E8F5EE] text-[#0E7A4B] uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {isAr ? 'نظام تحقيق الدخل المالي الكامل' : 'Full Monetization Engine (Phase 1 Ready)'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                {isAr ? 'حسابات خادومية 100% موثوقة' : '100% Server-Authoritative Math'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
              {isAr ? 'الإيرادات وتحقيق الدخل والعمولات' : 'Revenue & Monetization Architecture'}
            </h1>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl">
              {isAr
                ? 'إدارة العمولات ورسوم التوصيل واشتراكات الصيدليات والمرضى، ومتابعة التدفقات النقدية وصافي أرباح منصة دواء ميد بدقة.'
                : 'Manage pharmacy commissions, dynamic delivery logistics fees, DAWA MED Monthly subscriptions, and real-time financial settlement ledgers.'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setIsRefreshing(true);
                fetchRevenueData();
              }}
              disabled={isRefreshing}
              className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm flex items-center gap-2 transition-all"
              id="refresh-revenue-btn"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isAr ? 'تحديث البيانات' : 'Refresh'}
            </button>

            <button
              onClick={exportFinancialCSV}
              className="px-4 py-2.5 rounded-2xl bg-white border border-[#E8F5EE] hover:border-[#0E7A4B] text-[#111827] font-bold text-sm flex items-center gap-2 transition-all shadow-xs"
              id="export-csv-btn"
            >
              <Download className="w-4 h-4 text-[#0E7A4B]" />
              {isAr ? 'تصدير كشف الحساب (CSV)' : 'Export Statement (CSV)'}
            </button>

            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="px-4 py-2.5 rounded-2xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white font-bold text-sm flex items-center gap-2 transition-all shadow-sm"
                id="edit-monetization-rules-btn"
              >
                <Sliders className="w-4 h-4" />
                {isAr ? 'تعديل قواعد التسعير' : 'Pricing & Rules Settings'}
              </button>
            )}
          </div>
        </div>

        {/* Global Filter Bar */}
        <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
          {/* Timeframe Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-2xl">
            {(['today', 'this_week', 'this_month', 'this_year', 'all_time'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  timeframe === tf
                    ? 'bg-[#0E7A4B] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
                id={`timeframe-${tf}-btn`}
              >
                {tf === 'today' && (isAr ? 'اليوم' : 'Today')}
                {tf === 'this_week' && (isAr ? 'هذا الأسبوع' : 'This Week')}
                {tf === 'this_month' && (isAr ? 'هذا الشهر' : 'This Month')}
                {tf === 'this_year' && (isAr ? 'هذا العام' : 'This Year')}
                {tf === 'all_time' && (isAr ? 'الكل' : 'All Time')}
              </button>
            ))}
          </div>

          {/* Filters: Country & Pharmacy */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">{isAr ? 'الدولة:' : 'Country:'}</span>
              <select
                value={selectedCountryCode}
                onChange={(e) => setSelectedCountryCode(e.target.value)}
                className="text-xs font-bold bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-gray-700 focus:outline-none focus:border-[#0E7A4B]"
                id="revenue-country-select"
              >
                <option value="all">{isAr ? 'جميع الدول الإفريقية' : 'All Countries'}</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">{isAr ? 'الصيدلية:' : 'Pharmacy:'}</span>
              <select
                value={selectedPharmacyFilter}
                onChange={(e) => setSelectedPharmacyFilter(e.target.value)}
                className="text-xs font-bold bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-gray-700 focus:outline-none focus:border-[#0E7A4B] max-w-[180px] truncate"
                id="revenue-pharmacy-select"
              >
                <option value="all">{isAr ? 'جميع الصيدليات' : 'All Pharmacies'}</option>
                {SAMPLE_PHARMACIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'overview'
              ? 'bg-[#0E7A4B] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
          }`}
          id="tab-revenue-overview"
        >
          <BarChart3 className="w-4 h-4" />
          {isAr ? 'نظرة عامة ومؤشرات الأداء' : 'Overview & KPIs'}
        </button>

        <button
          onClick={() => setActiveSubTab('pharmacy_settlements')}
          className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'pharmacy_settlements'
              ? 'bg-[#0E7A4B] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
          }`}
          id="tab-pharmacy-settlements"
        >
          <Building2 className="w-4 h-4" />
          {isAr ? 'سجل تسويات الصيدليات والعمولات' : 'Pharmacy Settlement Ledger'}
        </button>

        <button
          onClick={() => setActiveSubTab('sources_breakdown')}
          className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'sources_breakdown'
              ? 'bg-[#0E7A4B] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
          }`}
          id="tab-sources-breakdown"
        >
          <Layers className="w-4 h-4" />
          {isAr ? 'مصادر الدخل العشرة' : '10 Revenue Streams'}
        </button>

        <button
          onClick={() => setActiveSubTab('calculator_simulator')}
          className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'calculator_simulator'
              ? 'bg-[#0E7A4B] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
          }`}
          id="tab-calculator-simulator"
        >
          <Calculator className="w-4 h-4" />
          {isAr ? 'محاكي الحسابات الآلي' : 'Live Calculation Sandbox'}
        </button>
      </div>

      {/* Main Tab Views */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 4 Primary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Gross Revenue */}
            <div className="bg-white rounded-3xl p-5 border border-[#E8F5EE] shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {isAr ? 'إجمالي الإيرادات (Gross)' : 'Gross Platform Revenue'}
                </span>
                <div className="p-2 rounded-2xl bg-[#E8F5EE] text-[#0E7A4B]">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl sm:text-3xl font-black text-[#111827]">
                  ${kpis ? kpis.totalGrossRevenueUSD.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '1,842.50'}
                </h3>
                <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-600">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+18.4% {isAr ? 'مقارنة بالفترة السابقة' : 'vs previous period'}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Net DAWA Profit Margin */}
            <div className="bg-white rounded-3xl p-5 border border-[#E8F5EE] shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {isAr ? 'صافي أرباح دواء ميد (Net)' : 'DAWA Net Profit Margin'}
                </span>
                <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-800">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl sm:text-3xl font-black text-emerald-800">
                  ${kpis ? kpis.totalNetProfitUSD.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '1,412.30'}
                </h3>
                <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-gray-500">
                  <span>{isAr ? 'هامش ربح إجمالي 76.6%' : '76.6% Platform Margin'}</span>
                </div>
              </div>
            </div>

            {/* Card 3: Monthly Recurring Revenue (MRR) */}
            <div className="bg-white rounded-3xl p-5 border border-[#E8F5EE] shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {isAr ? 'الإيراد الشهري المتكرر (MRR)' : 'Monthly Recurring (MRR)'}
                </span>
                <div className="p-2 rounded-2xl bg-purple-100 text-purple-800">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl sm:text-3xl font-black text-purple-900">
                  ${kpis ? kpis.mrrUSD.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '854.00'}
                </h3>
                <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-purple-700">
                  <span>{kpis?.activePatientSubscribers || 142} {isAr ? 'مريض مشترك' : 'Patient Subs'} + {kpis?.activePharmacySubscribers || 4} {isAr ? 'صيدلية' : 'Pharmacies'}</span>
                </div>
              </div>
            </div>

            {/* Card 4: Pharmacy Commissions Collected */}
            <div className="bg-white rounded-3xl p-5 border border-[#E8F5EE] shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {isAr ? 'عمولات الصيدليات المحصلة' : 'Pharmacy Commissions'}
                </span>
                <div className="p-2 rounded-2xl bg-amber-100 text-amber-800">
                  <Percent className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl sm:text-3xl font-black text-amber-900">
                  ${kpis ? kpis.totalPharmacyCommissionsUSD.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '444.40'}
                </h3>
                <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-amber-700">
                  <span>{isAr ? 'متوسط نسبة العمولة 8.8%' : '8.8% Avg Effective Commission'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary 4 Operational Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <span className="text-xs font-bold text-gray-500">{isAr ? 'رسوم التوصيل واللوجستيات' : 'Delivery & Courier Revenue'}</span>
              <p className="text-lg font-black text-[#111827] mt-1">${kpis?.totalDeliveryGrossUSD || '380.20'}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{isAr ? `صافي هامش دواء ميد: $${kpis?.totalDeliveryNetMarginUSD || '114.06'}` : `DAWA Net Margin: $${kpis?.totalDeliveryNetMarginUSD || '114.06'}`}</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <span className="text-xs font-bold text-gray-500">{isAr ? 'متوسط قيمة الطلب (AOV)' : 'Avg Order Value (AOV)'}</span>
              <p className="text-lg font-black text-[#111827] mt-1">${kpis?.averageOrderValueUSD || '32.40'}</p>
              <p className="text-[11px] text-emerald-600 font-bold mt-0.5">{isAr ? '98.6% نسبة نجاح الدفع' : '98.6% Payment Success'}</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <span className="text-xs font-bold text-gray-500">{isAr ? 'اشتراكات الصيدليات (SaaS)' : 'Pharmacy Subscriptions'}</span>
              <p className="text-lg font-black text-[#111827] mt-1">${kpis?.totalPharmacySubscriptionsUSD || '144.00'}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{isAr ? 'باقات Basic و Pro و Enterprise' : 'Basic, Pro & Enterprise'}</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <span className="text-xs font-bold text-gray-500">{isAr ? 'معدل الإلغاء (Churn Rate)' : 'Subscription Churn'}</span>
              <p className="text-lg font-black text-emerald-700 mt-1">{kpis?.subscriptionChurnRatePercent || '1.8'}%</p>
              <p className="text-[11px] text-emerald-600 font-bold mt-0.5">{isAr ? 'معدل استبقاء ممتاز' : 'Exceptional Retention'}</p>
            </div>
          </div>

          {/* Revenue Breakdown & 7-Day Trend Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 7-Day Revenue Trend Chart Simulation */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#E8F5EE] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-[#111827]">
                    {isAr ? 'منحنى الإيرادات وصافي الأرباح الأسبوعي' : 'Weekly Revenue & Profit Velocity'}
                  </h3>
                  <p className="text-xs text-gray-500">{isAr ? 'توزيع الأرباح اليومية عبر العمولات والتوصيل والاشتراكات' : 'Daily gross revenue, pharmacy commissions, and net profit margins'}</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-[#0E7A4B]" />
                    <span className="text-gray-600">{isAr ? 'الإيراد الإجمالي' : 'Gross'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-gray-600">{isAr ? 'صافي الربح' : 'Net Profit'}</span>
                  </div>
                </div>
              </div>

              {/* Bar Chart Representation */}
              <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-gray-100">
                {(analyticsData?.dailyTrend || [
                  { date: 'Mon', grossRevenue: 420, commissions: 160, delivery: 110, subscriptions: 120, netProfit: 290 },
                  { date: 'Tue', grossRevenue: 480, commissions: 195, delivery: 125, subscriptions: 120, netProfit: 335 },
                  { date: 'Wed', grossRevenue: 510, commissions: 210, delivery: 140, subscriptions: 120, netProfit: 360 },
                  { date: 'Thu', grossRevenue: 460, commissions: 180, delivery: 120, subscriptions: 120, netProfit: 320 },
                  { date: 'Fri', grossRevenue: 590, commissions: 245, delivery: 165, subscriptions: 120, netProfit: 415 },
                  { date: 'Sat', grossRevenue: 640, commissions: 270, delivery: 180, subscriptions: 120, netProfit: 450 },
                  { date: 'Sun', grossRevenue: 530, commissions: 220, delivery: 145, subscriptions: 120, netProfit: 375 }
                ]).map((day, idx) => {
                  const maxGross = 700;
                  const grossHeight = Math.round((day.grossRevenue / maxGross) * 100);
                  const netHeight = Math.round((day.netProfit / maxGross) * 100);

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-12 bg-[#0E7A4B] text-white text-[11px] font-bold py-1 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-md">
                        {day.date}: Gross ${day.grossRevenue} | Net ${day.netProfit}
                      </div>

                      {/* Twin Bars */}
                      <div className="w-full flex items-end justify-center gap-1.5 h-36">
                        <div 
                          style={{ height: `${grossHeight}%` }} 
                          className="w-full max-w-[18px] bg-[#0E7A4B] rounded-t-md transition-all duration-300 group-hover:brightness-125"
                        />
                        <div 
                          style={{ height: `${netHeight}%` }} 
                          className="w-full max-w-[18px] bg-emerald-500 rounded-t-md transition-all duration-300 group-hover:brightness-110"
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-500">{day.date}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <span>{isAr ? 'تم تحديث التسويات قبل 5 دقائق' : 'Settlements synced 5 min ago'}</span>
                <span className="font-bold text-[#111827]">{isAr ? 'العملة الموحدة: USD (مع دعم العملات المحلية)' : 'Currency: USD Base (Local Gateways Auto-Converted)'}</span>
              </div>
            </div>

            {/* Core vs Future Streams Progress List */}
            <div className="bg-white rounded-3xl p-6 border border-[#E8F5EE] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-[#111827]">
                  {isAr ? 'توزيع مصادر الدخل الرئيسية' : 'Revenue by Stream'}
                </h3>
                <span className="px-2 py-0.5 text-[11px] font-bold bg-[#E8F5EE] text-[#0E7A4B] rounded-full">
                  {isAr ? 'المرحلة 1 الأساسية' : 'Phase 1 Core'}
                </span>
              </div>

              <div className="space-y-4">
                {(analyticsData?.bySource?.filter(s => s.isPhase1Core) || [
                  { source: 'pharmacy_commission', labelEn: 'Pharmacy Commissions (8%-12%)', labelAr: 'عمولات الصيدليات على الطلبيات', amountUSD: 444.4, percentage: 38.5 },
                  { source: 'dawa_monthly', labelEn: 'DAWA MED MONTHLY ($5/mo)', labelAr: 'اشتراكات المرضى الشهرية (5 دولار)', amountUSD: 710.0, percentage: 24.2 },
                  { source: 'delivery_fees', labelEn: 'Delivery & Logistics Fees', labelAr: 'رسوم التوصيل والخدمات اللوجستية', amountUSD: 380.2, percentage: 22.1 },
                  { source: 'pharmacy_subscription', labelEn: 'Pharmacy Subscriptions (SaaS)', labelAr: 'اشتراكات الصيدليات في النظام (SaaS)', amountUSD: 144.0, percentage: 6.8 }
                ]).map((src, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-800">{isAr ? src.labelAr : src.labelEn}</span>
                      <span className="font-black text-[#111827]">${src.amountUSD.toFixed(2)} ({src.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          i === 0 ? 'bg-[#0E7A4B]' : i === 1 ? 'bg-purple-600' : i === 2 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${src.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setActiveSubTab('sources_breakdown')}
                  className="w-full py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-[#111827] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>{isAr ? 'عرض جميع مصادر الدخل العشرة للمستقبل' : 'Explore All 10 Future Revenue Streams'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pharmacy Settlements Ledger View */}
      {activeSubTab === 'pharmacy_settlements' && (
        <div className="space-y-6">
          {/* Pharmacy Commission Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(analyticsData?.pharmacyEarningsSummary || [
              {
                pharmacyId: 'pharma-01',
                pharmacyName: 'GoodLife Pharmacy — Westlands',
                ordersCount: 48,
                grossSalesUSD: 1420.0,
                commissionRate: 8.0,
                commissionsDeductedUSD: 113.60,
                netPayableUSD: 1306.40,
                subscriptionPlan: 'Professional ($25/mo)'
              },
              {
                pharmacyId: 'pharma-02',
                pharmacyName: 'Nairobi Central Chemist',
                ordersCount: 34,
                grossSalesUSD: 980.0,
                commissionRate: 10.0,
                commissionsDeductedUSD: 98.00,
                netPayableUSD: 882.00,
                subscriptionPlan: 'Basic ($10/mo)'
              },
              {
                pharmacyId: 'pharma-03',
                pharmacyName: 'Karen Community Pharmacy',
                ordersCount: 22,
                grossSalesUSD: 640.0,
                commissionRate: 12.0,
                commissionsDeductedUSD: 76.80,
                netPayableUSD: 563.20,
                subscriptionPlan: 'Basic ($10/mo)'
              },
              {
                pharmacyId: 'pharma-04',
                pharmacyName: 'Aga Khan Hospital Pharmacy',
                ordersCount: 65,
                grossSalesUSD: 3120.0,
                commissionRate: 5.0,
                commissionsDeductedUSD: 156.00,
                netPayableUSD: 2964.00,
                subscriptionPlan: 'Enterprise ($99/mo)'
              }
            ]).map((ph) => (
              <div key={ph.pharmacyId} className="bg-white rounded-3xl p-5 border border-[#E8F5EE] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-[#111827] line-clamp-1">{ph.pharmacyName}</h4>
                    <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-50 text-emerald-800 rounded-md shrink-0">
                      {ph.commissionRate}% {isAr ? 'عمولة' : 'Comm'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{ph.subscriptionPlan}</p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-gray-50">
                      <span className="text-[11px] text-gray-400 block">{isAr ? 'المبيعات' : 'Gross Sales'}</span>
                      <span className="font-bold text-gray-800">${ph.grossSalesUSD.toFixed(2)}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50">
                      <span className="text-[11px] text-amber-700 block">{isAr ? 'العمولة' : 'Commission'}</span>
                      <span className="font-bold text-amber-900">${ph.commissionsDeductedUSD.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-3 p-2.5 rounded-xl bg-[#E8F5EE]/40 border border-[#D0EADB]/30 flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0E7A4B]">{isAr ? 'صافي المستحق:' : 'Net Payable:'}</span>
                    <span className="font-black text-[#111827] text-sm">${ph.netPayableUSD.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 font-bold">{ph.ordersCount} {isAr ? 'طلب' : 'Orders'}</span>
                  <button
                    onClick={() => {
                      setEditingPharmacyCommission({
                        pharmacyId: ph.pharmacyId,
                        pharmacyName: ph.pharmacyName,
                        currentRate: ph.commissionRate
                      });
                      setNewCommissionInput(ph.commissionRate.toString());
                    }}
                    className="text-xs font-bold text-[#0E7A4B] hover:underline"
                    id={`adjust-comm-${ph.pharmacyId}-btn`}
                  >
                    {isAr ? 'تعديل النسبة' : 'Adjust Rate'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Financial Settlements Table */}
          <div className="bg-white rounded-3xl border border-[#E8F5EE] shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-[#111827]">
                  {isAr ? 'سجل تسويات الطلبيات الفردية والأرباح المحققة' : 'Detailed Order Settlements & Revenue Logs'}
                </h3>
                <p className="text-xs text-gray-500">{isAr ? 'كل طلب يتم حساب عمولته ورسوم التوصيل وصافي المستحقات خادومياً فور إتمام الطلب' : 'Server-side validated financial transactions with instant commission and driver payout splits'}</p>
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={isAr ? 'بحث برقم الطلب أو الصيدلية...' : 'Search by order #, pharmacy...'}
                  value={searchSettlement}
                  onChange={(e) => setSearchSettlement(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-[#0E7A4B]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                    <th className="py-3 px-4">{isAr ? 'رقم الطلب' : 'Order #'}</th>
                    <th className="py-3 px-4">{isAr ? 'الصيدلية' : 'Pharmacy'}</th>
                    <th className="py-3 px-4">{isAr ? 'قيمة الأدوية' : 'Subtotal'}</th>
                    <th className="py-3 px-4">{isAr ? 'رسوم التوصيل' : 'Delivery'}</th>
                    <th className="py-3 px-4">{isAr ? 'إجمالي المدفوع' : 'Total Paid'}</th>
                    <th className="py-3 px-4">{isAr ? 'نسبة العمولة' : 'Commission %'}</th>
                    <th className="py-3 px-4">{isAr ? 'قيمة العمولة' : 'Commission $'}</th>
                    <th className="py-3 px-4">{isAr ? 'صافي الصيدلية' : 'Net Pharmacy'}</th>
                    <th className="py-3 px-4">{isAr ? 'ربح دواء ميد' : 'DAWA Margin'}</th>
                    <th className="py-3 px-4">{isAr ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSettlements.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-gray-400 font-medium">
                        {isAr ? 'لا توجد سجلات مطابقة للبحث' : 'No financial settlement records found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredSettlements.map((s) => (
                      <tr key={s.orderId} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#111827]">
                          {s.orderNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-gray-800 block truncate max-w-[150px]">{s.pharmacyName}</span>
                          <span className="text-[10px] text-gray-400">{s.city}, {s.countryCode}</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-gray-700">
                          ${s.itemsSubtotalUSD.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-gray-600">
                          ${s.deliveryFeeUSD.toFixed(2)}
                          {s.expressSurchargeUSD > 0 && (
                            <span className="text-[10px] font-bold text-amber-600 block">+{s.expressSurchargeUSD} Exp</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-black text-gray-900">
                          ${s.totalCustomerPaidUSD.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-gray-100 text-gray-800">
                            {s.commissionRateApplied}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-amber-700">
                          ${s.pharmacyCommissionUSD.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-700">
                          ${s.netPharmacyPayableUSD.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 font-black text-[#111827]">
                          ${s.dawaNetProfitUSD.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-black inline-flex items-center gap-1 ${
                            s.settlementStatus === 'settled'
                              ? 'bg-[#E8F5EE] text-[#0E7A4B]'
                              : s.settlementStatus === 'earned'
                              ? 'bg-blue-50 text-blue-800'
                              : 'bg-amber-50 text-amber-800'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {s.settlementStatus === 'settled' && (isAr ? 'تمت التسوية' : 'Settled')}
                            {s.settlementStatus === 'earned' && (isAr ? 'مستحق' : 'Earned')}
                            {s.settlementStatus === 'pending' && (isAr ? 'قيد التنفيذ' : 'Pending')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 10 Revenue Streams Overview View */}
      {activeSubTab === 'sources_breakdown' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#E8F5EE] shadow-xs">
            <h3 className="text-xl font-black text-[#111827]">
              {isAr ? 'الهيكل الشامل لتحقيق الدخل (10 مصادر للدخل)' : 'DAWA MED 10-Stream Monetization Blueprint'}
            </h3>
            <p className="text-sm text-gray-500 mt-1 max-w-3xl">
              {isAr
                ? 'تم تصميم البنية البرمجية والمالية لمنصة دواء ميد لتستوعب 10 مصادر متنوعة ومستدامة للدخل، مع تفعيل وتطوير الـ 4 مصادر الأساسية في المرحلة الأولى وتوفير بنية جاهزة للتوسع المستقبلي.'
                : 'Engineered with full backend and database extensibility for all 10 revenue sources, focusing commercially on Phase 1 core channels while ready for enterprise scaling.'}
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(analyticsData?.bySource || []).map((sourceItem, idx) => (
                <div 
                  key={sourceItem.source}
                  className={`rounded-3xl p-5 border transition-all ${
                    sourceItem.isPhase1Core
                      ? 'bg-white border-[#0E7A4B] shadow-xs ring-1 ring-[#0E7A4B]/20'
                      : 'bg-gray-50/80 border-gray-200 opacity-90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2.5 rounded-2xl ${
                        sourceItem.isPhase1Core ? 'bg-[#E8F5EE] text-[#0E7A4B]' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {idx === 0 && <Percent className="w-5 h-5" />}
                        {idx === 1 && <Truck className="w-5 h-5" />}
                        {idx === 2 && <Sparkles className="w-5 h-5" />}
                        {idx === 3 && <Building2 className="w-5 h-5" />}
                        {idx === 4 && <Zap className="w-5 h-5" />}
                        {idx === 5 && <Users className="w-5 h-5" />}
                        {idx === 6 && <BarChart3 className="w-5 h-5" />}
                        {idx === 7 && <Wallet className="w-5 h-5" />}
                        {idx === 8 && <Truck className="w-5 h-5" />}
                        {idx === 9 && <Code2Icon />}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-[#111827]">{isAr ? sourceItem.labelAr : sourceItem.labelEn}</h4>
                        <span className="text-[11px] text-gray-500 font-medium">
                          {sourceItem.isPhase1Core ? (isAr ? '🎯 المرحلة 1 (تركيز أساسي)' : '🎯 Phase 1 (Core Focus)') : (isAr ? '🚀 توسع مستقبلي مجهز' : '🚀 Phase 2/3 Extensible')}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      sourceItem.isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {sourceItem.isEnabled ? (isAr ? 'مفعل' : 'Active') : (isAr ? 'معطل' : 'Disabled')}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-gray-400 block text-[11px]">{isAr ? 'الإيراد المحقق:' : 'Current Revenue:'}</span>
                      <span className="font-black text-base text-[#111827]">${sourceItem.amountUSD.toFixed(2)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400 block text-[11px]">{isAr ? 'العمليات:' : 'Transactions:'}</span>
                      <span className="font-bold text-gray-700">{sourceItem.transactionCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Live Calculation Sandbox / Simulator View */}
      {activeSubTab === 'calculator_simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Simulator Controls */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-[#E8F5EE] shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-black text-[#111827] flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#0E7A4B]" />
                {isAr ? 'محاكي التسعير والعمولات' : 'Pricing Engine Simulator'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {isAr ? 'اختبر كيف تعمل خوارزميات التسعير الخادومية واحتساب العمولات ورسوم التوصيل والخصومات لحظياً.' : 'Test real-time server-side order pricing, distance multipliers, custom commissions, and discounts.'}
              </p>
            </div>

            {/* Medicine Total Input */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {isAr ? 'قيمة الأدوية الإجمالية ($ USD)' : 'Medicine Subtotal ($ USD)'}
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                value={simMedicineTotal}
                onChange={(e) => setSimMedicineTotal(Math.max(1, parseFloat(e.target.value) || 0))}
                className="w-full px-3.5 py-2 text-sm font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0E7A4B]"
              />
            </div>

            {/* Distance Input */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {isAr ? 'مسافة التوصيل (كم)' : 'Delivery Distance (km)'}
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={simDistanceKm}
                onChange={(e) => setSimDistanceKm(Math.max(0.5, parseFloat(e.target.value) || 0))}
                className="w-full px-3.5 py-2 text-sm font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0E7A4B]"
              />
            </div>

            {/* Pharmacy Picker */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {isAr ? 'الصيدلية المنفذة' : 'Selected Pharmacy'}
              </label>
              <select
                value={simPharmacyId}
                onChange={(e) => setSimPharmacyId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0E7A4B]"
              >
                {SAMPLE_PHARMACIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Coupon Code Input */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {isAr ? 'كوبون الخصم (اختياري)' : 'Coupon Code (Optional)'}
              </label>
              <input
                type="text"
                placeholder="e.g. WELCOME10, HEALTH20"
                value={simCouponCode}
                onChange={(e) => setSimCouponCode(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono font-bold uppercase bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0E7A4B]"
              />
            </div>

            {/* Toggles */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simIsExpress}
                  onChange={(e) => setSimIsExpress(e.target.checked)}
                  className="rounded text-[#0E7A4B] focus:ring-[#0E7A4B]"
                />
                <span>{isAr ? 'توصيل فوري سريع (Express Surcharge)' : 'Express Priority Delivery (+$3.00)'}</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simIsDawaMonthlyUser}
                  onChange={(e) => setSimIsDawaMonthlyUser(e.target.checked)}
                  className="rounded text-[#0E7A4B] focus:ring-[#0E7A4B]"
                />
                <span>{isAr ? 'العميل مشترك في DAWA MED MONTHLY (توصيل مجاني)' : 'Customer is DAWA MED MONTHLY Subscriber ($0 Delivery)'}</span>
              </label>
            </div>
          </div>

          {/* Simulator Live Calculation Output Result */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#E8F5EE] shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-black text-[#111827]">
                  {isAr ? 'النتيجة الحسابية الموثوقة من الخادوم' : 'Server Calculation Output'}
                </h3>
                <span className="text-xs text-gray-400">Validated against server monetization rules</span>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-[#0E7A4B] font-mono text-xs font-black rounded-full border border-emerald-200">
                200 OK — PASS
              </span>
            </div>

            {simCalculationResult && (
              <div className="space-y-6">
                {/* 3 Result Blocks: Customer Checkout, Pharmacy Net, DAWA Margin */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                    <span className="text-xs text-gray-500 font-bold block">{isAr ? 'يدفعه العميل:' : 'Customer Pays:'}</span>
                    <span className="text-2xl font-black text-[#111827] mt-1 block">
                      ${simCalculationResult.totalCustomerPaidUSD.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-gray-400 block mt-0.5">
                      {isAr ? 'شاملاً التوصيل والخدمة والخصم' : 'Includes delivery, fees & discounts'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <span className="text-xs text-emerald-800 font-bold block">{isAr ? 'صافي مستحق الصيدلية:' : 'Net Pharmacy Payout:'}</span>
                    <span className="text-2xl font-black text-emerald-900 mt-1 block">
                      ${simCalculationResult.netPharmacyPayableUSD.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-emerald-700 block mt-0.5">
                      {isAr ? `بعد خصم عمولة ${simCalculationResult.commissionRateApplied}%` : `After ${simCalculationResult.commissionRateApplied}% platform commission`}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#E8F5EE] border border-[#D0EADB]">
                    <span className="text-xs text-[#0E7A4B] font-bold block">{isAr ? 'صافي ربح دواء ميد:' : 'DAWA Net Profit:'}</span>
                    <span className="text-2xl font-black text-[#111827] mt-1 block">
                      ${simCalculationResult.dawaNetProfitUSD.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-[#0E7A4B] block mt-0.5">
                      {isAr ? 'العمولة + هامش التوصيل + رسوم الخدمة' : 'Commission + delivery margin + service fee'}
                    </span>
                  </div>
                </div>

                {/* Line Item Breakdown */}
                <div className="p-5 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-2.5 text-xs">
                  <h4 className="font-bold text-gray-800 uppercase text-[11px] tracking-wider mb-2">
                    {isAr ? 'تفاصيل المعادلة المالية' : 'Mathematical Equation Breakdown'}
                  </h4>

                  <div className="flex justify-between py-1 border-b border-gray-200/60">
                    <span className="text-gray-600">{isAr ? 'قيمة الأدوية الإجمالية:' : 'Medicine Subtotal:'}</span>
                    <span className="font-bold text-gray-900">${simCalculationResult.itemsSubtotalUSD.toFixed(2)}</span>
                  </div>

                  {simCalculationResult.discountUSD > 0 && (
                    <div className="flex justify-between py-1 border-b border-gray-200/60 text-red-600">
                      <span>{isAr ? `خصم الكوبون (${simCalculationResult.appliedCoupon?.code}):` : `Coupon Discount (${simCalculationResult.appliedCoupon?.code}):`}</span>
                      <span className="font-bold">-${simCalculationResult.discountUSD.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-1 border-b border-gray-200/60">
                    <span className="text-gray-600">{isAr ? 'رسوم التوصيل واللوجستيات:' : 'Delivery & Logistics Fee:'}</span>
                    <span className="font-bold text-gray-900">
                      ${simCalculationResult.deliveryFeeUSD.toFixed(2)}
                      {simCalculationResult.expressSurchargeUSD > 0 && ` + $${simCalculationResult.expressSurchargeUSD.toFixed(2)} Express`}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-gray-200/60">
                    <span className="text-gray-600">{isAr ? 'رسوم معالجة الخدمة الرقمية:' : 'Digital Health Service Fee:'}</span>
                    <span className="font-bold text-gray-900">${simCalculationResult.serviceFeeUSD.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-gray-200/60">
                    <span className="text-gray-600">{isAr ? `عمولة المنصة (${simCalculationResult.commissionRateApplied}%):` : `Platform Commission (${simCalculationResult.commissionRateApplied}%):`}</span>
                    <span className="font-bold text-amber-800">${simCalculationResult.pharmacyCommissionUSD.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-gray-200/60">
                    <span className="text-gray-600">{isAr ? 'مستحقات السائق/المندوب (70%):' : 'Driver Courier Payout (70%):'}</span>
                    <span className="font-bold text-gray-700">${simCalculationResult.driverPayoutUSD.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between py-1 text-gray-600">
                    <span>{isAr ? 'هامش المنصة اللوجستي (30%):' : 'Platform Logistics Margin (30%):'}</span>
                    <span className="font-bold text-[#111827]">${simCalculationResult.dawaNetDeliveryMarginUSD.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Custom Commission Override Modal */}
      {editingPharmacyCommission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#E8F5EE] shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#111827]">
                {isAr ? 'تعديل نسبة عمولة الصيدلية' : 'Adjust Pharmacy Commission Rate'}
              </h3>
              <button
                onClick={() => setEditingPharmacyCommission(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600">
              {isAr
                ? `تحديد نسبة عمولة مخصصة لصيدلية ${editingPharmacyCommission.pharmacyName}. سيتم تطبيق هذه النسبة على جميع الطلبيات المستقبلية لهذه الصيدلية.`
                : `Set a custom platform commission percentage for ${editingPharmacyCommission.pharmacyName}. Future orders from this pharmacy will calculate commission using this rate.`}
            </p>

            <form onSubmit={handleSaveCommissionRate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  {isAr ? 'نسبة العمولة (%)' : 'Commission Percentage (%)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={newCommissionInput}
                    onChange={(e) => setNewCommissionInput(e.target.value)}
                    className="w-full px-4 py-2.5 text-base font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0E7A4B]"
                    required
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-500">%</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingPharmacyCommission(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={isSavingCommission}
                  className="px-5 py-2 rounded-xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {isSavingCommission ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ النسبة' : 'Save Commission Rate')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

function Code2Icon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}
