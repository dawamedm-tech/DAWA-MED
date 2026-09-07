import React, { useState } from 'react';
import { 
  Stethoscope, 
  Search, 
  AlertOctagon, 
  PhoneCall, 
  CheckCircle2, 
  X, 
  Pill, 
  Clock, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { SymptomGuidanceItem, Language } from '../../types';

interface SymptomTriageAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSelectOtcMedicine?: (otcName: string) => void;
}

export const SymptomTriageAssistant: React.FC<SymptomTriageAssistantProps> = ({
  isOpen,
  onClose,
  language,
  onSelectOtcMedicine
}) => {
  const isRtl = language === 'ar';
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SymptomGuidanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (symptomQuery: string) => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/clinical/symptom-guidance?q=${encodeURIComponent(symptomQuery)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.guidance)) {
        setResults(data.guidance);
      }
    } catch (e) {
      console.error('Error fetching symptom guidance:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      id="symptom-triage-modal"
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-teal-800 to-emerald-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {isRtl ? 'دليل الأعراض والتوجيه الصيدلي الآمن' : 'Symptom-to-OTC Guidance Assistant'}
              </h2>
              <p className="text-xs text-emerald-200">
                {isRtl 
                  ? 'إرشاد غير تشخيصي لرعاية الأعراض الخفيفة ورصد العلامات الحمراء الطارئة'
                  : 'Non-diagnostic clinical guidance for mild symptoms & emergency red-flag triage'}
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

        {/* Search Bar */}
        <div className="p-4 bg-neutral-50 border-b border-neutral-200 shrink-0">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              placeholder={isRtl ? 'ابحث عن العرض (مثال: صداع، حموضة، حساسية، ألم صدر)...' : 'Type symptom (e.g. headache, heartburn, allergy, chest pain)...'}
              className="w-full text-xs sm:text-sm pl-9 pr-9 py-2.5 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setHasSearched(false);
                }}
                className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Symptom Chips */}
          <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
            <span className="text-[11px] text-neutral-500 font-semibold">
              {isRtl ? 'أعراض شائعة:' : 'Common:'}
            </span>
            {[
              { en: 'Headache', ar: 'صداع', q: 'headache' },
              { en: 'Heartburn', ar: 'حموضة', q: 'heartburn' },
              { en: 'Allergies', ar: 'حساسية', q: 'allergy' },
              { en: 'Chest Pain', ar: 'ألم صدر (طوارئ)', q: 'chest' },
              { en: 'Infant Fever', ar: 'حرارة رضيع', q: 'fever' }
            ].map(c => (
              <button
                key={c.q}
                onClick={() => {
                  setQuery(isRtl ? c.ar : c.en);
                  handleSearch(c.q);
                }}
                className="px-2 py-0.5 rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:border-emerald-500 hover:text-emerald-700 text-[11px] transition-colors"
              >
                {isRtl ? c.ar : c.en}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* Disclaimer Banner */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <span className="font-bold">
                {isRtl ? 'إخلاء مسؤولية طبي صارم:' : 'Clinical Boundary Notice:'}
              </span>{' '}
              {isRtl 
                ? 'هذا الدليل لأغراض التثقيف ورعاية الأعراض البسيطة فقط ولا يحل محل التشخيص الطبي. في حال وجود أعراض خطيرة اتصل بالطوارئ فورًا.'
                : 'This tool is strictly non-diagnostic for minor, self-limiting discomforts. Emergency symptoms require immediate professional hospital evaluation.'}
            </p>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              {isRtl ? 'جاري مراجعة البروتوكولات السريرية...' : 'Consulting clinical protocols...'}
            </div>
          ) : results.length === 0 && hasSearched ? (
            <div className="py-8 text-center text-neutral-500 bg-neutral-50 rounded-xl border border-neutral-200">
              <p className="text-xs">
                {isRtl ? 'لم نجد بروتوكولاً مطابقاً. يرجى استشارة الصيدلي المعتمد مباشرة.' : 'No standard OTC protocol matched. Please consult a licensed pharmacist directly.'}
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-neutral-400 space-y-2">
              <Stethoscope className="w-8 h-8 mx-auto text-neutral-300" />
              <p className="text-xs">
                {isRtl ? 'اكتب العرض الذي تشعر به للبدء' : 'Enter your symptom above to review safe clinical options'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((item) => (
                <div
                  key={item.id}
                  className={`border rounded-xl p-4 transition-all ${
                    item.isEmergencyRedFlag 
                      ? 'border-red-400 bg-red-50/50 shadow-xs' 
                      : 'border-neutral-200 bg-white'
                  }`}
                >
                  {/* Title & Red-flag alert */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className={`text-sm font-bold ${item.isEmergencyRedFlag ? 'text-red-900' : 'text-neutral-900'}`}>
                        {isRtl ? item.symptomAr : item.symptomEn}
                      </h4>
                      <span className="text-[10px] text-neutral-500 font-medium">
                        {item.category}
                      </span>
                    </div>

                    {item.isEmergencyRedFlag && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white border border-red-700 animate-pulse flex items-center gap-1">
                        <AlertOctagon className="w-3 h-3" />
                        {isRtl ? 'علامة حمراء طارئة' : 'Emergency Red Flag'}
                      </span>
                    )}
                  </div>

                  {/* Red Flag Emergency Box */}
                  {item.isEmergencyRedFlag ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-xs font-semibold text-red-950 leading-relaxed">
                        {isRtl ? item.redFlagWarningAr : item.redFlagWarningEn}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                        <a
                          href="tel:999"
                          className="w-full sm:w-auto px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                        >
                          <PhoneCall className="w-4 h-4" />
                          <span>{isRtl ? 'الاتصال بالطوارئ الوطنية (999)' : 'Call National Emergency (999 / 911)'}</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    /* Safe OTC Guidance */
                    <div className="space-y-3">
                      {item.recommendedOtcs && item.recommendedOtcs.length > 0 && (
                        <div>
                          <h5 className="text-xs font-bold text-neutral-800 mb-1.5 flex items-center gap-1">
                            <Pill className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{isRtl ? 'خيارات الأدوية المتاحة بدون وصفة (OTC):' : 'Evidence-Based OTC Options:'}</span>
                          </h5>
                          <div className="space-y-2">
                            {item.recommendedOtcs.map((otc, i) => (
                              <div key={i} className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-between text-xs">
                                <div>
                                  <span className="font-bold text-neutral-900 block">{otc.genericName}</span>
                                  <span className="text-[11px] text-neutral-600">
                                    {isRtl ? otc.purposeAr : otc.purposeEn} • {isRtl ? `أمثلة: ${otc.brandExamples.join('، ')}` : `e.g. ${otc.brandExamples.join(', ')}`}
                                  </span>
                                  <span className="text-[10px] text-amber-700 font-semibold block mt-0.5 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {isRtl ? `الحد الأقصى للاستخدام الذاتي: ${otc.maxDurationDays} أيام` : `Max safe self-care duration: ${otc.maxDurationDays} days`}
                                  </span>
                                </div>
                                {onSelectOtcMedicine && (
                                  <button
                                    onClick={() => {
                                      onSelectOtcMedicine(otc.genericName);
                                      onClose();
                                    }}
                                    className="px-2.5 py-1 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 shrink-0 ml-2"
                                  >
                                    {isRtl ? 'عرض الدواء' : 'View Med'}
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Lifestyle Advice */}
                      {item.lifestyleAdviceEn && item.lifestyleAdviceEn.length > 0 && (
                        <div className="text-xs text-neutral-700 space-y-1">
                          <span className="font-bold text-neutral-800 block">
                            {isRtl ? 'إرشادات الرعاية المنزلية:' : 'Supportive Care & Lifestyle Measures:'}
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-neutral-600 pl-1">
                            {(isRtl ? item.lifestyleAdviceAr : item.lifestyleAdviceEn).map((adv, i) => (
                              <li key={i}>{adv}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* When to see doctor */}
                      <div className="p-2.5 bg-neutral-100 rounded-lg text-xs text-neutral-800">
                        <span className="font-bold text-neutral-900">
                          {isRtl ? 'متى يجب مراجعة الطبيب؟' : 'When to see a doctor:'}
                        </span>{' '}
                        {isRtl ? item.whenToSeeDoctorAr : item.whenToSeeDoctorEn}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-neutral-100 border-t border-neutral-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 text-white rounded-xl text-xs font-semibold hover:bg-neutral-900 transition-colors"
          >
            {isRtl ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
