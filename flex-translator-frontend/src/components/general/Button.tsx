import React from 'react';

type ButtonProps = {
  onClick?: () => void;
  buttonType?: 'primary' | 'secondary' | 'delete';
  children: React.ReactNode;
  submitButton?: boolean;
  disabled?: boolean;
};

export default function Button({ onClick, buttonType, children, submitButton, disabled }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`bg-backgroundTertiary hover:bg-backgroundPrimary font-semibold text-white 
        py-2 px-4 rounded cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 
        ${buttonType === 'secondary' ? 'opacity-50' : ''} ${buttonType === 'delete' ? 'text-red-500' : ''}`}
      type={submitButton ? 'submit' : 'button'}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
