import { Link } from '@tanstack/react-router';
import React from 'react';

type LinkButtonSmallProps = {
  children: React.ReactNode;
  activeOptions?: {
    exact?: boolean;
  };
  to: string;
};

export default function LinkButtonSmall({ children, activeOptions, to }: LinkButtonSmallProps) {
  return (
    <Link
      to={to}
      className="my-4 bg-gray-300 hover:bg-gray-400 font-semibold text-black py-1 px-3 rounded 
      cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      activeProps={{ className: 'font-bold' }}
      activeOptions={activeOptions}
    >
      {children}
    </Link>
  );
}
