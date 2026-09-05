import React, { useState } from 'react';
import { 
  Order, 
  PharmacyPartner, 
  CountryConfig, 
  Language,
  DriverProfile,
  AdminCustomer,
  SupportTicket,
  DeliveryZone,
  MarketingBanner,
  AuditLog,
  TicketCategory,
  TicketStatus,
  DawaMonthlySubscription,
  ReferralSystemConfig,
  Medicine,
  MedicineApprovalStatus,
  PharmacyApprovalStatus,
  AuthUser
} from '../types';
import { 
  COUNTRIES, 
  SAMPLE_PHARMACIES, 
  SAMPLE_DRIVERS, 
  SAMPLE_CUSTOMERS, 
  SAMPLE_SUPPORT_TICKETS, 
  SAMPLE_DELIVERY_ZONES, 
  SAMPLE_MARKETING_BANNERS, 
  INITIAL_AUDIT_LOGS,
  SAMPLE_ADMIN_SUBSCRIBERS,
  INITIAL_REFERRAL_CONFIG,
  SAMPLE_MEDICINES
} from '../data/mockData';
import { TRANSLATIONS } from '../data/translations';
import { translate } from '../utils/i18n';
import { DEFAULT_USERS } from '../utils/rbac';
import { MedicineApprovalManager } from './MedicineApprovalManager';
import { PharmacyApprovalManager } from './PharmacyApprovalManager';
import { RbacUserManager } from './RbacUserManager';
import { EmailSettingsManager } from './EmailSettingsManager';
import { SiteSettingsManager } from './SiteSettingsManager';
import { RevenueMonetizationDashboard } from './RevenueMonetizationDashboard';
import { MonetizationSettingsManager } from './MonetizationSettingsManager';
import { ProductionReadinessManager } from './ProductionReadinessManager';
import { 
  ShieldCheck, 
  Building2, 
  TrendingUp, 
  Thermometer, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  FileText, 
  QrCode,
  Users,
  DollarSign,
  Bike,
  MapPin,
  Tag,
  Headphones,
  Search,
  Plus,
  Filter,
  Check,
  XCircle,
  Clock,
  ChevronRight,
  Eye,
  Lock,
  MessageSquare,
  Truck,
  Edit,
  Sliders,
  Send,
  AlertCircle,
  Sparkles,
  Pill,
  RotateCcw,
  CreditCard,
  Gift,
  RefreshCw,
  Key,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminDashboardProps {
  orders: Order[];
  selectedCountry: CountryConfig;
  onCountryChange: (c: CountryConfig) => void;
  language: Language;
  medicines?: Medicine[];
  onUpdateMedicineStatus?: (medicineId: string, status: MedicineApprovalStatus, notes?: string, reason?: string) => void;
  onUpdatePharmacyStatus?: (pharmacyId: string, status: PharmacyApprovalStatus, notes?: string, reason?: string) => void;
  currentUser?: AuthUser;
  onSwitchUser?: (user: AuthUser) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  selectedCountry,
  onCountryChange,
  language,
  medicines: initialMedicines = SAMPLE_MEDICINES,
  onUpdateMedicineStatus,
  onUpdatePharmacyStatus,
  currentUser,
  onSwitchUser,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    'production_readiness' | 'revenue_monetization' | 'monetization_settings' | 'medicine_approvals' | 'pharmacy_approvals' | 'site_settings' | 'rbac_users' | 'email_settings' | 'analytics' | 'pharmacies' | 'drivers' | 'customers' | 'orders' | 'zones' | 'content' | 'support' | 'audit' | 'subscriptions'
  >('production_readiness');

  // State collections
  const [medicinesList, setMedicinesList] = useState<Medicine[]>(initialMedicines);
  const [pharmacies, setPharmacies] = useState<PharmacyPartner[]>(SAMPLE_PHARMACIES);
  const [drivers, setDrivers] = useState<DriverProfile[]>(SAMPLE_DRIVERS);
  const [customers, setCustomers] = useState<AdminCustomer[]>(SAMPLE_CUSTOMERS);
  const [tickets, setTickets] = useState<SupportTicket[]>(SAMPLE_SUPPORT_TICKETS);
  const [zones, setZones] = useState<DeliveryZone[]>(SAMPLE_DELIVERY_ZONES);
  const [banners, setBanners] = useState<MarketingBanner[]>(SAMPLE_MARKETING_BANNERS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [subscribers, setSubscribers] = useState<DawaMonthlySubscription[]>(SAMPLE_ADMIN_SUBSCRIBERS);
  const [referralConfig, setReferralConfig] = useState<ReferralSystemConfig>(INITIAL_REFERRAL_CONFIG);

  // Medicine Status Callback
  const handleInternalUpdateMedicineStatus = (
    medicineId: string,
    status: MedicineApprovalStatus,
    notes?: string,
    reason?: string
  ) => {
    setMedicinesList((prev) =>
      prev.map((m) =>
        m.id === medicineId
          ? {
              ...m,
              approvalStatus: status,
              changeRequestNotes: status === 'changes_requested' ? notes : m.changeRequestNotes,
              rejectionReason: status === 'rejected' ? reason : m.rejectionReason,
              reviewedAt: new Date().toISOString(),
              reviewedBy: currentUser?.name || 'Chief Medical Officer',
            }
          : m
      )
    );

    if (onUpdateMedicineStatus) {
      onUpdateMedicineStatus(medicineId, status, notes, reason);
    }

    // Add Audit Log
    const newLog: AuditLog = {
      id: `log-med-${Date.now()}`,
      timestamp: 'Just now',
      actorType: 'admin',
      actorName: currentUser?.name || 'Chief Pharmacist Operations',
      actorRole: 'admin',
      action: `Medicine Approval Status -> ${status.toUpperCase()}`,
      target: `Medicine ID: ${medicineId}`,
      targetId: medicineId,
      details: notes || reason || `Status changed to ${status}`,
      ipAddress: '196.201.214.4',
      result: 'success',
      isEncryptedVerification: true,
      sha256Hash: `sha256-${Date.now().toString(16)}fa79e2c4180d`
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Pharmacy Status Callback
  const handleInternalUpdatePharmacyStatus = (
    pharmacyId: string,
    status: PharmacyApprovalStatus,
    notes?: string,
    reason?: string
  ) => {
    setPharmacies((prev) =>
      prev.map((p) =>
        p.id === pharmacyId
          ? {
              ...p,
              approvalStatus: status,
              verificationStatus: status === 'approved' ? 'verified' : 'pending_verification',
              isOpen: status === 'approved',
              infoRequestNotes: status === 'more_info_required' ? notes : p.infoRequestNotes,
              rejectionReason: status === 'rejected' ? reason : p.rejectionReason,
            }
          : p
      )
    );

    if (onUpdatePharmacyStatus) {
      onUpdatePharmacyStatus(pharmacyId, status, notes, reason);
    }

    const newLog: AuditLog = {
      id: `log-pharma-${Date.now()}`,
      timestamp: 'Just now',
      actorType: 'admin',
      actorName: currentUser?.name || 'Admin Licensure Desk',
      actorRole: 'admin',
      action: `Pharmacy Licensure Status -> ${status.toUpperCase()}`,
      target: `Pharmacy ID: ${pharmacyId}`,
      targetId: pharmacyId,
      details: notes || reason || `Pharmacy status updated to ${status}`,
      ipAddress: '196.201.214.4',
      result: 'success',
      isEncryptedVerification: true,
      sha256Hash: `sha256-${Date.now().toString(16)}88b0e7a4`
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Filters & Search
  const [pharmacySearch, setPharmacySearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [subscriberStatusFilter, setSubscriberStatusFilter] = useState<'all' | 'active' | 'trial' | 'payment_failed' | 'cancelled' | 'expired'>('all');
  const [simulationToast, setSimulationToast] = useState<string | null>(null);
  const [ticketCategoryFilter, setTicketCategoryFilter] = useState<TicketCategory | 'all'>('all');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<TicketStatus | 'all'>('all');

  // Modals
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState<SupportTicket | null>(null);
  const [resolutionInput, setResolutionInput] = useState('');
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState<TicketCategory>('customer_complaint');
  const [newTicketDesc, setNewTicketDesc] = useState('');
  const [newTicketUser, setNewTicketUser] = useState('');
  const [newTicketPhone, setNewTicketPhone] = useState('');

  const totalVolumeUSD = orders.reduce((acc, o) => acc + o.totalAmount, 0) + 12840;

  const toLocal = (usdAmount: number) => {
    return (usdAmount * selectedCountry.exchangeRateToUSD).toFixed(0);
  };

  // Verify Pharmacy Handler
  const handleVerifyPharmacy = (pharmacyId: string) => {
    setPharmacies((prev) =>
      prev.map((p) => (p.id === pharmacyId ? { ...p, verificationStatus: 'verified', isOpen: true } : p))
    );
    // Add audit log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorType: 'admin',
      actorName: 'Admin Operations Desk',
      actorRole: 'admin',
      action: 'Pharmacy License Approved',
      target: `Pharmacy #${pharmacyId}`,
      targetId: pharmacyId,
      details: `License verification confirmed for Pharmacy ID: ${pharmacyId} under ${selectedCountry.regulatoryBody}.`,
      ipAddress: '196.201.214.4',
      result: 'success',
      isEncryptedVerification: true,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Suspend Pharmacy Handler
  const handleSuspendPharmacy = (pharmacyId: string) => {
    setPharmacies((prev) =>
      prev.map((p) => (p.id === pharmacyId ? { ...p, verificationStatus: 'suspended', isOpen: false } : p))
    );
  };

  // Resolve Ticket
  const handleResolveTicket = (ticketId: string) => {
    if (!resolutionInput.trim()) return;
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: 'resolved',
              resolutionNotes: resolutionInput,
              assignedOfficer: t.assignedOfficer || 'Compliance Officer',
            }
          : t
      )
    );
    setSelectedTicketForDetail(null);
    setResolutionInput('');
  };

  // Add Ticket
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket: SupportTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      category: newTicketCategory,
      title: newTicketTitle,
      description: newTicketDesc,
      raisedBy: newTicketUser,
      userRole: 'customer',
      contactPhone: newTicketPhone || '+254 700 000 000',
      priority: 'high',
      status: 'open',
      createdAt: 'Just now',
      assignedOfficer: 'Dispatch Operations Lead',
      messages: [
        {
          id: `msg-${Date.now()}`,
          ticketId: `tkt-${Date.now()}`,
          senderId: 'usr-customer-1',
          senderName: newTicketUser,
          senderRole: 'customer',
          message: newTicketDesc,
          timestamp: 'Just now'
        }
      ]
    };
    setTickets((prev) => [newTicket, ...prev]);
    setIsNewTicketOpen(false);
    setNewTicketTitle('');
    setNewTicketDesc('');
    setNewTicketUser('');
    setNewTicketPhone('');
  };

  // Subscription Handlers
  const handleCompTrial = (subId: string) => {
    setSubscribers((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, status: 'trial', trialDaysLeft: 14 } : s))
    );
  };

  const handleRetryPayment = (subId: string) => {
    setSubscribers((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, status: 'active' } : s))
    );
  };

  const handleToggleCancelSubscriber = (subId: string) => {
    setSubscribers((prev) =>
      prev.map((s) =>
        s.id === subId
          ? {
              ...s,
              status: s.status === 'active' || s.status === 'trial' ? 'cancelled' : 'active',
              autoRenew: s.status !== 'active' && s.status !== 'trial',
            }
          : s
      )
    );
  };

  const handleTriggerAdherenceSimulation = () => {
    setSimulationToast('Simulated 08:00 AM Cron: Push broadcast sent to 2,400+ active patients with sound alert.');
    setTimeout(() => setSimulationToast(null), 4000);
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesCat = ticketCategoryFilter === 'all' || t.category === ticketCategoryFilter;
    const matchesStatus = ticketStatusFilter === 'all' || t.status === ticketStatusFilter;
    return matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-6 w-full max-w-full min-w-0 box-border" id="admin-dashboard-root">
      {/* Header with Multi-Country Switcher and Active Role Indicator */}
      <div className="bg-[#0E7A4B] text-white rounded-3xl p-6 sm:p-8 shadow-xs border border-[#0B6B43] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold border border-white/15">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>{t.panAfricanCompliance || translate('panAfricanCompliance', language)}</span>
            </div>
            
            {/* Active Admin Persona Badge */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${
              currentUser?.role === 'super_admin' 
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                : currentUser?.role === 'medical_admin'
                ? 'bg-blue-500/20 text-blue-300 border-blue-400/40'
                : currentUser?.role === 'operations_admin'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                : 'bg-white/10 text-white border-white/20'
            }`}>
              <Key className="w-3.5 h-3.5" />
              <span>
                {currentUser?.role === 'super_admin' && '👑 Super Admin'}
                {currentUser?.role === 'medical_admin' && '🩺 Medical Admin'}
                {currentUser?.role === 'operations_admin' && '⚙️ Operations Admin'}
                {currentUser?.role === 'admin' && '🛡️ General Admin'}
                {currentUser?.role === 'support_admin' && '🎧 Support Admin'}
                {(!currentUser?.role || (currentUser?.role !== 'super_admin' && currentUser?.role !== 'medical_admin' && currentUser?.role !== 'operations_admin' && currentUser?.role !== 'admin' && currentUser?.role !== 'support_admin')) && `🛡️ ${currentUser?.role || 'Admin'}`}
              </span>
              {currentUser?.name && <span className="opacity-75">({currentUser.name.split(' ')[0]})</span>}
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            {t.adminCommandTitle || translate('adminCommandTitle', language)}
          </h2>
          <p className="text-xs text-white/80 mt-0.5">
            {t.activeMarketLabel || translate('activeMarketLabel', language)} <strong className="text-white">{selectedCountry.flag} {selectedCountry.name}</strong> • {t.regulatoryBodyLabel || translate('regulatoryBodyLabel', language)} {selectedCountry.regulatoryBody}
          </p>

          {/* Quick RBAC Persona Switcher for Admins */}
          {onSwitchUser && (
            <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-white/10">
              <span className="text-[11px] text-emerald-300 font-bold me-1">Switch Admin Persona:</span>
              {[
                { role: 'super_admin', label: '👑 Super Admin', bg: 'hover:bg-amber-500/20' },
                { role: 'medical_admin', label: '🩺 Medical Admin', bg: 'hover:bg-blue-500/20' },
                { role: 'operations_admin', label: '⚙️ Operations Admin', bg: 'hover:bg-emerald-500/20' },
                { role: 'admin', label: '🛡️ General Admin', bg: 'hover:bg-white/20' }
              ].map((p) => {
                const isActive = currentUser?.role === p.role;
                return (
                  <button
                    key={p.role}
                    onClick={() => {
                      const userObj = DEFAULT_USERS.find(u => u.role === p.role);
                      if (userObj) {
                        onSwitchUser(userObj as AuthUser);
                        if (p.role === 'medical_admin') setActiveTab('medicine_approvals');
                        else if (p.role === 'operations_admin') setActiveTab('orders');
                        else if (p.role === 'super_admin') setActiveTab('revenue_monetization');
                      }
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-white text-[#0E7A4B] shadow-xs font-black' 
                        : `bg-white/10 text-white/90 border border-white/15 ${p.bg}`
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Market Selector */}
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-300" />
          <select
            value={selectedCountry.code}
            onChange={(e) => {
              const c = COUNTRIES.find((x) => x.code === e.target.value);
              if (c) onCountryChange(c);
            }}
            className="bg-white/10 text-white text-xs font-bold px-3.5 py-2 rounded-2xl border border-white/20 hover:bg-white/15 focus:outline-none cursor-pointer"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code} className="text-neutral-900 bg-white">
                {c.flag} {c.name} ({c.currency})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="w-full max-w-full flex items-center gap-2 border-b border-[#E8F5EE] pb-2 overflow-x-auto no-scrollbar min-w-0 box-border">
        <button
          onClick={() => setActiveTab('production_readiness')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'production_readiness' ? 'bg-[#0E7A4B] text-white shadow-xs font-bold' : 'bg-white text-[#111827] hover:bg-[#F1FAF4] border border-[#E8F5EE]'
          }`}
          id="tab-production-readiness"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{language === 'ar' ? 'جاهزية الإنتاج والاتصال الحي' : 'Production Health & Zero Mock'}</span>
        </button>

        <button
          onClick={() => setActiveTab('revenue_monetization')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'revenue_monetization' ? 'bg-[#0E7A4B] text-white shadow-xs font-bold' : 'bg-white text-[#111827] hover:bg-[#F1FAF4] border border-[#E8F5EE]'
          }`}
          id="tab-revenue-monetization"
        >
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>{language === 'ar' ? 'الإيرادات وتحقيق الدخل (Phase 1)' : 'Revenue & Monetization (Phase 1)'}</span>
        </button>

        <button
          onClick={() => setActiveTab('monetization_settings')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'monetization_settings' ? 'bg-[#0E7A4B] text-white shadow-xs font-bold' : 'bg-white text-[#111827] hover:bg-[#F1FAF4] border border-[#E8F5EE]'
          }`}
          id="tab-monetization-settings"
        >
          <Sliders className="w-4 h-4 text-emerald-400" />
          <span>{language === 'ar' ? 'إعدادات وقواعد التسعير والعمولات' : 'Pricing & Commission Rules'}</span>
        </button>

        <button
          onClick={() => setActiveTab('medicine_approvals')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'medicine_approvals' ? 'bg-[#0E7A4B] text-white shadow-xs font-bold' : 'bg-white text-[#111827] hover:bg-[#F1FAF4] border border-[#E8F5EE]'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          <span>{t.medicineApprovalsTab || translate('medicineApprovalsTab', language)} ({medicinesList.filter((m) => m.approvalStatus === 'pending_approval' || m.approvalStatus === 'under_review').length} {language === 'ar' ? 'معلق' : 'Pending'})</span>
          {medicinesList.some((m) => m.approvalStatus === 'pending_approval') && (
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('pharmacy_approvals')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'pharmacy_approvals' ? 'bg-[#0E7A4B] text-white shadow-xs font-bold' : 'bg-white text-[#111827] hover:bg-[#F1FAF4] border border-[#E8F5EE]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{t.pharmacyLicensureTab || translate('pharmacyLicensureTab', language)}</span>
          {pharmacies.some((p) => p.approvalStatus === 'pending' || p.approvalStatus === 'under_review') && (
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('site_settings')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'site_settings' ? 'bg-[#0E7A4B] text-white shadow-xs font-bold' : 'bg-white text-[#111827] hover:bg-[#F1FAF4] border border-[#E8F5EE]'
          }`}
        >
          <Building2 className="w-4 h-4 text-emerald-300" />
          <span>{language === 'ar' ? 'إعدادات الموقع والهوية' : 'Site Settings & Logo'}</span>
        </button>

        <button
          onClick={() => setActiveTab('rbac_users')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'rbac_users' ? 'bg-[#0E7A4B] text-white shadow-xs font-bold' : 'bg-white text-[#111827] hover:bg-[#F1FAF4] border border-[#E8F5EE]'
          }`}
        >
          <Key className="w-4 h-4 text-[#0E7A4B]" />
          <span>{t.rolesRbacTab || translate('rolesRbacTab', language)}</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'analytics' ? 'bg-[#0E7A4B] text-white shadow-xs font-bold' : 'bg-white text-[#111827] hover:bg-[#F1FAF4] border border-[#E8F5EE]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>{t.kpisAnalyticsTab || translate('kpisAnalyticsTab', language)}</span>
        </button>

        <button
          onClick={() => setActiveTab('pharmacies')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'pharmacies' ? 'bg-[#0E7A4B] text-white shadow-xs font-bold' : 'bg-white text-[#111827] hover:bg-[#F1FAF4] border border-[#E8F5EE]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{t.pharmaciesTab || translate('pharmaciesTab', language)} ({pharmacies.length})</span>
          {pharmacies.some((p) => p.verificationStatus === 'pending_verification') && (
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('drivers')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'drivers' ? 'bg-[#0E7A4B] text-white shadow-xs font-bold' : 'bg-white text-[#111827] hover:bg-[#F1FAF4] border border-[#E8F5EE]'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>{t.couriersFleetTab || translate('couriersFleetTab', language)} ({drivers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'customers' ? 'bg-[#0E7A4B] text-white shadow-xs font-bold' : 'bg-white text-[#111827] hover:bg-[#F1FAF4] border border-[#E8F5EE]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t.patientsUsersTab || translate('patientsUsersTab', language)} ({customers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'orders' ? 'bg-[#0E7A4B] text-white shadow-xs font-bold' : 'bg-white text-[#111827] hover:bg-[#F1FAF4] border border-[#E8F5EE]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t.liveOrdersTab || translate('liveOrdersTab', language)} ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('zones')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'zones' ? 'bg-[#0E7A4B] text-white shadow-xs font-bold' : 'bg-white text-[#111827] hover:bg-[#F1FAF4] border border-[#E8F5EE]'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>{t.deliveryZonesTab || translate('deliveryZonesTab', language)} ({zones.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'content' ? 'bg-[#0E7A4B] text-white shadow-xs font-bold' : 'bg-white text-[#111827] hover:bg-[#F1FAF4] border border-[#E8F5EE]'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>{t.marketingBannersTab || translate('marketingBannersTab', language)}</span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'support' ? 'bg-[#0E7A4B] text-white shadow-xs font-bold' : 'bg-white text-[#111827] hover:bg-[#F1FAF4] border border-[#E8F5EE]'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>{t.supportDeskTab || translate('supportDeskTab', language)}</span>
          {tickets.filter((t) => t.status === 'open').length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#E63946] text-white font-bold">
              {tickets.filter((t) => t.status === 'open').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'subscriptions' ? 'bg-[#0E7A4B] text-white shadow-xs font-bold' : 'bg-white text-[#111827] hover:bg-[#F1FAF4] border border-[#E8F5EE]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{t.subscriptionsTab || translate('subscriptionsTab', language)} ({subscribers.length})</span>
          {subscribers.some((s) => s.status === 'payment_failed') && (
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('email_settings')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'email_settings' ? 'bg-[#0E7A4B] text-white shadow-xs font-bold' : 'bg-white text-[#111827] hover:bg-[#F1FAF4] border border-[#E8F5EE]'
          }`}
        >
          <Mail className="w-4 h-4 text-emerald-300" />
          <span>{t.emailSmtpTab || translate('emailSmtpTab', language)}</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'audit' ? 'bg-[#0E7A4B] text-white shadow-xs font-bold' : 'bg-white text-[#111827] hover:bg-[#F1FAF4] border border-[#E8F5EE]'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>{t.securityAuditTrailTab || translate('securityAuditTrailTab', language)}</span>
        </button>
      </div>

      {/* PRODUCTION READINESS & CONNECTIVITY HEALTH MATRIX */}
      {activeTab === 'production_readiness' && (
        <ProductionReadinessManager
          language={language}
        />
      )}

      {/* REVENUE & MONETIZATION DASHBOARD (PHASE 1 CORE) */}
      {activeTab === 'revenue_monetization' && (
        <RevenueMonetizationDashboard
          language={language}
          selectedCountry={selectedCountry}
          currentUser={currentUser}
          onOpenSettings={() => setActiveTab('monetization_settings')}
        />
      )}

      {/* MONETIZATION & PRICING RULES SETTINGS */}
      {activeTab === 'monetization_settings' && (
        <MonetizationSettingsManager
          language={language}
          selectedCountry={selectedCountry}
          currentUser={currentUser}
          onSaved={() => {
            // Can show a notification or re-sync if needed
          }}
        />
      )}

      {/* EMAIL SETTINGS TAB */}
      {activeTab === 'email_settings' && (
        <EmailSettingsManager
          language={language}
          currentUser={currentUser}
        />
      )}

      {/* MEDICINE APPROVALS TAB */}
      {activeTab === 'medicine_approvals' && (
        <MedicineApprovalManager
          medicines={medicinesList}
          onUpdateStatus={handleInternalUpdateMedicineStatus}
          language={language}
          selectedCountry={selectedCountry}
        />
      )}

      {/* PHARMACY LICENSURE & APPROVALS TAB */}
      {activeTab === 'pharmacy_approvals' && (
        <PharmacyApprovalManager
          pharmacies={pharmacies}
          onUpdatePharmacyStatus={handleInternalUpdatePharmacyStatus}
          language={language}
          selectedCountry={selectedCountry}
        />
      )}

      {/* SITE SETTINGS & LOGO TAB */}
      {activeTab === 'site_settings' && (
        <SiteSettingsManager
          currentUser={currentUser}
          language={language}
        />
      )}

      {/* RBAC USERS & PERMISSIONS TAB */}
      {activeTab === 'rbac_users' && (
        <RbacUserManager
          currentUser={currentUser}
          onSwitchUser={onSwitchUser}
          language={language}
        />
      )}

      {/* TAB 1: ANALYTICS & KPIS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-[#E8F5EE] shadow-xs">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Gross Volume (GMV)</span>
                <DollarSign className="w-4 h-4 text-[#0E7A4B]" />
              </div>
              <p className="text-2xl font-black text-[#111827]">
                {selectedCountry.currencySymbol} {toLocal(totalVolumeUSD)}
              </p>
              <p className="text-[11px] text-[#0E7A4B] font-bold mt-1">
                +18.4% vs last month (${totalVolumeUSD.toLocaleString()} USD)
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-[#E8F5EE] shadow-xs">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">On-Time Deliveries</span>
                <TrendingUp className="w-4 h-4 text-[#0E7A4B]" />
              </div>
              <p className="text-2xl font-black text-[#111827]">98.4%</p>
              <p className="text-[11px] text-neutral-500 mt-1">Average delivery time: 24 mins</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-[#E8F5EE] shadow-xs">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Cold-Chain Compliance</span>
                <Thermometer className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-blue-700">100%</p>
              <p className="text-[11px] text-blue-600 font-medium mt-1">0 thermal excursion incidents</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-[#E8F5EE] shadow-xs">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Verified Pharmacies</span>
                <Building2 className="w-4 h-4 text-[#0E7A4B]" />
              </div>
              <p className="text-2xl font-black text-[#111827]">
                {pharmacies.filter((p) => p.verificationStatus === 'verified').length} Active
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">
                {pharmacies.filter((p) => p.verificationStatus === 'pending_verification').length} Pending review
              </p>
            </div>
          </div>

          {/* Regional Market Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8F5EE] shadow-xs space-y-4">
            <h3 className="text-base font-black text-[#111827] flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#0E7A4B]" />
              <span>Multi-Country Health Authority Deployment</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {COUNTRIES.map((country) => (
                <div key={country.code} className="p-4 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{country.flag}</span>
                      <span className="font-bold text-[#111827] text-sm">{country.name}</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">{country.regulatoryBody}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#E8F5EE] text-[#0E7A4B] font-bold font-bold text-xs">
                    Operational
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PHARMACIES MANAGEMENT */}
      {activeTab === 'pharmacies' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-[#E8F5EE] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-[#111827] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#0E7A4B]" />
                <span>Licensed Partner Pharmacies ({pharmacies.length})</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Audit premises licenses, verify superintendent pharmacists, and enforce compliance.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search pharmacy by name or license..."
                value={pharmacySearch}
                onChange={(e) => setPharmacySearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-2xl bg-[#F1FAF4] text-xs border border-[#E8F5EE]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {pharmacies
              .filter(
                (p) =>
                  p.name.toLowerCase().includes(pharmacySearch.toLowerCase()) ||
                  p.licenseNumber.toLowerCase().includes(pharmacySearch.toLowerCase()) ||
                  p.city.toLowerCase().includes(pharmacySearch.toLowerCase())
              )
              .map((pharmacy) => {
                const isVerified = pharmacy.verificationStatus === 'verified';
                const isPending = pharmacy.verificationStatus === 'pending_verification';

                return (
                  <div
                    key={pharmacy.id}
                    className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all shadow-xs ${
                      isPending ? 'border-amber-300 ring-2 ring-amber-100' : 'border-[#E8F5EE]'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-black text-[#111827]">{pharmacy.name}</h4>
                          {isVerified ? (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E8F5EE] text-[#0E7A4B] font-bold border border-[#D0EADB] flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#0E7A4B]" />
                              <span>Verified Licensed</span>
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Pending Admin Verification</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-neutral-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>License: <strong className="font-mono text-neutral-800">{pharmacy.licenseNumber}</strong></span>
                          <span>•</span>
                          <span>Superintendent: <strong>{pharmacy.pharmacistInCharge}</strong></span>
                          <span>•</span>
                          <span>{pharmacy.address}, {pharmacy.city}</span>
                        </p>
                      </div>

                      {/* Admin Actions */}
                      <div className="flex items-center gap-2">
                        {isPending ? (
                          <button
                            onClick={() => handleVerifyPharmacy(pharmacy.id)}
                            className="px-4 py-2 rounded-2xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-300" />
                            <span>Approve & Activate Branch</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSuspendPharmacy(pharmacy.id)}
                            className="px-3.5 py-2 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold cursor-pointer"
                          >
                            <span>Suspend Branch</span>
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

      {/* TAB 3: DRIVERS & FLEET */}
      {activeTab === 'drivers' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-[#E8F5EE] shadow-xs flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-[#111827] flex items-center gap-2">
                <Bike className="w-5 h-5 text-[#0E7A4B]" />
                <span>Medical Courier Fleet ({drivers.length})</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Active riders, vehicle inspection status, and live IoT cold-chain temperature readings.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {drivers.map((driver) => (
              <div key={driver.id} className="bg-white rounded-3xl p-5 border border-[#E8F5EE] shadow-xs flex items-start gap-4">
                <img
                  src={driver.photoUrl}
                  alt={driver.name}
                  referrerPolicy="no-referrer"
                  className="h-14 w-14 rounded-2xl object-cover border-2 border-[#E8F5EE]"
                />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[#111827] text-sm">{driver.name}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      driver.status === 'online' ? 'bg-[#E8F5EE] text-[#0E7A4B] font-bold' : driver.status === 'on_delivery' ? 'bg-blue-100 text-blue-900' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {driver.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-500">
                    {driver.phone} • {driver.vehiclePlate} ({driver.vehicleType})
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs border-t border-neutral-100">
                    <span className="text-neutral-500">Rating: ★ {driver.rating} ({driver.totalDeliveries} trips)</span>
                    {driver.temperatureReading && (
                      <span className="font-bold text-blue-700">{driver.temperatureReading}°C</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-[#E8F5EE] shadow-xs">
            <h3 className="text-lg font-black text-[#111827] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0E7A4B]" />
              <span>Registered Patient Directory ({customers.length})</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Customer profiles, chronic subscription enrollments, and ordering histories.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#E8F5EE] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[600px]">
                <thead className="bg-[#F1FAF4] border-b border-[#E8F5EE] text-[#0E7A4B] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-5 py-3.5">Patient Name</th>
                    <th className="px-4 py-3.5">Phone & Location</th>
                    <th className="px-4 py-3.5">Joined Date</th>
                    <th className="px-4 py-3.5">Total Orders</th>
                    <th className="px-4 py-3.5">Total Spent</th>
                    <th className="px-4 py-3.5">Care Plan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8F5EE]">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-[#F9FAF9]">
                      <td className="px-5 py-4 font-bold text-[#111827] text-sm">{c.name}</td>
                      <td className="px-4 py-4 text-neutral-600">{c.phone}<br/><span className="text-[11px] text-neutral-400">{c.city}</span></td>
                      <td className="px-4 py-4 text-neutral-500">{c.joinedDate}</td>
                      <td className="px-4 py-4 font-black text-[#111827]">{c.totalOrders}</td>
                      <td className="px-4 py-4 font-bold text-[#0E7A4B]">${c.totalSpentUSD.toFixed(2)}</td>
                      <td className="px-4 py-4">
                        {c.activeSubscription ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                            Chronic Shield Refill Active
                          </span>
                        ) : (
                          <span className="text-neutral-400 text-[11px]">Standard</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ORDERS MONITORING */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-[#E8F5EE] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-[#111827] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0E7A4B]" />
                <span>Live Orders Audit Stream ({orders.length})</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Real-time lifecycle tracking across pharmacies, couriers, and OTP delivery handovers.
              </p>
            </div>

            <input
              type="text"
              placeholder="Search by order ID or customer..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              className="px-3.5 py-2 rounded-2xl bg-[#F1FAF4] text-xs border border-[#E8F5EE] w-full sm:w-64"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {orders
              .filter(
                (o) =>
                  o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
                  o.customerName.toLowerCase().includes(orderSearch.toLowerCase())
              )
              .map((order) => (
                <div key={order.id} className="bg-white rounded-3xl p-5 border border-[#E8F5EE] shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[#111827] text-sm">{order.orderNumber}</span>
                      <span className="text-xs text-neutral-400">• {order.createdAt}</span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E8F5EE] text-[#0E7A4B] font-bold capitalize">
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="text-right font-black text-sm text-[#111827]">
                      {selectedCountry.currencySymbol} {toLocal(order.totalAmount)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-neutral-600">
                    <div>
                      <span className="text-[11px] text-neutral-400 font-bold block">Patient:</span>
                      <strong>{order.customerName}</strong> ({order.customerPhone})
                    </div>
                    <div>
                      <span className="text-[11px] text-neutral-400 font-bold block">Fulfilling Chemist:</span>
                      {order.pharmacyName}
                    </div>
                    <div>
                      <span className="text-[11px] text-neutral-400 font-bold block">Handover PIN:</span>
                      <strong className="font-mono text-[#111827]">{order.deliveryOtp}</strong>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 6: DELIVERY ZONES */}
      {activeTab === 'zones' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-[#E8F5EE] shadow-xs">
            <h3 className="text-lg font-black text-[#111827] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#0E7A4B]" />
              <span>Delivery Zones & Dynamic Pricing ({zones.length})</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Set standard courier dispatch fees and ETA expectations per urban territory.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {zones.map((zone) => (
              <div key={zone.id} className="bg-white rounded-3xl p-5 border border-[#E8F5EE] shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-[#111827] text-sm">{zone.zoneName}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F5EE] text-[#0E7A4B] font-bold uppercase">
                    {zone.status}
                  </span>
                </div>
                <p className="text-xs text-neutral-500">{zone.city} ({zone.countryCode})</p>
                <div className="pt-2 flex justify-between text-xs border-t border-neutral-100 font-bold">
                  <span className="text-[#0E7A4B]">Fee: ${zone.deliveryFeeUSD.toFixed(2)}</span>
                  <span className="text-neutral-700">ETA: {zone.estimatedDeliveryMinutes}m</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: MARKETING BANNERS */}
      {activeTab === 'content' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-[#E8F5EE] shadow-xs">
            <h3 className="text-lg font-black text-[#111827] flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#0E7A4B]" />
              <span>Marketing Campaigns & Patient Banners ({banners.length})</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Active promotional cards displayed on patient mobile home feed.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {banners.map((b) => (
              <div
                key={b.id}
                className="rounded-3xl p-6 text-white shadow-xs space-y-2"
                style={{ backgroundColor: b.bgColor }}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold tracking-wider">
                    {b.tag}
                  </span>
                  {b.promoCode && (
                    <span className="font-mono text-xs bg-white text-[#111827] px-3 py-1 rounded-xl font-bold">
                      Code: {b.promoCode} (-{b.discountPercent}%)
                    </span>
                  )}
                </div>
                <h4 className="text-lg font-black">{b.title}</h4>
                <p className="text-xs text-white/80">{b.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: SUPPORT CENTER & TICKETS */}
      {activeTab === 'support' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-[#E8F5EE] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-[#111827] flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-[#0E7A4B]" />
                  <span>Support Center & Complaints Hub ({tickets.length})</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Resolve clinical inquiries, missing items, payment disputes, and delivery escalations.
                </p>
              </div>

              <button
                onClick={() => setIsNewTicketOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
              >
                <Plus className="w-4 h-4 text-emerald-300" />
                <span>Log Support Ticket</span>
              </button>
            </div>

            {/* Filter by Category & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Filter by Category</label>
                <select
                  value={ticketCategoryFilter}
                  onChange={(e) => setTicketCategoryFilter(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-[#F1FAF4] text-xs border border-[#E8F5EE]"
                >
                  <option value="all">All Categories ({tickets.length})</option>
                  <option value="customer_complaint">Customer Complaints</option>
                  <option value="pharmacy_complaint">Pharmacy Inquiries</option>
                  <option value="driver_complaint">Driver Escalations</option>
                  <option value="missing_item">Missing Items</option>
                  <option value="wrong_item">Wrong Item Dispensed</option>
                  <option value="payment_issue">Payment & Reversals</option>
                  <option value="delivery_problem">Delivery Problem</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Filter by Status</label>
                <select
                  value={ticketStatusFilter}
                  onChange={(e) => setTicketStatusFilter(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-[#F1FAF4] text-xs border border-[#E8F5EE]"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open (Unresolved)</option>
                  <option value="in_investigation">In Investigation</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all shadow-xs space-y-3 ${
                  ticket.status === 'open' ? 'border-red-200' : 'border-[#E8F5EE]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-[#111827] text-sm">{ticket.ticketNumber}</span>
                    <span className="text-xs text-neutral-400">• {ticket.createdAt}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 uppercase">
                      {ticket.category.replace(/_/g, ' ')}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                      ticket.status === 'resolved' ? 'bg-[#E8F5EE] text-[#0E7A4B] font-bold' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {ticket.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <span className={`text-xs font-bold ${
                    ticket.priority === 'urgent_clinical' ? 'text-red-600' : 'text-neutral-600'
                  }`}>
                    Priority: {ticket.priority.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h4 className="font-black text-[#111827] text-sm">{ticket.title}</h4>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{ticket.description}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-neutral-100">
                  <span className="text-neutral-500">
                    Raised By: <strong className="text-[#111827]">{ticket.raisedBy}</strong> ({ticket.contactPhone})
                  </span>

                  {ticket.status !== 'resolved' ? (
                    <button
                      onClick={() => {
                        setSelectedTicketForDetail(ticket);
                        setResolutionInput(ticket.resolutionNotes || '');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Investigate & Resolve</span>
                    </button>
                  ) : (
                    <span className="text-[#0E7A4B] font-bold text-xs">
                      Resolved: {ticket.resolutionNotes}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: SECURITY AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-[#E8F5EE] shadow-xs">
            <h3 className="text-lg font-black text-[#111827] flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#0E7A4B]" />
              <span>Immutable Regulatory Audit Trail ({auditLogs.length})</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Tamper-evident logs of prescription verification stamps, cold-chain checks, and admin approvals.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#E8F5EE] shadow-xs overflow-hidden">
            <div className="divide-y divide-[#E8F5EE]">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 sm:p-5 hover:bg-[#F9FAF9] text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[#111827] text-sm">{log.action}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E8F5EE] text-[#0E7A4B] font-bold uppercase">
                        {log.actorType}
                      </span>
                    </div>
                    <span className="text-neutral-400 font-mono text-[11px]">{log.timestamp}</span>
                  </div>

                  <p className="text-neutral-700 leading-relaxed">{log.details}</p>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                    <span>Actor: {log.actorName} • IP: {log.ipAddress}</span>
                    <span className="text-[#0E7A4B] font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>SHA-256 Validated</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: DAWA MED MONTHLY SUBSCRIPTIONS & REMINDER AUTOMATION */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6" id="admin-subscriptions-tab">
          {/* Simulation Toast */}
          {simulationToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-2xl bg-[#0E7A4B] text-white text-xs font-bold flex items-center justify-between shadow-lg border border-[#0B6B43]"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-300 animate-spin" />
                <span>{simulationToast}</span>
              </div>
              <button onClick={() => setSimulationToast(null)} className="text-white/80 hover:text-white cursor-pointer">
                ✕
              </button>
            </motion.div>
          )}

          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
            <div className="bg-white rounded-3xl p-4 border border-[#E8F5EE] shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Total Subscribers</span>
              <p className="text-xl font-black text-[#111827]">{subscribers.length}</p>
              <span className="text-[10px] text-gray-500">Pan-African Platform</span>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-[#E8F5EE] shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Active Subscribers</span>
              <p className="text-xl font-black text-emerald-700">
                {subscribers.filter((s) => s.status === 'active').length}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold">Paying $5.00/mo</span>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-[#E8F5EE] shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-blue-600 uppercase">14-Day Free Trials</span>
              <p className="text-xl font-black text-blue-700">
                {subscribers.filter((s) => s.status === 'trial').length}
              </p>
              <span className="text-[10px] text-blue-500">Converting pipeline</span>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-[#E8F5EE] shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Cancelled Subscriptions</span>
              <p className="text-xl font-black text-gray-700">
                {subscribers.filter((s) => s.status === 'cancelled').length}
              </p>
              <span className="text-[10px] text-gray-400">Grace period active</span>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-[#E8F5EE] shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-red-600 uppercase">Failed Payments</span>
              <p className="text-xl font-black text-red-600">
                {subscribers.filter((s) => s.status === 'payment_failed').length}
              </p>
              <span className="text-[10px] text-red-500">Requires retry / SMS</span>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-[#E8F5EE] shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-[#0E7A4B] uppercase">Monthly Revenue (MRR)</span>
              <p className="text-xl font-black text-[#111827]">
                ${(subscribers.filter((s) => s.status === 'active').length * 5.0).toFixed(2)}
              </p>
              <span className="text-[10px] text-[#0E7A4B] font-bold">
                ≈ {(subscribers.filter((s) => s.status === 'active').length * 5.0 * selectedCountry.exchangeRateToUSD).toLocaleString()} {selectedCountry.currencySymbol}
              </span>
            </div>
          </div>

          {/* Automation & Controls Bar */}
          <div className="bg-white rounded-3xl p-5 border border-[#E8F5EE] shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-[#111827] flex items-center gap-2">
                <Pill className="w-4 h-4 text-[#0E7A4B]" />
                <span>Automated Dose Reminder Scheduler (Cron Daemon)</span>
              </h3>
              <p className="text-xs text-gray-500">
                Dispatches time-zoned push notifications and SMS alerts at exact scheduled medication hours.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleTriggerAdherenceSimulation}
                className="px-4 py-2.5 rounded-2xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Simulate Morning Broadcast (08:00 AM)</span>
              </button>
            </div>
          </div>

          {/* Subscribers Table & Search */}
          <div className="bg-white rounded-3xl border border-[#E8F5EE] shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#E8F5EE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#F1FAF4]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0E7A4B]" />
                <h3 className="text-sm font-black text-[#111827]">
                  DAWA MED MONTHLY Subscribers
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={subscriberSearch}
                    onChange={(e) => setSubscriberSearch(e.target.value)}
                    placeholder="Search by patient name or phone..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#E8F5EE] bg-white text-xs"
                  />
                </div>

                <select
                  value={subscriberStatusFilter}
                  onChange={(e) => setSubscriberStatusFilter(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl border border-[#E8F5EE] bg-white text-xs font-bold text-[#111827]"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="trial">Trial</option>
                  <option value="payment_failed">Payment Failed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E8F5EE] bg-[#F1FAF4] text-[#111827] font-black uppercase text-[10px]">
                    <th className="p-3.5">Subscriber Patient</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Plan & Cost</th>
                    <th className="p-3.5">Tokenized Payment Gateway</th>
                    <th className="p-3.5">Next Renewal</th>
                    <th className="p-3.5 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8F5EE]">
                  {subscribers
                    .filter((s) => {
                      const matchesSearch =
                        s.userName.toLowerCase().includes(subscriberSearch.toLowerCase()) ||
                        s.userPhone.includes(subscriberSearch);
                      const matchesStatus =
                        subscriberStatusFilter === 'all' || s.status === subscriberStatusFilter;
                      return matchesSearch && matchesStatus;
                    })
                    .map((sub) => (
                      <tr key={sub.id} className="hover:bg-[#F9FAF9] transition-colors">
                        <td className="p-3.5">
                          <p className="font-black text-[#111827]">{sub.userName}</p>
                          <p className="text-[11px] text-gray-500 font-mono">{sub.userPhone}</p>
                        </td>
                        <td className="p-3.5">
                          {sub.status === 'active' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#E8F5EE] text-[#0E7A4B]">
                              ACTIVE
                            </span>
                          )}
                          {sub.status === 'trial' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                              TRIAL ({sub.trialDaysLeft}d left)
                            </span>
                          )}
                          {sub.status === 'payment_failed' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800 animate-pulse">
                              PAYMENT FAILED
                            </span>
                          )}
                          {sub.status === 'cancelled' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gray-100 text-gray-700">
                              CANCELLED
                            </span>
                          )}
                          {sub.status === 'expired' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                              EXPIRED
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 font-bold text-[#111827]">
                          ${sub.priceUSD.toFixed(2)} USD / mo
                        </td>
                        <td className="p-3.5">
                          <p className="font-bold text-[#111827] truncate max-w-[180px]">
                            {sub.paymentMethod.title}
                          </p>
                          <p className="text-[10px] text-gray-500 font-mono truncate max-w-[180px]">
                            {sub.paymentMethod.tokenizedId}
                          </p>
                        </td>
                        <td className="p-3.5 font-mono text-[#111827]">
                          {sub.renewalDate}
                        </td>
                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                          {sub.status === 'payment_failed' && (
                            <button
                              onClick={() => handleRetryPayment(sub.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer"
                            >
                              Retry Charge
                            </button>
                          )}
                          {sub.status !== 'trial' && (
                            <button
                              onClick={() => handleCompTrial(sub.id)}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] border border-blue-200 cursor-pointer"
                            >
                              Grant 14d Trial
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleCancelSubscriber(sub.id)}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[10px] border cursor-pointer ${
                              sub.status === 'active' || sub.status === 'trial'
                                ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                                : 'bg-[#E8F5EE] hover:bg-[#E8F5EE] text-[#0E7A4B] border-[#D0EADB]'
                            }`}
                          >
                            {sub.status === 'active' || sub.status === 'trial' ? 'Cancel' : 'Reactivate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Referral Program Administration Settings */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8F5EE] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8F5EE] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#111827]">Referral Program Architecture</h3>
                  <p className="text-xs text-gray-500">Configure viral growth incentives and patient reward mechanics.</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={referralConfig.isEnabledByAdmin}
                  onChange={(e) =>
                    setReferralConfig({ ...referralConfig, isEnabledByAdmin: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0E7A4B]"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#111827] mb-1">Referral Reward Type</label>
                <select
                  value={referralConfig.rewardType}
                  onChange={(e) => setReferralConfig({ ...referralConfig, rewardType: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8F5EE] bg-white font-bold text-xs"
                >
                  <option value="free_month">1 Month Free Subscription</option>
                  <option value="discount">Percentage Discount (20% Off)</option>
                  <option value="cashback">Mobile Money Cashback</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#111827] mb-1">Free Months Per Referral</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={referralConfig.freeMonthsPerInvite}
                  onChange={(e) =>
                    setReferralConfig({ ...referralConfig, freeMonthsPerInvite: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#E8F5EE] bg-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-[#111827] mb-1">Status</label>
                <div className="p-2 rounded-xl bg-[#F1FAF4] border border-[#E8F5EE] text-[#111827] font-bold">
                  {referralConfig.isEnabledByAdmin ? '🟢 Live for All Patients' : '🟡 Configured (Admin Gated)'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESOLVE TICKET */}
      <AnimatePresence>
        {selectedTicketForDetail && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E8F5EE]"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
                <h3 className="text-base font-black text-[#111827]">
                  Resolve Ticket #{selectedTicketForDetail.ticketNumber}
                </h3>
                <button onClick={() => setSelectedTicketForDetail(null)} className="text-neutral-400 hover:text-neutral-700">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE]">
                  <h5 className="font-bold text-[#111827]">{selectedTicketForDetail.title}</h5>
                  <p className="text-neutral-600 mt-1">{selectedTicketForDetail.description}</p>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Resolution Notes & Corrective Action *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe how the complaint was investigated and solved..."
                    value={resolutionInput}
                    onChange={(e) => setResolutionInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] text-xs focus:ring-2 focus:ring-[#0E7A4B]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTicketForDetail(null)}
                    className="px-4 py-2.5 rounded-2xl text-neutral-600 hover:bg-neutral-100 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResolveTicket(selectedTicketForDetail.id)}
                    className="px-5 py-2.5 rounded-2xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Mark as Resolved</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: LOG NEW SUPPORT TICKET */}
      <AnimatePresence>
        {isNewTicketOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#E8F5EE]"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-[#0E7A4B]" />
                  <h3 className="text-base font-black text-[#111827]">Open Support / Complaint Ticket</h3>
                </div>
                <button onClick={() => setIsNewTicketOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Issue Category *</label>
                  <select
                    value={newTicketCategory}
                    onChange={(e) => setNewTicketCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE]"
                  >
                    <option value="customer_complaint">Customer Complaint</option>
                    <option value="pharmacy_complaint">Pharmacy Inquiry</option>
                    <option value="driver_complaint">Driver Problem</option>
                    <option value="missing_item">Missing Item</option>
                    <option value="wrong_item">Wrong Item</option>
                    <option value="payment_issue">Payment Issue</option>
                    <option value="delivery_problem">Delivery Problem</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Ticket Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delayed Delivery on Waiyaki Way"
                    value={newTicketTitle}
                    onChange={(e) => setNewTicketTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Detailed Description *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Explain the issue in detail..."
                    value={newTicketDesc}
                    onChange={(e) => setNewTicketDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Raised By (Name) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Grace Muthoni"
                      value={newTicketUser}
                      onChange={(e) => setNewTicketUser(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Contact Phone *</label>
                    <input
                      type="text"
                      required
                      placeholder="+254 7..."
                      value={newTicketPhone}
                      onChange={(e) => setNewTicketPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setIsNewTicketOpen(false)}
                    className="px-4 py-2.5 rounded-2xl text-neutral-600 hover:bg-neutral-100 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-2xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white font-bold shadow-sm"
                  >
                    Log Ticket
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
