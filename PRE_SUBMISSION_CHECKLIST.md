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
- ✅ Every route loads cleanly on web (2026-08-19 pass, logged into a real
  account): Dashboard, Calendar, Tasks, Checklists, Meal Plan, Grocery,
  Workout, Lifestyle, Student, Home Organization, Notes, Shop, Vault,
  Profile, Subscription — zero console errors across all of them
- ✅ Recurring calendar events, specifically checked because Ava flagged this
  exact behavior: created a weekly event, deleted a single occurrence
  (removed from that day on both Calendar and the Home dashboard, later
  occurrences untouched), then deleted the whole series (fully gone,
  confirmed against the database — zero leftover rows)
- ✅ Adding recipe ingredients to the Grocery List — verified all 6
  ingredients land correctly, grouped under "From Recipes" with the source
  recipe attributed
- ✅ Notes subject-title field, autosave, and persistence after reload
- 🔧 **Found and fixed**: Shop items had no edit capability at all — add and
  delete worked, editing did not exist in the code. Now fixed (Pencil button
  per item, reuses the add dialog pre-filled). Verified live: opens
  pre-filled, saves, survives a reload.
- ✅ Male/female workout sections are gated by the user's onboarding gender
  (`Fitness.jsx`), not a missing toggle — confirmed in code, working as
  designed
- — everything else on Ava's list under this section (male/female switching,
  curated vs. custom workouts in depth, assignment tracker completion beyond
  what was already tested earlier, exhaustive click-through of every
  sub-item) has not been individually re-verified in this pass; spot-checked
  the highest-risk ones rather than every line
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

**Facts about what the app actually uses** (verified in code, 2026-08-19):
- HTTPS/TLS for all network traffic (Supabase, Stripe, RevenueCat) — this
  alone is exempt; Apple treats OS-level HTTPS as not requiring documentation.
- **Password Vault**: AES-256-GCM, via the browser/WebView's built-in Web
  Crypto API (`crypto.subtle`) — not a custom or third-party crypto library.
  Key is derived from the user's PIN with PBKDF2 (600,000 iterations,
  SHA-256), per account, never transmitted or stored.
- PIN itself: stored only as a SHA-256 hash, never in plain text.
- No VPN, no custom messaging/DRM, no encryption libraries beyond the
  browser's standard API.

**Why this isn't a simple "select exempt and move on," checked 2026-08-19:**
Apple's own guidance treats "HTTPS-only" apps as cleanly exempt, but
specifically lists **on-device password vaults** as an example of something
that typically does *not* qualify for that simplest exemption — regardless of
using a standard algorithm like AES. That points toward answering "Yes, uses
encryption" and likely **not** the simplest exemption category in App Store
Connect's questionnaire (`ITSAppUsesNonExemptEncryption` probably `YES`, not
`NO`).

In practice this usually still resolves to a fast, self-service path — most
apps using only standard, publicly available algorithms (AES, SHA — exactly
what this app uses, nothing proprietary) qualify for the U.S. **License
Exception ENC / mass-market** self-classification, which for a small app
commonly does *not* require an actual filing with the Bureau of Industry and
Security, just answering the questionnaire accurately. But that determination
depends on specifics (distribution countries, whether a CCATS/self-classification
report has ever been filed for this app before) that are a legal judgment call,
not a coding one.

⛔ **Recommendation: don't guess through Apple's actual questionnaire from this
document.** Walk through App Store Connect's real export compliance flow when
the app record exists (it asks the determining questions directly), and if
anything is ambiguous, a five-minute check with someone who handles export
compliance is cheaper than guessing wrong on a legal filing.

Sources checked: [ITSAppUsesNonExemptEncryption, decoded](https://orbitkit.io/blog/app-store-export-compliance-encryption/), [Apple Developer Forums](https://developer.apple.com/forums/thread/120252)

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
