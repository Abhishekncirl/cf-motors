import { Loader2 } from 'lucide-react';

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-ink/60">
      <Loader2 className="h-5 w-5 animate-spin text-teal" aria-hidden />
      <span className="text-sm">{label}…</span>
      <span className="sr-only">{label}</span>
    </div>
  );
}
