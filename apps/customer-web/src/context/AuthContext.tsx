import React, { useState, useEffect } from 'react';
import { AuthContext } from './auth-context';
import { initializeCustomerKeycloak, keycloak } from '../auth/keycloak';
import api from '../api/client';
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    initializeCustomerKeycloak()
      .then((authenticated) => {
        if (!mounted) return;

        setIsAuthenticated(authenticated);
        if (authenticated) {
          setToken(keycloak.token || null);
          const cid = (keycloak.tokenParsed as any)?.customerId?.[0] || 'customer-001';
          setCustomerId(cid);
          localStorage.setItem('aegis_token', keycloak.token || '');
          void Promise.all([
            api.post('/api/v1/core/security/events/login'),
            api.post('/api/v1/core/security/devices/current'),
          ]).catch((error) => {
            console.error('Failed to record login audit event', error);
          });
          
          // Set up token refresh
          keycloak.onTokenExpired = () => {
            keycloak.updateToken(30).then(() => {
              if (keycloak.token) {
                setToken(keycloak.token || null);
                localStorage.setItem('aegis_token', keycloak.token || '');
              }
            }).catch((error) => {
              console.error('Unable to refresh Keycloak token', error);
              localStorage.removeItem('aegis_token');
              setToken(null);
              setIsAuthenticated(false);
            });
          };
        } else {
          // Do not let an expired token from an earlier session reach the API.
          setToken(null);
          setCustomerId(null);
          localStorage.removeItem('aegis_token');
        }
        setIsInitialized(true);
      })
      .catch((error) => {
        if (mounted) {
          console.error('Failed to initialize Keycloak', error);
          setIsInitialized(true);
        }
      });

    return () => {
      mounted = false;
    };
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
