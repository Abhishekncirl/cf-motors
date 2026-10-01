import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Save, CheckCircle2, ImagePlus, Trash2, Loader2 } from 'lucide-react';
import { getSiteSettings, saveSiteSettings } from '../../lib/settings';
import type { SiteSettings, ForecourtPhoto } from '../../lib/types';
import { uploadForecourtPhoto, deleteStorageObject } from '../../lib/storage';
import { TextField } from '../../components/forms/Fields';
import { Spinner } from '../../components/ui/Spinner';

export function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getSiteSettings().then(setSettings);
  }, []);

  if (!settings) return <Spinner label="Loading settings" />;

  const patch = (p: Partial<SiteSettings>) => setSettings((s) => (s ? { ...s, ...p } : s));

  /**
   * Upload forecourt photos. Each is compressed (<=300 KB) and the live
   * settings doc is saved immediately, so Storage and Firestore stay in sync.
   */
  const onPickPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setPhotoBusy(true);
    setPhotoError('');
    try {
      const added: ForecourtPhoto[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        added.push(await uploadForecourtPhoto(file));
      }
      const next = [...settings.forecourtPhotos, ...added];
      setSettings((s) => (s ? { ...s, forecourtPhotos: next } : s));
      await saveSiteSettings({ forecourtPhotos: next });
    } catch {
      setPhotoError('Upload failed. Please try again.');
    } finally {
      setPhotoBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  /** Remove a forecourt photo AND delete the file from Storage to free space. */
  const onDeletePhoto = async (photo: ForecourtPhoto) => {
    setPhotoBusy(true);
    setPhotoError('');
    try {
      await deleteStorageObject(photo.storagePath);
      const next = settings.forecourtPhotos.filter((p) => p.storagePath !== photo.storagePath);
      setSettings((s) => (s ? { ...s, forecourtPhotos: next } : s));
      await saveSiteSettings({ forecourtPhotos: next });
    } catch {
      setPhotoError('Could not delete the photo. Please try again.');
    } finally {
      setPhotoBusy(false);
    }
  };
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
      <p className="-mt-4 text-ink/55">
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
          <TextField label="Postcode / Eircode" name="eircode" value={settings.eircode} onChange={(v) => patch({ eircode: v })} />
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="font-display text-lg font-bold">Social &amp; hero</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Facebook URL" name="facebookUrl" value={settings.facebookUrl} onChange={(v) => patch({ facebookUrl: v })} />
          <TextField label="TikTok URL" name="tiktokUrl" value={settings.tiktokUrl} onChange={(v) => patch({ tiktokUrl: v })} />
          <TextField label="Instagram URL" name="instagramUrl" value={settings.instagramUrl} onChange={(v) => patch({ instagramUrl: v })} />
        </div>
        <TextField label="Homepage hero image URL" name="heroImageUrl" value={settings.heroImageUrl} onChange={(v) => patch({ heroImageUrl: v })} hint="Paste a public image URL (e.g. from a vehicle photo) to use as the homepage banner." />
      </section>

      {/* Forecourt photos - shown on the About page. Upload/delete save instantly
          and deleting also removes the file from Firebase Storage. */}
      <section className="card space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold">Forecourt photos</h2>
            <p className="text-sm text-ink/55">Shown on the About page. Each photo is compressed to under 300&nbsp;KB.</p>
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={photoBusy}
            className="btn-primary shrink-0 disabled:opacity-60"
          >
            {photoBusy ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <ImagePlus size={16} aria-hidden />}
            {photoBusy ? 'Working…' : 'Upload photos'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => void onPickPhotos(e.target.files)}
          />
        </div>

        {photoError && <p className="field-error">{photoError}</p>}

        {settings.forecourtPhotos.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line bg-page p-6 text-center text-sm text-ink/45">
            No forecourt photos yet. Upload a few to showcase your premises on the About page.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {settings.forecourtPhotos.map((photo) => (
              <div key={photo.storagePath} className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-page">
                <img src={photo.url} alt="Forecourt" className="h-full w-full object-cover" loading="lazy" />
                <button
                  type="button"
                  onClick={() => void onDeletePhoto(photo)}
                  disabled={photoBusy}
                  aria-label="Delete photo"
                  className="absolute right-2 top-2 rounded-md bg-white/90 p-1.5 text-red-600 shadow-sm ring-1 ring-black/5 hover:bg-white disabled:opacity-60"
                >
                  <Trash2 size={15} aria-hidden />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="font-display text-lg font-bold">Opening hours</h2>
        <div className="space-y-3">
          {settings.openingHours.map((o, i) => (
            <div key={o.day} className="grid grid-cols-[110px_1fr] items-center gap-3">
              <span className="text-sm font-semibold text-ink/70">{o.day}</span>
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
          <span className="flex items-center gap-1.5 text-sm text-teal">
            <CheckCircle2 size={16} aria-hidden /> Saved
          </span>
        )}
      </div>
    </form>
  );
}
