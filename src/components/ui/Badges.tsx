import type { ImportOrigin, VehicleStatus } from '../../lib/types';

const ORIGIN_STYLE: Record<ImportOrigin, string> = {
  UK: 'bg-blue-500/15 text-blue-300 border-blue-400/30',
  Japan: 'bg-red-500/15 text-red-300 border-red-400/30',
  Irish: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
};

export function ImportOriginBadge({ origin }: { origin: ImportOrigin }) {
  const label = origin === 'Irish' ? 'Irish' : `${origin} Import`;
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${ORIGIN_STYLE[origin]}`}
    >
      {label}
    </span>
  );
}

const STATUS_STYLE: Record<VehicleStatus, string> = {
  available: 'bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30',
  reserved: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  sold: 'bg-white/10 text-white/60 border-white/20',
};

export function StatusBadge({ status }: { status: VehicleStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${STATUS_STYLE[status]}`}
    >
      {status}
    </span>
  );
}
