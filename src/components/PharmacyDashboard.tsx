import React, { useState } from 'react';
import { 
  Order, 
  PharmacyPartner, 
  Language, 
  CountryConfig, 
  PrescriptionData,
  PharmacyInventoryItem,
  MedicineCategory,
  OrderStatus,
  Medicine
} from '../types';
import { TRANSLATIONS } from '../data/translations';
import { SAMPLE_PHARMACIES, SAMPLE_INVENTORY, SAMPLE_MEDICINES } from '../data/mockData';
import { SubmitMedicineForApprovalModal } from './SubmitMedicineForApprovalModal';
import { 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Clock, 
  Package, 
  Thermometer, 
  UserCheck, 
  Phone, 
  MapPin, 
  QrCode, 
  Sparkles, 
  AlertTriangle, 
  Mail, 
  Search, 
  Plus, 
  Filter, 
  Check, 
  Ban, 
  MessageSquare, 
  RefreshCw, 
  Send, 
  Eye, 
  Lock, 
  ChevronDown, 
  Layers, 
  FileCheck, 
  AlertCircle, 
  HelpCircle, 
  Truck,
  Pill,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PharmacyDashboardProps {
  pharmacy?: PharmacyPartner;
  pharmacies?: PharmacyPartner[];
  orders: Order[];
  onApproveOrder: (orderId: string, batchNumber: string, expiryDate: string, pharmacistNotes: string) => void;
  onRejectOrder: (orderId: string, reason: string) => void;
  onDispatchOrder: (orderId: string) => void;
  onAdvanceStatus?: (orderId: string, status: OrderStatus) => void;
  language: Language;
  selectedCountry: CountryConfig;
  medicines?: Medicine[];
  onSubmitNewMedicine?: (medData: Partial<Medicine>) => void;
}

export const PharmacyDashboard: React.FC<PharmacyDashboardProps> = ({
  pharmacy: initialPharmacy,
  pharmacies = SAMPLE_PHARMACIES,
  orders,
  onApproveOrder,
  onRejectOrder,
  onDispatchOrder,
  onAdvanceStatus,
  language,
  selectedCountry,
  medicines: initialMedicines = SAMPLE_MEDICINES,
  onSubmitNewMedicine,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Selected Pharmacy State
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>(
    initialPharmacy?.id || pharmacies[0]?.id || 'pharma-01'
  );

  const activePharmacy = pharmacies.find((p) => p.id === selectedPharmacyId) || initialPharmacy || pharmacies[0];

  // Dashboard Subtabs
  const [activeTab, setActiveTab] = useState<'incoming_orders' | 'inventory' | 'submissions' | 'profile' | 'logs'>('incoming_orders');

  // Submissions State
  const [allMedicines, setAllMedicines] = useState<Medicine[]>(initialMedicines);
  const [isSubmitMedModalOpen, setIsSubmitMedModalOpen] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  const mySubmissions = allMedicines.filter(
    (m) => m.submittedByPharmacyId === activePharmacy.id || m.availablePharmacyIds?.includes(activePharmacy.id)
  );

  const handleInternalSubmitMedicine = (medData: Partial<Medicine>) => {
    const newMed: Medicine = {
      id: `med-custom-${Date.now()}`,
      name: medData.name || 'New Pharmaceutical Product',
      genericName: medData.genericName || '',
      category: medData.category || 'chronic',
      dosage: medData.dosage || 'Standard Dosage',
      form: medData.form || 'tablets',
      packageSize: medData.packageSize || '1 Pack',
      priceUSD: medData.priceUSD || 10,
      requiresPrescription: medData.requiresPrescription ?? true,
      requiresColdChain: medData.requiresColdChain ?? false,
      descriptionEn: medData.descriptionEn || '',
      descriptionAr: medData.descriptionAr || '',
      descriptionSw: medData.descriptionSw || '',
      manufacturer: medData.manufacturer || 'Approved Manufacturer',
      stockCount: medData.stockCount || 50,
      indications: medData.indications || [],
      storageCondition: medData.storageCondition || 'Store in cool dry place',
      availablePharmacyIds: [activePharmacy.id],
      submittedByPharmacyId: activePharmacy.id,
      submittedByPharmacyName: activePharmacy.name,
      submittedAt: new Date().toISOString(),
      approvalStatus: 'pending_approval',
      batchNumber: medData.batchNumber,
      expiryDate: medData.expiryDate,
    };

    setAllMedicines((prev) => [newMed, ...prev]);

    if (onSubmitNewMedicine) {
      onSubmitNewMedicine(medData);
    }

    setSubmissionFeedback(`"${newMed.name}" submitted successfully. Entered "Pending Approval" queue for CMO verification.`);
    setTimeout(() => setSubmissionFeedback(null), 5000);
  };

  // Inventory State
  const [inventory, setInventory] = useState<PharmacyInventoryItem[]>(SAMPLE_INVENTORY);
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategory, setInventoryCategory] = useState<MedicineCategory | 'all'>('all');
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState<'all' | 'available' | 'low_stock' | 'expired'>('all');
  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false);

  // New Inventory Form State
  const [newMedName, setNewMedName] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newCategory, setNewCategory] = useState<MedicineCategory>('pain_fever');
  const [newQuantity, setNewQuantity] = useState(50);
  const [newPriceUSD, setNewPriceUSD] = useState(4.50);
  const [newExpiry, setNewExpiry] = useState('2028-06');
  const [newBatch, setNewBatch] = useState('BATCH-2026-N01');
  const [newStorage, setNewStorage] = useState('Store below 25°C');
  const [newIsColdChain, setNewIsColdChain] = useState(false);
  const [newRequiresRx, setNewRequiresRx] = useState(false);

  // Review & Action Modals
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<Order | null>(null);
  const [batchNumber, setBatchNumber] = useState('BATCH-2026-X98');
  const [expiryDate, setExpiryDate] = useState('11/2027');
  const [pharmacistNotes, setPharmacistNotes] = useState('Prescription authentic. Dosage verified against clinical guidelines.');
  const [rejectReason, setRejectReason] = useState('Out of stock in cold-chain buffer');
  const [isRejecting, setIsRejecting] = useState(false);
  const [isClarificationOpen, setIsClarificationOpen] = useState(false);
  const [clarificationMessage, setClarificationMessage] = useState('');
  const [clarificationSentSuccess, setClarificationSentSuccess] = useState(false);
  const [substitutionModalOrder, setSubstitutionModalOrder] = useState<Order | null>(null);
  const [substituteMedicineName, setSubstituteMedicineName] = useState('');

  // Register New Pharmacy Modal
  const [isRegisterPharmacyOpen, setIsRegisterPharmacyOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regLicense, setRegLicense] = useState('');
  const [regPharmacist, setRegPharmacist] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState(false);

  // Filter orders relevant to this pharmacy or general pool
  const pharmacyOrders = orders.filter(
    (o) => o.pharmacyId === activePharmacy.id || o.status === 'order_received' || o.status === 'waiting_pharmacy'
  );

  const pendingReviewOrders = pharmacyOrders.filter(
    (o) => o.status === 'order_received' || o.status === 'waiting_pharmacy' || o.status === 'prescription_under_review' || o.status === 'submitted' || o.status === 'pharmacist_reviewing'
  );
  
  const inPreparationOrders = pharmacyOrders.filter(
    (o) => o.status === 'pharmacy_accepted' || o.status === 'medicine_being_prepared' || o.status === 'approved' || o.status === 'preparing'
  );

  const readyAndDispatchedOrders = pharmacyOrders.filter(
    (o) => o.status === 'ready_for_pickup' || o.status === 'driver_assigned' || o.status === 'picked_up' || o.status === 'out_for_delivery' || o.status === 'delivered' || o.status === 'in_transit'
  );

  const toLocal = (usdAmount: number) => {
    return (usdAmount * selectedCountry.exchangeRateToUSD).toFixed(0);
  };

  // Safe Expiry Evaluation: Strictly checks if an item is past its expiry date
  const isDateExpired = (expiryStr: string): boolean => {
    if (!expiryStr) return false;
    const parts = expiryStr.split('-');
    if (parts.length < 2) return false;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-indexed
    return year < currentYear || (year === currentYear && month < currentMonth);
  };

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForReview) return;
    onApproveOrder(selectedOrderForReview.id, batchNumber, expiryDate, pharmacistNotes);
    setSelectedOrderForReview(null);
  };

  const handleReject = () => {
    if (!selectedOrderForReview) return;
    onRejectOrder(selectedOrderForReview.id, rejectReason || 'Prescription illegible or requires doctor clarification.');
    setSelectedOrderForReview(null);
    setIsRejecting(false);
  };

  const handleSendClarification = (e: React.FormEvent) => {
    e.preventDefault();
    setClarificationSentSuccess(true);
    setTimeout(() => {
      setClarificationSentSuccess(false);
      setIsClarificationOpen(false);
      setClarificationMessage('');
    }, 1200);
  };

  const handleAddInventoryItem = (e: React.FormEvent) => {
    e.preventDefault();
    const isExpired = isDateExpired(newExpiry);
    const newItem: PharmacyInventoryItem = {
      id: `inv-${Date.now()}`,
      pharmacyId: activePharmacy.id,
      medicineName: newMedName,
      sku: newSku || `SKU-${Date.now().toString().slice(-6)}`,
      category: newCategory,
      dosage: 'Standard Therapeutic Dose',
      form: 'tablets',
      quantity: Number(newQuantity),
      priceUSD: Number(newPriceUSD),
      expiryDate: newExpiry,
      batchNumber: newBatch,
      storageCondition: newStorage,
      isColdChain: newIsColdChain,
      requiresPrescription: newRequiresRx,
      availability: isExpired ? 'expired_blocked' : Number(newQuantity) > 10 ? 'available' : Number(newQuantity) > 0 ? 'low_stock' : 'out_of_stock',
      isExpired: isExpired,
    };

    setInventory((prev) => [newItem, ...prev]);
    setIsAddInventoryOpen(false);
    setNewMedName('');
    setNewSku('');
  };

  const handleUpdateStock = (itemId: string, delta: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          // If expired, never allow turning available
          if (item.isExpired || isDateExpired(item.expiryDate)) {
            return item;
          }
          const newQty = Math.max(0, item.quantity + delta);
          return {
            ...item,
            quantity: newQty,
            availability: newQty > 10 ? 'available' : newQty > 0 ? 'low_stock' : 'out_of_stock',
          };
        }
        return item;
      })
    );
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.medicineName.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                          item.sku.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                          item.batchNumber.toLowerCase().includes(inventorySearch.toLowerCase());
    const matchesCat = inventoryCategory === 'all' || item.category === inventoryCategory;
    const isExpired = item.isExpired || isDateExpired(item.expiryDate);
    
    if (inventoryStatusFilter === 'available') {
      return matchesSearch && matchesCat && !isExpired && item.quantity > 0;
    }
    if (inventoryStatusFilter === 'low_stock') {
      return matchesSearch && matchesCat && !isExpired && item.quantity > 0 && item.quantity <= 10;
    }
    if (inventoryStatusFilter === 'expired') {
      return matchesSearch && matchesCat && isExpired;
    }
    return matchesSearch && matchesCat;
  });

  const isPharmacyVerified = activePharmacy.verificationStatus === 'verified';

  return (
    <div className="space-y-6" id="pharmacy-dashboard-root">
      {/* Top Pharmacy Switcher & Regulatory Compliance Header */}
      <div className="bg-[#084F30] text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#0E7A4B]/40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl bg-white/10 text-emerald-300 flex items-center justify-center border border-white/15 shrink-0 shadow-inner">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {activePharmacy.name}
              </h1>
              {isPharmacyVerified ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-white/15 text-[#E8F5EE] border border-white/20">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Licensed: {activePharmacy.licenseNumber}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/40">
                  <AlertTriangle className="w-4 h-4 text-amber-300" />
                  <span>Pending Admin Verification</span>
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[#E8F5EE]/90 mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Pharmacist: <strong className="text-white">{activePharmacy.pharmacistInCharge}</strong></span>
              <span>•</span>
              <span>{activePharmacy.address}</span>
              <span>•</span>
              <span className="text-emerald-300 font-semibold">{activePharmacy.openingHours || '08:00 AM – 10:00 PM'}</span>
            </p>
          </div>
        </div>

        {/* Pharmacy Selector & Register Action */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <select
              value={selectedPharmacyId}
              onChange={(e) => setSelectedPharmacyId(e.target.value)}
              className="w-full bg-white/10 text-white text-xs font-bold px-4 py-2.5 rounded-2xl border border-white/20 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40 appearance-none pr-8 cursor-pointer"
            >
              {pharmacies.map((p) => (
                <option key={p.id} value={p.id} className="text-neutral-900 bg-white">
                  {p.name} ({p.city}) {p.verificationStatus === 'verified' ? '✓' : '⚠️ Pending'}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-white/70 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => setIsRegisterPharmacyOpen(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 text-emerald-300" />
            <span>Register Branch</span>
          </button>
        </div>
      </div>

      {/* Unverified / Pending Banner Notice */}
      {!isPharmacyVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 text-amber-900 flex items-start gap-3.5 shadow-xs">
          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <h4 className="font-bold text-amber-950">
              Regulatory Approval Required Prior to Public Order Dispatch
            </h4>
            <p className="mt-1 text-amber-800 leading-relaxed">
              In accordance with {selectedCountry.regulatoryBody} guidelines, pharmacy credentials and superintendent pharmacist practicing licenses must be authenticated by the platform compliance desk before this branch accepts live patient orders.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E8F5EE] pb-2">
        <button
          onClick={() => setActiveTab('incoming_orders')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'incoming_orders'
              ? 'bg-[#0E7A4B] text-white shadow-sm'
              : 'bg-white text-[#111827] hover:bg-[#E8F5EE] border border-[#E8F5EE]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Incoming & Active Orders</span>
          {pendingReviewOrders.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#E63946] text-white animate-pulse">
              {pendingReviewOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-[#0E7A4B] text-white shadow-sm'
              : 'bg-white text-[#111827] hover:bg-[#E8F5EE] border border-[#E8F5EE]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Pharmacy Inventory Management</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5EE] text-[#0E7A4B]">
            {inventory.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'submissions'
              ? 'bg-[#0E7A4B] text-white shadow-sm'
              : 'bg-white text-[#111827] hover:bg-[#E8F5EE] border border-[#E8F5EE]'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-[#0E7A4B]" />
          <span>Medicine Approvals & Submissions</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            {mySubmissions.filter((m) => m.approvalStatus === 'pending_approval' || m.approvalStatus === 'under_review').length} Pending
          </span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-[#0E7A4B] text-white shadow-sm'
              : 'bg-white text-[#111827] hover:bg-[#E8F5EE] border border-[#E8F5EE]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>License & Cold-Chain Specs</span>
        </button>
      </div>

      {/* TAB 1: INCOMING & ACTIVE ORDERS */}
      {activeTab === 'incoming_orders' && (
        <div className="space-y-6">
          {/* Incoming Orders Alert Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-[#E8F5EE] shadow-xs flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                {pendingReviewOrders.length}
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Awaiting Verification</h4>
                <p className="text-xs font-semibold text-[#111827] mt-0.5">Pharmacist Review Required</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#E8F5EE] shadow-xs flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-[#E8F5EE] text-[#0E7A4B] flex items-center justify-center font-black">
                {inPreparationOrders.length}
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">In Dispensing Prep</h4>
                <p className="text-xs font-semibold text-[#111827] mt-0.5">Packaging & Tamper Seal</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#E8F5EE] shadow-xs flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black">
                {readyAndDispatchedOrders.length}
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Ready / Dispatched</h4>
                <p className="text-xs font-semibold text-[#111827] mt-0.5">Courier Handshake</p>
              </div>
            </div>
          </div>

          {/* Orders Stream */}
          <div className="space-y-4">
            <h3 className="text-base font-black text-[#111827] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#0E7A4B]" />
              <span>Incoming Prescriptions & Medicine Orders ({pharmacyOrders.length})</span>
            </h3>

            {pharmacyOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#E8F5EE]">
                <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-[#111827]">No Active Orders for this Branch</h4>
                <p className="text-xs text-[#6B7280] mt-1">New incoming customer orders will appear in real time.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pharmacyOrders.map((order) => {
                  const isPending = order.status === 'order_received' || order.status === 'waiting_pharmacy' || order.status === 'prescription_under_review' || order.status === 'submitted' || order.status === 'pharmacist_reviewing';
                  const isPreparing = order.status === 'pharmacy_accepted' || order.status === 'medicine_being_prepared' || order.status === 'approved' || order.status === 'preparing';
                  const isReady = order.status === 'ready_for_pickup';

                  return (
                    <div 
                      key={order.id} 
                      className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all shadow-xs ${
                        isPending ? 'border-amber-300 ring-2 ring-amber-100' : 'border-[#E8F5EE]'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-black text-[#111827] text-base">{order.orderNumber}</span>
                            <span className="text-xs text-neutral-400">• {order.createdAt}</span>
                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              isPending 
                                ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                                : isPreparing 
                                ? 'bg-[#E8F5EE] text-[#0E7A4B] border border-[#D0EADB]' 
                                : 'bg-blue-100 text-blue-900 border border-blue-200'
                            }`}>
                              {order.status.replace(/_/g, ' ')}
                            </span>
                            {order.prescription && (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                <span>Doctor Rx Attached</span>
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-[#6B7280] mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span>Patient: <strong className="text-[#111827]">{order.customerName}</strong> ({order.customerPhone})</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-[#0E7A4B]" />
                              <span>{order.deliveryAddress}, {order.city}</span>
                            </span>
                            <span>•</span>
                            <span className="text-[#0E7A4B] font-bold">{order.distanceKm} km away</span>
                          </p>
                        </div>

                        {/* Order Amount and Payment */}
                        <div className="text-left lg:text-right">
                          <p className="text-lg font-black text-[#111827]">
                            {selectedCountry.currencySymbol} {toLocal(order.totalAmount)}
                            <span className="text-xs font-normal text-neutral-500 ml-1.5">(${order.totalAmount.toFixed(2)})</span>
                          </p>
                          <span className="text-[11px] text-neutral-500 font-medium">
                            Payment: <strong className="text-neutral-700">{order.paymentMethod}</strong> ({order.paymentStatus})
                          </span>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="py-3.5 border-b border-neutral-100">
                        <h5 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Requested Medications:</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#F1FAF4] border border-[#E8F5EE] text-xs">
                              <div>
                                <span className="font-bold text-[#111827]">{item.medicine.name}</span>
                                <p className="text-[11px] text-neutral-500">{item.medicine.dosage} • {item.medicine.packageSize}</p>
                              </div>
                              <div className="text-right">
                                <span className="font-black text-[#111827]">Qty: {item.quantity}</span>
                                <p className="text-[11px] text-[#0E7A4B]">{selectedCountry.currencySymbol} {toLocal(item.unitPrice * item.quantity)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Bar for Pharmacist */}
                      <div className="pt-3.5 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Review Prescription & Verify */}
                          {isPending && (
                            <button
                              onClick={() => {
                                setSelectedOrderForReview(order);
                                setIsRejecting(false);
                              }}
                              className="px-4 py-2 rounded-2xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <FileCheck className="w-4 h-4 text-[#E8F5EE]" />
                              <span>Verify Rx & Accept Order</span>
                            </button>
                          )}

                          {/* Mark Ready for Pickup */}
                          {isPreparing && (
                            <button
                              onClick={() => {
                                if (onAdvanceStatus) {
                                  onAdvanceStatus(order.id, 'ready_for_pickup');
                                } else {
                                  onDispatchOrder(order.id);
                                }
                              }}
                              className="px-4 py-2 rounded-2xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Package className="w-4 h-4 text-[#E8F5EE]" />
                              <span>Confirm Packed & Ready for Pickup</span>
                            </button>
                          )}

                          {/* Handover to Driver */}
                          {isReady && (
                            <button
                              onClick={() => onDispatchOrder(order.id)}
                              className="px-4 py-2 rounded-2xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Truck className="w-4 h-4 text-white" />
                              <span>Handover to Rider (PIN: {order.deliveryOtp})</span>
                            </button>
                          )}

                          {/* Request Clarification */}
                          <button
                            onClick={() => {
                              setSelectedOrderForReview(order);
                              setIsClarificationOpen(true);
                            }}
                            className="px-3.5 py-2 rounded-2xl bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-bold border border-neutral-300 transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                            <span>Request Clarification</span>
                          </button>

                          {/* Out of stock / Substitute */}
                          {isPending && (
                            <button
                              onClick={() => setSubstitutionModalOrder(order)}
                              className="px-3.5 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Medicine Unavailable / Substitute</span>
                            </button>
                          )}
                        </div>

                        {/* Reject / Cancel */}
                        {isPending && (
                          <button
                            onClick={() => {
                              setSelectedOrderForReview(order);
                              setIsRejecting(true);
                            }}
                            className="px-3.5 py-2 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Ban className="w-3.5 h-3.5 text-red-600" />
                            <span>Reject Order</span>
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

      {/* TAB 2: INVENTORY MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Inventory Top Controls */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8F5EE] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-[#111827] flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#0E7A4B]" />
                  <span>Licensed Branch Inventory System</span>
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Track pharmaceutical stock, batch numbers, storage requirements, and expiry control.
                </p>
              </div>

              <button
                onClick={() => setIsAddInventoryOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
              >
                <Plus className="w-4 h-4 text-[#E8F5EE]" />
                <span>Add Medicine to Stock</span>
              </button>
            </div>

            {/* Strict Regulatory Expiry Rule Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
              <span>
                <strong>System Safety Rule:</strong> Expired medications are automatically quarantined and strictly prohibited from appearing as available for customer orders.
              </span>
            </div>

            {/* Search & Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Medicine, SKU, or Batch..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-2xl bg-[#F1FAF4] text-xs border border-[#E8F5EE] focus:outline-none focus:ring-2 focus:ring-[#0E7A4B]"
                />
              </div>

              <div>
                <select
                  value={inventoryCategory}
                  onChange={(e) => setInventoryCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-[#F1FAF4] text-xs border border-[#E8F5EE] focus:outline-none focus:ring-2 focus:ring-[#0E7A4B]"
                >
                  <option value="all">All Categories</option>
                  <option value="chronic">Chronic Care (Diabetes, Cardio)</option>
                  <option value="antibiotics">Antibiotics & Malaria</option>
                  <option value="pain_fever">Pain & Fever Relief</option>
                  <option value="respiratory">Respiratory & Asthma</option>
                  <option value="gastro">Gastrointestinal</option>
                  <option value="vitamins">Vitamins & Supplements</option>
                </select>
              </div>

              <div>
                <select
                  value={inventoryStatusFilter}
                  onChange={(e) => setInventoryStatusFilter(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-[#F1FAF4] text-xs border border-[#E8F5EE] focus:outline-none focus:ring-2 focus:ring-[#0E7A4B]"
                >
                  <option value="all">All Statuses ({inventory.length})</option>
                  <option value="available">Available in Stock</option>
                  <option value="low_stock">Low Stock (≤10)</option>
                  <option value="expired">Expired / Safety Blocked ⚠️</option>
                </select>
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-3xl border border-[#E8F5EE] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F1FAF4] border-b border-[#E8F5EE] text-[#0E7A4B] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-5 py-3.5">Medicine & SKU</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Batch / Expiry</th>
                    <th className="px-4 py-3.5">Unit Price</th>
                    <th className="px-4 py-3.5">Stock Count</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Stock Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8F5EE]">
                  {filteredInventory.map((item) => {
                    const isExpired = item.isExpired || isDateExpired(item.expiryDate);

                    return (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-[#F9FAF9] transition-colors ${
                          isExpired ? 'bg-red-50/50' : ''
                        }`}
                      >
                        <td className="px-5 py-4">
                          <div className="font-bold text-[#111827] text-sm">{item.medicineName}</div>
                          <div className="text-[11px] text-[#6B7280] font-mono mt-0.5">
                            SKU: {item.sku} • {item.dosage}
                          </div>
                          {item.isColdChain && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 border border-blue-200 mt-1">
                              <Thermometer className="w-3 h-3 text-blue-600" />
                              <span>Cold-Chain 2-8°C</span>
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E8F5EE] text-[#0E7A4B] capitalize">
                            {item.category.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="font-mono text-neutral-800 font-semibold">{item.batchNumber}</div>
                          <div className={`text-[11px] font-bold mt-0.5 ${isExpired ? 'text-red-700' : 'text-[#6B7280]'}`}>
                            Exp: {item.expiryDate} {isExpired && '⚠️ (EXPIRED)'}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="font-bold text-[#111827]">
                            {selectedCountry.currencySymbol} {toLocal(item.priceUSD)}
                          </div>
                          <div className="text-[10px] text-neutral-400">(${item.priceUSD.toFixed(2)})</div>
                        </td>

                        <td className="px-4 py-4">
                          <span className={`font-black text-sm ${
                            isExpired ? 'text-red-600 line-through' : item.quantity <= 10 ? 'text-amber-600' : 'text-[#111827]'
                          }`}>
                            {item.quantity} units
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          {isExpired ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 uppercase tracking-wider">
                              <Ban className="w-3 h-3" />
                              <span>Blocked (Expired)</span>
                            </span>
                          ) : item.quantity === 0 ? (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-300">
                              Out of Stock
                            </span>
                          ) : item.quantity <= 10 ? (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                              Low Stock ({item.quantity})
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#E8F5EE] text-[#0E7A4B] border border-[#D0EADB]">
                              Available
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4 text-right">
                          {isExpired ? (
                            <span className="text-[11px] text-red-600 font-semibold italic">
                              Quarantine Disposal
                            </span>
                          ) : (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleUpdateStock(item.id, -10)}
                                className="h-7 w-7 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold flex items-center justify-center cursor-pointer"
                                title="Reduce stock by 10"
                              >
                                -10
                              </button>
                              <button
                                onClick={() => handleUpdateStock(item.id, 10)}
                                className="h-7 w-7 rounded-lg bg-[#E8F5EE] hover:bg-[#D0EADB] text-[#0E7A4B] font-bold flex items-center justify-center cursor-pointer"
                                title="Add stock by 10"
                              >
                                +10
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MEDICINE APPROVALS & SUBMISSIONS */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#E8F5EE] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-[#111827] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#0E7A4B]" />
                  <span>Regulatory Medicine Submissions & Approvals</span>
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Pharmaceutical products submitted by this branch for compliance approval by {selectedCountry.regulatoryBody}.
                </p>
              </div>

              <button
                onClick={() => setIsAddInventoryOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
              >
                <Plus className="w-4 h-4 text-[#E8F5EE]" />
                <span>Submit New Product</span>
              </button>
            </div>

            {submissionFeedback && (
              <div className="p-3.5 rounded-2xl bg-[#E8F5EE] border border-[#D0EADB] text-[#0E7A4B] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{submissionFeedback}</span>
              </div>
            )}
          </div>

          {/* Submissions List */}
          <div className="bg-white rounded-3xl border border-[#E8F5EE] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F1FAF4] border-b border-[#E8F5EE] text-[#0E7A4B] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-5 py-3.5">Medicine & Generic</th>
                    <th className="px-4 py-3.5">Category & Dosage</th>
                    <th className="px-4 py-3.5">Requirements</th>
                    <th className="px-4 py-3.5">Indicative Price</th>
                    <th className="px-4 py-3.5">Regulatory Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8F5EE]">
                  {mySubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-[#6B7280]">
                        No pending medicine submissions for this branch.
                      </td>
                    </tr>
                  ) : (
                    mySubmissions.map((med) => {
                      const status = med.approvalStatus || 'approved';
                      return (
                        <tr key={med.id} className="hover:bg-[#F9FAF9] transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-bold text-[#111827] text-sm">{med.name}</div>
                            <div className="text-[11px] text-[#6B7280]">{med.genericName}</div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E8F5EE] text-[#0E7A4B] capitalize">
                              {med.category.replace('_', ' ')}
                            </span>
                            <div className="text-[11px] text-neutral-500 mt-1">{med.dosage} • {med.form}</div>
                          </td>
                          <td className="px-4 py-4 space-y-1">
                            {med.requiresPrescription && (
                              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200">
                                Rx Required
                              </span>
                            )}
                            {med.requiresColdChain && (
                              <span className="inline-block ml-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                                Cold-Chain (2-8°C)
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-bold text-[#111827]">
                              {selectedCountry.currencySymbol} {toLocal(med.priceUSD)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {status === 'approved' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#E8F5EE] text-[#0E7A4B] border border-[#D0EADB]">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Approved</span>
                              </span>
                            ) : status === 'rejected' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-200">
                                <Ban className="w-3 h-3" />
                                <span>Rejected</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Pending Approval</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PHARMACY PROFILE & COMPLIANCE SPECS */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-[#E8F5EE] shadow-xs space-y-4">
            <h3 className="text-base font-black text-[#111827] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#0E7A4B]" />
              <span>Regulatory Licensing & Premises Permit</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] flex justify-between">
                <span className="text-[#6B7280] font-medium">Regulatory Authority:</span>
                <span className="font-bold text-[#111827]">{activePharmacy.regulatoryAuthority || selectedCountry.regulatoryBody}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] flex justify-between">
                <span className="text-[#6B7280] font-medium">Annual License No:</span>
                <span className="font-mono font-bold text-[#111827]">{activePharmacy.licenseNumber}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] flex justify-between">
                <span className="text-[#6B7280] font-medium">License Expiry Date:</span>
                <span className="font-bold text-[#0E7A4B]">{activePharmacy.licenseExpiryDate || '2027-12-31'}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] flex justify-between">
                <span className="text-[#6B7280] font-medium">Superintendent Pharmacist:</span>
                <span className="font-bold text-[#111827]">{activePharmacy.pharmacistInCharge}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] flex justify-between">
                <span className="text-[#6B7280] font-medium">GPS Location Coordinates:</span>
                <span className="font-mono text-neutral-700">{activePharmacy.coordinates.lat.toFixed(4)}, {activePharmacy.coordinates.lng.toFixed(4)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#E8F5EE] shadow-xs space-y-4">
            <h3 className="text-base font-black text-[#111827] flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-blue-600" />
              <span>Cold-Chain & Dispensing Standards</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-blue-900">Refrigeration Sensor #FRIDGE-01</span>
                  <span className="text-xs font-black text-blue-800">4.1°C (Safe Zone)</span>
                </div>
                <p className="text-[11px] text-blue-700">
                  Calibrated for vaccines, insulin glargine, and maternal oxytocin storage (2°C – 8°C).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] flex justify-between">
                <span className="text-[#6B7280] font-medium">e-Prescription Verification:</span>
                <span className="font-bold text-[#0E7A4B]">Enabled (256-Bit Encrypted)</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] flex justify-between">
                <span className="text-[#6B7280] font-medium">Total Processed Orders:</span>
                <span className="font-black text-[#111827]">{activePharmacy.totalOrdersHandled || 1240}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] flex justify-between">
                <span className="text-[#6B7280] font-medium">Gross Dispensed Value:</span>
                <span className="font-black text-[#111827]">${activePharmacy.revenueUSD?.toLocaleString() || '18,450'} USD</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VERIFY PRESCRIPTION & APPROVE ORDER */}
      <AnimatePresence>
        {selectedOrderForReview && !isRejecting && !isClarificationOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#E8F5EE] my-8"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3.5 mb-4">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-[#0E7A4B]" />
                  <h3 className="text-base font-black text-[#111827]">
                    Pharmacist Clinical Verification
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedOrderForReview(null)}
                  className="p-1 rounded-xl text-neutral-400 hover:text-neutral-700 cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleApprove} className="space-y-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE]">
                  <p className="font-bold text-[#111827]">Order #{selectedOrderForReview.orderNumber}</p>
                  <p className="text-[#6B7280] mt-0.5">Patient: {selectedOrderForReview.customerName} ({selectedOrderForReview.customerPhone})</p>
                  {selectedOrderForReview.prescription && (
                    <div className="mt-2 pt-2 border-t border-[#E8F5EE] text-[11px] text-[#0E7A4B]">
                      <span>Doctor: <strong>{selectedOrderForReview.prescription.doctorName || 'Dr. Registered Prescriber'}</strong></span>
                      <p className="text-neutral-600 italic mt-0.5">"{selectedOrderForReview.prescription.notes || 'As clinically directed'}"</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Assigned Package Batch Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] font-mono text-xs focus:ring-2 focus:ring-[#0E7A4B]"
                    placeholder="e.g. BATCH-2026-X98"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Medicine Expiry Date on Packaging *
                  </label>
                  <input
                    type="text"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] text-xs focus:ring-2 focus:ring-[#0E7A4B]"
                    placeholder="e.g. 11/2027"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Pharmacist Clinical Verification Notes
                  </label>
                  <textarea
                    rows={2}
                    value={pharmacistNotes}
                    onChange={(e) => setPharmacistNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] text-xs focus:ring-2 focus:ring-[#0E7A4B]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#E8F5EE] border border-[#D0EADB] text-[#0E7A4B] text-[11px] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0E7A4B] shrink-0" />
                  <span>Digitally stamped by licensed pharmacist: {activePharmacy.pharmacistInCharge}</span>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrderForReview(null)}
                    className="px-4 py-2.5 rounded-2xl text-neutral-600 hover:bg-neutral-100 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-2xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#E8F5EE]" />
                    <span>Approve & Move to Dispensing</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: REJECT ORDER */}
      <AnimatePresence>
        {selectedOrderForReview && isRejecting && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-200"
            >
              <div className="flex items-center gap-2 text-red-700 font-bold mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="text-base text-red-950">Reject Order & Inform Patient</h3>
              </div>

              <p className="text-xs text-neutral-600 mb-4">
                Please select the clinical or inventory reason for declining this request. The customer will be promptly notified.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Reason for Rejection *</label>
                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] text-xs"
                  >
                    <option value="Out of stock in cold-chain buffer">Medicine out of stock at this location</option>
                    <option value="Prescription image illegible or missing doctor signature">Prescription illegible or incomplete</option>
                    <option value="Dosage exceeds safe therapeutic threshold">Dosage safety warning / contraindication</option>
                    <option value="Requires prescriber direct confirmation">Requires direct physician consultation</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRejecting(false);
                      setSelectedOrderForReview(null);
                    }}
                    className="px-4 py-2.5 rounded-2xl text-neutral-600 hover:bg-neutral-100 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleReject}
                    className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all cursor-pointer shadow-sm"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: REQUEST CLARIFICATION */}
      <AnimatePresence>
        {isClarificationOpen && selectedOrderForReview && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-blue-200"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-3">
                <div className="flex items-center gap-2 text-blue-900 font-bold">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base text-[#111827]">Send Clarification Query</h3>
                </div>
                <button onClick={() => setIsClarificationOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {clarificationSentSuccess ? (
                <div className="py-6 text-center text-xs">
                  <CheckCircle2 className="w-10 h-10 text-[#0E7A4B] mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-[#111827]">Clarification Message Dispatched</h4>
                  <p className="text-[#6B7280] mt-1">SMS & WhatsApp push notification sent to {selectedOrderForReview.customerName}.</p>
                </div>
              ) : (
                <form onSubmit={handleSendClarification} className="space-y-3 text-xs">
                  <p className="text-neutral-600">
                    Send an authenticated clinical message to <strong>{selectedOrderForReview.customerName}</strong> regarding Order #{selectedOrderForReview.orderNumber}.
                  </p>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Clinical Message / Query *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="e.g. Please confirm if doctor prescribed 625mg or 1g, or upload a clearer photo of the clinic stamp."
                      value={clarificationMessage}
                      onChange={(e) => setClarificationMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] text-xs focus:ring-2 focus:ring-[#0E7A4B]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsClarificationOpen(false)}
                      className="px-4 py-2.5 rounded-2xl text-neutral-600 hover:bg-neutral-100 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-2xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Send className="w-4 h-4 text-[#E8F5EE]" />
                      <span>Send to Patient</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: MEDICINE SUBSTITUTION */}
      <AnimatePresence>
        {substitutionModalOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-200"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base text-[#111827]">Suggest Medicine Substitute</h3>
                </div>
                <button onClick={() => setSubstitutionModalOrder(null)} className="text-neutral-400 hover:text-neutral-700">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <p className="text-neutral-600">
                  Notify <strong>{substitutionModalOrder.customerName}</strong> that an item in Order #{substitutionModalOrder.orderNumber} is unavailable at this branch, and propose a bioequivalent generic alternative.
                </p>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Available Bioequivalent / Generic Alternative</label>
                  <input
                    type="text"
                    placeholder="e.g. Augmentin 625mg instead of Clavulin"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] text-xs focus:ring-2 focus:ring-[#0E7A4B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Clinical Note to Patient</label>
                  <textarea
                    rows={2}
                    placeholder="Same active ingredient and strength. Price difference will be adjusted."
                    className="w-full px-3.5 py-2 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] text-xs focus:ring-2 focus:ring-[#0E7A4B]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setSubstitutionModalOrder(null)}
                    className="px-4 py-2.5 rounded-2xl text-neutral-600 hover:bg-neutral-100 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSubstitutionModalOrder(null);
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white font-bold shadow-sm"
                  >
                    Send Substitution Proposal
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD MEDICINE TO INVENTORY */}
      <AnimatePresence>
        {isAddInventoryOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#E8F5EE] my-8"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#0E7A4B]" />
                  <h3 className="text-base font-black text-[#111827]">Add New Medicine to Stock</h3>
                </div>
                <button onClick={() => setIsAddInventoryOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddInventoryItem} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Medicine Brand / Generic Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ciprofloxacin 500mg Tablets"
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE]"
                    >
                      <option value="pain_fever">Pain Relief</option>
                      <option value="antibiotics">Antibiotics</option>
                      <option value="chronic">Chronic Care</option>
                      <option value="respiratory">Respiratory</option>
                      <option value="gastro">Gastrointestinal</option>
                      <option value="vitamins">Vitamins</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Batch Number *</label>
                    <input
                      type="text"
                      required
                      value={newBatch}
                      onChange={(e) => setNewBatch(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Stock Qty *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Price (USD) *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      min={0.1}
                      value={newPriceUSD}
                      onChange={(e) => setNewPriceUSD(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Expiry (YYYY-MM) *</label>
                    <input
                      type="text"
                      required
                      placeholder="2028-06"
                      value={newExpiry}
                      onChange={(e) => setNewExpiry(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newIsColdChain}
                      onChange={(e) => setNewIsColdChain(e.target.checked)}
                      className="rounded text-[#0E7A4B] focus:ring-[#0E7A4B]"
                    />
                    <span className="font-bold text-neutral-700">Requires Cold-Chain (2-8°C)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRequiresRx}
                      onChange={(e) => setNewRequiresRx(e.target.checked)}
                      className="rounded text-[#0E7A4B] focus:ring-[#0E7A4B]"
                    />
                    <span className="font-bold text-neutral-700">Prescription Required</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setIsAddInventoryOpen(false)}
                    className="px-4 py-2.5 rounded-2xl text-neutral-600 hover:bg-neutral-100 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-2xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white font-bold shadow-sm"
                  >
                    Save to Stock
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: REGISTER NEW PHARMACY BRANCH */}
      <AnimatePresence>
        {isRegisterPharmacyOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#E8F5EE] my-8"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#0E7A4B]" />
                  <h3 className="text-base font-black text-[#111827]">Register New Pharmacy Branch</h3>
                </div>
                <button onClick={() => setIsRegisterPharmacyOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {regSuccessMsg ? (
                <div className="py-6 text-center text-xs">
                  <CheckCircle2 className="w-10 h-10 text-[#0E7A4B] mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-[#111827]">Branch Registration Submitted</h4>
                  <p className="text-[#6B7280] mt-1">
                    Your application is under review by {selectedCountry.regulatoryBody} compliance desk. You will receive an activation SMS once verified.
                  </p>
                </div>
              ) : (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    setRegSuccessMsg(true);
                    setTimeout(() => {
                      setRegSuccessMsg(false);
                      setIsRegisterPharmacyOpen(false);
                    }, 1500);
                  }} 
                  className="space-y-3.5 text-xs"
                >
                  <p className="text-[#6B7280]">
                    New branches remain inactive for public customers until administration verifies physical license and superintendent pharmacist certificate.
                  </p>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Pharmacy Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CityCare Pharmacy — Kilimani"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Premises License No *</label>
                      <input
                        type="text"
                        required
                        placeholder="PPB/RET/2026/..."
                        value={regLicense}
                        onChange={(e) => setRegLicense(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Superintendent Pharmacist *</label>
                      <input
                        type="text"
                        required
                        placeholder="Dr. Full Name (PharmD/B.Pharm)"
                        value={regPharmacist}
                        onChange={(e) => setRegPharmacist(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Contact Phone *</label>
                      <input
                        type="text"
                        required
                        placeholder="+254 700 ..."
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="pharmacy@domain.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Physical Street Address & City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ground Floor, Plaza 4, Ngong Road, Nairobi"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => setIsRegisterPharmacyOpen(false)}
                      className="px-4 py-2.5 rounded-2xl text-neutral-600 hover:bg-neutral-100 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-2xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white font-bold shadow-sm"
                    >
                      Submit for Admin Verification
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
