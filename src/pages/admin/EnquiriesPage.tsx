import { useEffect, useMemo, useState } from 'react';
import { Mail, Phone, Check, Dot } from 'lucide-react';
import { listEnquiries, setEnquiryFlags } from '../../lib/enquiries';
import type { Enquiry, EnquiryType } from '../../lib/types';
import { Spinner } from '../../components/ui/Spinner';

const TYPES: (EnquiryType | 'all')[] = ['all', 'general', 'vehicle', 'valuation', 'sourcing', 'finance'];

export function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[] | null>(null);
  const [filter, setFilter] = useState<EnquiryType | 'all'>('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const reload = () => listEnquiries().then(setEnquiries).catch(() => setEnquiries([]));
  useEffect(() => {
    reload();
  }, []);

  const filtered = useMemo(
    () =>
      (enquiries ?? []).filter(
        (e) => (filter === 'all' || e.type === filter) && (!unreadOnly || !e.isRead)
      ),
    [enquiries, filter, unreadOnly]
  );

  const toggle = async (e: Enquiry, flag: 'isRead' | 'isActioned') => {
    await setEnquiryFlags(e.id, { [flag]: !e[flag] });
    reload();
  };

  const openEnquiry = async (e: Enquiry) => {
    setSelected(selected === e.id ? null : e.id);
    if (!e.isRead) await setEnquiryFlags(e.id, { isRead: true }).then(reload);
  };

  if (!enquiries) return <Spinner label="Loading enquiries" />;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Enquiries</h1>

      <div className="flex flex-wrap items-center gap-2">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            aria-pressed={filter === t}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
              filter === t ? 'bg-brand-cyan text-brand-black' : 'border border-white/15 text-brand-white/70 hover:border-brand-cyan'
            }`}
          >
            {t}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm text-brand-white/70">
          <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} className="accent-brand-cyan" />
          Unread only
        </label>
      </div>

      <div className="space-y-3">
        {filtered.map((e) => (
          <div key={e.id} className={`card overflow-hidden ${!e.isRead ? 'border-brand-cyan/40' : ''}`}>
            <button
              onClick={() => openEnquiry(e)}
              className="flex w-full items-center justify-between gap-3 p-4 text-left"
              aria-expanded={selected === e.id}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {!e.isRead && <Dot className="text-brand-cyan" aria-label="Unread" />}
                  <span className="font-semibold">{e.name}</span>
                  <span className="rounded bg-white/10 px-2 py-0.5 text-[0.65rem] uppercase text-brand-white/60">{e.type}</span>
                  {e.isActioned && <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[0.65rem] uppercase text-emerald-300">Actioned</span>}
                </div>
                <p className="mt-1 truncate text-sm text-brand-white/55">{e.message}</p>
              </div>
              <span className="shrink-0 text-xs text-brand-white/40">
                {new Date(e.createdAt).toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })}
              </span>
            </button>

            {selected === e.id && (
              <div className="border-t border-white/10 bg-brand-black/40 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <a href={`mailto:${e.email}`} className="flex items-center gap-2 text-sm hover:text-brand-cyan">
                    <Mail size={15} aria-hidden /> {e.email}
                  </a>
                  <a href={`tel:${e.phone}`} className="flex items-center gap-2 text-sm hover:text-brand-cyan">
                    <Phone size={15} aria-hidden /> {e.phone}
                  </a>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm text-brand-white/75">{e.message}</p>

                {Object.keys(e.payload).length > 0 && (
                  <dl className="mt-3 grid gap-x-6 gap-y-1 rounded-lg bg-brand-grey p-3 text-xs sm:grid-cols-2">
                    {Object.entries(e.payload)
                      .filter(([, v]) => v !== '' && !(Array.isArray(v) && v.length === 0))
                      .map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-3">
                          <dt className="text-brand-white/45">{k}</dt>
                          <dd className="text-right font-medium text-brand-white/80">{renderVal(v)}</dd>
                        </div>
                      ))}
                  </dl>
                )}

                <div className="mt-4 flex gap-2">
                  <button onClick={() => toggle(e, 'isActioned')} className={`btn ${e.isActioned ? 'btn-outline' : 'btn-primary'} px-3 py-1.5 text-xs`}>
                    <Check size={14} aria-hidden /> {e.isActioned ? 'Mark not actioned' : 'Mark actioned'}
                  </button>
                  <button onClick={() => toggle(e, 'isRead')} className="btn-ghost px-3 py-1.5 text-xs">
                    Mark {e.isRead ? 'unread' : 'read'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-brand-white/50">No enquiries match this filter.</p>}
      </div>
    </div>
  );
}

function renderVal(v: unknown): string {
  if (Array.isArray(v)) return `${v.length} item(s)`;
  return String(v);
}
