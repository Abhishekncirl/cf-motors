# CF Motor Sales Ltd — Website

Production website for **CF Motor Sales Ltd**, an independent Irish dealership
specialising in **UK & Japanese car imports**. Buyers browse live stock, filter
it, view full vehicle pages and contact the dealer instantly. The owner manages
all stock, enquiries and site settings from a secure admin panel — no code.

> This is a **self-contained project**. It lives in the `cf-motor-sales/` folder
> and shares nothing with the rest of the repository. To give it its own GitHub
> repo, copy this folder out as the repo root (the deploy workflow in
> `.github/workflows/` is written for that layout).

## Tech stack

| Layer        | Choice                                             |
| ------------ | -------------------------------------------------- |
| Framework    | React 18 + Vite + TypeScript                       |
| Styling      | Tailwind CSS (brand tokens in `tailwind.config.js`)|
| Routing      | React Router 6 (BrowserRouter + `404.html` SPA fix)|
| Backend      | Firebase — Firestore (Lite on the public site), Auth, Storage |
| Fonts        | Oswald + Inter variable fonts via `@fontsource` (no runtime CDN) |
| Icons        | lucide-react                                       |
| Deploy       | GitHub Pages via GitHub Actions                    |

## Prerequisites

- Node 20+
- A Firebase project (Firestore, Authentication, Storage enabled)

## 1. Local setup

```bash
npm install
cp .env.example .env   # then fill in your Firebase values
npm run dev            # http://localhost:5173
```

`npm run build` type-checks and produces `dist/`. `npm run preview` serves it.

## 2. Firebase setup

1. Create a project at <https://console.firebase.google.com>.
2. Enable **Firestore Database**, **Authentication → Email/Password**, and **Storage**.
3. Copy the web app config into `.env` (see `.env.example`).
4. Create your admin login: Authentication → Users → **Add user** (email + password).
   There is **no public sign-up** — every auth user is a staff account you create.
5. Deploy the security rules and indexes (install the Firebase CLI, `npm i -g firebase-tools`, then `firebase login`):

   ```bash
   firebase use <your-project-id>
   firebase deploy --only firestore:rules,firestore:indexes,storage
   ```

### Security model (see `firestore.rules` / `storage.rules`)

- **Public** can read vehicles where `status = 'available'` and the site settings,
  and can **create** enquiries and upload valuation/sourcing photos.
- **Admins** (any authenticated user) can read/write everything else.

## 3. Seed sample data

Populates ~10 realistic vehicles and default site settings so the site is
demonstrable immediately.

1. Firebase console → Project settings → **Service accounts** → *Generate new
   private key*. Save it as `scripts/serviceAccount.json` (git-ignored).
2. `npm run seed`

Sample cars have no photos — add them via the admin panel.

## 4. Environment variables

All config is via `.env` (local) or GitHub Actions **secrets** (deploy). Nothing
is hardcoded. See `.env.example` for the full list:

`VITE_FIREBASE_*` (web config), `VITE_SITE_URL` (canonical URL for SEO/sitemap),
`VITE_BASE_PATH` (`/` for a custom domain, `/<repo>/` for project Pages).

## 5. Deployment (GitHub Pages)

1. Push this folder as the root of its own GitHub repo.
2. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Repo **Settings → Secrets and variables → Actions** — add each `VITE_*` value.
4. Push to `main`. The workflow in `.github/workflows/deploy.yml` builds and deploys.
5. **Custom domain:** set it under Settings → Pages, keep `VITE_BASE_PATH=/`, and
   add a `public/CNAME` file containing the domain.

Deep links work on Pages via `public/404.html`, which stashes the requested URL
and hands it back to the SPA (`index.html`).

## Routes

Public: `/`, `/stock`, `/stock/:slug`, `/sell-your-car`, `/import-service`,
`/finance`, `/about`, `/contact`, `/terms`, `/privacy`.
Admin (auth-gated): `/admin` (dashboard), `/admin/vehicles`, `/admin/vehicles/new`,
`/admin/vehicles/:id`, `/admin/enquiries`, `/admin/settings`, `/admin/login`.

## Data model (Firestore)

- `vehicles/{id}` — full spec, `status`, `featured`, and an embedded `images[]`
  array (the relational `vehicle_images` table maps to this array to avoid N+1 reads).
- `enquiries/{id}` — `type` ∈ general/vehicle/valuation/sourcing/finance, contact
  details, `payload` (type-specific extras), `isRead`, `isActioned`.
- `site_settings/main` — phone, socials, address, opening hours, hero image.

## Notes & follow-ups

- Values marked `[CONFIRM]` / `[CLIENT TO REVIEW WITH SOLICITOR]` need client input
  (socials, email, address, hours, finance status, legal pages). Most are editable
  at runtime from **Admin → Settings** — no redeploy needed.
- **Emailing the dealer on new enquiries:** add a Firestore-triggered Cloud
  Function (kept out of the client so no SMTP secrets ship in the browser).
- Legal pages are **drafts, not legal advice** — review with a solicitor.
- Finance is enquiry-only by design (no live credit figures) for Irish compliance.

## Reviews

`src/data/reviews.json` matches the shape returned by the Google Places API, so
swapping to live Google Reviews later is a data-source change only.
