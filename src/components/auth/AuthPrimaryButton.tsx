import React from 'react';
import { RefreshCw } from 'lucide-react';

interface AuthPrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export const AuthPrimaryButton: React.FC<AuthPrimaryButtonProps> = ({
  children,
  isLoading = false,
  disabled = false,
  className = '',
  id = 'auth-primary-btn',
  type = 'submit',
  ...props
}) => {
  return (
    <button
      type={type}
      id={id}
      disabled={disabled || isLoading}
      className={`w-full h-[41px] rounded-[11.5px] bg-[#0E7A4B] hover:bg-[#0B6840] focus:outline-none focus:ring-2 focus:ring-[#0E7A4B]/30 active:scale-[0.99] text-white text-[13px] font-bold tracking-wide shadow-[0_2px_8px_rgba(14,122,75,0.22)] transition-all cursor-pointer flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {isLoading ? (
        <RefreshCw className="w-4 h-4 animate-spin text-white" />
      ) : (
        children
      )}
    </button>
  );
};
