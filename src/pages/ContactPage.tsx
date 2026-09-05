import { Phone, Mail, MapPin, Clock, Facebook } from 'lucide-react';
import { Seo } from '../lib/seo';
import { PageHeader } from '../components/ui/PageHeader';
import { EnquiryForm } from '../components/forms/EnquiryForm';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { telLink, whatsappLink } from '../config/business';
import { WhatsAppIcon } from '../components/brand/WhatsAppIcon';
import { TikTokIcon } from '../components/brand/TikTokIcon';

export function ContactPage() {
  const s = useSiteSettings();
  const mapQuery = encodeURIComponent(
    [s.addressLine1, s.addressLine2, s.eircode].filter(Boolean).join(', ')
  );

  return (
    <>
      <Seo
        title="Contact CF Motor Sales"
        description="Get in touch with CF Motor Sales - call, WhatsApp, email or visit us. Opening hours, directions and contact form."
        path="/contact"
      />
      <PageHeader eyebrow="Contact" title="Get in touch" subtitle="Call, message or drop by. We’re quick to reply and happy to help." />

      <div className="container-page grid gap-8 py-12 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="card divide-y divide-white/10">
            <a href={telLink()} className="flex items-center gap-4 p-5 hover:bg-white/5">
              <Phone className="text-brand-cyan" aria-hidden />
              <span>
                <span className="block text-xs uppercase tracking-wide text-brand-white/50">Call</span>
                <span className="font-semibold">{s.phoneDisplay}</span>
              </span>
            </a>
            <a href={whatsappLink('Hi CF Motor Sales, I have a question.')} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 hover:bg-white/5">
              <WhatsAppIcon className="h-6 w-6 text-brand-cyan" />
              <span>
                <span className="block text-xs uppercase tracking-wide text-brand-white/50">WhatsApp</span>
                <span className="font-semibold">Message us</span>
              </span>
            </a>
            <a href={`mailto:${s.email}`} className="flex items-center gap-4 p-5 hover:bg-white/5">
              <Mail className="text-brand-cyan" aria-hidden />
              <span>
                <span className="block text-xs uppercase tracking-wide text-brand-white/50">Email</span>
                <span className="font-semibold">{s.email}</span>
              </span>
            </a>
            <div className="flex items-start gap-4 p-5">
              <MapPin className="mt-0.5 text-brand-cyan" aria-hidden />
              <span>
                <span className="block text-xs uppercase tracking-wide text-brand-white/50">Address</span>
                <span className="font-semibold">{s.addressLine1}, {s.addressLine2}</span>
                <span className="block text-brand-white/60">{s.eircode}</span>
              </span>
            </div>
            <div className="flex items-start gap-4 p-5">
              <Clock className="mt-0.5 text-brand-cyan" aria-hidden />
              <div className="w-full">
                <span className="block text-xs uppercase tracking-wide text-brand-white/50">Opening hours</span>
                <ul className="mt-1 space-y-1 text-sm text-brand-white/75">
                  {s.openingHours.map((o) => (
                    <li key={o.day} className="flex justify-between gap-4">
                      <span>{o.day}</span>
                      <span>{o.hours}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <a href={s.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="rounded-md border border-white/15 p-3 hover:border-brand-cyan hover:text-brand-cyan">
              <Facebook aria-hidden />
            </a>
            <a href={s.tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="rounded-md border border-white/15 p-3 hover:border-brand-cyan hover:text-brand-cyan">
              <TikTokIcon className="h-6 w-6" />
            </a>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/10">
            <iframe
              title="Map to CF Motor Sales"
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              width="100%"
              height="300"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block"
            />
          </div>
        </div>

        <div>
          <EnquiryForm type="general" title="Send us a message" />
        </div>
      </div>
    </>
  );
}
