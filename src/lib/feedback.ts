import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore/lite';
import { requireDb } from './firebase';
import type { Feedback } from './types';

export const FEEDBACK = 'feedback';

export interface FeedbackInput {
  author: string;
  rating: number; // 1-5
  message: string;
  subject?: string;
}

function toFeedback(id: string, d: DocumentData): Feedback {
  return {
    id,
    author: d.author ?? '',
    rating: typeof d.rating === 'number' ? d.rating : 0,
    message: d.message ?? '',
    subject: d.subject || undefined,
    approved: Boolean(d.approved),
    createdAt:
      typeof d.createdAt === 'number' ? d.createdAt : d.createdAt?.toMillis?.() ?? Date.now(),
  };
}

const byNewest = (a: Feedback, b: Feedback) => b.createdAt - a.createdAt;

// --- Public read cache (stale-while-revalidate, same idea as parts/vehicles) ---
const CACHE_TTL = 60_000;
const SESSION_KEY = 'cf-approved-feedback';
let cache: { at: number; items: Feedback[] } | null = null;
let inflight: Promise<Feedback[]> | null = null;

async function fetchApproved(): Promise<Feedback[]> {
  const db = requireDb();
  // Single equality filter only (no orderBy) so no composite index is needed;
  // we sort by date in memory.
  const snap = await getDocs(query(collection(db, FEEDBACK), where('approved', '==', true)));
  const items = snap.docs.map((d) => toFeedback(d.id, d.data())).sort(byNewest);
  cache = { at: Date.now(), items };
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(cache));
  } catch {
    /* ignore */
  }
  return items;
}

function readSession(): { at: number; items: Feedback[] } | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && Array.isArray(parsed.items) ? parsed : null;
  } catch {
    return null;
  }
}

/** Public: approved reviews only, newest first. Served from cache where fresh. */
export async function listApprovedFeedback(): Promise<Feedback[]> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_TTL) return cache.items;
  if (!cache) {
    const sess = readSession();
    if (sess) {
      cache = sess;
      if (now - sess.at >= CACHE_TTL && !inflight) {
        inflight = fetchApproved().finally(() => (inflight = null));
      }
      return sess.items;
    }
  }
  if (!inflight) inflight = fetchApproved().finally(() => (inflight = null));
  return inflight;
}

export function invalidateFeedbackCache(): void {
  cache = null;
  inflight = null;
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Submit a new customer review. Stored hidden (`approved: false`) until an admin
 * approves it. We clamp the rating and trim text client-side; the Firestore
 * rules enforce the same shape server-side.
 */
export async function submitFeedback(input: FeedbackInput): Promise<string> {
  const db = requireDb();
  const rating = Math.min(5, Math.max(1, Math.round(input.rating)));
  const ref = await addDoc(collection(db, FEEDBACK), {
    author: input.author.trim().slice(0, 100),
    rating,
    message: input.message.trim().slice(0, 3000),
    subject: (input.subject ?? '').trim().slice(0, 200),
    approved: false,
    createdAt: Date.now(),
    _serverCreatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Admin: every review regardless of approval, newest first. */
export async function listAllFeedback(): Promise<Feedback[]> {
  const db = requireDb();
  const snap = await getDocs(query(collection(db, FEEDBACK), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => toFeedback(d.id, d.data()));
}

/** Admin: approve (publish) or un-approve (hide) a review. */
export async function setFeedbackApproval(id: string, approved: boolean): Promise<void> {
  const db = requireDb();
  await updateDoc(doc(db, FEEDBACK, id), { approved });
  invalidateFeedbackCache();
}

/** Admin: permanently delete a review. */
export async function deleteFeedback(id: string): Promise<void> {
  const db = requireDb();
  await deleteDoc(doc(db, FEEDBACK, id));
  invalidateFeedbackCache();
}
