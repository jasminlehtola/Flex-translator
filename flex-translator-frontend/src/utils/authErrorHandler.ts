let setErrorFn: ((msg: string) => void) | null = null;
let logoutFn: (() => void) | null = null;

// Register functions that allow external parties (such as axios interceptors)
// to set an error message and log out the user.

export function registerAuthHandlers(setError: (msg: string) => void, logout: () => void) {
  setErrorFn = setError;
  logoutFn = logout;
}

export function setAuthError(message: string) {
  if (setErrorFn) setErrorFn(message);
}

export function logoutFromApp() {
  if (logoutFn) logoutFn();
}
