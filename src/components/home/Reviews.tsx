import { Star } from 'lucide-react';
import reviewsData from '../../data/reviews.json';
import type { Review } from '../../lib/types';

/**
 * Reads from a local JSON file for now. The `Review` shape mirrors what the
 * Google Places API returns (author, rating, text, time), so swapping to live
 * Google Reviews later is a data-source change only - this component is unchanged.
 */
const reviews = reviewsData as Review[];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          aria-hidden
          className={i < rating ? 'fill-brand-cyan text-brand-cyan' : 'text-white/20'}
        />
      ))}
    </div>
  );
}

export function Reviews() {
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <section className="border-y border-white/10 bg-brand-grey py-16">
      <div className="container-page">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="section-eyebrow mb-2">What our customers say</p>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Google Reviews</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display text-3xl font-bold text-brand-cyan">{avg.toFixed(1)}</span>
            <div>
              <Stars rating={Math.round(avg)} />
              <p className="text-xs text-brand-white/50">{reviews.length} reviews</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r, i) => (
            <figure key={i} className="card flex flex-col p-6">
              <Stars rating={r.rating} />
              <blockquote className="mt-3 flex-1 text-sm text-brand-white/75">“{r.text}”</blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-brand-white">
                {r.author}
                <span className="ml-2 font-normal text-brand-white/40">
                  {new Date(r.date).toLocaleDateString('en-IE', { month: 'short', year: 'numeric' })}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
