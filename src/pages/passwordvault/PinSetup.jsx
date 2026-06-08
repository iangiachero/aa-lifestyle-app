import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, ChevronLeft } from 'lucide-react';
import { hashPin } from '../../utils/pinHash';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const PIN_LENGTH = 6;

function PinDots({ value, error }) {
  return (
    <div className="flex justify-center gap-4 my-6">
      {Array.from({ length: PIN_LENGTH }).map((_, i) => (
        <div
          key={i}
          className="w-3.5 h-3.5 rounded-full transition-all duration-200"
          style={{
            backgroundColor:
              i < value.length
                ? error
                  ? '#EF4444'
                  : '#C9A962'
                : 'rgba(201,169,98,0.2)',
            transform: i < value.length ? 'scale(1.15)' : 'scale(1)',
          }}
        />
      ))}
    </div>
  );
}

export default function PinSetup({ onComplete }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [step]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handlePinChange = (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, PIN_LENGTH);
    setError('');
    if (step === 1) setPin(digits);
    else setConfirmPin(digits);
  };

  const handleContinue = () => {
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      triggerShake();
      return;
    }
    setConfirmPin('');
    setError('');
    setStep(2);
  };

  const handleConfirm = async () => {
    if (confirmPin !== pin) {
      setError('PINs do not match. Try again.');
      setConfirmPin('');
      triggerShake();
      return;
    }
    setSaving(true);
    try {
      const pinHash = await hashPin(pin);
      const { error: dbError } = await supabase
        .from('users')
        .update({ vault_pin_hash: pinHash })
        .eq('user_id', user.id);
      if (dbError) {
        setError('Failed to save PIN. Please try again.');
        setSaving(false);
        return;
      }
      sessionStorage.setItem('vault_unlocked', 'true');
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  const currentPin = step === 1 ? pin : confirmPin;
  const canProceed = step === 1 ? pin.length >= 4 : confirmPin.length >= 4;

  return (
    <div className="min-h-full pb-32 flex flex-col">
      <div className="relative border-b-2 border-[rgba(201,169,98,0.25)] page-safe-x py-6 flex items-center">
        {step === 2 && (
          <button
            onClick={() => { setStep(1); setConfirmPin(''); setError(''); }}
            className="absolute left-4 hover:opacity-70 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6 text-[#C9A962]" strokeWidth={1.5} />
          </button>
        )}
        <div className="w-full text-center">
          <h1
            className="text-3xl text-[#C9A962] font-light tracking-wide"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Password Vault
          </h1>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-xs"
        >
          <motion.div
            animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-2"
          >
            <div
              className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(201,169,98,0.1)', border: '1px solid rgba(201,169,98,0.2)' }}
            >
              <Lock className="w-9 h-9" style={{ color: '#C9A962' }} strokeWidth={1.5} />
            </div>

            <h2
              className="text-2xl mb-2 font-light"
              style={{ color: '#C9A962', fontFamily: "'Cormorant Garamond', serif" }}
            >
              {step === 1 ? 'Create a PIN' : 'Confirm PIN'}
            </h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {step === 1
                ? 'Choose a 4–6 digit PIN to secure your vault'
                : 'Re-enter your PIN to confirm'}
            </p>

            <PinDots value={currentPin} error={!!error} />

            {error && (
              <p className="text-xs text-red-400 mb-3 min-h-[1rem]">{error}</p>
            )}
          </motion.div>

          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={PIN_LENGTH}
            value={currentPin}
            onChange={(e) => handlePinChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canProceed) {
                step === 1 ? handleContinue() : handleConfirm();
              }
            }}
            className="w-full px-4 py-3.5 rounded-xl text-center text-xl tracking-[0.5em] focus:outline-none mb-5"
            style={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: error
                ? '1px solid rgba(239,68,68,0.6)'
                : '1px solid rgba(201,169,98,0.3)',
              color: '#F5F1E8',
              caretColor: '#C9A962',
            }}
            placeholder="• • • •"
            autoComplete="off"
          />

          <button
            onClick={step === 1 ? handleContinue : handleConfirm}
            disabled={!canProceed || saving}
            className="w-full py-4 rounded-2xl text-base font-medium transition-all disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, #B8955A 0%, #C9A962 100%)',
              color: '#000000',
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '17px',
              boxShadow: canProceed ? '0 4px 16px rgba(184,149,90,0.3)' : 'none',
            }}
          >
            {saving ? 'Saving…' : step === 1 ? 'Continue' : 'Create PIN'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
