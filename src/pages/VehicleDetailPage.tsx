import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Phone, ChevronLeft } from 'lucide-react';
import { Seo, JsonLd } from '../lib/seo';
import { getVehicleBySlug, getSimilarVehicles } from '../lib/vehicles';
import type { Vehicle } from '../lib/types';
import { BUSINESS, telLink, whatsappLink } from '../config/business';
import { formatPrice, formatWeekly, vehicleTitle, vehicleAlt } from '../lib/format';
import { Gallery } from '../components/vehicle/Gallery';
import { SpecTable } from '../components/vehicle/SpecTable';
import { ImportOriginBadge, StatusBadge } from '../components/ui/Badges';
import { VehicleCard } from '../components/vehicle/VehicleCard';
import { EnquiryForm } from '../components/forms/EnquiryForm';
import { WhatsAppIcon } from '../components/brand/WhatsAppIcon';
import { Spinner } from '../components/ui/Spinner';
import { NotFoundPage } from './NotFoundPage';

export function VehicleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [similar, setSimilar] = useState<Vehicle[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    let active = true;
    setState('loading');
    getVehicleBySlug(slug ?? '')
      .then((v) => {
        if (!active) return;
        if (!v) {
          setState('missing');
          return;
        }
        setVehicle(v);
        setState('ready');
        getSimilarVehicles(v).then((s) => active && setSimilar(s)).catch(() => {});
      })
      .catch(() => active && setState('missing'));
    return () => {
      active = false;
    };
  }, [slug]);

  if (state === 'loading') return <Spinner label="Loading vehicle" />;
  if (state === 'missing' || !vehicle) return <NotFoundPage />;

  const title = vehicleTitle(vehicle, true);
  const waMessage = `Hi CF Motor Sales, I'm interested in the ${title} (Ref ${vehicle.stockRef}). Is it still available?`;

  return (
    <>
      <Seo
        title={`${title} for sale`}
        description={`${title} - ${vehicle.mileageKm.toLocaleString('en-IE')} km, ${vehicle.fuelType}, ${vehicle.transmission}. ${vehicle.importOrigin} import at CF Motor Sales, ${formatPrice(vehicle.price)}.`}
        path={`/stock/${vehicle.slug}`}
        image={vehicle.images.find((i) => i.isPrimary)?.url || vehicle.images[0]?.url}
      />
      <JsonLd id="vehicle" data={vehicleJsonLd(vehicle)} />

      <div className="container-page py-6">
        <Link to="/stock" className="btn-ghost mb-4 px-0 text-sm">
          <ChevronLeft size={16} aria-hidden /> Back to stock
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <Gallery images={vehicle.images} alt={vehicleAlt(vehicle)} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <ImportOriginBadge origin={vehicle.importOrigin} />
              <StatusBadge status={vehicle.status} />
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{title}</h1>

            <div className="mt-4">
              <p className="font-display text-4xl font-bold text-brand-cyan">
                {formatPrice(vehicle.price)}
              </p>
              {/* Weekly line only renders when a figure exists on the record. */}
              {vehicle.weeklyPrice != null && (
                <p className="mt-1 text-sm text-brand-white/60">or from {formatWeekly(vehicle.weeklyPrice)}</p>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <a href={telLink()} className="btn-primary">
                <Phone size={16} aria-hidden /> Call now
              </a>
              <a
                href={whatsappLink(waMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp
              </a>
              <a href="#enquire" className="btn-outline col-span-2">Enquire about this car</a>
            </div>

            <div className="mt-6 card p-5 text-sm text-brand-white/70">
              <p className="font-semibold text-brand-white">Import &amp; paperwork included</p>
              <p className="mt-1">
                VRT and NCT are handled before you collect. Ask us about part-exchange
                and delivery anywhere in Ireland.
              </p>
            </div>
          </div>
        </div>

        {vehicle.description && (
          <section className="mt-10">
            <h2 className="mb-3 font-display text-2xl font-bold">Description</h2>
            <p className="max-w-3xl whitespace-pre-line text-brand-white/75">{vehicle.description}</p>
          </section>
        )}

        <section className="mt-10">
          <h2 className="mb-3 font-display text-2xl font-bold">Specification</h2>
          <SpecTable vehicle={vehicle} />
        </section>

        <section id="enquire" className="mt-12 max-w-2xl scroll-mt-24">
          <h2 className="mb-4 font-display text-2xl font-bold">Enquire about this {vehicle.make}</h2>
          <EnquiryForm
            type="vehicle"
            vehicleId={vehicle.id}
            defaultMessage={`I'm interested in the ${title} (Ref ${vehicle.stockRef}). Please get in touch.`}
          />
        </section>

        {similar.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-6 font-display text-2xl font-bold">Similar vehicles</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky mobile action bar */}
      <div className="sticky bottom-0 z-40 border-t border-white/10 bg-brand-black/95 backdrop-blur lg:hidden">
        <div className="container-page grid grid-cols-3 gap-2 py-3">
          <a href={telLink()} className="btn-outline justify-center py-2 text-xs">
            <Phone size={16} aria-hidden /> Call
          </a>
          <a
            href={whatsappLink(waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline justify-center py-2 text-xs"
          >
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp
          </a>
          <a href="#enquire" className="btn-primary justify-center py-2 text-xs">Enquire</a>
        </div>
      </div>
    </>
  );
}

/** schema.org Vehicle + Offer JSON-LD. */
function vehicleJsonLd(v: Vehicle) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    name: vehicleTitle(v, true),
    manufacturer: { '@type': 'Organization', name: v.make },
    model: v.model,
    vehicleModelDate: String(v.year),
    productionDate: String(v.year),
    bodyType: v.bodyType,
    fuelType: v.fuelType,
    vehicleTransmission: v.transmission,
    color: v.colour || undefined,
    numberOfDoors: v.doors,
    seatingCapacity: v.seats,
    mileageFromOdometer: { '@type': 'QuantitativeValue', value: v.mileageKm, unitCode: 'KMT' },
    numberOfPreviousOwners: v.previousOwners,
    image: v.images.map((i) => i.url),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: v.price,
      availability:
        v.status === 'available'
          ? 'https://schema.org/InStock'
          : v.status === 'reserved'
          ? 'https://schema.org/LimitedAvailability'
          : 'https://schema.org/SoldOut',
      itemCondition: 'https://schema.org/UsedCondition',
      url: `${BUSINESS.siteUrl}/stock/${v.slug}`,
      seller: { '@type': 'AutoDealer', name: BUSINESS.name, telephone: BUSINESS.phoneTel },
    },
  };
}
