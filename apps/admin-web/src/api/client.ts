import axios from 'axios';
import { keycloak } from '../auth/keycloak';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8084',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  // The admin portal is authenticated with Keycloak. Refresh directly from the
  // source of truth so an expired or stale localStorage value cannot cause 401s.
  if (keycloak.authenticated) {
    try {
      await keycloak.updateToken(30);
    } catch (error) {
      console.warn('Unable to refresh the admin access token', error);
    }
  }

  const token = keycloak.token ?? localStorage.getItem('aegis_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    localStorage.setItem('aegis_token', token);
  }
  return config;
});

export default api;
