import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  UploadCloud, 
  Camera, 
  ShieldCheck, 
  Clock, 
  FileText, 
  CheckCircle2, 
  Sparkles,
  AlertTriangle,
  Lock,
  FileCheck,
  Zap,
  Image as ImageIcon
} from 'lucide-react';
import { Language, CountryConfig, PrescriptionData } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface PrescriptionUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrescriptionSubmitted: (prescription: PrescriptionData) => void;
  language: Language;
  selectedCountry: CountryConfig;
}

export const PrescriptionUploadModal: React.FC<PrescriptionUploadModalProps> = ({
  isOpen,
  onClose,
  onPrescriptionSubmitted,
  language,
  selectedCountry,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [uploadMode, setUploadMode] = useState<'camera' | 'file' | 'pdf'>('camera');
  const [patientName, setPatientName] = useState('Grace Muthoni');
  const [patientPhone, setPatientPhone] = useState('+254 712 345 678');
  const [patientAge, setPatientAge] = useState('52');
  const [doctorNotes, setDoctorNotes] = useState('Metformin 500mg (2 tabs daily) & Amlodipine 5mg (1 tab morning) for 30-day refill.');
  const [doctorName, setDoctorName] = useState('Dr. David Omondi (KMPDC #12890)');
  const [clinicName, setClinicName] = useState('Nairobi West Endocrinology Centre');
  const [isChronic, setIsChronic] = useState(true);
  const [uploadedImageName, setUploadedImageName] = useState('Official_Rx_Dr_Omondi_Signature.jpg');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  if (!isOpen) return null;

  const handleSimulateFileSelect = (mode: 'camera' | 'file' | 'pdf') => {
    setUploadMode(mode);
    setIsCompressing(true);
    setTimeout(() => {
      setIsCompressing(false);
      if (mode === 'camera') {
        setUploadedImageName('Camera_Capture_Rx_' + Date.now().toString().slice(-4) + '.jpg');
      } else if (mode === 'file') {
        setUploadedImageName('Scanned_Prescription_Photo.png');
      } else {
        setUploadedImageName('Signed_Doctor_Prescription.pdf');
      }
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const rx: PrescriptionData = {
        id: `rx-${Date.now().toString().slice(-4)}`,
        doctorName: doctorName || 'Dr. Registered Physician',
        clinicName: clinicName || 'Certified Health Clinic',
        patientName: patientName || 'Patient',
        patientAge: parseInt(patientAge) || 40,
        patientPhone: patientPhone || '+254 700 000 000',
        notes: doctorNotes,
        uploadedAt: 'Just now',
        isChronicCondition: isChronic,
        imageUrl: uploadedImageName,
        isEncrypted: true,
      };

      onPrescriptionSubmitted(rx);
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  const handleSimulateSample = (sampleType: 'chronic' | 'antibiotic' | 'insulin') => {
    if (sampleType === 'chronic') {
      setPatientName('Grace Muthoni');
      setDoctorName('Dr. David Omondi, MD (Reg #12890)');
      setClinicName('Nairobi West Endocrinology Clinic');
      setDoctorNotes('Metformin 500mg (bid) + Amlodipine 5mg (od). Refill x3 months.');
      setIsChronic(true);
      setUploadedImageName('Prescription_GraceMuthoni_Endocrinology.pdf');
      setUploadMode('pdf');
    } else if (sampleType === 'antibiotic') {
      setPatientName('Samwel Kiprotich');
      setDoctorName('Dr. Sarah Wanjiku, MBChB');
      setClinicName('Valley Family Medical Centre');
      setDoctorNotes('Amoxicillin + Clavulanic Acid 625mg 1 tab twice daily for 7 days. Paracetamol extra prn.');
      setIsChronic(false);
      setUploadedImageName('Rx_Chest_Infection_Amoxiclav.jpg');
      setUploadMode('file');
    } else {
      setPatientName('Fatma Hassan');
      setDoctorName('Dr. Peter Otieno, Diabetologist');
      setClinicName('Aga Khan Diabetes & Wellness Centre');
      setDoctorNotes('Insulin Glargine 100 IU/ml prefilled pen. Keep under cold-chain 2-8°C. 14 units at 21:00.');
      setIsChronic(true);
      setUploadedImageName('Rx_Insulin_ColdChain_Authorized.png');
      setUploadMode('camera');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto" id="rx-upload-modal">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl rounded-3xl bg-white text-slate-900 shadow-2xl border border-slate-200 overflow-hidden my-6"
          id="rx-upload-card"
        >
          {/* Header */}
          <div className="bg-[#1B4332] px-6 py-5 text-white flex items-center justify-between border-b border-[#2D6A4F]/40">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-[#74C69D] border border-white/15">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight">{t.uploadRxTitle}</h3>
                <p className="text-xs text-[#D8F3DC]/90">{t.uploadRxSubtitle}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
              id="rx-upload-close-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Quick Demo Pre-fill presets */}
            <div className="rounded-2xl bg-[#F0F7F4] border border-[#D8E2DC] p-3.5 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#1B4332] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>Quick Prescription Samples:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSimulateSample('chronic')}
                  className="px-3 py-1 bg-white hover:bg-[#E9F5EE] border border-[#D8E2DC] text-[#1B4332] text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  BP & Diabetes Refill
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateSample('antibiotic')}
                  className="px-3 py-1 bg-white hover:bg-[#E9F5EE] border border-[#D8E2DC] text-[#1B4332] text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Antibiotics Course
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateSample('insulin')}
                  className="px-3 py-1 bg-white hover:bg-[#E9F5EE] border border-[#D8E2DC] text-[#1B4332] text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Insulin (Cold-Chain)
                </button>
              </div>
            </div>

            {/* Upload Method Selector (Camera, Device File, PDF) */}
            <div>
              <label className="block text-xs font-bold text-[#1B4332] uppercase tracking-wider mb-2">
                Choose Upload Source
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSimulateFileSelect('camera')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    uploadMode === 'camera'
                      ? 'border-[#2D6A4F] bg-[#F0F7F4] text-[#1B4332] ring-2 ring-[#2D6A4F]/20'
                      : 'border-[#D8E2DC] bg-[#F8FAF9] text-gray-600 hover:bg-white'
                  }`}
                  id="rx-mode-camera"
                >
                  <Camera className="w-5 h-5 text-[#2D6A4F]" />
                  <span className="text-xs font-bold">{t.takePhoto}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateFileSelect('file')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    uploadMode === 'file'
                      ? 'border-[#2D6A4F] bg-[#F0F7F4] text-[#1B4332] ring-2 ring-[#2D6A4F]/20'
                      : 'border-[#D8E2DC] bg-[#F8FAF9] text-gray-600 hover:bg-white'
                  }`}
                  id="rx-mode-file"
                >
                  <ImageIcon className="w-5 h-5 text-[#2D6A4F]" />
                  <span className="text-xs font-bold">{t.uploadFromDevice}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateFileSelect('pdf')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    uploadMode === 'pdf'
                      ? 'border-[#2D6A4F] bg-[#F0F7F4] text-[#1B4332] ring-2 ring-[#2D6A4F]/20'
                      : 'border-[#D8E2DC] bg-[#F8FAF9] text-gray-600 hover:bg-white'
                  }`}
                  id="rx-mode-pdf"
                >
                  <FileText className="w-5 h-5 text-[#2D6A4F]" />
                  <span className="text-xs font-bold">{t.uploadPdf}</span>
                </button>
              </div>
            </div>

            {/* Document Preview & Compression Status */}
            <div className="border border-[#D8E2DC] bg-[#F8FAF9] rounded-2xl p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#D8F3DC] flex items-center justify-center text-[#2D6A4F]">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#1B4332] block truncate">
                      {uploadedImageName}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {isCompressing ? 'Compressing for low data...' : 'Optimized • End-to-End Encrypted (256-bit)'}
                    </span>
                  </div>
                </div>

                <span className="px-2 py-0.5 bg-[#D8F3DC] text-[#1B4332] text-[10px] font-black rounded-lg shrink-0">
                  Ready to send
                </span>
              </div>

              {/* Compression notice */}
              <div className="flex items-center gap-1.5 text-[11px] text-[#2D6A4F] font-semibold">
                <Zap className="w-3.5 h-3.5 text-[#52B788]" />
                <span>{t.compressingNotice}</span>
              </div>
            </div>

            {/* Patient & Clinic Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1B4332] mb-1">
                  {t.patientFullName} *
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#D8E2DC] text-xs font-semibold focus:ring-2 focus:ring-[#2D6A4F] bg-white text-[#1B4332]"
                  placeholder="e.g. Grace Muthoni"
                  id="rx-patient-name-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B4332] mb-1">
                  {t.patientPhoneLabel} *
                </label>
                <input
                  type="tel"
                  required
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#D8E2DC] text-xs font-semibold focus:ring-2 focus:ring-[#2D6A4F] bg-white text-[#1B4332]"
                  placeholder="+254 712 345 678"
                  id="rx-patient-phone-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B4332] mb-1">
                  Doctor Name
                </label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#D8E2DC] text-xs font-semibold focus:ring-2 focus:ring-[#2D6A4F] bg-white text-[#1B4332]"
                  placeholder="e.g. Dr. David Omondi"
                  id="rx-doctor-name-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B4332] mb-1">
                  Medical Center / Clinic
                </label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#D8E2DC] text-xs font-semibold focus:ring-2 focus:ring-[#2D6A4F] bg-white text-[#1B4332]"
                  placeholder="e.g. Nairobi West Endocrinology"
                  id="rx-clinic-name-input"
                />
              </div>
            </div>

            {/* Doctor Notes & Dosage instructions */}
            <div>
              <label className="block text-xs font-bold text-[#1B4332] mb-1">
                {t.doctorNotes}
              </label>
              <textarea
                rows={2}
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-[#D8E2DC] text-xs font-semibold focus:ring-2 focus:ring-[#2D6A4F] bg-white text-[#1B4332]"
                placeholder="Prescription instructions, duration, or refill requests..."
                id="rx-notes-textarea"
              />
            </div>

            {/* Chronic refill checkbox */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#D8E2DC]">
              <input
                type="checkbox"
                id="is-chronic-refill"
                checked={isChronic}
                onChange={(e) => setIsChronic(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#D8E2DC] text-[#2D6A4F] focus:ring-[#2D6A4F] cursor-pointer"
              />
              <label htmlFor="is-chronic-refill" className="text-xs text-[#1B4332] cursor-pointer">
                <strong className="text-[#1B4332] block font-bold">{t.isChronicCheck}</strong>
                Enroll this prescription into DAWA MED Monthly for automatic refills and pill reminders.
              </label>
            </div>

            {/* Encryption & Security Guarantee Banner */}
            <div className="p-3.5 rounded-2xl bg-[#F0F7F4] border border-[#74C69D] text-xs text-[#1B4332] flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{t.encryptedSafeNotice}</p>
                <p className="text-[11px] text-gray-600 mt-0.5">{t.licenseDisclaimer}</p>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl border border-[#D8E2DC] text-[#1B4332] text-xs font-bold hover:bg-[#F8FAF9] transition-colors cursor-pointer"
                id="rx-cancel-btn"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-2xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold shadow-md shadow-[#2D6A4F]/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                id="rx-submit-btn"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin text-[#74C69D]" />
                    <span>Encrypting & Transmitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#74C69D]" />
                    <span>{t.submitRxForVerification}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
