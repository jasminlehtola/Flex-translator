/**
 * auth.tsx
 *
 * Provides global authentication context and utilities for managing user login state.
 * Used throughout the app to determine if the user is authenticated and to access basic user info.
 *
 * Features:
 * - Stores auth status, username, and user ID in context
 * - Handles login via username (dev/demo use) (TODO!) or access token (standard flow)
 * - Automatically fetches user info on initial app load if token is present
 * - Handles logout and clears token/state
 * - Registers global auth error handlers (e.g. 401 response interception)
 *
 * Context values:
 * - status: 'loggedIn' | 'loggedOut'
 * - username: current user’s email (if logged in)
 * - user_id: current user’s numeric ID
 * - login: simple login with username (used in dev mode)
 * - loginWithToken: token-based login, fetches user data from API
 * - logout: clears user data and tokens
 * - authError: optional error message for expired or invalid sessions
 * - setAuthError: allows manually setting auth error (used in error handlers)
 *
 * Hooks:
 * - `useAuth()`: returns the current context; throws if used outside `<AuthProvider>`
 *
 * Usage:
 * Wrap the entire app in `<AuthProvider>` in `main.tsx` to enable authentication context.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchUserInfo } from '../api/userApiClient.ts';
import { registerAuthHandlers } from '../utils/authErrorHandler';

type AuthStatus = 'loggedOut' | 'loggedIn';

type AuthContextType = {
  status: AuthStatus;
  username?: string;
  user_id?: number;
  token?: string;
  authError?: string;
  loginWithToken: (token: string) => Promise<void>;
  login: (username: string) => void;
  logout: () => void;
  setAuthError: (msg: string | undefined) => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>('loggedOut');
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [user_id, setUserId] = useState<number | undefined>(undefined);
  const [authError, setAuthError] = useState<string | undefined>(undefined);

  const login = (username: string) => {
    setUsername(username);
    setStatus('loggedIn');
    setAuthError(undefined); // clears the error if needed
  };

  const loginWithToken = async (token: string) => {
    try {
      localStorage.setItem('access_token', token);
      const userInfo = await fetchUserInfo(); // fails if token is expired
      setUsername(userInfo.email);
      setUserId(Number(userInfo.user_id));
      setStatus('loggedIn');
      setAuthError(undefined); // login success --> clear the error
    } catch (err) {
      setAuthError('Your session has expired. Log in again.');
      logout(); // empties token and states
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    // localStorage.removeItem('refresh_token');
    setUsername(undefined);
    setUserId(undefined);
    setStatus('loggedOut');
  };

  useEffect(() => {
    registerAuthHandlers(setAuthError, logout);

    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      loginWithToken(storedToken).catch(() => logout());
    }
  }, []);

  return (
    <AuthContext.Provider value={{ status, username, user_id, login, loginWithToken, logout, authError, setAuthError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
