import React from 'react';
import LegalPage, { Section, Bullets } from './LegalPage';
import { LEGAL_ENTITY, CONTACT_EMAIL, GOVERNING_LAW, LAST_UPDATED, SUBSCRIPTION_TERMS } from './legalConfig';

const { monthly, yearly } = SUBSCRIPTION_TERMS;

export default function Terms() {
  return (
    <LegalPage title="Terms of Use" lastUpdated={LAST_UPDATED}>
      <Section heading="Agreement">
        <p>
          These terms are between you and {LEGAL_ENTITY}. By creating an account or using
          AA Lifestyle you accept them. If you do not accept them, do not use the app.
        </p>
      </Section>

      <Section heading="Your licence">
        <p>
          We grant you a personal, non-transferable, non-exclusive licence to use the app on
          devices you own or control, for your own use. You may not resell it, rent it out,
          copy it, reverse-engineer it, or use it to build a competing product.
        </p>
      </Section>

      <Section heading="Your account">
        <p>
          You are responsible for keeping your password and vault PIN confidential and for
          everything done through your account. Tell us at {CONTACT_EMAIL} if you believe someone
          else has access to it. You must be at least 13 years old to hold an account.
        </p>
      </Section>

      <Section heading="Subscription, billing and cancellation">
        <Bullets items={[
          `AA Lifestyle Pro costs ${monthly.price} per ${monthly.period}, or ${yearly.price} per ${yearly.period}.`,
          'Subscriptions renew automatically at the end of each period unless cancelled beforehand.',
          'Payment is charged at confirmation of purchase.',
          'You can cancel at any time. Access to Pro features continues until the end of the period you have already paid for, and cancelling does not refund the current period.',
          'Purchases made on the web are managed through the billing portal on the Subscription screen. Purchases made through the App Store are managed in your Apple ID settings, and Apple applies its own refund policy.',
          'Deleting your account cancels an active web subscription immediately.',
        ]} />
        <p>
          If prices change we will tell you before the change applies to your renewal, and you
          may cancel rather than accept it.
        </p>
      </Section>

      <Section heading="What the app is not">
        <p>
          AA Lifestyle includes meal plans, workouts, wellness routines and organisational
          tools. These are provided for general information only. They are <strong>not medical,
          nutritional, psychological or financial advice</strong>, and they are not a substitute
          for a qualified professional. Talk to a doctor before changing your diet or starting
          an exercise programme, particularly if you are pregnant, have a medical condition, or
          are taking medication.
        </p>
      </Section>

      <Section heading="The Password Vault">
        <p>
          Vault entries are encrypted with a key derived from your PIN, which we never store. We
          therefore cannot read your entries and cannot recover them for you: if you forget your
          PIN, the only way back in is to reset the vault, and that deletes everything in it.
          Keep your own record of anything you cannot afford to lose.
        </p>
        <p>
          A short PIN offers limited protection against a determined attacker. Use a dedicated
          password manager for banking credentials, government identifiers, or anything whose
          exposure would cause you serious harm. We are not liable for loss arising from
          credentials kept in the vault.
        </p>
      </Section>

      <Section heading="Your content">
        <p>
          What you create in the app stays yours. You grant us only the permission needed to
          store it, display it back to you and back it up. We do not use it to train models and
          we do not publish it.
        </p>
      </Section>

      <Section heading="Acceptable use">
        <Bullets items={[
          'Do not use the app to break the law or infringe anyone else\'s rights.',
          'Do not upload content that is unlawful, or that you have no right to upload.',
          'Do not attempt to access other accounts, disrupt the service, or circumvent the limits of your plan.',
        ]} />
      </Section>

      <Section heading="Availability and liability">
        <p>
          We work to keep the app running but we do not promise it will be uninterrupted or
          error-free, and we do not guarantee that data will never be lost — keep your own copies
          of anything you cannot afford to lose. To the extent the law allows, our total
          liability is limited to what you paid us in the twelve months before the claim. Nothing
          here limits liability that cannot lawfully be limited.
        </p>
      </Section>

      <Section heading="Ending the agreement">
        <p>
          You may stop at any time by deleting your account from the Profile screen. We may
          suspend or close an account that breaches these terms, and where it is reasonable to
          do so we will tell you why first.
        </p>
      </Section>

      <Section heading="Changes and governing law">
        <p>
          We may update these terms; material changes will be announced in the app before they
          take effect. These terms are governed by the laws of {GOVERNING_LAW}. Questions go to
          {' '}{CONTACT_EMAIL}.
        </p>
      </Section>
    </LegalPage>
  );
}
