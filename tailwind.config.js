/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand tokens sampled from the CF Motor Sales logo (white + cyan on black).
        brand: {
          black: '#0A0A0A', // primary background, header, footer
          cyan: '#4FE3DE', // accent, CTAs, active states, highlight bars
          white: '#FFFFFF', // body text on dark, card surfaces
          grey: '#1A1A1A', // card backgrounds, section alternation
        },
        // Convenience aliases used across components.
        ink: '#0A0A0A',
        surface: '#1A1A1A',
        accent: '#4FE3DE',
      },
      fontFamily: {
        // Condensed geometric sans for headings (echoes the logo wordmark).
        display: ['"Oswald Variable"', 'Oswald', 'Arial Narrow', 'sans-serif'],
        // Clean neutral sans for body copy.
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.35)',
        'card-hover': '0 2px 6px rgba(0,0,0,0.5), 0 16px 40px rgba(0,0,0,0.45)',
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
