import { useEffect } from 'react';
import { BUSINESS } from '../config/business';

interface SeoProps {
  title: string;
  description: string;
  /** Path-only canonical, e.g. "/stock". Defaults to current location. */
  path?: string;
  image?: string;
  noindex?: boolean;
}

/**
 * Lightweight head manager. Sets document title, meta description, canonical and
 * Open Graph/Twitter tags per page without pulling in a helmet dependency.
 * SSR is not used (GitHub Pages static hosting); crawlers that execute JS and
 * the pre-render friendly 404 redirect keep deep links indexable.
 */
export function Seo({ title, description, path, image, noindex }: SeoProps) {
  useEffect(() => {
    const fullTitle = title.includes(BUSINESS.name) ? title : `${title} | ${BUSINESS.name}`;
    document.title = fullTitle;

    const canonicalPath = path ?? window.location.pathname;
    const canonicalUrl = `${BUSINESS.siteUrl}${canonicalPath}`;
    const ogImage = image || `${BUSINESS.siteUrl}/og-default.jpg`;

    setMeta('name', 'description', description);
    setMeta('name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow');
    setLink('canonical', canonicalUrl);

    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:image', ogImage);
    setMeta('property', 'og:site_name', BUSINESS.name);

    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', ogImage);
  }, [title, description, path, image, noindex]);

  return null;
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** Injects a JSON-LD structured-data block, cleaning up on unmount. */
export function JsonLd({ data, id }: { data: object; id: string }) {
  useEffect(() => {
    const scriptId = `jsonld-${id}`;
    let el = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id = scriptId;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
    return () => {
      document.getElementById(scriptId)?.remove();
    };
  }, [data, id]);
  return null;
}

/** Sitewide LocalBusiness + AutoDealer structured data. */
export function autoDealerJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: BUSINESS.name,
    description: `${BUSINESS.tagline} - independent Irish dealership specialising in UK and Japanese car imports.`,
    url: BUSINESS.siteUrl,
    telephone: BUSINESS.phoneTel,
    email: BUSINESS.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS.address.line1,
      addressLocality: BUSINESS.locality.town,
      addressRegion: BUSINESS.locality.county,
      postalCode: BUSINESS.address.eircode,
      addressCountry: 'IE',
    },
    sameAs: [BUSINESS.social.facebook, BUSINESS.social.tiktok],
  };
}
