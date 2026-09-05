import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { DawaButton } from './DawaButton';

export interface DawaErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export const DawaErrorState: React.FC<DawaErrorStateProps> = ({
  title = 'تعذر تحميل البيانات',
  message = 'يرجى التحقق من الاتصال والمحاولة مرة أخرى.',
  onRetry,
  retryLabel = 'إعادة المحاولة',
  className = '',
}) => {
  return (
    <div
      className={`w-full py-10 px-4 rounded-2xl bg-red-50/50 border border-red-200/80 flex flex-col items-center justify-center text-center ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
        <AlertTriangle className="w-6 h-6" strokeWidth={2} />
      </div>

      <h4 className="text-sm sm:text-base font-bold text-neutral-900 mb-1">
        {title}
      </h4>

      <p className="text-xs text-neutral-600 max-w-sm mb-4">
        {message}
      </p>

      {onRetry && (
        <DawaButton
          variant="secondary"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          {retryLabel}
        </DawaButton>
      )}
    </div>
  );
};
