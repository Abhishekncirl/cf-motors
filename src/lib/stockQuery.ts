import type { VehicleFilters, VehicleSort } from './vehicles';

/**
 * Serialise/parse stock filters to and from URL query params so /stock results
 * are shareable and bookmarkable.
 */

const SORTS: VehicleSort[] = ['newest', 'price-asc', 'price-desc', 'mileage-asc', 'year-desc'];

export function filtersToParams(
  filters: VehicleFilters,
  sort: VehicleSort,
  page: number
): URLSearchParams {
  const p = new URLSearchParams();
  const set = (k: string, v: string | number | undefined) => {
    if (v !== undefined && v !== '' && v !== null) p.set(k, String(v));
  };
  set('make', filters.make);
  set('model', filters.model);
  set('yearMin', filters.yearMin);
  set('yearMax', filters.yearMax);
  set('priceMin', filters.priceMin);
  set('priceMax', filters.priceMax);
  set('fuel', filters.fuelType);
  set('transmission', filters.transmission);
  set('body', filters.bodyType);
  set('mileageMax', filters.mileageMax);
  set('origin', filters.importOrigin);
  set('q', filters.search);
  if (sort !== 'newest') set('sort', sort);
  if (page > 1) set('page', page);
  return p;
}

export function paramsToFilters(sp: URLSearchParams): {
  filters: VehicleFilters;
  sort: VehicleSort;
  page: number;
} {
  const numOr = (k: string): number | undefined => {
    const v = sp.get(k);
    if (v === null || v === '') return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  const filters: VehicleFilters = {
    make: sp.get('make') || undefined,
    model: sp.get('model') || undefined,
    yearMin: numOr('yearMin'),
    yearMax: numOr('yearMax'),
    priceMin: numOr('priceMin'),
    priceMax: numOr('priceMax'),
    fuelType: (sp.get('fuel') as VehicleFilters['fuelType']) || undefined,
    transmission: (sp.get('transmission') as VehicleFilters['transmission']) || undefined,
    bodyType: (sp.get('body') as VehicleFilters['bodyType']) || undefined,
    mileageMax: numOr('mileageMax'),
    importOrigin: (sp.get('origin') as VehicleFilters['importOrigin']) || undefined,
    search: sp.get('q') || undefined,
  };
  const sortRaw = sp.get('sort') as VehicleSort | null;
  const sort: VehicleSort = sortRaw && SORTS.includes(sortRaw) ? sortRaw : 'newest';
  const page = Math.max(1, numOr('page') ?? 1);
  return { filters, sort, page };
}

export function countActiveFilters(f: VehicleFilters): number {
  return [
    f.make,
    f.model,
    f.yearMin,
    f.yearMax,
    f.priceMin,
    f.priceMax,
    f.fuelType,
    f.transmission,
    f.bodyType,
    f.mileageMax,
    f.importOrigin,
    f.search,
  ].filter((v) => v !== undefined && v !== '').length;
}
