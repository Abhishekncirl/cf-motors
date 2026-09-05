import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getSiteSettings, defaultSettings } from '../lib/settings';
import type { SiteSettings } from '../lib/types';

const SettingsContext = createContext<SiteSettings>(defaultSettings());

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings());

  useEffect(() => {
    let active = true;
    getSiteSettings()
      .then((s) => {
        if (active) setSettings(s);
      })
      .catch(() => {
        /* keep defaults */
      });
    return () => {
      active = false;
    };
  }, []);

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export function useSiteSettings(): SiteSettings {
  return useContext(SettingsContext);
}
