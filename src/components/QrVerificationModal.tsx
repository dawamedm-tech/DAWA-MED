import React, { useState } from 'react';
import { 
  ShieldCheck, 
  QrCode, 
  X, 
  Scan, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Building2, 
  Clock, 
  FileCheck,
  Copy,
  Check
} from 'lucide-react';
import { Order, Language, CountryConfig } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface QrVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  language: Language;
  selectedCountry: CountryConfig;
  userRole?: 'customer' | 'pharmacy' | 'driver' | 'admin';
}

export const QrVerificationModal: React.FC<QrVerificationModalProps> = ({
  isOpen,
  onClose,
  order,
  language,
  selectedCountry,
  userRole = 'customer',
}) => {
  const [activeTab, setActiveTab] = useState<'qr_display' | 'scanner'>('qr_display');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<{
    verified: boolean;
    orderId: string;
    pharmacy: string;
    sealStatus: string;
    timestamp: string;
    temperatureStatus: string;
  } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !order) return null;

  const isAr = language === 'ar';

  // Secure Non-PII QR Payload signature
  const qrPayload = `dawa://verify?oid=${encodeURIComponent(order.orderNumber)}&pl=${encodeURIComponent(order.pharmacistLicense || 'LIC-VERIFIED')}&st=SEALED_AUTHENTIC&hash=${encodeURIComponent(order.qrCodeSignature || 'SHA256-SAFE-TOKEN')}&ts=${Date.now()}`;

  const handleSimulateScan = () => {
    setIsScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setIsScanning(false);
      setScanResult({
        verified: true,
        orderId: order.orderNumber,
        pharmacy: order.pharmacyName,
        sealStatus: '100% INTACT & AUTHENTIC',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temperatureStatus: `${order.driverTemperature || 4.2}°C Verified Cold-Chain`,
      });
    }, 1800);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(qrPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full border border-[#E8F5EE] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-[#0E7A4B] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F5EE] border border-[#D0EADB]/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black">
                {isAr ? 'التحقق الأمني برمز QR' : 'Tamper-Proof QR Verification'}
              </h2>
              <p className="text-xs text-white/80">
                {order.orderNumber} • {order.pharmacyName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-2 bg-[#F1FAF4] border-b border-[#E8F5EE] flex gap-2">
          <button
            onClick={() => { setActiveTab('qr_display'); setScanResult(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'qr_display'
                ? 'bg-white text-[#111827] shadow-xs'
                : 'text-gray-600 hover:text-[#111827]'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{isAr ? 'عرض رمز QR' : 'Package QR Code'}</span>
          </button>

          <button
            onClick={() => { setActiveTab('scanner'); handleSimulateScan(); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'scanner'
                ? 'bg-white text-[#111827] shadow-xs'
                : 'text-gray-600 hover:text-[#111827]'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>{isAr ? 'ماسح التحقق' : 'Scan & Verify Seal'}</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'qr_display' ? (
            <div className="space-y-4 text-center">
              {/* QR Visual */}
              <div className="p-5 bg-white rounded-2xl border-2 border-dashed border-[#D0EADB] inline-block mx-auto shadow-inner">
                {/* SVG Visual QR Mock representation */}
                <div className="w-48 h-48 bg-white flex flex-col items-center justify-center relative p-2">
                  <svg className="w-full h-full text-[#111827]" viewBox="0 0 100 100" fill="currentColor">
                    {/* Corners */}
                    <rect x="5" y="5" width="28" height="28" rx="2" fill="#0E7A4B" />
                    <rect x="9" y="9" width="20" height="20" rx="1" fill="#FFFFFF" />
                    <rect x="13" y="13" width="12" height="12" rx="1" fill="#0E7A4B" />

                    <rect x="67" y="5" width="28" height="28" rx="2" fill="#0E7A4B" />
                    <rect x="71" y="9" width="20" height="20" rx="1" fill="#FFFFFF" />
                    <rect x="75" y="13" width="12" height="12" rx="1" fill="#0E7A4B" />

                    <rect x="5" y="67" width="28" height="28" rx="2" fill="#0E7A4B" />
                    <rect x="9" y="71" width="20" height="20" rx="1" fill="#FFFFFF" />
                    <rect x="13" y="75" width="12" height="12" rx="1" fill="#0E7A4B" />

                    {/* Data Matrix Dots */}
                    <rect x="38" y="8" width="6" height="6" />
                    <rect x="48" y="8" width="6" height="6" />
                    <rect x="38" y="18" width="6" height="6" />
                    <rect x="58" y="18" width="6" height="6" />
                    <rect x="8" y="38" width="6" height="6" />
                    <rect x="18" y="48" width="6" height="6" />
                    <rect x="38" y="38" width="8" height="8" rx="1" fill="#0E7A4B" />
                    <rect x="50" y="38" width="6" height="6" />
                    <rect x="62" y="38" width="8" height="8" />
                    <rect x="76" y="38" width="6" height="6" />
                    <rect x="38" y="52" width="6" height="6" />
                    <rect x="52" y="52" width="10" height="10" fill="#10B981" />
                    <rect x="70" y="52" width="6" height="6" />
                    <rect x="84" y="52" width="6" height="6" />
                    <rect x="38" y="68" width="6" height="6" />
                    <rect x="48" y="68" width="6" height="6" />
                    <rect x="60" y="68" width="6" height="6" />
                    <rect x="76" y="68" width="8" height="8" />
                    <rect x="38" y="82" width="6" height="6" />
                    <rect x="50" y="82" width="8" height="8" />
                    <rect x="66" y="82" width="6" height="6" />
                    <rect x="80" y="82" width="8" height="8" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-white p-1 rounded-md shadow-xs border border-[#E8F5EE]">
                      <span className="text-[10px] font-black text-[#111827]">DAWA</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-black text-[#111827] uppercase tracking-wider">
                  {isAr ? 'رمز تحقق الطرد الآمن' : 'Tamper-Evident Package QR'}
                </p>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  {isAr 
                    ? 'يتم مسح هذا الرمز بواسطة الصيدلي والسائق لتأكيد سلامة الختم الطبي وتطابق الطلب.' 
                    : 'Scanned at pharmacy dispatch and doorstep handover to guarantee sealed integrity.'}
                </p>
              </div>

              {/* Strict Privacy Notice Banner */}
              <div className="p-3 bg-[#E8F5EE] border border-[#D0EADB]/40 rounded-2xl text-left flex items-start gap-2.5 text-xs text-[#111827]">
                <Lock className="w-4 h-4 text-[#0E7A4B] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">
                    {isAr ? 'حماية تامة لخصوصية المريض' : 'Zero Patient PII in QR Payload'}
                  </p>
                  <p className="text-[11px] text-gray-600">
                    {isAr 
                      ? 'لا يحتوي رمز QR على أي بيانات شخصية أو تفاصيل الوصفة الطبية لحماية خصوصيتك التامة.' 
                      : 'This QR only contains cryptographic authentication tokens, order status, and pharmacy license ID.'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCopyPayload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8F5EE] text-xs font-bold text-gray-600 hover:text-[#111827] hover:bg-[#F1FAF4] transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isAr ? 'تم نسخ الرمز' : 'Copied') : (isAr ? 'نسخ الرمز الأمني' : 'Copy Verification String')}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Scanner View Simulation */}
              <div className="relative w-full h-56 bg-slate-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center text-white border border-slate-700">
                {/* Laser animation */}
                <div className="absolute inset-x-8 top-1/2 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse" />
                
                {/* Viewfinder Target */}
                <div className="w-36 h-36 border-2 border-emerald-400/70 rounded-xl relative flex items-center justify-center">
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                  
                  {isScanning ? (
                    <div className="text-center space-y-1">
                      <Scan className="w-8 h-8 text-emerald-400 animate-bounce mx-auto" />
                      <p className="text-[10px] text-emerald-300 font-bold tracking-wider uppercase">Verifying Cryptographic Seal...</p>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Point camera at QR code</p>
                  )}
                </div>

                <div className="absolute bottom-3 inset-x-4 flex justify-between items-center text-[10px] text-slate-400">
                  <span>Camera: Active</span>
                  <span>SSL 256-bit Encrypted</span>
                </div>
              </div>

              {/* Scan Results */}
              {scanResult && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{isAr ? 'تم التحقق: الطرد أصلي ومختوم' : 'VERIFIED: Authentic Pharmacy Sealed Package'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 pt-2 border-t border-emerald-200/60 font-medium">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Order Reference</span>
                      <strong className="text-[#111827]">{scanResult.orderId}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Dispensing Pharmacy</span>
                      <strong className="text-[#111827]">{scanResult.pharmacy}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Tamper Seal Status</span>
                      <span className="text-emerald-700 font-bold">{scanResult.sealStatus}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Cold-Chain Telemetry</span>
                      <span className="text-blue-700 font-bold">{scanResult.temperatureStatus}</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleSimulateScan}
                disabled={isScanning}
                className="w-full py-3 rounded-2xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white font-black text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Scan className="w-4 h-4" />
                <span>{isScanning ? (isAr ? 'جارِ المسح...' : 'Scanning...') : (isAr ? 'إعادة مسح الرمز' : 'Scan Package Again')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F1FAF4] border-t border-[#E8F5EE] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-black transition-colors cursor-pointer"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
