import React from 'react';
import { Language } from '../../types';
import { ShieldCheck, Sparkles } from 'lucide-react';
import heroMedImg from '../../assets/images/hero_med_mobile_1788617244238.jpg';

interface HeroBannerProps {
  language: Language;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ language }) => {
  const isRtl = language === 'ar';

  return (
    <div 
      className="relative w-full rounded-2xl bg-[#E8F5EE] border border-[#D0EADB] pt-4 sm:pt-5 px-4 sm:px-5 pb-8 sm:pb-9 overflow-hidden select-none transition-all shadow-[0_2px_12px_rgba(14,122,75,0.05)]"
      id="customer-hero-banner"
    >
      {/* Decorative Subtle Background Ring */}
      <div className="absolute -top-10 -start-10 w-36 h-36 rounded-full bg-white/40 blur-xl pointer-events-none" />
      <div className="absolute -bottom-10 -end-10 w-44 h-44 rounded-full bg-emerald-400/15 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between gap-2 sm:gap-4">
        {/* Text Content Column */}
        <div className="flex-1 max-w-[62%] sm:max-w-[65%] space-y-1 sm:space-y-1.5">
          {/* Subtle Verified Badge */}
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/80 border border-[#B7E4C7] text-[10px] font-bold text-[#0E7A4B] mb-0.5">
            <ShieldCheck className="w-3 h-3 text-[#0E7A4B]" />
            <span>{isRtl ? 'صيدليات معتمدة' : 'Verified Pharmacies'}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-[21px] sm:text-2xl font-extrabold text-[#0E7A4B] leading-[1.25] tracking-tight">
            {isRtl ? (
              <>
                رعايتك الصحية
                <br />
                <span className="text-[#087443]">تبدأ من هنا</span>
              </>
            ) : language === 'sw' ? (
              <>
                Afya Yako
                <br />
                <span className="text-[#087443]">Huanzia Hapa</span>
              </>
            ) : (
              <>
                Your Healthcare
                <br />
                <span className="text-[#087443]">Starts Here</span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-[11.5px] sm:text-[13px] text-[#4B5563] leading-relaxed font-medium">
            {isRtl ? (
              <>أدوية أصلية، توصيل سريع وأمان تام</>
            ) : language === 'sw' ? (
              <>Dawa halisi, uwasilishaji wa haraka na usalama kamili</>
            ) : (
              <>Genuine medicines, fast delivery & total safety</>
            )}
          </p>
        </div>

        {/* Hero Visual Column: Smartphone + Medicine + Botanicals */}
        <div className="shrink-0 w-[100px] h-[100px] sm:w-[124px] sm:h-[124px] flex items-center justify-center relative">
          <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/60 shadow-sm">
            <img
              src={heroMedImg}
              alt="DAWA MED Care"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
