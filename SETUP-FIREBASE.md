# Firebase Setup Checklist — CF Motor Sales

Follow these steps once to make the live site fully working (stock, admin panel,
enquiry forms, image uploads). The website **code is already built for Firebase**
— you only need to create the project and paste in the keys. Total time: ~20 min.

Live site: **https://abhishekncirl.github.io/cf-motors/**
Repo: **https://github.com/Abhishekncirl/cf-motors**

---

## Step 1 — Create the Firebase project
1. Go to <https://console.firebase.google.com> and sign in.
2. Click **Add project** → name it e.g. `cf-motors` → continue.
3. Google Analytics is optional — you can turn it off.

## Step 2 — Register a Web App and copy the config
1. In the project, click the **`</>` (Web)** icon ("Add app to get started").
2. Nickname it `cf-motors-web`. **Do not** tick "Firebase Hosting".
3. Firebase shows a `firebaseConfig = { … }` block. **Keep this open** — you'll copy
   6 values from it in Step 7. They map to the app like this:

   | firebaseConfig field | Repo secret name |
   |---|---|
   | `apiKey` | `VITE_FIREBASE_API_KEY` |
   | `authDomain` | `VITE_FIREBASE_AUTH_DOMAIN` |
   | `projectId` | `VITE_FIREBASE_PROJECT_ID` |
   | `storageBucket` | `VITE_FIREBASE_STORAGE_BUCKET` |
   | `messagingSenderId` | `VITE_FIREBASE_MESSAGING_SENDER_ID` |
   | `appId` | `VITE_FIREBASE_APP_ID` |

   > These are **public by design** (they only identify the project). Real security
   > comes from the rules deployed in Step 6.

## Step 3 — Enable Firestore (the database)
1. Left menu → **Build → Firestore Database → Create database**.
2. Choose a location close to Ireland: **`eur3` (Europe)** or `europe-west1`.
3. Start in **Production mode** (we deploy proper rules in Step 6).

## Step 4 — Enable Authentication (admin login)
1. **Build → Authentication → Get started**.
2. Enable **Email/Password** (the first provider). Save.
3. Go to the **Users** tab → **Add user** → enter your admin email + a strong
   password. *(This is the login for `…/cf-motors/admin`. There is no public sign-up.)*
4. **Settings → Authorized domains → Add domain** → add `abhishekncirl.github.io`
   (so admin sign-in works on the live site).

## Step 5 — Enable Storage (the images) + set a spend cap
1. **Build → Storage → Get started**.
2. Firebase may prompt you to upgrade to the **Blaze (pay-as-you-go)** plan and add
   a card. This is expected — you still get the free allowance (~5 GB) and pay €0
   under it.
3. **Set a budget alert so you're never surprised:** Google Cloud Console →
   *Billing → Budgets & alerts → Create budget* → set a small cap (e.g. €5) with
   email alerts. (A single dealership won't get close to any charges.)
4. Pick the same region as Firestore when asked.

## Step 6 — Deploy the security rules & indexes
These lock the database down correctly (public reads only available cars; only your
admin account can write). Run from the project folder on your computer:

```bash
npm install -g firebase-tools     # once
firebase login                    # opens a browser to sign in
firebase use --add                # pick your new project, give it alias "default"
firebase deploy --only firestore:rules,firestore:indexes,storage
```

The rule files (`firestore.rules`, `firestore.indexes.json`, `storage.rules`) are
already in the repo — no editing needed.

## Step 7 — Add the config to GitHub (so the live site uses it)
1. Repo → **Settings → Secrets and variables → Actions → New repository secret**.
2. Add the **6 secrets** from the table in Step 2 (name + value for each).
3. Trigger a redeploy: repo → **Actions → "Deploy to GitHub Pages" → Run workflow**
   (or just push any commit). The live site will now be connected to Firebase.

## Step 8 — Load the sample cars (optional but recommended)
Shows 10 demo vehicles so the site looks populated before real stock is added.
1. Firebase Console → ⚙ **Project settings → Service accounts → Generate new private
   key**. Save the file as `scripts/serviceAccount.json` (it's git-ignored — never
   commit it).
2. From the project folder:
   ```bash
   npm install
   npm run seed
   ```

## Step 9 — Verify
- Open **https://abhishekncirl.github.io/cf-motors/stock** → the sample cars appear.
- Open **https://abhishekncirl.github.io/cf-motors/admin** → sign in with your Step 4
  admin account → add a car with photos, mark one sold, check the enquiry inbox.
- Submit a test enquiry / valuation from the public site → it appears in
  **Admin → Enquiries**.

---

## Optional follow-ups
- **Email on new enquiry:** add a Firestore-triggered Cloud Function so you get an
  email whenever a customer submits a form (keeps email credentials off the website).
  Ask and this can be added.
- **Custom domain:** point a domain (e.g. cfmotorsales.ie) at GitHub Pages, set
  `VITE_BASE_PATH=/` and `VITE_SITE_URL=https://your-domain`, and add a `CNAME` file.

Stuck on any step? Send me the error and I'll sort it.
