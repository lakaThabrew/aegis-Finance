import { createContext } from 'react';

export interface AuthContextType {
  token: string | null;
  customerId: string | null;
  login: () => void;
  logout: () => void;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);
