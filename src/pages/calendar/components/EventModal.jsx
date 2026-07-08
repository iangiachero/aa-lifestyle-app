// src/pages/calendar/components/EventModal.jsx
import React, { useEffect } from 'react';
import { X, Trash2, Repeat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UI, CATEGORIES } from '../constants';
import CustomSelect from '../../../components/ui/CustomSelect';
import ColorPicker from '../../../components/ui/ColorPicker';
import TimePicker from '../../../components/ui/TimePicker';
import { useModal } from '../../../context/ModalContext';

export default function EventModal({
  show,
  editingEvent,
  eventData,
  onChange,
  onSave,
  onDelete,
  onClose,
  isSaving,
}) {
  const { openModal, closeModal } = useModal();

  useEffect(() => {
    if (show) {
      openModal();
      return () => closeModal();
    }
  }, [show, openModal, closeModal]);

  if (!show) return null;

  const categoryOptions = CATEGORIES.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  const repeatOptions = [
    { value: 'none', label: 'Does not repeat' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  const hasRepeat = eventData.repeat && eventData.repeat !== 'none';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="w-full rounded-t-3xl max-h-[85vh] overflow-y-auto hide-scrollbar"
            style={{
              backgroundColor: UI.panel2,
              borderTop: `2px solid ${UI.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="sticky top-0 z-10 px-6 pt-5 pb-4 flex items-center justify-between"
              style={{
                backgroundColor: UI.panel2,
                borderBottom: `1px solid ${UI.borderSoft}`,
              }}
            >
              <h2
                className="text-xl font-light"
                style={{ color: 'var(--app-gold)', fontFamily: 'Georgia, serif' }}
              >
                {editingEvent ? 'Edit Event' : 'New Event'}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-[rgba(201,169,98,0.1)]"
              >
                <X className="w-5 h-5" style={{ color: 'var(--app-gold)' }} strokeWidth={1.5} />
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-5 space-y-4" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}>
              {/* Title */}
              <div>
                <label
                  className="text-xs uppercase mb-2 block font-light tracking-wider"
                  style={{ color: UI.muted }}
                >
                  Event Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Team Meeting"
                  value={eventData.title}
                  onChange={(e) => onChange({ ...eventData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none font-light"
                  style={{
                    backgroundColor: UI.panel,
                    border: `1px solid ${UI.border}`,
                    color: UI.text,
                  }}
                  autoFocus
                />
              </div>

              {/* Start Date */}
              <div>
                <label
                  className="text-xs uppercase mb-2 block font-light tracking-wider"
                  style={{ color: UI.muted }}
                >
                  Start Date
                </label>
                <div
                  className="w-full rounded-xl overflow-hidden"
                  style={{ border: `1px solid ${UI.border}`, backgroundColor: UI.panel }}
                >
                  <input
                    type="date"
                    value={eventData.date}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      const endDate = eventData.end_date || eventData.date;
                      onChange({
                        ...eventData,
                        date: newDate,
                        end_date: endDate < newDate ? newDate : endDate,
                      });
                    }}
                    className="w-full px-4 py-3 focus:outline-none font-light bg-transparent"
                    style={{
                      color: UI.text,
                      colorScheme: 'dark',
                      WebkitAppearance: 'none',
                      appearance: 'none',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* End Date */}
              <div>
                <label
                  className="text-xs uppercase mb-2 block font-light tracking-wider"
                  style={{ color: UI.muted }}
                >
                  End Date
                  <span className="ml-1 normal-case font-light" style={{ color: UI.muted2 }}>(optional, for multi-day)</span>
                </label>
                <div
                  className="w-full rounded-xl overflow-hidden"
                  style={{ border: `1px solid ${UI.border}`, backgroundColor: UI.panel }}
                >
                  <input
                    type="date"
                    value={eventData.end_date || eventData.date}
                    min={eventData.date}
                    onChange={(e) => onChange({ ...eventData, end_date: e.target.value })}
                    className="w-full px-4 py-3 focus:outline-none font-light bg-transparent"
                    style={{
                      color: UI.text,
                      colorScheme: 'dark',
                      WebkitAppearance: 'none',
                      appearance: 'none',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Start Time */}
              <div>
                <label
                  className="text-xs uppercase mb-2 block font-light tracking-wider"
                  style={{ color: UI.muted }}
                >
                  Start Time
                </label>
                <TimePicker
                  value={eventData.start_time}
                  onChange={(val) => onChange({ ...eventData, start_time: val })}
                  placeholder="Select start time"
                />
              </div>

              {/* End Time */}
              <div>
                <label
                  className="text-xs uppercase mb-2 block font-light tracking-wider"
                  style={{ color: UI.muted }}
                >
                  End Time
                </label>
                <TimePicker
                  value={eventData.end_time}
                  onChange={(val) => onChange({ ...eventData, end_time: val })}
                  placeholder="Select end time"
                />
              </div>

              {/* Category */}
              <div>
                <label
                  className="text-xs uppercase mb-2 block font-light tracking-wider"
                  style={{ color: UI.muted }}
                >
                  Category
                </label>
                <CustomSelect
                  value={eventData.category}
                  onChange={(val) => onChange({ ...eventData, category: val })}
                  options={categoryOptions}
                  placeholder="Select category"
                />
              </div>

              {/* Color Tag */}
              <ColorPicker
                selectedColor={eventData.color || '#C9A962'}
                onSelectColor={(color) => onChange({ ...eventData, color })}
              />

              {/* Repeat */}
              <div>
                <label
                  className="text-xs uppercase mb-2 block font-light tracking-wider"
                  style={{ color: UI.muted }}
                >
                  Repeat
                </label>
                <CustomSelect
                  value={eventData.repeat || 'none'}
                  onChange={(val) => onChange({ ...eventData, repeat: val })}
                  options={repeatOptions}
                />
              </div>

              {/* End Repeat Date — only shown when repeat is active */}
              {hasRepeat && (
                <div>
                  <label
                    className="text-xs uppercase mb-2 block font-light tracking-wider"
                    style={{ color: UI.muted }}
                  >
                    End Repeat Date
                    <span className="ml-1 normal-case" style={{ color: UI.muted2 }}>(optional)</span>
                  </label>
                  <div
                    className="rounded-xl overflow-hidden"
                    style={{ border: `1px solid ${UI.border}`, backgroundColor: UI.panel }}
                  >
                    <input
                      type="date"
                      value={eventData.recurrence_end_date || ''}
                      min={eventData.date}
                      onChange={(e) => onChange({ ...eventData, recurrence_end_date: e.target.value })}
                      className="w-full px-4 py-3 focus:outline-none font-light bg-transparent"
                      style={{
                        color: eventData.recurrence_end_date ? UI.text : UI.muted2,
                        colorScheme: 'dark',
                      }}
                    />
                  </div>
                  {eventData.recurrence_end_date && (
                    <button
                      onClick={() => onChange({ ...eventData, recurrence_end_date: '' })}
                      className="mt-1.5 text-xs font-light transition-opacity hover:opacity-70"
                      style={{ color: UI.muted }}
                    >
                      Clear end date (repeat indefinitely)
                    </button>
                  )}
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Repeat className="w-3 h-3 flex-shrink-0" style={{ color: UI.muted2 }} strokeWidth={1.5} />
                    <p className="text-xs font-light" style={{ color: UI.muted2 }}>
                      {eventData.recurrence_end_date
                        ? `Repeats ${eventData.repeat} until ${eventData.recurrence_end_date}`
                        : `Repeats ${eventData.repeat} indefinitely`}
                    </p>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label
                  className="text-xs uppercase mb-2 block font-light tracking-wider"
                  style={{ color: UI.muted }}
                >
                  Notes
                </label>
                <textarea
                  placeholder="Add notes..."
                  value={eventData.notes || ''}
                  onChange={(e) => onChange({ ...eventData, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none font-light resize-none"
                  style={{
                    backgroundColor: UI.panel,
                    border: `1px solid ${UI.border}`,
                    color: UI.text,
                    minHeight: '100px',
                  }}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                {editingEvent && (
                  <button
                    onClick={onDelete}
                    disabled={isSaving}
                    className="px-6 py-3 rounded-xl font-light transition-all flex items-center gap-2"
                    style={{
                      backgroundColor: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      color: '#EF4444',
                    }}
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    Delete
                  </button>
                )}
                <button
                  onClick={onSave}
                  disabled={!eventData.title.trim() || isSaving}
                  className="flex-1 py-3 rounded-xl font-light transition-all disabled:opacity-50"
                  style={{
                    backgroundColor: UI.gold,
                    color: '#1A1612',
                  }}
                >
                  {isSaving ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
