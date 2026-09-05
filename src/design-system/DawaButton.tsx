import React from 'react';
import { Loader2 } from 'lucide-react';

export type DawaButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type DawaButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface DawaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: DawaButtonVariant;
  size?: DawaButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const DawaButton: React.FC<DawaButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-bold transition-all select-none cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  const sizeClasses: Record<DawaButtonSize, string> = {
    sm: 'h-9 px-3.5 text-xs rounded-xl gap-1.5',
    md: 'h-11 sm:h-12 px-5 text-sm rounded-xl sm:rounded-2xl gap-2',
    lg: 'h-12 sm:h-14 px-6 text-base rounded-2xl gap-2.5',
    icon: 'w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl p-0',
  };

  const variantClasses: Record<DawaButtonVariant, string> = {
    primary: 'bg-[#0E7A4B] text-white hover:bg-[#0B6B43] shadow-[0_2px_8px_rgba(14,122,75,0.2)] hover:shadow-[0_4px_12px_rgba(14,122,75,0.3)] border border-transparent',
    secondary: 'bg-white text-[#0E7A4B] hover:bg-[#E8F5EE] border border-[#0E7A4B] shadow-xs',
    danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-[0_2px_8px_rgba(239,68,68,0.2)] border border-transparent',
    ghost: 'bg-transparent text-neutral-700 hover:text-[#0E7A4B] hover:bg-[#E8F5EE]',
    outline: 'bg-transparent text-neutral-700 hover:text-[#0E7A4B] hover:border-[#0E7A4B] border border-[#D1D5DB] hover:bg-[#F1FAF4]',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children && <span className="truncate">{children}</span>}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
