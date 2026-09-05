import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Language } from '../types';

export interface DawaPageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  language?: Language;
  className?: string;
}

export const DawaPageHeader: React.FC<DawaPageHeaderProps> = ({
  title,
  subtitle,
  onBack,
  backLabel,
  badge,
  actions,
  language = 'ar',
  className = '',
}) => {
  const isRtl = language === 'ar';

  return (
    <div className={`w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-4 border-b border-[#E5E7EB]/80 ${className}`}>
      <div className="flex items-start gap-3 min-w-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mt-0.5 p-2 rounded-xl bg-white hover:bg-[#E8F5EE] border border-[#E5E7EB] hover:border-[#B7E4C7] text-neutral-700 hover:text-[#0E7A4B] transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95"
            aria-label={backLabel || (isRtl ? 'رجوع' : 'Back')}
          >
            {isRtl ? (
              <ArrowRight className="w-4 h-4" />
            ) : (
              <ArrowLeft className="w-4 h-4" />
            )}
          </button>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-extrabold text-neutral-900 tracking-tight">
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 leading-relaxed font-normal">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
};
