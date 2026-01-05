/**
 * tokenErrorBanner.tsx
 *
 * Displays a visual error banner when there's an authentication error (e.g., expired session).
 * The error message is pulled from the global auth context and typically set via response interceptors.
 *
 * Features:
 * - Conditionally renders a red error banner if `authError` exists
 * - Reads and optionally clears auth error via `useAuth` context
 *
 * Usage:
 * - Place inside layout components (e.g. `__root.tsx`) to globally display session-related issues
 * - Commonly triggered by 401 responses handled in `authErrorHandler.ts`
 */

import { useAuth } from './auth';

export function TokenErrorBanner() {
  const { authError } = useAuth();

  if (!authError) return null;

  return <div className="bg-red-100 text-red-800 p-4 m-4 rounded text-center">{authError}</div>;
}
