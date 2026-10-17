import { useEffect, useState } from 'react';
import { Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import reviewsData from '../../data/reviews.json';
import type { Review } from '../../lib/types';
import { listApprovedFeedback } from '../../lib/feedback';

/**
 * Shows live customer reviews (approved in admin). Until any reviews are
 * approved it falls back to the seed testimonials in reviews.json, so the
 * section is never empty. The card layout is shared between both sources.
 */
const seed = reviewsData as Review[];

interface DisplayReview {
  author: string;
  rating: number;
  text: string;
  date: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          aria-hidden
          className={i < rating ? 'fill-brand-cyan text-teal' : 'text-white/20'}
        />
      ))}
    </div>
  );
}

export function Reviews() {
  const [reviews, setReviews] = useState<DisplayReview[]>(
    seed.map((r) => ({ author: r.author, rating: r.rating, text: r.text, date: r.date }))
  );

  useEffect(() => {
    let active = true;
    listApprovedFeedback()
      .then((live) => {
        if (!active || live.length === 0) return;
        setReviews(
          live.slice(0, 6).map((r) => ({
            author: r.author,
            rating: r.rating,
            text: r.message,
            date: new Date(r.createdAt).toISOString(),
          }))
        );
      })
      .catch(() => {
        /* keep seed reviews */
      });
    return () => {
      active = false;
    };
  }, []);

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <section className="bg-night py-16 text-white">
      <div className="container-page">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-cyan">What our customers say</p>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Customer Reviews</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display text-3xl font-bold text-brand-cyan">{avg.toFixed(1)}</span>
            <div>
              <Stars rating={Math.round(avg)} />
              <p className="text-xs text-white/50">{reviews.length} reviews</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r, i) => (
            <figure key={i} className="flex flex-col rounded-xl border border-white/10 bg-nightcard p-6">
              <Stars rating={r.rating} />
              <blockquote className="mt-3 flex-1 text-sm text-white/75">“{r.text}”</blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-white">
                {r.author}
                <span className="ml-2 font-normal text-white/40">
                  {new Date(r.date).toLocaleDateString('en-IE', { month: 'short', year: 'numeric' })}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link to="/reviews" className="btn-primary">
            Read all reviews
          </Link>
          <Link to="/reviews" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-cyan hover:underline">
            Leave your own review <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
