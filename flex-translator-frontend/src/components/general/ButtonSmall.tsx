import React from 'react';

type ButtonSmallProps = {
  onClick?: () => void;
  buttonType?: 'primary' | 'secondary' | 'delete';
  children: React.ReactNode;
  submitButton?: boolean;
  disabled?: boolean;
  title?: string;
};

export default function ButtonSmall({
  onClick,
  buttonType,
  children,
  submitButton,
  disabled,
  title,
}: ButtonSmallProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={` bg-gray-300 hover:bg-gray-400 font-semibold text-black 
        py-1 px-3 rounded cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 
        ${buttonType === 'secondary' ? 'opacity-50' : ''} ${buttonType === 'delete' ? 'text-red-700 hover:bg-red-300' : ''}`}
      type={submitButton ? 'submit' : 'button'}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
