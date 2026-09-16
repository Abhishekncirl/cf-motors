import { BadgeCheck, Handshake, Clock, MapPin } from 'lucide-react';

const SIGNALS = [
  { icon: BadgeCheck, label: 'Full VRT & NCT handled' },
  { icon: Handshake, label: 'No-pressure, honest advice' },
  { icon: Clock, label: 'Cars sourced to order' },
  { icon: MapPin, label: 'Trusted local dealer' },
];

export function TrustSignals() {
  return (
    <section className="bg-page py-10">
      <div className="container-page grid grid-cols-2 gap-4 lg:grid-cols-4">
        {SIGNALS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3 rounded-lg border border-line bg-white p-4">
            <Icon size={22} className="shrink-0 text-teal" aria-hidden />
            <span className="text-sm font-semibold">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
