import { Gauge, Sparkles, FileCheck2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const POINTS = [
  {
    icon: Gauge,
    title: 'Lower mileage',
    body: 'Japanese cars are typically driven far less, so imports often arrive with genuinely low kilometres for their age.',
  },
  {
    icon: Sparkles,
    title: 'Higher spec',
    body: 'Trim levels and factory options that never officially came to Ireland - more equipment for your money.',
  },
  {
    icon: FileCheck2,
    title: 'Better records',
    body: 'Strict roadworthiness testing (Shaken / MOT) means well-documented service and maintenance histories.',
  },
  {
    icon: ShieldCheck,
    title: 'Fully handled',
    body: 'We take care of the whole import: sourcing, shipping, VRT registration and NCT - you just collect the keys.',
  },
];

export function WhyImports() {
  return (
    <section className="border-y border-white/10 bg-brand-grey py-16">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="section-eyebrow mb-2">Our difference</p>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Why Japanese &amp; UK imports?</h2>
          <p className="mt-4 text-brand-white/70">
            It’s what sets us apart from a standard Irish forecourt. Here’s why buyers
            choose an import from CF Motor Sales.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {POINTS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="card p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-cyan/10 text-brand-cyan">
                <Icon size={22} aria-hidden />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm text-brand-white/65">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link to="/import-service" className="btn-outline">How our import service works</Link>
        </div>
      </div>
    </section>
  );
}
