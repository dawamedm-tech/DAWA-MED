import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Check, 
  X, 
  Pill, 
  ShieldCheck, 
  Building2, 
  ArrowRight
} from 'lucide-react';
import { GenericAlternative, Medicine, Language } from '../../types';

interface GenericAlternativesModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
  language: Language;
  onSwitchToGeneric: (generic: GenericAlternative) => void;
}

export const GenericAlternativesModal: React.FC<GenericAlternativesModalProps> = ({
  isOpen,
  onClose,
  medicine,
  language,
  onSwitchToGeneric
}) => {
  const isRtl = language === 'ar';
  const [alternatives, setAlternatives] = useState<GenericAlternative[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && medicine) {
      setIsLoading(true);
      fetch(`/api/medicines/${medicine.id}/generic-alternatives`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.alternatives)) {
            setAlternatives(data.alternatives);
          } else {
            setAlternatives([]);
          }
        })
        .catch(err => {
          console.error('Error fetching generic alternatives:', err);
          setAlternatives([]);
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, medicine]);

  if (!isOpen || !medicine) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      id="generic-alternatives-modal"
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {isRtl ? 'بدائل الأدوية الجنيسة المعتمدة وتوفير التكاليف' : 'Approved Generic Alternatives & Cost Savings'}
              </h2>
              <p className="text-xs text-emerald-200">
                {isRtl 
                  ? 'نفس المادة الفعالة والجرعة بجودة معتمدة وسعر أوفر' 
                  : 'Identical active chemical compound & bioequivalence with substantial price savings'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* Current Selected Medicine Card */}
          <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                {isRtl ? 'الدواء الحالي في اختيارك:' : 'Currently Selected Brand:'}
              </span>
              <h4 className="text-sm font-bold text-neutral-900">{medicine.name}</h4>
              <p className="text-xs text-neutral-600">
                {medicine.genericName} • {medicine.dosage}
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-neutral-900">
                ${medicine.priceUSD.toFixed(2)}
              </span>
              <span className="text-[10px] text-neutral-500 block">
                {medicine.manufacturer}
              </span>
            </div>
          </div>

          {/* Alternatives List */}
          <div>
            <h3 className="text-xs font-bold text-neutral-700 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                {isRtl 
                  ? `البدائل المكافئة حيوياً (${alternatives.length})` 
                  : `Bioequivalent Approved Options (${alternatives.length})`}
              </span>
            </h3>

            {isLoading ? (
              <div className="py-8 text-center text-xs text-neutral-500">
                {isRtl ? 'جاري البحث عن البدائل المعتمدة في الصيدليات القريبة...' : 'Checking network pharmacies for bioequivalent generics...'}
              </div>
            ) : alternatives.length === 0 ? (
              <div className="py-8 text-center text-neutral-500 bg-neutral-50 border border-dashed border-neutral-300 rounded-xl">
                <Pill className="w-6 h-6 mx-auto text-neutral-400 mb-1" />
                <p className="text-xs">
                  {isRtl ? 'لا توجد بدائل جنيسة أرخص متوفرة لهذا الصنف حالياً' : 'No cheaper generic alternatives found in network inventory for this specific compound.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {alternatives.map((alt) => (
                  <div
                    key={alt.id}
                    className="border border-emerald-200 bg-emerald-50/30 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-300 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-neutral-900">{alt.name}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {isRtl ? `وفر ${alt.savingsPercentage}%` : `Save ${alt.savingsPercentage}%`}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                          <Check className="w-3 h-3 text-blue-600" />
                          {isRtl ? 'مطابق دوائياً' : 'Bioequivalent'}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-600">
                        <span className="font-semibold text-neutral-800">{alt.activeIngredient}</span> • {alt.strength} • {alt.dosageForm}
                      </p>

                      <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                        <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{alt.pharmacyName}</span>
                        <span>•</span>
                        <span>{alt.manufacturer}</span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-200/60">
                      <div className="text-right">
                        <span className="text-sm font-black text-emerald-800">
                          ${alt.priceUSD.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold block">
                          {isRtl ? `وفر $${alt.savingsUSD.toFixed(2)}` : `Save $${alt.savingsUSD.toFixed(2)}`}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          onSwitchToGeneric(alt);
                          onClose();
                        }}
                        className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-xs active:scale-95"
                      >
                        <span>{isRtl ? 'تبديل وتوفير' : 'Switch & Save'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-neutral-100 border-t border-neutral-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 text-white rounded-xl text-xs font-semibold hover:bg-neutral-900 transition-colors"
          >
            {isRtl ? 'إبقاء الدواء الأصلي' : 'Keep Original Medicine'}
          </button>
        </div>
      </div>
    </div>
  );
};
