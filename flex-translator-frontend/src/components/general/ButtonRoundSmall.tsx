import React from 'react';

type ButtonSmallProps = {
  onClick?: () => void;
  buttonType?: 'primary' | 'secondary' | 'delete';
  children: React.ReactNode;
  submitButton?: boolean;
  disabled?: boolean;
};

export default function ButtonSmall({ onClick, buttonType, children, submitButton, disabled }: ButtonSmallProps) {
  return (
    <button
      onClick={onClick}
      className={` bg-gray-200 text-black  hover:bg-gray-400 rounded-full 
        w-6 h-6 mr-2 flex items-center justify-center text-sm font-bold
        ${buttonType === 'secondary' ? 'opacity-50' : ''} ${buttonType === 'delete' ? ' hover:bg-red-300' : ''}`}
      type={submitButton ? 'submit' : 'button'}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
