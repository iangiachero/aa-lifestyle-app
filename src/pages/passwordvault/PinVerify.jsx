import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';
import { verifyPin } from '../../utils/pinHash';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const PIN_LENGTH = 6;
const MAX_ATTEMPTS = 3;

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

export default function PinVerify({ pinHash, onUnlock, onReset }) {
  const { user } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [shake, setShake] = useState(false);
  const [checking, setChecking] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handlePinChange = (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, PIN_LENGTH);
    setError('');
    setPin(digits);
  };

  const handleVerify = async () => {
    if (pin.length < 4 || checking || locked) return;
    setChecking(true);
    try {
      const valid = await verifyPin(pin, pinHash);
      if (valid) {
        // Keep vault unlocked for 24 hours so user doesn't re-enter PIN every session
        localStorage.setItem('vault_unlock_expiry', (Date.now() + 24 * 60 * 60 * 1000).toString());
        onUnlock();
      } else {
        const next = attempts + 1;
        setAttempts(next);
        setPin('');
        triggerShake();
        if (next >= MAX_ATTEMPTS) {
          setLocked(true);
          setError('Too many attempts. Wait 30 seconds.');
          setTimeout(() => {
            setLocked(false);
            setAttempts(0);
            setError('');
          }, 30000);
        } else {
          setError(`Incorrect PIN. ${MAX_ATTEMPTS - next} attempt${MAX_ATTEMPTS - next !== 1 ? 's' : ''} remaining.`);
        }
      }
    } finally {
      setChecking(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const canUnlock = pin.length >= 4 && !locked && !checking;

  const handleReset = async () => {
    if (!user?.id) return;
    setResetting(true);
    try {
      await supabase.from('password_vault').delete().eq('user_id', user.id);
      await supabase.from('users').update({ vault_pin_hash: null }).eq('user_id', user.id);
      localStorage.removeItem('vault_unlock_expiry');
      onReset();
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-full pb-32 flex flex-col">
      <div className="border-b-2 border-[rgba(201,169,98,0.25)] page-safe-x py-6">
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
        <div className="w-full max-w-xs">
          <motion.div
            animate={shake ? { x: [-12, 12, -9, 9, -5, 5, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-2"
          >
            <div
              className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center transition-colors duration-300"
              style={{
                backgroundColor: error ? 'rgba(239,68,68,0.1)' : 'rgba(201,169,98,0.1)',
                border: error
                  ? '1px solid rgba(239,68,68,0.25)'
                  : '1px solid rgba(201,169,98,0.2)',
              }}
            >
              <Lock
                className="w-9 h-9 transition-colors duration-300"
                style={{ color: error ? '#EF4444' : '#C9A962' }}
                strokeWidth={1.5}
              />
            </div>

            <h2
              className="text-2xl mb-2 font-light"
              style={{ color: '#C9A962', fontFamily: "'Cormorant Garamond', serif" }}
            >
              Enter PIN
            </h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Unlock your password vault
            </p>

            <PinDots value={pin} error={!!error} />

            <div className="min-h-[1.25rem]">
              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>
          </motion.div>

          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={PIN_LENGTH}
            value={pin}
            onChange={(e) => handlePinChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canUnlock) handleVerify();
            }}
            disabled={locked}
            className="w-full px-4 py-3.5 rounded-xl text-center text-xl tracking-[0.5em] focus:outline-none mb-5 mt-3"
            style={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: error
                ? '1px solid rgba(239,68,68,0.6)'
                : '1px solid rgba(201,169,98,0.3)',
              color: '#F5F1E8',
              caretColor: '#C9A962',
              opacity: locked ? 0.4 : 1,
            }}
            placeholder="• • • •"
            autoComplete="off"
          />

          <button
            onClick={handleVerify}
            disabled={!canUnlock}
            className="w-full py-4 rounded-2xl text-base font-medium transition-all disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, #B8955A 0%, #C9A962 100%)',
              color: '#000000',
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '17px',
              boxShadow: canUnlock ? '0 4px 16px rgba(184,149,90,0.3)' : 'none',
            }}
          >
            {checking ? 'Verifying…' : locked ? 'Locked' : 'Unlock Vault'}
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full mt-4 text-sm py-2 transition-opacity hover:opacity-70"
            style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'Cormorant Garamond', serif" }}
          >
            Forgot PIN?
          </button>
        </div>
      </div>

      {/* Reset confirmation */}
      <AnimatePresence>
        {showResetConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-[100]"
              onClick={() => setShowResetConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-x-4 z-[200]"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rounded-2xl p-6" style={{ background: '#000000', border: '1px solid rgba(201,169,98,0.25)' }}>
                <h3 className="text-base text-[#F5F1E8] font-light mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Reset Vault?
                </h3>
                <p className="text-sm text-[#6B6B6B] mb-5 leading-relaxed">
                  This will permanently delete <span className="text-[#F5F1E8]">all saved passwords</span> and reset your PIN. This action cannot be undone.
                </p>
                <div className="space-y-2.5">
                  <button
                    onClick={handleReset}
                    disabled={resetting}
                    className="w-full py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                    style={{ background: 'rgba(239,68,68,0.85)', color: '#FFFFFF' }}
                  >
                    {resetting ? 'Resetting…' : 'Yes, Reset Vault'}
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="w-full py-3 rounded-xl text-sm text-[#B8B8B8] transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,169,98,0.15)' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
