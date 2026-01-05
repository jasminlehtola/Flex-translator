import { ArrowBigLeft, ArrowBigRight } from 'lucide-react';

export const ArrowLeft = ({ onClick }: { onClick: () => void }) => {
  return (
    <button onClick={onClick} className="p-2 text-textSecondary hover:text-textAccent">
      <ArrowBigLeft className="w-10 h-10" />
    </button>
  );
};

export const ArrowRight = ({ onClick }: { onClick: () => void }) => {
  return (
    <button onClick={onClick} className="p-2 text-textSecondary hover:text-textAccent">
      <ArrowBigRight className="w-10 h-10" />
    </button>
  );
};
