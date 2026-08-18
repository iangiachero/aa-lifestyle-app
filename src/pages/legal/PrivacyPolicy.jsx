import React from 'react';
import LegalPage, { Section, Bullets } from './LegalPage';
import { LEGAL_ENTITY, CONTACT_EMAIL, GOVERNING_LAW, LAST_UPDATED } from './legalConfig';

export default function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated={LAST_UPDATED}>
      <Section heading="Who we are">
        <p>
          AA Lifestyle ("the app") is operated by {LEGAL_ENTITY}. This policy explains what we
          collect, why, and what you can do about it. Questions go to {CONTACT_EMAIL}.
        </p>
      </Section>

      <Section heading="What we collect">
        <p>Information you give us when you create an account and use the app:</p>
        <Bullets items={[
          'Account details: your email address and name.',
          'Profile details you choose during onboarding: gender, area of focus, daily schedule preference, timezone, and whether you are a student.',
          'Content you create: tasks, events, notes, checklists, recipes, meal plans, grocery lists, habits, workouts, birthdays, home organization lists, shopping items and student coursework.',
          'Photos you upload, such as a profile picture or images attached to your own recipes and categories.',
          'Entries you save in the Password Vault, together with a one-way hash of the PIN that unlocks it.',
        ]} />
        <p>
          We do not collect location data, contacts, advertising identifiers, or health data
          from Apple Health or any other device sensor. We do not use tracking or advertising
          cookies, and we do not sell personal data.
        </p>
      </Section>

      <Section heading="Payments">
        <p>
          Subscriptions purchased on the web are processed by Stripe. Card numbers are entered
          on Stripe's systems and never reach ours — we store only your subscription status and
          the customer reference Stripe gives us. Subscriptions purchased through the App Store
          are processed by Apple under Apple's own privacy policy, and we receive only whether
          the subscription is active.
        </p>
      </Section>

      <Section heading="Where your data is stored">
        <p>
          The app runs on Supabase, which hosts the database, file storage and authentication.
          Access is restricted per account through row-level security, so one account cannot read
          another account's rows. The web app is served by Vercel.
        </p>
      </Section>

      <Section heading="About the Password Vault">
        <p>
          Vault entries are encrypted in your browser with a key derived from your PIN. We store
          only a one-way hash of the PIN and a random salt, never the PIN itself, so we cannot
          decrypt your entries — and neither could anyone who obtained a copy of our database.
        </p>
        <p>
          You should still know the limit. A PIN is short, so someone holding both our database
          and serious computing power could try every possible PIN against your entries. Choose a
          PIN you do not use anywhere else, and keep banking and government credentials in a
          dedicated password manager instead.
        </p>
        <p>
          Because we cannot decrypt the vault, we cannot recover it for you. If you forget your
          PIN the only way back in is to reset the vault, which deletes everything stored in it.
        </p>
      </Section>

      <Section heading="How we use it">
        <p>
          Only to run the app for you: to sign you in, store and sync what you create, show you
          the sections your plan includes, and process your subscription. We do not profile you
          for advertising and we do not share your content with third parties beyond the service
          providers named above.
        </p>
      </Section>

      <Section heading="Your rights">
        <Bullets items={[
          'Access and correct your details from the Profile screen.',
          'Delete your account and everything in it, permanently, from Profile → Delete account. This also cancels any active subscription.',
          'Request a copy of your data by writing to ' + CONTACT_EMAIL + '.',
        ]} />
        <p>
          If you are in the EEA or the UK, the legal basis for processing is the performance of
          our contract with you, and you may complain to your local data protection authority.
          If you are in California, we do not sell or share personal information as those terms
          are defined by the CCPA.
        </p>
      </Section>

      <Section heading="Retention">
        <p>
          We keep your data for as long as your account exists. When you delete your account it
          is removed immediately; billing records are retained in a detached form where tax and
          accounting law requires it.
        </p>
      </Section>

      <Section heading="Children">
        <p>
          The app is not directed to children under 13, and we do not knowingly collect their
          data. If you believe a child has created an account, write to {CONTACT_EMAIL} and we
          will remove it.
        </p>
      </Section>

      <Section heading="Changes">
        <p>
          If this policy changes materially we will update the date above and notify you in the
          app before the change takes effect. This policy is governed by the laws of {GOVERNING_LAW}.
        </p>
      </Section>
    </LegalPage>
  );
}
