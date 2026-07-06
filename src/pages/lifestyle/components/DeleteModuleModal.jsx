import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X } from 'lucide-react';
import { useModal } from '../../../context/ModalContext';

export default function DeleteModuleModal({ visible, moduleName, onConfirm, onCancel, deleting }) {
  const { openModal, closeModal } = useModal();

  useEffect(() => {
    if (visible) {
      openModal();
      return () => closeModal();
    }
  }, [visible, openModal, closeModal]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-5"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="w-full max-w-sm bg-[color:var(--app-bg)] rounded-2xl border border-[rgba(201,169,98,0.2)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-2 flex items-start justify-between">
              <div className="w-11 h-11 rounded-xl bg-[rgba(255,80,80,0.08)] border border-[rgba(255,80,80,0.18)] flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" strokeWidth={1.5} />
              </div>
              <button
                onClick={onCancel}
                className="text-[color:var(--app-text-3)] hover:text-[color:var(--app-text-2)] transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="px-6 pt-3 pb-6">
              <h3 className="text-[color:var(--app-text)] text-base font-light mb-1.5">Delete Module</h3>
              <p className="text-sm text-[color:var(--app-text-3)] leading-relaxed">
                Are you sure you want to delete{' '}
                <span className="text-[#C9A962]">{moduleName}</span>?
                All routines and steps inside will be permanently removed.
              </p>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={onCancel}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-xl border border-[rgba(201,169,98,0.25)] text-[color:var(--app-text-2)] text-sm hover:border-[rgba(201,169,98,0.4)] hover:text-[color:var(--app-text)] transition-all disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-xl bg-[rgba(255,80,80,0.12)] border border-[rgba(255,80,80,0.25)] text-red-400 text-sm hover:bg-[rgba(255,80,80,0.2)] hover:border-[rgba(255,80,80,0.4)] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
