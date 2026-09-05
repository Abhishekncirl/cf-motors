import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';
import { Logo } from '../brand/Logo';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { telLink } from '../../config/business';

const NAV = [
  { to: '/stock', label: 'Stock' },
  { to: '/import-service', label: 'Import a Car' },
  { to: '/sell-your-car', label: 'Sell / Trade In' },
  { to: '/finance', label: 'Finance' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const settings = useSiteSettings();
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors ${
        scrolled
          ? 'border-white/10 bg-brand-black/95 backdrop-blur'
          : 'border-transparent bg-brand-black'
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded focus:bg-brand-cyan focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-black"
      >
        Skip to content
      </a>
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-colors ${
                  isActive
                    ? 'text-brand-cyan'
                    : 'text-brand-white/80 hover:text-brand-cyan'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href={telLink()} className="btn-primary hidden sm:inline-flex">
            <Phone size={16} aria-hidden />
            <span>{settings.phoneDisplay}</span>
          </a>
          <button
            type="button"
            className="btn-outline px-2.5 py-2 lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden">
          <nav
            aria-label="Mobile"
            className="container-page flex flex-col gap-1 border-t border-white/10 py-4"
          >
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-3 text-base font-semibold uppercase tracking-wide ${
                    isActive ? 'bg-brand-grey text-brand-cyan' : 'text-brand-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link to="/stock" className="btn-primary mt-3">
              Browse Stock
            </Link>
            <a href={telLink()} className="btn-outline mt-2">
              <Phone size={16} aria-hidden /> Call {settings.phoneDisplay}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
