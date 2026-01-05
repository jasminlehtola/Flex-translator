/**
 * A basic loading screen.
 * Shows a semi-transparent black screen with a animated spinner on it.
 **/

import React from 'react';
import { LoaderCircle } from 'lucide-react';

const LoadingComponent: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center fixed inset-0 z-50 bg-black/60">
      <LoaderCircle className="animate-spin text-blue-600" size={55} />

      <p className="mt-4 text-xl font-medium text-white">Loading...</p>
      <p className="mt-2 text-sm text-gray-200">This might take a few seconds</p>
    </div>
  );
};

export default LoadingComponent;
