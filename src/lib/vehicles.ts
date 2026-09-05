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
  serverTimestamp,
  type QueryConstraint,
  type DocumentData,
} from 'firebase/firestore/lite';
import { requireDb } from './firebase';
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
 * Design note on filtering strategy
 * ----------------------------------
 * Firestore forbids range filters (<, >) on more than one field per query, and
 * combining many equality filters with an orderBy needs a composite index per
 * combination. The stock filter UI exposes several ranges at once (year, price,
 * mileage), so a single all-server-side query is impossible.
 *
 * A single dealership's live stock is small (tens of vehicles, never the
 * thousands where this matters), so we push the status filter + primary sort to
 * Firestore (indexed) and evaluate the remaining equality/range filters over the
 * returned `status = available` set. We never load sold/reserved rows to the
 * browser, and pagination is computed after filtering. For a much larger
 * inventory you would move filtering to a dedicated search index (e.g. Algolia
 * / Typesense) fed by Firestore triggers - the call sites here would not change.
 */
export async function queryVehicles(
  filters: VehicleFilters = {},
  sort: VehicleSort = 'newest',
  page = 1,
  pageSize = 12
): Promise<VehicleQueryResult> {
  const db = requireDb();
  const constraints: QueryConstraint[] = [];

  const status = filters.status ?? 'available';
  if (status !== 'all') constraints.push(where('status', '==', status));
  if (filters.featured) constraints.push(where('featured', '==', true));

  const s = SORT_FIELD[sort];
  constraints.push(orderBy(s.field, s.dir));

  const snap = await getDocs(query(collection(db, VEHICLES), ...constraints));
  let items = snap.docs.map((docSnap) => toVehicle(docSnap.id, docSnap.data()));

  // In-memory refinement (see design note).
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
  const db = requireDb();
  const snap = await getDocs(
    query(
      collection(db, VEHICLES),
      where('status', '==', 'available'),
      where('featured', '==', true),
      orderBy('createdAt', 'desc'),
      fbLimit(max)
    )
  );
  return snap.docs.map((d) => toVehicle(d.id, d.data()));
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
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
  const db = requireDb();
  const snap = await getDocs(
    query(
      collection(db, VEHICLES),
      where('status', '==', 'available'),
      orderBy('createdAt', 'desc'),
      fbLimit(24)
    )
  );
  const all = snap.docs.map((d) => toVehicle(d.id, d.data())).filter((x) => x.id !== v.id);
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
}

export async function updateVehicle(id: string, patch: Partial<VehicleInput>): Promise<void> {
  const db = requireDb();
  await updateDoc(doc(db, VEHICLES, id), {
    ...patch,
    updatedAt: Date.now(),
    _serverUpdatedAt: serverTimestamp(),
  });
}

/** Vehicles are archived (status change), never hard-deleted, to keep history. */
export async function archiveVehicle(id: string): Promise<void> {
  await updateVehicle(id, { status: 'sold' });
}
