import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingWhatsApp } from './FloatingWhatsApp';
import { CookieConsent } from './CookieConsent';
import { JsonLd, autoDealerJsonLd } from '../../lib/seo';

/** Shell for all public-facing pages. */
export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd id="autodealer" data={autoDealerJsonLd()} />
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <CookieConsent />
    </div>
  );
}
