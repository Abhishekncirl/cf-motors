import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, Save, Trash2 } from 'lucide-react';
import { getPartById, createPartWithId, updatePart, hardDeletePart, type PartInput } from '../../lib/parts';
import type { Part, VehicleImage } from '../../lib/types';
import { TextField, TextAreaField, SelectField } from '../../components/forms/Fields';
import { ImageManager } from './ImageManager';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Spinner } from '../../components/ui/Spinner';
import { PART_CATEGORIES, PART_CONDITIONS, PART_STATUSES } from '../../config/options';
import { slugify } from '../../lib/slug';
import { isClean, requiredText } from '../../lib/validate';

interface FormState {
  name: string; category: string; brand: string; price: string; sku: string;
  condition: string; stockQty: string; description: string; status: string; featured: boolean;
}

const EMPTY: FormState = {
  name: '', category: PART_CATEGORIES[0], brand: '', price: '', sku: '',
  condition: 'New', stockQty: '1', description: '', status: 'available', featured: false,
};

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `p-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function PartEditPage({ mode }: { mode: 'create' | 'edit' }) {
  const { id: routeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const workingId = useMemo(() => (mode === 'edit' && routeId ? routeId : newId()), [mode, routeId]);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [images, setImages] = useState<VehicleImage[]>([]);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [existing, setExisting] = useState<Part | null>(null);

  useEffect(() => {
    if (mode !== 'edit' || !routeId) return;
    getPartById(routeId)
      .then((p) => {
        if (!p) { navigate('/admin/parts'); return; }
        setExisting(p);
        setForm({
          name: p.name, category: p.category, brand: p.brand, price: String(p.price), sku: p.sku,
          condition: p.condition, stockQty: String(p.stockQty), description: p.description,
          status: p.status, featured: p.featured,
        });
        setImages(p.images);
      })
      .finally(() => setLoading(false));
  }, [mode, routeId, navigate]);

  const set = (k: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const next: Record<string, string | undefined> = {
      name: requiredText(form.name, 'name'),
      price: form.price && Number(form.price) >= 0 ? undefined : 'Please enter a valid price.',
    };
    setErrors(next);
    return isClean(next);
  };

  const toInput = (): PartInput => ({
    name: form.name.trim(),
    category: form.category,
    brand: form.brand.trim(),
    price: Number(form.price) || 0,
    sku: form.sku.trim(),
    condition: (form.condition === 'Used' ? 'Used' : 'New'),
    stockQty: Number(form.stockQty) || 0,
    description: form.description.trim(),
    status: form.status as PartInput['status'],
    featured: form.featured,
    images: images.map((img, i) => ({ ...img, sortOrder: i })),
    slug: existing?.slug || `${slugify(form.name)}-${slugify(form.sku) || workingId.slice(0, 6)}`,
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    setSaving(true);
    try {
      if (mode === 'create') await createPartWithId(workingId, toInput());
      else if (routeId) await updatePart(routeId, toInput());
      navigate('/admin/parts');
    } catch {
      setSaving(false);
      setErrors((p) => ({ ...p, _form: 'Could not save. Please try again.' }));
    }
  };

  const doDelete = async () => {
    if (!existing) return;
    setSaving(true);
    await hardDeletePart(existing);
    navigate('/admin/parts');
  };

  if (loading) return <Spinner label="Loading part" />;

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/parts" className="btn-ghost px-0 text-sm">
            <ChevronLeft size={16} aria-hidden /> Back to parts
          </Link>
          <h1 className="mt-1 font-display text-3xl font-bold">{mode === 'create' ? 'Add part' : 'Edit part'}</h1>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} className="h-4 w-4 accent-brand-cyan" />
          Featured
        </label>
      </div>

      {errors._form && <p className="rounded border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-600" role="alert">{errors._form}</p>}

      <section className="card space-y-4 p-6">
        <h2 className="font-display text-lg font-bold">Photos</h2>
        <ImageManager vehicleId={workingId} images={images} onChange={setImages} folder="parts" maxImages={4} label="Part photo" />
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="font-display text-lg font-bold">Part details</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TextField label="Name" name="name" required value={form.name} onChange={set('name')} error={errors.name} placeholder="e.g. 5W-30 Engine Oil 5L" />
          <SelectField label="Category" name="category" value={form.category} onChange={set('category')}>
            {PART_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </SelectField>
          <TextField label="Brand" name="brand" value={form.brand} onChange={set('brand')} placeholder="e.g. Castrol" />
          <TextField label="Price (€)" name="price" required type="number" inputMode="decimal" value={form.price} onChange={set('price')} error={errors.price} />
          <TextField label="SKU / part no." name="sku" value={form.sku} onChange={set('sku')} />
          <SelectField label="Condition" name="condition" value={form.condition} onChange={set('condition')}>
            {PART_CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </SelectField>
          <TextField label="Stock quantity" name="stockQty" type="number" inputMode="numeric" value={form.stockQty} onChange={set('stockQty')} />
          <SelectField label="Status" name="status" value={form.status} onChange={set('status')}>
            {PART_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </SelectField>
        </div>
        <TextAreaField label="Description" name="description" value={form.description} onChange={set('description')} rows={5} placeholder="Details shown to customers (fitment, specs, condition notes)…" />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {mode === 'edit' && (
            <button type="button" onClick={() => setConfirmDelete(true)} className="btn border border-red-400/40 text-red-500 hover:border-red-400 hover:text-red-600">
              <Trash2 size={16} aria-hidden /> Delete permanently
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <Link to="/admin/parts" className="btn-ghost">Cancel</Link>
          <button type="submit" className="btn-primary" disabled={saving}>
            <Save size={16} aria-hidden /> {saving ? 'Saving…' : 'Save part'}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        destructive
        title="Delete this part permanently?"
        message="This removes the part and all its photos from storage for good. This can’t be undone."
        confirmLabel="Delete permanently"
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(false)}
        busy={saving}
      />
    </form>
  );
}
