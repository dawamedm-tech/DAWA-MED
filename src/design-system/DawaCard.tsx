import React from 'react';

export interface DawaCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  bordered?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const DawaCard: React.FC<DawaCardProps> = ({
  children,
  hoverEffect = false,
  bordered = true,
  padding = 'md',
  className = '',
  ...props
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-6 sm:p-7',
  };

  const borderClass = bordered ? 'border border-[#E8F5EE]' : 'border-0';
  const hoverClass = hoverEffect 
    ? 'hover:shadow-[0_8px_24px_rgba(14,122,75,0.08)] hover:border-[#D0EADB] transition-all duration-200 cursor-pointer' 
    : '';

  return (
    <div
      className={`bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.04)] ${borderClass} ${paddingClasses[padding]} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
