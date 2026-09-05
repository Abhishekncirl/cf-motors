import { AlertTriangle } from 'lucide-react';

/** Confirmation dialog for destructive/irreversible admin actions. */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  destructive,
  onConfirm,
  onCancel,
  busy,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} aria-hidden />
      <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-brand-grey p-6 shadow-card-hover">
        <div className="flex items-start gap-3">
          {destructive && (
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-400">
              <AlertTriangle size={18} aria-hidden />
            </span>
          )}
          <div>
            <h2 className="font-display text-lg font-bold">{title}</h2>
            <p className="mt-1 text-sm text-brand-white/70">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="btn-outline" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`btn ${destructive ? 'bg-red-500 text-white hover:bg-red-500/85' : 'btn-primary'}`}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
