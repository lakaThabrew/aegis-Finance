import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import OverviewPage from './pages/OverviewPage';
import HeldTransfersPage from './pages/HeldTransfersPage';
import AuditLogPage from './pages/AuditLogPage';
import SOCDashboardPage from './pages/SOCDashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<OverviewPage />} />
          <Route path="/admin/held-transfers" element={<HeldTransfersPage />} />
          <Route path="/admin/soc-dashboard" element={<SOCDashboardPage />} />
          <Route path="/admin/audit" element={<AuditLogPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
