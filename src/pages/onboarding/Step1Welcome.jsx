import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { OnboardingShell, GoldButton } from './OnboardingShell';

const features = [
  'Daily planning made simple',
  'Beautiful routine tracking',
  'Elegant time blocking',
];

export default function Step1Welcome({ onNext }) {
  return (
    <OnboardingShell
      step={0}
      totalSteps={4}
      footer={
        <div className="flex gap-3">
          <GoldButton onClick={onNext}>
            <ArrowRight size={18} /> Continue
          </GoldButton>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-10">
          <div
            className="w-32 h-32 mx-auto rounded-2xl overflow-hidden flex items-center justify-center"
            style={{
              border: '1.5px solid rgba(201,169,98,0.2)',
              background: 'rgba(201,169,98,0.05)',
            }}
          >
            <img
              src="https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/logo-icon/logo_transparent.png"
              alt="AA Lifestyle"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        </div>
        <h2
          className="text-3xl font-semibold mb-8"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: '#C9A962' }}
        >
          Welcome to All Access Lifestyle
        </h2>
        <div className="w-full space-y-3 mb-2 flex flex-col items-center">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ border: '1.5px solid rgba(201,169,98,0.35)', background: 'rgba(201,169,98,0.07)' }}
              >
                <Check size={11} style={{ color: '#C9A962' }} />
              </div>
              <span
                className="text-sm"
                style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(226,186,139,0.7)' }}
              >
                {f}
              </span>
            </div>
          ))}
        </div>
      </div>
    </OnboardingShell>
  );
}