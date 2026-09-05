import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, MessageCircle } from 'lucide-react';
import { Logo } from '../brand/Logo';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { BUSINESS, telLink, whatsappLink } from '../../config/business';
import { TikTokIcon } from '../brand/TikTokIcon';

export function Footer() {
  const settings = useSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-brand-black">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-brand-white/60">
            Independent Irish dealership specialising in quality UK &amp; Japanese
            car imports, sourced to order with full VRT and NCT handling.
          </p>
        </div>

        <nav aria-label="Footer" className="text-sm">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-cyan">
            Explore
          </h3>
          <ul className="space-y-2 text-brand-white/70">
            <li><Link className="hover:text-brand-cyan" to="/stock">Browse Stock</Link></li>
            <li><Link className="hover:text-brand-cyan" to="/import-service">Import a Car</Link></li>
            <li><Link className="hover:text-brand-cyan" to="/sell-your-car">Sell / Trade In</Link></li>
            <li><Link className="hover:text-brand-cyan" to="/finance">Finance</Link></li>
            <li><Link className="hover:text-brand-cyan" to="/about">About Us</Link></li>
            <li><Link className="hover:text-brand-cyan" to="/contact">Contact</Link></li>
          </ul>
        </nav>

        <div className="text-sm">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-cyan">
            Contact
          </h3>
          <ul className="space-y-3 text-brand-white/70">
            <li>
              <a href={telLink()} className="flex items-center gap-2 hover:text-brand-cyan">
                <Phone size={16} aria-hidden /> {settings.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={whatsappLink('Hi CF Motor Sales, I have an enquiry.')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-brand-cyan"
              >
                <MessageCircle size={16} aria-hidden /> WhatsApp us
              </a>
            </li>
            <li>
              <a href={`mailto:${settings.email}`} className="flex items-center gap-2 hover:text-brand-cyan">
                <Mail size={16} aria-hidden /> {settings.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={16} aria-hidden className="mt-0.5" />
              <span>
                {settings.addressLine1}, {settings.addressLine2}
                <br />
                {settings.eircode}
              </span>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-cyan">
            Follow
          </h3>
          <div className="flex gap-3">
            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="CF Motor Sales on Facebook"
              className="rounded-md border border-white/15 p-2.5 text-brand-white/80 hover:border-brand-cyan hover:text-brand-cyan"
            >
              <Facebook size={20} aria-hidden />
            </a>
            <a
              href={settings.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="CF Motor Sales on TikTok"
              className="rounded-md border border-white/15 p-2.5 text-brand-white/80 hover:border-brand-cyan hover:text-brand-cyan"
            >
              <TikTokIcon className="h-5 w-5" />
            </a>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-brand-cyan">
              Opening Hours
            </h3>
            <ul className="space-y-1 text-brand-white/60">
              {settings.openingHours.map((o) => (
                <li key={o.day} className="flex justify-between gap-4">
                  <span>{o.day}</span>
                  <span>{o.hours}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-brand-white/50 sm:flex-row">
          <p>
            &copy; {year} {BUSINESS.name}. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:text-brand-cyan">Terms &amp; Conditions</Link>
            <Link to="/privacy" className="hover:text-brand-cyan">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
