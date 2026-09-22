#!/usr/bin/env node
/**
 * Seed script for CF Motor Sales.
 *
 * Populates Firestore with ~10 sample vehicles and a default site_settings
 * document so the site is demonstrable before real stock is added.
 *
 * Usage:
 *   1. In the Firebase console: Project settings > Service accounts >
 *      "Generate new private key". Save the JSON as `serviceAccount.json` in
 *      this folder (it is git-ignored).
 *   2. From the project root: `npm run seed`
 *
 * Re-running is safe: vehicles are keyed by stockRef so they upsert rather than
 * duplicate. Sample cars have no images - add photos via the admin panel.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const here = dirname(fileURLToPath(import.meta.url));

async function main() {
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(await readFile(join(here, 'serviceAccount.json'), 'utf8'));
  } catch {
    console.error(
      '\n✖ Could not read scripts/serviceAccount.json.\n' +
        '  Download a service account key from the Firebase console and save it there.\n'
    );
    process.exit(1);
  }

  initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore();

  const vehicles = JSON.parse(await readFile(join(here, 'seed-data.json'), 'utf8'));
  const now = Date.now();

  const batch = db.batch();
  vehicles.forEach((v, i) => {
    // Deterministic doc id from stockRef so re-seeding upserts.
    const id = (v.stockRef || `seed-${i}`).toLowerCase();
    const slug = `${v.year}-${v.make}-${v.model}-${v.variant || ''}-${v.stockRef}`
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    batch.set(db.collection('vehicles').doc(id), {
      ...v,
      variant: v.variant || '',
      weeklyPrice: v.weeklyPrice ?? null,
      nctExpiry: v.nctExpiry ?? null,
      slug,
      images: [],
      createdAt: now - i * 60000,
      updatedAt: now - i * 60000,
    });
  });

  batch.set(
    db.collection('site_settings').doc('main'),
    {
      phoneDisplay: '+353 87 410 6028',
      phoneTel: '+353874106028',
      whatsapp: '353874106028',
      email: 'cfmotorsales123@gmail.com',
      facebookUrl: 'https://www.facebook.com/cfmotorsales',
      tiktokUrl: 'https://www.tiktok.com/@cfmotorsales',
      instagramUrl: '',
      addressLine1: '111 Concession Rd, Cullaville',
      addressLine2: 'Crossmaglen, Newry',
      eircode: 'BT35 9JE',
      heroImageUrl: '',
      openingHours: [
        { day: 'Monday', hours: '08:00 - 17:00' },
        { day: 'Tuesday', hours: '08:00 - 17:00' },
        { day: 'Wednesday', hours: '08:00 - 17:00' },
        { day: 'Thursday', hours: '08:00 - 17:00' },
        { day: 'Friday', hours: '08:00 - 17:00' },
        { day: 'Saturday', hours: 'By appointment' },
        { day: 'Sunday', hours: 'By appointment' },
      ],
      updatedAt: now,
    },
    { merge: true }
  );

  await batch.commit();
  console.log(`✓ Seeded ${vehicles.length} vehicles and site settings.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
