/**
 * Custom SVG hero illustration for CF Motor Sales - a bold, filled sports-car
 * silhouette with motion streaks (in the spirit of the client's reference
 * clip-art), rendered as a crisp light body with cyan accents so it pops on the
 * dark hero band. Hand-built (no external image); purely presentational.
 */
export default function HeroCarIllustration({ className = '' }: { className?: string }) {
  const wheels = [156, 452]; // front (left), rear (right) centre-x
  const wy = 230;
  const tire = 43;
  const rim = 29;

  return (
    <svg
      viewBox="0 0 680 320"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Silhouette of a sports car in motion"
    >
      <defs>
        <radialGradient id="cf-glow" cx="46%" cy="55%" r="60%">
          <stop offset="0%" stopColor="#4FE3DE" stopOpacity="0.30" />
          <stop offset="70%" stopColor="#4FE3DE" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cf-body" x1="0.1" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#E4EAF0" />
          <stop offset="100%" stopColor="#AAB4C1" />
        </linearGradient>
        <linearGradient id="cf-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6B7686" />
          <stop offset="100%" stopColor="#1E2530" />
        </linearGradient>
        <filter id="cf-soft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
        </filter>
      </defs>

      {/* Ambient cyan glow */}
      <ellipse cx="300" cy="175" rx="320" ry="140" fill="url(#cf-glow)" />

      {/* Speed streaks trailing off the rear (right) */}
      <g stroke="#4FE3DE" strokeLinecap="round">
        <line x1="546" y1="150" x2="668" y2="150" strokeWidth="3" opacity="0.4" />
        <line x1="540" y1="176" x2="676" y2="176" strokeWidth="5" opacity="0.7" />
        <line x1="556" y1="200" x2="672" y2="200" strokeWidth="4" opacity="0.55" />
        <line x1="560" y1="222" x2="656" y2="222" strokeWidth="3" opacity="0.35" />
      </g>

      {/* Ground shadow + cyan under-glow */}
      <ellipse cx="310" cy="276" rx="250" ry="17" fill="#000000" opacity="0.5" />
      <ellipse cx="310" cy="270" rx="205" ry="10" fill="#4FE3DE" opacity="0.25" filter="url(#cf-soft)" />

      {/* ---- Body silhouette (front on the left) ---- */}
      <path
        d="M70 232
           C 63 214, 74 203, 95 197
           C 118 190, 138 188, 160 187
           C 210 184, 254 181, 284 174
           C 304 157, 334 145, 372 144
           C 398 143, 416 150, 426 163
           C 442 179, 466 182, 498 180
           C 514 179, 525 173, 529 160
           C 534 174, 535 190, 533 202
           C 531 216, 525 226, 516 232
           L 70 232 Z"
        fill="url(#cf-body)"
      />

      {/* Wheel wells (dark arches) */}
      {wheels.map((cx) => (
        <circle key={`w${cx}`} cx={cx} cy={wy} r={tire + 6} fill="#0C1017" />
      ))}

      {/* Greenhouse / windows (carved dark) */}
      <path
        d="M296 170
           C 314 155, 342 147, 372 148
           C 396 149, 412 155, 421 170
           L 300 176
           C 297 174, 296 172, 296 170 Z"
        fill="#0E1219"
      />
      {/* B-pillar */}
      <line x1="366" y1="146" x2="360" y2="176" stroke="#AAB4C1" strokeWidth="3" />

      {/* Dark highlight slashes (echo the reference's body streaks) */}
      <g fill="#0E1219" opacity="0.85">
        <path d="M120 200 C 180 192, 250 190, 300 194 C 250 200, 180 202, 120 206 Z" />
        <path d="M150 214 C 220 210, 300 210, 360 214 C 300 219, 220 219, 150 219 Z" opacity="0.5" />
      </g>

      {/* Cyan character line + splitter + headlight */}
      <path
        d="M96 208 C 210 199, 360 199, 470 210"
        fill="none"
        stroke="#4FE3DE"
        strokeOpacity="0.75"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect x="470" y="228" width="66" height="7" rx="3.5" fill="#4FE3DE" opacity="0.4" />
      {/* Headlight sweep (front-left) */}
      <path d="M70 214 C 84 206, 104 206, 116 214 C 104 220, 84 220, 70 214 Z" fill="#4FE3DE" />
      <circle cx="92" cy="213" r="3" fill="#EAFFFE" />
      {/* Side intake behind front wheel */}
      <g stroke="#4FE3DE" strokeOpacity="0.7" strokeWidth="3" strokeLinecap="round">
        <line x1="206" y1="206" x2="224" y2="218" />
        <line x1="199" y1="213" x2="217" y2="224" />
      </g>

      {/* ---- Wheels ---- */}
      {wheels.map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={wy} r={tire} fill="#0A0D12" />
          <circle cx={cx} cy={wy} r={tire - 1} fill="none" stroke="#252D38" strokeWidth="2" />
          <circle cx={cx} cy={wy} r={rim} fill="url(#cf-rim)" />
          <circle cx={cx} cy={wy} r={rim} fill="none" stroke="#4FE3DE" strokeOpacity="0.45" strokeWidth="1.5" />
          <g stroke="#C7D0DB" strokeWidth="3.5" strokeLinecap="round">
            {[0, 72, 144, 216, 288].map((a) => {
              const r = ((a - 90) * Math.PI) / 180;
              return (
                <line
                  key={a}
                  x1={cx + Math.cos(r) * 6}
                  y1={wy + Math.sin(r) * 6}
                  x2={cx + Math.cos(r) * (rim - 4)}
                  y2={wy + Math.sin(r) * (rim - 4)}
                />
              );
            })}
          </g>
          <circle cx={cx} cy={wy} r="6" fill="#4FE3DE" />
        </g>
      ))}
    </svg>
  );
}
