import React from 'react';

interface AuthFooterLinkProps {
  promptText: string;
  actionText: string;
  onAction: () => void;
  id?: string;
  className?: string;
}

export const AuthFooterLink: React.FC<AuthFooterLinkProps> = ({
  promptText,
  actionText,
  onAction,
  id = 'auth-footer-link',
  className = ''
}) => {
  return (
    <div className={`text-center pt-2 text-[12px] text-[#475569] select-none ${className}`}>
      <span>{promptText} </span>
      <button
        type="button"
        onClick={onAction}
        id={id}
        className="font-bold text-[#0E7A4B] hover:text-[#0B6840] hover:underline cursor-pointer transition-colors"
      >
        {actionText}
      </button>
    </div>
  );
};
