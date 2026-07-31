import axios from 'axios';
import { keycloak } from '../auth/keycloak';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8084',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  // Keycloak is the source of truth. A persisted token can be expired after a
  // reload, so refresh the active session before every protected API request.
  if (!keycloak.authenticated) {
    localStorage.removeItem('aegis_token');
    delete config.headers.Authorization;
    return config;
  }

  try {
    await keycloak.updateToken(30);
  } catch (error) {
    console.warn('Unable to refresh customer access token', error);
  }

  const token = keycloak.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    localStorage.setItem('aegis_token', token);
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

export default api;
