type ButtonHelpProps = {
  onClick?: () => void;
  buttonType?: 'primary' | 'secondary';
  submitButton?: boolean;
  disabled?: boolean;
  tooltipText?: string;
};

export default function ButtonHelp({ onClick, buttonType, submitButton, disabled, tooltipText }: ButtonHelpProps) {
  return (
    <div className="relative group inline-block">
      <button
        onClick={onClick}
        className={` bg-blue-200 text-black  hover:bg-blue-400 rounded-full 
        w-6 h-6 mx-2 flex items-center justify-center text-sm font-bold
        ${buttonType === 'secondary' ? 'opacity-50' : ''} `}
        type={submitButton ? 'submit' : 'button'}
        disabled={disabled}
      >
        ?
      </button>
      <div
        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
          hidden group-hover:block px-2 py-1 text-sm text-white bg-gray-700 rounded shadow-lg 
          z-100 w-[220px] break-words text-center"
      >
        {tooltipText}
      </div>
    </div>
  );
}
