/**
 * __root.tsx
 *
 * Root layout component for the app's routing structure using TanStack Router.
 * Sets up global navigation, logout logic, dev tools, and context.
 *
 * Features:
 * - Defines the top-level route using `createRootRouteWithContext`
 * - Dynamically renders navigation links based on auth state
 * - Handles logout and router invalidation
 * - Displays a banner for token-related errors
 * - Renders nested child routes via <Outlet />
 * - Includes developer tools for router and query debugging
 *
 * Context:
 * - Provides access to TanStack QueryClient across routes
 */

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Link, Outlet, createRootRouteWithContext, useNavigate, useRouter } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
// import LoadingComponent from '../components/general/Loading';
import type { QueryClient, useIsFetching } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth.ts';
import { TokenErrorBanner } from '../utils/tokenErrorBanner';

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
});

function RootComponent() {
  const auth = useAuth();
  const router = useRouter();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate({ to: '/login' });
    router.invalidate();
  };

  // Defining nav links dynamically
  const links: [string, string][] = [
    ['/', 'Home'],
    ['/translate', 'Translate & Edit'],
    ['/deeplFileTranslate', 'Quick File Translation – No edits'],
    ['/translations', 'Translations'],
    ['/profile', 'Profile'],
    ['/settings', 'Settings'],
  ];

  // If user is not logged in, adds Login-link to the list
  if (!auth.user_id) {
    links.push(['/login', 'Login']);
  }

  return (
    <>
      <div className="flex flex-col p-2">
        <div className="flex items-center gap-2 py-4">
          <h1 className="text-3xl p-2">Flex Translator</h1>

          <div className="flex flex-row items-center gap-4">
            {links.map(([to, label]) => (
              <Link
                key={to}
                to={to}
                preload="intent"
                className="block py-2 px-3 text-textAccent hover:bg-gray-200 rounded transition-colors"
                activeProps={{ className: 'font-bold' }}
              >
                {label}
              </Link>
            ))}

            {/* Logged user can see the Logout-button */}
            {auth.user_id && (
              <button
                onClick={handleLogout}
                className="
                  block
                  ml-7
                  py-2
                  px-3
                  bg-blue-500 
                  text-white
                  text-textAccent
                  hover:bg-gray-200
                  hover:text-backgroundPrimary
                  hover:font-bold
                  rounded-full
                  transition-colors
                "
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-row">
        <div className="flex-1 ">
          <TokenErrorBanner />
          <Outlet />
        </div>
      </div>

      <TanStackRouterDevtools />
      <ReactQueryDevtools />
    </>
  );
}
