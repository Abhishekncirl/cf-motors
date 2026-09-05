import { Link } from 'react-router-dom';
import { StockSearchBar } from './StockSearchBar';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const DEFAULT_HERO =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='900'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%230A0A0A'/%3E%3Cstop offset='1' stop-color='%231A1A1A'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1600' height='900' fill='url(%23g)'/%3E%3C/svg%3E";

/** Full-bleed hero with overlaid stock search. */
export function HeroSection() {
  const settings = useSiteSettings();
  const heroUrl = settings.heroImageUrl || DEFAULT_HERO;

  return (
    <section className="relative isolate overflow-hidden bg-brand-black">
      <img
        src={heroUrl}
        alt=""
        aria-hidden
        width={1600}
        height={900}
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/70 to-brand-black/40"
      />
      <div className="container-page relative py-16 sm:py-24 lg:py-28">
        <p className="section-eyebrow mb-4">UK &amp; Japanese Imports · Ireland</p>
        <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.05] sm:text-5xl md:text-6xl">
          Quality imports,{' '}
          <span className="text-brand-cyan">sourced &amp; ready to drive</span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-brand-white/75 sm:text-lg">
          Low-mileage, high-spec cars from the UK and Japan - with VRT, NCT and
          the paperwork handled for you. Browse live stock or tell us what to find.
        </p>

        <div className="mt-8 max-w-4xl">
          <StockSearchBar />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/stock" className="btn-primary">Browse all stock</Link>
          <Link to="/import-service" className="btn-outline">Source a car to order</Link>
        </div>
      </div>
    </section>
  );
}
