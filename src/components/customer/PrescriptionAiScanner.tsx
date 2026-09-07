import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Pill, 
  FileText, 
  ShieldCheck, 
  Clock, 
  X, 
  User, 
  Building2,
  ArrowRight
} from 'lucide-react';
import { PrescriptionAiOcrExtraction, Language } from '../../types';

interface PrescriptionAiScannerProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onConfirmOrderWithRx?: (extraction: PrescriptionAiOcrExtraction) => void;
}

export const PrescriptionAiScanner: React.FC<PrescriptionAiScannerProps> = ({
  isOpen,
  onClose,
  language,
  onConfirmOrderWithRx
}) => {
  const isRtl = language === 'ar';
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [extractionResult, setExtractionResult] = useState<PrescriptionAiOcrExtraction | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    setErrorMsg(null);
    setExtractionResult(null);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleProcessOcr = async () => {
    if (!selectedFile && !previewUrl) {
      setErrorMsg(isRtl ? 'يرجى اختيار صورة الوصفة الطبية أولاً' : 'Please upload or select a prescription image first');
      return;
    }

    setIsScanning(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/prescriptions/ai-ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: previewUrl,
          mimeType: selectedFile?.type || 'image/jpeg',
          notes: 'Customer uploaded prescription via DAWA AI Assistant'
        })
      });

      const data = await res.json();
      if (data.success && data.extraction) {
        setExtractionResult(data.extraction);
      } else {
        setErrorMsg(data.error || 'Failed to extract prescription with AI OCR');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error processing OCR');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-neutral-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      id="prescription-ai-scanner-modal"
    >
      <div 
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">
                  {isRtl ? 'المسح الذكي للوصفة الطبية (AI OCR)' : 'Prescription AI OCR & Clinical Triage'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  Gemini Flash
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                {isRtl 
                  ? 'استخراج فوري للأدوية والجرعات مع التحقق الإلزامي من الصيدلي المعتمد'
                  : 'Automated extraction of prescription metadata with mandatory clinical pharmacist sign-off'}
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

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* Mandatory Safety Notice */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-2.5 shadow-2xs">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">
                {isRtl ? 'الضمان التنظيمي لسلامة المريض:' : 'Mandatory Clinical Safety Notice:'}
              </span>{' '}
              {isRtl 
                ? 'المعلومات المستخرجة بواسطة الذكاء الاصطناعي تنتظر المراجعة والاعتماد البشري من قبل صيدلي قانوني مرخص قبل إتمام الصرف.'
                : 'All AI extracted medications are preliminary and strictly require verification by a licensed human pharmacist before dispensing.'}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Upload Zone */}
          {!extractionResult && (
            <div className="space-y-3">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer bg-emerald-50/20 hover:bg-emerald-50/40 transition-all"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />
                <UploadCloud className="w-10 h-10 mx-auto text-emerald-600 mb-2" />
                <h4 className="text-sm font-bold text-neutral-800 mb-1">
                  {selectedFile ? selectedFile.name : (isRtl ? 'اضغط لرفع صورة الروشتة أو اسحب الملف هنا' : 'Click to upload prescription photo or drag & drop')}
                </h4>
                <p className="text-xs text-neutral-500">
                  {isRtl ? 'يدعم صور JPG, PNG أو مستندات PDF الممسوحة ضوئياً' : 'Supports clear mobile photos (JPG, PNG) or clinical PDF documents'}
                </p>
              </div>

              {previewUrl && (
                <div className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <img src={previewUrl} alt="Prescription Preview" className="w-14 h-14 object-cover rounded-lg border" />
                    <div>
                      <span className="text-xs font-bold text-neutral-900 block">{selectedFile?.name || 'Prescription Image'}</span>
                      <span className="text-[11px] text-neutral-500">{((selectedFile?.size || 0) / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                  <button
                    onClick={handleProcessOcr}
                    disabled={isScanning}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
                  >
                    {isScanning ? (
                      <>
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        <span>{isRtl ? 'جاري التحليل السريري...' : 'Extracting with AI...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'بدء الفحص واستخراج الأدوية' : 'Scan & Extract Medicines'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Demo Sample Button for Quick Verification */}
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={handleProcessOcr}
                  disabled={isScanning}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold underline"
                >
                  {isRtl ? 'استخراج تجريبي فوري لوصفة قياسية' : 'Run instant demo scan with sample clinic prescription'}
                </button>
              </div>
            </div>
          )}

          {/* Extraction Results View */}
          {extractionResult && (
            <div className="space-y-4">
              {/* Prescriber Metadata Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-700" />
                  <div>
                    <span className="text-[10px] text-neutral-500 block">{isRtl ? 'الطبيب المعالج' : 'Doctor / Prescriber'}</span>
                    <span className="font-bold text-neutral-900">{extractionResult.doctorName || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-700" />
                  <div>
                    <span className="text-[10px] text-neutral-500 block">{isRtl ? 'المستشفى / العيادة' : 'Clinic / Hospital'}</span>
                    <span className="font-bold text-neutral-900">{extractionResult.clinicName || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-700" />
                  <div>
                    <span className="text-[10px] text-neutral-500 block">{isRtl ? 'تاريخ التحرير' : 'Date Prescribed'}</span>
                    <span className="font-bold text-neutral-900">{extractionResult.datePrescribed || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Extracted Medicines List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-emerald-600" />
                    <span>
                      {isRtl 
                        ? `الأدوية المستخرجة (${extractionResult.medicines.length})` 
                        : `Extracted Medications (${extractionResult.medicines.length})`}
                    </span>
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {isRtl ? `دقة المسح: ${Math.round(extractionResult.confidenceScore * 100)}%` : `Confidence: ${Math.round(extractionResult.confidenceScore * 100)}%`}
                  </span>
                </div>

                <div className="space-y-2">
                  {extractionResult.medicines.map((med, i) => (
                    <div key={i} className="p-3 border border-neutral-200 rounded-xl bg-white space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-neutral-900">{med.name}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                          {med.form} • {med.dosage}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600">
                        <span className="font-semibold">{med.frequency}</span> • {isRtl ? 'المدة:' : 'Duration:'} {med.duration}
                      </p>
                      {med.instructions && (
                        <p className="text-[11px] text-neutral-500 italic">
                          "{med.instructions}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Prominent Verification Badge */}
              <div className="p-3 bg-amber-500/10 border border-amber-300 rounded-xl flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                  <span className="font-bold">
                    {isRtl ? 'الحالة: بانتظار اعتماد الصيدلي القانوني' : 'Status: Awaiting Pharmacist Verification'}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-500">
                  ID: {extractionResult.id}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={() => {
              setExtractionResult(null);
              setSelectedFile(null);
              setPreviewUrl(null);
            }}
            className="px-4 py-2 border border-neutral-300 bg-white text-neutral-700 rounded-xl text-xs font-semibold hover:bg-neutral-50"
          >
            {isRtl ? 'مسح وصفة أخرى' : 'Scan Another'}
          </button>

          {extractionResult && onConfirmOrderWithRx && (
            <button
              onClick={() => {
                onConfirmOrderWithRx(extractionResult);
                onClose();
              }}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              id="btn-confirm-rx-order"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isRtl ? 'إرسال للصيدلية المعتمدة وتجهيز الدواء' : 'Submit to Approved Pharmacy'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
