import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { writeFileSync } from 'node:fs';

// The site deploys to GitHub Pages. On a custom domain (recommended) the base
// path is '/'. If you deploy to `<user>.github.io/<repo>/` instead, set
// VITE_BASE_PATH=/<repo>/ in the build environment.
const base = process.env.VITE_BASE_PATH || '/';
const siteUrl = (process.env.VITE_SITE_URL || 'https://www.cfmotorsales.ie').replace(/\/$/, '');

/**
 * Emit sitemap.xml for the static routes at build. Vehicle detail URLs are
 * dynamic (Firestore) and not enumerable at build without admin credentials;
 * they are discoverable via internal links, and a scheduled function can append
 * them later if fuller coverage is needed.
 */
function sitemapPlugin(): Plugin {
  const routes = ['/', '/stock', '/import-service', '/sell-your-car', '/finance', '/about', '/contact', '/terms', '/privacy'];
  return {
    name: 'cf-sitemap',
    apply: 'build',
    closeBundle() {
      const today = new Date().toISOString().slice(0, 10);
      const urls = routes
        .map(
          (r) =>
            `  <url><loc>${siteUrl}${r}</loc><lastmod>${today}</lastmod><changefreq>${
              r === '/stock' ? 'daily' : 'weekly'
            }</changefreq></url>`
        )
        .join('\n');
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
      writeFileSync(fileURLToPath(new URL('./dist/sitemap.xml', import.meta.url)), xml);
    },
  };
}

export default defineConfig({
  base,
  plugins: [react(), sitemapPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: false,
  },
  build: {
    // Keep chunks reasonable; Firebase is code-split lazily where possible.
    chunkSizeWarningLimit: 900,
  },
});
