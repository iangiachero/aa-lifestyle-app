import React, { useState, useEffect } from 'react';
import { X, Trash2, Cake, Plus, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { UI, getBirthdayCountdown, calculateAge, getAgeOrdinal } from '../constants';
import { useModal } from '../../../context/ModalContext';
import BirthdayDatePicker from './BirthdayDatePicker';

export default function BirthdayModal({ show, birthdays, onAdd, onDelete, onClose }) {
  const { openModal, closeModal } = useModal();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (show) {
      openModal();
      return () => closeModal();
    }
  }, [show, openModal, closeModal]);
  const [formData, setFormData] = useState({ name: '', birth_date: '' });
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleAdd = async () => {
    if (!formData.name.trim() || !formData.birth_date) return;
    setSaving(true);
    await onAdd(formData);
    setFormData({ name: '', birth_date: '' });
    setShowForm(false);
    setSaving(false);
  };

  const handleClose = () => {
    setShowForm(false);
    setFormData({ name: '', birth_date: '' });
    onClose();
  };

  const formatBirthDate = (dateStr) => {
    try {
      return format(parseISO(dateStr), 'MMMM d');
    } catch {
      return dateStr;
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={handleClose}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 rounded-t-3xl z-50"
            style={{
              backgroundColor: UI.panel2,
              borderTop: `2px solid ${UI.birthdayColor}50`,
              height: '85dvh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              className="flex-shrink-0 px-6 py-4 flex items-center justify-between"
              style={{ backgroundColor: UI.panel2, borderBottom: `1px solid ${UI.borderSofter}` }}
            >
              <div className="flex items-center gap-2">
                <Cake className="w-5 h-5" style={{ color: UI.birthdayColor }} strokeWidth={1.5} />
                <h2 className="text-xl font-light" style={{ color: UI.text }}>
                  Birthdays
                </h2>
              </div>
              <button onClick={handleClose}>
                <X className="w-6 h-6" style={{ color: UI.muted }} strokeWidth={1.5} />
              </button>
            </div>

            <div
              className="flex-1 scrollbar-hide"
              style={{
                overflowY: 'auto',
                overflowX: 'hidden',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <div className="px-6 py-4" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}>
                {birthdays.length === 0 && !showForm ? (
                  <div className="text-center py-6">
                    <Cake className="w-10 h-10 mx-auto mb-2 opacity-20" style={{ color: UI.birthdayColor }} />
                    <p className="text-sm mb-1" style={{ color: UI.muted2 }}>No birthdays added yet</p>
                    <p className="text-xs" style={{ color: UI.muted2 }}>
                      Add birthdays to see them on the calendar
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 mb-4">
                    {birthdays.map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={{
                          backgroundColor: `${UI.birthdayColor}10`,
                          border: `1px solid ${UI.birthdayColor}30`,
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${UI.birthdayColor}20` }}
                        >
                          <Cake className="w-4 h-4" style={{ color: UI.birthdayColor }} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate" style={{ color: UI.text }}>
                            {b.name}
                            {calculateAge(b.birth_date) !== null && (
                              <span className="ml-1.5 text-xs font-light" style={{ color: UI.birthdayColor, opacity: 0.75 }}>
                                ({calculateAge(b.birth_date)})
                              </span>
                            )}
                          </div>
                          <div className="text-xs" style={{ color: UI.birthdayColor }}>
                            {formatBirthDate(b.birth_date)}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: UI.birthdayColor }}>
                            {getBirthdayCountdown(b.birth_date)}
                          </div>
                          {b.notes && (
                            <div className="text-xs truncate mt-0.5" style={{ color: UI.muted2 }}>
                              {b.notes}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => onDelete(b.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-red-500/10 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" style={{ color: '#EF4444' }} strokeWidth={1.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {showForm ? (
                  <div
                    className="rounded-2xl p-4 space-y-3"
                    style={{
                      backgroundColor: UI.panel,
                      border: `1px solid ${UI.birthdayColor}40`,
                    }}
                  >
                    <div>
                      <label className="block text-xs font-light mb-1.5" style={{ color: UI.muted }}>
                        Name
                      </label>
                      <div
                        className="rounded-xl overflow-hidden"
                        style={{
                          border: `1px solid ${UI.borderSoft}`,
                          height: '48px',
                          maxHeight: '48px',
                          minHeight: '48px',
                          lineHeight: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          boxSizing: 'border-box',
                          WebkitBoxSizing: 'border-box',
                          MozBoxSizing: 'border-box',
                        }}
                      >
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Person's name"
                          className="w-full font-light"
                          style={{
                            height: '48px',
                            maxHeight: '48px',
                            minHeight: '48px',
                            lineHeight: '48px',
                            padding: '0 12px',
                            margin: 0,
                            border: 'none',
                            outline: 'none',
                            boxSizing: 'border-box',
                            WebkitBoxSizing: 'border-box',
                            MozBoxSizing: 'border-box',
                            WebkitAppearance: 'none',
                            MozAppearance: 'none',
                            appearance: 'none',
                            fontSize: '0.875rem',
                            fontFamily: 'inherit',
                            WebkitFontSmoothing: 'antialiased',
                            MozOsxFontSmoothing: 'grayscale',
                            backgroundColor: UI.panel2,
                            color: UI.text,
                            overflow: 'hidden',
                            display: 'block',
                            verticalAlign: 'middle',
                            WebkitTapHighlightColor: 'transparent',
                            transform: 'translateZ(0)',
                            WebkitTransform: 'translateZ(0)',
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-light mb-1.5" style={{ color: UI.muted }}>
                        Birthday
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowDatePicker(true)}
                        style={{
                          width: '100%',
                          height: 48,
                          borderRadius: 12,
                          border: `1px solid ${formData.birth_date ? UI.birthdayColor + '60' : UI.borderSoft}`,
                          backgroundColor: UI.panel2,
                          color: formData.birth_date ? UI.text : UI.muted2,
                          fontSize: '0.875rem',
                          fontWeight: 300,
                          fontFamily: 'inherit',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingLeft: 12,
                          paddingRight: 12,
                          cursor: 'pointer',
                          outline: 'none',
                          transition: 'border-color 0.15s',
                        }}
                      >
                        <span>
                          {formData.birth_date
                            ? format(parseISO(formData.birth_date), 'MMMM d, yyyy')
                            : 'Select birthday'}
                        </span>
                        <ChevronDown
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: formData.birth_date ? UI.birthdayColor : UI.muted2 }}
                          strokeWidth={1.5}
                        />
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs font-light mb-1.5" style={{ color: UI.muted }}>
                        Notes (optional)
                      </label>
                      <input
                        type="text"
                        value={formData.notes || ''}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Gift ideas, etc."
                        className="w-full px-3 py-2.5 rounded-xl font-light text-sm outline-none"
                        style={{
                          backgroundColor: UI.panel2,
                          border: `1px solid ${UI.borderSoft}`,
                          color: UI.text,
                        }}
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => {
                          setShowForm(false);
                          setFormData({ name: '', birth_date: '' });
                        }}
                        className="flex-1 py-2.5 rounded-xl text-sm font-light"
                        style={{
                          backgroundColor: UI.panel2,
                          border: `1px solid ${UI.border}`,
                          color: UI.muted,
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAdd}
                        disabled={!formData.name.trim() || !formData.birth_date || saving}
                        className="flex-1 py-2.5 rounded-xl text-sm font-light disabled:opacity-50"
                        style={{ backgroundColor: UI.birthdayColor, color: '#FFFFFF' }}
                      >
                        Save Birthday
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowForm(true)}
                    className="w-full py-3 rounded-xl text-sm font-light flex items-center justify-center gap-2 transition-colors"
                    style={{
                      backgroundColor: `${UI.birthdayColor}15`,
                      border: `1px solid ${UI.birthdayColor}50`,
                      color: UI.birthdayColor,
                    }}
                  >
                    <Plus className="w-4 h-4" strokeWidth={1.5} />
                    Add Birthday
                  </button>
                )}
              </div>
            </div>
            </div>
          </motion.div>
        </>
      )}
      <BirthdayDatePicker
        show={showDatePicker}
        value={formData.birth_date}
        onChange={(date) => setFormData((f) => ({ ...f, birth_date: date }))}
        onClose={() => setShowDatePicker(false)}
      />
    </AnimatePresence>
  );
}