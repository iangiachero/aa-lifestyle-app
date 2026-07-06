import React from 'react';
import { ArrowRight, ArrowLeft, Sparkles, Calendar, Heart, GraduationCap, Briefcase, Check } from 'lucide-react';
import { OnboardingShell, GoldButton } from './OnboardingShell';

const FOCUS_OPTIONS = [
  { key: 'organize', label: 'Organize', desc: 'Declutter my life', Icon: Sparkles },
  { key: 'routine', label: 'Routine', desc: 'Build better habits', Icon: Calendar },
  { key: 'lifestyle', label: 'Lifestyle', desc: 'Wellness focus', Icon: Heart },
  { key: 'academic', label: 'Academic', desc: 'Student success', Icon: GraduationCap },
  { key: 'business', label: 'Business', desc: 'Professional growth', Icon: Briefcase },
];

export default function Step2Focus({ onNext, onBack, data, onChange }) {
  const selected = data.focus || '';

  return (
    <OnboardingShell
      step={1}
      totalSteps={4}
      footer={
        <div className="flex gap-3">
          <GoldButton outline onClick={onBack}>
            <ArrowLeft size={16} /> Back
          </GoldButton>
          <GoldButton onClick={onNext} disabled={!selected}>
            <ArrowRight size={18} /> Continue
          </GoldButton>
        </div>
      }
    >
      <div className="flex flex-col">
        <div className="mb-8">
          <h2
            className="text-3xl font-semibold mb-1"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#C9A962' }}
          >
            What's your focus?
          </h2>
          <p className="text-sm" style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(226,186,139,0.5)' }}>
            We'll customize your experience
          </p>
        </div>

        <div className="space-y-3">
          {FOCUS_OPTIONS.map(({ key, label, desc, Icon }) => {
            const isSelected = selected === key;
            return (
              <button
                key={key}
                onClick={() => onChange({ focus: key })}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all duration-200"
                style={{
                  background: isSelected
                    ? 'rgba(201,169,98,0.12)'
                    : 'var(--app-wash-soft)',
                  border: isSelected
                    ? '1.5px solid rgba(201,169,98,0.5)'
                    : '1.5px solid rgba(201,169,98,0.12)',
                  boxShadow: isSelected ? '0 2px 16px rgba(201,169,98,0.1)' : 'none',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  style={{
                    background: isSelected
                      ? 'linear-gradient(135deg, #B8955A, #C9A962)'
                      : 'rgba(201,169,98,0.08)',
                    border: isSelected ? 'none' : '1.5px solid rgba(201,169,98,0.2)',
                  }}
                >
                  <Icon size={18} style={{ color: isSelected ? 'white' : '#C9A962' }} />
                </div>
                <div className="flex-1">
                  <p
                    className="font-medium text-sm"
                    style={{ fontFamily: "'Inter', sans-serif", color: isSelected ? '#e2ba8b' : 'rgba(226,186,139,0.8)' }}
                  >
                    {label}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(226,186,139,0.4)' }}
                  >
                    {desc}
                  </p>
                </div>
                {isSelected && <Check size={16} style={{ color: '#C9A962' }} />}
              </button>
            );
          })}
        </div>
      </div>
    </OnboardingShell>
  );
}
