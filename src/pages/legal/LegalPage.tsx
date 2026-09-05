import type { ReactNode } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';

/** Shared shell + prose styling for legal documents. */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <PageHeader title={title} subtitle={`Last updated: ${updated}`} />
      <div className="container-page py-12">
        <div className="mb-8 rounded-lg border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          <strong>Draft scaffold.</strong> This document is a starting template and is
          <em> not legally complete</em>. Sections marked
          <span className="font-semibold"> [CLIENT TO REVIEW WITH SOLICITOR]</span> must be
          reviewed and finalised with a qualified solicitor before publishing.
        </div>
        <article className="prose-legal max-w-3xl space-y-6 text-brand-white/75">
          {children}
        </article>
      </div>
    </>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl font-bold text-brand-white">{heading}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed">{children}</div>
    </section>
  );
}
