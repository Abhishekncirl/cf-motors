import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Inbox, Plus, Flag } from 'lucide-react';
import { listAllVehicles } from '../../lib/vehicles';
import { listEnquiries } from '../../lib/enquiries';
import type { Vehicle, Enquiry, ImportOrigin } from '../../lib/types';
import { Spinner } from '../../components/ui/Spinner';
import { formatPrice, vehicleTitle } from '../../lib/format';
import { StatusBadge } from '../../components/ui/Badges';

export function DashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[] | null>(null);

  useEffect(() => {
    listAllVehicles().then(setVehicles).catch(() => setVehicles([]));
    listEnquiries().then(setEnquiries).catch(() => setEnquiries([]));
  }, []);

  if (!vehicles || !enquiries) return <Spinner label="Loading dashboard" />;

  const available = vehicles.filter((v) => v.status === 'available');
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newEnquiries = enquiries.filter((e) => e.createdAt >= weekAgo);
  const byOrigin = (o: ImportOrigin) => vehicles.filter((v) => v.importOrigin === o).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="text-brand-white/55">Overview of your stock and enquiries.</p>
        </div>
        <Link to="/admin/vehicles/new" className="btn-primary">
          <Plus size={16} aria-hidden /> Add vehicle
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Car} label="Available stock" value={available.length} sub={`${vehicles.length} total`} />
        <Stat icon={Inbox} label="New enquiries (7d)" value={newEnquiries.length} sub={`${enquiries.filter((e) => !e.isRead).length} unread`} />
        <Stat icon={Flag} label="Featured" value={vehicles.filter((v) => v.featured).length} sub="on homepage" />
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-white/50">By origin</p>
          <div className="mt-2 space-y-1 text-sm">
            <Row label="UK" value={byOrigin('UK')} />
            <Row label="Japan" value={byOrigin('Japan')} />
            <Row label="Irish" value={byOrigin('Irish')} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Recently added</h2>
            <Link to="/admin/vehicles" className="text-xs text-brand-cyan hover:underline">View all</Link>
          </div>
          <ul className="divide-y divide-white/10">
            {vehicles.slice(0, 5).map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-3 py-2.5">
                <Link to={`/admin/vehicles/${v.id}`} className="text-sm font-semibold hover:text-brand-cyan">
                  {vehicleTitle(v)}
                </Link>
                <span className="flex items-center gap-2">
                  <StatusBadge status={v.status} />
                  <span className="text-sm text-brand-white/60">{formatPrice(v.price)}</span>
                </span>
              </li>
            ))}
            {vehicles.length === 0 && <li className="py-3 text-sm text-brand-white/50">No vehicles yet.</li>}
          </ul>
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Latest enquiries</h2>
            <Link to="/admin/enquiries" className="text-xs text-brand-cyan hover:underline">View all</Link>
          </div>
          <ul className="divide-y divide-white/10">
            {enquiries.slice(0, 5).map((e) => (
              <li key={e.id} className="py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{e.name}</span>
                  <span className="rounded bg-white/10 px-2 py-0.5 text-[0.65rem] uppercase text-brand-white/60">{e.type}</span>
                </div>
                <p className="truncate text-xs text-brand-white/50">{e.message}</p>
              </li>
            ))}
            {enquiries.length === 0 && <li className="py-3 text-sm text-brand-white/50">No enquiries yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub }: { icon: typeof Car; label: string; value: number; sub: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-white/50">{label}</p>
        <Icon size={18} className="text-brand-cyan" aria-hidden />
      </div>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
      <p className="text-xs text-brand-white/45">{sub}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-brand-white/60">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
