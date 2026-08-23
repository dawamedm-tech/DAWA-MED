import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Upload, 
  Search, 
  Building2, 
  Bike, 
  CalendarCheck, 
  CheckCircle2, 
  ChevronRight, 
  Lock, 
  ThermometerSnowflake, 
  Sparkles, 
  ArrowRight, 
  HelpCircle, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  HeartHandshake, 
  Award, 
  Check, 
  Send,
  MessageCircle,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { CountryConfig, Language, Medicine } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface PublicWebsiteProps {
  selectedCountry: CountryConfig;
  onCountryChange: (country: CountryConfig) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenCustomerApp: () => void;
  onOpenUploadRx: () => void;
  onOpenMonthlySub: () => void;
  sampleMedicines: Medicine[];
}

export const PublicWebsite: React.FC<PublicWebsiteProps> = ({
  selectedCountry,
  onCountryChange,
  language,
  onLanguageChange,
  onOpenCustomerApp,
  onOpenUploadRx,
  onOpenMonthlySub,
  sampleMedicines,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isAr = language === 'ar';

  const [activeSection, setActiveSection] = useState<string>('home');
  const [partnerType, setPartnerType] = useState<'pharmacy' | 'driver'>('pharmacy');
  const [partnerFormSubmitted, setPartnerFormSubmitted] = useState<boolean>(false);
  const [contactSubmitted, setContactSubmitted] = useState<boolean>(false);

  // Partner form state
  const [partnerName, setPartnerName] = useState('');
  const [partnerContact, setPartnerContact] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [partnerLicense, setPartnerLicense] = useState('');

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  // FAQ Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handlePartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('/api/partners/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partnerType,
        name: partnerName,
        contactPerson: partnerContact,
        phone: partnerPhone,
        licenseNumber: partnerLicense,
        country: selectedCountry.name,
      }),
    }).catch(() => {});

    setPartnerFormSubmitted(true);
    setTimeout(() => {
      setPartnerName('');
      setPartnerContact('');
      setPartnerPhone('');
      setPartnerLicense('');
    }, 1500);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: contactName,
        email: contactEmail,
        message: contactMessage,
      }),
    }).catch(() => {});

    setContactSubmitted(true);
  };

  const faqs = [
    {
      qEn: 'How does DAWA MED verify prescription authenticity?',
      qAr: 'كيف تتحقق منصة DAWA MED من صحة الوصفة الطبية؟',
      aEn: 'Every uploaded prescription is reviewed by a licensed, certified pharmacist in our partner network before dispensing. We verify the doctor’s registration, dosage schedule, and potential drug interactions.',
      aAr: 'تتم مراجعة كل وصفة طبية مرفوعة بواسطة صيدلي مرخص ومعتمد من شبكة صيدلياتنا الشريكة قبل الصرف. نتحقق من ترخيص الطبيب، والجرعات، وتفاعلات الأدوية المحتملة.',
    },
    {
      qEn: 'How is cold-chain medicine (e.g., Insulin) transported safely?',
      qAr: 'كيف يتم نقل الأدوية المبردة (مثل الإنسولين) بأمان؟',
      aEn: 'Our trained couriers use calibrated temperature-controlled insulated bags maintaining 2°C to 8°C with digital telemetry tracking to ensure medicine integrity.',
      aAr: 'يستخدم فرسان التوصيل حقائب معزولة مبردة ومراقبة رقمياً تحافظ على درجة حرارة بين 2°C إلى 8°C لضمان سلامة وفاعلية الدواء.',
    },
    {
      qEn: 'What is included in the $5.00/month DAWA MED MONTHLY plan?',
      qAr: 'ما الذي تشمله باقة DAWA MED MONTHLY بقيمة 5 دولارات شهرياً؟',
      aEn: 'It includes 100% Free monthly scheduled refill deliveries, smart adherence dose reminders via SMS & Push, automated low-pill refill alerts, and priority 24/7 pharmacist support.',
      aAr: 'تشمل توصيلاً شهرياً مجانياً للوصفات المزمنة، وتنبيهات مواعيد الجرعات عبر الرسائل والإشعارات، وتنبيهات إعادة التعبئة التلقائية، ودعماً صيدلانياً على مدار الساعة.',
    },
    {
      qEn: 'Which payment methods are supported in my country?',
      qAr: 'ما هي طرق الدفع المدعومة في بلدي؟',
      aEn: `In ${selectedCountry.name}, we accept ${selectedCountry.mobileMoneyProviders.join(', ')}, Visa/Mastercard, and Cash/Mobile Money on Delivery.`,
      aAr: `في ${selectedCountry.nameAr}، ندعم ${selectedCountry.mobileMoneyProviders.join('، ')}، والبطاقات البنكية، والدفع عند الاستلام.`,
    },
  ];

  return (
    <div className="bg-[#F4F7F5] text-[#1B4332] min-h-screen flex flex-col font-['Plus_Jakarta_Sans',sans-serif]" id="dawa-public-website">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1B4332] via-[#245640] to-[#1B4332] text-white pt-12 pb-20 px-4 sm:px-6">
        {/* Subtle glowing ambient circles */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#52B788]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#74C69D]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Hero Copy & Actions */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-start">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-[#D8F3DC]">
                <ShieldCheck className="w-4 h-4 text-[#74C69D]" />
                <span>
                  {isAr 
                    ? `مرخص ومعتمد رسمياً من ${selectedCountry.regulatoryBody}` 
                    : `Officially regulated & verified with ${selectedCountry.regulatoryBody}`}
                </span>
              </div>

              {/* Primary Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
                {isAr ? 'دواؤك. يصلك حتى باب بيتك.' : 'Your Medicine. Delivered.'}
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg text-[#D8F3DC] max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                {isAr
                  ? 'منصة الرعاية الدوائية الرقمية التي تربط المرضى بالصيدليات المرخصة عبر إفريقيا. توصيل آمن ومراقب حرارياً للوصفات الطبية وأدوية الأمراض المزمنة.'
                  : 'Pan-African digital health platform connecting patients directly to verified, licensed pharmacies. Safe, temperature-monitored prescription access and monthly refills.'}
              </p>

              {/* Hero Call-To-Actions (Exact requested CTAs) */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                {/* Primary CTA */}
                <button
                  onClick={onOpenCustomerApp}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#52B788] hover:bg-[#74C69D] text-[#1B4332] font-black text-base transition-all transform hover:-translate-y-0.5 shadow-xl flex items-center justify-center gap-2.5 cursor-pointer"
                  id="hero-cta-order-medicine"
                >
                  <Search className="w-5 h-5" />
                  <span>{isAr ? 'اطلب الدواء الآن' : 'Order Medicine'}</span>
                </button>

                {/* Secondary CTA */}
                <button
                  onClick={onOpenUploadRx}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-base backdrop-blur-md transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                  id="hero-cta-upload-rx"
                >
                  <Upload className="w-5 h-5 text-[#74C69D]" />
                  <span>{isAr ? 'رفع الوصفة الطبية' : 'Upload Prescription'}</span>
                </button>
              </div>

              {/* Guarantees row */}
              <div className="pt-6 grid grid-cols-3 gap-3 border-t border-white/10 text-[11px] sm:text-xs text-[#D8F3DC]">
                <div className="flex items-center gap-1.5 justify-center lg:justify-start">
                  <CheckCircle2 className="w-4 h-4 text-[#74C69D] shrink-0" />
                  <span>{isAr ? '100% صيدليات مرخصة' : '100% Licensed Pharmacies'}</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center lg:justify-start">
                  <ThermometerSnowflake className="w-4 h-4 text-[#74C69D] shrink-0" />
                  <span>{isAr ? 'سلسلة تبريد (2-8°C)' : 'Insulated Cold-Chain (2-8°C)'}</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center lg:justify-start">
                  <Lock className="w-4 h-4 text-[#74C69D] shrink-0" />
                  <span>{isAr ? 'خصوصية طبية مشفرة' : 'Encrypted Medical Privacy'}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Quick Order Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 text-[#1B4332] shadow-2xl border border-white/20 space-y-4">
                <div className="flex items-center justify-between border-b border-[#D8E2DC] pb-3">
                  <div className="flex items-center gap-2">
                    <BrandLogo className="w-8 h-8" />
                    <div>
                      <h3 className="font-black text-sm text-[#1B4332]">DAWA MED Direct</h3>
                      <p className="text-[10px] text-gray-500">{selectedCountry.flag} {selectedCountry.name} Fast Hub</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                    45 min Express
                  </span>
                </div>

                {/* Search Bar Simulation in Hero */}
                <div 
                  onClick={onOpenCustomerApp}
                  className="p-3 bg-[#F4F7F5] rounded-2xl border border-[#D8E2DC] flex items-center justify-between cursor-pointer hover:border-[#52B788] transition-colors"
                >
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Search className="w-4 h-4 text-gray-400" />
                    <span>{isAr ? 'ابحث عن الأدوية (مثل Metformin, Panadol)...' : 'Search medicines (e.g. Panadol, Inhaler)...'}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#1B4332] border border-[#D8E2DC]">
                    Explore
                  </span>
                </div>

                {/* Featured Medicines snippet */}
                <div className="space-y-2">
                  <p className="text-xs font-black text-gray-700 uppercase tracking-wider">
                    {isAr ? 'أدوية متوفرة للتوصيل الفوري' : 'Popular & In Stock'}
                  </p>
                  <div className="space-y-2">
                    {sampleMedicines.slice(0, 3).map((med) => (
                      <div 
                        key={med.id}
                        onClick={onOpenCustomerApp}
                        className="p-2.5 rounded-xl border border-[#D8E2DC] hover:bg-[#F8FAF9] flex items-center justify-between transition-colors cursor-pointer text-xs"
                      >
                        <div>
                          <p className="font-bold text-[#1B4332]">{med.name}</p>
                          <p className="text-[10px] text-gray-500">{med.dosage} • {med.packageSize}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-[#2D6A4F]">
                            {selectedCountry.currencySymbol} {(med.priceUSD * selectedCountry.exchangeRateToUSD).toLocaleString()}
                          </p>
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {med.requiresPrescription ? 'Rx Required' : 'OTC'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DAWA MED MONTHLY Teaser Banner in Card */}
                <div 
                  onClick={onOpenMonthlySub}
                  className="p-3 bg-[#E9F5EE] border border-[#52B788] rounded-2xl flex items-center justify-between cursor-pointer hover:bg-[#D8F3DC] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-[#2D6A4F]" />
                    <div className="text-xs">
                      <strong className="text-[#1B4332] block font-black">DAWA MED MONTHLY</strong>
                      <span className="text-[10px] text-gray-600">$5/mo Free delivery for chronic refills</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#2D6A4F]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. How It Works Section (4-step visual flow) */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="px-3.5 py-1 rounded-full bg-[#D8F3DC] text-[#2D6A4F] text-xs font-black tracking-wider uppercase">
            {isAr ? 'كيف تعمل المنصة' : 'Simple 4-Step Process'}
          </span>
          <h2 className="text-3xl font-extrabold text-[#1B4332]">
            {isAr ? 'أسهل وأأمن طريقة للحصول على دوائك' : 'How DAWA MED Works'}
          </h2>
          <p className="text-sm text-gray-600">
            {isAr
              ? 'صممت المنصة لتوفير الوقت والجهد وتأمين الأدوية الأصلية لجميع أفراد الأسرة دون عناء الذهاب للصيدلية.'
              : 'Designed to save hours in pharmacy queues while guaranteeing certified medicine quality and storage safety.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-3xl border border-[#D8E2DC] shadow-xs space-y-3 relative group hover:border-[#52B788] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#E9F5EE] text-[#2D6A4F] flex items-center justify-center font-black text-lg">
              1
            </div>
            <h3 className="text-base font-black text-[#1B4332]">
              {isAr ? '1. ابحث أو ارفع الوصفة' : '1. Search or Upload Rx'}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {isAr
                ? 'ابحث بالاسم العلمي أو التجاري، أو التقط صورة لوصفة الطبيب المعتمدة بنقرة واحدة.'
                : 'Search our verified catalogue or snap a photo of your doctor prescription with instant upload.'}
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-3xl border border-[#D8E2DC] shadow-xs space-y-3 relative group hover:border-[#52B788] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#E9F5EE] text-[#2D6A4F] flex items-center justify-center font-black text-lg">
              2
            </div>
            <h3 className="text-base font-black text-[#1B4332]">
              {isAr ? '2. التحقق من الصيدلي' : '2. Pharmacist Review'}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {isAr
                ? 'يقوم صيدلي مرخص من الصيدلية الشريكة بمراجعة الجرعات والتحقق من الوصفة وتجهيز الأدوية الأصلية.'
                : 'A registered pharmacist audits dosages, checks contraindications, and prepares tamper-evident sealed packaging.'}
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-3xl border border-[#D8E2DC] shadow-xs space-y-3 relative group hover:border-[#52B788] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#E9F5EE] text-[#2D6A4F] flex items-center justify-center font-black text-lg">
              3
            </div>
            <h3 className="text-base font-black text-[#1B4332]">
              {isAr ? '3. دفع محلي آمن' : '3. Local Mobile Pay'}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {isAr
                ? 'ادفع بسلاسة عبر MTN MoMo أو M-Pesa أو Airtel Money أو البطاقة أو نقداً عند الاستلام.'
                : 'Approve directly with Mobile Money STK push, Bank Card, or Cash/MoMo on delivery.'}
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white p-6 rounded-3xl border border-[#D8E2DC] shadow-xs space-y-3 relative group hover:border-[#52B788] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#E9F5EE] text-[#2D6A4F] flex items-center justify-center font-black text-lg">
              4
            </div>
            <h3 className="text-base font-black text-[#1B4332]">
              {isAr ? '4. تتبع واستلام مبرد' : '4. Cold-Chain Delivery'}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {isAr
                ? 'تتبع السائق مباشرة على الخريطة، وتحقق من ختم الطرد برمز QR ورمز PIN للتسليم.'
                : 'Track the courier with live GPS telemetry, scan the tamper-evident QR code, and verify with your 4-digit PIN.'}
            </p>
          </div>
        </div>
      </section>

      {/* 3. DAWA MED MONTHLY ($5/Month) Adherence Feature */}
      <section className="bg-white py-16 px-4 sm:px-6 border-y border-[#D8E2DC]">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-[#1B4332] via-[#245640] to-[#1B4332] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#52B788]/20 border border-[#52B788]/40 text-xs font-bold text-[#74C69D]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAr ? 'برنامج الرعاية الدوائية المزمنة' : 'Chronic Care Adherence Membership'}</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                  DAWA MED MONTHLY — <span className="text-[#74C69D]">$5.00 / month</span>
                </h2>

                <p className="text-sm text-[#D8F3DC] max-w-xl leading-relaxed">
                  {isAr
                    ? 'لا تنقطع عن دوائك أبداً. خدمة إعادة تعبئة تلقائية شهرية مجانية التوصيل، مع منبهات مواعيد الجرعات عبر الرسائل، واستشارات صيدلانية مباشرة.'
                    : 'Never run out of essential chronic medications. Enjoy automatic monthly refills with $0 delivery fees, smart dose reminders, and priority cold-chain dispatch.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs text-[#D8F3DC]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#74C69D]" />
                    <span>{isAr ? 'توصيل شهري مجاني 100% لجميع الوصفات' : '100% Free monthly refill deliveries'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#74C69D]" />
                    <span>{isAr ? 'منبهات ذكية لمواعيد تناول الدواء' : 'Smart Adherence SMS & Push alerts'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#74C69D]" />
                    <span>{isAr ? 'تنبيه آلي قبل نفاد كمية الحبوب' : 'Automated low-pill replenishment'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#74C69D]" />
                    <span>{isAr ? 'استشارة صيدلي مباشر عبر واتساب' : 'Direct WhatsApp pharmacist hotline'}</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 text-center lg:text-right">
                <button
                  onClick={onOpenMonthlySub}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#52B788] hover:bg-[#74C69D] text-[#1B4332] font-black text-sm transition-all transform hover:-translate-y-0.5 shadow-xl inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CalendarCheck className="w-5 h-5" />
                  <span>{isAr ? 'اشترك الآن بـ 5$ شهرياً' : 'Join Membership for $5/mo'}</span>
                </button>
                <p className="text-[11px] text-[#D8F3DC] mt-2">
                  {isAr ? 'إلغاء الاشتراك في أي وقت بنقرة واحدة' : 'Cancel anytime. Pay via Mobile Money.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Safety & Trust (Cold-Chain, Anti-Counterfeiting, Privacy) */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="px-3.5 py-1 rounded-full bg-[#D8F3DC] text-[#2D6A4F] text-xs font-black tracking-wider uppercase">
            {isAr ? 'الأمان والجودة الطبية' : 'Safety, Quality & Trust'}
          </span>
          <h2 className="text-3xl font-extrabold text-[#1B4332]">
            {isAr ? 'معايير صارمة لحماية صحة المرضى' : 'Zero Compromise on Medicine Safety'}
          </h2>
          <p className="text-sm text-gray-600">
            {isAr
              ? 'نضمن لك وصول أدوية أصلية وغير مقلدة من صيدليات مرخصة ومعتمدة وتحت إشراف صيادلة مسجلين.'
              : 'Every step adheres to international health standards, counterfeit prevention, and cold-chain integrity.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#D8E2DC] shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <ThermometerSnowflake className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#1B4332]">
              {isAr ? 'حفظ درجات الحرارة (2°C - 8°C)' : 'Cold-Chain Integrity'}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {isAr
                ? 'الحقائب المعزولة المبردة تضمن وصول الإنسولين والأمصال والأدوية الحيوية بفاعليتها الكاملة دون تلف.'
                : 'Insulated bags equipped with calibrated ice packs and telemetry sensors guarantee safe delivery of vaccines and insulins.'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#D8E2DC] shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#1B4332]">
              {isAr ? 'مكافحة الأدوية المقلدة' : 'Anti-Counterfeit Protection'}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {isAr
                ? 'نتعامل حصرياً مع صيدليات مرخصة تستورد من المصنعين المعتمدين، مع أرقام تشغيلات وتواريخ صلاحية مفحوصة.'
                : 'Direct supply from licensed national pharmacy partners ensures verified manufacturer batch numbers and expiry validation.'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#D8E2DC] shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#1B4332]">
              {isAr ? 'تشفير البيانات الطبية' : 'Encrypted Medical Data'}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {isAr
                ? 'بيانات الوصفات الطبية مشفرة ومحمية، ولا يطلع عليها إلا الصيدلي المعني بتجهيز وصرف دوائك.'
                : 'Prescription images and medical history are stored with AES-256 encryption, accessible only by verified pharmacists.'}
            </p>
          </div>
        </div>
      </section>

      {/* 5. "Partner with DAWA MED" (For Pharmacies & For Drivers) */}
      <section className="bg-white py-16 px-4 sm:px-6 border-y border-[#D8E2DC]" id="partner-section">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="px-3.5 py-1 rounded-full bg-[#D8F3DC] text-[#2D6A4F] text-xs font-black tracking-wider uppercase">
              {isAr ? 'انضم لشبكتنا' : 'Partner with DAWA MED'}
            </span>
            <h2 className="text-3xl font-extrabold text-[#1B4332]">
              {isAr ? 'شراكة تنموية للصيدليات وفرسان التوصيل' : 'Grow With Africa’s Trusted Health Network'}
            </h2>
            <p className="text-xs text-gray-500">
              {isAr 
                ? 'نرحب بالصيدليات المرخصة رسمياً والسائقين المحترفين للانضمام إلى منصتنا.' 
                : 'Join as a licensed pharmacy partner or certified cold-chain courier driver.'}
            </p>
          </div>

          <div className="max-w-2xl mx-auto bg-[#F8FAF9] rounded-3xl border border-[#D8E2DC] p-6 sm:p-8 shadow-xs">
            {/* Toggle Partner Type */}
            <div className="flex bg-[#E9F5EE] p-1.5 rounded-2xl gap-2 mb-6">
              <button
                onClick={() => setPartnerType('pharmacy')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  partnerType === 'pharmacy' ? 'bg-[#1B4332] text-white shadow-xs' : 'text-[#2D6A4F]'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>{isAr ? 'انضم كصيدلية مرخصة' : 'For Licensed Pharmacies'}</span>
              </button>

              <button
                onClick={() => setPartnerType('driver')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  partnerType === 'driver' ? 'bg-[#1B4332] text-white shadow-xs' : 'text-[#2D6A4F]'
                }`}
              >
                <Bike className="w-4 h-4" />
                <span>{isAr ? 'انضم كسائق توصيل' : 'For Delivery Drivers'}</span>
              </button>
            </div>

            {partnerFormSubmitted ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h3 className="text-base font-black text-[#1B4332]">
                  {isAr ? 'تم استلام طلب الشراكة بنجاح!' : 'Application Submitted Successfully!'}
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  {isAr
                    ? 'سيقوم فريق الامتثال والتفتيش الصيدلي بالتواصل معك والتحقق من التراخيص الرسمية خلال 24 ساعة.'
                    : 'Our compliance officer will verify your national licensing credentials and contact you within 24 hours.'}
                </p>
                <button
                  onClick={() => setPartnerFormSubmitted(false)}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-bold cursor-pointer"
                >
                  {isAr ? 'إرسال طلب آخر' : 'Submit Another'}
                </button>
              </div>
            ) : (
              <form onSubmit={handlePartnerSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      {partnerType === 'pharmacy' 
                        ? (isAr ? 'اسم الصيدلية الرسمي' : 'Pharmacy Legal Name') 
                        : (isAr ? 'الاسم الكامل للسائق' : 'Full Name')}
                    </label>
                    <input
                      type="text"
                      required
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder={partnerType === 'pharmacy' ? 'e.g. GoodLife Pharmacy' : 'e.g. Samuel Kato'}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D8E2DC] bg-white focus:outline-none focus:border-[#2D6A4F]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      {partnerType === 'pharmacy' 
                        ? (isAr ? 'اسم الصيدلي المسؤول' : 'Pharmacist in Charge') 
                        : (isAr ? 'نوع المركبة (دراجة / سيارة)' : 'Vehicle Model')}
                    </label>
                    <input
                      type="text"
                      required
                      value={partnerContact}
                      onChange={(e) => setPartnerContact(e.target.value)}
                      placeholder={partnerType === 'pharmacy' ? 'Dr. Sarah Nabirye (B.Pharm)' : 'Motorbike (e.g. Boxer / Yamaha)'}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D8E2DC] bg-white focus:outline-none focus:border-[#2D6A4F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      {isAr ? 'رقم الهاتف / واتساب' : 'Phone / WhatsApp'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={partnerPhone}
                      onChange={(e) => setPartnerPhone(e.target.value)}
                      placeholder="+256 700 000 000"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D8E2DC] bg-white focus:outline-none focus:border-[#2D6A4F]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      {partnerType === 'pharmacy' 
                        ? (isAr ? 'رقم ترخيص مزاولة الصيدلة' : 'Pharmacy License Number') 
                        : (isAr ? 'رقم رخصة القيادة' : 'Driver’s License Number')}
                    </label>
                    <input
                      type="text"
                      required
                      value={partnerLicense}
                      onChange={(e) => setPartnerLicense(e.target.value)}
                      placeholder={partnerType === 'pharmacy' ? 'NDA/LIC/2026/088' : 'DL-UG-998822'}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D8E2DC] bg-white focus:outline-none focus:border-[#2D6A4F]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-black text-xs transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isAr ? 'إرسال طلب الشراكة' : 'Submit Partner Application'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 6. FAQ Accordion Section */}
      <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-8">
        <div className="text-center space-y-3">
          <span className="px-3.5 py-1 rounded-full bg-[#D8F3DC] text-[#2D6A4F] text-xs font-black tracking-wider uppercase">
            {isAr ? 'الأسئلة الشائعة' : 'FAQ'}
          </span>
          <h2 className="text-3xl font-extrabold text-[#1B4332]">
            {isAr ? 'كل ما تحتاج لمعرفته حول DAWA MED' : 'Frequently Asked Questions'}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={`faq-${idx}`}
                className="bg-white rounded-2xl border border-[#D8E2DC] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-start flex items-center justify-between gap-4 font-bold text-sm text-[#1B4332] hover:bg-[#F8FAF9] transition-colors cursor-pointer"
                >
                  <span>{isAr ? faq.qAr : faq.qEn}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180 text-[#2D6A4F]' : ''}`} />
                </button>
                {isOpen && (
                  <div className="p-4 sm:p-5 pt-0 text-xs text-gray-600 border-t border-[#F4F7F5] leading-relaxed bg-[#F8FAF9]">
                    {isAr ? faq.aAr : faq.aEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Contact Us & WhatsApp Direct Support */}
      <section className="bg-white py-16 px-4 sm:px-6 border-t border-[#D8E2DC]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div>
              <span className="px-3.5 py-1 rounded-full bg-[#D8F3DC] text-[#2D6A4F] text-xs font-black tracking-wider uppercase">
                {isAr ? 'تواصل معنا' : 'Contact & Support'}
              </span>
              <h2 className="text-3xl font-extrabold text-[#1B4332] mt-2">
                {isAr ? 'فريق الدعم الصيدلي في خدمتك' : 'We are here to assist your health needs'}
              </h2>
              <p className="text-xs text-gray-600 mt-2">
                {isAr
                  ? 'هل لديك استفسار حول وصفتك، أو حالة التوصيل، أو الاشتراك الشهري؟ تواصل معنا عبر القنوات المباشرة.'
                  : 'Questions regarding your prescription, delivery status, or chronic refill subscriptions?'}
              </p>
            </div>

            <div className="space-y-4">
              <a
                href={`https://wa.me/${(selectedCountry.whatsappSupportNumber || '+256700000000').replace(/\D/g, '')}?text=Hello%20DAWA%20MED`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-emerald-50 border border-[#52B788] rounded-2xl flex items-center justify-between text-emerald-900 hover:bg-emerald-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-xs font-black block">{isAr ? 'محادثة فورية عبر واتساب' : 'Direct WhatsApp Pharmacist Support'}</strong>
                    <span className="text-[11px] text-emerald-700">{selectedCountry.whatsappSupportNumber || '+256 700 123 456'}</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-emerald-700" />
              </a>

              <div className="flex items-center gap-3 p-4 bg-[#F8FAF9] rounded-2xl border border-[#D8E2DC] text-xs">
                <Mail className="w-5 h-5 text-[#2D6A4F]" />
                <div>
                  <strong className="block text-[#1B4332]">Email Desk</strong>
                  <span className="text-gray-500">support@dawamed.africa</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div className="bg-[#F8FAF9] p-6 sm:p-8 rounded-3xl border border-[#D8E2DC]">
            {contactSubmitted ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-base font-black text-[#1B4332]">
                  {isAr ? 'تم استلام رسالتك بنجاح' : 'Message Sent!'}
                </h3>
                <p className="text-xs text-gray-500">
                  {isAr ? 'سيرد عليك الصيدلي المناوب في أقرب وقت.' : 'A pharmacist on duty will respond promptly.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">{isAr ? 'الاسم' : 'Name'}</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D8E2DC] bg-white focus:outline-none focus:border-[#2D6A4F]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">{isAr ? 'البريد أو الهاتف' : 'Email or Phone'}</label>
                  <input
                    type="text"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D8E2DC] bg-white focus:outline-none focus:border-[#2D6A4F]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">{isAr ? 'الرسالة أو الاستفسار' : 'Inquiry'}</label>
                  <textarea
                    rows={3}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D8E2DC] bg-white focus:outline-none focus:border-[#2D6A4F]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-black text-xs transition-colors cursor-pointer"
                >
                  {isAr ? 'إرسال الرسالة' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
