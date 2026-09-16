import { Link } from 'react-router-dom';
import { StockSearchBar } from './StockSearchBar';
import { useSiteSettings } from '../../hooks/useSiteSettings';

/**
 * Light hero with an overlaid stock search. If the owner sets a hero image it is
 * shown full-bleed with a light scrim so the dark heading stays readable over any
 * photo; otherwise a clean light gradient is used.
 */
export function HeroSection() {
  const settings = useSiteSettings();
  const heroUrl = settings.heroImageUrl;

  return (
    <section className="relative isolate overflow-hidden border-b border-line bg-gradient-to-b from-white to-page">
      {heroUrl && (
        <>
          <img
            src={heroUrl}
            alt=""
            aria-hidden
            width={1600}
            height={900}
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/35"
          />
        </>
      )}
      <div className="container-page relative py-16 sm:py-24 lg:py-28">
        <p className="section-eyebrow mb-4">UK &amp; Japanese Imports · Ireland</p>
        <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.05] text-ink sm:text-5xl md:text-6xl">
          Quality imports,{' '}
          <span className="text-teal">sourced &amp; ready to drive</span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted sm:text-lg">
          Low-mileage, high-spec cars from the UK and Japan - with VRT, NCT and
          the paperwork handled for you. Browse live stock or tell us what to find.
        </p>

        <div className="mt-8 max-w-4xl">
          <StockSearchBar />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/stock" className="btn-primary">Browse all stock</Link>
          <Link to="/import-service" className="btn-outline bg-white">Source a car to order</Link>
        </div>
      </div>
    </section>
  );
}
