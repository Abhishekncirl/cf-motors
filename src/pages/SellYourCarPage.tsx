import { useState, type FormEvent } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Seo } from '../lib/seo';
import { PageHeader } from '../components/ui/PageHeader';
import { TextField, TextAreaField } from '../components/forms/Fields';
import { PhotoUpload } from '../components/forms/PhotoUpload';
import { submitEnquiry } from '../lib/enquiries';
import { uploadEnquiryPhoto } from '../lib/storage';
import { requiredText, validEmail, validPhone, isClean } from '../lib/validate';

export function SellYourCarPage() {
  const [form, setForm] = useState({
    reg: '',
    make: '',
    model: '',
    year: '',
    mileage: '',
    condition: '',
    name: '',
    email: '',
    phone: '',
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const next = {
      reg: requiredText(form.reg, 'registration'),
      make: requiredText(form.make, 'make'),
      model: requiredText(form.model, 'model'),
      name: requiredText(form.name, 'name'),
      email: validEmail(form.email),
      phone: validPhone(form.phone),
    };
    setErrors(next);
    return isClean(next);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('sending');
    try {
      const folder = `valuation-${Date.now()}`;
      const photoUrls = await Promise.all(photos.map((p) => uploadEnquiryPhoto(p, folder)));
      await submitEnquiry({
        type: 'valuation',
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.condition || 'Valuation request',
        payload: {
          reg: form.reg,
          make: form.make,
          model: form.model,
          year: form.year,
          mileage: form.mileage,
          condition: form.condition,
          photoUrls,
        },
      });
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <Seo
        title="Sell or Trade In Your Car"
        description="Get a fair valuation for your car from CF Motor Sales. Sell outright or trade in against one of our UK or Japanese imports. Quick, no-obligation quote."
        path="/sell-your-car"
      />
      <PageHeader
        eyebrow="Sell / Trade In"
        title="Sell or trade in your car"
        subtitle="Tell us about your car and send a few photos for a fair, no-obligation valuation. Sell outright or put it towards one of our imports."
      />

      <div className="container-page py-12">
        {status === 'sent' ? (
          <div className="card mx-auto max-w-2xl flex items-start gap-3 p-8">
            <CheckCircle2 className="mt-0.5 h-7 w-7 shrink-0 text-brand-cyan" aria-hidden />
            <div>
              <h2 className="font-display text-2xl font-bold">Valuation request received</h2>
              <p className="mt-2 text-brand-white/70">
                Thanks {form.name.split(' ')[0]} - we’ll review your details and photos and come
                back to you with a valuation, usually the same day.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="card mx-auto max-w-2xl space-y-5 p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Registration" name="reg" required value={form.reg} onChange={set('reg')} error={errors.reg} placeholder="e.g. 191-D-12345" />
              <TextField label="Year" name="year" type="number" inputMode="numeric" value={form.year} onChange={set('year')} placeholder="e.g. 2019" />
              <TextField label="Make" name="make" required value={form.make} onChange={set('make')} error={errors.make} />
              <TextField label="Model" name="model" required value={form.model} onChange={set('model')} error={errors.model} />
              <TextField label="Mileage (km)" name="mileage" type="number" inputMode="numeric" value={form.mileage} onChange={set('mileage')} />
            </div>

            <TextAreaField label="Condition notes" name="condition" value={form.condition} onChange={set('condition')} placeholder="Service history, any damage, NCT status, extras…" />

            <PhotoUpload files={photos} onChange={setPhotos} max={6} />

            <hr className="border-white/10" />

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Your name" name="name" required value={form.name} onChange={set('name')} error={errors.name} autoComplete="name" />
              <TextField label="Phone" name="phone" required type="tel" inputMode="tel" value={form.phone} onChange={set('phone')} error={errors.phone} autoComplete="tel" />
            </div>
            <TextField label="Email" name="email" required type="email" inputMode="email" value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" />

            {status === 'error' && (
              <p className="flex items-center gap-2 text-sm text-red-400" role="alert">
                <AlertCircle size={16} aria-hidden /> Something went wrong. Please try again or call us.
              </p>
            )}

            <button type="submit" className="btn-primary w-full sm:w-auto" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Request my valuation'}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
