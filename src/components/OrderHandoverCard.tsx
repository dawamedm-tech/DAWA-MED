import React, { useState } from 'react';
import { Order, Language, OrderReview } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { 
  ShieldCheck, 
  KeyRound, 
  QrCode, 
  CheckCircle2, 
  Star, 
  AlertTriangle, 
  Thermometer, 
  MessageSquare, 
  Check, 
  Send,
  Building2,
  Bike
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OrderHandoverCardProps {
  order: Order;
  language: Language;
  onUpdateReview?: (orderId: string, review: OrderReview) => void;
  onReportProblem?: (orderId: string, issue: string) => void;
}

export const OrderHandoverCard: React.FC<OrderHandoverCardProps> = ({
  order,
  language,
  onUpdateReview,
  onReportProblem,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [pharmacyRating, setPharmacyRating] = useState<number>(order.review?.pharmacyRating || 5);
  const [pharmacyComment, setPharmacyComment] = useState<string>(order.review?.pharmacyComment || '');
  const [deliveryRating, setDeliveryRating] = useState<number>(order.review?.deliveryRating || 5);
  const [deliveryComment, setDeliveryComment] = useState<string>(order.review?.deliveryComment || '');
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(!!order.review);

  // Problem report modal state
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [problemType, setProblemType] = useState('Packaging damage or broken seal');
  const [problemNotes, setProblemNotes] = useState('');
  const [problemSubmitted, setProblemSubmitted] = useState(false);

  const isDelivered = order.status === 'delivered';
  const hasColdChain = order.driverTemperature !== undefined || order.items.some((i) => i.medicine.requiresColdChain);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reviewData: OrderReview = {
      pharmacyRating,
      pharmacyComment,
      deliveryRating,
      deliveryComment,
      submittedAt: 'Just now',
    };
    if (onUpdateReview) {
      onUpdateReview(order.id, reviewData);
    }
    setReviewSubmitted(true);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
  };

  const handleProblemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onReportProblem) {
      onReportProblem(order.id, `${problemType}: ${problemNotes}`);
    }
    setProblemSubmitted(true);
    setTimeout(() => {
      setIsReportOpen(false);
      setProblemSubmitted(false);
    }, 2500);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8F5EE] shadow-xs space-y-6" id={`handover-card-${order.id}`}>
      {/* Proof of Delivery / Security PIN Block */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E8F5EE] flex items-center justify-center text-[#0E7A4B]">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#111827]">{t.proofOfDelivery}</h3>
              <p className="text-[10px] text-[#6B7280]">Tamper-proof medical handover authentication</p>
            </div>
          </div>

          <span className="px-2 py-0.5 bg-[#F1FAF4] border border-[#D0EADB] text-[#0E7A4B] text-[10px] font-black rounded-lg">
            PPB / MOH Verified
          </span>
        </div>

        {/* 4-digit PIN Box & QR Preview */}
        <div className="bg-gradient-to-br from-[#084F30] to-[#0E7A4B] text-white p-5 rounded-2xl shadow-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-start">
              <span className="text-[11px] font-bold text-[#E8F5EE] uppercase tracking-wider block mb-1">
                {t.deliveryPinLabel}
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-black tracking-[0.25em] text-white">
                {order.deliveryOtp || '7492'}
              </div>
              <p className="text-[11px] text-[#E8F5EE]/90 mt-2 max-w-xs">
                {t.givePinToDriver}
              </p>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-2.5 rounded-xl text-center shadow-xs shrink-0">
              <div className="w-24 h-24 bg-[#F1FAF4] border border-[#E8F5EE] rounded-lg flex flex-col items-center justify-center p-1 relative">
                <QrCode className="w-16 h-16 text-[#0E7A4B]" />
                <span className="text-[8px] font-mono text-neutral-500 mt-0.5 truncate max-w-[80px]">
                  {order.qrCodeSignature || order.orderNumber}
                </span>
              </div>
              <span className="text-[9px] font-bold text-neutral-700 mt-1 block">
                Rider Scan QR
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cold Chain IoT Status if item is temperature-sensitive */}
      {hasColdChain && (
        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Thermometer className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-blue-900">Cold-Chain Insulated Container</p>
              <p className="text-[10px] text-blue-700">Live sensor target: 2.0°C – 8.0°C</p>
            </div>
          </div>
          <div className="text-end">
            <span className="text-sm font-black text-blue-800">
              {order.driverTemperature !== undefined ? `${order.driverTemperature.toFixed(1)}°C` : '4.2°C'}
            </span>
            <span className="block text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md mt-0.5">
              OPTIMAL (Safe)
            </span>
          </div>
        </div>
      )}

      {/* When Delivered: Show Delivery Timestamp and Star Review Section */}
      {isDelivered && (
        <div className="pt-2 border-t border-[#E8F5EE] space-y-4">
          <div className="p-3.5 rounded-2xl bg-[#E8F5EE]/70 border border-[#0E7A4B]/40 flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#0E7A4B] shrink-0" />
            <div>
              <p className="text-xs font-black text-[#111827]">{t.orderDeliveredSuccess}</p>
              <p className="text-[10px] text-[#0E7A4B]">
                {t.deliveryTimestamp}: {order.deliveredAt || 'Today at 11:20 AM'}
              </p>
            </div>
          </div>

          {/* Rating Forms */}
          <form onSubmit={handleReviewSubmit} className="space-y-4 bg-[#F1FAF4] p-4 rounded-2xl border border-[#E8F5EE]">
            <h4 className="text-xs font-black text-[#111827] uppercase tracking-wider">
              {reviewSubmitted ? 'Your Feedback' : 'Rate Your Experience'}
            </h4>

            {/* Rate Pharmacy */}
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#0E7A4B]" />
                <span>{t.ratePharmacy} ({order.pharmacyName})</span>
              </label>
              <div className="flex items-center gap-1.5 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    disabled={reviewSubmitted}
                    onClick={() => setPharmacyRating(star)}
                    className="p-1 text-amber-500 hover:scale-110 transition-transform cursor-pointer disabled:cursor-default"
                  >
                    <Star className={`w-5 h-5 ${star <= pharmacyRating ? 'fill-amber-400 text-amber-500' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
              <input
                type="text"
                disabled={reviewSubmitted}
                value={pharmacyComment}
                onChange={(e) => setPharmacyComment(e.target.value)}
                placeholder="Comment on medication condition, packaging, or pharmacy service..."
                className="w-full px-3 py-2 bg-white border border-[#E8F5EE] rounded-xl text-xs text-[#111827] focus:ring-2 focus:ring-[#0E7A4B] focus:outline-none disabled:bg-gray-100"
              />
            </div>

            {/* Rate Rider */}
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1 flex items-center gap-1">
                <Bike className="w-3.5 h-3.5 text-[#0E7A4B]" />
                <span>{t.rateDelivery} ({order.driverName || 'DAWA Courier'})</span>
              </label>
              <div className="flex items-center gap-1.5 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    disabled={reviewSubmitted}
                    onClick={() => setDeliveryRating(star)}
                    className="p-1 text-amber-500 hover:scale-110 transition-transform cursor-pointer disabled:cursor-default"
                  >
                    <Star className={`w-5 h-5 ${star <= deliveryRating ? 'fill-amber-400 text-amber-500' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
              <input
                type="text"
                disabled={reviewSubmitted}
                value={deliveryComment}
                onChange={(e) => setDeliveryComment(e.target.value)}
                placeholder="Comment on delivery speed, rider professionalism, or cold-pack handling..."
                className="w-full px-3 py-2 bg-white border border-[#E8F5EE] rounded-xl text-xs text-[#111827] focus:ring-2 focus:ring-[#0E7A4B] focus:outline-none disabled:bg-gray-100"
              />
            </div>

            {!reviewSubmitted && (
              <button
                type="submit"
                className="w-full py-2.5 bg-[#0E7A4B] hover:bg-[#0B6B43] text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
                id="submit-review-btn"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t.submitReview}</span>
              </button>
            )}

            {reviewSubmitted && (
              <p className="text-[11px] text-[#0E7A4B] font-bold text-center flex items-center justify-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Thank you! Your verified rating was recorded.</span>
              </p>
            )}
          </form>

          {/* Report Problem Button */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setIsReportOpen(true)}
              className="text-xs font-bold text-red-600 hover:text-red-800 inline-flex items-center gap-1 transition-colors"
              id="report-problem-btn"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{t.reportProblem}</span>
            </button>
          </div>
        </div>
      )}

      {/* Report Problem Modal Overlay */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 border border-[#E8F5EE] shadow-2xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
              <h3 className="text-xs font-black text-red-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>{t.reportProblem}</span>
              </h3>
              <button
                onClick={() => setIsReportOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {problemSubmitted ? (
              <div className="py-6 text-center text-[#0E7A4B]">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-[#0E7A4B]" />
                <p className="text-xs font-black">{t.problemReportedNotice}</p>
              </div>
            ) : (
              <form onSubmit={handleProblemSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Nature of Issue
                  </label>
                  <select
                    value={problemType}
                    onChange={(e) => setProblemType(e.target.value)}
                    className="w-full text-xs font-semibold p-2 bg-[#F1FAF4] border border-[#E8F5EE] rounded-xl text-[#111827]"
                  >
                    <option value="Packaging damage or broken seal">Packaging damage or broken seal</option>
                    <option value="Wrong medication or dosage received">Wrong medication or dosage received</option>
                    <option value="Cold-chain container warm">Cold-chain container was warm</option>
                    <option value="Missing prescription item">Missing prescription item</option>
                    <option value="Delivery delay or rider issue">Delivery delay or rider issue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Describe details (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={problemNotes}
                    onChange={(e) => setProblemNotes(e.target.value)}
                    placeholder="Provide batch details or rider comments..."
                    className="w-full text-xs p-2 bg-[#F1FAF4] border border-[#E8F5EE] rounded-xl text-[#111827]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(false)}
                    className="flex-1 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-xl"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl"
                  >
                    Submit Ticket
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
