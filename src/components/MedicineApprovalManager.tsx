import React, { useState } from 'react';
import { Medicine, MedicineApprovalStatus, Language, CountryConfig } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Thermometer, 
  FileText, 
  Building2, 
  Sparkles,
  RotateCcw,
  MessageSquare,
  Lock,
  Eye,
  AlertCircle,
  HelpCircle,
  Pill,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MedicineApprovalManagerProps {
  medicines: Medicine[];
  onUpdateStatus: (medicineId: string, status: MedicineApprovalStatus, notes?: string, reason?: string) => void;
  language: Language;
  selectedCountry: CountryConfig;
}

export const MedicineApprovalManager: React.FC<MedicineApprovalManagerProps> = ({
  medicines,
  onUpdateStatus,
  language,
  selectedCountry,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MedicineApprovalStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Action Modals State
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'changes' | 'suspend' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('Missing Certificate of Analysis (COA) / Batch Testing');

  const pendingCount = medicines.filter((m) => m.approvalStatus === 'pending_approval' || m.approvalStatus === 'under_review').length;
  const approvedCount = medicines.filter((m) => m.approvalStatus === 'approved').length;
  const rejectedCount = medicines.filter((m) => m.approvalStatus === 'rejected').length;
  const changesCount = medicines.filter((m) => m.approvalStatus === 'changes_requested').length;

  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch = 
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.genericName.toLowerCase().includes(search.toLowerCase()) ||
      (m.submittedByPharmacyName && m.submittedByPharmacyName.toLowerCase().includes(search.toLowerCase())) ||
      (m.batchNumber && m.batchNumber.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || m.approvalStatus === statusFilter;
    const matchesCategory = categoryFilter === 'all' || m.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleOpenAction = (med: Medicine, type: 'approve' | 'reject' | 'changes' | 'suspend') => {
    setSelectedMed(med);
    setActionType(type);
    setActionNotes('');
    if (type === 'reject') {
      setRejectionReason('Missing Certificate of Analysis (COA) / Batch Testing');
    }
  };

  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMed || !actionType) return;

    if (actionType === 'approve') {
      onUpdateStatus(selectedMed.id, 'approved', actionNotes || 'Approved by Chief Medical Officer for public catalog sale.');
    } else if (actionType === 'reject') {
      onUpdateStatus(selectedMed.id, 'rejected', actionNotes, rejectionReason);
    } else if (actionType === 'changes') {
      onUpdateStatus(selectedMed.id, 'changes_requested', actionNotes || 'Please upload updated COA batch certificate.');
    } else if (actionType === 'suspend') {
      onUpdateStatus(selectedMed.id, 'suspended', actionNotes || 'Temporarily suspended pending safety review.');
    }

    setSelectedMed(null);
    setActionType(null);
  };

  const getStatusBadge = (status: MedicineApprovalStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D8F3DC] text-[#1B4332] border border-[#74C69D]/50">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
            {language === 'ar' ? 'معتمد للبيع العام' : language === 'fr' ? 'Approuvé pour la vente' : 'Approved for Sale'}
          </span>
        );
      case 'pending_approval':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            {language === 'ar' ? 'بانتظار موافقة الإدارة' : language === 'fr' ? 'En attente d\'approbation' : 'Pending Admin Approval'}
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">
            <Search className="w-3.5 h-3.5 text-blue-600" />
            {language === 'ar' ? 'قيد التدقيق السريري' : language === 'fr' ? 'En cours d\'examen clinique' : 'Clinical Under Review'}
          </span>
        );
      case 'changes_requested':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-900 border border-orange-200">
            <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
            {language === 'ar' ? 'مطلوب تعديلات ومستندات' : language === 'fr' ? 'Modifications requises' : 'Changes Requested'}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-900 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            {language === 'ar' ? 'مرفوض ومحجوب' : language === 'fr' ? 'Rejeté / Bloqué' : 'Rejected / Blocked'}
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-800 border border-neutral-300">
            <Lock className="w-3.5 h-3.5 text-neutral-600" />
            {language === 'ar' ? 'موقوف مؤقتًا' : language === 'fr' ? 'Suspendu' : 'Suspended'}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6" id="medicine-approval-manager">
      {/* Top Banner Alert on Strict Regulatory Mandate */}
      <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-[#1B4332] to-[#2D6A4F] text-white shadow-md border border-[#52B788]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-white/10 text-[#74C69D] shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white">
                {language === 'ar' ? 'بوابة الموافقة الإلزامية على الأدوية' : language === 'fr' ? 'Portail d\'approbation réglementaire des médicaments' : 'Mandatory Medicine Pre-Publication Gate'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#74C69D] text-[#1B4332]">
                DAWA SAFETY PROTOCOL
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#D8F3DC] mt-1 max-w-3xl leading-relaxed">
              {language === 'ar'
                ? 'وفقًا لقوانين السلامة الصيدلانية، لا يمكن نشر أو بيع أي دواء على المنصة إلا بعد مراجعته واعتماده رسميًا من الإدارة الطبية والتحقق من تاريخ الصلاحية وشهادة التحليل (COA).'
                : language === 'fr'
                ? 'Selon la réglementation, aucun médicament ne peut être publié ni vendu sans validation préalable par la direction médicale et contrôle de conformité du lot.'
                : 'In accordance with pharmaceutical safety regulations, no medicine is published or made available for customer purchase until verified by the Chief Pharmacist / Admin for batch authenticity, expiration date, and regulatory COA.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-xs text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#95D5B2]">Pending Action</p>
            <p className="text-xl font-black text-white">{pendingCount}</p>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-xs text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#95D5B2]">Approved Live</p>
            <p className="text-xl font-black text-white">{approvedCount}</p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => setStatusFilter(statusFilter === 'pending_approval' ? 'all' : 'pending_approval')}
          className={`p-4 rounded-2xl border text-start transition-all cursor-pointer ${
            statusFilter === 'pending_approval' 
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/40 shadow-sm' 
              : 'bg-white border-[#D8E2DC] hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-neutral-600">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-900">{pendingCount}</p>
          <p className="text-[11px] text-amber-700 font-medium mt-0.5">Requires clinical decision</p>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'approved' ? 'all' : 'approved')}
          className={`p-4 rounded-2xl border text-start transition-all cursor-pointer ${
            statusFilter === 'approved' 
              ? 'bg-[#E8F5E9] border-[#81C784] ring-2 ring-[#4CAF50]/30 shadow-sm' 
              : 'bg-white border-[#D8E2DC] hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-neutral-600">Approved & Live</span>
            <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <p className="text-2xl font-black text-[#1B4332]">{approvedCount}</p>
          <p className="text-[11px] text-[#2D6A4F] font-medium mt-0.5">Visible to customers</p>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'changes_requested' ? 'all' : 'changes_requested')}
          className={`p-4 rounded-2xl border text-start transition-all cursor-pointer ${
            statusFilter === 'changes_requested' 
              ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-400/40 shadow-sm' 
              : 'bg-white border-[#D8E2DC] hover:border-orange-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-neutral-600">Changes Requested</span>
            <RotateCcw className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-2xl font-black text-orange-900">{changesCount}</p>
          <p className="text-[11px] text-orange-700 font-medium mt-0.5">Awaiting pharmacy update</p>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'rejected' ? 'all' : 'rejected')}
          className={`p-4 rounded-2xl border text-start transition-all cursor-pointer ${
            statusFilter === 'rejected' 
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400/40 shadow-sm' 
              : 'bg-white border-[#D8E2DC] hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-neutral-600">Rejected / Blocked</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-900">{rejectedCount}</p>
          <p className="text-[11px] text-rose-700 font-medium mt-0.5">Disallowed from sale</p>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#D8E2DC] shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'ar' ? 'بحث بالاسم، التركيبة، الصيدلية أو رقم التشغيلة...' : 'Search medicine name, active ingredient, pharmacy, batch...'}
            className="w-full ps-10 pe-4 py-2.5 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-xs font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2.5 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-xs font-bold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] w-full sm:w-auto"
          >
            <option value="all">All Approval States</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="under_review">Under Review</option>
            <option value="changes_requested">Changes Requested</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-xs font-bold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] w-full sm:w-auto"
          >
            <option value="all">All Categories</option>
            <option value="chronic">Chronic Care</option>
            <option value="antibiotics">Antibiotics</option>
            <option value="pain_fever">Pain & Fever</option>
            <option value="respiratory">Respiratory</option>
            <option value="maternal">Maternal</option>
            <option value="gastro">Gastrointestinal</option>
          </select>
        </div>
      </div>

      {/* Medicines Table / Cards */}
      <div className="space-y-3">
        {filteredMedicines.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-dashed border-[#D8E2DC] text-center">
            <Pill className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-neutral-700">No medicines match your filter</h4>
            <p className="text-xs text-neutral-500 mt-1">Try adjusting the search query or status filter above.</p>
          </div>
        ) : (
          filteredMedicines.map((med) => {
            const isApproved = med.approvalStatus === 'approved';
            const isPending = med.approvalStatus === 'pending_approval' || med.approvalStatus === 'under_review';
            const isChanges = med.approvalStatus === 'changes_requested';
            const isRejected = med.approvalStatus === 'rejected';

            return (
              <div
                key={med.id}
                className={`p-4 sm:p-5 bg-white rounded-2xl border transition-all shadow-xs hover:shadow-md ${
                  isPending 
                    ? 'border-amber-300 ring-1 ring-amber-200/50' 
                    : isChanges 
                    ? 'border-orange-300'
                    : isRejected
                    ? 'border-rose-200 bg-rose-50/20'
                    : 'border-[#D8E2DC]'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Medicine Details */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-black text-[#1B4332]">{med.name}</h4>
                      {getStatusBadge(med.approvalStatus)}
                      {med.requiresPrescription && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800">
                          Rx Required
                        </span>
                      )}
                      {med.requiresColdChain && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-100 text-sky-800 inline-flex items-center gap-1">
                          <Thermometer className="w-3 h-3 text-sky-600" />
                          Cold-Chain (2-8°C)
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-600">
                      <strong>Generic:</strong> {med.genericName} &bull; <strong>Dosage:</strong> {med.dosage} ({med.form}) &bull; <strong>Pack:</strong> {med.packageSize} &bull; <strong>Price:</strong> ${med.priceUSD.toFixed(2)}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-neutral-500 pt-1">
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-[#2D6A4F]" />
                        Submitted by: <strong className="text-neutral-700">{med.submittedByPharmacyName || 'Partner Pharmacy'}</strong>
                      </span>
                      {med.batchNumber && (
                        <span>
                          Batch: <code className="font-mono text-neutral-800 font-semibold">{med.batchNumber}</code>
                        </span>
                      )}
                      {med.expiryDate && (
                        <span>
                          Expiry: <strong className="text-neutral-700">{med.expiryDate}</strong>
                        </span>
                      )}
                      {med.manufacturer && (
                        <span>
                          Manufacturer: <strong className="text-neutral-700">{med.manufacturer}</strong>
                        </span>
                      )}
                    </div>

                    {/* Review Notes / Rejection Reason if any */}
                    {med.changeRequestNotes && (
                      <div className="mt-2 p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-900 flex items-start gap-2">
                        <RotateCcw className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Change Request Notice:</strong> {med.changeRequestNotes}
                        </div>
                      </div>
                    )}
                    {med.rejectionReason && (
                      <div className="mt-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Rejection Justification:</strong> {med.rejectionReason}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 w-full lg:w-auto justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
                    {/* If not approved, can approve */}
                    {!isApproved && (
                      <button
                        onClick={() => handleOpenAction(med, 'approve')}
                        className="px-3.5 py-2 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#74C69D]" />
                        Approve for Public Sale
                      </button>
                    )}

                    {/* Request Changes */}
                    {med.approvalStatus !== 'changes_requested' && (
                      <button
                        onClick={() => handleOpenAction(med, 'changes')}
                        className="px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
                        Request Changes
                      </button>
                    )}

                    {/* Reject */}
                    {med.approvalStatus !== 'rejected' && (
                      <button
                        onClick={() => handleOpenAction(med, 'reject')}
                        className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        Reject
                      </button>
                    )}

                    {/* Suspend / Unsuspend if approved */}
                    {isApproved && (
                      <button
                        onClick={() => handleOpenAction(med, 'suspend')}
                        className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5 text-neutral-600" />
                        Suspend Listing
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Decision Action Modal */}
      <AnimatePresence>
        {selectedMed && actionType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#D8E2DC]"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#2D6A4F]" />
                  <h3 className="text-base font-black text-[#1B4332]">
                    {actionType === 'approve' && 'Approve Medicine for Public Sale'}
                    {actionType === 'reject' && 'Reject Medicine Submission'}
                    {actionType === 'changes' && 'Request Clinical / COA Changes'}
                    {actionType === 'suspend' && 'Suspend Medicine Listing'}
                  </h3>
                </div>
                <button
                  onClick={() => { setSelectedMed(null); setActionType(null); }}
                  className="text-neutral-400 hover:text-neutral-700"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#D8E2DC] mb-4 text-xs space-y-1">
                <p className="font-black text-[#1B4332] text-sm">{selectedMed.name}</p>
                <p className="text-neutral-600">
                  Generic: <strong>{selectedMed.genericName}</strong> ({selectedMed.dosage})
                </p>
                <p className="text-neutral-500">
                  Submitted by: <strong>{selectedMed.submittedByPharmacyName || 'Partner Pharmacy'}</strong>
                </p>
              </div>

              <form onSubmit={handleConfirmAction} className="space-y-4 text-xs">
                {actionType === 'reject' && (
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">
                      Rejection Reason (Regulatory / Safety) *
                    </label>
                    <select
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7F5] border border-[#D8E2DC] font-semibold text-neutral-800"
                    >
                      <option value="Missing Certificate of Analysis (COA) / Batch Testing">Missing Certificate of Analysis (COA) / Batch Testing</option>
                      <option value="Unregistered / Unlicensed Manufacturer">Unregistered / Unlicensed Manufacturer</option>
                      <option value="Near Expiry Batch (Less than 6 Months Shelf-Life)">Near Expiry Batch (Less than 6 Months Shelf-Life)</option>
                      <option value="Cold-Chain Integrity Risk / Insufficient Storage Proof">Cold-Chain Integrity Risk / Insufficient Storage Proof</option>
                      <option value="Dosage & Indication Discrepancy with MOH Register">Dosage & Indication Discrepancy with MOH Register</option>
                      <option value="Duplicate or Conflicting Formulation">Duplicate or Conflicting Formulation</option>
                      <option value="Other Clinical Safety Violation">Other Clinical Safety Violation</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    {actionType === 'approve' ? 'Approval Notes (Optional)' : 'Clinical Notes / Explanation *'}
                  </label>
                  <textarea
                    rows={3}
                    required={actionType === 'changes' || actionType === 'reject'}
                    placeholder={
                      actionType === 'approve'
                        ? 'e.g. Verified against Pharmacy and Poisons Board batch schedule.'
                        : actionType === 'changes'
                        ? 'Explain exactly what documentation or formulation details the pharmacy must provide...'
                        : 'Provide specific feedback for the rejecting decision...'
                    }
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7F5] border border-[#D8E2DC] text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => { setSelectedMed(null); setActionType(null); }}
                    className="px-4 py-2.5 rounded-xl text-neutral-600 hover:bg-neutral-100 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2.5 rounded-xl text-white font-bold shadow-xs cursor-pointer ${
                      actionType === 'approve'
                        ? 'bg-[#1B4332] hover:bg-[#2D6A4F]'
                        : actionType === 'reject'
                        ? 'bg-rose-700 hover:bg-rose-800'
                        : actionType === 'changes'
                        ? 'bg-orange-600 hover:bg-orange-700'
                        : 'bg-neutral-800 hover:bg-neutral-900'
                    }`}
                  >
                    Confirm {actionType.toUpperCase()}
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
