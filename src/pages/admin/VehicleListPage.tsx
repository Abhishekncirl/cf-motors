import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Copy, Star, Search } from 'lucide-react';
import { listAllVehicles, updateVehicle, createVehicle } from '../../lib/vehicles';
import type { Vehicle, VehicleStatus } from '../../lib/types';
import { Spinner } from '../../components/ui/Spinner';
import { StatusBadge } from '../../components/ui/Badges';
import { formatPrice, formatMileage, vehicleTitle } from '../../lib/format';
import { vehicleSlug } from '../../lib/slug';
import { VEHICLE_STATUSES } from '../../config/options';

export function VehicleListPage() {
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const reload = () => listAllVehicles().then(setVehicles).catch(() => setVehicles([]));
  useEffect(() => {
    reload();
  }, []);

  const setStatus = async (v: Vehicle, status: VehicleStatus) => {
    setBusyId(v.id);
    await updateVehicle(v.id, { status });
    await reload();
    setBusyId(null);
  };

  const toggleFeatured = async (v: Vehicle) => {
    setBusyId(v.id);
    await updateVehicle(v.id, { featured: !v.featured });
    await reload();
    setBusyId(null);
  };

  const duplicate = async (v: Vehicle) => {
    setBusyId(v.id);
    const stockRef = `${v.stockRef || 'REF'}-COPY`;
    const { id, createdAt, updatedAt, ...rest } = v;
    void id;
    void createdAt;
    void updatedAt;
    await createVehicle({
      ...rest,
      status: 'available',
      featured: false,
      stockRef,
      images: [], // start with no images on the copy
      slug: vehicleSlug({ ...v, stockRef }),
    });
    await reload();
    setBusyId(null);
  };

  if (!vehicles) return <Spinner label="Loading vehicles" />;

  const filtered = vehicles.filter((v) =>
    vehicleTitle(v, true).toLowerCase().includes(search.toLowerCase()) ||
    v.stockRef.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold">Vehicles</h1>
        <Link to="/admin/vehicles/new" className="btn-primary">
          <Plus size={16} aria-hidden /> Add vehicle
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-white/40" aria-hidden />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or stock ref…"
          className="field-input pl-9"
          aria-label="Search vehicles"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-brand-white/50">
              <th className="py-3 pr-4">Vehicle</th>
              <th className="py-3 pr-4">Price</th>
              <th className="py-3 pr-4">Mileage</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Featured</th>
              <th className="py-3 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-3 pr-4">
                  <Link to={`/admin/vehicles/${v.id}`} className="font-semibold hover:text-brand-cyan">
                    {vehicleTitle(v, true)}
                  </Link>
                  <div className="text-xs text-brand-white/40">{v.stockRef || '—'}</div>
                </td>
                <td className="py-3 pr-4">{formatPrice(v.price)}</td>
                <td className="py-3 pr-4">{formatMileage(v.mileageKm)}</td>
                <td className="py-3 pr-4">
                  <select
                    value={v.status}
                    disabled={busyId === v.id}
                    onChange={(e) => setStatus(v, e.target.value as VehicleStatus)}
                    className="field-input w-auto py-1.5 text-xs"
                    aria-label={`Status for ${vehicleTitle(v)}`}
                  >
                    {VEHICLE_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="py-3 pr-4">
                  <button
                    onClick={() => toggleFeatured(v)}
                    disabled={busyId === v.id}
                    aria-pressed={v.featured}
                    aria-label={v.featured ? 'Unfeature' : 'Feature'}
                    className={v.featured ? 'text-brand-cyan' : 'text-brand-white/30 hover:text-brand-white/60'}
                  >
                    <Star size={18} className={v.featured ? 'fill-brand-cyan' : ''} aria-hidden />
                  </button>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => duplicate(v)} disabled={busyId === v.id} className="btn-ghost px-2 py-1 text-xs" title="Duplicate">
                      <Copy size={14} aria-hidden /> Duplicate
                    </button>
                    <Link to={`/admin/vehicles/${v.id}`} className="btn-outline px-3 py-1 text-xs">Edit</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-brand-white/50">No vehicles found.</p>
        )}
        <div className="mt-2 flex items-center gap-2">
          <StatusBadge status="available" />
          <span className="text-xs text-brand-white/40">Sold/reserved cars stay in the database but drop off the public site.</span>
        </div>
      </div>
    </div>
  );
}
