/** TikTok glyph (lucide-react has no TikTok icon). Inherits currentColor. */
export function TikTokIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M16.5 3c.3 2.1 1.5 3.6 3.5 3.9V9.4c-1.2.1-2.4-.2-3.5-.8v5.9c0 3-2.2 5.5-5.3 5.5A5.2 5.2 0 0 1 6 14.8c0-2.9 2.3-5.2 5.2-5.2.3 0 .6 0 .9.1v2.7a2.5 2.5 0 0 0-.9-.2 2.5 2.5 0 1 0 2.5 2.5V3h2.8z" />
    </svg>
  );
}
