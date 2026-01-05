/**
 * main.tsx
 *
 * Entry point for the React application. Sets up core providers and routing.
 *
 * Responsibilities:
 * - Initializes React DOM rendering
 * - Configures the TanStack Router with:
 *   - Route tree
 *   - Default loading and error components
 *   - Query client context
 * - Wraps the app with:
 *   - React StrictMode
 *   - AuthProvider for authentication context
 *   - QueryClientProvider for data-fetching and caching
 * - Applies global styles
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorComponent, RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routeTree } from './routeTree.gen';
import './styles.css';
import LoadingComponent from './components/general/Loading';
import { AuthProvider } from './utils/auth.tsx';
import { authHelpers } from './utils/authHelper.ts';

export const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  defaultComponent: () => (
    <div className="p-2 text-2xl">
      <LoadingComponent />
    </div>
  ),
  defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
  context: {
    auth: undefined!,
    queryClient,
  },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('app')!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} defaultPreload="intent" context={authHelpers} />
        </QueryClientProvider>
      </AuthProvider>
    </React.StrictMode>
  );
}
