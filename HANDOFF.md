# AA Lifestyle — developer handoff

Read this before touching anything. A few of the traps below will cost real
user data or real money if you hit them blind.

Two related documents in this same repo root:
- `PRE_SUBMISSION_CHECKLIST.md` — Ava's gate before Apple submission. Nothing
  gets submitted until every applicable item there is checked and confirmed
  against the real build, not assumed from the web version working.
- `APP_STORE_LISTING.md` — the approved app name and description, verbatim,
  for whoever fills in App Store Connect.

---

## 1. Read this first: four things that will bite you

### The migration folder does NOT match the live database
`supabase/migrations/` has drifted from the actual schema. Some migrations were
never applied; some columns were added by hand in the Supabase SQL editor.

**Never run `supabase db push` or `supabase db reset` against this project.**
It will try to replay migrations the database has already diverged from.

To change the schema, write the SQL, verify it against the live database first
(query `information_schema.columns`), then run it in the Supabase SQL editor and
commit a matching migration file for the record.

### Stripe is in LIVE mode
`STRIPE_SECRET_KEY` is a `sk_live` key and checkout sessions come back as
`cs_live_…`. A "quick test purchase" charges a real card. If you need to
exercise the payment flow end to end, add Stripe test keys and test price IDs
first.

### Pushing to `main` publishes to real users
Vercel auto-deploys `main` to https://aa-lifestyle-app.vercel.app, which is
what the client uses daily to review the app. Work on branches and let the owner
merge.

### `.env` is not in the repo
Correct, and keep it that way — but it means a fresh clone will not run. Ask the
owner for the values; `.env.example` lists the names.

---

## 2. What this is

React 18 + Vite 5 + Tailwind, React Router 7, TanStack Query, framer-motion.
Supabase provides auth, database, storage and edge functions. Deployed as a PWA
on Vercel. There is **no iOS project yet** — see section 4.

```
src/pages/            one folder-level file per screen, subfolders for their modals
src/context/          AuthContext — session, profile, isPro
src/lib/              supabase client, seeding helpers, platform detection
src/utils/            crypto (vault), pinHash
supabase/functions/   stripe-checkout, stripe-portal, stripe-webhook, delete-account
supabase/migrations/  see the warning above
```

Subscription state lives in `users.plan` (`'free'` | `'pro'`). `RequirePro` in
`App.tsx` gates the paid screens; `stripe-webhook` is what flips the flag.

---

## 3. State of play

Owner: Ian. Client: Ava — she owns the Apple Developer account and files the
bug reports. Ava tests on iPhone against the Vercel URL.

**Done and working:** auth and onboarding, light/dark theme, calendar, tasks,
checklists, notes, meal planning (195 curated recipes), home organization,
student dashboard, habits, workouts, shop, password vault, Stripe subscriptions
(checkout, billing portal, webhook).

**Done in code, not yet live:**
- in-app account deletion — the edge function still needs deploying
- Privacy Policy and Terms at `/privacy` and `/terms` — placeholders unfilled
- vault key derived from the PIN instead of the user id
- RevenueCat integration (see 4.2) — code is written and builds, but cannot be
  exercised until Capacitor's iOS platform exists and the dashboard side is
  configured. Nothing here has run against a real purchase.

**Not started:**
- Capacitor / iOS project itself (`npx cap add ios`)
- service worker update prompt — `src/hooks/usePwaUpdate.ts` exists but is
  imported nowhere, so users never get told a new version is available

---

## 4. Getting to the App Store

Ordered by what blocks what. Steps 1–3 need a Mac with Xcode.

### 1. Capacitor and the iOS project
Not installed — `capacitor.config.ts` exists but there is no `@capacitor/*`
dependency and no `ios/` directory. `IOS_PUBLISH_GUIDE.md` covers the commands.
Run `npx cap add ios` **on the Mac**: on Windows it produces a broken project
because CocoaPods cannot run.

Note `webDir: 'dist'` with `server.url` commented out — the app bundles the
built assets, so the iOS build does not load from Vercel.

### 2. In-App Purchase

The client and server code for RevenueCat is written — what's left is
dashboard configuration and testing on a real device, neither of which can be
done from a text editor.

**Written, builds, never run against a real purchase:**
- `src/lib/iap.js` — thin wrapper over `@revenuecat/purchases-capacitor`
  (configure, getOfferings, purchasePackage, restorePurchases,
  hasActiveEntitlement, logOut). No-ops on the web build.
- `src/pages/Subscription.jsx` — on native, shows a real purchase button wired
  to RevenueCat instead of the old "not available" placeholder, plus a
  **Restore Purchases** button (required by 3.1.2, was missing entirely).
  "Manage Plan" for a native Pro user opens Apple's subscriptions page instead
  of the Stripe billing portal, since Stripe has no idea an App Store purchase
  exists.
- `src/context/AuthContext.jsx` — calls `configureRevenueCat(user.id)` on
  sign-in and `logOutRevenueCat()` on sign-out, using the Supabase user id as
  RevenueCat's `appUserID`. This is what lets the webhook update `users.plan`
  by `user_id` directly with no separate customer-mapping table.
