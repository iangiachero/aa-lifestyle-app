# Pre-submission checklist

Ava's own gate before this app goes to Apple for review (2026-08-19): nothing
gets submitted until every applicable item below is checked, tested, and
confirmed in writing against the actual build being submitted.

**Read this before checking anything off.** As of today there is no iOS
project (`npx cap add ios` has not run — see HANDOFF.md section 4.1) and no
TestFlight build. That means almost everything below that says "test" or
"confirm in the production/TestFlight build" is **not yet possible to verify
at all** — not "probably fine," genuinely unverifiable until a real build
exists on a real device. Marking any of it done before that would be a guess
dressed up as a fact, which is exactly what this checklist exists to prevent.

Status legend: ✅ true today, verified · 🔶 true in code, not yet exercised on
a real build · ⛔ not started · — needs a TestFlight build to even attempt

---

## 1. Apple Payments & Subscriptions
- 🔶 StoreKit/IAP implemented — RevenueCat wired into the code (`src/lib/iap.js`,
  `Subscription.jsx`, `revenuecat-webhook`), never run against a real purchase
- 🔶 Not relying on Stripe alone in the iOS app — `canUseWebCheckout()` hides it natively
- ✅ Stripe remains available for web
- ⛔ Monthly/annual subscriptions created in App Store Connect
- — everything else in this section (price display, purchase tests, cancellation,
  expiration, renewal, restore, logout/login retention, no loopholes)

## 2. Account Creation, Login & Deletion
- 🔶 Delete Account exists in-app (`supabase/functions/delete-account`) —
  **written but not deployed**; run `npx supabase functions deploy delete-account`
- 🔶 Deletion order cancels Stripe first, then data, then the login, so a failure
  midway can't strand a billable account or orphaned data — not yet tested end to end
- — account creation/login/logout/password reset/reinstall-and-relogin: these work
  on web today but need re-verification in the native build specifically

## 3. Free vs. Premium Access
- ✅ Feature gating by `users.plan` already works on web (`RequirePro` in `App.tsx`)
- — native-specific: status after reinstall, after App Store subscription changes,
  expired/canceled handling — depends on section 1 being finished first

## 4. Full App Functionality Testing
- ✅ Every listed feature exists and works on the web build today
- — needs the identical pass repeated inside the native/TestFlight build; web
  working is not proof the Capacitor wrapper behaves the same (webview quirks,
  keyboard handling, safe areas)

## 5. Data Saving & Synchronization
- ✅ True on web as of the last testing pass in this project
- — re-verify in native build

## 6. Password Vault Security
- ✅ Not stored in plain text — AES-GCM, key derived from the PIN (never stored)
  plus a per-account random salt, not from anything sitting in the same row
- 🔶 "Remembers PIN correctly, no incorrect Create-Password screen" — **Ava just
  reported this is still broken.** See the note at the bottom of this file —
  this is being actively investigated, not treated as done
- — reinstall / cross-user isolation: re-verify in native build

## 7. Performance & User Experience
- ✅ True on web
- — re-verify in native build; Capacitor wraps a webview, which can behave
  differently than Safari

## 8. Privacy Policy & Terms
- ✅ Pages complete at `/privacy` and `/terms`, reachable signed out
- ✅ Legal entity, contact email, governing law filled in (Ava Amad /
  allaccess.lifestylee@gmail.com / State of Missouri) as of 2026-08-19
- ✅ Policy text matches what the app actually collects, checked against the
  real data model, not written generically
- ⛔ Third-party SDK data review — RevenueCat, once wired to a real account, needs
  its own data practices checked and reflected in the policy and the App
  Privacy questionnaire (section 9)

## 9. App Store Privacy Information
- ⛔ Apple's App Privacy questionnaire — not started, needs an actual App Store
  Connect app record to exist first

## 10. App Store Listing
- ✅ App name and description finalized — see `APP_STORE_LISTING.md`
- ⛔ Subtitle, keywords, screenshots, promotional text, support URL, category,
  age rating — none of this exists yet, none of it was provided

## 11. App Review Account
- ⛔ Not created — needs a real build to test against first

## 12. TestFlight Testing
- ⛔ Nothing to upload yet — blocked entirely on section 4.1 of HANDOFF.md
  (Capacitor/iOS project)

## 13. Apple Developer / App Store Connect Setup
- ✅ Ava's membership confirmed Individual (HANDOFF.md section 4.3)
- ⛔ Bundle ID, certificates, subscription products, banking/tax info — not started

## 14. Encryption & Export Compliance
- ⛔ Not answered yet. Factual starting point for whoever does this: the app
  uses HTTPS/TLS (standard, usually exempt) and AES-GCM for the Password
  Vault (implemented via the browser's Web Crypto API, not a custom cipher).
  That's normally within Apple's standard exemptions, but confirm against
  Apple's current export compliance questions rather than assume.

## 15. Final Visual QA
- ✅ True on web
- — native build gets its own pass

## 16. Final Developer Confirmation
- ⛔ Cannot be signed off truthfully until the sections above that require a
  real build are actually done. This document is what gets updated, item by
  item, as that happens — not a one-time chat reply.

---

## Open issue as of 2026-08-19: Password Vault still shows Create PIN incorrectly

Ava's exact report: reinstalling the web app and opening the vault shows
Create PIN. She creates one, and instead of unlocking, she's asked to enter a
PIN — where her *original* PIN works, not the one she just created.

That sequence means the previous fix (checking for an existing PIN
immediately before writing one) is firing — so a hash does exist — while the
check moments earlier that decided to show Create PIN in the first place
concluded there wasn't one. Two reads of the same row disagreeing is a strong
sign of **duplicate rows for the same `user_id` in the `users` table**: the
`.limit(1)` each read uses has no `ORDER BY`, so if two rows exist, which one
comes back is undefined and can differ between calls.

Diagnostic query (read-only, safe to run anytime) — if this returns any rows,
that's the root cause confirmed:

```sql
SELECT user_id, count(*) FROM users GROUP BY user_id HAVING count(*) > 1;
```

Being investigated in this repo now.
