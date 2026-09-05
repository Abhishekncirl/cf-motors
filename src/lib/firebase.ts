import { initializeApp, type FirebaseApp } from 'firebase/app';
// Firestore *Lite* - one-shot reads/writes only, no realtime listeners or
// offline cache. Much smaller than the full SDK, which keeps the public bundle
// lean for our Lighthouse target. All our data access is get/query/set/update.
import { getFirestore, type Firestore } from 'firebase/firestore/lite';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

/**
 * Firebase configuration is read from Vite env vars (see .env.example).
 * Never hardcode secrets - the anon web config is public by design, but keeping
 * it in .env keeps the repo portable between the dev and production projects.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

let app: FirebaseApp | undefined;
let dbInstance: Firestore | undefined;
let authInstance: Auth | undefined;
let storageInstance: FirebaseStorage | undefined;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  dbInstance = getFirestore(app);
  authInstance = getAuth(app);
  storageInstance = getStorage(app);
} else if (import.meta.env.DEV) {
  // Helpful nudge in local dev when .env is missing.
  // eslint-disable-next-line no-console
  console.warn(
    '[CF Motor Sales] Firebase is not configured. Copy .env.example to .env ' +
      'and fill in your Firebase project values. Live data features are disabled.'
  );
}

export const firebaseApp = app;
export const db = dbInstance;
export const auth = authInstance;
export const storage = storageInstance;

/** Throws a clear error if a Firebase service is used before configuration. */
export function requireDb(): Firestore {
  if (!dbInstance) throw new Error('Firestore is not configured. Set up your .env file.');
  return dbInstance;
}
export function requireAuth(): Auth {
  if (!authInstance) throw new Error('Firebase Auth is not configured. Set up your .env file.');
  return authInstance;
}
export function requireStorage(): FirebaseStorage {
  if (!storageInstance) throw new Error('Firebase Storage is not configured. Set up your .env file.');
  return storageInstance;
}
