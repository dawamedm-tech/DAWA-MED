import React, { forwardRef } from 'react';

export interface DawaInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const DawaInput = forwardRef<HTMLInputElement, DawaInputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  containerClassName = '',
  id,
  disabled,
  ...props
}, ref) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className="text-xs sm:text-[13px] font-bold text-neutral-800 tracking-tight"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute start-3.5 flex items-center justify-center pointer-events-none text-neutral-400">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={`w-full h-12 px-3.5 ${leftIcon ? 'ps-10' : ''} ${rightIcon ? 'pe-10' : ''} bg-white border text-sm text-neutral-900 rounded-xl transition-all duration-150 outline-none disabled:bg-neutral-50 disabled:text-neutral-400 placeholder:text-neutral-400 ${
            error
              ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-3 focus:ring-[#EF4444]/15'
              : 'border-[#D1D5DB] hover:border-neutral-400 focus:border-[#0E7A4B] focus:ring-3 focus:ring-[#0E7A4B]/15'
          } ${className}`}
          {...props}
        />

        {rightIcon && (
          <div className="absolute end-3.5 flex items-center justify-center text-neutral-400">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs font-semibold text-[#EF4444] mt-0.5 animate-in fade-in-50">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-neutral-500 mt-0.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

DawaInput.displayName = 'DawaInput';
