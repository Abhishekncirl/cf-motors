import type { Enquiry, Vehicle } from './types';
import { BUSINESS } from '../config/business';
import { formatNumber } from './format';

/**
 * Build a clean, printable HTML document for a finance application, suitable
 * for both a Word (.doc) download and a print-to-PDF. No external libraries -
 * Word opens HTML-based .doc files, and the browser's print dialog produces a
 * PDF from the same markup.
 */

const esc = (v: unknown): string =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

function money(v: unknown): string {
  const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n !== 0 ? `€${formatNumber(Math.round(n))}` : v ? `€${esc(v)}` : '—';
}
function money2(v: unknown): string {
  const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n !== 0
    ? `€${n.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '—';
}
function pct(v: unknown): string {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n) || n === 0) return '—';
  return `${(n <= 1 ? n * 100 : n).toFixed(2)}%`;
}
const yesNo = (v: unknown) => (v === true || v === 'yes' ? 'Yes' : v === false || v === 'no' ? 'No' : '—');

type Row = [string, string];
function section(title: string, rows: Row[]): string {
  const body = rows
    .filter(([, v]) => v && v !== '—')
    .map(
      ([k, v]) =>
        `<tr><td class="k">${esc(k)}</td><td class="v">${esc(v)}</td></tr>`
    )
    .join('');
  if (!body) return '';
  return `<h2>${esc(title)}</h2><table class="tbl">${body}</table>`;
}

/**
 * Try to fetch an image and return it as a base64 data URL so it can be
 * embedded directly in the document (survives being emailed offline). Falls
 * back to null if the fetch is blocked (e.g. CORS), in which case the caller
 * uses the raw URL, which still displays while online.
 */
export async function imageToDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export function buildFinanceDocHtml(enquiry: Enquiry, vehicle: Vehicle | null, imageSrc?: string | null): string {
  const p = enquiry.payload as Record<string, unknown>;
  const q = (p.quote as Record<string, unknown>) ?? {};
  const s = (k: string) => (p[k] == null ? '' : String(p[k]));
  const name = `${s('title')} ${s('firstName')} ${s('surname')}`.trim();
  const date = new Date(enquiry.createdAt).toLocaleString('en-IE', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const vehicleRows: Row[] = vehicle
    ? [
        ['Vehicle', `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.variant}`.trim()],
        ['Retail price', money(vehicle.price)],
        ['Mileage', `${formatNumber(vehicle.mileageKm)} km`],
        ['Fuel / Transmission', `${vehicle.fuelType} · ${vehicle.transmission}`],
        ['Stock reference', vehicle.stockRef || '—'],
      ]
    : [['Vehicle', enquiry.vehicleId ? `Not in current stock (id: ${enquiry.vehicleId})` : 'Not recorded']];

  const quoteRows: Row[] = [
    ['Finance type', (q.financeType as string) || 'Hire Purchase'],
    ['Retail price', money(q.retailPrice)],
    ['Trade-in', p.hasTradeIn ? 'Yes' : 'No'],
    ...(p.hasTradeIn
      ? ([
          ['Estimated trade-in', money(s('tradeInValue'))],
          ['Outstanding loan', money(s('outstandingLoan'))],
          ['Trade-in registration', s('tradeInReg')],
        ] as Row[])
      : []),
    ['Cash deposit', money(s('cashDeposit'))],
    ['Total deposit', money(q.totalDeposit)],
    ['Finance amount', money(q.financeAmount)],
    ['Interest rate', pct(q.interestRate)],
    ['Term', `${s('termYears') || '—'} years (${q.months ?? '—'} months)`],
    ['Document fee', money(q.documentFee)],
    ['Completion fee', money(q.completionFee)],
    ['Total cost of credit', money(q.totalCostOfCredit)],
    ['Total amount payable', money(q.totalPayable)],
    ['Representative APR', pct(q.apr)],
    ['Monthly repayment', money2(q.monthly)],
  ];

  const applicantRows: Row[] = [
    ['Name', name],
    ['Mobile', s('mobile') || enquiry.phone],
    ['Email', s('email') || enquiry.email],
  ];

  const personalRows: Row[] = [
    ['Street', s('street')], ['Town', s('town')], ['Eircode', s('eircode')], ['County', s('county')],
    ['Time at address', s('timeAtAddress')], ['Residential status', s('residentialStatus')],
    ['Banks with', s('bankWith')], ['Other bank', s('otherBank')], ['Branch', s('branch')],
    ['Time with branch', s('timeWithBranch')], ['Occupation', s('occupation')],
    ['ID type', s('idType')], ['ID number', s('idNumber')],
  ];

  const employmentRows: Row[] = [
    ['Employer', s('employer')], ['Address name/number (work)', s('workAddress')],
    ['Street (work)', s('workStreet')], ['Town (work)', s('workTown')], ['Eircode (work)', s('workEircode')],
    ['County (work)', s('workCounty')], ['Telephone (work)', s('workPhone')],
    ['Employment status', s('employmentStatus')], ['Time with employer', s('timeWithEmployer')],
    ['Monthly income (after tax)', money(s('monthlyIncome'))],
  ];

  const consentRows: Row[] = [
    ['Consent by applicant', yesNo(p.consentApplicant)],
    ['Confirmed over 18', yesNo(p.consentOver18)],
    ['Marketing consent', yesNo(p.marketing)],
  ];

  const style = `
    body{font-family:Arial,Helvetica,sans-serif;color:#14181F;font-size:12px;margin:24px;}
    .head{border-bottom:3px solid #0E8C87;padding-bottom:10px;margin-bottom:16px;}
    .brand{font-size:20px;font-weight:bold;letter-spacing:.5px;}
    .sub{color:#59636F;font-size:11px;margin-top:2px;}
    .title{font-size:16px;font-weight:bold;margin:14px 0 4px;}
    .meta{color:#59636F;font-size:11px;margin-bottom:8px;}
    h2{font-size:12px;text-transform:uppercase;letter-spacing:.6px;color:#0E8C87;border-bottom:1px solid #E2E6EB;padding-bottom:3px;margin:16px 0 6px;}
    table.tbl{width:100%;border-collapse:collapse;margin-bottom:4px;}
    table.tbl td{padding:4px 6px;border-bottom:1px solid #EEF1F4;vertical-align:top;}
    td.k{color:#59636F;width:42%;}
    td.v{font-weight:bold;}
    .carimg{max-width:260px;max-height:180px;border:1px solid #E2E6EB;border-radius:6px;margin:4px 0 8px;}
    .foot{margin-top:20px;color:#8a929b;font-size:10px;border-top:1px solid #E2E6EB;padding-top:8px;}
  `;

  const carImg = imageSrc
    ? `<div><img class="carimg" src="${esc(imageSrc)}" alt="Selected vehicle" /></div>`
    : '';

  return `<!doctype html><html><head><meta charset="utf-8"><title>Finance Application - ${esc(name)}</title>
<style>${style}</style></head><body>
  <div class="head">
    <div class="brand">${esc(BUSINESS.name)}</div>
    <div class="sub">${esc(BUSINESS.tagline || '')} · ${esc(BUSINESS.phoneDisplay || '')} · ${esc(BUSINESS.email || '')}</div>
  </div>
  <div class="title">Vehicle Finance Application</div>
  <div class="meta">Reference: ${esc(enquiry.id)} &nbsp;|&nbsp; Submitted: ${esc(date)}</div>
  <h2>Vehicle selected for finance</h2>
  ${carImg}
  <table class="tbl">${vehicleRows.filter(([, v]) => v && v !== '—').map(([k, v]) => `<tr><td class="k">${esc(k)}</td><td class="v">${esc(v)}</td></tr>`).join('')}</table>
  ${section('Finance quote', quoteRows)}
  ${section('Applicant', applicantRows)}
  ${section('Personal details', personalRows)}
  ${section('Employment', employmentRows)}
  ${section('Data protection & consents', consentRows)}
  <div class="foot">
    This document was generated from a customer finance enquiry submitted on the ${esc(BUSINESS.name)} website.
    Figures are a representative example and subject to status, approval and terms. Please verify all details with
    the applicant and finance provider.
  </div>
</body></html>`;
}

/** A safe file-name stem from the applicant's name. */
function fileStem(enquiry: Enquiry): string {
  const p = enquiry.payload as Record<string, unknown>;
  const name = `${p.firstName ?? ''} ${p.surname ?? ''}`.trim() || enquiry.name || 'applicant';
  return `${name}-finance-application`.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
}

/** Resolve the best image source for the document: embedded data URL if we can
 * fetch it (survives emailing), otherwise the raw URL, otherwise none. */
async function resolveCarImage(vehicle: Vehicle | null): Promise<string | null> {
  const url = vehicle?.images?.[0]?.url;
  if (!url) return null;
  return (await imageToDataUrl(url)) ?? url;
}

/** Download the application as a Word-compatible .doc file. */
export async function downloadFinanceWord(enquiry: Enquiry, vehicle: Vehicle | null): Promise<void> {
  const img = await resolveCarImage(vehicle);
  const html = buildFinanceDocHtml(enquiry, vehicle, img);
  const blob = new Blob(['﻿', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileStem(enquiry)}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Build a `mailto:` link to the finance team, pre-filled with a plain-text
 * summary of the application. (Browsers can't attach files to a mailto, so the
 * admin attaches the downloaded Word/PDF manually - the button text says so.)
 */
export function financeEmailHref(enquiry: Enquiry, vehicle: Vehicle | null): string {
  const p = enquiry.payload as Record<string, unknown>;
  const q = (p.quote as Record<string, unknown>) ?? {};
  const s = (k: string) => (p[k] == null ? '' : String(p[k]));
  const name = `${s('title')} ${s('firstName')} ${s('surname')}`.trim() || enquiry.name;
  const car = vehicle
    ? `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.variant}`.trim()
    : 'Not recorded';

  const lines = [
    `New finance application from the ${BUSINESS.name} website.`,
    ``,
    `Applicant: ${name}`,
    `Mobile: ${s('mobile') || enquiry.phone}`,
    `Email: ${s('email') || enquiry.email}`,
    ``,
    `Vehicle: ${car}`,
    vehicle ? `Retail price: ${money(vehicle.price)}` : '',
    vehicle && vehicle.stockRef ? `Stock ref: ${vehicle.stockRef}` : '',
    ``,
    `--- Finance quote ---`,
    `Finance type: ${(q.financeType as string) || 'Hire Purchase'}`,
    `Total deposit: ${money(q.totalDeposit)}`,
    `Finance amount: ${money(q.financeAmount)}`,
    `Interest rate: ${pct(q.interestRate)}`,
    `Term: ${s('termYears')} years (${q.months ?? '—'} months)`,
    `Monthly repayment: ${money2(q.monthly)}`,
    `Total amount payable: ${money(q.totalPayable)}`,
    `Representative APR: ${pct(q.apr)}`,
    ``,
    `Reference: ${enquiry.id}`,
    `Submitted: ${new Date(enquiry.createdAt).toLocaleString('en-IE')}`,
    ``,
    `Please attach the full application (Word/PDF) exported from the admin panel.`,
  ].filter((l) => l !== undefined);

  const subject = `Finance application - ${name}${vehicle ? ` - ${vehicle.make} ${vehicle.model}` : ''}`;
  return `mailto:${encodeURIComponent(BUSINESS.financeTeamEmail)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(lines.join('\n'))}`;
}

/**
 * Open the application in a hidden iframe and trigger the print dialog, so the
 * user can "Save as PDF". Avoids pop-up blockers and keeps the admin page.
 */
export async function printFinancePdf(enquiry: Enquiry, vehicle: Vehicle | null): Promise<void> {
  const img = await resolveCarImage(vehicle);
  const html = buildFinanceDocHtml(enquiry, vehicle, img);
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(html);
  doc.close();
  const win = iframe.contentWindow;
  const cleanup = () => setTimeout(() => iframe.remove(), 1000);
  if (win) {
    win.focus();
    // Give the iframe a tick to lay out before printing.
    setTimeout(() => {
      win.print();
      cleanup();
    }, 250);
  } else {
    cleanup();
  }
}
