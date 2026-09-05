import { doc, getDoc, setDoc } from 'firebase/firestore/lite';
import { db } from './firebase';
import type { SiteSettings } from './types';
import { BUSINESS } from '../config/business';

export const SETTINGS_DOC = 'site_settings/main';

/** Build-time defaults, overridden by the Firestore single-row settings doc. */
export function defaultSettings(): SiteSettings {
  return {
    phoneDisplay: BUSINESS.phoneDisplay,
    phoneTel: BUSINESS.phoneTel,
    whatsapp: BUSINESS.whatsapp,
    email: BUSINESS.email,
    facebookUrl: BUSINESS.social.facebook,
    tiktokUrl: BUSINESS.social.tiktok,
    addressLine1: BUSINESS.address.line1,
    addressLine2: BUSINESS.address.line2,
    eircode: BUSINESS.address.eircode,
    openingHours: [...BUSINESS.openingHours],
    heroImageUrl: '',
    updatedAt: 0,
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!db) return defaultSettings();
  try {
    const snap = await getDoc(doc(db, 'site_settings', 'main'));
    if (!snap.exists()) return defaultSettings();
    return { ...defaultSettings(), ...(snap.data() as Partial<SiteSettings>) };
  } catch {
    return defaultSettings();
  }
}

export async function saveSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  if (!db) throw new Error('Firestore not configured.');
  await setDoc(
    doc(db, 'site_settings', 'main'),
    { ...settings, updatedAt: Date.now() },
    { merge: true }
  );
}
