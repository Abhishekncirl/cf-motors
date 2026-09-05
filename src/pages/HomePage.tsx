import { Seo } from '../lib/seo';
import { HeroSection } from '../components/home/HeroSection';
import { QuickFilters } from '../components/home/QuickFilters';
import { FeaturedStock } from '../components/home/FeaturedStock';
import { WhyImports } from '../components/home/WhyImports';
import { ImportProcess } from '../components/home/ImportProcess';
import { Reviews } from '../components/home/Reviews';
import { TrustSignals } from '../components/home/TrustSignals';
import { ContactCTA } from '../components/home/ContactCTA';

export function HomePage() {
  return (
    <>
      <Seo
        title="Used Cars & Japanese Imports Ireland | CF Motor Sales Ltd"
        description="CF Motor Sales Ltd - independent Irish dealership for quality UK & Japanese car imports. Low-mileage, high-spec cars with full VRT and NCT handling. Browse live stock."
        path="/"
      />
      <HeroSection />
      <QuickFilters />
      <FeaturedStock />
      <WhyImports />
      <ImportProcess />
      <Reviews />
      <TrustSignals />
      <ContactCTA />
    </>
  );
}
