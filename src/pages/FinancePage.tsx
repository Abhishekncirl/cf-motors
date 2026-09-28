import { useSearchParams } from 'react-router-dom';
import { Seo } from '../lib/seo';
import { PageHeader } from '../components/ui/PageHeader';
import { EnquiryForm } from '../components/forms/EnquiryForm';
import { FinanceWizard } from '../components/finance/FinanceWizard';
import { FINANCE } from '../lib/finance';
import { BUSINESS } from '../config/business';

/*
 * COMPLIANCE NOTE
 * ---------------------------------------------------------------------------
 * This page shows a Hire-Purchase finance calculator and collects a full
 * application, similar to other Irish dealer sites. The rates/fees are a
 * REPRESENTATIVE EXAMPLE set in src/lib/finance.ts and must be confirmed with
 * CF Motor Sales' regulated finance partner. Advertising regulated credit in
 * Ireland (APR, monthly repayments) generally requires the business to be an
 * authorised credit intermediary and to meet Central Bank / Consumer Credit
 * Act disclosure rules - please confirm before go-live.
 */
export function FinancePage() {
  const [params] = useSearchParams();
  const vehicleId = params.get('vehicle') || undefined;

  if (!BUSINESS.offersFinance) {
    return (
      <>
        <Seo title="Finance" description="Finance enquiries for CF Motor Sales." path="/finance" noindex />
        <PageHeader
          title="Finance"
          subtitle="We don’t currently offer in-house finance. Talk to us and we’ll point you in the right direction."
        />
        <div className="container-page max-w-2xl py-10">
          <EnquiryForm type="finance" title="Finance enquiry" defaultMessage="I'd like to enquire about finance options." />
        </div>
      </>
    );
  }

  return (
    <>
      <Seo
        title="Apply For Finance"
        description="Apply for car finance at CF Motor Sales. Use our Hire Purchase calculator to estimate your monthly repayments, then complete a no-obligation application online."
        path="/finance"
      />

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_1.35fr]">
        {/* Left: intro copy */}
        <div>
          <h1 className="font-display text-4xl font-bold text-ink sm:text-5xl">Apply For Finance</h1>
          <p className="mt-5 text-ink/70">
            We can offer you a range of finance options to assist in the purchase of your car. Our rates are
            competitive and flexible. You can apply for finance by filling in the application form.
          </p>
          <div className="mt-6 space-y-3 text-sm text-ink/70">
            <Point>No obligation to purchase anything</Point>
            <Point>Competitive APRs, quick online decision</Point>
            <Point>VRT &amp; NCT handled - drive away sorted</Point>
          </div>
          <div className="mt-6 card p-5 text-xs text-ink/55">
            <p className="font-semibold text-ink/80">Representative example</p>
            <p className="mt-1">
              Figures shown are a representative example under a {FINANCE.type} agreement at{' '}
              {(FINANCE.annualInterestRate * 100).toFixed(2)}% interest rate, with a minimum{' '}
              {Math.round(FINANCE.minDepositPct * 100)}% deposit and €{FINANCE.documentFee}/€{FINANCE.completionFee}
              {' '}document/completion fees. Finance is subject to status, approval and terms. Lending criteria apply.
              CF Motor Sales acts as a credit intermediary; any agreement is with a regulated finance provider.
            </p>
          </div>
        </div>

        {/* Right: application wizard */}
        <div>
          <h2 className="mb-4 font-display text-2xl font-bold text-ink">Vehicle Finance Application</h2>
          <FinanceWizard initialVehicleId={vehicleId} />
        </div>
      </div>
    </>
  );
}

function Point({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
      <span>{children}</span>
    </div>
  );
}
