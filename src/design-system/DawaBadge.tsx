import React from 'react';

export type DawaBadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'mint';
export type DawaBadgeSize = 'sm' | 'md';

export interface DawaBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: DawaBadgeVariant;
  size?: DawaBadgeSize;
  icon?: React.ReactNode;
}

export const DawaBadge: React.FC<DawaBadgeProps> = ({
  children,
  variant = 'mint',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const sizeClasses: Record<DawaBadgeSize, string> = {
    sm: 'text-[10px] px-2 py-0.5 rounded-full font-bold gap-1',
    md: 'text-xs px-2.5 py-1 rounded-full font-bold gap-1.5',
  };

  const variantClasses: Record<DawaBadgeVariant, string> = {
    mint: 'bg-[#E8F5EE] text-[#0E7A4B] border border-[#D0EADB]',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    error: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-sky-50 text-sky-800 border border-sky-200',
    neutral: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
  };

  return (
    <span
      className={`inline-flex items-center justify-center whitespace-nowrap leading-none transition-colors ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
