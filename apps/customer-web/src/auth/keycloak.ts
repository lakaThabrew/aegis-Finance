import Keycloak from 'keycloak-js';

export const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'aegis',
  clientId: 'aegis-frontend',
});

// React Strict Mode mounts effects twice in development. Reuse the same
// initialization promise because a Keycloak client can only initialize once.
let initialization: Promise<boolean> | null = null;

export function initializeCustomerKeycloak() {
  if (!initialization) {
    initialization = keycloak.init({
      onLoad: 'check-sso',
      // Avoid third-party iframe checks, which can time out when browsers
      // block third-party storage. Token refresh still works after login.
      checkLoginIframe: false,
    });
  }
  return initialization;
}
