import { Link } from 'react-router-dom';
import { QUICK_FILTERS } from '../../config/options';

/** Quick-filter chips that link to prefiltered /stock URLs. */
export function QuickFilters() {
  return (
    <div className="container-page -mt-6 pb-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold uppercase tracking-widest text-brand-white/50">
          Popular:
        </span>
        {QUICK_FILTERS.map((f) => {
          const params = new URLSearchParams(f.params).toString();
          return (
            <Link key={f.label} to={`/stock?${params}`} className="chip">
              {f.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
