/**
 * Custom SVG hero illustration for CF Motor Sales - a low, aggressive sports
 * car drawn in the brand's dark + cyan palette to appeal to a younger audience.
 * Hand-built (no external image) so it always renders and stays on-brand
 * against the dark hero band. Purely presentational.
 */
export default function HeroCarIllustration({ className = '' }: { className?: string }) {
  const wheels = [180, 520]; // rear, front centre-x
  const wy = 244; // wheel centre-y
  const tire = 48;
  const rim = 27;

  return (
    <svg
      viewBox="0 0 700 330"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Illustration of a sports car"
    >
      <defs>
        <radialGradient id="cf-glow" cx="50%" cy="55%" r="62%">
          <stop offset="0%" stopColor="#4FE3DE" stopOpacity="0.32" />
          <stop offset="70%" stopColor="#4FE3DE" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cf-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#414B59" />
          <stop offset="45%" stopColor="#232B35" />
          <stop offset="100%" stopColor="#10141B" />
        </linearGradient>
        <linearGradient id="cf-body-hi" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5A6675" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#5A6675" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cf-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#31414C" />
          <stop offset="100%" stopColor="#121922" />
        </linearGradient>
        <linearGradient id="cf-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#66717F" />
          <stop offset="100%" stopColor="#20272F" />
        </linearGradient>
        <filter id="cf-soft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" />
        </filter>
      </defs>

      {/* Ambient cyan glow */}
      <ellipse cx="350" cy="195" rx="330" ry="150" fill="url(#cf-glow)" />

      {/* Motion streaks trailing off the back */}
      <g stroke="#4FE3DE" strokeLinecap="round">
        <line x1="12" y1="150" x2="118" y2="150" strokeWidth="3" opacity="0.45" />
        <line x1="0" y1="176" x2="140" y2="176" strokeWidth="4" opacity="0.7" />
        <line x1="24" y1="202" x2="120" y2="202" strokeWidth="3" opacity="0.4" />
      </g>

      {/* Ground shadow + cyan under-glow */}
      <ellipse cx="360" cy="292" rx="255" ry="18" fill="#000000" opacity="0.55" />
      <ellipse cx="360" cy="286" rx="215" ry="11" fill="#4FE3DE" opacity="0.28" filter="url(#cf-soft)" />

      {/* Rear wing (behind the body) */}
      <g fill="#161C24" stroke="#4FE3DE" strokeOpacity="0.35" strokeWidth="1.5">
        <path d="M96 150 L 214 138 L 214 150 L 96 162 Z" />
        <rect x="120" y="150" width="9" height="34" rx="2" />
        <rect x="188" y="148" width="9" height="34" rx="2" />
      </g>

      {/* ---- Main body (low, wedge sports-car silhouette) ---- */}
      <path
        d="M108 214
           C 110 194, 126 184, 156 182
           C 196 178, 238 176, 268 168
           C 288 154, 320 144, 360 143
           C 396 142, 424 150, 442 168
           C 452 178, 460 184, 480 187
           C 534 190, 596 198, 636 214
           C 660 224, 672 234, 668 246
           C 666 252, 656 254, 646 254
           L 132 254
           C 116 254, 106 246, 106 234 Z"
        fill="url(#cf-body)"
      />
      {/* Top highlight sweep */}
      <path
        d="M156 182 C 210 176, 270 168, 300 152 C 340 144, 400 146, 440 168 L 430 176 C 392 158, 336 156, 300 168 C 258 182, 206 188, 168 190 Z"
        fill="url(#cf-body-hi)"
        opacity="0.5"
      />

      {/* Wheel wells (dark arches) */}
      {wheels.map((cx) => (
        <circle key={`w${cx}`} cx={cx} cy={wy} r={tire + 7} fill="#0B0E12" />
      ))}

      {/* Side skirt accent between the wheels */}
      <rect x="238" y="244" width="226" height="6" rx="3" fill="#4FE3DE" opacity="0.4" />

      {/* Cabin / fastback glass */}
      <path
        d="M282 168
           C 300 154, 336 146, 372 148
           C 400 149, 420 158, 434 176
           L 300 180
           C 288 178, 282 174, 282 168 Z"
        fill="url(#cf-glass)"
        stroke="#4FE3DE"
        strokeOpacity="0.4"
        strokeWidth="1.5"
      />
      {/* A-pillar / mirror hint */}
      <line x1="360" y1="147" x2="356" y2="180" stroke="#0B0E12" strokeWidth="3" opacity="0.6" />

      {/* Sharp cyan character line down the flank */}
      <path
        d="M150 206 C 280 194, 470 194, 610 214"
        fill="none"
        stroke="#4FE3DE"
        strokeOpacity="0.6"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Door seam + handle */}
      <path d="M330 182 C 334 200, 334 214, 334 238" fill="none" stroke="#0B0E12" strokeOpacity="0.6" strokeWidth="2" />
      <rect x="356" y="200" width="26" height="5" rx="2.5" fill="#4FE3DE" opacity="0.75" />

      {/* Side air intake behind the front wheel */}
      <g stroke="#4FE3DE" strokeOpacity="0.75" strokeWidth="3" strokeLinecap="round">
        <line x1="470" y1="205" x2="488" y2="218" />
        <line x1="463" y1="212" x2="481" y2="225" />
      </g>

      {/* Angular headlight (front) */}
      <path d="M636 210 L 664 222 L 660 232 L 632 226 Z" fill="#4FE3DE" />
      <ellipse cx="656" cy="226" rx="10" ry="5" fill="#EAFFFE" opacity="0.9" filter="url(#cf-soft)" />
      {/* Front splitter lip */}
      <rect x="560" y="252" width="112" height="7" rx="3.5" fill="#4FE3DE" opacity="0.45" />

      {/* Slim LED taillight (rear) */}
      <path d="M108 198 L 132 202 L 132 210 L 108 208 Z" fill="#4FE3DE" opacity="0.9" />

      {/* ---- Wheels ---- */}
      {wheels.map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={wy} r={tire} fill="#0A0D11" />
          <circle cx={cx} cy={wy} r={tire - 1} fill="none" stroke="#20272F" strokeWidth="2" />
          <circle cx={cx} cy={wy} r={rim} fill="url(#cf-rim)" />
          <circle cx={cx} cy={wy} r={rim} fill="none" stroke="#4FE3DE" strokeOpacity="0.45" strokeWidth="1.5" />
          {/* 5-spoke sports alloy */}
          <g stroke="#9AA4B2" strokeWidth="3.5" strokeLinecap="round">
            {[0, 72, 144, 216, 288].map((a) => {
              const r = ((a - 90) * Math.PI) / 180;
              return (
                <line
                  key={a}
                  x1={cx + Math.cos(r) * 6}
                  y1={wy + Math.sin(r) * 6}
                  x2={cx + Math.cos(r) * (rim - 3)}
                  y2={wy + Math.sin(r) * (rim - 3)}
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
