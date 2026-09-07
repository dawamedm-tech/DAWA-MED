import React from 'react';

interface AuthTitleProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export const AuthTitle: React.FC<AuthTitleProps> = ({ 
  children, 
  id = 'auth-title',
  className = '' 
}) => {
  return (
    <h1 
      id={id}
      className={`text-[21px] font-bold text-[#111827] mt-3 tracking-tight text-center ${className}`}
    >
      {children}
    </h1>
  );
};
