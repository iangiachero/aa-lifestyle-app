import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Repeat, X } from 'lucide-react';
import { UI } from '../constants';
import { useModal } from '../../../context/ModalContext';

export default function RecurrenceDialog({ type, onConfirm, onCancel }) {
  const isEdit = type === 'edit';
  const { openModal, closeModal } = useModal();

  useEffect(() => {
    openModal();
    return () => closeModal();
  }, [openModal, closeModal]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-center justify-center px-6"
        style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="w-full max-w-sm rounded-2xl overflow-hidden"
          style={{
            backgroundColor: UI.panel2,
            border: `1px solid ${UI.border}`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 pt-6 pb-2 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${UI.gold}18` }}
            >
              <Repeat className="w-5 h-5" style={{ color: 'var(--app-gold)' }} strokeWidth={1.5} />
            </div>
            <div>
              <h3
                className="text-base font-light"
                style={{ color: UI.text, fontFamily: 'Georgia, serif' }}
              >
                {isEdit ? 'Edit Recurring Event' : 'Delete Recurring Event'}
              </h3>
              <p className="text-xs mt-0.5 font-light" style={{ color: UI.muted }}>
                This event repeats. What would you like to {isEdit ? 'edit' : 'delete'}?
              </p>
            </div>
          </div>

          <div className="px-6 pt-4 pb-6 flex flex-col gap-3">
            <button
              onClick={() => onConfirm('this')}
              className="w-full px-4 py-3.5 rounded-xl text-left transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                backgroundColor: `${UI.gold}12`,
                border: `1px solid ${UI.border}`,
              }}
            >
              <div className="text-sm font-medium" style={{ color: UI.text }}>
                {isEdit ? 'This event only' : 'This event only'}
              </div>
              <div className="text-xs mt-0.5 font-light" style={{ color: UI.muted }}>
                {isEdit
                  ? 'Only change this specific occurrence'
                  : 'Remove only this specific occurrence'}
              </div>
            </button>

            <button
              onClick={() => onConfirm('all')}
              className="w-full px-4 py-3.5 rounded-xl text-left transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                backgroundColor: isEdit ? `${UI.gold}22` : 'rgba(239,68,68,0.08)',
                border: `1px solid ${isEdit ? UI.borderSoft : 'rgba(239,68,68,0.25)'}`,
              }}
            >
              <div className="text-sm font-medium" style={{ color: isEdit ? UI.gold : '#EF4444' }}>
                {isEdit ? 'All events in series' : 'All events in series'}
              </div>
              <div className="text-xs mt-0.5 font-light" style={{ color: UI.muted }}>
                {isEdit
                  ? 'Change the entire recurring series'
                  : 'Delete the entire recurring series'}
              </div>
            </button>

            <button
              onClick={onCancel}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-light transition-all hover:opacity-70"
              style={{ color: UI.muted }}
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
