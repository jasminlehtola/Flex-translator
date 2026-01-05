import { AuthContext } from '../utils/auth.tsx';
import { useContext } from 'react';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('');
  return context;
};
