import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface AuthPasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  containerClassName?: string;
  labelId?: string;
}

export const AuthPasswordInput: React.FC<AuthPasswordInputProps> = ({
  label,
  error,
  containerClassName = '',
  labelId,
  id,
  value,
  placeholder = '••••••••',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const safeValue = value === undefined || value === null ? '' : value;
  const safePlaceholder = placeholder === undefined || placeholder === null ? '••••••••' : placeholder;

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={id} 
          id={labelId}
          className="block text-[11px] font-medium text-[#8FA3BF] text-start mb-1 select-none"
        >
          {label}
        </label>
      )}

      <div className="relative w-full h-[38px]">
        <div className="absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8FA3BF] flex items-center justify-center">
          <Lock className="w-4 h-4 text-[#8FA3BF]" />
        </div>

        <input
          type={showPassword ? 'text' : 'password'}
          id={id}
          value={safeValue}
          placeholder={safePlaceholder}
          className={`w-full h-[38px] bg-[#EAF1FC] rounded-[12px] border ${
            error ? 'border-[#E91E4D]' : 'border-[#DFE8F6] focus:border-[#0E7A4B]'
          } outline-none ps-9 pe-9 text-[13px] text-[#111827] placeholder:text-[#94A3B8] transition-colors`}
          dir="ltr"
          {...props}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute end-3 top-1/2 -translate-y-1/2 text-[#8FA3BF] hover:text-[#475569] p-0.5 transition-colors cursor-pointer"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {error && (
        <p className="text-[11px] text-[#E91E4D] font-medium text-start mt-1">
          {error}
        </p>
      )}
    </div>
  );
};
