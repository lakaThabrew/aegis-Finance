import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  token: string | null;
  customerId: string | null;
  login: (token: string, customerId: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('aegis_token'));
  const [customerId, setCustomerId] = useState<string | null>(localStorage.getItem('aegis_customer_id'));

  const login = (newToken: string, id: string) => {
    setToken(newToken);
    setCustomerId(id);
    localStorage.setItem('aegis_token', newToken);
    localStorage.setItem('aegis_customer_id', id);
  };

  const logout = () => {
    setToken(null);
    setCustomerId(null);
    localStorage.removeItem('aegis_token');
    localStorage.removeItem('aegis_customer_id');
  };

  return (
    <AuthContext.Provider value={{ token, customerId, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
