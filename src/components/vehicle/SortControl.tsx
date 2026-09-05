import type { VehicleSort } from '../../lib/vehicles';

const OPTIONS: { value: VehicleSort; label: string }[] = [
  { value: 'newest', label: 'Newest listed' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'mileage-asc', label: 'Mileage: low to high' },
  { value: 'year-desc', label: 'Year: newest' },
];

export function SortControl({
  sort,
  onChange,
}: {
  sort: VehicleSort;
  onChange: (s: VehicleSort) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-xs font-semibold uppercase tracking-wide text-brand-white/50">
        Sort
      </label>
      <select
        id="sort"
        value={sort}
        onChange={(e) => onChange(e.target.value as VehicleSort)}
        className="field-input w-auto py-2 text-sm"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
