import { Seo } from '../../lib/seo';
import { LegalPage, LegalSection } from './LegalPage';
import { BUSINESS } from '../../config/business';

export function TermsPage() {
  return (
    <>
      <Seo title="Terms & Conditions" description="Terms and conditions for using the CF Motor Sales website and services." path="/terms" noindex />
      <LegalPage title="Terms & Conditions" updated="[CONFIRM date]">
        <LegalSection heading="1. About us">
          <p>
            This website is operated by {BUSINESS.name} ("we", "us", "our"), a company
            registered in Ireland. [CLIENT TO REVIEW WITH SOLICITOR: insert company
            registration number, registered address and VAT number.]
          </p>
        </LegalSection>
        <LegalSection heading="2. Use of this website">
          <p>
            By using this website you agree to these terms. The content is provided for
            general information about our vehicles and services. Vehicle details,
            availability and pricing are subject to change and to confirmation before sale.
          </p>
        </LegalSection>
        <LegalSection heading="3. Vehicle information & availability">
          <p>
            We take care to describe vehicles accurately, but specifications, mileage,
            images and prices are provided in good faith and should be verified before
            purchase. A vehicle listed as available may be sold or reserved at any time.
            [CLIENT TO REVIEW WITH SOLICITOR: consumer rights and description obligations.]
          </p>
        </LegalSection>
        <LegalSection heading="4. Enquiries & sourcing requests">
          <p>
            Submitting an enquiry, valuation or sourcing request does not create a binding
            contract. Any sale, part-exchange, import or finance arrangement is subject to
            a separate written agreement. [CLIENT TO REVIEW WITH SOLICITOR.]
          </p>
        </LegalSection>
        <LegalSection heading="5. Imports, VRT & registration">
          <p>
            Where we import a vehicle, quoted prices and timelines are indicative and may
            be affected by third parties, shipping, currency and Revenue/VRT processes.
            [CLIENT TO REVIEW WITH SOLICITOR: allocation of VRT liability and risk.]
          </p>
        </LegalSection>
        <LegalSection heading="6. Finance">
          <p>
            Any finance is provided subject to status and to the terms of the relevant
            regulated provider. We do not display credit figures on this website.
            [CLIENT TO REVIEW WITH SOLICITOR: credit intermediary authorisation.]
          </p>
        </LegalSection>
        <LegalSection heading="7. Limitation of liability">
          <p>
            To the extent permitted by law, we are not liable for any loss arising from
            reliance on website content. Nothing in these terms limits liability that
            cannot be limited under Irish law. [CLIENT TO REVIEW WITH SOLICITOR.]
          </p>
        </LegalSection>
        <LegalSection heading="8. Governing law">
          <p>These terms are governed by the laws of Ireland. [CLIENT TO REVIEW WITH SOLICITOR.]</p>
        </LegalSection>
        <LegalSection heading="9. Contact">
          <p>Questions about these terms: {BUSINESS.email} · {BUSINESS.phoneDisplay}.</p>
        </LegalSection>
      </LegalPage>
    </>
  );
}
