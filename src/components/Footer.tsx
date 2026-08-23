import React from 'react';
import { BrandLogo } from './BrandLogo';
import { Language, CountryConfig } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { ShieldCheck, Award, Shield, FileText, AlertTriangle, ThermometerSnowflake, RefreshCcw, Lock } from 'lucide-react';
import { COUNTRIES } from '../data/mockData';

interface FooterProps {
  language: Language;
  selectedCountry: CountryConfig;
  onOpenSplash: () => void;
  onOpenUploadRx: () => void;
  onOpenLegal?: () => void;
  onOpenHealthTests?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  language,
  selectedCountry,
  onOpenSplash,
  onOpenUploadRx,
  onOpenLegal,
  onOpenHealthTests,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <footer className="bg-[#1B4332] text-[#D8F3DC]/80 text-xs border-t border-[#2D6A4F]/40 mt-16" id="dawa-main-footer">
      {/* Top Banner: Meaning & Mission */}
      <div className="border-b border-[#2D6A4F]/60 bg-[#133024] py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/10 text-[#74C69D] flex items-center justify-center border border-white/15 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">
                DAWA = &ldquo;Medicine&rdquo; in Swahili • MED = Medical
              </p>
              <p className="text-[#95D5B2] text-[11px] mt-0.5">
                {t.tagline} — Safe prescription access & cold-chain delivery across Africa.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenHealthTests && (
              <button
                onClick={onOpenHealthTests}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-xs border border-white/15 transition-colors cursor-pointer"
              >
                {t.systemHealthTests}
              </button>
            )}
            <button
              onClick={onOpenSplash}
              className="px-4 py-2 bg-[#52B788] hover:bg-[#74C69D] text-[#1B4332] rounded-2xl font-bold text-xs transition-colors cursor-pointer"
            >
              Read Brand Story
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: Brand Info */}
        <div className="space-y-3">
          <BrandLogo size="md" isLightOnDark showTagline language={language} />
          <p className="text-[11px] text-[#D8F3DC]/70 leading-relaxed">
            A digital healthcare access platform connecting patients to registered, licensed pharmacies and verified cold-chain couriers.
          </p>
          <div className="pt-1 flex items-center gap-2 text-[11px] text-[#74C69D] font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Ministry of Health & Board of Pharmacy Compliant</span>
          </div>
        </div>

        {/* Col 2: African Markets */}
        <div>
          <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-3">
            African Regional Coverage
          </h4>
          <ul className="space-y-2 text-[11px]">
            {COUNTRIES.map((c) => (
              <li key={c.code} className="flex items-center gap-2 text-[#D8F3DC]">
                <span>{c.flag}</span>
                <span>{c.name} ({c.currency})</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Compliance & Legal Policies */}
        <div>
          <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-3">
            {t.legalComplianceCenter}
          </h4>
          <ul className="space-y-2 text-[11px] text-[#D8F3DC]/80">
            {onOpenLegal && (
              <>
                <li>
                  <button onClick={onOpenLegal} className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left">
                    <Lock className="w-3.5 h-3.5 text-[#74C69D]" />
                    <span>{t.legalPrivacy}</span>
                  </button>
                </li>
                <li>
                  <button onClick={onOpenLegal} className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left">
                    <FileText className="w-3.5 h-3.5 text-[#74C69D]" />
                    <span>{t.legalTerms}</span>
                  </button>
                </li>
                <li>
                  <button onClick={onOpenLegal} className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left">
                    <ThermometerSnowflake className="w-3.5 h-3.5 text-[#74C69D]" />
                    <span>{t.legalDelivery} (2°C - 8°C)</span>
                  </button>
                </li>
                <li>
                  <button onClick={onOpenLegal} className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left">
                    <RefreshCcw className="w-3.5 h-3.5 text-[#74C69D]" />
                    <span>{t.legalRefund}</span>
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Col 4: Legal & Emergency Notice */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-2">
            Important Medical Disclaimer
          </h4>
          <p className="text-[10px] text-[#D8F3DC]/70 leading-relaxed bg-white/5 p-3 rounded-2xl border border-white/10">
            <strong>DAWA MED is not a pharmacy.</strong> We do not stock, store, or manufacture drugs. All prescription items require validation by a licensed pharmacist in full accordance with local pharmaceutical regulatory boards.
          </p>
          <p className="text-[10px] text-amber-300 font-semibold">
            🚨 {t.emergencyNotice}
          </p>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="border-t border-[#2D6A4F]/60 py-4 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-center text-[10px] text-[#D8F3DC]/60 max-w-7xl mx-auto">
        <div>© 2026 DAWA MED Inc. All rights reserved. Your Medicine. Delivered.</div>
        <div className="flex items-center gap-4">
          {onOpenLegal && (
            <button onClick={onOpenLegal} className="hover:text-white underline cursor-pointer">
              Patient Data Rights & Privacy Tools
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};
