/**
 * /_auth.tsx
 *
 * Auth layout route that wraps all authenticated pages.
 * Controls access and redirects based on login status.
 *
 * Features:
 * - Renders nested routes via <Outlet />
 * - Guards access with `beforeLoad`, which checks:
 *   - If the user is logged in
 *   - If there is no `token` in the URL search params
 * - If conditions fail, redirects the user to the login page
 *   with the current location saved in `redirect` param
 *
 * This route is useful for protecting sections of the app
 * that require authentication.
 */

import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
  component: () => <Outlet />,
  beforeLoad: ({ context, location, search }) => {
    if (context.isLoggedIn() && !search.token) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }

    return;
  },
});
