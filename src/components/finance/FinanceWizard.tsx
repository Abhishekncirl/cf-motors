import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import type { Vehicle } from '../../lib/types';
import { queryVehicles } from '../../lib/vehicles';
import { submitEnquiry } from '../../lib/enquiries';
import { formatPrice, formatNumber } from '../../lib/format';
import { validEmail, validPhone } from '../../lib/validate';
import {
  FINANCE, calcFinance, IRISH_COUNTIES, TITLES, RESIDENTIAL_STATUS,
  EMPLOYMENT_STATUS, ID_TYPES, YEAR_RANGES,
} from '../../lib/finance';

type Step = 1 | 2 | 3;

const money = (n: number) => `€${formatNumber(Math.round(n))}`;
const eur2 = (n: number) => `€${n.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Initial (empty) form state. */
const EMPTY = {
  title: 'Mr', firstName: '', surname: '', mobile: '', email: '', vehicleId: '',
  cashDeposit: '', tradeInValue: '', outstandingLoan: '', tradeInReg: '', termYears: String(FINANCE.defaultTermYears),
  street: '', town: '', eircode: '', county: '', timeAtAddress: '', residentialStatus: '',
  bankWith: '', otherBank: '', branch: '', timeWithBranch: '', occupation: '', idType: '', idNumber: '',
  employer: '', workAddress: '', workStreet: '', workTown: '', workEircode: '', workCounty: '',
  workPhone: '', employmentStatus: '', timeWithEmployer: '', monthlyIncome: '',
};
type FormState = typeof EMPTY;

export function FinanceWizard({ initialVehicleId }: { initialVehicleId?: string }) {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>({ ...EMPTY, vehicleId: initialVehicleId ?? '' });
  const [hasTradeIn, setHasTradeIn] = useState(false);
  const [consentApplicant, setConsentApplicant] = useState(false);
  const [consentOver18, setConsentOver18] = useState(false);
  const [marketing, setMarketing] = useState<'' | 'yes' | 'no'>('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [showInfo, setShowInfo] = useState(false);

  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const num = (v: string) => (v.trim() === '' ? 0 : Number(v.replace(/[^0-9.]/g, '')) || 0);

  useEffect(() => {
    queryVehicles({}, 'newest', 1, 500)
      .then((r) => setVehicles(r.items))
      .catch(() => setVehicles([]));
  }, []);

  const vehicle = useMemo(
    () => vehicles.find((v) => v.id === form.vehicleId) ?? null,
    [vehicles, form.vehicleId]
  );
  const price = vehicle?.price ?? 0;

  const result = useMemo(
    () => calcFinance({
      price,
      hasTradeIn,
      cashDeposit: num(form.cashDeposit),
      tradeIn: num(form.tradeInValue),
      outstandingLoan: num(form.outstandingLoan),
      termYears: Number(form.termYears) || FINANCE.defaultTermYears,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [price, hasTradeIn, form.cashDeposit, form.tradeInValue, form.outstandingLoan, form.termYears]
  );

  // ---- per-step validation ----
  function validateStep(s: Step): boolean {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!form.firstName.trim()) e.firstName = 'Enter your first name';
      if (!form.surname.trim()) e.surname = 'Enter your surname';
      const p = validPhone(form.mobile); if (p) e.mobile = p;
      const em = validEmail(form.email); if (em) e.email = em;
      if (!form.vehicleId) e.vehicleId = 'Choose a vehicle';
    }
    if (s === 2) {
      if (!vehicle) e.vehicleId = 'Choose a vehicle in step 1';
      else if (result.belowMinDeposit)
        e.cashDeposit = `Minimum deposit is ${money(result.minDeposit)} (10% of price)`;
    }
    if (s === 3) {
      for (const [k, label] of [
        ['street', 'Street'], ['town', 'Town'], ['eircode', 'Eircode'], ['county', 'County'],
        ['timeAtAddress', 'Time at address'], ['residentialStatus', 'Residential status'],
        ['bankWith', 'Bank'], ['branch', 'Branch'], ['timeWithBranch', 'Time with branch'],
        ['occupation', 'Occupation'], ['idType', 'ID type'], ['idNumber', 'ID number'],
        ['employer', 'Employer'], ['workAddress', 'Work address'], ['workStreet', 'Work street'],
        ['workTown', 'Work town'], ['workEircode', 'Work Eircode'], ['workCounty', 'Work county'],
        ['employmentStatus', 'Employment status'], ['timeWithEmployer', 'Time with employer'],
        ['monthlyIncome', 'Monthly income'],
      ] as const) {
        if (!String(form[k]).trim()) e[k] = `${label} is required`;
      }
      if (!consentApplicant) e.consentApplicant = 'Consent is required to proceed';
      if (!consentOver18) e.consentOver18 = 'You must confirm you are over 18';
      if (!marketing) e.marketing = 'Please choose Yes or No';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validateStep(step)) {
      setStep((s) => (Math.min(3, s + 1) as Step));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  function prev() {
    setStep((s) => (Math.max(1, s - 1) as Step));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function submit() {
    if (!validateStep(3)) return;
    setStatus('sending');
    try {
      const summary = vehicle
        ? `Finance application for ${vehicle.year} ${vehicle.make} ${vehicle.model} (Ref ${vehicle.stockRef}). ` +
          `${FINANCE.type}, ${result.months} months, deposit ${money(result.totalDeposit)}, ` +
          `finance ${money(result.financeAmount)}, ~${eur2(result.monthly)}/mo, APR ${(result.apr * 100).toFixed(2)}%.`
        : 'Finance application.';
      await submitEnquiry({
        type: 'finance',
        vehicleId: form.vehicleId || null,
        name: `${form.firstName} ${form.surname}`.trim(),
        email: form.email,
        phone: form.mobile,
        message: summary,
        payload: {
          ...form,
          hasTradeIn, consentApplicant, consentOver18, marketing,
          quote: {
            financeType: FINANCE.type, retailPrice: result.price, totalDeposit: result.totalDeposit,
            financeAmount: result.financeAmount, interestRate: FINANCE.annualInterestRate,
            months: result.months, monthly: Math.round(result.monthly * 100) / 100,
            totalCostOfCredit: Math.round(result.totalCostOfCredit),
            totalPayable: Math.round(result.totalPayable),
            apr: Math.round(result.apr * 10000) / 100,
            documentFee: FINANCE.documentFee, completionFee: FINANCE.completionFee,
          },
        },
      });
      setStatus('sent');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="card p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-7 w-7 shrink-0 text-teal" aria-hidden />
          <div>
            <h3 className="font-display text-xl font-bold">Application received, {form.firstName || 'thanks'}!</h3>
            <p className="mt-2 text-sm text-ink/70">
              Thanks for applying. We’ll pass this to our finance partner and get back to you -
              typically within one working day. There’s no obligation to proceed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Wizard header bar */}
      <div className="flex items-center justify-between gap-3 border-b border-line bg-brand-cyan/10 px-5 py-4">
        <h2 className="font-display text-lg font-bold text-ink">
          {step === 1 ? 'Contact Details' : step === 2 ? 'Finance Calculator' : 'Your Details'}
        </h2>
        <span className="text-sm font-semibold text-ink/70">Step {step} of 3</span>
      </div>

      <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-xs text-ink/50">
            <span className="text-teal">*</span> Indicates required field
          </p>
          <button type="button" onClick={() => setShowInfo(true)} className="text-sm font-semibold text-teal hover:underline">
            What happens if I fill in the form?
          </button>
        </div>

        {status === 'error' && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle size={16} /> Something went wrong. Please try again or contact us.
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <Row label="Title" required>
              <Select value={form.title} onChange={(v) => set('title', v)}>
                {TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Row>
            <Row label="First Name" required error={errors.firstName}>
              <Input value={form.firstName} onChange={(v) => set('firstName', v)} autoComplete="given-name" />
            </Row>
            <Row label="Surname" required error={errors.surname}>
              <Input value={form.surname} onChange={(v) => set('surname', v)} autoComplete="family-name" />
            </Row>
            <Row label="Mobile Number" required error={errors.mobile}>
              <Input value={form.mobile} onChange={(v) => set('mobile', v)} type="tel" inputMode="tel" autoComplete="tel" />
            </Row>
            <Row label="Email" required error={errors.email}>
              <Input value={form.email} onChange={(v) => set('email', v)} type="email" inputMode="email" autoComplete="email" />
            </Row>
            <Row label="Choose a Vehicle" required error={errors.vehicleId}>
              <Select value={form.vehicleId} onChange={(v) => set('vehicleId', v)}>
                <option value="">Please select a vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.year} - {v.make} {v.model} - {formatPrice(v.price)}{v.stockRef ? ` - ${v.stockRef}` : ''}
                  </option>
                ))}
              </Select>
            </Row>

            {vehicle && (
              <div className="grid gap-4 rounded-lg border border-line bg-page p-4 sm:grid-cols-2">
                {vehicle.images[0]?.url ? (
                  <img src={vehicle.images[0].url} alt="" className="aspect-[4/3] w-full rounded-md object-cover" />
                ) : (
                  <div className="aspect-[4/3] w-full rounded-md bg-ink/5" />
                )}
                <dl className="divide-y divide-line text-sm">
                  <SpecRow k="Make" v={vehicle.make} />
                  <SpecRow k="Model" v={vehicle.model} />
                  <SpecRow k="Year" v={String(vehicle.year)} />
                  <SpecRow k="Mileage" v={`${formatNumber(vehicle.mileageKm)} km`} />
                  <SpecRow k="Retail Price" v={formatPrice(vehicle.price)} />
                </dl>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {!vehicle && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                Please choose a vehicle in step 1 first.
              </p>
            )}
            {vehicle && result.belowMinDeposit && (
              <div className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                Minimum deposit amount required is {money(result.minDeposit)}
              </div>
            )}
            {vehicle && (
              <div className="rounded-md bg-teal/10 px-4 py-3 text-sm text-teal">
                To proceed with your application on this vehicle you will need to enter a minimum of{' '}
                <strong>{money(result.minDeposit)}</strong> ({Math.round(FINANCE.minDepositPct * 100)}% of vehicle price)
              </div>
            )}

            <div className="flex items-center justify-between rounded-md bg-brand-cyan/10 px-4 py-3">
              <span className="font-semibold text-ink">Retail Price:</span>
              <span className="font-bold text-ink">{formatPrice(price)}</span>
            </div>

            <Row label="Do you have a Trade-In?">
              <div className="flex gap-2">
                <Toggle active={hasTradeIn} onClick={() => setHasTradeIn(true)} tone="yes">Yes</Toggle>
                <Toggle active={!hasTradeIn} onClick={() => setHasTradeIn(false)} tone="no">No</Toggle>
              </div>
            </Row>

            <Row label="Cash Deposit" error={errors.cashDeposit}>
              <MoneyInput value={form.cashDeposit} onChange={(v) => set('cashDeposit', v)} />
            </Row>

            {hasTradeIn && (
              <>
                <Row label="Estimate Trade-In"><MoneyInput value={form.tradeInValue} onChange={(v) => set('tradeInValue', v)} /></Row>
                <Row label="Outstanding Loan"><MoneyInput value={form.outstandingLoan} onChange={(v) => set('outstandingLoan', v)} /></Row>
                <Row label="Total Deposit">
                  <div className="field-input bg-page font-semibold">{money(result.totalDeposit)}</div>
                </Row>
                <Row label="Trade-In Car Registration Number">
                  <Input value={form.tradeInReg} onChange={(v) => set('tradeInReg', v.toUpperCase())} />
                </Row>
              </>
            )}

            <div className="flex items-center justify-between rounded-md bg-brand-cyan/10 px-4 py-4">
              <span className="font-bold text-ink">Total Finance Amount:</span>
              <span className="font-bold text-ink">{result.financeAmount > 0 ? money(result.financeAmount) : '€ ---'}</span>
            </div>

            <Row label={<span className="inline-flex items-center gap-1">Term <Info size={14} className="text-ink/40" /></span>}>
              <div>
                <Select value={form.termYears} onChange={(v) => set('termYears', v)}>
                  {FINANCE.terms.map((y) => <option key={y} value={y}>{y} {y === 1 ? 'year' : 'years'}</option>)}
                </Select>
                <p className="mt-1 text-right text-sm text-ink/55">
                  {result.months} repayments of {result.ready ? eur2(result.monthly) : '€---'}
                </p>
              </div>
            </Row>

            {/* Summary */}
            <div className="rounded-lg bg-brand-cyan/[0.06] p-4">
              <h3 className="mb-2 font-display text-lg font-bold">Summary</h3>
              <dl className="divide-y divide-line text-sm">
                <SumRow k="Finance Type" v={FINANCE.type} />
                <SumRow k="Retail Price" v={formatPrice(price)} />
                <SumRow k="Your Deposit" v={money(result.totalDeposit)} />
                <SumRow k="Finance Amount" v={money(result.financeAmount)} />
                <SumRow k="Interest Rate" v={`${(FINANCE.annualInterestRate * 100).toFixed(2)}%`} />
                <SumRow k="Minimum Deposit Percentage" v={`${Math.round(FINANCE.minDepositPct * 100)}%`} />
                <SumRow k="Document Fee" v={eur2(FINANCE.documentFee)} />
                <SumRow k="Completion Fee" v={eur2(FINANCE.completionFee)} />
                <SumRow k="Term" v={`${form.termYears} ${form.termYears === '1' ? 'year' : 'years'}`} />
                <SumRow k="Total Cost of Credit" v={result.ready ? money(result.totalCostOfCredit) : '€---'} />
                <SumRow k="Total Amount Payable" v={result.ready ? money(result.totalPayable) : '€---'} />
                <SumRow k="Representative APR" v={result.ready ? `${(result.apr * 100).toFixed(2)}%` : '---'} />
                <SumRow k="Monthly Repayments" v={result.ready ? eur2(result.monthly) : '€---'} />
              </dl>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <Section title="Your Details">
              <Row label="Street" required error={errors.street}><Input value={form.street} onChange={(v) => set('street', v)} /></Row>
              <Row label="Town" required error={errors.town}><Input value={form.town} onChange={(v) => set('town', v)} /></Row>
              <Row label="Eircode" required error={errors.eircode}><Input value={form.eircode} onChange={(v) => set('eircode', v.toUpperCase())} /></Row>
              <Row label="County" required error={errors.county}><CountySelect value={form.county} onChange={(v) => set('county', v)} /></Row>
              <Row label="Time at this Address (in Years)" required error={errors.timeAtAddress}><YearSelect value={form.timeAtAddress} onChange={(v) => set('timeAtAddress', v)} /></Row>
              <Row label="Residential Status" required error={errors.residentialStatus}>
                <Select value={form.residentialStatus} onChange={(v) => set('residentialStatus', v)}>
                  <option value="">Please select</option>
                  {RESIDENTIAL_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </Row>
              <Row label="Who do you normally bank with" required error={errors.bankWith}><Input value={form.bankWith} onChange={(v) => set('bankWith', v)} /></Row>
              <Row label="If other bank, Please specify"><Input value={form.otherBank} onChange={(v) => set('otherBank', v)} /></Row>
              <Row label="Branch" required error={errors.branch}><Input value={form.branch} onChange={(v) => set('branch', v)} /></Row>
              <Row label="Time with Branch" required error={errors.timeWithBranch}><YearSelect value={form.timeWithBranch} onChange={(v) => set('timeWithBranch', v)} /></Row>
              <Row label="Occupation" required error={errors.occupation}><Input value={form.occupation} onChange={(v) => set('occupation', v)} /></Row>
              <Row label="Identification Type" required error={errors.idType}>
                <Select value={form.idType} onChange={(v) => set('idType', v)}>
                  <option value="">Please select</option>
                  {ID_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </Select>
              </Row>
              <Row label="Identification Number (e.g. PPS)" required error={errors.idNumber}><Input value={form.idNumber} onChange={(v) => set('idNumber', v)} /></Row>
            </Section>

            <Section title="Employment Details">
              <Row label="Employer" required error={errors.employer}><Input value={form.employer} onChange={(v) => set('employer', v)} /></Row>
              <Row label="Address name or number (Work)" required error={errors.workAddress}><Input value={form.workAddress} onChange={(v) => set('workAddress', v)} /></Row>
              <Row label="Street (Work)" required error={errors.workStreet}><Input value={form.workStreet} onChange={(v) => set('workStreet', v)} /></Row>
              <Row label="Town (Work)" required error={errors.workTown}><Input value={form.workTown} onChange={(v) => set('workTown', v)} /></Row>
              <Row label="Eircode (Work)" required error={errors.workEircode}><Input value={form.workEircode} onChange={(v) => set('workEircode', v.toUpperCase())} /></Row>
              <Row label="County (Work)" required error={errors.workCounty}><CountySelect value={form.workCounty} onChange={(v) => set('workCounty', v)} /></Row>
              <Row label="Telephone (Work)"><Input value={form.workPhone} onChange={(v) => set('workPhone', v)} type="tel" inputMode="tel" /></Row>
              <Row label="Employment Status" required error={errors.employmentStatus}>
                <Select value={form.employmentStatus} onChange={(v) => set('employmentStatus', v)}>
                  <option value="">Please select</option>
                  {EMPLOYMENT_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </Row>
              <Row label="Time with Employer (in Years)" required error={errors.timeWithEmployer}><YearSelect value={form.timeWithEmployer} onChange={(v) => set('timeWithEmployer', v)} /></Row>
              <Row label="Monthly Income after Tax" required error={errors.monthlyIncome}><MoneyInput value={form.monthlyIncome} onChange={(v) => set('monthlyIncome', v)} /></Row>
            </Section>

            <Section title="Data Protection and Consents">
              <div className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <strong>Warning!</strong> if you do not meet the repayments on your credit agreement, your account
                will go into arrears. This may affect your credit rating, which may limit your ability to access
                credit in the future.
              </div>
              <p className="text-sm text-ink/70">
                The information you provide on this form will be forwarded to one or more regulated finance
                providers to assess the finance products available to you. As part of this, credit searches may be
                made with credit reference agencies (including the Irish Credit Bureau), which will make a record of
                the search. By ticking the box below you consent to the use and disclosure of this information for
                these purposes.
              </p>
              <Check checked={consentApplicant} onChange={setConsentApplicant} error={errors.consentApplicant}>
                Tick here to confirm consent by applicant <span className="text-teal">*</span>
              </Check>
              <Check checked={consentOver18} onChange={setConsentOver18} error={errors.consentOver18}>
                Tick here to confirm you are over 18 years of age <span className="text-teal">*</span>
              </Check>
              <div>
                <p className="text-sm text-ink">I consent to receive marketing communication from CF Motor Sales <span className="text-teal">*</span></p>
                <div className="mt-2 flex gap-6 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="mkt" checked={marketing === 'yes'} onChange={() => setMarketing('yes')} /> Yes
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="mkt" checked={marketing === 'no'} onChange={() => setMarketing('no')} /> No
                  </label>
                </div>
                {errors.marketing && <p className="field-error">{errors.marketing}</p>}
              </div>
            </Section>
          </div>
        )}

        {/* Nav buttons */}
        <div className="mt-6 flex items-center justify-center gap-3">
          {step > 1 && (
            <button type="button" onClick={prev} className="btn-outline">Previous</button>
          )}
          {step < 3 && (
            <button type="button" onClick={next} className="btn-primary">Next</button>
          )}
          {step === 3 && (
            <button type="button" onClick={submit} disabled={status === 'sending'} className="btn-primary disabled:opacity-60">
              {status === 'sending' ? 'Submitting…' : 'Submit'}
            </button>
          )}
        </div>
      </div>

      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
    </div>
  );
}

/* ---------- small building blocks ---------- */

function Row({ label, required, error, children }: { label: ReactNode; required?: boolean; error?: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] sm:items-start sm:gap-4">
      <label className="pt-0 text-sm font-medium text-ink/70 sm:pt-2.5">
        {label} {required && <span className="text-teal">*</span>}
      </label>
      <div className="min-w-0">
        {children}
        {error && <p className="field-error">{error}</p>}
      </div>
    </div>
  );
}

function Input({ value, onChange, type = 'text', inputMode, autoComplete }: {
  value: string; onChange: (v: string) => void; type?: string;
  inputMode?: 'text' | 'email' | 'tel' | 'numeric' | 'decimal'; autoComplete?: string;
}) {
  return (
    <input
      className="field-input" value={value} type={type} inputMode={inputMode} autoComplete={autoComplete}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function MoneyInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/50">€</span>
      <input
        className="field-input pl-7" value={value} inputMode="numeric" placeholder="0"
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ''))}
      />
    </div>
  );
}

function Select({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: ReactNode }) {
  return (
    <select className="field-input" value={value} onChange={(e) => onChange(e.target.value)}>
      {children}
    </select>
  );
}

function CountySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Select value={value} onChange={onChange}>
      <option value="">Please select</option>
      {IRISH_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
    </Select>
  );
}

function YearSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Select value={value} onChange={onChange}>
      <option value="">Please select</option>
      {YEAR_RANGES.map((y) => <option key={y} value={y}>{y}</option>)}
    </Select>
  );
}

function Toggle({ active, onClick, tone, children }: { active: boolean; onClick: () => void; tone: 'yes' | 'no'; children: ReactNode }) {
  const base = 'rounded-md px-5 py-2 text-sm font-semibold transition-colors';
  const on = tone === 'yes' ? 'bg-teal text-white' : 'bg-ink text-white';
  const off = 'bg-ink/10 text-ink/60 hover:bg-ink/15';
  return <button type="button" onClick={onClick} className={`${base} ${active ? on : off}`}>{children}</button>;
}

function Check({ checked, onChange, error, children }: { checked: boolean; onChange: (v: boolean) => void; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className="flex items-start gap-2.5 text-sm text-ink/80">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-teal" />
        <span>{children}</span>
      </label>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="-mx-5 border-y border-line bg-brand-cyan/10 px-5 py-2.5 sm:-mx-6 sm:px-6">
        <h3 className="font-display text-base font-bold text-ink">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SpecRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <dt className="text-ink/55">{k}:</dt>
      <dd className="font-semibold text-ink">{v}</dd>
    </div>
  );
}

function SumRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <dt className="font-semibold text-ink">{k}:</dt>
      <dd className="text-ink">{v}</dd>
    </div>
  );
}

function InfoModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8" role="dialog" aria-modal="true">
      <div className="card my-8 w-full max-w-2xl p-6 sm:p-8">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="font-display text-2xl font-bold">What happens if I fill in the form?</h3>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-ink/50 hover:text-ink" aria-label="Close"><X size={22} /></button>
        </div>
        <div className="space-y-4 text-sm text-ink/75">
          <p className="font-semibold text-ink">Applying for Finance</p>
          <p>By completing this online finance application form we’ll be able to quickly and accurately get back to you with a decision on the vehicle financing options available to you.</p>
          <p className="font-semibold text-ink">You can be confident that by completing this form:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>There is no obligation to purchase anything</li>
            <li>Competitive APRs are always offered</li>
            <li>Our form is quick and simple to complete, even on a mobile device</li>
          </ul>
          <p className="font-semibold text-ink">Step 1: We seek approval for your application</p>
          <p>We pass this application to our finance partner, who will review it. Typically you’ll receive a response within one working day.</p>
          <p className="font-semibold text-ink">Step 2: Return contact from the seller</p>
          <p>We’ll get in touch about the outcome. You’ll see the car, in person or virtually, and finalise the finance agreement and paperwork. If you choose a different car, your application can usually be reused.</p>
          <p className="font-semibold text-ink">Step 3: Drive away</p>
          <p>With pre-approval there’s much less to do at the dealership and waiting on finance won’t hold things up - so you get driving your new car sooner.</p>
        </div>
        <div className="mt-6 text-right">
          <button type="button" onClick={onClose} className="btn-primary">OK, got it</button>
        </div>
      </div>
    </div>
  );
}
