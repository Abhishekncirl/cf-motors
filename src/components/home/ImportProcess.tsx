import { Search, Ship, ReceiptEuro, ClipboardCheck, KeyRound } from 'lucide-react';

const STEPS = [
  { icon: Search, title: 'Source', line: 'We find the exact spec in the UK or Japan.' },
  { icon: Ship, title: 'Ship', line: 'Transported and cleared into Ireland.' },
  { icon: ReceiptEuro, title: 'VRT', line: 'Vehicle Registration Tax handled for you.' },
  { icon: ClipboardCheck, title: 'NCT', line: 'Tested and made road-legal.' },
  { icon: KeyRound, title: 'Deliver', line: 'Collect the keys - or we deliver.' },
];

export function ImportProcess() {
  return (
    <section className="bg-brand-black py-16">
      <div className="container-page">
        <div className="mb-10 text-center">
          <p className="section-eyebrow mb-2">Import process</p>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">From forecourt to your driveway</h2>
        </div>
        <ol className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {STEPS.map(({ icon: Icon, title, line }, i) => (
            <li key={title} className="card flex flex-col items-center p-5 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan">
                <Icon size={22} aria-hidden />
              </span>
              <span className="text-xs font-semibold text-brand-white/40">Step {i + 1}</span>
              <h3 className="mt-1 font-display text-lg font-bold">{title}</h3>
              <p className="mt-1 text-xs text-brand-white/60">{line}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
