import { useState, type FormEvent } from 'react';
import { CheckCircle2, AlertCircle, Search, Ship, ReceiptEuro, ClipboardCheck } from 'lucide-react';
import { Seo } from '../lib/seo';
import { PageHeader } from '../components/ui/PageHeader';
import { TextField, TextAreaField } from '../components/forms/Fields';
import { submitEnquiry } from '../lib/enquiries';
import { requiredText, validEmail, validPhone, isClean } from '../lib/validate';

const STEPS = [
  { icon: Search, title: 'We source it', body: 'Using trusted UK and Japanese auction and dealer networks, we find the exact make, model and spec you want - not just what happens to be in the country.' },
  { icon: Ship, title: 'We ship & clear it', body: 'We arrange transport and handle customs clearance into Ireland, keeping you updated at each stage.' },
  { icon: ReceiptEuro, title: 'We handle VRT', body: 'Vehicle Registration Tax is calculated and paid, and the car is registered on Irish plates - all done for you.' },
  { icon: ClipboardCheck, title: 'We prep & deliver', body: 'NCT, valet and any pre-delivery work is completed before you collect the keys or we deliver to your door.' },
];

export function ImportServicePage() {
  const [form, setForm] = useState({
    make: '', model: '', yearRange: '', budget: '', spec: '', timeframe: '',
    name: '', email: '', phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const next = {
      make: requiredText(form.make, 'make'),
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
      await submitEnquiry({
        type: 'sourcing',
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.spec || 'Car sourcing request',
        payload: {
          make: form.make, model: form.model, yearRange: form.yearRange,
          budget: form.budget, spec: form.spec, timeframe: form.timeframe,
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
        title="Import a Car to Order | UK & Japanese Sourcing"
        description="CF Motor Sales sources UK and Japanese cars to order for Irish buyers. We handle sourcing, shipping, VRT and NCT end to end. Tell us what you're looking for."
        path="/import-service"
      />
      <PageHeader
        eyebrow="Import service"
        title="Import a car, sourced to order"
        subtitle="Can’t find the exact car in Ireland? We’ll find it for you in the UK or Japan and handle everything from the auction to your driveway."
      />

      <section className="container-page py-12">
        <div className="grid gap-5 sm:grid-cols-2">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <div key={title} className="card p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-cyan/10 text-brand-cyan">
                  <Icon size={22} aria-hidden />
                </span>
                <span className="text-xs font-semibold text-brand-white/40">Step {i + 1}</span>
              </div>
              <h2 className="mt-4 font-display text-xl font-bold">{title}</h2>
              <p className="mt-2 text-sm text-brand-white/65">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <h2 className="font-display text-xl font-bold">Indicative timelines</h2>
            <ul className="mt-3 space-y-2 text-sm text-brand-white/70">
              <li>· UK imports: typically 1–3 weeks from purchase to Irish plates.</li>
              <li>· Japanese imports: typically 6–10 weeks including shipping.</li>
              <li>· Exact timing depends on availability, shipping schedules and VRT appointments - we’ll give you a realistic estimate up front.</li>
            </ul>
          </div>
          <div className="card p-6">
            <h2 className="font-display text-xl font-bold">What VRT means for you</h2>
            <p className="mt-3 text-sm text-brand-white/70">
              Vehicle Registration Tax is a once-off tax due when a car is registered
              in Ireland, based on the vehicle’s value and emissions. We calculate it
              in advance so your quoted price is the drive-away price - no surprises
              after you’ve committed.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-brand-grey py-12">
        <div className="container-page max-w-2xl">
          <h2 className="mb-2 font-display text-2xl font-bold">Tell us what you’re looking for</h2>
          <p className="mb-6 text-brand-white/60">The more detail you give, the closer we can match it.</p>

          {status === 'sent' ? (
            <div className="card flex items-start gap-3 p-8">
              <CheckCircle2 className="mt-0.5 h-7 w-7 shrink-0 text-brand-cyan" aria-hidden />
              <div>
                <h3 className="font-display text-xl font-bold">Request received</h3>
                <p className="mt-2 text-brand-white/70">
                  Thanks {form.name.split(' ')[0]} - we’ll start looking and come back to you with options and pricing.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="card space-y-5 p-6 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Make" name="make" required value={form.make} onChange={set('make')} error={errors.make} placeholder="e.g. Toyota" />
                <TextField label="Model" name="model" value={form.model} onChange={set('model')} placeholder="e.g. Alphard" />
                <TextField label="Year range" name="yearRange" value={form.yearRange} onChange={set('yearRange')} placeholder="e.g. 2018–2021" />
                <TextField label="Budget (€)" name="budget" inputMode="numeric" value={form.budget} onChange={set('budget')} placeholder="e.g. 25000" />
              </div>
              <TextAreaField label="Must-have spec" name="spec" value={form.spec} onChange={set('spec')} placeholder="Colour, trim, transmission, options you need…" />
              <TextField label="Timeframe" name="timeframe" value={form.timeframe} onChange={set('timeframe')} placeholder="e.g. within 2 months" />
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
                {status === 'sending' ? 'Sending…' : 'Send sourcing request'}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
