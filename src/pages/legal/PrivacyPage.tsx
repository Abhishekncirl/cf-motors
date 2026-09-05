import { Seo } from '../../lib/seo';
import { LegalPage, LegalSection } from './LegalPage';
import { BUSINESS } from '../../config/business';

export function PrivacyPage() {
  return (
    <>
      <Seo title="Privacy Policy" description="How CF Motor Sales collects, uses and protects your personal data under GDPR." path="/privacy" noindex />
      <LegalPage title="Privacy Policy" updated="[CONFIRM date]">
        <LegalSection heading="1. Who we are">
          <p>
            {BUSINESS.name} is the data controller for personal data collected through this
            website. [CLIENT TO REVIEW WITH SOLICITOR: registered address, and whether a Data
            Protection Officer or representative is required.]
          </p>
        </LegalSection>
        <LegalSection heading="2. What we collect">
          <p>When you submit an enquiry, valuation or sourcing request we collect:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Your name, email address and phone number;</li>
            <li>Details of your enquiry or the vehicle you are selling/seeking;</li>
            <li>Any photos you choose to upload;</li>
            <li>With your consent, basic analytics data about your visit.</li>
          </ul>
        </LegalSection>
        <LegalSection heading="3. How we use it (legal basis)">
          <p>
            We use your data to respond to and manage your enquiry (legitimate interest and
            steps towards a contract), and, where you consent, to improve the website via
            analytics. We do not sell your data. [CLIENT TO REVIEW WITH SOLICITOR: lawful bases.]
          </p>
        </LegalSection>
        <LegalSection heading="4. Cookies & analytics">
          <p>
            We use essential cookies to run the site. Non-essential analytics cookies are only
            set after you accept them in our cookie banner. You can withdraw consent at any time
            by clearing cookies in your browser.
          </p>
        </LegalSection>
        <LegalSection heading="5. Sharing & storage">
          <p>
            Enquiry data is stored securely in our systems (hosted with Google Firebase). We may
            share details with a regulated finance or transport partner where relevant to your
            request. [CLIENT TO REVIEW WITH SOLICITOR: processors and international transfers.]
          </p>
        </LegalSection>
        <LegalSection heading="6. Retention">
          <p>
            We keep enquiry data only as long as needed to deal with your request and to meet
            legal obligations. [CLIENT TO REVIEW WITH SOLICITOR: retention periods.]
          </p>
        </LegalSection>
        <LegalSection heading="7. Your rights">
          <p>
            Under GDPR you have the right to access, correct, erase, restrict or object to the
            processing of your data, and to data portability. To exercise these rights, contact us
            at {BUSINESS.email}. You may also complain to the Irish Data Protection Commission
            (dataprotection.ie).
          </p>
        </LegalSection>
        <LegalSection heading="8. Contact">
          <p>Privacy questions: {BUSINESS.email} · {BUSINESS.phoneDisplay}.</p>
        </LegalSection>
      </LegalPage>
    </>
  );
}
