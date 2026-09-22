#!/usr/bin/env node
/**
 * Update ONLY the live site_settings (phone, email, socials, address, opening
 * hours) in Firestore - without touching your vehicles. Run this once to push
 * the confirmed contact details to the live site.
 *
 * Usage (from the project folder, with scripts/serviceAccount.json in place):
 *   node scripts/update-settings.mjs
 *
 * Alternatively, edit the same fields in the site's Admin -> Settings screen.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const here = dirname(fileURLToPath(import.meta.url));

const SETTINGS = {
  phoneDisplay: '+353 87 410 6028',
  phoneTel: '+353874106028',
  whatsapp: '353874106028',
  email: 'cfmotorsales123@gmail.com',
  facebookUrl: 'https://www.facebook.com/cfmotorsales', // update if needed
  tiktokUrl: 'https://www.tiktok.com/@cfmotorsales', // update if needed
  instagramUrl: '', // add the Instagram link when ready
  addressLine1: '111 Concession Rd, Cullaville',
  addressLine2: 'Crossmaglen, Newry',
  eircode: 'BT35 9JE',
  openingHours: [
    { day: 'Monday', hours: '08:00 - 17:00' },
    { day: 'Tuesday', hours: '08:00 - 17:00' },
    { day: 'Wednesday', hours: '08:00 - 17:00' },
    { day: 'Thursday', hours: '08:00 - 17:00' },
    { day: 'Friday', hours: '08:00 - 17:00' },
    { day: 'Saturday', hours: 'By appointment' },
    { day: 'Sunday', hours: 'By appointment' },
  ],
  updatedAt: Date.now(),
};

async function main() {
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(await readFile(join(here, 'serviceAccount.json'), 'utf8'));
  } catch {
    console.error('\n✖ Could not read scripts/serviceAccount.json. Download it from the Firebase console first.\n');
    process.exit(1);
  }
  initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore();
  // merge:true keeps heroImageUrl and any other stored fields intact.
  await db.collection('site_settings').doc('main').set(SETTINGS, { merge: true });
  console.log('✓ Live site settings updated (phone, email, socials, address, opening hours).');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