- `supabase/functions/revenuecat-webhook/index.ts` — same philosophy as
  `stripe-webhook`: rather than branching on which of RevenueCat's ~20 event
  types arrived, every event triggers a fresh read of the subscriber's
  entitlement state from RevenueCat's API and writes that. Self-heals if an
  event is ever missed. Verified against RevenueCat's published API surface
  (github.com/RevenueCat/purchases-capacitor) as of 2026-08-19, not against a
  live account — there is no sandbox to test against without the dashboard
  setup below.

**Still needed, all dashboard/manual work:**
1. Create a RevenueCat account, add this app, get the iOS **public** SDK key →
   `VITE_REVENUECAT_IOS_API_KEY` in `.env`.
2. In App Store Connect, create the subscription products (monthly/yearly)
   under an entitlement named exactly `pro` — the webhook checks for that
   name.
3. In RevenueCat, set a webhook pointing at
   `{SUPABASE_URL}/functions/v1/revenuecat-webhook`, with an
   Authorization-header secret of your choosing — set the same string as
   `REVENUECAT_WEBHOOK_SECRET` via `supabase secrets set`.
4. Get RevenueCat's **secret** API key → `REVENUECAT_SECRET_API_KEY` via
   `supabase secrets set` (server-side only, never in `.env`/the client).
5. Deploy: `npx supabase functions deploy revenuecat-webhook`.
6. Decide precedence for an account that somehow has both a Stripe and an App
   Store subscription — not handled, shouldn't come up often, but pick a rule.
7. Test a real purchase in the sandbox once step 1 of section 4 (Capacitor)
   is done and there's an actual iOS build to run it in.

US-only nuance worth checking before relying on it: since the April 2025
*Epic v. Apple* injunction, US-storefront apps may link out to external purchase
without commission. Apple has appealed and the rules have moved more than once —
verify the current guideline text rather than assuming this still holds.

### 3. Signing
Confirmed: Ava's membership is **Individual**. That means:

- **App Store Connect** (metadata, pricing, builds, TestFlight) — she can invite
  you there normally, via Users and Access → App Manager.
- **The developer portal** (signing certificates, provisioning profiles) —
  stays accessible to her account only. There is no role that grants a second
  person direct access to it on an Individual membership.

Practical path: have Ava sign in to Xcode once on the machine you'll build from,
with "Automatically manage signing" turned on. Xcode generates and installs the
certificate through her account at that point, and after that you can rebuild
from the same machine/keychain without her signing in again each time. Getting
her to hand over raw `.p12` files and passwords works too but is more
error-prone — prefer the Xcode path if she can spare ten minutes on a call.

### 4. Store listing
App icons and splash screens (`@capacitor/assets` generates the set), screenshots
at the required sizes, description, keywords, age rating, and the App Privacy
questionnaire. Answer the questionnaire from section 5 below — the app collects
more than it looks like it does.

---

## 5. Security notes

### The Password Vault is not a password manager
Entries are AES-GCM encrypted in the browser with a key derived from the user's
PIN plus a per-account random salt (`users.vault_key_salt`). The PIN is stored
only as a one-way hash, so the server cannot decrypt entries — and cannot
recover them either. A forgotten PIN means resetting the vault, which deletes
its contents.

The limit is the PIN itself: 4–6 digits is a small search space for anyone
holding both the database and a GPU, even at 600k PBKDF2 iterations. Allowing a
passphrase is the obvious next step. The Privacy Policy and Terms state this
honestly — keep them accurate if you change the scheme.

Entries written before this change used a key derived from the user id and are
migrated on first unlock (`migrateLegacyEntries` in `PasswordVault.jsx`). An
entry that fails to decrypt is left untouched rather than overwritten. Do not
"clean that up".

### Account deletion order matters
`supabase/functions/delete-account` cancels the Stripe subscription **first**,
then storage, then the data rows, then the auth user last. Deleting the rows
while billing is live would keep charging someone who no longer has an account;
removing the auth user first would strand data behind a login that no longer
exists. Keep the order.

### Reading a profile row
An unauthenticated PostgREST request returns `200` with an empty array, not an
error — so `maybeSingle()` gives `{ data: null, error: null }`, which looks
exactly like "this user is new". That bug sent returning users to Create PIN.
Anywhere you branch on a profile read, treat "no row returned" as *unknown* and
retry; only "row exists, field is null" means the user genuinely lacks it.

---

## 6. Conventions

- Comments explain **why**, not what. Match that.
- Optimistic cache writes before mutations on jsonb array columns — a stale read
  otherwise silently drops entries (see `saveItems` in `Checklists.jsx`).
- Tolerate missing columns: several features check for `PGRST204` / `42703` and
  degrade instead of erroring, because of the migration drift.
- `update()` reports success when it matches zero rows. When a write must land,
  use `upsert` and read the value back — both PIN screens do this.
- iOS keyboard handling is centralised in `index.css` via `--kb-height` and
  `body.keyboard-open`. Don't add per-screen workarounds.
