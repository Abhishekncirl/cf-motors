import { useEffect, useState, type FormEvent } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import { getSiteSettings, saveSiteSettings } from '../../lib/settings';
import type { SiteSettings } from '../../lib/types';
import { TextField } from '../../components/forms/Fields';
import { Spinner } from '../../components/ui/Spinner';

export function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSiteSettings().then(setSettings);
  }, []);

  if (!settings) return <Spinner label="Loading settings" />;

  const patch = (p: Partial<SiteSettings>) => setSettings((s) => (s ? { ...s, ...p } : s));
  const setHour = (i: number, hours: string) =>
    patch({ openingHours: settings.openingHours.map((o, idx) => (idx === i ? { ...o, hours } : o)) });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await saveSiteSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-8">
      <h1 className="font-display text-3xl font-bold">Site settings</h1>
      <p className="-mt-4 text-brand-white/55">
        These update the live site instantly - no developer or redeploy needed.
      </p>

      <section className="card space-y-4 p-6">
        <h2 className="font-display text-lg font-bold">Contact</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Phone (display)" name="phoneDisplay" value={settings.phoneDisplay} onChange={(v) => patch({ phoneDisplay: v })} />
          <TextField label="Phone (dial, +353…)" name="phoneTel" value={settings.phoneTel} onChange={(v) => patch({ phoneTel: v })} />
          <TextField label="WhatsApp (353…)" name="whatsapp" value={settings.whatsapp} onChange={(v) => patch({ whatsapp: v })} hint="Digits only, no + or spaces" />
          <TextField label="Email" name="email" type="email" value={settings.email} onChange={(v) => patch({ email: v })} />
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="font-display text-lg font-bold">Address</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Address line 1" name="addressLine1" value={settings.addressLine1} onChange={(v) => patch({ addressLine1: v })} />
          <TextField label="Town / County" name="addressLine2" value={settings.addressLine2} onChange={(v) => patch({ addressLine2: v })} />
          <TextField label="Eircode" name="eircode" value={settings.eircode} onChange={(v) => patch({ eircode: v })} />
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="font-display text-lg font-bold">Social &amp; hero</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Facebook URL" name="facebookUrl" value={settings.facebookUrl} onChange={(v) => patch({ facebookUrl: v })} />
          <TextField label="TikTok URL" name="tiktokUrl" value={settings.tiktokUrl} onChange={(v) => patch({ tiktokUrl: v })} />
        </div>
        <TextField label="Homepage hero image URL" name="heroImageUrl" value={settings.heroImageUrl} onChange={(v) => patch({ heroImageUrl: v })} hint="Paste a public image URL (e.g. from a vehicle photo) to use as the homepage banner." />
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="font-display text-lg font-bold">Opening hours</h2>
        <div className="space-y-3">
          {settings.openingHours.map((o, i) => (
            <div key={o.day} className="grid grid-cols-[110px_1fr] items-center gap-3">
              <span className="text-sm font-semibold text-brand-white/70">{o.day}</span>
              <input value={o.hours} onChange={(e) => setHour(i, e.target.value)} className="field-input" aria-label={`Hours for ${o.day}`} />
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button type="submit" className="btn-primary" disabled={saving}>
          <Save size={16} aria-hidden /> {saving ? 'Saving…' : 'Save settings'}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-brand-cyan">
            <CheckCircle2 size={16} aria-hidden /> Saved
          </span>
        )}
      </div>
    </form>
  );
}
