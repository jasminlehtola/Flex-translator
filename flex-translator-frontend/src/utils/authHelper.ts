import { jwtDecode } from 'jwt-decode';
export const authHelpers = {
  getToken: () => localStorage.getItem('access_token'),
  getRefreshToken: () => localStorage.getItem('refresh_token'),
  isLoggedIn: () => !!localStorage.getItem('access_token'),
  logout: () => localStorage.removeItem('access_token'),
  getUserId: () => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    try {
      return jwtDecode(token).sub;
    } catch {
      return null;
    }
  },
};
