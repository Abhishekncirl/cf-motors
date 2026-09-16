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
  type QueryConstraint,
  type DocumentData,
} from 'firebase/firestore/lite';
import { requireDb } from './firebase';
import { deleteVehicleImage } from './storage';
import type {
  Vehicle,
  VehicleStatus,
  FuelType,
  Transmission,
  BodyType,
  ImportOrigin,
} from './types';

export const VEHICLES = 'vehicles';

/** Filters used by the public stock listing and admin. */
export interface VehicleFilters {
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  fuelType?: FuelType;
  transmission?: Transmission;
  bodyType?: BodyType;
  mileageMax?: number;
  importOrigin?: ImportOrigin;
  status?: VehicleStatus | 'all';
  featured?: boolean;
  search?: string;
}

export type VehicleSort =
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'mileage-asc'
  | 'year-desc';

const SORT_FIELD: Record<VehicleSort, { field: string; dir: 'asc' | 'desc' }> = {
  newest: { field: 'createdAt', dir: 'desc' },
  'price-asc': { field: 'price', dir: 'asc' },
  'price-desc': { field: 'price', dir: 'desc' },
  'mileage-asc': { field: 'mileageKm', dir: 'asc' },
  'year-desc': { field: 'year', dir: 'desc' },
};

function toVehicle(id: string, d: DocumentData): Vehicle {
  return {
    id,
    slug: d.slug,
    make: d.make,
    model: d.model,
    variant: d.variant ?? '',
    year: d.year,
    price: d.price,
    weeklyPrice: d.weeklyPrice ?? null,
    mileageKm: d.mileageKm,
    fuelType: d.fuelType,
    transmission: d.transmission,
    engineSize: d.engineSize ?? '',
    bodyType: d.bodyType,
    doors: d.doors ?? 5,
    seats: d.seats ?? 5,
    colour: d.colour ?? '',
    previousOwners: d.previousOwners ?? 0,
    nctExpiry: d.nctExpiry ?? null,
    taxBand: d.taxBand ?? '',
    importOrigin: d.importOrigin,
    stockRef: d.stockRef ?? '',
    description: d.description ?? '',
    status: d.status,
    featured: Boolean(d.featured),
    images: Array.isArray(d.images) ? [...d.images].sort((a, b) => a.sortOrder - b.sortOrder) : [],
    createdAt: typeof d.createdAt === 'number' ? d.createdAt : d.createdAt?.toMillis?.() ?? Date.now(),
    updatedAt: typeof d.updatedAt === 'number' ? d.updatedAt : d.updatedAt?.toMillis?.() ?? Date.now(),
  };
}

export interface VehicleQueryResult {
  items: Vehicle[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Availability cache (performance)
 * --------------------------------
 * A single dealership's live stock is small, so instead of hitting Firestore on
 * every page / filter / sort change we fetch all `status = available` vehicles
 * ONCE and serve filtering, sorting and pagination from memory. This cache is
 * shared across the home, stock and detail pages, so navigating between them is
 * instant. A short TTL keeps it fresh, admin writes invalidate it immediately,
 * and a sessionStorage copy gives instant first paint on repeat visits within a
 * session (stale-while-revalidate). Filtering server-side isn't possible anyway:
 * Firestore forbids range filters on multiple fields, and the UI exposes several
 * ranges (year, price, mileage) at once. For a much larger inventory you'd feed
 * a dedicated search index - these call sites wouldn't change.
 */
const CACHE_TTL = 60_000; // 1 minute
const SESSION_KEY = 'cf-available-vehicles';
let availCache: { at: number; items: Vehicle[] } | null = null;
let inflight: Promise<Vehicle[]> | null = null;

async function fetchAvailable(): Promise<Vehicle[]> {
  const db = requireDb();
  const snap = await getDocs(
    query(collection(db, VEHICLES), where('status', '==', 'available'), orderBy('createdAt', 'desc'))
  );
  const items = snap.docs.map((d) => toVehicle(d.id, d.data()));
  availCache = { at: Date.now(), items };
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(availCache));
  } catch {
    /* storage unavailable - fine, memory cache still works */
  }
  return items;
}

function readSession(): { at: number; items: Vehicle[] } | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && Array.isArray(parsed.items) ? parsed : null;
  } catch {
    return null;
  }
}

/** Available vehicles, served from cache where possible (see note above). */
async function getAvailable(): Promise<Vehicle[]> {
  const now = Date.now();
  if (availCache && now - availCache.at < CACHE_TTL) return availCache.items;

  // First call this page-load: paint instantly from sessionStorage, refresh in bg.
  if (!availCache) {
    const sess = readSession();
    if (sess) {
      availCache = sess;
      if (now - sess.at >= CACHE_TTL && !inflight) {
        inflight = fetchAvailable().finally(() => (inflight = null));
      }
      return sess.items;
    }
  }

  if (!inflight) inflight = fetchAvailable().finally(() => (inflight = null));
  return inflight;
}

/** Drop the cache so the next read re-fetches (called after admin writes). */
export function invalidateVehicleCache(): void {
  availCache = null;
  inflight = null;
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

function sortVehicles(items: Vehicle[], sort: VehicleSort): Vehicle[] {
  const { field, dir } = SORT_FIELD[sort];
  const mul = dir === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    const av = a[field as keyof Vehicle] as number;
    const bv = b[field as keyof Vehicle] as number;
    return (av < bv ? -1 : av > bv ? 1 : 0) * mul;
  });
}

