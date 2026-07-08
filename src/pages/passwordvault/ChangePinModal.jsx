import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock } from 'lucide-react';
import { hashPin, verifyPin } from '../../utils/pinHash';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const PIN_LENGTH = 6;

function PinDots({ value, error }) {
  return (
    <div className="flex justify-center gap-4 my-5">
      {Array.from({ length: PIN_LENGTH }).map((_, i) => (
        <div
          key={i}
          className="w-3 h-3 rounded-full transition-all duration-200"
          style={{
            backgroundColor:
              i < value.length
                ? error ? '#EF4444' : '#C9A962'
                : 'rgba(201,169,98,0.2)',
            transform: i < value.length ? 'scale(1.15)' : 'scale(1)',
          }}
        />
      ))}
    </div>
  );
}

export default function ChangePinModal({ pinHash, onClose, onChanged }) {
  const { user } = useAuth();
  const [step, setStep] = useState('current'); // 'current' | 'new' | 'confirm'
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, [step]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const activePin = step === 'current' ? currentPin : step === 'new' ? newPin : confirmPin;
  const setActivePin = (v) => {
    const digits = v.replace(/\D/g, '').slice(0, PIN_LENGTH);
    setError('');
    if (step === 'current') setCurrentPin(digits);
    else if (step === 'new') setNewPin(digits);
    else setConfirmPin(digits);
  };

  const handleNext = async () => {
    if (step === 'current') {
      if (currentPin.length < 4) { setError('PIN must be at least 4 digits'); triggerShake(); return; }
      const valid = await verifyPin(currentPin, pinHash);
      if (!valid) { setError('Incorrect current PIN.'); setCurrentPin(''); triggerShake(); return; }
      setStep('new');
      setError('');
    } else if (step === 'new') {
      if (newPin.length < 4) { setError('PIN must be at least 4 digits'); triggerShake(); return; }
      setStep('confirm');
      setError('');
    } else if (step === 'confirm') {
      if (confirmPin !== newPin) { setError('PINs do not match.'); setConfirmPin(''); triggerShake(); return; }
      setSaving(true);
      try {
        const hash = await hashPin(newPin);
        const { error: dbError } = await supabase.from('users').update({ vault_pin_hash: hash }).eq('user_id', user.id);
        if (dbError) { setError('Failed to save. Try again.'); setSaving(false); return; }
        onChanged(hash);
      } finally {
        setSaving(false);
      }
    }
  };

  const stepLabels = {
    current: { title: 'Current PIN', subtitle: 'Enter your current PIN to continue' },
    new: { title: 'New PIN', subtitle: 'Choose a new 4–6 digit PIN' },
    confirm: { title: 'Confirm PIN', subtitle: 'Re-enter your new PIN to confirm' },
  };

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full z-10"
        style={{
          background: 'var(--app-bg)',
          borderTop: '2px solid rgba(201,169,98,0.3)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-10">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[rgba(201,169,98,0.1)] transition-colors">
            <X className="w-5 h-5 text-[color:var(--app-gold)]" strokeWidth={1.5} />
          </button>

          <h2 className="text-xl text-[color:var(--app-gold)] font-light mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Change PIN
          </h2>
          <p className="text-xs text-[color:var(--app-text-3)] mb-5">
            Step {step === 'current' ? 1 : step === 'new' ? 2 : 3} of 3
          </p>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: error ? 'rgba(239,68,68,0.1)' : 'rgba(201,169,98,0.1)', border: error ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(201,169,98,0.2)' }}>
                <Lock className="w-5 h-5" style={{ color: error ? '#EF4444' : '#C9A962' }} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--app-text)' }}>{stepLabels[step].title}</p>
                <p className="text-xs" style={{ color: 'var(--app-text-3)' }}>{stepLabels[step].subtitle}</p>
              </div>
            </div>

            <motion.div animate={shake ? { x: [-10, 10, -7, 7, -3, 3, 0] } : { x: 0 }} transition={{ duration: 0.4 }}>
              <PinDots value={activePin} error={!!error} />
              {error && <p className="text-xs text-red-400 text-center mb-2">{error}</p>}
              <input
                ref={inputRef}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={PIN_LENGTH}
                value={activePin}
                onChange={(e) => setActivePin(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && activePin.length >= 4) handleNext(); }}
                className="w-full px-4 py-3.5 rounded-xl text-center text-xl tracking-[0.5em] focus:outline-none mb-4"
                style={{
                  backgroundColor: 'var(--app-bg)',
                  border: error ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(201,169,98,0.3)',
                  color: 'var(--app-text)',
                  caretColor: '#C9A962',
                  fontFamily: "'DM Sans', sans-serif",
                }}
                placeholder="• • • •"
                autoComplete="off"
              />
            </motion.div>

            <button
              onClick={handleNext}
              disabled={activePin.length < 4 || saving}
              className="w-full py-4 rounded-2xl text-base font-medium transition-all disabled:opacity-40"
              style={{
                background: 'linear-gradient(135deg, #B8955A 0%, #C9A962 100%)',
                color: '#000000',
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '17px',
              }}
            >
              {saving ? 'Saving…' : step === 'confirm' ? 'Save New PIN' : 'Continue'}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modal, document.body);
}
