/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand tokens - LIGHT theme in the logo's colours (dark ink + cyan on
        // light surfaces). `black` is kept as the dark INK (dark text on cyan
        // buttons/CTA); `grey` is a light inset fill.
        brand: {
          black: '#14181F', // dark ink text (e.g. on cyan buttons)
          cyan: '#4FE3DE', // accent, CTAs, active states, highlight bars, price
          white: '#FFFFFF', // card surfaces
          grey: '#EEF1F4', // light inset fill (stat tiles, chips)
        },
        // Light theme semantic tokens.
        page: '#F5F7F9', // page background
        ink: '#14181F', // primary text
        muted: '#59636F', // secondary text
        line: '#E2E6EB', // borders on light
        teal: '#0E8C87', // accent text/links/icons (accessible cyan on white)
        accent: '#4FE3DE',
      },
      fontFamily: {
        // Condensed geometric sans for headings (echoes the logo wordmark).
        display: ['"Oswald Variable"', 'Oswald', 'Arial Narrow', 'sans-serif'],
        // Clean neutral sans for body copy.
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.06), 0 4px 16px rgba(16,24,40,0.06)',
        'card-hover': '0 2px 6px rgba(16,24,40,0.08), 0 12px 30px rgba(16,24,40,0.12)',
        glow: '0 0 0 1px rgba(79,227,222,0.4), 0 8px 30px rgba(79,227,222,0.15)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
      },
    },
  },
  plugins: [],
};
