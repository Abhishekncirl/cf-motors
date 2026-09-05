import { Link } from 'react-router-dom';
import { BUSINESS } from '../../config/business';

/**
 * Text-based wordmark that echoes the logo: white "CF" + cyan wedge + "MOTOR
 * SALES". Using type (not a raster logo) keeps it crisp and theme-consistent.
 * Swap for the supplied logo asset by dropping it in /public and rendering an
 * <img> here if preferred.
 */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`group inline-flex items-center gap-2 ${className}`}
      aria-label={`${BUSINESS.name} home`}
    >
      <span className="font-display text-2xl font-bold leading-none tracking-tight text-brand-white sm:text-3xl">
        CF
      </span>
      <span
        aria-hidden
        className="h-6 w-1.5 -skew-x-12 bg-brand-cyan transition-all group-hover:h-7"
      />
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-bold uppercase tracking-tight text-brand-white sm:text-xl">
          Motor Sales
        </span>
        <span className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-brand-cyan">
          UK &amp; Japanese Imports
        </span>
      </span>
    </Link>
  );
}
