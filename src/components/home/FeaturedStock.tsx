import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getFeaturedVehicles } from '../../lib/vehicles';
import type { Vehicle } from '../../lib/types';
import { VehicleCard } from '../vehicle/VehicleCard';

export function FeaturedStock() {
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);

  useEffect(() => {
    let active = true;
    getFeaturedVehicles(6)
      .then((v) => active && setVehicles(v))
      .catch(() => active && setVehicles([]));
    return () => {
      active = false;
    };
  }, []);

  // Hide the section entirely if there is nothing to feature.
  if (vehicles && vehicles.length === 0) return null;

  return (
    <section className="bg-brand-black py-16">
      <div className="container-page">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="section-eyebrow mb-2">Handpicked</p>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Featured Stock</h2>
          </div>
          <Link to="/stock" className="btn-ghost hidden sm:inline-flex">
            View all <ArrowRight size={16} aria-hidden />
          </Link>
        </div>

        {!vehicles ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-96 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link to="/stock" className="btn-outline">View all stock</Link>
        </div>
      </div>
    </section>
  );
}
