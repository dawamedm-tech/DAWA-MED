import React from 'react';
import { useSiteSettings } from '../../context/SiteSettingsContext';

interface AuthLogoProps {
  size?: number;
  className?: string;
  iconOnly?: boolean;
}

export const AuthLogo: React.FC<AuthLogoProps> = ({ size = 72, className = '' }) => {
  const { settings } = useSiteSettings();

  return (
    <div 
      className={`w-[72px] h-[72px] rounded-full border-2 border-[#A7F3D0] bg-white flex items-center justify-center p-2.5 shadow-2xs shrink-0 select-none relative mt-1 ${className}`}
      id="auth-logo-container"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {settings?.logoUrl ? (
        <img 
          src={settings.logoUrl} 
          alt="DAWA MED" 
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
        />
      ) : (
        <svg className="w-9 h-9" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="21" fill="#E8F5EE" />
          {/* Symmetrical medical cross in DAWA MED primary green #0E7A4B */}
          <rect x="20.5" y="11" width="7" height="26" rx="3.5" fill="#0E7A4B" />
          <rect x="11" y="20.5" width="26" height="7" rx="3.5" fill="#0E7A4B" />
          {/* Vitality center emblem */}
          <circle cx="24" cy="24" r="2.8" fill="#FFFFFF" />
          <circle cx="24" cy="24" r="1.5" fill="#1B4332" />
        </svg>
      )}
    </div>
  );
};
