import type {
  FuelType,
  Transmission,
  BodyType,
  ImportOrigin,
  VehicleStatus,
} from '../lib/types';

/** Canonical option lists reused by forms, filters and the admin editor. */

export const FUEL_TYPES: FuelType[] = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'Plug-in Hybrid'];
export const TRANSMISSIONS: Transmission[] = ['Automatic', 'Manual'];
export const BODY_TYPES: BodyType[] = [
  'Hatchback',
  'Saloon',
  'SUV',
  'Estate',
  'Coupe',
  'MPV',
  'Convertible',
  'Van',
];
export const IMPORT_ORIGINS: ImportOrigin[] = ['UK', 'Japan', 'Irish'];
export const VEHICLE_STATUSES: VehicleStatus[] = ['available', 'reserved', 'sold'];

/** Common makes for the search dropdowns (free text is still allowed). */
export const COMMON_MAKES = [
  'Toyota',
  'Honda',
  'Nissan',
  'Mazda',
  'Mitsubishi',
  'Subaru',
  'Lexus',
  'Suzuki',
  'BMW',
  'Audi',
  'Volkswagen',
  'Mercedes-Benz',
  'Ford',
  'Volvo',
];

/** Quick-filter chips shown under the home hero search. */
export const QUICK_FILTERS: { label: string; params: Record<string, string> }[] = [
  { label: 'Automatic', params: { transmission: 'Automatic' } },
  { label: 'Petrol', params: { fuel: 'Petrol' } },
  { label: 'Diesel', params: { fuel: 'Diesel' } },
  { label: 'Hybrid', params: { fuel: 'Hybrid' } },
  { label: 'Hatchback', params: { body: 'Hatchback' } },
  { label: 'Saloon', params: { body: 'Saloon' } },
  { label: 'SUV', params: { body: 'SUV' } },
  { label: 'Estate', params: { body: 'Estate' } },
];

export const CURRENT_YEAR = new Date().getFullYear();
export const YEAR_OPTIONS = Array.from({ length: 25 }, (_, i) => CURRENT_YEAR - i);
