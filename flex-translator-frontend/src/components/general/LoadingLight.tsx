/**
 * A spinner that shows on top of the translatable text in ChunkEditor.
 * White semi-transparent background with a "Processing"-text on it.
 * Indiciates to the user that something is happening while AI translators are translating current chunk.
 **/

import React from 'react';
import { LoaderCircle } from 'lucide-react';

const LoadingComponentLight: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-white/60">
      <LoaderCircle className="animate-spin text-blue-600" size={55} />

      <p className="mt-4 text-xl font-medium text-gray-700">Processing...</p>
    </div>
  );
};

export default LoadingComponentLight;
