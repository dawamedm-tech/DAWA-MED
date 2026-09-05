import React, { useState } from 'react';
import { Medicine, MedicineCategory, Language, CountryConfig } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { 
  X, 
  Pill, 
  ShieldCheck, 
  AlertTriangle, 
  Thermometer, 
  Upload, 
  FileText, 
  Sparkles,
  CheckCircle2,
  Clock,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';

interface SubmitMedicineForApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitMedicine: (medData: Partial<Medicine>) => void;
  pharmacyName?: string;
  pharmacyId?: string;
  language: Language;
  selectedCountry: CountryConfig;
}

export const SubmitMedicineForApprovalModal: React.FC<SubmitMedicineForApprovalModalProps> = ({
  isOpen,
  onClose,
  onSubmitMedicine,
  pharmacyName = 'Licensed Pharmacy',
  pharmacyId = 'pharma-01',
  language,
  selectedCountry,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [category, setCategory] = useState<MedicineCategory>('chronic');
  const [dosage, setDosage] = useState('500mg');
  const [form, setForm] = useState<'tablets' | 'capsules' | 'syrup' | 'inhaler' | 'injection' | 'drops' | 'cream' | 'solution'>('tablets');
  const [packageSize, setPackageSize] = useState('30 Tablets / Blister Pack');
  const [priceUSD, setPriceUSD] = useState<number>(8.50);
  const [stockCount, setStockCount] = useState<number>(100);
  const [requiresPrescription, setRequiresPrescription] = useState(true);
  const [requiresColdChain, setRequiresColdChain] = useState(false);
  const [manufacturer, setManufacturer] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('2028-12');
  const [storageCondition, setStorageCondition] = useState('Store at room temperature below 25°C');
  const [regulatoryRegNo, setRegulatoryRegNo] = useState('');
  const [indicationsStr, setIndicationsStr] = useState('Type 2 Diabetes, Blood Glucose Control');
  const [hasCoaDeclaration, setHasCoaDeclaration] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !genericName || !manufacturer) return;

    const medData: Partial<Medicine> = {
      name: name.trim(),
      genericName: genericName.trim(),
      category,
      dosage: dosage.trim(),
      form,
      packageSize: packageSize.trim(),
      priceUSD: Number(priceUSD),
      stockCount: Number(stockCount),
      requiresPrescription,
      requiresColdChain,
      manufacturer: manufacturer.trim(),
      batchNumber: batchNumber.trim() || `BAT-${Date.now().toString().slice(-6)}`,
      expiryDate,
      storageCondition: requiresColdChain ? 'Refrigerated Cold-Chain 2°C – 8°C' : storageCondition,
      indications: indicationsStr.split(',').map((s) => s.trim()).filter(Boolean),
      descriptionEn: `Manufactured by ${manufacturer}. Regulatory verified formulation for clinical dispensing.`,
      descriptionAr: `مُصنع بواسطة ${manufacturer}. تركيبة صيدلانية معتمدة للصرف السريري.`,
      descriptionSw: `Imetengenezwa na ${manufacturer}. Dawa iliyoidhinishwa na daktari.`,
      availablePharmacyIds: [pharmacyId],
      submittedByPharmacyId: pharmacyId,
      submittedByPharmacyName: pharmacyName,
      submittedAt: new Date().toISOString(),
      approvalStatus: 'pending_approval' // STRICT RULE: Must start as pending_approval
    };

    onSubmitMedicine(medData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto" id="submit-medicine-modal-backdrop">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#E8F5EE] my-6"
        id="submit-medicine-modal-container"
      >
        {/* Header */}
        <div className="bg-[#0E7A4B] text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 end-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            id="submit-medicine-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Chief Medical Officer Verification Protocol</span>
          </div>
          <h2 className="text-xl font-black text-white">
            {language === 'ar' ? 'تقديم دواء جديد للاعتماد الإداري' : 'Submit Medicine for Administrative Approval'}
          </h2>
          <p className="text-xs text-white/80 mt-1">
            {pharmacyName} &bull; {selectedCountry.regulatoryBody} Regulatory Standard
          </p>
        </div>

        {/* Notice Card */}
        <div className="p-4 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">
              {language === 'ar' ? 'شرط النشر الإلزامي' : 'Mandatory Approval Gate'}
            </p>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              {language === 'ar'
                ? 'أي دواء تقدمه الصيدلية يدخل تلقائيًا حالة "قيد المراجعة" ولن يظهر للمرضى للشراء إلا بعد تدقيق الإدارة وشهادة التحليل والمطابقة.'
                : 'All submitted medicines automatically enter "Pending Approval" status and will be rigorously verified by the DAWA MED Chief Medical Officer before becoming visible to the public.'}
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                Medicine Trade Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Glucophage XR 500mg"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F1FAF4] border border-[#E8F5EE] text-neutral-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0E7A4B]"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                Active Ingredient / Generic Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Metformin Hydrochloride"
                value={genericName}
                onChange={(e) => setGenericName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F1FAF4] border border-[#E8F5EE] text-neutral-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0E7A4B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#F1FAF4] border border-[#E8F5EE] font-bold text-neutral-700"
              >
                <option value="chronic">Chronic Care</option>
                <option value="antibiotics">Antibiotics</option>
                <option value="pain_fever">Pain & Fever</option>
                <option value="respiratory">Respiratory</option>
                <option value="maternal">Maternal</option>
                <option value="gastro">Gastro</option>
                <option value="vitamins">Vitamins</option>
                <option value="first_aid">First Aid</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Dosage Form</label>
              <select
                value={form}
                onChange={(e) => setForm(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#F1FAF4] border border-[#E8F5EE] font-bold text-neutral-700"
              >
                <option value="tablets">Tablets</option>
                <option value="capsules">Capsules</option>
                <option value="syrup">Syrup / Suspension</option>
                <option value="injection">Injection / Vial</option>
                <option value="inhaler">Inhaler</option>
                <option value="drops">Drops</option>
                <option value="cream">Cream / Ointment</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Dosage Strength</label>
              <input
                type="text"
                required
                placeholder="e.g. 500mg"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#F1FAF4] border border-[#E8F5EE] font-semibold text-neutral-800"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Price (USD)</label>
              <input
                type="number"
                step="0.10"
                min="0.50"
                required
                value={priceUSD}
                onChange={(e) => setPriceUSD(parseFloat(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-[#F1FAF4] border border-[#E8F5EE] font-bold text-neutral-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Manufacturer *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dawa Pharmaceuticals Ltd"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F1FAF4] border border-[#E8F5EE] text-neutral-800 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Batch / Lot Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. BAT-2026-M09"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F1FAF4] border border-[#E8F5EE] text-neutral-800 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Expiry Date (YYYY-MM) *</label>
              <input
                type="month"
                required
                min="2026-09"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F1FAF4] border border-[#E8F5EE] text-neutral-800 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Indications (comma separated)</label>
              <input
                type="text"
                placeholder="e.g. Diabetes, Hypertension, Fever"
                value={indicationsStr}
                onChange={(e) => setIndicationsStr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F1FAF4] border border-[#E8F5EE] text-neutral-800"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Initial Stock Units</label>
              <input
                type="number"
                min="1"
                value={stockCount}
                onChange={(e) => setStockCount(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F1FAF4] border border-[#E8F5EE] text-neutral-800 font-semibold"
              />
            </div>
          </div>

          {/* Compliance Checkboxes */}
          <div className="p-4 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] space-y-2.5">
            <label className="flex items-center gap-2.5 cursor-pointer font-bold text-neutral-800">
              <input
                type="checkbox"
                checked={requiresPrescription}
                onChange={(e) => setRequiresPrescription(e.target.checked)}
                className="w-4 h-4 text-[#111827] rounded-sm focus:ring-[#0E7A4B]"
              />
              <span>Requires Valid Doctor's Prescription (Rx Only)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer font-bold text-neutral-800">
              <input
                type="checkbox"
                checked={requiresColdChain}
                onChange={(e) => setRequiresColdChain(e.target.checked)}
                className="w-4 h-4 text-[#111827] rounded-sm focus:ring-[#0E7A4B]"
              />
              <span className="inline-flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-sky-600" />
                Requires Insulated Cold-Chain Handling (2°C – 8°C)
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer font-bold text-[#111827] pt-1">
              <input
                type="checkbox"
                required
                checked={hasCoaDeclaration}
                onChange={(e) => setHasCoaDeclaration(e.target.checked)}
                className="w-4 h-4 text-[#111827] rounded-sm focus:ring-[#0E7A4B]"
              />
              <span>I certify that this product has an active Certificate of Analysis (COA) and complies with national pharmacopeia standards.</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-neutral-600 hover:bg-neutral-100 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white font-bold shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Submit for Admin Review
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
