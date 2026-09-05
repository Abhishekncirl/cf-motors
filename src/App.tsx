import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './hooks/useSiteSettings';
import { PublicLayout } from './components/layout/PublicLayout';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { Spinner } from './components/ui/Spinner';

// Public pages
import { HomePage } from './pages/HomePage';
import { StockPage } from './pages/StockPage';
import { VehicleDetailPage } from './pages/VehicleDetailPage';
import { SellYourCarPage } from './pages/SellYourCarPage';
import { ImportServicePage } from './pages/ImportServicePage';
import { FinancePage } from './pages/FinancePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { TermsPage } from './pages/legal/TermsPage';
import { PrivacyPage } from './pages/legal/PrivacyPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin (code-split - keeps it out of the public bundle)
const AdminApp = lazy(() => import('./pages/admin/AdminApp'));

export default function App() {
  return (
    <SettingsProvider>
      <ScrollToTop />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="stock" element={<StockPage />} />
            <Route path="stock/:slug" element={<VehicleDetailPage />} />
            <Route path="sell-your-car" element={<SellYourCarPage />} />
            <Route path="import-service" element={<ImportServicePage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route
            path="admin/*"
            element={
              <Suspense fallback={<Spinner label="Loading admin" />}>
                <AdminApp />
              </Suspense>
            }
          />
        </Routes>
    </SettingsProvider>
  );
}
