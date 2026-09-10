import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { useBranding } from '../hooks/useBranding';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  language?: Language;
  className?: string;
  isLightOnDark?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = false,
  language = 'en',
  className = '',
  isLightOnDark = false,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const branding = useBranding();
  const [imageError, setImageError] = useState(false);

  // Reset image error whenever logoUrl changes
  useEffect(() => {
    setImageError(false);
  }, [branding.logoUrl]);

  const iconSizes = {
    sm: 'w-7 h-7 text-xs rounded-lg',
    md: 'w-10 h-10 text-base rounded-xl',
    lg: 'w-12 h-12 text-xl rounded-2xl',
    xl: 'w-16 h-16 text-2xl rounded-2xl',
  };

  const imageSizes = {
    sm: 'h-7 max-w-[120px]',
    md: 'h-10 max-w-[160px]',
    lg: 'h-12 max-w-[200px]',
    xl: 'h-16 max-w-[260px]',
  };

  const textSizes = {
    sm: 'text-base font-bold',
    md: 'text-xl sm:text-2xl font-black leading-none tracking-tight',
    lg: 'text-2xl sm:text-3xl font-black leading-none tracking-tight',
    xl: 'text-3xl sm:text-4xl font-black leading-none tracking-tight',
  };

  const taglineSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  const customLogoUrl = branding.logoUrl;
  const hasCustomLogo = Boolean(customLogoUrl && !imageError);

  // If a custom logo image was uploaded by Admin and loads cleanly
  if (hasCustomLogo && customLogoUrl) {
    return (
      <div className={`flex items-center gap-2.5 select-none ${className}`} id="dawa-brand-custom-logo">
        <img
          src={customLogoUrl}
          alt={branding.siteName || 'DAWA MED'}
          className={`${imageSizes[size]} object-contain transition-transform duration-200 hover:scale-105`}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
        />
        {showTagline && (
          <p className={`${taglineSizes[size]} font-semibold ${isLightOnDark ? 'text-white/80' : 'text-[#6B7280]'} uppercase tracking-wider truncate max-w-[140px] sm:max-w-[220px] md:max-w-none mt-0.5`}>
            {language === 'ar' ? (branding.taglineAr || t.tagline) : language === 'fr' ? (branding.taglineFr || t.tagline) : (branding.tagline || t.tagline)}
          </p>
        )}
      </div>
    );
  }

  const siteName = language === 'ar' ? (branding.siteNameAr || 'دواء ميد') : (branding.siteName || 'DAWA MED');

  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 select-none ${className}`} id="dawa-brand-logo-container">
      {/* Official Fallback Brand Icon: Medical shield with white cross accent */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center ${
          isLightOnDark ? 'bg-white text-[#0E7A4B]' : 'bg-[#0E7A4B] text-white'
        } shadow-2xs shrink-0 font-black transition-transform duration-200 hover:scale-105`}
        id="dawa-brand-icon"
      >
        <svg className="w-1/2 h-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-white" />
      </div>

      {/* Brand Name & Tagline */}
      <div className="flex flex-col min-w-0">
        <div className={textSizes[size]}>
          <span className={isLightOnDark ? 'text-white font-black' : 'text-[#0E7A4B] font-black'}>
            {siteName.split(' ')[0] || 'DAWA'}
          </span>
          <span className={`ml-1 font-black ${isLightOnDark ? 'text-emerald-300' : 'text-[#111827]'}`}>
            {siteName.split(' ').slice(1).join(' ') || 'MED'}
          </span>
        </div>
        
        {showTagline && (
          <p className={`${taglineSizes[size]} font-semibold ${isLightOnDark ? 'text-white/80' : 'text-[#6B7280]'} uppercase tracking-wider truncate max-w-[140px] sm:max-w-[220px] md:max-w-none mt-0.5`}>
            {language === 'ar' ? (branding.taglineAr || t.tagline) : language === 'fr' ? (branding.taglineFr || t.tagline) : (branding.tagline || t.tagline)}
          </p>
        )}
      </div>
    </div>
  );
};

