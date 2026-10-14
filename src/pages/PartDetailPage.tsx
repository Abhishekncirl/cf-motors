import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Phone, Package, Tag, ShieldCheck } from 'lucide-react';
import { Seo } from '../lib/seo';
import { getPartBySlug, getRelatedParts } from '../lib/parts';
import type { Part } from '../lib/types';
import { formatPrice } from '../lib/format';
import { whatsappLink, telLink } from '../config/business';
import { Gallery } from '../components/vehicle/Gallery';
import { PartCard } from '../components/part/PartCard';
import { WhatsAppIcon } from '../components/brand/WhatsAppIcon';
import { Spinner } from '../components/ui/Spinner';
import { NotFoundPage } from './NotFoundPage';

export function PartDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [part, setPart] = useState<Part | null>(null);
  const [related, setRelated] = useState<Part[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    let active = true;
    setState('loading');
    getPartBySlug(slug ?? '')
      .then((p) => {
        if (!active) return;
        if (!p) { setState('missing'); return; }
        setPart(p);
        setState('ready');
        getRelatedParts(p).then((r) => active && setRelated(r)).catch(() => {});
      })
      .catch(() => active && setState('missing'));
    return () => { active = false; };
  }, [slug]);

  if (state === 'loading') return <Spinner label="Loading part" />;
  if (state === 'missing' || !part) return <NotFoundPage />;

  const wa = `Hi CF Motor Sales, I'm interested in the part: ${part.name}${part.sku ? ` (SKU ${part.sku})` : ''}. Is it available?`;
  const specs: [string, string][] = [
    ['Category', part.category],
    ['Brand', part.brand || '—'],
    ['Condition', part.condition],
    ['SKU / part no.', part.sku || '—'],
    ['Availability', part.status === 'available' ? (part.stockQty > 0 ? `${part.stockQty} in stock` : 'In stock') : 'Unavailable'],
  ];

  return (
    <>
      <Seo
        title={`${part.name} | Car Parts`}
        description={`${part.name}${part.brand ? ` by ${part.brand}` : ''} - ${part.category}. ${formatPrice(part.price)} at CF Motor Sales.`}
        path={`/parts/${part.slug}`}
        image={part.images.find((i) => i.isPrimary)?.url || part.images[0]?.url}
      />

      <div className="container-page py-6">
        <Link to="/parts" className="btn-ghost mb-4 px-0 text-sm">
          <ChevronLeft size={16} aria-hidden /> Back to car parts
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          {/* Gallery */}
          <div className="min-w-0">
            <Gallery images={part.images} alt={part.name} />
          </div>

          {/* Buy box */}
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-cyan/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-teal">
              <Tag size={12} aria-hidden /> {part.category}
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{part.name}</h1>
            {(part.brand || part.condition) && (
              <p className="mt-1 text-ink/60">{[part.brand, part.condition].filter(Boolean).join(' · ')}</p>
            )}

            <p className="mt-4 font-display text-4xl font-bold text-teal">{formatPrice(part.price)}</p>

            <p className="mt-2 inline-flex items-center gap-2 text-sm text-ink/70">
              <Package size={16} className="text-teal" aria-hidden />
              {part.status === 'available'
                ? (part.stockQty > 0 ? `${part.stockQty} in stock` : 'In stock')
                : 'Currently unavailable'}
              {part.sku && <span className="text-ink/40">· SKU {part.sku}</span>}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <a href={whatsappLink(wa)} target="_blank" rel="noopener noreferrer" className="btn-primary col-span-2 justify-center">
                <WhatsAppIcon className="h-4 w-4" /> Enquire on WhatsApp
              </a>
              <a href={telLink()} className="btn-outline justify-center">
                <Phone size={16} aria-hidden /> Call
              </a>
              <Link to="/contact" className="btn-outline justify-center">Contact us</Link>
            </div>

            <div className="mt-6 card p-5 text-sm text-ink/70">
              <p className="flex items-center gap-2 font-semibold text-ink">
                <ShieldCheck size={16} className="text-teal" aria-hidden /> Collection &amp; fitting
              </p>
              <p className="mt-1">
                Collect in-store or ask about delivery. Not sure it fits your car? Send us your reg and we’ll confirm.
              </p>
            </div>

            {/* Key details */}
            <dl className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-black/5 sm:grid-cols-2">
              {specs.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4 bg-white px-4 py-3">
                  <dt className="text-sm text-ink/55">{k}</dt>
                  <dd className="text-right text-sm font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {part.description && (
          <section className="mt-10">
            <h2 className="mb-3 font-display text-2xl font-bold">Description</h2>
            <p className="max-w-3xl whitespace-pre-line text-ink/75">{part.description}</p>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-6 font-display text-2xl font-bold">You might also need</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => <PartCard key={p.id} part={p} />)}
            </div>
          </section>
        )}
      </div>

      {/* Sticky mobile action bar */}
      <div className="sticky bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur lg:hidden">
        <div className="container-page grid grid-cols-2 gap-2 py-3">
          <a href={telLink()} className="btn-outline justify-center py-2 text-xs">
            <Phone size={16} aria-hidden /> Call
          </a>
          <a href={whatsappLink(wa)} target="_blank" rel="noopener noreferrer" className="btn-primary justify-center py-2 text-xs">
            <WhatsAppIcon className="h-4 w-4" /> Enquire
          </a>
        </div>
      </div>
    </>
  );
}
