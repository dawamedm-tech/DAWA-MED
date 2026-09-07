import React from 'react';

interface AuthDividerProps {
  text?: string;
  className?: string;
}

export const AuthDivider: React.FC<AuthDividerProps> = ({ 
  text,
  className = 'my-3.5' 
}) => {
  if (!text) {
    return <div className={`border-t border-[#EEF1F5] w-full ${className}`} />;
  }

  return (
    <div className={`relative flex items-center justify-center w-full select-none ${className}`}>
      <div className="border-t border-[#EEF1F5] w-full absolute inset-x-0" />
      <span className="bg-white px-3 text-[11px] text-[#8FA3BF] relative z-10 font-normal">
        {text}
      </span>
    </div>
  );
};
