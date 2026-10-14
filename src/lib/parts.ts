import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as fbLimit,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore/lite';
import { requireDb } from './firebase';
import { deleteVehicleImage } from './storage';
import type { Part, PartStatus } from './types';

export const PARTS = 'parts';

export interface PartFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  condition?: string;
  status?: PartStatus | 'all';
  search?: string;
}

export type PartSort = 'newest' | 'price-asc' | 'price-desc' | 'name-asc';

const SORT_FIELD: Record<PartSort, { field: keyof Part; dir: 'asc' | 'desc' }> = {
  newest: { field: 'createdAt', dir: 'desc' },
  'price-asc': { field: 'price', dir: 'asc' },
  'price-desc': { field: 'price', dir: 'desc' },
  'name-asc': { field: 'name', dir: 'asc' },
};

function toPart(id: string, d: DocumentData): Part {
  return {
    id,
    slug: d.slug ?? id,
    name: d.name ?? '',
    category: d.category ?? 'Other',
    brand: d.brand ?? '',
    price: d.price ?? 0,
    sku: d.sku ?? '',
    condition: d.condition === 'Used' ? 'Used' : 'New',
    stockQty: typeof d.stockQty === 'number' ? d.stockQty : 0,
    description: d.description ?? '',
    status: d.status ?? 'available',
    featured: Boolean(d.featured),
    images: Array.isArray(d.images) ? [...d.images].sort((a, b) => a.sortOrder - b.sortOrder) : [],
    createdAt: typeof d.createdAt === 'number' ? d.createdAt : d.createdAt?.toMillis?.() ?? Date.now(),
    updatedAt: typeof d.updatedAt === 'number' ? d.updatedAt : d.updatedAt?.toMillis?.() ?? Date.now(),
  };
}

export interface PartQueryResult {
  items: Part[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Availability cache (same pattern as vehicles - small catalogue, filter in memory).
const CACHE_TTL = 60_000;
const SESSION_KEY = 'cf-available-parts';
let availCache: { at: number; items: Part[] } | null = null;
let inflight: Promise<Part[]> | null = null;

async function fetchAvailable(): Promise<Part[]> {
  const db = requireDb();
  // Single equality filter only (no orderBy) so no composite index is needed;
  // ordering is applied in memory by sortParts.
  const snap = await getDocs(
    query(collection(db, PARTS), where('status', '==', 'available'))
  );
  const items = snap.docs.map((d) => toPart(d.id, d.data()));
  availCache = { at: Date.now(), items };
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(availCache)); } catch { /* ignore */ }
  return items;
}

function readSession(): { at: number; items: Part[] } | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && Array.isArray(parsed.items) ? parsed : null;
  } catch { return null; }
}

async function getAvailable(): Promise<Part[]> {
  const now = Date.now();
  if (availCache && now - availCache.at < CACHE_TTL) return availCache.items;
  if (!availCache) {
    const sess = readSession();
    if (sess) {
      availCache = sess;
      if (now - sess.at >= CACHE_TTL && !inflight) inflight = fetchAvailable().finally(() => (inflight = null));
      return sess.items;
    }
  }
  if (!inflight) inflight = fetchAvailable().finally(() => (inflight = null));
  return inflight;
}

export function invalidatePartCache(): void {
  availCache = null;
  inflight = null;
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
}

function sortParts(items: Part[], sort: PartSort): Part[] {
  const { field, dir } = SORT_FIELD[sort];
  const mul = dir === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    const av = a[field] as number | string;
    const bv = b[field] as number | string;
    return (av < bv ? -1 : av > bv ? 1 : 0) * mul;
  });
}

function matches(p: Part, f: PartFilters): boolean {
  if (f.category && p.category !== f.category) return false;
  if (f.condition && p.condition !== f.condition) return false;
  if (f.priceMin && p.price < f.priceMin) return false;
  if (f.priceMax && p.price > f.priceMax) return false;
  if (f.search) {
    const hay = `${p.name} ${p.brand} ${p.category} ${p.sku}`.toLowerCase();
    if (!hay.includes(f.search.toLowerCase())) return false;
  }
  return true;
}

