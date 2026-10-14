import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SlidersHorizontal, X, Package } from 'lucide-react';
import { Seo } from '../lib/seo';
import { queryParts, type PartFilters, type PartSort, type PartQueryResult } from '../lib/parts';
import { PartCard } from '../components/part/PartCard';
import { Spinner } from '../components/ui/Spinner';
import { isFirebaseConfigured } from '../lib/firebase';
import { PART_CATEGORIES, PART_CONDITIONS } from '../config/options';

const PAGE_SIZE = 12;
const EMPTY: PartFilters = {};

export function CarPartsPage() {
  const [filters, setFilters] = useState<PartFilters>(EMPTY);
  const [sort, setSort] = useState<PartSort>('newest');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PartQueryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    queryParts(filters, sort, page, PAGE_SIZE)
      .then((r) => active && setResult(r))
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [filters, sort, page]);

  const patch = (p: Partial<PartFilters>) => { setFilters((f) => ({ ...f, ...p })); setPage(1); };
  const reset = () => { setFilters(EMPTY); setPage(1); };
  const activeCount = useMemo(
    () => Object.values(filters).filter((v) => v !== undefined && v !== '' && v !== null).length,
    [filters]
  );

  const sidebar = (
    <PartFilterSidebar filters={filters} onChange={patch} onReset={reset} />
  );

  return (
    <>
      <Seo
        title="Car Parts for Sale | CF Motor Sales"
        description="Browse car parts for sale at CF Motor Sales - engine oil, filters, brakes, lights, dashboard and transmission components, and more."
        path="/parts"
      />

      <div className="border-b border-line bg-white">
        <div className="container-page py-8">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Car Parts</h1>
          <p className="mt-2 text-ink/60">
            Quality new and used car parts - engine oil, filters, brakes, lights and more.
            Can’t see what you need? <Link to="/contact" className="text-teal underline">Ask us.</Link>
          </p>
        </div>
      </div>

      <div className="container-page grid gap-8 py-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-20 card p-5">{sidebar}</div>
        </aside>

        <section className="min-w-0">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setMobileFiltersOpen(true)} className="btn-outline lg:hidden">
                <SlidersHorizontal size={16} aria-hidden /> Filters
                {activeCount > 0 && (
                  <span className="ml-1 rounded-full bg-brand-cyan px-1.5 text-xs text-brand-black">{activeCount}</span>
                )}
              </button>
              <p className="text-sm text-ink/60" aria-live="polite">
                {loading ? 'Searching…' : `${result?.total ?? 0} ${result?.total === 1 ? 'part' : 'parts'} found`}
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink/60">
              <span className="hidden sm:inline">Sort</span>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value as PartSort); setPage(1); }}
                className="field-input w-auto py-2 text-sm"
              >
                <option value="newest">Newest listed</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </label>
          </div>

          {!isFirebaseConfigured && (
            <div className="card mb-6 border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-700">
              Firebase isn’t configured yet, so parts can’t load.
            </div>
          )}

          {loading && !result ? (
            <Spinner label="Loading parts" />
          ) : error ? (
            <div className="card p-8 text-center text-ink/70">Something went wrong loading parts. Please refresh.</div>
          ) : result && result.items.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {result.items.map((p) => <PartCard key={p.id} part={p} />)}
              </div>
              {result.totalPages > 1 && (
                <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
                  <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-outline px-3 py-2 text-sm disabled:opacity-40">Prev</button>
                  {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setPage(p)} aria-current={p === result.page ? 'page' : undefined}
                      className={`h-10 w-10 rounded-md text-sm font-semibold ${p === result.page ? 'bg-brand-cyan text-brand-black' : 'border border-line text-ink/80 hover:border-brand-cyan'}`}>{p}</button>
                  ))}
                  <button disabled={page >= result.totalPages} onClick={() => setPage(page + 1)} className="btn-outline px-3 py-2 text-sm disabled:opacity-40">Next</button>
                </nav>
              )}
            </>
          ) : (
            <div className="card flex flex-col items-center gap-4 p-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-cyan/10 text-teal">
                <Package size={26} aria-hidden />
              </span>
              <h2 className="font-display text-2xl font-bold">No parts match your search</h2>
              <p className="max-w-md text-ink/65">Try clearing the filters, or get in touch and we’ll source the part you need.</p>
              <Link to="/contact" className="btn-primary">Contact us</Link>
            </div>
          )}
        </section>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-label="Filters">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileFiltersOpen(false)} aria-hidden />
          <div className="absolute inset-y-0 left-0 w-[88%] max-w-sm overflow-y-auto bg-white p-5 shadow-card-hover">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-lg font-bold">Filters</span>
              <button type="button" onClick={() => setMobileFiltersOpen(false)} className="btn-outline px-2 py-2" aria-label="Close filters">
                <X size={18} aria-hidden />
              </button>
            </div>
            {sidebar}
            <button type="button" onClick={() => setMobileFiltersOpen(false)} className="btn-primary mt-6 w-full">
              Show {result?.total ?? 0} results
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function PartFilterSidebar({
  filters, onChange, onReset,
}: { filters: PartFilters; onChange: (p: Partial<PartFilters>) => void; onReset: () => void }) {
  const num = (v: string) => (v === '' ? undefined : Number(v));
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Filter parts</h2>
        <button type="button" onClick={onReset} className="text-xs font-semibold text-teal hover:underline">Reset</button>
      </div>

      <div>
        <label className="field-label">Search</label>
        <input className="field-input" placeholder="Name, brand, SKU…" value={filters.search ?? ''} onChange={(e) => onChange({ search: e.target.value || undefined })} />
      </div>

      <div>
        <label className="field-label">Category</label>
        <select className="field-input" value={filters.category ?? ''} onChange={(e) => onChange({ category: e.target.value || undefined })}>
          <option value="">All categories</option>
          {PART_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="field-label">Condition</label>
        <select className="field-input" value={filters.condition ?? ''} onChange={(e) => onChange({ condition: e.target.value || undefined })}>
          <option value="">Any</option>
          {PART_CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Min price €</label>
          <input className="field-input" type="number" inputMode="numeric" placeholder="0" value={filters.priceMin ?? ''} onChange={(e) => onChange({ priceMin: num(e.target.value) })} />
        </div>
        <div>
          <label className="field-label">Max price €</label>
          <input className="field-input" type="number" inputMode="numeric" placeholder="Any" value={filters.priceMax ?? ''} onChange={(e) => onChange({ priceMax: num(e.target.value) })} />
        </div>
      </div>
    </div>
  );
}
