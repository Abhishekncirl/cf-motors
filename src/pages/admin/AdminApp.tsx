import { Routes, Route } from 'react-router-dom';
import { Seo } from '../../lib/seo';
import { AuthProvider } from '../../hooks/useAuth';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminLayout } from './AdminLayout';
import { LoginPage } from './LoginPage';
import { DashboardPage } from './DashboardPage';
import { VehicleListPage } from './VehicleListPage';
import { VehicleEditPage } from './VehicleEditPage';
import { EnquiriesPage } from './EnquiriesPage';
import { SettingsPage } from './SettingsPage';

/** Admin sub-application (code-split from the public bundle). */
export default function AdminApp() {
  return (
    <AuthProvider>
      <Seo title="Admin" description="CF Motor Sales admin." noindex />
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="vehicles" element={<VehicleListPage />} />
          <Route path="vehicles/new" element={<VehicleEditPage mode="create" />} />
          <Route path="vehicles/:id" element={<VehicleEditPage mode="edit" />} />
          <Route path="enquiries" element={<EnquiriesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
