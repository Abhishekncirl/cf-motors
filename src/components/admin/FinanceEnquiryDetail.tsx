import { useEffect, useState, type ReactNode } from 'react';
import { Car } from 'lucide-react';
import type { Enquiry, Vehicle } from '../../lib/types';
import { getVehicleById } from '../../lib/vehicles';
import { formatPrice, formatNumber } from '../../lib/format';

/**
 * Structured, line-by-line view of a finance application in admin: the vehicle
 * the customer chose, the calculated quote, and every detail they submitted,
 * grouped into clear sections.
 */
export function FinanceEnquiryDetail({ enquiry }: { enquiry: Enquiry }) {
  const p = enquiry.payload as Record<string, unknown>;
  const quote = (p.quote as Record<string, unknown>) ?? {};
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    if (!enquiry.vehicleId) return;
    getVehicleById(enquiry.vehicleId).then(setVehicle).catch(() => setVehicle(null));
  }, [enquiry.vehicleId]);

  const str = (k: string) => (p[k] == null ? '' : String(p[k]));
  const qnum = (k: string): number | null => {
    const v = quote[k];
    return typeof v === 'number' ? v : v ? Number(v) : null;
  };
  const eur = (v: unknown): string => {
    const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(/[^0-9.]/g, ''));
    return Number.isFinite(n) && n !== 0 ? `€${formatNumber(Math.round(n))}` : v ? `€${v}` : '—';
  };
  const eur2 = (v: number | null) =>
    v == null ? '—' : `€${v.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const pct = (v: number | null) => {
    if (v == null) return '—';
    const val = v <= 1 ? v * 100 : v; // 0.089 -> 8.9, 9.96 -> 9.96
    return `${val.toFixed(2)}%`;
  };
  const yesNo = (k: string) => (p[k] === true || p[k] === 'yes' ? 'Yes' : p[k] === false || p[k] === 'no' ? 'No' : '—');

  const fullName = `${str('title')} ${str('firstName')} ${str('surname')}`.trim();

  return (
    <div className="space-y-4">
      {/* Selected vehicle */}
      <Section title="Vehicle selected for finance">
        <div className="grid gap-3 rounded-lg border border-line bg-white p-3 sm:grid-cols-[140px_1fr]">
          {vehicle?.images?.[0]?.url ? (
            <img src={vehicle.images[0].url} alt="" className="aspect-[4/3] w-full rounded-md object-cover sm:w-[140px]" />
          ) : (
            <div className="flex aspect-[4/3] w-full items-center justify-center rounded-md bg-ink/5 text-ink/30 sm:w-[140px]">
              <Car size={28} aria-hidden />
            </div>
          )}
          <div className="min-w-0">
            {vehicle ? (
              <>
                <p className="font-display text-base font-bold text-ink">
                  {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.variant}
                </p>
                <dl className="mt-1">
                  <Line label="Retail price" value={formatPrice(vehicle.price)} />
                  <Line label="Mileage" value={`${formatNumber(vehicle.mileageKm)} km`} />
                  <Line label="Fuel / Trans" value={`${vehicle.fuelType} · ${vehicle.transmission}`} />
                  <Line label="Stock ref" value={vehicle.stockRef || '—'} />
                </dl>
              </>
            ) : (
              <p className="text-sm text-ink/50">
                {enquiry.vehicleId ? 'Vehicle no longer in stock (removed).' : 'No vehicle recorded.'}
                {enquiry.vehicleId ? ` (id: ${enquiry.vehicleId})` : ''}
              </p>
            )}
          </div>
        </div>
      </Section>

      {/* Finance quote */}
      <Section title="Finance quote">
        <dl>
          <Line label="Finance type" value={(quote.financeType as string) || 'Hire Purchase'} />
          <Line label="Retail price" value={eur(qnum('retailPrice'))} />
          <Line label="Trade-in" value={p.hasTradeIn ? 'Yes' : 'No'} />
          {p.hasTradeIn ? <Line label="Estimated trade-in" value={eur(str('tradeInValue'))} /> : null}
          {p.hasTradeIn ? <Line label="Outstanding loan" value={eur(str('outstandingLoan'))} /> : null}
          {p.hasTradeIn && str('tradeInReg') ? <Line label="Trade-in reg" value={str('tradeInReg')} /> : null}
          <Line label="Cash deposit" value={eur(str('cashDeposit'))} />
          <Line label="Total deposit" value={eur(qnum('totalDeposit'))} />
          <Line label="Finance amount" value={eur(qnum('financeAmount'))} />
          <Line label="Interest rate" value={pct(qnum('interestRate'))} />
          <Line label="Term" value={`${str('termYears') || '—'} years (${qnum('months') ?? '—'} months)`} />
          <Line label="Document fee" value={eur(qnum('documentFee'))} />
          <Line label="Completion fee" value={eur(qnum('completionFee'))} />
          <Line label="Total cost of credit" value={eur(qnum('totalCostOfCredit'))} />
          <Line label="Total amount payable" value={eur(qnum('totalPayable'))} />
          <Line label="Representative APR" value={pct(qnum('apr'))} />
          <Line label="Monthly repayment" value={eur2(qnum('monthly'))} strong />
        </dl>
      </Section>

      {/* Applicant */}
      <Section title="Applicant">
        <dl>
          <Line label="Name" value={fullName || '—'} />
          <Line label="Mobile" value={str('mobile') || enquiry.phone || '—'} />
          <Line label="Email" value={str('email') || enquiry.email || '—'} />
        </dl>
      </Section>

      {/* Personal details */}
      <Section title="Personal details">
        <dl>
          <Line label="Street" value={str('street')} />
          <Line label="Town" value={str('town')} />
          <Line label="Eircode" value={str('eircode')} />
          <Line label="County" value={str('county')} />
          <Line label="Time at address" value={str('timeAtAddress')} />
          <Line label="Residential status" value={str('residentialStatus')} />
          <Line label="Banks with" value={str('bankWith')} />
          {str('otherBank') ? <Line label="Other bank" value={str('otherBank')} /> : null}
          <Line label="Branch" value={str('branch')} />
          <Line label="Time with branch" value={str('timeWithBranch')} />
          <Line label="Occupation" value={str('occupation')} />
          <Line label="ID type" value={str('idType')} />
          <Line label="ID number" value={str('idNumber')} />
        </dl>
      </Section>

      {/* Employment */}
      <Section title="Employment">
        <dl>
          <Line label="Employer" value={str('employer')} />
          <Line label="Work address" value={str('workAddress')} />
          <Line label="Work street" value={str('workStreet')} />
          <Line label="Work town" value={str('workTown')} />
          <Line label="Work Eircode" value={str('workEircode')} />
          <Line label="Work county" value={str('workCounty')} />
          {str('workPhone') ? <Line label="Work phone" value={str('workPhone')} /> : null}
          <Line label="Employment status" value={str('employmentStatus')} />
          <Line label="Time with employer" value={str('timeWithEmployer')} />
          <Line label="Monthly income (after tax)" value={eur(str('monthlyIncome'))} />
        </dl>
      </Section>

      {/* Consents */}
      <Section title="Consents">
        <dl>
          <Line label="Consent by applicant" value={yesNo('consentApplicant')} />
          <Line label="Confirmed over 18" value={yesNo('consentOver18')} />
          <Line label="Marketing consent" value={yesNo('marketing')} />
        </dl>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h4 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-teal">{title}</h4>
      {children}
    </div>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line/60 py-1.5 last:border-b-0">
      <dt className="text-xs text-ink/50">{label}</dt>
      <dd className={`text-right text-sm ${strong ? 'font-bold text-ink' : 'font-medium text-ink/80'}`}>
        {value || '—'}
      </dd>
    </div>
  );
}
