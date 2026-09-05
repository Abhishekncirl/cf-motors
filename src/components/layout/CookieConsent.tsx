import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'cf-cookie-consent';

/**
 * GDPR cookie consent banner. No analytics or non-essential cookies fire until
 * the visitor accepts. `getAnalyticsConsent()` is the single gate other code
 * should check before initialising analytics.
 */
export function getAnalyticsConsent(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'accepted';
  } catch {
    return false;
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const decide = (value: 'accepted' | 'declined') => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
    setVisible(false);
    if (value === 'accepted') {
      // Hook analytics initialisation here (e.g. window.dispatchEvent(...)).
      window.dispatchEvent(new CustomEvent('cf-analytics-consent'));
    }
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/10 bg-brand-grey/98 backdrop-blur"
    >
      <div className="container-page flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-brand-white/80">
          We use essential cookies to run this site and, with your consent,
          analytics to improve it. See our{' '}
          <Link to="/privacy" className="text-brand-cyan underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <button type="button" className="btn-outline" onClick={() => decide('declined')}>
            Essential only
          </button>
          <button type="button" className="btn-primary" onClick={() => decide('accepted')}>
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
