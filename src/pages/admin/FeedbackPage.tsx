import { useEffect, useMemo, useState } from 'react';
import { Check, EyeOff, Trash2, Star } from 'lucide-react';
import {
  listAllFeedback,
  setFeedbackApproval,
  deleteFeedback,
} from '../../lib/feedback';
import type { Feedback } from '../../lib/types';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

type Filter = 'pending' | 'published' | 'all';
const FILTERS: Filter[] = ['pending', 'published', 'all'];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={15}
          aria-hidden
          className={i < rating ? 'fill-brand-cyan text-teal' : 'text-ink/15'}
        />
      ))}
    </div>
  );
}

export function AdminFeedbackPage() {
  const [items, setItems] = useState<Feedback[] | null>(null);
  const [filter, setFilter] = useState<Filter>('pending');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Feedback | null>(null);
  const [deleting, setDeleting] = useState(false);

  const reload = () => listAllFeedback().then(setItems).catch(() => setItems([]));
  useEffect(() => {
    reload();
  }, []);

  const pendingCount = useMemo(() => (items ?? []).filter((r) => !r.approved).length, [items]);

  const filtered = useMemo(
    () =>
      (items ?? []).filter((r) =>
        filter === 'all' ? true : filter === 'pending' ? !r.approved : r.approved
      ),
    [items, filter]
  );

  const toggle = async (r: Feedback) => {
    setBusyId(r.id);
    try {
      await setFeedbackApproval(r.id, !r.approved);
      await reload();
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteFeedback(toDelete.id);
      setToDelete(null);
      await reload();
    } finally {
      setDeleting(false);
    }
  };

  if (!items) return <Spinner label="Loading reviews" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold">Customer reviews</h1>
        {pendingCount > 0 && (
          <span className="rounded-full bg-brand-cyan/15 px-3 py-1 text-sm font-semibold text-teal">
            {pendingCount} awaiting review
          </span>
        )}
      </div>

      <p className="text-sm text-ink/55">
        Reviews customers submit appear here first. Approve the ones you want shown on the public
        Reviews page, or delete anything spam or inappropriate.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
              filter === f
                ? 'bg-brand-cyan text-brand-black'
                : 'border border-line text-ink/70 hover:border-brand-cyan'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((r) => (
          <div
            key={r.id}
            className={`card p-4 ${!r.approved ? 'border-brand-cyan/40' : ''}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Stars rating={r.rating} />
                  <span className="font-semibold">{r.author}</span>
                  {r.subject && (
                    <span className="rounded bg-black/5 px-2 py-0.5 text-[0.65rem] text-ink/60">
                      {r.subject}
                    </span>
                  )}
                  <span
                    className={`rounded px-2 py-0.5 text-[0.65rem] font-semibold uppercase ${
                      r.approved
                        ? 'bg-emerald-500/15 text-emerald-600'
                        : 'bg-amber-500/15 text-amber-600'
                    }`}
                  >
                    {r.approved ? 'Published' : 'Pending'}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm text-ink/75">{r.message}</p>
                <p className="mt-2 text-xs text-ink/40">
                  {new Date(r.createdAt).toLocaleDateString('en-IE', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
              <button
                onClick={() => toggle(r)}
                disabled={busyId === r.id}
                className={`btn px-3 py-1.5 text-xs ${r.approved ? 'btn-outline' : 'btn-primary'}`}
              >
                {r.approved ? (
                  <>
                    <EyeOff size={14} aria-hidden /> Hide from site
                  </>
                ) : (
                  <>
                    <Check size={14} aria-hidden /> Approve &amp; publish
                  </>
                )}
              </button>
              <button
                onClick={() => setToDelete(r)}
                className="btn ml-auto border border-red-400/40 px-3 py-1.5 text-xs text-red-500 hover:border-red-400 hover:text-red-600"
              >
                <Trash2 size={14} aria-hidden /> Delete
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-ink/50">No reviews in this view.</p>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        destructive
        title="Delete this review?"
        message="This permanently removes the review. This can’t be undone."
        confirmLabel="Delete review"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
        busy={deleting}
      />
    </div>
  );
}