export async function queryParts(
  filters: PartFilters = {},
  sort: PartSort = 'newest',
  page = 1,
  pageSize = 12
): Promise<PartQueryResult> {
  const status = filters.status ?? 'available';
  let base: Part[];
  if (status === 'available') {
    base = await getAvailable();
  } else {
    const db = requireDb();
    // Equality filter only; ordering handled by sortParts (no composite index).
    const base0 = status === 'all'
      ? await getDocs(query(collection(db, PARTS)))
      : await getDocs(query(collection(db, PARTS), where('status', '==', status)));
    base = base0.docs.map((d) => toPart(d.id, d.data()));
  }
  let items = sortParts(base, sort).filter((p) => matches(p, filters));
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(Math.max(1, page), totalPages);
  const start = (clampedPage - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total, page: clampedPage, pageSize, totalPages };
}

export async function getPartById(id: string): Promise<Part | null> {
  const db = requireDb();
  const snap = await getDoc(doc(db, PARTS, id));
  return snap.exists() ? toPart(snap.id, snap.data()) : null;
}

/** Look up an available part by its slug (served from cache where possible). */
export async function getPartBySlug(slug: string): Promise<Part | null> {
  const cached = availCache?.items.find((p) => p.slug === slug);
  if (cached) return cached;
  const items = await getAvailable();
  const found = items.find((p) => p.slug === slug);
  if (found) return found;
  // Fallback: direct query (e.g. cache empty).
  const db = requireDb();
  const snap = await getDocs(query(collection(db, PARTS), where('slug', '==', slug), fbLimit(1)));
  if (snap.empty) return null;
  return toPart(snap.docs[0].id, snap.docs[0].data());
}

/** Related = same category, available, excluding the current part. */
export async function getRelatedParts(part: Part, max = 4): Promise<Part[]> {
  const all = (await getAvailable()).filter((p) => p.id !== part.id);
  const sameCat = all.filter((p) => p.category === part.category);
  const rest = all.filter((p) => p.category !== part.category);
  return [...sameCat, ...rest].slice(0, max);
}

/** Admin: list every part regardless of status. */
export async function listAllParts(): Promise<Part[]> {
  const db = requireDb();
  const snap = await getDocs(query(collection(db, PARTS), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => toPart(d.id, d.data()));
}

export type PartInput = Omit<Part, 'id' | 'createdAt' | 'updatedAt'>;

export async function createPart(input: PartInput): Promise<string> {
  const db = requireDb();
  const ref = await addDoc(collection(db, PARTS), {
    ...input, createdAt: Date.now(), updatedAt: Date.now(), _serverUpdatedAt: serverTimestamp(),
  });
  invalidatePartCache();
  return ref.id;
}

export async function createPartWithId(id: string, input: PartInput): Promise<void> {
  const db = requireDb();
  await setDoc(doc(db, PARTS, id), {
    ...input, createdAt: Date.now(), updatedAt: Date.now(), _serverUpdatedAt: serverTimestamp(),
  });
  invalidatePartCache();
}

export async function updatePart(id: string, patch: Partial<PartInput>): Promise<void> {
  const db = requireDb();
  await updateDoc(doc(db, PARTS, id), { ...patch, updatedAt: Date.now(), _serverUpdatedAt: serverTimestamp() });
  invalidatePartCache();
}

/** Permanently delete a part and all its Storage images (frees the space). */
export async function hardDeletePart(part: Part): Promise<void> {
  const db = requireDb();
  await Promise.all(
    part.images.map((img) => (img.storagePath ? deleteVehicleImage(img.storagePath) : Promise.resolve()))
  );
  await deleteDoc(doc(db, PARTS, part.id));
  invalidatePartCache();
}
