/**
 * Hire-Purchase finance calculator + representative figures for the Apply For
 * Finance page.
 *
 * IMPORTANT (client / compliance):
 * ---------------------------------------------------------------------------
 * The rates and fees below are a REPRESENTATIVE EXAMPLE and must be confirmed
 * with CF Motor Sales' regulated finance partner before go-live. Advertising
 * regulated credit in Ireland (APR, monthly repayments, total cost of credit)
 * generally requires the business to be an authorised credit intermediary and
 * to meet Central Bank / Consumer Credit Act disclosure rules. Edit the values
 * in one place here to match the partner's actual product.
 */
export const FINANCE = {
  /** Product name shown in the summary. */
  type: 'Hire Purchase',
  /** Nominal annual interest rate (monthly reducing balance). */
  annualInterestRate: 0.089, // 8.90%  ← confirm with finance partner
  /** Minimum customer deposit as a fraction of the retail price. */
  minDepositPct: 0.1, // 10%
  /** One-off fees added to the total amount payable. */
  documentFee: 75,
  completionFee: 75,
  /** Selectable terms, in years. */
  terms: [1, 2, 3, 4, 5],
  defaultTermYears: 5,
} as const;

export interface FinanceInput {
  price: number;
  hasTradeIn: boolean;
  cashDeposit: number;
  tradeIn: number;
  outstandingLoan: number;
  termYears: number;
}

export interface FinanceResult {
  price: number;
  minDeposit: number;
  totalDeposit: number;
  financeAmount: number;
  months: number;
  monthly: number;
  totalOfPayments: number;
  fees: number;
  totalPayable: number;
  totalCostOfCredit: number;
  apr: number;
  belowMinDeposit: boolean;
  /** True once we have enough to show meaningful repayment figures. */
  ready: boolean;
}

const clampNum = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

/**
 * Standard amortising (reducing-balance) monthly payment.
 *   P·r / (1 − (1+r)^−n)
 */
function monthlyPayment(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRate / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

/**
 * Solve for the APR (annualised) that equates the amount financed to the
 * present value of the repayments plus the one-off fees, via bisection. The
 * document fee is treated as paid up front and the completion fee at the end,
 * which is why the APR sits a little above the nominal interest rate.
 */
function solveApr(financeAmount: number, monthly: number, months: number): number {
  if (financeAmount <= 0 || monthly <= 0 || months <= 0) return 0;
  const pv = (i: number) => {
    // Present value of what the customer pays, at monthly rate i.
    let sum = FINANCE.documentFee; // t0
    for (let k = 1; k <= months; k++) sum += monthly / Math.pow(1 + i, k);
    sum += FINANCE.completionFee / Math.pow(1 + i, months); // final month
    return sum;
  };
  let lo = 0;
  let hi = 0.05; // 5% monthly ≈ 80% APR ceiling
  for (let iter = 0; iter < 80; iter++) {
    const mid = (lo + hi) / 2;
    // pv decreases as i increases; we want pv(i) === financeAmount.
    if (pv(mid) > financeAmount) lo = mid;
    else hi = mid;
  }
  const monthlyRate = (lo + hi) / 2;
  return Math.pow(1 + monthlyRate, 12) - 1;
}

export function calcFinance(input: FinanceInput): FinanceResult {
  const price = clampNum(input.price);
  const cashDeposit = clampNum(input.cashDeposit);
  const tradeIn = input.hasTradeIn ? clampNum(input.tradeIn) : 0;
  const outstandingLoan = input.hasTradeIn ? clampNum(input.outstandingLoan) : 0;
  const months = Math.max(1, Math.round(input.termYears * 12));

  const minDeposit = Math.round(price * FINANCE.minDepositPct);
  const totalDeposit = Math.max(0, cashDeposit + tradeIn - outstandingLoan);
  const financeAmount = Math.max(0, price - totalDeposit);

  const monthly = monthlyPayment(financeAmount, FINANCE.annualInterestRate, months);
  const totalOfPayments = monthly * months;
  const fees = FINANCE.documentFee + FINANCE.completionFee;
  const totalPayable = totalOfPayments + fees;
  const totalCostOfCredit = Math.max(0, totalPayable - financeAmount);
  const apr = solveApr(financeAmount, monthly, months);

  const belowMinDeposit = totalDeposit < minDeposit;

  return {
    price,
    minDeposit,
    totalDeposit,
    financeAmount,
    months,
    monthly,
    totalOfPayments,
    fees,
    totalPayable,
    totalCostOfCredit,
    apr,
    belowMinDeposit,
    ready: price > 0 && !belowMinDeposit && financeAmount > 0,
  };
}

/** 26 counties of the Republic of Ireland, for the address selects. */
export const IRISH_COUNTIES = [
  'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway', 'Kerry',
  'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth',
  'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary',
  'Waterford', 'Westmeath', 'Wexford', 'Wicklow',
] as const;

export const TITLES = ['Mr', 'Mrs', 'Ms', 'Miss', 'Dr'] as const;
export const RESIDENTIAL_STATUS = ['Home Owner', 'Living with Parents', 'Tenant'] as const;
export const EMPLOYMENT_STATUS = [
  'Full-time', 'Part-time', 'Self-employed', 'Contract', 'Retired', 'Student', 'Unemployed',
] as const;
export const ID_TYPES = ['PPS Number', 'Business Registration Number'] as const;
/** Options for the "time at / with" selects (years). */
export const YEAR_RANGES = ['Less than 1', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'] as const;
