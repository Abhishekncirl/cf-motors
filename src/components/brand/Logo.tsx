import { Link } from 'react-router-dom';
import { BUSINESS } from '../../config/business';

// Public asset, base-path aware (works at '/' locally and '/cf-motors/' on Pages).
const LOGO_MARK = `${import.meta.env.BASE_URL}cf-logo-mark.png`;

/**
 * Brand logo. Renders the real CF Motor Sales mark (transparent PNG) so it sits
 * cleanly on the dark header/footer. Replace /public/cf-logo-mark.png to update.
 */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center ${className}`}
      aria-label={`${BUSINESS.name} home`}
    >
      <img
        src={LOGO_MARK}
        alt={`${BUSINESS.name} - ${BUSINESS.tagline}`}
        width={536}
        height={142}
        className="h-9 w-auto sm:h-10"
      />
    </Link>
  );
}
