import type { Vehicle } from '../../lib/types';
import { formatMileage, formatDate } from '../../lib/format';

/** Full specification table for the vehicle detail page. */
export function SpecTable({ vehicle: v }: { vehicle: Vehicle }) {
  const rows: [string, string | number][] = [
    ['Year', v.year],
    ['Make', v.make],
    ['Model', v.model],
    ['Variant', v.variant || '—'],
    ['Mileage', formatMileage(v.mileageKm)],
    ['Fuel', v.fuelType],
    ['Transmission', v.transmission],
    ['Engine size', v.engineSize || '—'],
    ['Body type', v.bodyType],
    ['Doors', v.doors],
    ['Seats', v.seats],
    ['Colour', v.colour || '—'],
    ['Previous owners', v.previousOwners],
    ['NCT expiry', formatDate(v.nctExpiry)],
    ['Tax band', v.taxBand || '—'],
    ['Import origin', v.importOrigin],
    ['Stock reference', v.stockRef || '—'],
  ];

  return (
    <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between gap-4 bg-brand-grey px-4 py-3">
          <dt className="text-sm text-brand-white/55">{label}</dt>
          <dd className="text-sm font-semibold text-brand-white">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
