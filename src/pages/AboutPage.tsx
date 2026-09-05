import { Link } from 'react-router-dom';
import { ShieldCheck, HeartHandshake, Globe2 } from 'lucide-react';
import { Seo } from '../lib/seo';
import { PageHeader } from '../components/ui/PageHeader';

const VALUES = [
  { icon: ShieldCheck, title: 'Honesty first', body: 'Straight answers, fair prices and no pressure. We’d rather build a reputation than make a quick sale.' },
  { icon: Globe2, title: 'Import expertise', body: 'We know the UK and Japanese markets inside out, and we handle the whole import process so you don’t have to.' },
  { icon: HeartHandshake, title: 'Looked after', body: 'From your first enquiry to long after you collect the keys, we’re only a WhatsApp message away.' },
];

export function AboutPage() {
  return (
    <>
      <Seo
        title="About CF Motor Sales Ltd"
        description="CF Motor Sales Ltd is an independent Irish dealership specialising in quality UK and Japanese car imports, with full VRT and NCT handling."
        path="/about"
      />
      <PageHeader
        eyebrow="About us"
        title="Independent. Import specialists."
        subtitle="CF Motor Sales Ltd was built on a simple idea: bring better cars to Irish buyers, and make the whole process easy and honest."
      />

      <section className="container-page py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-4 text-brand-white/75">
            <h2 className="font-display text-2xl font-bold text-brand-white">Our story</h2>
            <p>
              [CONFIRM company story] We started CF Motor Sales because we saw how
              many great cars in the UK and Japan never made it to Irish forecourts -
              cleaner, lower-mileage and higher-spec than a lot of what’s available here.
            </p>
            <p>
              Today we hand-pick every car we bring in and handle the full import
              journey: sourcing, shipping, VRT and NCT. Whether it’s from our current
              stock or sourced to your exact spec, you get an import without the hassle.
            </p>
            <div className="flex gap-3 pt-2">
              <Link to="/stock" className="btn-primary">Browse our stock</Link>
              <Link to="/contact" className="btn-outline">Visit us</Link>
            </div>
          </div>

          {/* Forecourt photos - replace the placeholders with real images. */}
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="flex aspect-[4/3] items-center justify-center rounded-xl border border-white/10 bg-brand-grey text-xs text-brand-white/40"
              >
                Forecourt photo {n}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="card p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-cyan/10 text-brand-cyan">
                <Icon size={22} aria-hidden />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm text-brand-white/65">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
