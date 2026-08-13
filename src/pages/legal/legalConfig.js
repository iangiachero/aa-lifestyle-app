/*
  Fill these in before submitting to the App Store — Apple checks that the
  Privacy Policy and Terms name a real operator and a working contact address.
  Everything here is a placeholder until you replace it.
*/

// e.g. "Ava Smith, sole trader, Austin TX" or the registered company name.
export const LEGAL_ENTITY = '[LEGAL ENTITY — replace before submission]';

// Must be an address someone actually reads: Apple and users both write to it.
export const CONTACT_EMAIL = '[support@yourdomain.com — replace before submission]';

// e.g. "the State of Texas, United States".
export const GOVERNING_LAW = '[JURISDICTION — replace before submission]';

// Bump this whenever the wording changes materially.
export const LAST_UPDATED = '14 August 2026';

// Mirrors the prices in Subscription.jsx; guideline 3.1.2 wants them stated
// next to the renewal terms, not only on the plan cards.
export const SUBSCRIPTION_TERMS = {
  monthly: { price: '$2.99', period: 'month' },
  yearly: { price: '$29.99', period: 'year' },
};
