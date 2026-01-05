/**
 * /_auth/profile.tsx
 *
 * This route handles post-login token redirection and user profile display.
 * It's typically used as a landing point after an external auth flow.
 *
 * Features:
 * - Reads access and refresh tokens from URL query parameters (?token=...&refresh=...)
 * - Saves the refresh token to localStorage if present
 * - Uses the access token to log in the user via `auth.loginWithToken`
 * - Redirects to /login if login fails or no token is provided
 * - Redirects to home (/) after successful login
 * - Displays username if user is logged in
 *
 * Search parameters:
 * - token: access token returned from an external login process
 * - refresh: optional refresh token
 */

import { createFileRoute, useRouter, useSearch } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.ts';

export const Route = createFileRoute('/_auth/profile')({
  component: ProfileComponent,
});

function ProfileComponent() {
  const router = useRouter();
  const auth = useAuth();
  const search: { token?: string; refresh?: string } = Route.useSearch();
  console.log('Auth:', auth);

  useEffect(() => {
    const getUserInfo = async (token: string) => {
      console.log('token:', token);
      await auth.loginWithToken(token);
    };

    if (search.token && auth.status !== 'loggedIn') {
      getUserInfo(search.token);
    } else if (auth.status !== 'loggedIn' && !auth.authError) {
      router.navigate({ to: '/login' });
    }
  }, [auth.status, search.token]);

  useEffect(() => {
    if (auth.status === 'loggedIn') {
      router.navigate({ to: '/' });
    }
  }, [auth.status]);

  if (auth.status !== 'loggedIn') return null;

  return (
    <>
      <p>
        Username: <strong>{auth.username}</strong>
      </p>
    </>
  );
}
