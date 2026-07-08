import React from 'react';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { OnboardingShell, GoldButton } from './OnboardingShell';

function TileButton({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center gap-2 py-6 rounded-2xl transition-all duration-200"
      style={{
        background: selected ? 'rgba(201,169,98,0.12)' : 'var(--app-wash-soft)',
        border: selected ? '1.5px solid rgba(201,169,98,0.5)' : '1.5px solid rgba(201,169,98,0.12)',
        boxShadow: selected ? '0 2px 16px rgba(201,169,98,0.1)' : 'none',
      }}
    >
      <span style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '15px',
        fontWeight: 500,
        color: selected ? '#e2ba8b' : 'rgba(226,186,139,0.7)',
      }}>
        {label}
      </span>
      {selected && (
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center"
          style={{ border: '1.5px solid rgba(201,169,98,0.5)', background: 'rgba(201,169,98,0.08)' }}
        >
          <Check size={11} style={{ color: 'var(--app-gold)' }} />
        </div>
      )}
    </button>
  );
}

export default function Step3Personalize({ onNext, onBack, data, onChange }) {
  const { gender, is_student } = data;
  const canContinue = gender !== undefined && is_student !== undefined;

  return (
    <OnboardingShell
      step={2}
      totalSteps={4}
      footer={
        <div className="flex gap-3">
          <GoldButton outline onClick={onBack}>
            <ArrowLeft size={16} /> Back
          </GoldButton>
          <GoldButton onClick={onNext} disabled={!canContinue}>
            <ArrowRight size={18} /> Continue
          </GoldButton>
        </div>
      }
    >
      <div className="flex flex-col">
        <div className="mb-8">
          <h2
            className="text-3xl font-semibold mb-1 text-center"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--app-gold)' }}
          >
            Personalize your
          </h2>
          <h2
            className="text-3xl font-semibold mb-2 text-center"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--app-gold)' }}
          >
            experience
          </h2>
          <p
            className="text-sm text-center"
            style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(226,186,139,0.5)' }}
          >
            This helps us curate content tailored to you
          </p>
        </div>

        <div className="h-px mb-6" style={{ background: 'rgba(201,169,98,0.12)' }} />

        <div className="flex gap-3 mb-8">
          <TileButton label="Female" selected={gender === 'female'} onClick={() => onChange({ gender: 'female' })} />
          <TileButton label="Male" selected={gender === 'male'} onClick={() => onChange({ gender: 'male' })} />
        </div>

        <p
          className="text-sm text-center mb-4"
          style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(226,186,139,0.6)' }}
        >
          Are you a student?
        </p>
        <div className="flex gap-3">
          <TileButton label="Yes" selected={is_student === true} onClick={() => onChange({ is_student: true })} />
          <TileButton label="No" selected={is_student === false} onClick={() => onChange({ is_student: false })} />
        </div>
      </div>
    </OnboardingShell>
  );
}
