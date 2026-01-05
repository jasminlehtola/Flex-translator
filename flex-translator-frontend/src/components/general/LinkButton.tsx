import { Link } from '@tanstack/react-router';
import React from 'react';

type LinkButtonProps = {
  children: React.ReactNode;
  activeOptions?: {
    exact?: boolean;
  };
  to: string;
};

export default function LinkButton({ children, activeOptions, to }: LinkButtonProps) {
  return (
    <Link
      to={to}
      className="border py-2 px-4 rounded-2xl hover:bg-backgroundButton hover:text-white"
      activeProps={{ className: 'font-bold' }}
      activeOptions={activeOptions}
    >
      {children}
    </Link>
  );
}
