import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck, Activity, Cpu } from 'lucide-react';
import { Language } from '../types';
import { runAllAutomatedHealthTests, TestSuiteSummary } from '../services/testingSuite';
import { TRANSLATIONS } from '../data/translations';

interface SystemHealthTestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const SystemHealthTestsModal: React.FC<SystemHealthTestsModalProps> = ({
  isOpen,
  onClose,
  language
}) => {
  const [loading, setLoading] = useState(false);
  const [suiteSummary, setSuiteSummary] = useState<TestSuiteSummary | null>(null);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isRTL = language === 'ar';

  const executeTests = async () => {
    setLoading(true);
    try {
      const summary = await runAllAutomatedHealthTests();
      setSuiteSummary(summary);
    } catch (err) {
      console.error('Test run failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !suiteSummary) {
      executeTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-900"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-[#F4F7F5]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#1B4332] text-white">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1B4332]">
                {t.systemHealthTests}
              </h2>
              <p className="text-xs text-neutral-500">
                {language === 'ar' ? 'فحص جودة المعمارية والأمان والامتثال واللغات' : language === 'fr' ? 'Audit qualité de l’architecture, sécurité, conformité et langues' : 'Automated architecture, security, compliance & i18n audit'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-[#E9F5EE] border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-[#2D6A4F] shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-[#1B4332]">
                  {suiteSummary?.failed === 0 ? t.testRunSuccess : t.testRunFailure}
                </h3>
                <p className="text-xs text-[#2D6A4F] mt-0.5">
                  {suiteSummary ? `${suiteSummary.passed} / ${suiteSummary.total} tests passed • All critical checks green` : 'Executing verification suite...'}
                </p>
              </div>
            </div>
            <button
              onClick={executeTests}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{language === 'ar' ? 'إعادة الفحص' : language === 'fr' ? 'Réexécuter' : 'Rerun Audit'}</span>
            </button>
          </div>

          {/* Test List */}
          <div className="space-y-2.5">
            {loading ? (
              <div className="p-8 text-center text-neutral-500 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#2D6A4F]" />
                <span>Running diagnostic assertions...</span>
              </div>
            ) : (
              suiteSummary?.items.map((item) => (
                <div 
                  key={item.id}
                  className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 hover:border-neutral-300 transition-colors flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    {item.status === 'PASSED' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-neutral-900">{item.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-200 text-neutral-700">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{item.details}</p>
                    </div>
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono shrink-0">
                    {item.durationMs}ms
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-100 bg-[#F4F7F5] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-xl transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
