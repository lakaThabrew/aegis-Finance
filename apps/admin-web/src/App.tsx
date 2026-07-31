import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import OverviewPage from './pages/OverviewPage';
import HeldTransfersPage from './pages/HeldTransfersPage';
import AuditLogPage from './pages/AuditLogPage';
import SOCDashboardPage from './pages/SOCDashboardPage';
import CustomerManagementPage from './pages/CustomerManagementPage';
import { initializeAdminKeycloak, keycloak } from './auth/keycloak';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    initializeAdminKeycloak()
      .then((authenticated) => {
        if (!mounted) return;

        if (!authenticated || !keycloak.token) {
          setInitializationError('Admin authentication was not completed.');
          return;
        }

        localStorage.setItem('aegis_token', keycloak.token);
        keycloak.onTokenExpired = () => {
          keycloak.updateToken(30).then((refreshed) => {
            if (refreshed && keycloak.token) {
              localStorage.setItem('aegis_token', keycloak.token);
            }
          });
        };
        setIsInitialized(true);
      })
      .catch((error) => {
        if (mounted) {
          console.error('Failed to initialize admin authentication', error);
          setInitializationError('Unable to initialize admin authentication.');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (initializationError) {
    return <div className="flex min-h-screen items-center justify-center bg-[#090711] p-6 text-center text-red-300">{initializationError}</div>;
  }

  if (!isInitialized) {
    return <div className="flex min-h-screen items-center justify-center bg-[#090711] text-white">Authenticating admin portal...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<OverviewPage />} />
          <Route path="/admin/customers" element={<CustomerManagementPage />} />
          <Route path="/admin/held-transfers" element={<HeldTransfersPage />} />
          <Route path="/admin/soc-dashboard" element={<SOCDashboardPage />} />
          <Route path="/admin/audit" element={<AuditLogPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
