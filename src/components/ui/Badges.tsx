import type { ImportOrigin, VehicleStatus } from '../../lib/types';
import { importOriginLabel } from '../../config/options';

const ORIGIN_STYLE: Record<ImportOrigin, string> = {
  UK: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
  Japan: 'bg-red-500/10 text-red-700 border-red-500/30',
  Irish: 'bg-emerald-600/10 text-emerald-700 border-emerald-600/30',
};

export function ImportOriginBadge({ origin }: { origin: ImportOrigin }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${ORIGIN_STYLE[origin]}`}
    >
      {importOriginLabel(origin)}
    </span>
  );
}

const STATUS_STYLE: Record<VehicleStatus, string> = {
  available: 'bg-brand-cyan/15 text-teal border-brand-cyan/40',
  reserved: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
  sold: 'bg-black/5 text-ink/60 border-line',
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
