import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const CONFIRM_WORD = 'DELETE';

// App Store guideline 5.1.1(v) requires this to be reachable from inside the
// app. It is deliberately harder to trigger than Sign out: the word has to be
// typed, because the action cannot be undone.
export default function DeleteAccountModal({ onClose, onDeleted }) {
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const canDelete = confirmText.trim().toUpperCase() === CONFIRM_WORD && !deleting;

  const handleDelete = async () => {
    if (!canDelete) return;
    setDeleting(true);
    setError('');
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        setError('Your session expired. Please sign in again.');
        setDeleting(false);
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setError(data.error || 'Could not delete your account. Please try again.');
        setDeleting(false);
        return;
      }

      await onDeleted();
    } catch (err) {
      setError(err?.message || 'Could not delete your account. Please try again.');
      setDeleting(false);
    }
  };

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/70"
        onClick={deleting ? undefined : onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full z-10"
        style={{
          background: 'var(--app-bg)',
          borderTop: '2px solid rgba(239,68,68,0.35)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-10">
          {!deleting && (
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[rgba(201,169,98,0.1)] transition-colors">
              <X className="w-5 h-5 text-[color:var(--app-gold)]" strokeWidth={1.5} />
            </button>
          )}

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertTriangle className="w-5 h-5" style={{ color: '#EF4444' }} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-xl font-light" style={{ color: '#EF4444', fontFamily: "'Cormorant Garamond', serif" }}>
                Delete account
              </h2>
              <p className="text-xs" style={{ color: 'var(--app-text-3)' }}>This cannot be undone</p>
            </div>
          </div>

          <p className="text-sm font-light mb-3" style={{ color: 'var(--app-text-2)' }}>
            Everything is permanently removed: your tasks, notes, checklists, recipes,
            saved passwords, photos and your login. If you have an active subscription
            it is cancelled straight away.
          </p>

          <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: 'var(--app-text-3)' }}>
            Type {CONFIRM_WORD} to confirm
          </label>
          <input
            ref={inputRef}
            value={confirmText}
            onChange={(e) => { setConfirmText(e.target.value); setError(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter' && canDelete) handleDelete(); }}
            disabled={deleting}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="characters"
            spellCheck="false"
            placeholder={CONFIRM_WORD}
            className="w-full px-4 py-3.5 rounded-xl text-center tracking-[0.3em] focus:outline-none mb-4"
            style={{
              backgroundColor: 'var(--app-input-bg)',
              border: error ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(201,169,98,0.3)',
              color: 'var(--app-text)',
              caretColor: '#EF4444',
            }}
          />

          {error && <p className="text-xs text-red-400 text-center mb-3">{error}</p>}

          <button
            onClick={handleDelete}
            disabled={!canDelete}
            className="w-full py-4 rounded-2xl text-base font-medium transition-all disabled:opacity-40"
            style={{ backgroundColor: '#EF4444', color: '#FFFFFF', fontFamily: "'Cormorant Garamond', serif", fontSize: '17px' }}
          >
            {deleting ? 'Deleting…' : 'Delete my account'}
          </button>

          {!deleting && (
            <button onClick={onClose} className="w-full py-3 mt-2 text-sm font-light" style={{ color: 'var(--app-text-3)' }}>
              Keep my account
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modal, document.body);
}
