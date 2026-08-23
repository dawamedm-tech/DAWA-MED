import React, { useState } from 'react';
import { 
  Star, 
  X, 
  CheckCircle2, 
  Building2, 
  Bike, 
  MessageSquare, 
  ThumbsUp, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { Order, OrderReview, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface OrderReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSubmitReview: (orderId: string, review: OrderReview) => void;
  language: Language;
}

export const OrderReviewModal: React.FC<OrderReviewModalProps> = ({
  isOpen,
  onClose,
  order,
  onSubmitReview,
  language,
}) => {
  const [pharmacyRating, setPharmacyRating] = useState<number>(5);
  const [pharmacyComment, setPharmacyComment] = useState<string>('');
  const [deliveryRating, setDeliveryRating] = useState<number>(5);
  const [deliveryComment, setDeliveryComment] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Fast Delivery', 'Well Packaged']);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen || !order) return null;

  const isAr = language === 'ar';

  const availableTags = [
    { id: 'fast', labelEn: '⚡ Fast Delivery', labelAr: '⚡ توصيل سريع' },
    { id: 'packaged', labelEn: '📦 Well Packaged', labelAr: '📦 تغليف محكم' },
    { id: 'cold_chain', labelEn: '❄️ Cold-Chain Maintained', labelAr: '❄️ حفظ تبريد سليم' },
    { id: 'polite', labelEn: '🤝 Polite Courier', labelAr: '🤝 سائق محترم' },
    { id: 'authentic', labelEn: '🛡️ Genuine Medicines', labelAr: '🛡️ أدوية أصلية ومطابقة' },
  ];

  const handleToggleTag = (tagLabel: string) => {
    setSelectedTags((prev) => 
      prev.includes(tagLabel) ? prev.filter((t) => t !== tagLabel) : [...prev, tagLabel]
    );
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    const reviewData: OrderReview = {
      pharmacyRating,
      pharmacyComment: pharmacyComment ? `${pharmacyComment} [Tags: ${selectedTags.join(', ')}]` : selectedTags.join(', '),
      deliveryRating,
      deliveryComment,
      submittedAt: new Date().toISOString(),
    };

    // Call backend API if available
    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: order.id,
        pharmacyId: order.pharmacyId,
        driverId: order.driverName,
        ...reviewData,
      }),
    }).catch(() => {});

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      onSubmitReview(order.id, reviewData);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1400);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-[#D8E2DC] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-[#1B4332] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#52B788]/20 border border-[#52B788]/40 flex items-center justify-center text-[#74C69D]">
              <Star className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-black">
                {isAr ? 'تقييم تجربة الاستلام' : 'Rate Your Medicine Delivery'}
              </h2>
              <p className="text-xs text-[#D8F3DC]">
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

        {submitted ? (
          <div className="p-10 text-center space-y-3">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="text-lg font-black text-[#1B4332]">
              {isAr ? 'شكراً لتقييمك ومشاركتنا رأيك!' : 'Thank you for your feedback!'}
            </h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              {isAr
                ? 'تقييمك يساعدنا على ضمان أعلى معايير الجودة والسلامة الدوائية عبر شبكة صيدليات DAWA MED.'
                : 'Your review helps ensure patient safety and top pharmacy compliance across the network.'}
            </p>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto space-y-6">
            {/* 1. Pharmacy Rating */}
            <div className="p-4 bg-[#F8FAF9] rounded-2xl border border-[#D8E2DC] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#2D6A4F]" />
                  <span className="text-xs font-black text-[#1B4332]">{order.pharmacyName}</span>
                </div>
                <span className="text-[11px] font-bold text-gray-500">{isAr ? 'تقييم الصيدلية' : 'Pharmacy'}</span>
              </div>

              {/* Star Picker */}
              <div className="flex items-center gap-2 justify-center py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={`pharmacy-star-${star}`}
                    onClick={() => setPharmacyRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${star <= pharmacyRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder={isAr ? 'ملاحظات حول دقة وتغليف الأدوية...' : 'Comments on medicine packaging, sealed box...'}
                value={pharmacyComment}
                onChange={(e) => setPharmacyComment(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D8E2DC] bg-white focus:outline-none focus:border-[#2D6A4F]"
              />
            </div>

            {/* 2. Driver Rating */}
            <div className="p-4 bg-[#F8FAF9] rounded-2xl border border-[#D8E2DC] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bike className="w-4 h-4 text-[#2D6A4F]" />
                  <span className="text-xs font-black text-[#1B4332]">{order.driverName || 'Courier Driver'}</span>
                </div>
                <span className="text-[11px] font-bold text-gray-500">{isAr ? 'تقييم التوصيل' : 'Delivery Rider'}</span>
              </div>

              {/* Star Picker */}
              <div className="flex items-center gap-2 justify-center py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={`driver-star-${star}`}
                    onClick={() => setDeliveryRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${star <= deliveryRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder={isAr ? 'ملاحظات حول سرعة التوصيل والتعامل...' : 'Comments on delivery speed, rider courtesy...'}
                value={deliveryComment}
                onChange={(e) => setDeliveryComment(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D8E2DC] bg-white focus:outline-none focus:border-[#2D6A4F]"
              />
            </div>

            {/* Quick Experience Badges */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 block">
                {isAr ? 'وسوم التجربة السريعة' : 'Highlights & Badges'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const label = isAr ? tag.labelAr : tag.labelEn;
                  const isSelected = selectedTags.includes(tag.labelEn) || selectedTags.includes(tag.labelAr);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => handleToggleTag(isAr ? tag.labelAr : tag.labelEn)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#1B4332] text-white'
                          : 'bg-[#F4F7F5] text-gray-700 hover:bg-[#E9F5EE] border border-[#D8E2DC]'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Safety & Compliance Badge */}
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>
                {isAr 
                  ? 'يتم توجيه جميع الملاحظات مباشرة إلى إدارة الجودة والتفتيش الصيدلي.' 
                  : 'All reviews are audited by the Chief Pharmacist & Quality Assurance desk.'}
              </span>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        {!submitted && (
          <div className="p-4 bg-[#F8FAF9] border-t border-[#D8E2DC] flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              {isAr ? 'تخطي الآن' : 'Skip for now'}
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-black transition-colors cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{isSubmitting ? (isAr ? 'جارِ الإرسال...' : 'Submitting...') : (isAr ? 'إرسال التقييم' : 'Submit Review')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
