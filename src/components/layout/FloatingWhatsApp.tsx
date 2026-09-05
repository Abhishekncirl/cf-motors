import { whatsappLink } from '../../config/business';
import { WhatsAppIcon } from '../brand/WhatsAppIcon';

/** Persistent WhatsApp quick-contact button (hidden on admin routes). */
export function FloatingWhatsApp() {
  return (
    <a
      href={whatsappLink('Hi CF Motor Sales, I saw your website and have a question about your stock.')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact us on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-card-hover transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-brand-cyan"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
