import { RotateCcw } from 'lucide-react';
import type { VehicleFilters } from '../../lib/vehicles';
import {
  COMMON_MAKES,
  FUEL_TYPES,
  TRANSMISSIONS,
  BODY_TYPES,
  IMPORT_ORIGINS,
  YEAR_OPTIONS,
} from '../../config/options';

interface Props {
  filters: VehicleFilters;
  onChange: (patch: Partial<VehicleFilters>) => void;
  onReset: () => void;
}

/** Filter controls shared by the desktop sidebar and the mobile slide-over. */
export function FilterSidebar({ filters, onChange, onReset }: Props) {
  const numFrom = (v: string): number | undefined => (v ? Number(v) : undefined);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Filter stock</h2>
        <button type="button" onClick={onReset} className="btn-ghost px-2 py-1 text-xs">
          <RotateCcw size={14} aria-hidden /> Reset
        </button>
      </div>

      <div>
        <label className="field-label">Make</label>
        <select
          value={filters.make ?? ''}
          onChange={(e) => onChange({ make: e.target.value || undefined })}
          className="field-input"
        >
          <option value="">Any make</option>
          {COMMON_MAKES.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label">Model</label>
        <input
          value={filters.model ?? ''}
          onChange={(e) => onChange({ model: e.target.value || undefined })}
          placeholder="Any model"
          className="field-input"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Year from</label>
          <select
            value={filters.yearMin ?? ''}
            onChange={(e) => onChange({ yearMin: numFrom(e.target.value) })}
            className="field-input"
          >
            <option value="">Any</option>
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">Year to</label>
          <select
            value={filters.yearMax ?? ''}
            onChange={(e) => onChange({ yearMax: numFrom(e.target.value) })}
            className="field-input"
          >
            <option value="">Any</option>
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Min price €</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={filters.priceMin ?? ''}
            onChange={(e) => onChange({ priceMin: numFrom(e.target.value) })}
            placeholder="0"
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label">Max price €</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={filters.priceMax ?? ''}
            onChange={(e) => onChange({ priceMax: numFrom(e.target.value) })}
            placeholder="Any"
            className="field-input"
          />
        </div>
      </div>

      <div>
        <label className="field-label">Fuel type</label>
        <select
          value={filters.fuelType ?? ''}
          onChange={(e) => onChange({ fuelType: (e.target.value || undefined) as VehicleFilters['fuelType'] })}
          className="field-input"
        >
          <option value="">Any</option>
          {FUEL_TYPES.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label">Transmission</label>
        <select
          value={filters.transmission ?? ''}
          onChange={(e) => onChange({ transmission: (e.target.value || undefined) as VehicleFilters['transmission'] })}
          className="field-input"
        >
          <option value="">Any</option>
          {TRANSMISSIONS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label">Body type</label>
        <select
          value={filters.bodyType ?? ''}
          onChange={(e) => onChange({ bodyType: (e.target.value || undefined) as VehicleFilters['bodyType'] })}
          className="field-input"
        >
          <option value="">Any</option>
          {BODY_TYPES.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label">Max mileage (km)</label>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          step={5000}
          value={filters.mileageMax ?? ''}
          onChange={(e) => onChange({ mileageMax: numFrom(e.target.value) })}
          placeholder="Any"
          className="field-input"
        />
      </div>

      <div>
        <label className="field-label">Import origin</label>
        <div className="flex flex-wrap gap-2">
          {IMPORT_ORIGINS.map((o) => {
            const active = filters.importOrigin === o;
            return (
              <button
                key={o}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ importOrigin: active ? undefined : o })}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                  active
                    ? 'border-brand-cyan bg-brand-cyan text-brand-black'
                    : 'border-white/15 text-brand-white/80 hover:border-brand-cyan'
                }`}
              >
                {o}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
