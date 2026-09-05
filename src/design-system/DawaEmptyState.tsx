import React from 'react';
import { PackageOpen } from 'lucide-react';
import { DawaButton } from './DawaButton';

export interface DawaEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const DawaEmptyState: React.FC<DawaEmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`w-full py-12 px-4 rounded-2xl bg-white border border-[#E8F5EE] shadow-[0_2px_8px_rgba(14,122,75,0.03)] flex flex-col items-center justify-center text-center ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-[#E8F5EE] border border-[#D0EADB] text-[#0E7A4B] flex items-center justify-center mb-4 shadow-2xs">
        {icon || <PackageOpen className="w-7 h-7" strokeWidth={1.8} />}
      </div>

      <h3 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight mb-1 max-w-md">
        {title}
      </h3>

      {description && (
        <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mb-5 leading-relaxed">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <DawaButton variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </DawaButton>
      )}
    </div>
  );
};
