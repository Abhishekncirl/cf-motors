import type { ReactNode } from 'react';

/** Standard dark page header used by interior pages. */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-white/10 bg-gradient-to-b from-brand-grey to-brand-black">
      <div className="container-page py-12 sm:py-16">
        {eyebrow && <p className="section-eyebrow mb-3">{eyebrow}</p>}
        <h1 className="font-display text-3xl font-bold sm:text-4xl md:text-5xl">{title}</h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-base text-brand-white/70 sm:text-lg">{subtitle}</p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
