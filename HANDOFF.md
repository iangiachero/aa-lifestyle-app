# AA Lifestyle — developer handoff

Read this before touching anything. A few of the traps below will cost real
user data or real money if you hit them blind.

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

**Not started:**
- Capacitor / iOS project
- In-App Purchase
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

### 2. In-App Purchase — the hard blocker
Guideline 3.1.1: a subscription unlocking in-app content must use IAP. The
Stripe checkout is already hidden in native builds via `canUseWebCheckout()` in
`src/lib/platform.js`, but nothing replaces it yet, and an app that gates
features with no way to buy them is rejected just as fast.

Suggested: `@revenuecat/purchases-capacitor`. It validates receipts server-side
and its webhooks can update `users.plan`, so Apple and Stripe end up writing to
the same field. Decide precedence when an account has both.

Also required by 3.1.2, and missing: a **Restore Purchases** button. The price,
period, renewal terms and the two legal links are already on the subscription
screen.

US-only nuance worth checking before you design this: since the April 2025
*Epic v. Apple* injunction, US-storefront apps may link out to external purchase
without commission. Apple has appealed and the rules have moved more than once —
verify the current guideline text before relying on it.

### 3. Signing
Depends on the Apple Developer membership type, which is Ava's. If it is
**Individual**, only she can hold signing certificates — App Store Connect users
can be invited, but the developer portal cannot. If it is **Organization**, you
can be added properly. Confirm which before planning the build.

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
