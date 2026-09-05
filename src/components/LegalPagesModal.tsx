import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  RefreshCcw, 
  ThermometerSnowflake, 
  Building2, 
  Bike, 
  Download, 
  Trash2, 
  CheckCircle2 
} from 'lucide-react';
import { Language, UserProfile } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface LegalPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  user: UserProfile | null;
}

type TabType = 'terms' | 'privacy' | 'disclaimer' | 'refund' | 'cold_chain' | 'pharmacy_terms' | 'driver_terms' | 'data_tools';

export const LegalPagesModal: React.FC<LegalPagesModalProps> = ({
  isOpen,
  onClose,
  language,
  user
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('privacy');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [deleteRequested, setDeleteRequested] = useState(false);

  if (!isOpen) return null;

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isRTL = language === 'ar';

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const response = await fetch('/api/privacy/export-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id || 'usr-guest' })
      });
      const data = await response.json();
      
      // Trigger client-side download of health JSON bundle
      const blob = new Blob([JSON.stringify(data.exportBundle || data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DAWA_MED_Health_Records_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(
      language === 'ar' 
        ? 'هل أنت متأكد من رغبتك في حذف حسابك وتجريد بياناتك الطبية نهائياً؟'
        : language === 'fr'
        ? 'Êtes-vous sûr de vouloir supprimer définitivement votre compte et anonymiser vos données ?'
        : 'Are you sure you want to permanently delete your account and anonymize your medical records?'
    )) return;

    try {
      await fetch('/api/privacy/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id || 'usr-guest', reason: 'User requested self-deletion' })
      });
      setDeleteRequested(true);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-900"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-[#F1FAF4]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#0E7A4B] text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#111827]">
                {language === 'ar' ? 'المركز القانوني والامتثال والخصوصية' : language === 'fr' ? 'Centre Juridique, Conformité & Confidentialité' : 'Legal, Compliance & Privacy Centre'}
              </h2>
              <p className="text-xs text-neutral-500">
                {language === 'ar' ? 'معايير الامتثال الدوائي وحماية البيانات الصحية' : language === 'fr' ? 'Normes pharmaceutiques et protection des données de santé' : 'Healthcare regulatory compliance and health data protection'}
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

        {/* Content Body: Sidebar + Main Detail */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Navigation Tabs */}
          <div className="w-full md:w-64 bg-neutral-50 border-b md:border-b-0 md:border-r border-neutral-200 p-3 flex md:flex-col gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'privacy' 
                  ? 'bg-[#0E7A4B] text-white shadow-sm' 
                  : 'text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t.legalPrivacy}</span>
            </button>

            <button
              onClick={() => setActiveTab('terms')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'terms' 
                  ? 'bg-[#0E7A4B] text-white shadow-sm' 
                  : 'text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{t.legalTerms}</span>
            </button>

            <button
              onClick={() => setActiveTab('disclaimer')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'disclaimer' 
                  ? 'bg-[#0E7A4B] text-white shadow-sm' 
                  : 'text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{t.legalDisclaimer}</span>
            </button>

            <button
              onClick={() => setActiveTab('cold_chain')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'cold_chain' 
                  ? 'bg-[#0E7A4B] text-white shadow-sm' 
                  : 'text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <ThermometerSnowflake className="w-4 h-4" />
              <span>{t.legalDelivery}</span>
            </button>

            <button
              onClick={() => setActiveTab('refund')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'refund' 
                  ? 'bg-[#0E7A4B] text-white shadow-sm' 
                  : 'text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <RefreshCcw className="w-4 h-4" />
              <span>{t.legalRefund}</span>
            </button>

            <button
              onClick={() => setActiveTab('pharmacy_terms')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'pharmacy_terms' 
                  ? 'bg-[#0E7A4B] text-white shadow-sm' 
                  : 'text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{t.legalPharmacyTerms}</span>
            </button>

            <button
              onClick={() => setActiveTab('driver_terms')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'driver_terms' 
                  ? 'bg-[#0E7A4B] text-white shadow-sm' 
                  : 'text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>{t.legalDriverTerms}</span>
            </button>

            <div className="pt-2 mt-auto border-t border-neutral-200">
              <button
                onClick={() => setActiveTab('data_tools')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold w-full transition-all ${
                  activeTab === 'data_tools' 
                    ? 'bg-[#0E7A4B] text-white' 
                    : 'text-[#0E7A4B] hover:bg-[#E8F5EE]'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>{language === 'ar' ? 'إدارة وحذف بياناتي' : language === 'fr' ? 'Gestion de mes données' : 'My Health Data Tools'}</span>
              </button>
            </div>
          </div>

          {/* Policy Text Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 text-sm leading-relaxed text-neutral-700">
            {activeTab === 'privacy' && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-base font-bold text-[#111827] border-b pb-2">
                  {t.legalPrivacy} (HIPAA / GDPR / Data Protection Acts)
                </h3>
                <p>
                  {language === 'ar'
                    ? 'في DAWA MED، نلتزم بحماية خصوصية بياناتك الطبية والشخصية بأعلى معايير التشفير (AES-256 و TLS 1.3). نجمع فقط البيانات الضرورية لتوصيل الأدوية والتحقق من الوصفات الطبية من قبل صيدلي مرخص.'
                    : language === 'fr'
                    ? 'Chez DAWA MED, nous protégeons la confidentialité de vos données médicales et personnelles selon les normes de chiffrement les plus strictes (AES-256 et TLS 1.3). Nous ne collectons que les informations indispensables à la délivrance de vos ordonnances par un pharmacien agréé.'
                    : 'At DAWA MED, patient privacy is sacred. We encrypt prescription documents using AES-256 and transmit all telemetry over TLS 1.3. We only gather data required for prescription dispensing by certified pharmacists.'}
                </p>
                <div className="p-4 rounded-xl bg-[#F1FAF4] border border-neutral-200 space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#111827]">
                    {language === 'ar' ? 'مبادئ الأمان الأساسية' : language === 'fr' ? 'Principes Fondamentaux de Sécurité' : 'Core Security Guarantees'}
                  </h4>
                  <ul className="list-disc list-inside text-xs space-y-1 text-neutral-600">
                    <li>{language === 'ar' ? 'عدم إدراج أي تشخيص أو بيانات طبية في رمز QR الخارجي للطرد.' : language === 'fr' ? 'Aucune donnée médicale ou diagnostic n’est encodé dans le QR code extérieur du colis.' : 'Zero medical diagnosis or prescription details in the external package QR code.'}</li>
                    <li>{language === 'ar' ? 'حق المريض في تصدير أو حذف سجلاته الطبية في أي وقت.' : language === 'fr' ? 'Droit du patient d’exporter ou de supprimer ses données médicales à tout moment.' : 'Right to export or permanently delete your health records at any time.'}</li>
                    <li>{language === 'ar' ? 'حصر مراجعة الوصفات بالصيادلة المرخصين رسمياً من السلطات الوطنية.' : language === 'fr' ? 'Accès aux ordonnances strictement réservé aux pharmaciens inscrits à l’Ordre.' : 'Prescription review restricted strictly to state-licensed registered pharmacists.'}</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-base font-bold text-[#111827] border-b pb-2">{t.legalTerms}</h3>
                <p>
                  {language === 'ar'
                    ? 'باستخدامك لمنصة DAWA MED، فإنك توافق على الشروط والأحكام الخاصة بالتوصيل الدوائي. تعمل المنصة كحلقة وصل تقنية آمنة بين المريض والصيدليات المرخصة وفريق التوصيل المعتمد.'
                    : language === 'fr'
                    ? 'En utilisant la plateforme DAWA MED, vous acceptez les présentes conditions générales. DAWA MED opère comme une infrastructure technologique reliant les patients aux officines pharmaceutiques agréées.'
                    : 'By using DAWA MED, you agree to our terms of service. DAWA MED operates as a technology and cold-chain logistics platform connecting users with officially registered pharmacies.'}
                </p>
                <p className="text-xs text-neutral-500">
                  {language === 'ar'
                    ? 'جميع عمليات صرف الأدوية تخضع لموافقة الصيدلي القانوني ووفقاً للوائح السلطة الدوائية في دولتك.'
                    : language === 'fr'
                    ? 'Toute délivrance de médicament est subordonnée à la validation du pharmacien responsable selon les lois locales.'
                    : 'All medicine dispensing is subject to statutory approval by licensed pharmacists under national health regulations.'}
                </p>
              </div>
            )}

            {activeTab === 'disclaimer' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-amber-900 text-sm">{t.legalDisclaimer}</h3>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      {language === 'ar'
                        ? 'تطبيق DAWA MED ليس بديلاً عن الطبيب ولا يقدم استشارات أو تشخيصات طبية مستقلة. في حالات الطوارئ الحرجة والمهددة للحياة، يرجى التوجه فوراً لأقرب قسم طوارئ بالمستشفى.'
                        : language === 'fr'
                        ? 'L’application DAWA MED ne remplace pas l’avis d’un médecin et ne pose aucun diagnostic. En cas d’urgence vitale, rendez-vous immédiatement aux urgences hospitalières les plus proches.'
                        : 'DAWA MED is not a doctor and does not provide unsolicited diagnosis or treatment plans. For acute, life-threatening medical emergencies, please go to your nearest hospital emergency room immediately.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'cold_chain' && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-base font-bold text-[#111827] border-b pb-2">{t.legalDelivery}</h3>
                <p>
                  {language === 'ar'
                    ? 'نضمن حفظ الأدوية الحساسة للحرارة (كالأنواع الحيوية والأنسولين) داخل حقائب معزولة مبردة عند درجات حرارة بين 2 إلى 8 درجات مئوية طوال مسار التوصيل مع مراقبة رقمية مستمرة.'
                    : language === 'fr'
                    ? 'Nous garantissons la conservation des produits thermosensibles (insuline, vaccins) dans des caissons isothermes maintenus entre 2°C et 8°C avec suivi télémétrique.'
                    : 'We guarantee cold-chain integrity (2°C - 8°C) for thermosensitive medicines (insulin, biologics) using validated insulated boxes with telemetry tracking.'}
                </p>
              </div>
            )}

            {activeTab === 'refund' && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-base font-bold text-[#111827] border-b pb-2">{t.legalRefund}</h3>
                <p>
                  {language === 'ar'
                    ? 'نظراً للطبيعة الطبية للأدوية وضوابط السلامة الصيدلانية، لا يمكن استرجاع الأدوية بعد فتح ختم الطرد وتأكيد الاستلام عبر رمز PIN، إلا في حال ثبوت تلف في التغليف المبرد أو خطأ في الصرف قبل الاستلام.'
                    : language === 'fr'
                    ? 'Conformément aux normes pharmaceutiques, les médicaments dont le scellé a été ouvert ne peuvent être repris, sauf en cas de rupture de chaîne du froid avérée ou d’erreur de délivrance constatée à la réception.'
                    : 'Due to healthcare safety regulations, medicines cannot be returned once the tamper seal is opened, except in verified cases of packaging breach or cold-chain excursion prior to handover.'}
                </p>
              </div>
            )}

            {activeTab === 'pharmacy_terms' && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-base font-bold text-[#111827] border-b pb-2">{t.legalPharmacyTerms}</h3>
                <p>
                  {language === 'ar'
                    ? 'تلتزم الصيدليات الشريكة بامتلاك ترخيص ساري المفعول من الهيئة الوطنية للأدوية وتعيين صيدلي مسؤول معتمد للتحقق من كافة الوصفات وتسجيل أرقام التشغيلات وتواريخ الصلاحية.'
                    : language === 'fr'
                    ? 'Les pharmacies partenaires s’engagent à détenir une licence valide délivrée par l’autorité sanitaire nationale et à désigner un pharmacien diplômé pour contrôler chaque ordonnance.'
                    : 'Partner pharmacies must maintain active national regulatory licenses and assign certified pharmacists in charge to verify batches, expiry dates, and e-prescriptions.'}
                </p>
              </div>
            )}

            {activeTab === 'driver_terms' && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-base font-bold text-[#111827] border-b pb-2">{t.legalDriverTerms}</h3>
                <p>
                  {language === 'ar'
                    ? 'يلتزم مناديب التوصيل بالحفاظ على سرية الطرود، وعدم تسليم أي دواء إلا بعد إدخال رمز PIN السري الخاص بالعميل ومسح رمز QR الأمني لضمان سلامة الطرد.'
                    : language === 'fr'
                    ? 'Les coursiers s’engagent à respecter la stricte confidentialité des colis et à n’effectuer la remise qu’après validation du code PIN à 4 chiffres du patient.'
                    : 'Courier riders are bound by patient confidentiality standards and must never release a sealed parcel without verifying the customer 4-digit PIN.'}
                </p>
              </div>
            )}

            {activeTab === 'data_tools' && (
              <div className="space-y-5 animate-fadeIn">
                <h3 className="text-base font-bold text-[#111827] border-b pb-2">
                  {language === 'ar' ? 'أدوات الخصوصية وتصدير البيانات الصحية' : language === 'fr' ? 'Outils de Confidentialité & Export de Données' : 'Patient Health Data Management Tools'}
                </h3>
                
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900">{t.dataPrivacyExport}</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {language === 'ar'
                        ? 'تنزيل ملف JSON آمن يحتوي على كافة وصفاتك، طلباتك، وسجل تذكير الجرعات.'
                        : language === 'fr'
                        ? 'Téléchargez un fichier JSON sécurisé contenant toutes vos ordonnances et votre historique.'
                        : 'Download a secure JSON archive containing your prescriptions, orders, and dosage logs.'}
                    </p>
                  </div>
                  <button
                    onClick={handleExportData}
                    disabled={exportLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0E7A4B] hover:bg-[#0B6B43] text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0"
                  >
                    {exportLoading ? (
                      <span className="animate-spin">⏳</span>
                    ) : exportSuccess ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>{exportSuccess ? (language === 'ar' ? 'تم التحميل!' : 'Exported!') : t.dataPrivacyExport}</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-red-900">{t.dataPrivacyDelete}</h4>
                    <p className="text-xs text-red-700 mt-0.5">
                      {language === 'ar'
                        ? 'طلب حذف الحساب نهائياً وتجريد بيانات الوصفات من أي هوية شخصية وفق مبدأ الحق في النسيان.'
                        : language === 'fr'
                        ? 'Demande de suppression irréversible du compte et anonymisation des dossiers médicaux.'
                        : 'Permanently delete your account and anonymize medical history under Right to be Forgotten.'}
                    </p>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteRequested}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{deleteRequested ? (language === 'ar' ? 'تم تقديم الطلب' : 'Request Filed') : t.dataPrivacyDelete}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-100 bg-[#F1FAF4] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#0E7A4B] hover:bg-[#0B6B43] text-white text-xs font-bold rounded-xl transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
