import { useState } from 'react';
import { Star } from 'lucide-react';

/** Read-only star rating (light surfaces). */
export function Stars({
  rating,
  size = 16,
  className = '',
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  return (
    <div className={`flex ${className}`} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          aria-hidden
          className={i < rating ? 'fill-brand-cyan text-teal' : 'text-ink/15'}
        />
      ))}
    </div>
  );
}

/** Interactive star picker for the review form. */
export function StarInput({
  value,
  onChange,
  size = 30,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  const labels = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

  return (
    <div className="flex items-center gap-3">
      <div className="flex" role="radiogroup" aria-label="Your rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="rounded p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
          >
            <Star
              size={size}
              className={n <= active ? 'fill-brand-cyan text-teal' : 'text-ink/20'}
              aria-hidden
            />
          </button>
        ))}
      </div>
      <span className="text-sm font-medium text-ink/60">{labels[active] || 'Tap to rate'}</span>
    </div>
  );
}
