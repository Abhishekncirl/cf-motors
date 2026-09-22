/**
 * Central business/contact configuration.
 *
 * Values marked `[CONFIRM]` are placeholders awaiting client confirmation.
 * Anything editable by the owner at runtime (opening hours, hero image, social
 * links) is ALSO stored in Firestore `site_settings` and, where present, that
 * live value overrides the static default here. These constants are the
 * build-time fallback and the source for compile-time links (tel:, wa.me).
 */

export const BUSINESS = {
  name: 'CF Motor Sales Ltd',
  tagline: 'UK & Japanese Imports',
  // Phone shown to users (with +353 country code), and the tel: link form.
  phoneDisplay: '+353 87 410 6028',
  phoneTel: '+353874106028',
  // WhatsApp deep-link number in wa.me format (no plus, no spaces).
  whatsapp: '353874106028',
  email: 'cfmotorsales123@gmail.com',
  address: {
    line1: '111 Concession Rd, Cullaville',
    line2: 'Crossmaglen, Newry',
    eircode: 'BT35 9JE', // UK postcode
    country: 'United Kingdom',
  },
  // Local SEO targeting.
  locality: {
    town: 'Crossmaglen',
    county: 'Newry',
  },
  social: {
    facebook: 'https://www.facebook.com/cfmotorsales', // [CONFIRM URL]
    tiktok: 'https://www.tiktok.com/@cfmotorsales', // [CONFIRM URL]
    instagram: '', // [client to add link later]
  },
  // Opening hours - overridden by site_settings when the owner edits them.
  openingHours: [
    { day: 'Monday', hours: '08:00 - 17:00' },
    { day: 'Tuesday', hours: '08:00 - 17:00' },
    { day: 'Wednesday', hours: '08:00 - 17:00' },
    { day: 'Thursday', hours: '08:00 - 17:00' },
    { day: 'Friday', hours: '08:00 - 17:00' },
    { day: 'Saturday', hours: 'By appointment' },
    { day: 'Sunday', hours: 'By appointment' },
  ],
  // Does the client offer finance? [CONFIRM] - controls the /finance page copy.
  offersFinance: true,
  // Canonical site URL for SEO/JSON-LD (override via VITE_SITE_URL).
  siteUrl:
    (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ||
    'https://www.cfmotorsales.ie',
} as const;

/** Build a WhatsApp deep link with a prefilled message. */
export function whatsappLink(message: string): string {
  return `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** Build a tel: link. */
export function telLink(): string {
  return `tel:${BUSINESS.phoneTel}`;
}
