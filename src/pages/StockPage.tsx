import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Car } from 'lucide-react';
import { Seo } from '../lib/seo';
import { queryVehicles, type VehicleFilters, type VehicleSort, type VehicleQueryResult } from '../lib/vehicles';
import { filtersToParams, paramsToFilters, countActiveFilters } from '../lib/stockQuery';
import { FilterSidebar } from '../components/vehicle/FilterSidebar';
import { SortControl } from '../components/vehicle/SortControl';
import { VehicleCard } from '../components/vehicle/VehicleCard';
import { Spinner } from '../components/ui/Spinner';
import { isFirebaseConfigured } from '../lib/firebase';

const PAGE_SIZE = 12;

export function StockPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, sort, page } = useMemo(() => paramsToFilters(searchParams), [searchParams]);

  const [result, setResult] = useState<VehicleQueryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    queryVehicles(filters, sort, page, PAGE_SIZE)
      .then((r) => active && setResult(r))
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [filters, sort, page]);

  const update = (next: { filters?: VehicleFilters; sort?: VehicleSort; page?: number }) => {
    const merged = filtersToParams(
      next.filters ?? filters,
      next.sort ?? sort,
      next.page ?? 1
    );
    setSearchParams(merged, { replace: false });
  };

  const patchFilters = (patch: Partial<VehicleFilters>) =>
    update({ filters: { ...filters, ...patch }, page: 1 });
  const resetFilters = () => setSearchParams(new URLSearchParams());
  const activeCount = countActiveFilters(filters);

  return (
    <>
      <Seo
        title="Browse Our Stock | UK & Japanese Imports"
        description="Browse CF Motor Sales live stock of quality UK and Japanese car imports in Ireland. Filter by make, model, year, price, fuel and more."
        path="/stock"
      />

      <div className="border-b border-white/10 bg-brand-grey">
        <div className="container-page py-8">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Our Stock</h1>
          <p className="mt-2 text-brand-white/60">
            Every car is hand-picked and import-handled by us. Can’t see it?{' '}
            <Link to="/import-service" className="text-brand-cyan underline">We’ll source it.</Link>
          </p>
        </div>
      </div>

      <div className="container-page grid gap-8 py-8 lg:grid-cols-[280px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 card p-5">
            <FilterSidebar filters={filters} onChange={patchFilters} onReset={resetFilters} />
          </div>
        </aside>

        <section>
          {/* Toolbar */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="btn-outline lg:hidden"
              >
                <SlidersHorizontal size={16} aria-hidden /> Filters
                {activeCount > 0 && (
                  <span className="ml-1 rounded-full bg-brand-cyan px-1.5 text-xs text-brand-black">
                    {activeCount}
                  </span>
                )}
              </button>
              <p className="text-sm text-brand-white/60" aria-live="polite">
                {loading ? 'Searching…' : `${result?.total ?? 0} ${result?.total === 1 ? 'car' : 'cars'} found`}
              </p>
            </div>
            <SortControl sort={sort} onChange={(s) => update({ sort: s, page })} />
          </div>

          {!isFirebaseConfigured && (
            <div className="card mb-6 border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              Firebase isn’t configured yet, so live stock can’t load. Add your
              project details to <code>.env</code> and seed the database - see the README.
            </div>
          )}

          {loading ? (
            <Spinner label="Loading stock" />
          ) : error ? (
            <div className="card p-8 text-center text-brand-white/70">
              Something went wrong loading stock. Please refresh or try again shortly.
            </div>
          ) : result && result.items.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {result.items.map((v) => (
                  <VehicleCard key={v.id} vehicle={v} />
                ))}
              </div>
              {result.totalPages > 1 && (
                <Pagination
                  page={result.page}
                  totalPages={result.totalPages}
                  onPage={(p) => update({ page: p })}
                />
              )}
            </>
          ) : (
            <EmptyState />
          )}
        </section>
      </div>

      {/* Mobile slide-over */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-label="Filters">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setMobileFiltersOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 w-[88%] max-w-sm overflow-y-auto bg-brand-grey p-5 shadow-card-hover">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-lg font-bold">Filters</span>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="btn-outline px-2 py-2"
                aria-label="Close filters"
              >
                <X size={18} aria-hidden />
              </button>
            </div>
            <FilterSidebar filters={filters} onChange={patchFilters} onReset={resetFilters} />
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="btn-primary mt-6 w-full"
            >
              Show {result?.total ?? 0} results
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="btn-outline px-3 py-2 text-sm disabled:opacity-40"
      >
        Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPage(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`h-10 w-10 rounded-md text-sm font-semibold ${
            p === page ? 'bg-brand-cyan text-brand-black' : 'border border-white/15 text-brand-white/80 hover:border-brand-cyan'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className="btn-outline px-3 py-2 text-sm disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}

function EmptyState() {
  return (
    <div className="card flex flex-col items-center gap-4 p-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-cyan/10 text-brand-cyan">
        <Car size={26} aria-hidden />
      </span>
      <h2 className="font-display text-2xl font-bold">Can’t find it? We source to order</h2>
      <p className="max-w-md text-brand-white/65">
        No cars match your search right now. Tell us the make, model and spec you’re
        after and we’ll find it in the UK or Japan for you.
      </p>
      <Link to="/import-service" className="btn-primary">Start a sourcing request</Link>
    </div>
  );
}
