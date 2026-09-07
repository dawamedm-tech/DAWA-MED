import React from 'react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  containerClassName?: string;
  labelId?: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  icon,
  error,
  containerClassName = '',
  labelId,
  id,
  value,
  placeholder,
  ...props
}) => {
  // Guard against undefined strings rendering to user
  const safeValue = value === undefined || value === null ? '' : value;
  const safePlaceholder = placeholder === undefined || placeholder === null ? '' : placeholder;

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
        {icon && (
          <div className="absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8FA3BF] flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          id={id}
          value={safeValue}
          placeholder={safePlaceholder}
          className={`w-full h-[38px] bg-[#EAF1FC] rounded-[12px] border ${
            error ? 'border-[#E91E4D]' : 'border-[#DFE8F6] focus:border-[#0E7A4B]'
          } outline-none ${icon ? 'ps-9 pe-3' : 'px-3'} text-[13px] text-[#111827] placeholder:text-[#94A3B8] transition-colors`}
          {...props}
        />
      </div>

      {error && (
        <p className="text-[11px] text-[#E91E4D] font-medium text-start mt-1">
          {error}
        </p>
      )}
    </div>
  );
};
