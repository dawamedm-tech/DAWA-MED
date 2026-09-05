import React, { useState } from 'react';
import { PharmacyPartner, PharmacyApprovalStatus, Language, CountryConfig } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { 
  Building2, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Phone, 
  MapPin, 
  Thermometer, 
  FileText, 
  Lock, 
  RotateCcw,
  Sparkles,
  HelpCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PharmacyApprovalManagerProps {
  pharmacies: PharmacyPartner[];
  onUpdatePharmacyStatus: (pharmacyId: string, status: PharmacyApprovalStatus, notes?: string, reason?: string) => void;
  language: Language;
  selectedCountry: CountryConfig;
}

export const PharmacyApprovalManager: React.FC<PharmacyApprovalManagerProps> = ({
  pharmacies,
  onUpdatePharmacyStatus,
  language,
  selectedCountry,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PharmacyApprovalStatus | 'all'>('all');
  
  // Modal state
  const [selectedPharma, setSelectedPharma] = useState<PharmacyPartner | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'info' | 'suspend' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('Invalid or expired Pharmacy and Poisons Board license');

  const pendingCount = pharmacies.filter((p) => p.approvalStatus === 'pending' || p.approvalStatus === 'under_review').length;
  const approvedCount = pharmacies.filter((p) => p.approvalStatus === 'approved').length;
  const suspendedCount = pharmacies.filter((p) => p.approvalStatus === 'suspended').length;
  const rejectedCount = pharmacies.filter((p) => p.approvalStatus === 'rejected').length;

  const filteredPharmacies = pharmacies.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.pharmacistInCharge.toLowerCase().includes(search.toLowerCase()) ||
      p.licenseNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.approvalStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAction = (p: PharmacyPartner, type: 'approve' | 'reject' | 'info' | 'suspend') => {
    setSelectedPharma(p);
    setActionType(type);
    setActionNotes('');
    if (type === 'reject') {
      setRejectionReason('Invalid or expired Pharmacy and Poisons Board license');
    }
  };

  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPharma || !actionType) return;

    if (actionType === 'approve') {
      onUpdatePharmacyStatus(selectedPharma.id, 'approved', actionNotes || 'License verified. Premises inspected and approved for dispensing.');
    } else if (actionType === 'reject') {
      onUpdatePharmacyStatus(selectedPharma.id, 'rejected', actionNotes, rejectionReason);
    } else if (actionType === 'info') {
      onUpdatePharmacyStatus(selectedPharma.id, 'more_info_required', actionNotes || 'Please submit certified pharmacist CPD credentials.');
    } else if (actionType === 'suspend') {
      onUpdatePharmacyStatus(selectedPharma.id, 'suspended', actionNotes || 'Dispensing authority suspended pending compliance review.');
    }

    setSelectedPharma(null);
    setActionType(null);
  };

  const getStatusBadge = (status: PharmacyApprovalStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8F5EE] text-[#111827] border border-[#D0EADB]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0E7A4B]" />
            Licensed & Active
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            Pending Verification
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">
            <Search className="w-3.5 h-3.5 text-blue-600" />
            Under Review
          </span>
        );
      case 'more_info_required':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-900 border border-orange-200">
            <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
            Info Requested
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-800 border border-neutral-300">
            <Lock className="w-3.5 h-3.5 text-neutral-600" />
            Suspended
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-900 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6" id="pharmacy-approval-manager">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0E7A4B] text-white shadow-md border border-[#0B6B43] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-white/10 text-emerald-300 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white">
                {language === 'ar' ? 'اعتماد الصيدليات والامتثال التنظيمي' : language === 'fr' ? 'Validation & Conformité des Pharmacies' : 'Pharmacy Partner Approval & MOH Licensure'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white font-bold">
                {selectedCountry.regulatoryBody}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-3xl leading-relaxed">
              {language === 'ar'
                ? 'فقط الصيدليات المرخصة رسميًا مع صيدلي مسؤول معتمد وتجهيزات سلسلة التبريد المعتمدة يُسمح لها بالصرف واستقبال طلبات المرضى.'
                : 'Only pharmacies with a validated Ministry of Health / Poisons Board registration, certified supervising pharmacist, and validated cold-chain capability can dispense medications.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-xs text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">Pending Review</p>
            <p className="text-xl font-black text-white">{pendingCount}</p>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-xs text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">Active Licensed</p>
            <p className="text-xl font-black text-white">{approvedCount}</p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
          className={`p-4 rounded-2xl border text-start transition-all cursor-pointer ${
            statusFilter === 'pending' 
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/40 shadow-sm' 
              : 'bg-white border-[#E8F5EE] hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-neutral-600">Pending Applications</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-900">{pendingCount}</p>
          <p className="text-[11px] text-amber-700 font-medium mt-0.5">Awaiting inspection check</p>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'approved' ? 'all' : 'approved')}
          className={`p-4 rounded-2xl border text-start transition-all cursor-pointer ${
            statusFilter === 'approved' 
              ? 'bg-[#E8F5EE] border-[#81C784] ring-2 ring-[#4CAF50]/30 shadow-sm' 
              : 'bg-white border-[#E8F5EE] hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-neutral-600">Licensed & Active</span>
            <CheckCircle2 className="w-4 h-4 text-[#0E7A4B]" />
          </div>
          <p className="text-2xl font-black text-[#111827]">{approvedCount}</p>
          <p className="text-[11px] text-[#0E7A4B] font-medium mt-0.5">Dispensing enabled</p>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'suspended' ? 'all' : 'suspended')}
          className={`p-4 rounded-2xl border text-start transition-all cursor-pointer ${
            statusFilter === 'suspended' 
              ? 'bg-neutral-100 border-neutral-400 ring-2 ring-neutral-400/40 shadow-sm' 
              : 'bg-white border-[#E8F5EE] hover:border-neutral-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-neutral-600">Suspended</span>
            <Lock className="w-4 h-4 text-neutral-600" />
          </div>
          <p className="text-2xl font-black text-neutral-900">{suspendedCount}</p>
          <p className="text-[11px] text-neutral-700 font-medium mt-0.5">Orders blocked</p>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'rejected' ? 'all' : 'rejected')}
          className={`p-4 rounded-2xl border text-start transition-all cursor-pointer ${
            statusFilter === 'rejected' 
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400/40 shadow-sm' 
              : 'bg-white border-[#E8F5EE] hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-neutral-600">Rejected</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-900">{rejectedCount}</p>
          <p className="text-[11px] text-rose-700 font-medium mt-0.5">Disqualified partner</p>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8F5EE] shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'ar' ? 'بحث بالاسم، الصيدلي، رقم الترخيص أو المدينة...' : 'Search pharmacy name, pharmacist, license no, city...'}
            className="w-full ps-10 pe-4 py-2.5 bg-[#F1FAF4] border border-[#E8F5EE] rounded-xl text-xs font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#0E7A4B]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2.5 bg-[#F1FAF4] border border-[#E8F5EE] rounded-xl text-xs font-bold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#0E7A4B] w-full sm:w-auto"
        >
          <option value="all">All Approval Statuses</option>
          <option value="pending">Pending Review</option>
          <option value="under_review">Under Review</option>
          <option value="more_info_required">More Info Required</option>
          <option value="approved">Approved & Licensed</option>
          <option value="suspended">Suspended</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Pharmacy Cards List */}
      <div className="space-y-3">
        {filteredPharmacies.map((pharma) => {
          const isApproved = pharma.approvalStatus === 'approved';
          const isPending = pharma.approvalStatus === 'pending' || pharma.approvalStatus === 'under_review';
          const isSuspended = pharma.approvalStatus === 'suspended';

          return (
            <div
              key={pharma.id}
              className={`p-4 sm:p-5 bg-white rounded-2xl border transition-all shadow-xs hover:shadow-md ${
                isPending 
                  ? 'border-amber-300 ring-1 ring-amber-200/50' 
                  : isSuspended
                  ? 'border-neutral-400 bg-neutral-50/50'
                  : 'border-[#E8F5EE]'
              }`}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-black text-[#111827]">{pharma.name}</h4>
                    {getStatusBadge(pharma.approvalStatus)}
                    {pharma.hasColdChain && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-100 text-sky-800 inline-flex items-center gap-1">
                        <Thermometer className="w-3 h-3 text-sky-600" />
                        Cold-Chain Certified
                      </span>
                    )}
                    {pharma.acceptsEPrescription && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        e-Rx Enabled
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-600">
                    <strong>License:</strong> <code className="font-mono text-neutral-800 font-bold">{pharma.licenseNumber}</code> &bull; <strong>Supervising Pharmacist:</strong> {pharma.pharmacistInCharge} ({pharma.pharmacistLicenseNumber || 'Registered'})
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-neutral-500 pt-1">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#0E7A4B]" />
                      {pharma.address}, {pharma.city} ({pharma.countryCode})
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#0E7A4B]" />
                      {pharma.phone}
                    </span>
                    {pharma.rating && (
                      <span>
                        Rating: <strong>★ {pharma.rating.toFixed(1)}</strong>
                      </span>
                    )}
                  </div>

                  {pharma.infoRequestNotes && (
                    <div className="mt-2 p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-900 flex items-start gap-2">
                      <RotateCcw className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Information Request:</strong> {pharma.infoRequestNotes}
                      </div>
                    </div>
                  )}

                  {pharma.rejectionReason && (
                    <div className="mt-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Rejection Reason:</strong> {pharma.rejectionReason}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Toolbar */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 w-full lg:w-auto justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
                  {!isApproved && (
                    <button
                      onClick={() => handleOpenAction(pharma, 'approve')}
                      className="px-3.5 py-2 rounded-xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      Approve & Grant License
                    </button>
                  )}

                  {pharma.approvalStatus !== 'more_info_required' && (
                    <button
                      onClick={() => handleOpenAction(pharma, 'info')}
                      className="px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
                      Request Info
                    </button>
                  )}

                  {isApproved && (
                    <button
                      onClick={() => handleOpenAction(pharma, 'suspend')}
                      className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-neutral-600" />
                      Suspend Pharmacy
                    </button>
                  )}

                  {pharma.approvalStatus !== 'rejected' && (
                    <button
                      onClick={() => handleOpenAction(pharma, 'reject')}
                      className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Modal */}
      <AnimatePresence>
        {selectedPharma && actionType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#E8F5EE]"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#0E7A4B]" />
                  <h3 className="text-base font-black text-[#111827]">
                    {actionType === 'approve' && 'Approve & Validate Pharmacy Partner'}
                    {actionType === 'reject' && 'Reject Pharmacy Application'}
                    {actionType === 'info' && 'Request Additional Pharmacy Verification'}
                    {actionType === 'suspend' && 'Suspend Pharmacy Dispensing Authority'}
                  </h3>
                </div>
                <button
                  onClick={() => { setSelectedPharma(null); setActionType(null); }}
                  className="text-neutral-400 hover:text-neutral-700"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] mb-4 text-xs space-y-1">
                <p className="font-black text-[#111827] text-sm">{selectedPharma.name}</p>
                <p className="text-neutral-600">
                  License: <strong>{selectedPharma.licenseNumber}</strong> &bull; Pharmacist: <strong>{selectedPharma.pharmacistInCharge}</strong>
                </p>
                <p className="text-neutral-500">
                  Location: {selectedPharma.address}, {selectedPharma.city}
                </p>
              </div>

              <form onSubmit={handleConfirmAction} className="space-y-4 text-xs">
                {actionType === 'reject' && (
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">
                      Rejection Reason (Compliance) *
                    </label>
                    <select
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F1FAF4] border border-[#E8F5EE] font-semibold text-neutral-800"
                    >
                      <option value="Invalid or expired Pharmacy and Poisons Board license">Invalid or expired Pharmacy and Poisons Board license</option>
                      <option value="Pharmacist-in-Charge not registered on National Council Register">Pharmacist-in-Charge not registered on National Council Register</option>
                      <option value="Failed Physical Premises & Cold-Chain Inspection">Failed Physical Premises & Cold-Chain Inspection</option>
                      <option value="Fraudulent or Forged Accreditation Documents">Fraudulent or Forged Accreditation Documents</option>
                      <option value="Other Non-Compliance with MOH Standards">Other Non-Compliance with MOH Standards</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    {actionType === 'approve' ? 'Verification Notes (Optional)' : 'Audit / Justification Notes *'}
                  </label>
                  <textarea
                    rows={3}
                    required={actionType === 'info' || actionType === 'reject' || actionType === 'suspend'}
                    placeholder={
                      actionType === 'approve'
                        ? 'e.g. Verified license via PPB national online portal. Cold-chain storage validated.'
                        : 'Explain required documents or reasons for this administrative action...'
                    }
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F1FAF4] border border-[#E8F5EE] text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#0E7A4B]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => { setSelectedPharma(null); setActionType(null); }}
                    className="px-4 py-2.5 rounded-xl text-neutral-600 hover:bg-neutral-100 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2.5 rounded-xl text-white font-bold shadow-xs cursor-pointer ${
                      actionType === 'approve'
                        ? 'bg-[#0E7A4B] hover:bg-[#0B6B43]'
                        : actionType === 'reject'
                        ? 'bg-rose-700 hover:bg-rose-800'
                        : actionType === 'info'
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
