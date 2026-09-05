import { Link } from 'react-router-dom';
import { Seo } from '../lib/seo';

export function NotFoundPage() {
  return (
    <>
      <Seo title="Page not found" description="The page you were looking for could not be found." noindex />
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
        <p className="font-display text-7xl font-bold text-brand-cyan">404</p>
        <h1 className="font-display text-3xl font-bold">We couldn’t find that page</h1>
        <p className="max-w-md text-brand-white/60">
          It may have been sold, moved, or never existed. Try browsing our current stock instead.
        </p>
        <div className="flex gap-3">
          <Link to="/" className="btn-outline">Home</Link>
          <Link to="/stock" className="btn-primary">Browse stock</Link>
        </div>
      </div>
    </>
  );
}
