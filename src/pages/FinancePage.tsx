import { Seo } from '../lib/seo';
import { PageHeader } from '../components/ui/PageHeader';
import { EnquiryForm } from '../components/forms/EnquiryForm';
import { BUSINESS } from '../config/business';

/*
 * COMPLIANCE NOTE - do not turn this into a live finance calculator or quote engine.
 * ------------------------------------------------------------------------------
 * Displaying regulated credit figures (APR, monthly repayments, total cost of
 * credit) in Ireland has legal implications: the business would generally need
 * to be an authorised/registered credit intermediary and meet Central Bank and
 * Consumer Credit Act disclosure rules. This page therefore ONLY collects an
 * enquiry and hands the customer off to the dealer / a regulated finance
 * partner. [CONFIRM with the client whether they offer finance and are a
 * registered credit intermediary before publishing this page.]
 */
export function FinancePage() {
  if (!BUSINESS.offersFinance) {
    return (
      <>
        <Seo title="Finance" description="Finance enquiries for CF Motor Sales." path="/finance" noindex />
        <PageHeader
          title="Finance"
          subtitle="We don’t currently offer in-house finance. Talk to us and we’ll point you in the right direction."
        />
      </>
    );
  }

  return (
    <>
      <Seo
        title="Car Finance Enquiries"
        description="Enquire about finance options on your next car from CF Motor Sales. We'll talk you through what's available - no obligation."
        path="/finance"
      />
      <PageHeader
        eyebrow="Finance"
        title="Flexible finance enquiries"
        subtitle="Interested in spreading the cost? Send us an enquiry and we’ll talk you through the finance options available on your chosen car."
      />

      <div className="container-page grid gap-8 py-12 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4 text-brand-white/75">
          <h2 className="font-display text-2xl font-bold text-brand-white">How it works</h2>
          <p>
            Tell us the car you’re interested in and roughly what you’re looking to
            put down. We’ll come back to you with the finance options available
            through our partners.
          </p>
          <div className="card p-5 text-sm">
            <p className="font-semibold text-brand-white">Important</p>
            <p className="mt-2 text-brand-white/65">
              Finance is subject to status, approval and terms. Figures are not shown
              online - any quote is provided to you directly and, where applicable,
              through a regulated finance provider. Lending criteria apply.
              <span className="mt-1 block text-brand-white/40">
                [CLIENT TO REVIEW WITH SOLICITOR / confirm credit intermediary status.]
              </span>
            </p>
          </div>
        </div>

        <div>
          <EnquiryForm
            type="finance"
            title="Finance enquiry"
            defaultMessage="I'd like to enquire about finance options."
          />
        </div>
      </div>
    </>
  );
}
