import React from 'react';

interface AuthSubtitleProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export const AuthSubtitle: React.FC<AuthSubtitleProps> = ({ 
  children, 
  id = 'auth-subtitle',
  className = '' 
}) => {
  return (
    <p 
      id={id}
      className={`text-[12.5px] leading-[1.7] text-[#8FA3BF] mt-1 text-center max-w-[295px] ${className}`}
    >
      {children}
    </p>
  );
};
