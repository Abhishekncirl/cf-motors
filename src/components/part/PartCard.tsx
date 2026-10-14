import { Tag, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Part } from '../../lib/types';
import { formatPrice } from '../../lib/format';
import { whatsappLink, telLink } from '../../config/business';
import { WhatsAppIcon } from '../brand/WhatsAppIcon';

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23EEF1F4'/%3E%3Ctext x='50%25' y='50%25' fill='%230E8C87' font-family='sans-serif' font-size='16' text-anchor='middle' dominant-baseline='middle'%3ECF Motor Sales%3C/text%3E%3C/svg%3E";

export function PartCard({ part }: { part: Part }) {
  const primary = part.images.find((i) => i.isPrimary) ?? part.images[0];
  const detailUrl = `/parts/${part.slug}`;
  const wa = `Hi CF Motor Sales, I'm interested in the part: ${part.name}${part.sku ? ` (SKU ${part.sku})` : ''}. Is it available?`;

  return (
    <article className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-card-hover">
      <Link to={detailUrl} className="relative block aspect-[4/3] overflow-hidden bg-page">
        <img
          src={primary?.url || PLACEHOLDER}
          alt={part.name}
          width={400}
          height={300}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-cyan/90 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-brand-black">
            <Tag size={12} aria-hidden /> {part.category}
          </span>
        </div>
        {part.status !== 'available' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="rounded bg-brand-cyan px-3 py-1 text-sm font-bold uppercase tracking-wide text-brand-black">
              {part.status === 'sold' ? 'Sold' : 'Unavailable'}
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg font-bold leading-tight">
          <Link to={detailUrl} className="hover:text-teal">{part.name}</Link>
        </h3>
        <p className="mt-0.5 text-sm text-ink/60">
          {[part.brand, part.condition].filter(Boolean).join(' · ') || 'Car part'}
        </p>
        {part.description && (
          <p className="mt-2 line-clamp-2 text-sm text-ink/55">{part.description}</p>
        )}

        <div className="mt-3 flex items-center gap-2 text-xs text-ink/60">
          <Package size={14} className="text-teal" aria-hidden />
          {part.stockQty > 0 ? `${part.stockQty} in stock` : 'In stock'}
          {part.sku && <span className="text-ink/35">· SKU {part.sku}</span>}
        </div>

        <div className="mt-auto pt-4">
          <p className="font-display text-2xl font-bold text-teal">{formatPrice(part.price)}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link to={detailUrl} className="btn-primary col-span-2 justify-center py-2 text-xs">View details</Link>
            <a
              href={whatsappLink(wa)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline justify-center py-2 text-xs"
            >
              <WhatsAppIcon className="h-4 w-4" /> Enquire
            </a>
            <a href={telLink()} className="btn-outline justify-center py-2 text-xs">Call</a>
          </div>
        </div>
      </div>
    </article>
  );
}
