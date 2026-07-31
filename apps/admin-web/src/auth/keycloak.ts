import Keycloak from 'keycloak-js';

export const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'aegis',
  clientId: 'aegis-frontend',
});

// React Strict Mode mounts effects twice in development. Reuse the same
// initialization promise because a Keycloak instance can only initialize once.
let initialization: Promise<boolean> | null = null;

export function initializeAdminKeycloak() {
  if (!initialization) {
    initialization = keycloak.init({
      onLoad: 'login-required',
      checkLoginIframe: false,
    });
  }
  return initialization;
}
