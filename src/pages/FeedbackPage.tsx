import { useEffect, useState } from 'react';
import { MessageSquareQuote } from 'lucide-react';
import { Seo } from '../lib/seo';
import { PageHeader } from '../components/ui/PageHeader';
import { Spinner } from '../components/ui/Spinner';
import { Stars } from '../components/feedback/Stars';
import { FeedbackForm } from '../components/feedback/FeedbackForm';
import { listApprovedFeedback, invalidateFeedbackCache } from '../lib/feedback';
import { isFirebaseConfigured } from '../lib/firebase';
import type { Feedback } from '../lib/types';

export function FeedbackPage() {
  const [reviews, setReviews] = useState<Feedback[] | null>(null);

  const load = () =>
    listApprovedFeedback()
      .then(setReviews)
      .catch(() => setReviews([]));

  useEffect(() => {
    load();
  }, []);

  const count = reviews?.length ?? 0;
  const avg = count ? reviews!.reduce((s, r) => s + r.rating, 0) / count : 0;

  return (
    <>
      <Seo
        title="Customer Reviews | CF Motor Sales"
        description="Read genuine customer reviews of CF Motor Sales, and leave your own feedback about buying, selling or sourcing a car or part with us."
        path="/reviews"
      />
      <PageHeader
        eyebrow="Reviews"
        title="What our customers say"
        subtitle="Real feedback from people who’ve bought, sold or sourced with CF Motor Sales. Share yours below."
      >
        {count > 0 && (
          <div className="flex items-center gap-3">
            <span className="font-display text-4xl font-bold text-teal">{avg.toFixed(1)}</span>
            <div>
              <Stars rating={Math.round(avg)} size={18} />
              <p className="mt-0.5 text-sm text-ink/55">
                Based on {count} review{count > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
      </PageHeader>

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_380px]">
        {/* Reviews list */}
        <section className="min-w-0 order-2 lg:order-1">
          {!isFirebaseConfigured ? (
            <div className="card border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-700">
              Reviews can’t load because the backend isn’t configured yet.
            </div>
          ) : reviews === null ? (
            <Spinner label="Loading reviews" />
          ) : reviews.length === 0 ? (
            <div className="card flex flex-col items-center gap-4 p-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-cyan/10 text-teal">
                <MessageSquareQuote size={26} aria-hidden />
              </span>
              <h2 className="font-display text-2xl font-bold">No reviews yet</h2>
              <p className="max-w-md text-ink/65">
                Be the first to share your experience with CF Motor Sales.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {reviews.map((r) => (
                <figure key={r.id} className="card flex flex-col p-6">
                  <Stars rating={r.rating} />
                  <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink/75">
                    “{r.message}”
                  </blockquote>
                  <figcaption className="mt-4 border-t border-line pt-3 text-sm">
                    <span className="font-semibold text-ink">{r.author}</span>
                    {r.subject && <span className="block text-xs text-ink/50">{r.subject}</span>}
                    <span className="mt-0.5 block text-xs text-ink/40">
                      {new Date(r.createdAt).toLocaleDateString('en-IE', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </section>

        {/* Submit form */}
        <aside className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-20">
            <FeedbackForm
              onSubmitted={() => {
                // Refresh after the moderation delay won't show it immediately,
                // but clear the cache so an admin preview reflects changes.
                invalidateFeedbackCache();
              }}
            />
          </div>
        </aside>
      </div>
    </>
  );
}
