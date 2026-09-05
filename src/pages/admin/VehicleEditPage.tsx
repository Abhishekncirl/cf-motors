import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, Save, Archive } from 'lucide-react';
import { getVehicleById, createVehicleWithId, updateVehicle, type VehicleInput } from '../../lib/vehicles';
import type { Vehicle, VehicleImage } from '../../lib/types';
import { TextField, TextAreaField, SelectField } from '../../components/forms/Fields';
import { ImageManager } from './ImageManager';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Spinner } from '../../components/ui/Spinner';
import {
  FUEL_TYPES, TRANSMISSIONS, BODY_TYPES, IMPORT_ORIGINS, VEHICLE_STATUSES,
} from '../../config/options';
import { vehicleSlug } from '../../lib/slug';
import { isClean, requiredText } from '../../lib/validate';

interface FormState {
  make: string; model: string; variant: string; year: string; price: string;
  weeklyPrice: string; mileageKm: string; fuelType: string; transmission: string;
  engineSize: string; bodyType: string; doors: string; seats: string; colour: string;
  previousOwners: string; nctExpiry: string; taxBand: string; importOrigin: string;
  stockRef: string; description: string; status: string; featured: boolean;
}

const EMPTY: FormState = {
  make: '', model: '', variant: '', year: String(new Date().getFullYear()), price: '',
  weeklyPrice: '', mileageKm: '', fuelType: 'Petrol', transmission: 'Automatic',
  engineSize: '', bodyType: 'Hatchback', doors: '5', seats: '5', colour: '',
  previousOwners: '1', nctExpiry: '', taxBand: '', importOrigin: 'Japan',
  stockRef: '', description: '', status: 'available', featured: false,
};

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function VehicleEditPage({ mode }: { mode: 'create' | 'edit' }) {
  const { id: routeId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Stable working id: existing id in edit mode, generated once in create mode.
  const workingId = useMemo(() => (mode === 'edit' && routeId ? routeId : newId()), [mode, routeId]);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [images, setImages] = useState<VehicleImage[]>([]);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [existing, setExisting] = useState<Vehicle | null>(null);

  useEffect(() => {
    if (mode !== 'edit' || !routeId) return;
    getVehicleById(routeId)
      .then((v) => {
        if (!v) {
          navigate('/admin/vehicles');
          return;
        }
        setExisting(v);
        setForm(vehicleToForm(v));
        setImages(v.images);
      })
      .finally(() => setLoading(false));
  }, [mode, routeId, navigate]);

  const set = (k: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const next: Record<string, string | undefined> = {
      make: requiredText(form.make, 'make'),
      model: requiredText(form.model, 'model'),
      price: form.price && Number(form.price) > 0 ? undefined : 'Please enter a valid price.',
      year: form.year && Number(form.year) >= 1990 ? undefined : 'Please enter a valid year.',
      mileageKm: form.mileageKm !== '' && Number(form.mileageKm) >= 0 ? undefined : 'Please enter the mileage.',
    };
    setErrors(next);
    return isClean(next);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSaving(true);
    try {
      const input = formToInput(form, images, existing?.slug);
      if (mode === 'create') {
        await createVehicleWithId(workingId, input);
      } else if (routeId) {
        await updateVehicle(routeId, input);
      }
      navigate('/admin/vehicles');
    } catch {
      setSaving(false);
      setErrors((prev) => ({ ...prev, _form: 'Could not save. Please try again.' }));
    }
  };

  const doArchive = async () => {
    if (!routeId) return;
    setSaving(true);
    await updateVehicle(routeId, { status: 'sold' });
    navigate('/admin/vehicles');
  };

  if (loading) return <Spinner label="Loading vehicle" />;

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/vehicles" className="btn-ghost px-0 text-sm">
            <ChevronLeft size={16} aria-hidden /> Back to vehicles
          </Link>
          <h1 className="mt-1 font-display text-3xl font-bold">
            {mode === 'create' ? 'Add vehicle' : 'Edit vehicle'}
          </h1>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
            className="h-4 w-4 accent-brand-cyan"
          />
          Featured on homepage
        </label>
      </div>

      {errors._form && (
        <p className="rounded border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300" role="alert">
          {errors._form}
        </p>
      )}

      <section className="card space-y-4 p-6">
        <h2 className="font-display text-lg font-bold">Photos</h2>
        <ImageManager vehicleId={workingId} images={images} onChange={setImages} />
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="font-display text-lg font-bold">Key details</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TextField label="Make" name="make" required value={form.make} onChange={set('make')} error={errors.make} />
          <TextField label="Model" name="model" required value={form.model} onChange={set('model')} error={errors.model} />
          <TextField label="Variant / trim" name="variant" value={form.variant} onChange={set('variant')} />
          <TextField label="Year" name="year" required type="number" inputMode="numeric" value={form.year} onChange={set('year')} error={errors.year} />
          <TextField label="Price (€)" name="price" required type="number" inputMode="numeric" value={form.price} onChange={set('price')} error={errors.price} />
          <TextField label="Weekly price (€)" name="weeklyPrice" type="number" inputMode="numeric" value={form.weeklyPrice} onChange={set('weeklyPrice')} hint="Optional - shown as 'from €X per week'" />
          <TextField label="Mileage (km)" name="mileageKm" required type="number" inputMode="numeric" value={form.mileageKm} onChange={set('mileageKm')} error={errors.mileageKm} />
          <SelectField label="Import origin" name="importOrigin" value={form.importOrigin} onChange={set('importOrigin')}>
            {IMPORT_ORIGINS.map((o) => <option key={o} value={o}>{o}</option>)}
          </SelectField>
          <TextField label="Stock reference" name="stockRef" value={form.stockRef} onChange={set('stockRef')} />
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="font-display text-lg font-bold">Specification</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField label="Fuel type" name="fuelType" value={form.fuelType} onChange={set('fuelType')}>
            {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
          </SelectField>
          <SelectField label="Transmission" name="transmission" value={form.transmission} onChange={set('transmission')}>
            {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </SelectField>
          <SelectField label="Body type" name="bodyType" value={form.bodyType} onChange={set('bodyType')}>
            {BODY_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
          </SelectField>
          <TextField label="Engine size" name="engineSize" value={form.engineSize} onChange={set('engineSize')} placeholder="e.g. 1.8L" />
          <TextField label="Doors" name="doors" type="number" inputMode="numeric" value={form.doors} onChange={set('doors')} />
          <TextField label="Seats" name="seats" type="number" inputMode="numeric" value={form.seats} onChange={set('seats')} />
          <TextField label="Colour" name="colour" value={form.colour} onChange={set('colour')} />
          <TextField label="Previous owners" name="previousOwners" type="number" inputMode="numeric" value={form.previousOwners} onChange={set('previousOwners')} />
          <TextField label="NCT expiry" name="nctExpiry" type="date" value={form.nctExpiry} onChange={set('nctExpiry')} />
          <TextField label="Tax band" name="taxBand" value={form.taxBand} onChange={set('taxBand')} placeholder="e.g. €200/yr" />
          <SelectField label="Status" name="status" value={form.status} onChange={set('status')}>
            {VEHICLE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </SelectField>
        </div>
        <TextAreaField label="Description" name="description" value={form.description} onChange={set('description')} rows={6} placeholder="Sales description shown on the vehicle page…" />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {mode === 'edit' && (
            <button type="button" onClick={() => setConfirmArchive(true)} className="btn-outline border-red-400/40 text-red-300 hover:border-red-400">
              <Archive size={16} aria-hidden /> Mark as sold (archive)
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <Link to="/admin/vehicles" className="btn-ghost">Cancel</Link>
          <button type="submit" className="btn-primary" disabled={saving}>
            <Save size={16} aria-hidden /> {saving ? 'Saving…' : 'Save vehicle'}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmArchive}
        destructive
        title="Mark this vehicle as sold?"
        message="It will be removed from the public website but kept in your records. You can set it back to available at any time."
        confirmLabel="Mark as sold"
        onConfirm={doArchive}
        onCancel={() => setConfirmArchive(false)}
        busy={saving}
      />
    </form>
  );
}

function vehicleToForm(v: Vehicle): FormState {
  return {
    make: v.make, model: v.model, variant: v.variant, year: String(v.year),
    price: String(v.price), weeklyPrice: v.weeklyPrice != null ? String(v.weeklyPrice) : '',
    mileageKm: String(v.mileageKm), fuelType: v.fuelType, transmission: v.transmission,
    engineSize: v.engineSize, bodyType: v.bodyType, doors: String(v.doors), seats: String(v.seats),
    colour: v.colour, previousOwners: String(v.previousOwners), nctExpiry: v.nctExpiry ?? '',
    taxBand: v.taxBand, importOrigin: v.importOrigin, stockRef: v.stockRef,
    description: v.description, status: v.status, featured: v.featured,
  };
}

function formToInput(f: FormState, images: VehicleImage[], existingSlug?: string): VehicleInput {
  const year = Number(f.year);
  const base = {
    make: f.make.trim(), model: f.model.trim(), variant: f.variant.trim(), year,
    price: Number(f.price), weeklyPrice: f.weeklyPrice ? Number(f.weeklyPrice) : null,
    mileageKm: Number(f.mileageKm), fuelType: f.fuelType as VehicleInput['fuelType'],
    transmission: f.transmission as VehicleInput['transmission'],
    engineSize: f.engineSize.trim(), bodyType: f.bodyType as VehicleInput['bodyType'],
    doors: Number(f.doors), seats: Number(f.seats), colour: f.colour.trim(),
    previousOwners: Number(f.previousOwners), nctExpiry: f.nctExpiry || null,
    taxBand: f.taxBand.trim(), importOrigin: f.importOrigin as VehicleInput['importOrigin'],
    stockRef: f.stockRef.trim(), description: f.description.trim(),
    status: f.status as VehicleInput['status'], featured: f.featured,
    images: images.map((img, i) => ({ ...img, sortOrder: i })),
  };
  return {
    ...base,
    slug: existingSlug || vehicleSlug({ year, make: base.make, model: base.model, variant: base.variant, stockRef: base.stockRef }),
  };
}
