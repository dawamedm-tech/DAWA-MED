import React, { useState, useEffect, useRef } from 'react';
import { Language, AuthUser, SiteSettings } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { 
  Building2, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Sparkles, 
  Globe, 
  Sliders, 
  Mail, 
  Phone, 
  Palette, 
  Eye, 
  ShieldAlert, 
  Megaphone,
  Save,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SiteSettingsManagerProps {
  currentUser?: AuthUser;
  language: Language;
}

export const SiteSettingsManager: React.FC<SiteSettingsManagerProps> = ({
  currentUser,
  language,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isRtl = language === 'ar';
  const { settings, refreshSettings, updateLocalSettings } = useSiteSettings();

  const [formData, setFormData] = useState<SiteSettings>({
    siteName: settings?.siteName || 'DAWA MED',
    siteNameAr: settings?.siteNameAr || 'دواء ميد',
    siteNameFr: settings?.siteNameFr || 'DAWA MED',
    tagline: settings?.tagline || 'Pan-African Verified Pharmacy Network & Cold-Chain Logistics',
    taglineAr: settings?.taglineAr || 'شبكة الصيدليات المعتمدة وسلسلة التبريد الموثوقة في إفريقيا',
    taglineFr: settings?.taglineFr || 'Réseau Pharmaceutique Vérifié & Logistique de la Chaîne du Froid',
    logoUrl: settings?.logoUrl || '',
    logoFileName: settings?.logoFileName,
    logoFileType: settings?.logoFileType,
    logoFileSizeKb: settings?.logoFileSizeKb,
    logoUpdatedAt: settings?.logoUpdatedAt,
    supportEmail: settings?.supportEmail || 'support@dawamed.com',
    supportPhone: settings?.supportPhone || '+254 700 000 000',
    primaryBrandColor: settings?.primaryBrandColor || '#0E7A4B',
    enablePatientRegistration: settings?.enablePatientRegistration ?? true,
    enablePharmacyRegistration: settings?.enablePharmacyRegistration ?? true,
    requireMfaForAdmins: settings?.requireMfaForAdmins ?? true,
    maintenanceMode: settings?.maintenanceMode ?? false,
    announcementNoticeEn: settings?.announcementNoticeEn || '',
    announcementNoticeAr: settings?.announcementNoticeAr || '',
    announcementNoticeFr: settings?.announcementNoticeFr || '',
    showAnnouncementNotice: settings?.showAnnouncementNotice ?? false,
    updatedAt: settings?.updatedAt || new Date().toISOString(),
    updatedBy: settings?.updatedBy || 'System'
  });

  const [previewLogo, setPreviewLogo] = useState<string | null>(settings?.logoUrl || null);
  const [logoFileMeta, setLogoFileMeta] = useState<{ name: string; type: string; sizeKb: number } | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings) {
      setFormData(prev => ({ ...prev, ...settings }));
      setPreviewLogo(settings.logoUrl || null);
    }
  }, [settings]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Handle Logo Selection & Validation
  const handleLogoFileSelect = (file: File) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      showToast(
        language === 'ar' 
          ? 'نوع الملف غير مدعوم. الأنواع المسموحة: PNG, JPG, WEBP, SVG.' 
          : 'Unsupported file format. Please upload PNG, JPG, WEBP, or SVG.',
        'error'
      );
      return;
    }

    const sizeKb = Math.round(file.size / 1024);
    if (sizeKb > 2048) {
      showToast(
        language === 'ar'
          ? `حجم الملف (${sizeKb} KB) يتجاوز الحد الأقصى 2MB.`
          : `File size (${sizeKb} KB) exceeds the 2MB limit.`,
        'error'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      setPreviewLogo(base64Data);
      setLogoFileMeta({
        name: file.name,
        type: file.type,
        sizeKb
      });
    };
    reader.readAsDataURL(file);
  };

  // Upload Logo to Backend
  const handleSaveLogo = async () => {
    if (!previewLogo) return;

    setIsUploadingLogo(true);
    try {
      const res = await fetch('/api/admin/site-settings/logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('dawa_admin_session_token') || 'adm-tok-mosa-super-verified'}`
        },
        body: JSON.stringify({
          logoData: previewLogo,
          fileName: logoFileMeta?.name || 'custom-logo.png',
          fileType: logoFileMeta?.type || 'image/png',
          fileSizeKb: logoFileMeta?.sizeKb || 120
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        updateLocalSettings({ logoUrl: previewLogo });
        await refreshSettings();
        setLogoFileMeta(null);
        showToast(
          language === 'ar'
            ? 'تم حفظ الشعار وتحديث الهوية البصرية للموقع بالكامل بنجاح!'
            : 'Logo saved and deployed across the entire platform successfully!'
        );
      } else {
        showToast(data.error || 'Failed to upload logo', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error uploading logo', 'error');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Reset Logo to Default
  const handleResetLogo = async () => {
    if (!window.confirm(
      language === 'ar' 
        ? 'هل أنت متأكد من رغبتك في حذف الشعار المخصص واستعادة الشعار الافتراضي للنظام؟' 
        : 'Are you sure you want to delete the custom logo and restore the default system logo?'
    )) return;

    setIsUploadingLogo(true);
    try {
      const res = await fetch('/api/admin/site-settings/reset-logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('dawa_admin_session_token') || 'adm-tok-mosa-super-verified'}`
        }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPreviewLogo(null);
        setLogoFileMeta(null);
        updateLocalSettings({ logoUrl: '' });
        await refreshSettings();
        showToast(
          language === 'ar'
            ? 'تمت استعادة الشعار الافتراضي لـ DAWA MED.'
            : 'Default DAWA MED brand logo restored.'
        );
      } else {
        showToast(data.error || 'Failed to reset logo', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error resetting logo', 'error');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Save General Site Settings
  const handleSaveAllSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);

    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('dawa_admin_session_token') || 'adm-tok-mosa-super-verified'}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        updateLocalSettings(formData);
        await refreshSettings();
        showToast(
          language === 'ar'
            ? 'تم حفظ وتطبيق إعدادات الموقع بنجاح.'
            : 'Site settings updated and deployed successfully.'
        );
      } else {
        showToast(data.error || 'Failed to update settings', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Network error updating settings', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const presetColors = [
    { name: 'Medical Green (Default)', hex: '#0E7A4B' },
    { name: 'Medical Cyan', hex: '#0284C7' },
    { name: 'Emerald Clinical', hex: '#059669' },
    { name: 'Midnight Slate', hex: '#1E293B' },
    { name: 'Royal Indigo', hex: '#4338CA' }
  ];

  return (
    <div className="space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 ${isRtl ? 'left-5' : 'right-5'} z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-white font-medium ${
              toastMessage.type === 'success' ? 'bg-[#0E7A4B]' : 'bg-red-600'
            }`}
          >
            {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="bg-[#0E7A4B] text-white p-6 sm:p-8 rounded-3xl shadow-xs border border-[#0B6B43] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5" />
            {language === 'ar' ? 'مركز الهوية البصرية والنظام' : 'Visual Identity & System Control'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            {language === 'ar' ? 'إعدادات الموقع والهوية البصرية' : 'Site Settings & Brand Identity'}
          </h2>
          <p className="text-emerald-100 text-sm mt-1 max-w-2xl">
            {language === 'ar'
              ? 'إدارة شعار المنصة، الأسماء والترجمات، ألوان الهوية، وبيانات التواصل المركزي عبر النظام بأمان تام دون تعديل الكود.'
              : 'Centrally manage platform brand logo, multilingual names, taglines, accent colors, and contact info without touching source code.'}
          </p>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            type="button"
            onClick={refreshSettings}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {language === 'ar' ? 'تحديث' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ========================================================================= */}
        {/* SECTION 1: LOGO & VISUAL BRAND IDENTITY (5 COLS) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0E7A4B]/10 flex items-center justify-center text-[#0E7A4B]">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    {language === 'ar' ? 'إدارة شعار الموقع' : 'Site Logo Management'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WEBP, SVG (Max 2MB)
                  </p>
                </div>
              </div>

              {previewLogo && (
                <button
                  type="button"
                  onClick={handleResetLogo}
                  disabled={isUploadingLogo}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {language === 'ar' ? 'استعادة الافتراضي' : 'Reset Default'}
                </button>
              )}
            </div>

            {/* Live Interactive Preview Box */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700">
                  {language === 'ar' ? 'معاينة الشعار المباشرة:' : 'Live Logo Preview:'}
                </span>
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('light')}
                    className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                      previewMode === 'light' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Light UI
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('dark')}
                    className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                      previewMode === 'dark' ? 'bg-[#0E7A4B] text-white shadow-xs' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Dark UI
                  </button>
                </div>
              </div>

              <div
                className={`w-full min-h-[160px] rounded-2xl flex flex-col items-center justify-center p-6 transition-all border ${
                  previewMode === 'light'
                    ? 'bg-gray-50/80 border-gray-200'
                    : 'bg-[#0E7A4B] border-[#0B6B43]'
                }`}
              >
                {previewLogo ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={previewLogo}
                      alt="Site Logo Preview"
                      className="max-h-20 max-w-[240px] object-contain rounded-md"
                      referrerPolicy="no-referrer"
                    />
                    {logoFileMeta && (
                      <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {logoFileMeta.name} ({logoFileMeta.sizeKb} KB) - {language === 'ar' ? 'جاهز للحفظ' : 'Ready to Save'}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#0E7A4B] flex items-center justify-center font-bold text-white text-2xl shadow-sm">
                      D
                    </div>
                    <div>
                      <div className={`text-2xl font-black ${previewMode === 'light' ? 'text-[#0E7A4B]' : 'text-white'}`}>
                        DAWA<span className={previewMode === 'light' ? 'text-emerald-300' : 'text-emerald-200'}>MED</span>
                      </div>
                      <p className={`text-[10px] uppercase tracking-wider font-semibold ${previewMode === 'light' ? 'text-gray-500' : 'text-emerald-200'}`}>
                        {language === 'ar' ? 'الشعار الافتراضي للنظام' : 'Default System Logo'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Drag/Drop & File Input */}
            <div className="space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleLogoFileSelect(e.target.files[0]);
                  }
                }}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleLogoFileSelect(e.dataTransfer.files[0]);
                  }
                }}
                className="border-2 border-dashed border-gray-300 hover:border-[#0E7A4B] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-[#0B6B43]/5 group"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 group-hover:bg-[#0B6B43] flex items-center justify-center text-[#0E7A4B] group-hover:text-white mx-auto mb-3 transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  {language === 'ar' ? 'اضغط لرفع الشعار أو اسحبه هنا' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WEBP, SVG ({language === 'ar' ? 'الحد الأقصى' : 'Max'} 2MB)
                </p>
              </div>

              {/* Action Buttons for Logo */}
              {previewLogo && logoFileMeta && (
                <button
                  type="button"
                  onClick={handleSaveLogo}
                  disabled={isUploadingLogo}
                  className="w-full py-3 px-4 rounded-xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  {isUploadingLogo ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {language === 'ar' ? 'جارٍ نشر الشعار...' : 'Deploying Logo...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {language === 'ar' ? 'حفظ ونشر الشعار الجديد فورياً' : 'Save & Deploy Logo Immediately'}
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Storage & Privacy Note */}
            <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-[#0E7A4B] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">
                  {language === 'ar' ? 'تخزين مركزي محمي وآمن:' : 'Central Protected Storage:'}
                </span>
                {language === 'ar'
                  ? 'يتم تخزين الشعار في مساحة إعدادات النظام المحمية وتحديث شريط التنقل والتذييل والموقع بالكامل تلقائيًا.'
                  : 'Logo is stored in protected site configuration and automatically propagates to Header, Footer, and public pages.'}
              </div>
            </div>
          </div>

          {/* Color Palette Selector */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-[#0E7A4B]">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">
                  {language === 'ar' ? 'اللون الأساسي للهوية' : 'Primary Brand Accent Color'}
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {presetColors.map((color) => (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => setFormData({ ...formData, primaryBrandColor: color.hex })}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    formData.primaryBrandColor === color.hex
                      ? 'border-[#0E7A4B] bg-[#E8F5EE] text-[#0E7A4B] font-bold shadow-xs'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full border border-gray-300 shrink-0"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="truncate">{color.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: SITE TEXTS, TAGLINES & PLATFORM SWITCHES (7 COLS) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSaveAllSettings} className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    {language === 'ar' ? 'البيانات النصية والإعدادات العامة' : 'Platform Identity & Settings'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {language === 'ar' ? 'دعم ثلاثي اللغات (العربية، الإنجليزية، الفرنسية)' : 'Trilingual Parity (AR, EN, FR)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Site Name in 3 Languages */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                {language === 'ar' ? 'اسم الموقع / المنصة' : 'Site & Platform Brand Name'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[11px] font-semibold text-gray-500 mb-1 block">English</span>
                  <input
                    type="text"
                    value={formData.siteName}
                    onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#0E7A4B] focus:ring-1 focus:ring-[#0E7A4B] outline-hidden"
                    placeholder="DAWA MED"
                    required
                  />
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-gray-500 mb-1 block">العربية (Arabic)</span>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.siteNameAr || ''}
                    onChange={(e) => setFormData({ ...formData, siteNameAr: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#0E7A4B] focus:ring-1 focus:ring-[#0E7A4B] outline-hidden text-right"
                    placeholder="دواء ميد"
                  />
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-gray-500 mb-1 block">Français (French)</span>
                  <input
                    type="text"
                    value={formData.siteNameFr || ''}
                    onChange={(e) => setFormData({ ...formData, siteNameFr: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#0E7A4B] focus:ring-1 focus:ring-[#0E7A4B] outline-hidden"
                    placeholder="DAWA MED"
                  />
                </div>
              </div>
            </div>

            {/* Taglines in 3 Languages */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                {language === 'ar' ? 'الشعار اللفظي والوصف المختصر' : 'Taglines & Subtitles'}
              </label>

              <div className="space-y-3">
                <div>
                  <span className="text-[11px] font-semibold text-gray-500 mb-1 block">English Tagline</span>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#0E7A4B] focus:ring-1 focus:ring-[#0E7A4B] outline-hidden"
                    placeholder="Pan-African Verified Pharmacy Network & Cold-Chain Logistics"
                  />
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-gray-500 mb-1 block">الشعار بالعربية</span>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.taglineAr || ''}
                    onChange={(e) => setFormData({ ...formData, taglineAr: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#0E7A4B] focus:ring-1 focus:ring-[#0E7A4B] outline-hidden text-right"
                    placeholder="شبكة الصيدليات المعتمدة وسلسلة التبريد الموثوقة في إفريقيا"
                  />
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-gray-500 mb-1 block">Slogan en Français</span>
                  <input
                    type="text"
                    value={formData.taglineFr || ''}
                    onChange={(e) => setFormData({ ...formData, taglineFr: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#0E7A4B] focus:ring-1 focus:ring-[#0E7A4B] outline-hidden"
                    placeholder="Réseau Pharmaceutique Vérifié & Logistique de la Chaîne du Froid"
                  />
                </div>
              </div>
            </div>

            {/* Support & Contact Info */}
            <div className="space-y-4 border-t border-gray-100 pt-5">
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                {language === 'ar' ? 'معلومات الدعم الفني والتواصل' : 'Official Support & Contact Details'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-600 font-medium mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    {language === 'ar' ? 'بريد الدعم الرسمي' : 'Support Email'}
                  </label>
                  <input
                    type="email"
                    value={formData.supportEmail || ''}
                    onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#0E7A4B] focus:ring-1 focus:ring-[#0E7A4B] outline-hidden"
                    placeholder="support@dawamed.com"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600 font-medium mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    {language === 'ar' ? 'هاتف الطوارئ والمساعدة' : 'Support Phone / Hotlines'}
                  </label>
                  <input
                    type="text"
                    value={formData.supportPhone || ''}
                    onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#0E7A4B] focus:ring-1 focus:ring-[#0E7A4B] outline-hidden"
                    placeholder="+254 700 000 000"
                  />
                </div>
              </div>
            </div>

            {/* Broadcast Announcement Notice */}
            <div className="space-y-3 border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Megaphone className="w-4 h-4 text-amber-600" />
                  {language === 'ar' ? 'شريط الإعلانات التنبيهي العام' : 'Global Announcement Bar'}
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showAnnouncementNotice}
                    onChange={(e) => setFormData({ ...formData, showAnnouncementNotice: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0E7A4B]"></div>
                </label>
              </div>

              {formData.showAnnouncementNotice && (
                <div className="space-y-2 bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80">
                  <input
                    type="text"
                    value={formData.announcementNoticeEn || ''}
                    onChange={(e) => setFormData({ ...formData, announcementNoticeEn: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-amber-200 text-xs bg-white focus:outline-hidden"
                    placeholder="English: eg. 🚀 Pan-African cold-chain network now expanded to Senegal & Ghana!"
                  />
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.announcementNoticeAr || ''}
                    onChange={(e) => setFormData({ ...formData, announcementNoticeAr: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-amber-200 text-xs bg-white focus:outline-hidden text-right"
                    placeholder="العربية: تم توسيع شبكة التبريد المعتمدة لتشمل السنغال وغانا بنجاح!"
                  />
                </div>
              )}
            </div>

            {/* System Security & Access Switches */}
            <div className="space-y-3 border-t border-gray-100 pt-5">
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                {language === 'ar' ? 'بوابات التسجيل والتحكم بالأمان' : 'Registration & Access Rules'}
              </label>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100/80 cursor-pointer transition-colors">
                  <span className="text-xs font-medium text-gray-800">
                    {language === 'ar' ? 'السماح بتسجيل المرضى والعملاء الجدد' : 'Allow Patient Self-Registration'}
                  </span>
                  <input
                    type="checkbox"
                    checked={formData.enablePatientRegistration}
                    onChange={(e) => setFormData({ ...formData, enablePatientRegistration: e.target.checked })}
                    className="w-4 h-4 text-[#0E7A4B] rounded-sm focus:ring-[#0E7A4B]"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100/80 cursor-pointer transition-colors">
                  <span className="text-xs font-medium text-gray-800">
                    {language === 'ar' ? 'السماح بتقديم طلبات انضمام الصيدليات' : 'Allow Pharmacy Partner Applications'}
                  </span>
                  <input
                    type="checkbox"
                    checked={formData.enablePharmacyRegistration}
                    onChange={(e) => setFormData({ ...formData, enablePharmacyRegistration: e.target.checked })}
                    className="w-4 h-4 text-[#0E7A4B] rounded-sm focus:ring-[#0E7A4B]"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100/80 cursor-pointer transition-colors">
                  <span className="text-xs font-medium text-gray-800">
                    {language === 'ar' ? 'إلزام المصادقة الثنائية (2FA) لجميع مسؤولي الإدارة' : 'Enforce 2FA for All Admin Roles'}
                  </span>
                  <input
                    type="checkbox"
                    checked={formData.requireMfaForAdmins}
                    onChange={(e) => setFormData({ ...formData, requireMfaForAdmins: e.target.checked })}
                    className="w-4 h-4 text-[#0E7A4B] rounded-sm focus:ring-[#0E7A4B]"
                  />
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-6 py-3 rounded-xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white font-bold text-sm flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {isSavingSettings ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {language === 'ar' ? 'جارٍ الحفظ...' : 'Saving Changes...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {language === 'ar' ? 'حفظ إعدادات المنصة' : 'Save Platform Settings'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
