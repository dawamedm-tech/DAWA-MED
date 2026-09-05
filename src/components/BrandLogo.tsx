import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { useSiteSettings } from '../context/SiteSettingsContext';

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
  const { settings } = useSiteSettings();
  const [imageError, setImageError] = useState(false);

  const iconSizes = {
    sm: 'w-7 h-7 text-sm rounded-lg',
    md: 'w-10 h-10 text-xl rounded-xl',
    lg: 'w-12 h-12 text-2xl rounded-2xl',
    xl: 'w-16 h-16 text-3xl rounded-2xl',
  };

  const imageSizes = {
    sm: 'h-7 max-w-[120px]',
    md: 'h-10 max-w-[160px]',
    lg: 'h-12 max-w-[200px]',
    xl: 'h-16 max-w-[260px]',
  };

  const textSizes = {
    sm: 'text-base font-bold',
    md: 'text-2xl font-black leading-none tracking-tighter',
    lg: 'text-3xl font-black leading-none tracking-tighter',
    xl: 'text-4xl font-black leading-none tracking-tighter',
  };

  const taglineSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  const customLogoUrl = settings?.logoUrl;
  const hasCustomLogo = Boolean(customLogoUrl && !imageError);

  // If a custom logo image was uploaded from Admin Dashboard and loads cleanly
  if (hasCustomLogo && customLogoUrl) {
    return (
      <div className={`flex items-center gap-2.5 select-none ${className}`} id="dawa-brand-custom-logo">
        <img
          src={customLogoUrl}
          alt={settings?.siteName || 'DAWA MED'}
          className={`${imageSizes[size]} object-contain transition-transform duration-200 hover:scale-105`}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
        />
        {showTagline && (
          <p className={`${taglineSizes[size]} font-semibold ${isLightOnDark ? 'text-white/80' : 'text-[#6B7280]'} uppercase tracking-wider truncate max-w-[140px] sm:max-w-[220px] md:max-w-none mt-0.5`}>
            {language === 'ar' ? (settings?.taglineAr || t.tagline) : language === 'fr' ? (settings?.taglineFr || t.tagline) : (settings?.tagline || t.tagline)}
          </p>
        )}
      </div>
    );
  }

  const siteName = language === 'ar' ? (settings?.siteNameAr || 'دواء ميد') : (settings?.siteName || 'DAWA MED');

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`} id="dawa-brand-logo-container">
      {/* Default Brand Icon: Medical green box with white 'D' and cross mark accent */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center ${
          isLightOnDark ? 'bg-white text-[#0E7A4B]' : 'bg-[#0E7A4B] text-white'
        } shadow-xs shrink-0 font-black transition-transform group-hover:scale-105`}
        id="dawa-brand-icon"
      >
        <span>D</span>
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
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
            {language === 'ar' ? (settings?.taglineAr || t.tagline) : language === 'fr' ? (settings?.taglineFr || t.tagline) : (settings?.tagline || t.tagline)}
          </p>
        )}
      </div>
    </div>
  );
};
