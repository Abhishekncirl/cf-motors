import { Link } from 'react-router-dom';
import { StockSearchBar } from './StockSearchBar';
import { useSiteSettings } from '../../hooks/useSiteSettings';

/**
 * Dark hero band (black-and-white mix) with an overlaid stock search. If the
 * owner sets a hero image it sits full-bleed behind a dark scrim so the white
 * heading stays readable; otherwise a subtle dark gradient + grid is used.
 */
export function HeroSection() {
  const settings = useSiteSettings();
  const heroUrl = settings.heroImageUrl;

  return (
    <section className="relative isolate overflow-hidden bg-night">
      {/* Subtle grid + cyan glow backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div
        aria-hidden
        className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-brand-cyan/20 blur-3xl"
      />
      {heroUrl && (
        <>
          <img
            src={heroUrl}
            alt=""
            aria-hidden
            width={1600}
            height={900}
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-night via-night/85 to-night/50" />
        </>
      )}

      <div className="container-page relative py-16 sm:py-24 lg:py-28">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-cyan">
          UK &amp; Japanese Imports · Ireland
        </p>
        <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.05] text-white sm:text-5xl md:text-6xl">
          Quality imports,{' '}
          <span className="text-brand-cyan">sourced &amp; ready to drive</span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-white/70 sm:text-lg">
          Low-mileage, high-spec cars from the UK and Japan - with VRT, NCT and
          the paperwork handled for you. Browse live stock or tell us what to find.
        </p>

        <div className="mt-8 max-w-4xl">
          <StockSearchBar />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/stock" className="btn-primary">Browse all stock</Link>
          <Link to="/import-service" className="btn-outline-dark">Source a car to order</Link>
        </div>
      </div>
    </section>
  );
}