export async function queryVehicles(
  filters: VehicleFilters = {},
  sort: VehicleSort = 'newest',
  page = 1,
  pageSize = 12
): Promise<VehicleQueryResult> {
  const status = filters.status ?? 'available';

  let base: Vehicle[];
  if (status === 'available') {
    base = await getAvailable(); // cached
  } else {
    // Non-public status (rare) - query directly, uncached.
    const db = requireDb();
    const constraints: QueryConstraint[] = [];
    if (status !== 'all') constraints.push(where('status', '==', status));
    constraints.push(orderBy('createdAt', 'desc'));
    const snap = await getDocs(query(collection(db, VEHICLES), ...constraints));
    base = snap.docs.map((d) => toVehicle(d.id, d.data()));
  }

  let items = sortVehicles(base, sort);
  if (filters.featured) items = items.filter((v) => v.featured);
  items = items.filter((v) => matchesFilters(v, filters));

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(Math.max(1, page), totalPages);
  const start = (clampedPage - 1) * pageSize;
  const paged = items.slice(start, start + pageSize);

  return { items: paged, total, page: clampedPage, pageSize, totalPages };
}

function matchesFilters(v: Vehicle, f: VehicleFilters): boolean {
  if (f.make && v.make.toLowerCase() !== f.make.toLowerCase()) return false;
  if (f.model && !v.model.toLowerCase().includes(f.model.toLowerCase())) return false;
  if (f.yearMin && v.year < f.yearMin) return false;
  if (f.yearMax && v.year > f.yearMax) return false;
  if (f.priceMin && v.price < f.priceMin) return false;
  if (f.priceMax && v.price > f.priceMax) return false;
  if (f.fuelType && v.fuelType !== f.fuelType) return false;
  if (f.transmission && v.transmission !== f.transmission) return false;
  if (f.bodyType && v.bodyType !== f.bodyType) return false;
  if (f.mileageMax && v.mileageKm > f.mileageMax) return false;
  if (f.importOrigin && v.importOrigin !== f.importOrigin) return false;
  if (f.search) {
    const hay = `${v.year} ${v.make} ${v.model} ${v.variant}`.toLowerCase();
    if (!hay.includes(f.search.toLowerCase())) return false;
  }
  return true;
}

export async function getFeaturedVehicles(max = 6): Promise<Vehicle[]> {
  const items = await getAvailable(); // cached, already newest-first
  return items.filter((v) => v.featured).slice(0, max);
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  // Serve from the shared cache when we can (instant on detail pages).
  const cached = availCache?.items.find((v) => v.slug === slug);
  if (cached) return cached;
  const items = await getAvailable();
  const found = items.find((v) => v.slug === slug);
  if (found) return found;
  // Fallback: direct lookup (e.g. cache empty or a non-available slug).
  const db = requireDb();
  const snap = await getDocs(
    query(collection(db, VEHICLES), where('slug', '==', slug), fbLimit(1))
  );
  if (snap.empty) return null;
  const d = snap.docs[0];
  return toVehicle(d.id, d.data());
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  const db = requireDb();
  const snap = await getDoc(doc(db, VEHICLES, id));
  return snap.exists() ? toVehicle(snap.id, snap.data()) : null;
}

/** Similar = same body type or make, available, excluding the current vehicle. */
export async function getSimilarVehicles(v: Vehicle, max = 4): Promise<Vehicle[]> {
  const all = (await getAvailable()).filter((x) => x.id !== v.id);
  const scored = all
    .map((x) => ({
      x,
      score:
        (x.bodyType === v.bodyType ? 2 : 0) +
        (x.make === v.make ? 2 : 0) +
        (Math.abs(x.price - v.price) < 4000 ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, max).map((r) => r.x);
}

/** Admin: list every vehicle regardless of status. */
export async function listAllVehicles(): Promise<Vehicle[]> {
  const db = requireDb();
  const snap = await getDocs(query(collection(db, VEHICLES), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => toVehicle(d.id, d.data()));
}

export type VehicleInput = Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>;

export async function createVehicle(input: VehicleInput): Promise<string> {
  const db = requireDb();
  const ref = await addDoc(collection(db, VEHICLES), {
    ...input,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    _serverUpdatedAt: serverTimestamp(),
  });
  invalidateVehicleCache();
  return ref.id;
}

/**
 * Create a vehicle with a caller-supplied id. Used by the admin editor so image
 * uploads can be stored under the vehicle's storage folder BEFORE the record is
 * saved (the working id and the final document id are the same).
 */
export async function createVehicleWithId(id: string, input: VehicleInput): Promise<void> {
  const db = requireDb();
  await setDoc(doc(db, VEHICLES, id), {
    ...input,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    _serverUpdatedAt: serverTimestamp(),
  });
  invalidateVehicleCache();
}

export async function updateVehicle(id: string, patch: Partial<VehicleInput>): Promise<void> {
  const db = requireDb();
  await updateDoc(doc(db, VEHICLES, id), {
    ...patch,
    updatedAt: Date.now(),
    _serverUpdatedAt: serverTimestamp(),
  });
  invalidateVehicleCache();
}

/** Soft-archive: mark sold so it drops off the public site but stays on record. */
export async function archiveVehicle(id: string): Promise<void> {
  await updateVehicle(id, { status: 'sold' });
}

/**
 * Permanently delete a vehicle: removes all its images from Storage, then the
 * Firestore document. Irreversible - the admin UI guards this behind a confirm.
 */
export async function hardDeleteVehicle(vehicle: Vehicle): Promise<void> {
  const db = requireDb();
  await Promise.all(
    vehicle.images.map((img) => (img.storagePath ? deleteVehicleImage(img.storagePath) : Promise.resolve()))
  );
  await deleteDoc(doc(db, VEHICLES, vehicle.id));
  invalidateVehicleCache();
}
