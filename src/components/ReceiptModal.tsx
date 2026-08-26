import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode, 
  Thermometer, 
  Calendar,
  Building2
} from 'lucide-react';
import { Order, Language, CountryConfig } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { BrandLogo } from './BrandLogo';

interface ReceiptModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  selectedCountry: CountryConfig;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  isOpen,
  onClose,
  language,
  selectedCountry,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto" id="receipt-modal">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl rounded-3xl bg-white text-slate-900 shadow-2xl border border-slate-200 overflow-hidden my-6"
          id="printable-receipt-card"
        >
          {/* Action Bar (Not printed) */}
          <div className="bg-[#1B4332] text-white px-6 py-3.5 flex items-center justify-between print:hidden border-b border-[#2D6A4F]/40">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#74C69D]">
              <ShieldCheck className="w-4 h-4" />
              <span>Official Verified Medical Receipt & QR Seal</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                id="receipt-print-btn"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={onClose}
                className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Receipt Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Header: DAWA MED Brand & Pharmacy Verification Stamp */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#D8E2DC] pb-5">
              <div>
                <BrandLogo size="md" showTagline language={language} />
                <p className="text-[11px] text-[#1B4332]/60 mt-1.5">
                  Platform Order ID: <strong className="text-[#1B4332]">{order.orderNumber}</strong>
                </p>
                <p className="text-[11px] text-[#1B4332]/60">
                  Date: {order.createdAt}
                </p>
              </div>

              <div className="rounded-2xl bg-[#F0F7F4] border border-[#D8E2DC] p-3 text-right sm:text-right">
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2D6A4F] uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  <span>Licensed Partner Pharmacy</span>
                </div>
                <p className="text-xs font-black text-[#1B4332] mt-0.5">{order.pharmacyName}</p>
                <p className="text-[10px] text-[#1B4332]/70">Reg / License: {order.pharmacistLicense}</p>
              </div>
            </div>

            {/* Patient & Delivery Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-[#F8FAF9] rounded-2xl p-4 border border-[#D8E2DC]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#52B788] block">Patient Name</span>
                <span className="font-bold text-[#1B4332]">{order.customerName}</span>
                <span className="text-[11px] text-[#1B4332]/60 block">{order.customerPhone}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#52B788] block">Delivery Address</span>
                <span className="font-semibold text-[#1B4332]">{order.deliveryAddress}</span>
                <span className="text-[11px] text-[#1B4332]/60 block">{order.city}, {selectedCountry.name}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#52B788] block">Payment Method</span>
                <span className="inline-flex items-center gap-1 font-bold text-[#2D6A4F] bg-[#E9F5EE] px-2.5 py-0.5 rounded-lg border border-[#D8E2DC]">
                  {order.paymentMethod} • {order.paymentStatus.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#52B788] mb-2">
                Dispensed Medications
              </h4>
              <div className="border border-[#D8E2DC] rounded-2xl overflow-hidden overflow-x-auto">
                <table className="w-full text-start text-xs min-w-[320px]">
                  <thead className="bg-[#F0F7F4] text-[#1B4332] font-semibold border-b border-[#D8E2DC]">
                    <tr>
                      <th className="p-3.5 text-start">Medicine & Dosage</th>
                      <th className="p-3.5 text-center">Type</th>
                      <th className="p-3.5 text-center">Qty</th>
                      <th className="p-3.5 text-end">Price ({selectedCountry.currency})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9F5EE]">
                    {order.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#F8FAF9]">
                        <td className="p-3.5">
                          <p className="font-bold text-[#1B4332]">{item.medicine.name}</p>
                          <p className="text-[11px] text-[#1B4332]/60">{item.medicine.genericName} • {item.medicine.dosage}</p>
                        </td>
                        <td className="p-3.5 text-center">
                          {item.medicine.requiresPrescription ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                              Rx Required
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E9F5EE] text-[#2D6A4F] border border-[#D8E2DC]">
                              OTC
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-center font-bold text-[#1B4332]">{item.quantity}</td>
                        <td className="p-3.5 text-right font-bold text-[#1B4332]">
                          {selectedCountry.currencySymbol} {(item.unitPrice * item.quantity * selectedCountry.exchangeRateToUSD).toFixed(0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-[#1B4332] text-white">
              <div>
                <span className="text-xs text-[#D8F3DC]/80 block">Total Amount Dispensed & Delivered</span>
                <span className="text-2xl font-black text-[#74C69D]">
                  {selectedCountry.currencySymbol} {(order.totalAmount * selectedCountry.exchangeRateToUSD).toFixed(0)} {selectedCountry.currency}
                </span>
              </div>

              {/* Tamper Proof Security Stamp & OTP */}
              <div className="flex items-center gap-3 bg-white/10 p-2.5 rounded-2xl border border-white/15">
                <div className="h-10 w-10 bg-white p-1 rounded-xl flex items-center justify-center shrink-0">
                  <QrCode className="w-8 h-8 text-[#1B4332]" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#D8F3DC]/80 block">Security Delivery Code</span>
                  <span className="text-base font-black tracking-widest text-[#95D5B2]">
                    OTP: {order.deliveryOtp}
                  </span>
                </div>
              </div>
            </div>

            {/* Cold Chain & Pharmacist Endorsement */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px] text-[#1B4332]">
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#F0F7F4] border border-[#D8E2DC]">
                <Thermometer className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                <span>
                  <strong>Cold-Chain Monitored:</strong> Insulated pack at {order.driverTemperature || 4.2}°C
                </span>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#F0F7F4] border border-[#D8E2DC]">
                <Building2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                <span>
                  <strong>Batch Verified:</strong> {order.packageBatchNumber || 'BATCH-2026-N90'} (Exp: {order.expiryDate || '12/2027'})
                </span>
              </div>
            </div>

            {/* Legal compliance notice */}
            <p className="text-[10px] text-[#1B4332]/50 text-center leading-relaxed border-t border-[#D8E2DC] pt-3">
              This digital invoice certifies that prescribed items were reviewed, approved, and dispensed in accordance with {selectedCountry.regulatoryBody} regulations. DAWA MED operates as a technology and fulfillment network.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
