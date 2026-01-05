/**
 * Route: /devLoading
 * Test route for editing the auto-translation loader.
 *
 * - Creates a circle loader that increases by a percentage every 2 seconds
 */

import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import LoadingAuto from '../components/general/LoadingAuto';

// Mock-loop component
function LoadingAutoDev() {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) return 0;
        return prev + 10;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  return <LoadingAuto translated={Math.round(percent / 10)} total={10} percent={percent} />;
}

export const Route = createFileRoute('/devLoading')({
  component: LoadingAutoDev,
});
