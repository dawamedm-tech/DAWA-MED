import React from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  PhoneCall, 
  X, 
  ChevronRight, 
  FileText
} from 'lucide-react';
import { DrugInteractionWarning, Language } from '../../types';

interface ClinicalSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  warnings: DrugInteractionWarning[];
  language: Language;
  onConfirmWithConsultation?: () => void;
  onRemoveItem?: (medicineName: string) => void;
}

export const ClinicalSafetyModal: React.FC<ClinicalSafetyModalProps> = ({
  isOpen,
  onClose,
  warnings,
  language,
  onConfirmWithConsultation,
  onRemoveItem
}) => {
  const isRtl = language === 'ar';

  if (!isOpen || warnings.length === 0) return null;

  const hasSevereRisk = warnings.some(w => w.severity === 'high');

  return (
    <div 
      className="fixed inset-0 z-50 bg-neutral-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      id="clinical-safety-modal"
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-red-200 overflow-hidden flex flex-col max-h-[90vh]"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className={`px-5 py-4 text-white flex items-center justify-between shrink-0 ${
          hasSevereRisk 
            ? 'bg-gradient-to-r from-red-700 to-rose-900' 
            : 'bg-gradient-to-r from-amber-600 to-orange-700'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              {hasSevereRisk ? (
                <AlertOctagon className="w-5 h-5 text-red-200 animate-pulse" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-200" />
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {isRtl ? 'تنبيه سلامة دوائي سريري هام' : 'Clinical Drug Safety & Allergy Warning'}
              </h2>
              <p className="text-xs text-white/80">
                {isRtl 
                  ? 'تم رصد تعارض دوائي أو تكرار في المادة الفعالة في سلة أدويتك'
                  : 'Automated screening identified potential drug conflicts in your order'}
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

        {/* Warnings List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-start gap-2">
            <AlertOctagon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">
                {isRtl ? 'توجيه الصيدلي المعتمد:' : 'Clinical Pharmacy Mandate:'}
              </span>{' '}
              {isRtl 
                ? 'سلامة المريض تأتي أولاً. لا يمكن صرف هذه الأدوية معًا دون تدخل وتدقيق الصيدلي المعتمد لتعديل الجرعات أو تغيير المستحضر.'
                : 'Patient safety is strictly enforced. These items cannot be combined without licensed clinical pharmacist oversight to adjust dosage or recommend an alternative.'}
            </div>
          </div>

          {warnings.map((w, index) => (
            <div 
              key={index}
              className={`border rounded-xl p-4 transition-all ${
                w.severity === 'high' 
                  ? 'border-red-300 bg-red-50/40' 
                  : 'border-amber-300 bg-amber-50/40'
              }`}
            >
              {/* Warning Title & Badge */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className={`text-sm font-bold ${w.severity === 'high' ? 'text-red-900' : 'text-amber-900'}`}>
                  {isRtl ? w.titleAr : w.titleEn}
                </h4>
                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border ${
                  w.severity === 'high' 
                    ? 'bg-red-100 text-red-800 border-red-300' 
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}>
                  {w.severity}
                </span>
              </div>

              {/* Drugs Involved */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs text-neutral-700 mb-2">
                <span className="font-semibold text-neutral-900">
                  {isRtl ? 'الأدوية المتعارضة:' : 'Involved:'}
                </span>
                {w.drugsInvolved.map((drug, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white border border-neutral-200 rounded-md font-mono text-[11px] text-neutral-800">
                    {drug}
                  </span>
                ))}
              </div>

              {/* Clinical Description */}
              <p className="text-xs text-neutral-700 leading-relaxed mb-2">
                {isRtl ? w.descriptionAr : w.descriptionEn}
              </p>

              {/* Actionable Clinical Advice */}
              <div className="p-2.5 bg-white rounded-lg border border-neutral-200 text-xs text-neutral-800 flex items-start gap-2">
                <FileText className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-900">
                    {isRtl ? 'التوصية الطبية:' : 'Clinical Advice:'}
                  </span>{' '}
                  {isRtl ? w.clinicalAdviceAr : w.clinicalAdviceEn}
                </div>
              </div>

              {/* Remove one of the conflicting medicines button */}
              {onRemoveItem && w.drugsInvolved.length > 0 && (
                <div className="mt-3 pt-2 border-t border-neutral-200/60 flex items-center justify-end gap-2 text-xs">
                  <span className="text-[11px] text-neutral-500">
                    {isRtl ? 'إزالة المستحضر لمنع التضارب:' : 'Remove item to resolve conflict:'}
                  </span>
                  {w.drugsInvolved.map((drug, i) => (
                    <button
                      key={i}
                      onClick={() => onRemoveItem(drug)}
                      className="px-2.5 py-1 bg-neutral-100 hover:bg-red-50 text-neutral-700 hover:text-red-700 border border-neutral-300 hover:border-red-300 rounded-lg font-medium transition-colors text-[11px]"
                    >
                      {isRtl ? `حذف ${drug}` : `Remove ${drug}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 bg-neutral-100 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 border border-neutral-300 bg-white text-neutral-700 rounded-xl text-xs font-semibold hover:bg-neutral-50"
          >
            {isRtl ? 'تعديل السلة يدويًا' : 'Modify Cart Items'}
          </button>

          {onConfirmWithConsultation && (
            <button
              onClick={onConfirmWithConsultation}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
              id="btn-request-pharmacist-consult"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>
                {isRtl ? 'طلب مراجعة واستشارة الصيدلي المعتمد' : 'Proceed with Pharmacist Consultation'}
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
