import { Phone } from 'lucide-react';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { telLink, whatsappLink } from '../../config/business';
import { WhatsAppIcon } from '../brand/WhatsAppIcon';

export function ContactCTA() {
  const settings = useSiteSettings();
  return (
    <section className="bg-brand-cyan py-14 text-brand-black">
      <div className="container-page flex flex-col items-center gap-6 text-center">
        <h2 className="max-w-2xl font-display text-3xl font-bold sm:text-4xl">
          Found something you like, or want us to find it?
        </h2>
        <p className="max-w-xl text-brand-black/80">
          Call or message us today - we’re quick to reply and happy to answer any
          question about imports, VRT or a specific car.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href={telLink()} className="btn bg-brand-black text-brand-white hover:bg-brand-black/85">
            <Phone size={16} aria-hidden /> {settings.phoneDisplay}
          </a>
          <a
            href={whatsappLink('Hi CF Motor Sales, I have a question.')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn border border-brand-black/30 bg-white text-brand-black hover:bg-white/85"
          >
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp us
          </a>
        </div>
      </div>
    </section>
  );
}
