import { Link } from 'react-router-dom';
import { Gauge, Fuel, Cog, Phone } from 'lucide-react';
import type { Vehicle } from '../../lib/types';
import { ImportOriginBadge } from '../ui/Badges';
import { formatPrice, formatMileage, formatWeekly, vehicleTitle, vehicleAlt } from '../../lib/format';
import { telLink, whatsappLink } from '../../config/business';
import { WhatsAppIcon } from '../brand/WhatsAppIcon';

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%231A1A1A'/%3E%3Ctext x='50%25' y='50%25' fill='%234FE3DE' font-family='sans-serif' font-size='18' text-anchor='middle' dominant-baseline='middle'%3ECF Motor Sales%3C/text%3E%3C/svg%3E";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const primary = vehicle.images.find((i) => i.isPrimary) ?? vehicle.images[0];
  const title = vehicleTitle(vehicle);
  const detailUrl = `/stock/${vehicle.slug}`;
  const waMessage = `Hi CF Motor Sales, I'm interested in the ${title} (Ref ${vehicle.stockRef}). Is it still available?`;

  return (
    <article className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-card-hover">
      <Link to={detailUrl} className="relative block aspect-[4/3] overflow-hidden bg-brand-black">
        <img
          src={primary?.url || PLACEHOLDER}
          alt={vehicleAlt(vehicle)}
          width={400}
          height={300}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <ImportOriginBadge origin={vehicle.importOrigin} />
        </div>
        {vehicle.status !== 'available' && (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-black/60">
            <span className="rounded bg-brand-cyan px-3 py-1 text-sm font-bold uppercase tracking-wide text-brand-black">
              {vehicle.status}
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-bold leading-tight">
              <Link to={detailUrl} className="hover:text-brand-cyan">
                {title}
              </Link>
            </h3>
            {vehicle.variant && (
              <p className="text-sm text-brand-white/60">{vehicle.variant}</p>
            )}
          </div>
        </div>

        <dl className="mt-3 grid grid-cols-3 gap-2 text-xs text-brand-white/70">
          <div className="flex flex-col items-center gap-1 rounded bg-brand-black/60 py-2">
            <Gauge size={16} className="text-brand-cyan" aria-hidden />
            <dt className="sr-only">Mileage</dt>
            <dd>{formatMileage(vehicle.mileageKm)}</dd>
          </div>
          <div className="flex flex-col items-center gap-1 rounded bg-brand-black/60 py-2">
            <Fuel size={16} className="text-brand-cyan" aria-hidden />
            <dt className="sr-only">Fuel</dt>
            <dd>{vehicle.fuelType}</dd>
          </div>
          <div className="flex flex-col items-center gap-1 rounded bg-brand-black/60 py-2">
            <Cog size={16} className="text-brand-cyan" aria-hidden />
            <dt className="sr-only">Transmission</dt>
            <dd>{vehicle.transmission}</dd>
          </div>
        </dl>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="font-display text-2xl font-bold text-brand-cyan">
              {formatPrice(vehicle.price)}
            </p>
            {vehicle.weeklyPrice && (
              <p className="text-xs text-brand-white/50">or {formatWeekly(vehicle.weeklyPrice)}</p>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link to={detailUrl} className="btn-primary col-span-2 justify-center py-2 text-xs">
            View Details
          </Link>
          <Link
            to={`${detailUrl}#enquire`}
            className="btn-outline justify-center py-2 text-xs"
          >
            Enquire
          </Link>
          <a
            href={whatsappLink(waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline justify-center py-2 text-xs"
          >
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp
          </a>
          <a href={telLink()} className="btn-ghost col-span-2 justify-center py-1.5 text-xs">
            <Phone size={14} aria-hidden /> Call about this car
          </a>
        </div>
      </div>
    </article>
  );
}
