import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Star, Search, Trash2 } from 'lucide-react';
import { listAllParts, updatePart, hardDeletePart } from '../../lib/parts';
import type { Part, PartStatus } from '../../lib/types';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { formatPrice } from '../../lib/format';
import { PART_STATUSES } from '../../config/options';

export function PartListPage() {
  const [parts, setParts] = useState<Part[] | null>(null);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Part | null>(null);
  const [deleting, setDeleting] = useState(false);

  const reload = () => listAllParts().then(setParts).catch(() => setParts([]));
  useEffect(() => { reload(); }, []);

  const setStatus = async (p: Part, status: PartStatus) => {
    setBusyId(p.id); await updatePart(p.id, { status }); await reload(); setBusyId(null);
  };
  const toggleFeatured = async (p: Part) => {
    setBusyId(p.id); await updatePart(p.id, { featured: !p.featured }); await reload(); setBusyId(null);
  };
  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try { await hardDeletePart(toDelete); setToDelete(null); await reload(); }
    finally { setDeleting(false); }
  };

  if (!parts) return <Spinner label="Loading parts" />;

  const filtered = parts.filter((p) =>
    `${p.name} ${p.brand} ${p.category} ${p.sku}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold">Car parts</h1>
        <Link to="/admin/parts/new" className="btn-primary">
          <Plus size={16} aria-hidden /> Add part
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" aria-hidden />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, brand, SKU…" className="field-input pl-9" aria-label="Search parts" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink/50">
              <th className="py-3 pr-4">Part</th>
              <th className="py-3 pr-4">Category</th>
              <th className="py-3 pr-4">Price</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Featured</th>
              <th className="py-3 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-line hover:bg-black/[0.03]">
                <td className="py-3 pr-4">
                  <Link to={`/admin/parts/${p.id}`} className="font-semibold hover:text-teal">{p.name || '(untitled)'}</Link>
                  <div className="text-xs text-ink/40">{[p.brand, p.condition, p.sku].filter(Boolean).join(' · ') || '—'}</div>
                </td>
                <td className="py-3 pr-4">{p.category}</td>
                <td className="py-3 pr-4">{formatPrice(p.price)}</td>
                <td className="py-3 pr-4">
                  <select value={p.status} disabled={busyId === p.id} onChange={(e) => setStatus(p, e.target.value as PartStatus)} className="field-input w-auto py-1.5 text-xs" aria-label={`Status for ${p.name}`}>
                    {PART_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="py-3 pr-4">
                  <button onClick={() => toggleFeatured(p)} disabled={busyId === p.id} aria-pressed={p.featured} aria-label={p.featured ? 'Unfeature' : 'Feature'} className={p.featured ? 'text-teal' : 'text-ink/30 hover:text-ink/60'}>
                    <Star size={18} className={p.featured ? 'fill-brand-cyan' : ''} aria-hidden />
                  </button>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center justify-end gap-3">
                    <Link to={`/admin/parts/${p.id}`} className="text-xs font-semibold text-teal hover:underline">Edit</Link>
                    <button onClick={() => setToDelete(p)} aria-label="Delete part" className="text-red-500 hover:text-red-600"><Trash2 size={16} aria-hidden /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-sm text-ink/50">No parts yet. Click “Add part” to create one.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        destructive
        title="Delete this part permanently?"
        message="This removes the part and all its photos from storage for good. This can’t be undone. To just hide it, set its status to ‘hidden’."
        confirmLabel="Delete part"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
        busy={deleting}
      />
    </div>
  );
}
