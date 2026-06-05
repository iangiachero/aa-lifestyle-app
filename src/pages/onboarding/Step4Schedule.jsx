import React from 'react';
import { ArrowLeft, Check, Sun, Clock, Moon, CheckCircle } from 'lucide-react';
import { OnboardingShell, GoldButton } from './OnboardingShell';
import CustomSelect from '../../components/ui/CustomSelect';

const SCHEDULE_OPTIONS = [
  { key: 'early_bird', label: 'Early Bird', desc: '5am – 9pm', Icon: Sun },
  { key: 'standard', label: 'Standard', desc: '7am – 11pm', Icon: Clock },
  { key: 'night_owl', label: 'Night Owl', desc: '10am – 2am', Icon: Moon },
];

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern (ET)' },
  { value: 'America/Chicago', label: 'Central (CT)' },
  { value: 'America/Denver', label: 'Mountain (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Central European (CET)' },
  { value: 'Europe/Rome', label: 'Rome (CET)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
  { value: 'UTC', label: 'UTC' },
];

export default function Step4Schedule({ onSubmit, onBack, data, onChange, loading }) {
  const { schedule_type, timezone } = data;
  const canContinue = schedule_type && timezone;

  return (
    <OnboardingShell
      step={3}
      totalSteps={4}
      footer={
        <div className="flex gap-3">
          <GoldButton outline onClick={onBack}>
            <ArrowLeft size={16} /> Back
          </GoldButton>
          <GoldButton onClick={onSubmit} disabled={!canContinue || loading}>
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <><CheckCircle size={18} /> Let's Go</>
            )}
          </GoldButton>
        </div>
      }
    >
      <div className="flex flex-col">
        <div className="mb-8 text-center">
          <h2
            className="text-3xl font-semibold mb-1"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#C9A962' }}
          >
            Your schedule
          </h2>
          <p className="text-sm" style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(226,186,139,0.5)' }}>
            When are you most productive?
          </p>
        </div>

        <div className="h-px mb-6" style={{ background: 'rgba(201,169,98,0.12)' }} />

        <div className="space-y-3 mb-6">
          {SCHEDULE_OPTIONS.map(({ key, label, desc, Icon }) => {
            const isSelected = schedule_type === key;
            return (
              <button
                key={key}
                onClick={() => onChange({ schedule_type: key })}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all duration-200"
                style={{
                  background: isSelected ? 'rgba(201,169,98,0.12)' : 'rgba(255,255,255,0.04)',
                  border: isSelected ? '1.5px solid rgba(201,169,98,0.5)' : '1.5px solid rgba(201,169,98,0.12)',
                  boxShadow: isSelected ? '0 2px 16px rgba(201,169,98,0.1)' : 'none',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
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

        <p
          className="text-xs font-medium uppercase tracking-widest mb-2"
          style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(226,186,139,0.5)' }}
        >
          Timezone
        </p>
        <CustomSelect
          value={timezone || 'America/Chicago'}
          onChange={(val) => onChange({ timezone: val })}
          options={TIMEZONES}
          placeholder="Select timezone"
        />
      </div>
    </OnboardingShell>
  );
}
