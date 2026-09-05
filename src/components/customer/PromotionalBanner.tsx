import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { Language } from '../../types';
import promoMedImg from '../../assets/images/promo_medicine_pack_1788617257454.jpg';

interface PromotionalBannerProps {
  language: Language;
  onApplyCoupon: (code: string) => void;
  onOrderNow: () => void;
}

interface FeaturedPromotion {
  code: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  discountLabel: string;
  headlineAr: string;
  headlineEn: string;
  headlineSw?: string;
  badgeAr: string;
  badgeEn: string;
  badgeSw?: string;
  descriptionAr?: string;
  descriptionEn?: string;
}

export const PromotionalBanner: React.FC<PromotionalBannerProps> = ({
  language,
  onApplyCoupon,
  onOrderNow,
}) => {
  const isRtl = language === 'ar';
  const [copied, setCopied] = useState(false);
  const [promotion, setPromotion] = useState<FeaturedPromotion | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchPromotion = async () => {
      try {
        const res = await fetch('/api/monetization/promotions/featured');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.hasPromotion && data.promotion) {
              setPromotion(data.promotion);
            } else {
              setPromotion(null);
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch active promotion:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchPromotion();
    return () => {
      isMounted = false;
    };
  }, []);

  // If loading or no active promotion in database, do not render a fake promotion
  if (isLoading || !promotion) {
    return null;
  }

  const handleClaim = () => {
    onApplyCoupon(promotion.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    onOrderNow();
  };

  const headline = isRtl
    ? promotion.headlineAr
    : language === 'sw' && promotion.headlineSw
    ? promotion.headlineSw
    : promotion.headlineEn;

  const badgeText = isRtl
    ? promotion.badgeAr
    : language === 'sw' && promotion.badgeSw
    ? promotion.badgeSw
    : promotion.badgeEn;

  return (
    <div 
      className="relative w-full rounded-2xl bg-[#E8F5EE] border border-[#D0EADB] p-3 sm:p-4 overflow-hidden select-none shadow-[0_2px_10px_rgba(14,122,75,0.06)]"
      id="customer-promo-banner"
    >
      {/* Discount Badge in Top Corner */}
      <div className={`absolute top-2.5 sm:top-3 ${isRtl ? 'left-2.5 sm:left-3' : 'right-2.5 sm:right-3'} z-10`}>
        <div className="bg-[#0E7A4B] text-white text-[10px] sm:text-[10.5px] font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-xs flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-200" />
          <span>{badgeText}</span>
        </div>
      </div>

      <div className="relative z-1 flex items-center justify-between gap-2.5 sm:gap-3">
        {/* Text & Action Column */}
        <div className="flex-1 max-w-[62%] sm:max-w-[65%] space-y-1 sm:space-y-1.5">
          {/* Headline */}
          <h2 className="text-sm sm:text-base font-extrabold text-[#0E7A4B] leading-tight">
            {headline}
          </h2>

          {/* Code Subtext */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-600 font-medium">
            <span>{isRtl ? 'استخدم الكود:' : 'Use code:'}</span>
            <span className="font-mono font-bold text-[#0E7A4B] bg-white/90 px-1.5 py-0.5 rounded-lg border border-[#B7E4C7] shadow-2xs">
              {promotion.code}
            </span>
          </div>

          {/* "Order Now" Button */}
          <button
            type="button"
            onClick={handleClaim}
            className="mt-1.5 sm:mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#0E7A4B] hover:bg-[#0B6B43] active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            id="promo-order-now-btn"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-200" />
                <span>{isRtl ? 'تم تطبيق الخصم' : 'Applied!'}</span>
              </>
            ) : (
              <>
                <span>{isRtl ? 'اطلب الآن' : language === 'sw' ? 'Agiza Sasa' : 'Order Now'}</span>
                {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </>
            )}
          </button>
        </div>

        {/* Product Packaging Image Column */}
        <div className="shrink-0 w-20 h-20 sm:w-26 sm:h-26 flex items-center justify-center relative">
          <div className="w-full h-full rounded-2xl overflow-hidden border border-white/70 shadow-xs bg-white/40">
            <img
              src={promoMedImg}
              alt="Pharmacy Medicines"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
