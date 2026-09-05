/** Formatting helpers for prices, mileage, dates and vehicle titles. */

const eur = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const num = new Intl.NumberFormat('en-IE');

export function formatPrice(value: number): string {
  return eur.format(value);
}

export function formatWeekly(value: number): string {
  return `${eur.format(value)} per week`;
}

export function formatMileage(km: number): string {
  return `${num.format(km)} km`;
}

export function formatNumber(value: number): string {
  return num.format(value);
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IE', { year: 'numeric', month: 'short', day: 'numeric' });
}

export interface VehicleTitleParts {
  year: number;
  make: string;
  model: string;
  variant?: string;
}

export function vehicleTitle(v: VehicleTitleParts, withVariant = false): string {
  const base = `${v.year} ${v.make} ${v.model}`;
  return withVariant && v.variant ? `${base} ${v.variant}` : base;
}

/** Alt text generated from year + make + model per accessibility requirement. */
export function vehicleAlt(v: VehicleTitleParts, extra = ''): string {
  return `${vehicleTitle(v)}${extra ? ` - ${extra}` : ''}`.trim();
}
