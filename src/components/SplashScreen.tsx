import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandLogo } from './BrandLogo';
import { ShieldCheck, MapPin, Truck, Award, ArrowRight, X } from 'lucide-react';
import { Language, CountryConfig } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface SplashScreenProps {
  language: Language;
  selectedCountry: CountryConfig;
  onDismiss: () => void;
  isOpen: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  language,
  selectedCountry,
  onDismiss,
  isOpen,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
        id="dawa-splash-overlay"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-[#0E7A4B] text-white shadow-2xl border border-[#0B6B43]"
          id="dawa-splash-card"
        >
          {/* Close button */}
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition-all cursor-pointer"
            aria-label="Close"
            id="splash-close-btn"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 p-6 sm:p-8 flex flex-col items-center text-center">
            {/* Top Africa Regional Badge */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D0EADB] bg-white/10 px-3.5 py-1 text-xs font-semibold text-white/80">
              <span>{selectedCountry.flag}</span>
              <span>African Health Logistics Network</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#0E7A4B] animate-pulse" />
            </div>

            {/* Brand Logo Display */}
            <div className="my-3 scale-110">
              <BrandLogo size="xl" isLightOnDark showTagline language={language} />
            </div>

            {/* Meaning & Purpose */}
            <div className="mt-4 rounded-2xl bg-white/10 p-4 border border-white/15 text-left w-full">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-emerald-400 border border-white/15">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    The Name Behind DAWA MED
                  </h4>
                  <p className="text-xs text-white/80/90 mt-1 leading-relaxed">
                    <strong className="text-white">DAWA</strong> means <span className="text-emerald-300 font-semibold">&ldquo;Medicine&rdquo;</span> in Swahili, paired with <strong className="text-white">MED</strong> (Medical). Connecting patients to certified licensed pharmacies without storing or manufacturing drugs.
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Pillars */}
            <div className="my-5 grid grid-cols-3 gap-2.5 w-full text-center">
              <div className="rounded-2xl bg-white/10 p-3 border border-white/10">
                <ShieldCheck className="mx-auto h-5 w-5 text-emerald-400 mb-1" />
                <p className="text-[11px] font-bold text-white">100% Licensed</p>
                <p className="text-[9px] text-white/80/70">Board Registered</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3 border border-white/10">
                <Truck className="mx-auto h-5 w-5 text-emerald-300 mb-1" />
                <p className="text-[11px] font-bold text-white">Cold-Chain</p>
                <p className="text-[9px] text-white/80/70">2-8°C Insulated</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3 border border-white/10">
                <MapPin className="mx-auto h-5 w-5 text-amber-300 mb-1" />
                <p className="text-[11px] font-bold text-white">Doorstep</p>
                <p className="text-[9px] text-white/80/70">Pan-African Access</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden mb-5">
              <div
                className="bg-[#0E7A4B] h-full rounded-full transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Enter Button */}
            <button
              onClick={onDismiss}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              id="splash-enter-btn"
            >
              <span>{language === 'ar' ? 'الدخول للمنصة' : language === 'sw' ? 'Ingia Kwenye Jukwaa' : 'Launch DAWA MED Platform'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Regulatory footnote */}
            <p className="mt-3 text-[10px] text-white/80/60">
              Compliant with {selectedCountry.regulatoryBody}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
