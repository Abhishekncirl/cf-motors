/**
 * Custom SVG hero illustration for CF Motor Sales - a flowing, single-line
 * (calligraphic) sports-car silhouette in the spirit of the client's reference
 * logo, rendered in the site's white + cyan strokes so it sits on-brand against
 * the dark hero band. Hand-built (no external image); purely presentational.
 */
export default function HeroCarIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 620 300"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Line-art silhouette of a sports car"
    >
      <defs>
        <radialGradient id="cf-glow" cx="50%" cy="52%" r="60%">
          <stop offset="0%" stopColor="#4FE3DE" stopOpacity="0.30" />
          <stop offset="70%" stopColor="#4FE3DE" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cf-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#E9EEF3" />
          <stop offset="100%" stopColor="#B9C2CD" />
        </linearGradient>
        <filter id="cf-soft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
        </filter>
      </defs>

      {/* Ambient cyan glow */}
      <ellipse cx="320" cy="170" rx="300" ry="130" fill="url(#cf-glow)" />

      {/* Soft ground shadow */}
      <ellipse cx="320" cy="250" rx="220" ry="14" fill="#000000" opacity="0.45" />
      <ellipse cx="320" cy="246" rx="180" ry="8" fill="#4FE3DE" opacity="0.22" filter="url(#cf-soft)" />

      {/*
        Flowing brush strokes. Filled tapering ribbons give the calligraphic
        thick-thin feel of the reference. Front of the car is on the left.
      */}
      <g fill="url(#cf-stroke)">
        {/* Main sweep: nose -> hood -> roof -> rear -> tail (tapers at both ends) */}
        <path
          d="M60 196
             C 86 150, 150 118, 224 110
             C 276 105, 320 106, 356 124
             C 396 143, 424 164, 470 182
             C 492 190, 512 191, 530 184
             C 524 196, 506 200, 484 197
             C 452 193, 424 180, 392 162
             C 356 142, 320 132, 280 133
             C 214 135, 150 160, 104 202
             C 88 202, 74 200, 60 196 Z"
        />
        {/* Rear tail flick */}
        <path
          d="M470 182
             C 502 172, 528 178, 540 196
             C 520 190, 500 190, 480 196
             C 476 191, 473 186, 470 182 Z"
        />
        {/* Front splitter curl */}
        <path
          d="M60 196
             C 52 204, 54 214, 66 219
             C 60 210, 62 203, 72 199
             C 68 198, 64 197, 60 196 Z"
        />
      </g>

      {/* Lower body / rocker sweep (cyan accent) */}
      <path
        d="M138 210 C 236 200, 340 200, 452 210"
        fill="none"
        stroke="#4FE3DE"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* A thinner white swoosh under the doors for depth */}
      <path
        d="M176 224 C 250 217, 330 217, 404 224"
        fill="none"
        stroke="#E9EEF3"
        strokeOpacity="0.7"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Wheel arches (open crescents, negative-space wheels) */}
      <path
        d="M92 224 C 104 196, 150 194, 168 220"
        fill="none"
        stroke="url(#cf-stroke)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M372 222 C 388 194, 438 196, 452 224"
        fill="none"
        stroke="url(#cf-stroke)"
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* Headlight 'eye' accent near the front */}
      <path d="M196 158 C 214 150, 232 154, 236 166 C 220 170, 204 168, 196 158 Z" fill="#4FE3DE" />
      <circle cx="221" cy="161" r="3" fill="#EAFFFE" />
    </svg>
  );
}
