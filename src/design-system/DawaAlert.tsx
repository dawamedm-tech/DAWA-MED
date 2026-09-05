import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type DawaAlertVariant = 'success' | 'warning' | 'error' | 'info';

export interface DawaAlertProps {
  variant?: DawaAlertVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const DawaAlert: React.FC<DawaAlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const configs: Record<DawaAlertVariant, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
    success: {
      bg: 'bg-[#F1FAF4]',
      border: 'border-[#D0EADB]',
      text: 'text-[#0E7A4B]',
      icon: <CheckCircle2 className="w-5 h-5 text-[#0E7A4B] shrink-0" />,
    },
    info: {
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      text: 'text-sky-900',
      icon: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
    },
  };

  const config = configs[variant];

  return (
    <div className={`w-full p-3.5 sm:p-4 rounded-2xl border ${config.bg} ${config.border} flex items-start gap-3 ${className}`}>
      {config.icon}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={`text-xs sm:text-sm font-extrabold ${config.text} mb-0.5`}>
            {title}
          </h4>
        )}
        <div className="text-xs sm:text-[13px] text-neutral-700 leading-relaxed font-normal">
          {children}
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg hover:bg-black/5"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
