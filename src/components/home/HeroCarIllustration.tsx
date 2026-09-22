/**
 * Custom SVG hero illustration for CF Motor Sales - a sleek coupe drawn in the
 * brand's dark + cyan palette. Hand-built (no external image) so it always
 * renders and stays perfectly on-brand against the dark hero band.
 *
 * Sits as a decorative element on the right of the hero; purely presentational.
 */
export default function HeroCarIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 660 340"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Illustration of an imported sports car"
    >
      <defs>
        <radialGradient id="cf-glow" cx="50%" cy="55%" r="60%">
          <stop offset="0%" stopColor="#4FE3DE" stopOpacity="0.30" />
          <stop offset="70%" stopColor="#4FE3DE" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cf-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#39424F" />
          <stop offset="55%" stopColor="#20262F" />
          <stop offset="100%" stopColor="#12161D" />
        </linearGradient>
        <linearGradient id="cf-lower" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A2029" />
          <stop offset="100%" stopColor="#0C0F14" />
        </linearGradient>
        <linearGradient id="cf-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2C3A44" />
          <stop offset="100%" stopColor="#131A21" />
        </linearGradient>
        <linearGradient id="cf-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#586372" />
          <stop offset="100%" stopColor="#242B34" />
        </linearGradient>
        <filter id="cf-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" />
        </filter>
      </defs>

      {/* Ambient cyan glow behind the car */}
      <ellipse cx="330" cy="200" rx="320" ry="150" fill="url(#cf-glow)" />

      {/* Motion streaks trailing off the back (left) */}
      <g stroke="#4FE3DE" strokeLinecap="round" opacity="0.55">
        <line x1="18" y1="150" x2="120" y2="150" strokeWidth="3" opacity="0.5" />
        <line x1="4" y1="178" x2="135" y2="178" strokeWidth="4" opacity="0.7" />
        <line x1="30" y1="206" x2="115" y2="206" strokeWidth="3" opacity="0.4" />
      </g>

      {/* Ground shadow + cyan under-glow */}
      <ellipse cx="345" cy="286" rx="250" ry="20" fill="#000000" opacity="0.55" />
      <ellipse cx="345" cy="280" rx="210" ry="12" fill="#4FE3DE" opacity="0.25" filter="url(#cf-soft)" />

      {/* ---- Car body ---- */}
      {/* Lower body / rocker */}
      <path
        d="M96 250
           C 96 232, 118 224, 150 224
           L 520 224
           C 560 224, 588 232, 596 250
           L 592 262
           C 520 268, 180 268, 104 262 Z"
        fill="url(#cf-lower)"
      />

      {/* Main body silhouette */}
      <path
        d="M104 250
           C 96 214, 108 196, 150 190
           C 190 150, 250 132, 318 130
           C 392 128, 452 150, 496 188
           C 556 194, 600 206, 606 236
           C 608 248, 600 254, 588 254
           L 560 254
           C 556 226, 528 214, 500 214
           C 472 214, 446 226, 442 254
           L 214 254
           C 210 226, 184 214, 156 214
           C 128 214, 104 226, 100 254 Z"
        fill="url(#cf-body)"
      />

      {/* Greenhouse / glass */}
      <path
        d="M214 150
           C 250 134, 300 128, 340 130
           C 388 132, 428 146, 452 172
           L 320 176
           L 236 176
           C 224 168, 218 158, 214 150 Z"
        fill="url(#cf-glass)"
        stroke="#4FE3DE"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      {/* B-pillar split */}
      <line x1="322" y1="130" x2="320" y2="176" stroke="#0C0F14" strokeWidth="4" opacity="0.7" />

      {/* Cyan character line down the flank */}
      <path
        d="M150 208 C 260 196, 430 196, 560 210"
        fill="none"
        stroke="#4FE3DE"
        strokeOpacity="0.55"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Door seam */}
      <path d="M330 178 C 332 196, 332 210, 332 236" fill="none" stroke="#0C0F14" strokeOpacity="0.6" strokeWidth="2" />
      {/* Door handle */}
      <rect x="360" y="196" width="26" height="5" rx="2.5" fill="#4FE3DE" opacity="0.7" />

      {/* Headlight (front, right) */}
      <path d="M592 210 q 16 4 12 22 l -22 -2 q -2 -14 10 -20 z" fill="#4FE3DE" />
      <ellipse cx="600" cy="222" rx="10" ry="6" fill="#EAFFFE" opacity="0.9" filter="url(#cf-soft)" />
      {/* Taillight (rear, left) */}
      <rect x="100" y="204" width="10" height="16" rx="3" fill="#4FE3DE" opacity="0.85" />

      {/* Front splitter accent */}
      <rect x="470" y="250" width="120" height="8" rx="4" fill="#4FE3DE" opacity="0.35" />

      {/* ---- Wheels ---- */}
      {[156, 500].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="254" r="42" fill="#0B0E12" />
          <circle cx={cx} cy="254" r="41" fill="none" stroke="#1E2530" strokeWidth="2" />
          <circle cx={cx} cy="254" r="24" fill="url(#cf-rim)" />
          <circle cx={cx} cy="254" r="24" fill="none" stroke="#4FE3DE" strokeOpacity="0.4" strokeWidth="1.5" />
          {/* Spokes */}
          <g stroke="#8A94A2" strokeWidth="3" strokeLinecap="round">
            {[0, 60, 120, 180, 240, 300].map((a) => {
              const r = (a * Math.PI) / 180;
              return (
                <line
                  key={a}
                  x1={cx + Math.cos(r) * 6}
                  y1={254 + Math.sin(r) * 6}
                  x2={cx + Math.cos(r) * 21}
                  y2={254 + Math.sin(r) * 21}
                />
              );
            })}
          </g>
          <circle cx={cx} cy="254" r="6" fill="#4FE3DE" />
        </g>
      ))}
    </svg>
  );
}
