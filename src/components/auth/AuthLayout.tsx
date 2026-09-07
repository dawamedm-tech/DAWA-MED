import React from 'react';
import { X } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  onClose?: () => void;
  isRtl?: boolean;
  className?: string;
  id?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  onClose,
  isRtl = true,
  className = '',
  id = 'dawa-auth-canvas'
}) => {
  return (
    <div 
      className={`min-h-screen w-full bg-white flex flex-col items-center justify-start sm:justify-center p-0 selection:bg-[#0E7A4B]/15 selection:text-[#0E7A4B] font-['Tajawal',sans-serif] ${className}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      id={id}
    >
      {/* Centered canvas matching the exact 416 × 588 px proportions */}
      <div 
        className="w-full max-w-[380px] bg-white px-4 sm:px-0 pt-[20px] pb-[20px] flex flex-col items-center relative mx-auto"
        id="auth-canvas-inner"
      >
        {/* Top Close Button: ~32 × 32 px, light gray/blue background, small dark gray X icon */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={`absolute top-[18px] ${isRtl ? 'left-4 sm:left-0' : 'right-4 sm:right-0'} w-[32px] h-[32px] rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] active:scale-95 flex items-center justify-center transition-all cursor-pointer z-20 border border-[#E2E8F0]/40 shadow-2xs`}
            aria-label="Close"
            id="auth-close-button"
          >
            <X className="w-3.5 h-3.5 text-[#475569] stroke-[2.5]" />
          </button>
        )}

        {children}
      </div>
    </div>
  );
};
