/**
 * Route: /login.tsx
 *
 * Login page route for Flex Translator.
 * Provides a GitLab OAuth login option and a simple username input for local/testing purposes.
 *
 * Features:
 * - Uses the `useAuth` hook to handle authentication status and login/logout logic
 * - If already logged in:
 *   - Displays the logged-in user's name
 *   - Provides a logout button
 * - If not logged in:
 *   - Offers a button to log in via GitLab (redirects to backend auth endpoint)
 *   - Displays a simple login form for username input (for development/testing)
 * - Supports redirecting the user to their intended page after login
 *   via the `?redirect=` search parameter
 */

import React, { useState } from 'react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import Button from '../components/general/Button';
import { useAuth } from '../hooks/useAuth.ts';

export const Route = createFileRoute('/login')({
  component: LoginComponent,
});

function LoginComponent() {
  const router = useRouter();
  /*const { auth, status } = Route.useRouteContext({
    select: ({ auth }) => ({ auth, status: auth.status }),
  });
 */
  const auth = useAuth();
  const status = auth.status;
  const search: { redirect?: string } = Route.useSearch();
  const [username, setUsername] = useState('');

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    auth.login(username);
    router.invalidate();
  };

  React.useLayoutEffect(() => {
    if (status == 'loggedIn' && search.redirect) {
      router.history.push(search.redirect);
    }
  }, [status, search.redirect, router.history]);

  return status === 'loggedIn' ? (
    <>
      <div className="ml-10 mt-6">
        <p className="mb-6">
          Logged in as <strong>{auth.username}</strong>
        </p>
        <div>
          <Button
            onClick={() => {
              auth.logout();
              router.invalidate();
            }}
          >
            Log out
          </Button>
        </div>
      </div>
    </>
  ) : (
    <>
      <div className="ml-10 mt-6">
        <p className="mb-6">Log in to use the app!</p>
        <div>
          <Button
            onClick={() => {
              window.location.href = 'http://localhost:5000/auth/login';
            }}
          >
            Log in with Gitlab
          </Button>
        </div>
      </div>
    </>
  );
}
