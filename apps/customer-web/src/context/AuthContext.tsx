import React, { createContext, useContext, useState, useEffect } from 'react';
import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: 'http://localhost:8080',
  realm: 'aegis',
  clientId: 'aegis-frontend'
};

const keycloak = new Keycloak(keycloakConfig);

interface AuthContextType {
  token: string | null;
  customerId: string | null;
  login: () => void;
  logout: () => void;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);

  useEffect(() => {
    keycloak.init({ onLoad: 'check-sso' })
      .then((authenticated) => {
        setIsAuthenticated(authenticated);
        if (authenticated) {
          setToken(keycloak.token || null);
          const cid = (keycloak.tokenParsed as any)?.customerId?.[0] || 'customer-001';
          setCustomerId(cid);
          localStorage.setItem('aegis_token', keycloak.token || '');
          
          // Set up token refresh
          keycloak.onTokenExpired = () => {
            keycloak.updateToken(30).then(refreshed => {
              if (refreshed) {
                setToken(keycloak.token || null);
                localStorage.setItem('aegis_token', keycloak.token || '');
              }
            });
          };
        }
        setIsInitialized(true);
      })
      .catch(console.error);
  }, []);

  const login = () => {
    keycloak.login();
  };

  const logout = () => {
    localStorage.removeItem('aegis_token');
    keycloak.logout();
  };

  return (
    <AuthContext.Provider value={{ token, customerId, login, logout, isAuthenticated, isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
