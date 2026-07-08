import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Repeat, CreditCard as Edit2, Trash2, X } from 'lucide-react';
import { isToday, parseISO, startOfDay, endOfDay } from 'date-fns';
import { expandRecurringEvents } from '../../utils/recurrence';
import { supabase } from '../../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import CustomSelect from '../ui/CustomSelect';
import ColorPicker from '../ui/ColorPicker';
import TimePicker from '../ui/TimePicker';

function formatTime(time) {
  if (!time) return null;
  const [hours, minutes] = time.slice(0, 5).split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

const CATEGORIES = [
  { value: 'personal', label: 'Personal' },
  { value: 'work', label: 'Work' },
  { value: 'health', label: 'Health' },
  { value: 'school', label: 'School' },
  { value: 'social', label: 'Social' },
];

const REPEAT_OPTIONS = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function TodaySchedule({ events }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventData, setEventData] = useState({});
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [recurrenceDialog, setRecurrenceDialog] = useState(null);

  const todayEvents = useMemo(() => {
    if (!events || events.length === 0) return [];

    const today = new Date();
    const rangeStart = startOfDay(today);
    const rangeEnd = endOfDay(today);

    const expanded = expandRecurringEvents(events, rangeStart, rangeEnd);

    return expanded
      .filter(e => {
        try {
          return isToday(parseISO(e.date));
        } catch {
          return false;
        }
      })
      .sort((a, b) => {
        if (!a.start_time) return 1;
        if (!b.start_time) return -1;
        return a.start_time.localeCompare(b.start_time);
      });
  }, [events]);

  const isRecurring = (event) => {
    if (event.isRecurringInstance) return true;
    const base = events?.find(ev => ev.id === (event.baseEventId || event.id));
    return base && base.repeat && base.repeat !== 'none';
  };

  const handleEditEvent = (e, event) => {
    e.stopPropagation();
    if (isRecurring(event)) {
      setRecurrenceDialog({ type: 'edit', event });
      return;
    }
    openEditModal(event, false);
  };

  const openEditModal = (event, editThisOnly) => {
    const baseId = event.baseEventId || event.id;
    const base = events?.find(ev => ev.id === baseId) || event;

    if (editThisOnly) {
      setEditingEvent({
        ...base,
        isRecurringInstance: true,
        baseEventId: baseId,
        originalDate: event.date,
      });
      setEventData({
        title: base.title || '',
        date: event.date || '',
        start_time: base.start_time || '',
        end_time: base.end_time || '',
        category: base.category || 'personal',
        color: base.color || '#C9A962',
        repeat: 'none',
        recurrence_end_date: '',
        notes: base.notes || '',
      });
    } else {
      setEditingEvent(base);
      setEventData({
        title: base.title || '',
        date: base.date || '',
        start_time: base.start_time || '',
        end_time: base.end_time || '',
        category: base.category || 'personal',
        color: base.color || '#C9A962',
        repeat: base.repeat || 'none',
        recurrence_end_date: base.recurrence_end_date || '',
        notes: base.notes || '',
      });
    }
  };

  const handleSaveEvent = async () => {
    if (!eventData.title?.trim()) return;
    setLoading(true);
    try {
      if (editingEvent.isRecurringInstance && editingEvent.baseEventId) {
        const baseEvent = events?.find(e => e.id === editingEvent.baseEventId);
        if (baseEvent) {
          const currentExceptions = baseEvent.recurrence_exceptions || [];
          const originalDate = editingEvent.originalDate;
          if (!currentExceptions.includes(originalDate)) {
            await supabase
              .from('events')
              .update({ recurrence_exceptions: [...currentExceptions, originalDate] })
              .eq('id', editingEvent.baseEventId);
          }
        }
        await supabase.from('events').insert({
          title: eventData.title,
          date: eventData.date,
          start_time: eventData.start_time || null,
          end_time: eventData.end_time || null,
          category: eventData.category,
          color: eventData.color,
          repeat: 'none',
          notes: eventData.notes,
          user_id: user.id,
        });
      } else {
        await supabase
          .from('events')
          .update({
            title: eventData.title,
            date: eventData.date,
            start_time: eventData.start_time || null,
            end_time: eventData.end_time || null,
            category: eventData.category,
            color: eventData.color,
            repeat: eventData.repeat,
            recurrence_end_date: eventData.recurrence_end_date || null,
            notes: eventData.notes,
          })
          .eq('id', editingEvent.id)
          .eq('user_id', user.id);
      }
      queryClient.invalidateQueries({ queryKey: ['events', user?.id] });
      setEditingEvent(null);
      setEventData({});
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = (e, event) => {
    e.stopPropagation();
    if (isRecurring(event)) {
      setRecurrenceDialog({ type: 'delete', event });
      return;
    }
    setDeleteTarget(event);
  };

  const getRealId = (id) => {
    if (!id) return id;
    // Composite IDs look like "real-uuid_2026-06-14" — extract the real base UUID
    const uuidPattern = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
    const match = String(id).match(uuidPattern);
    return match ? match[1] : id;
  };

  const confirmDeleteEvent = async () => {
    if (!deleteTarget) return;
    const realId = getRealId(deleteTarget.id);
    const baseEventId = deleteTarget.baseEventId ? getRealId(deleteTarget.baseEventId) : null;
    const idToDelete = baseEventId || realId;
    try {
      await supabase.from('events').delete().eq('id', idToDelete).eq('user_id', user.id);
    } catch (err) {
      console.error('Delete event error:', err);
    }
    queryClient.invalidateQueries({ queryKey: ['events', user?.id] });
    setDeleteTarget(null);
  };

  const handleRecurrenceChoice = async (choice) => {
    const { type, event } = recurrenceDialog;
    setRecurrenceDialog(null);
    const baseId = getRealId(event.baseEventId || event.id);

    if (type === 'edit') {
      openEditModal(event, choice === 'this');
    } else if (type === 'delete') {
      if (choice === 'this') {
        const baseEvent = events?.find(e => e.id === baseId);
        if (baseEvent) {
          const currentExceptions = baseEvent.recurrence_exceptions || [];
          if (!currentExceptions.includes(event.date)) {
            try {
              await supabase
                .from('events')
                .update({ recurrence_exceptions: [...currentExceptions, event.date] })
                .eq('id', baseId);
            } catch (err) {
              console.error('Exception update error:', err);
            }
          }
          queryClient.invalidateQueries({ queryKey: ['events', user?.id] });
        }
      } else {
        try {
          await supabase.from('events').delete().eq('id', baseId).eq('user_id', user.id);
        } catch (err) {
          console.error('Delete series error:', err);
        }
        queryClient.invalidateQueries({ queryKey: ['events', user?.id] });
      }
    }
  };

  const hasRepeat = eventData.repeat && eventData.repeat !== 'none';

  if (todayEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80px] py-3">
        <Calendar className="w-8 h-8 opacity-20 mb-2 text-[color:var(--app-gold)]" strokeWidth={1.3} />
        <div className="text-xs text-[color:var(--app-text-2)] font-light">No events scheduled</div>
      </div>
    );
  }

  return (
    <>
      <div className="max-h-[350px] overflow-y-auto scrollbar-hide space-y-2 pr-0.5">
        {todayEvents.map((event) => (
          <div key={event.id} className="flex items-start gap-2.5">
            <div className="text-[10px] text-[color:var(--app-gold)] font-light w-12 pt-0.5 flex-shrink-0">
              {formatTime(event.start_time) || 'All day'}
            </div>
            <div className="flex-1 min-w-0 bg-[color:var(--app-bg)] rounded-xl px-2.5 py-2 border-l-2 overflow-hidden" style={{ borderLeftColor: event.color || '#C9A962' }}>
              <div className="flex items-center gap-1.5">
                <div className="text-sm leading-snug text-[color:var(--app-text)] truncate flex-1" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, letterSpacing: '0.01em' }}>{event.title}</div>
                {(event.repeat && event.repeat !== 'none') && (
                  <Repeat className="w-2.5 h-2.5 flex-shrink-0 opacity-50 text-[color:var(--app-gold)]" strokeWidth={1.5} />
                )}
                <button
                  onClick={(e) => handleEditEvent(e, event)}
                  className="p-1 rounded-lg transition-all text-[color:var(--app-text-3)] hover:text-[color:var(--app-gold)] hover:bg-[rgba(201,169,98,0.12)]"
                >
                  <Edit2 className="w-3 h-3" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDeleteEvent(e, event)}
                  className="p-1 rounded-lg transition-all text-[color:var(--app-text-3)] hover:text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                </button>
              </div>
              {event.end_time && (
                <div className="text-[11px] text-[color:var(--app-text-2)] mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, letterSpacing: '0.02em' }}>
                  Until {formatTime(event.end_time)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recurrence dialog */}
      {createPortal(
        <AnimatePresence>
          {recurrenceDialog && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-[100]"
                onClick={() => setRecurrenceDialog(null)}
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
                <div className="rounded-2xl p-6" style={{ background: 'var(--app-bg)', border: '1px solid rgba(201,169,98,0.25)' }}>
                  <h3 className="text-base text-[color:var(--app-text)] font-light mb-1">
                    {recurrenceDialog.type === 'edit' ? 'Edit Recurring Event' : 'Delete Recurring Event'}
                  </h3>
                  <p className="text-sm text-[color:var(--app-text-3)] mb-5">
                    This is a recurring event. What would you like to {recurrenceDialog.type === 'edit' ? 'edit' : 'delete'}?
                  </p>
                  <div className="space-y-2.5">
                    <button
                      onClick={() => handleRecurrenceChoice('this')}
                      className="w-full py-3 rounded-xl text-sm font-medium transition-colors"
                      style={{
                        background: recurrenceDialog.type === 'delete' ? 'rgba(239,68,68,0.15)' : 'rgba(201,169,98,0.12)',
                        border: recurrenceDialog.type === 'delete' ? '1px solid rgba(239,68,68,0.35)' : '1px solid rgba(201,169,98,0.3)',
                        color: recurrenceDialog.type === 'delete' ? '#EF4444' : '#C9A962',
                      }}
                    >
                      This event only
                    </button>
                    <button
                      onClick={() => handleRecurrenceChoice('all')}
                      className="w-full py-3 rounded-xl text-sm font-medium transition-colors"
                      style={{
                        background: recurrenceDialog.type === 'delete' ? 'rgba(239,68,68,0.85)' : 'rgba(201,169,98,0.85)',
                        color: recurrenceDialog.type === 'delete' ? '#FFFFFF' : '#000000',
                      }}
                    >
                      All events in series
                    </button>
                    <button
                      onClick={() => setRecurrenceDialog(null)}
                      className="w-full py-3 rounded-xl text-sm text-[color:var(--app-text-3)] transition-colors"
                      style={{ background: 'var(--app-wash-soft)' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Delete confirmation (non-recurring) */}
      {createPortal(
        <AnimatePresence>
          {deleteTarget && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-[100]"
                onClick={() => setDeleteTarget(null)}
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
                <div className="rounded-2xl p-6" style={{ background: 'var(--app-bg)', border: '1px solid rgba(201,169,98,0.25)' }}>
                  <h3 className="text-base text-[color:var(--app-text)] font-light mb-1">Delete Event?</h3>
                  <p className="text-sm text-[color:var(--app-text-3)] mb-5">
                    "{deleteTarget.title}" will be permanently deleted.
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(null)}
                      className="flex-1 py-3 rounded-xl text-sm text-[color:var(--app-text-2)] transition-colors"
                      style={{ background: 'var(--app-wash)', border: '1px solid rgba(201,169,98,0.2)' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={confirmDeleteEvent}
                      className="flex-1 py-3 rounded-xl text-sm text-white font-medium transition-colors hover:opacity-90"
                      style={{ background: 'rgba(239,68,68,0.85)' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Edit modal */}
      {createPortal(
        <AnimatePresence>
          {editingEvent && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-[100]"
                onClick={() => setEditingEvent(null)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed inset-x-0 bottom-0 z-[200]"
                style={{ maxHeight: '85vh', borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="relative overflow-y-auto"
                  style={{
                    background: 'var(--app-bg)',
                    borderTop: '2px solid rgba(201,169,98,0.3)',
                    borderTopLeftRadius: '24px',
                    borderTopRightRadius: '24px',
                    maxHeight: '85vh',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
            <div className="p-6">
              <button
                onClick={() => setEditingEvent(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[color:var(--app-bg)] transition-colors"
              >
                <X className="w-5 h-5 text-[color:var(--app-gold)]" />
              </button>
              <h2 className="text-xl text-[color:var(--app-text)] font-light mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                {editingEvent.isRecurringInstance ? 'Edit This Event' : 'Edit Event'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[color:var(--app-text-2)] uppercase mb-2 block tracking-wider">Event Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Team Meeting"
                    value={eventData.title || ''}
                    onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-xl text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:border-[#C9A962] focus:outline-none font-light"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs text-[color:var(--app-text-2)] uppercase mb-2 block tracking-wider">Date</label>
                  <input
                    type="date"
                    value={eventData.date || ''}
                    onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                    className="w-full px-4 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-xl text-[color:var(--app-text)] focus:border-[#C9A962] focus:outline-none font-light"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[color:var(--app-text-2)] uppercase mb-2 block tracking-wider">Start Time</label>
                    <TimePicker
                      value={eventData.start_time}
                      onChange={(val) => setEventData({ ...eventData, start_time: val })}
                      placeholder="Start time"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[color:var(--app-text-2)] uppercase mb-2 block tracking-wider">End Time</label>
                    <TimePicker
                      value={eventData.end_time}
                      onChange={(val) => setEventData({ ...eventData, end_time: val })}
                      placeholder="End time"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[color:var(--app-text-2)] uppercase mb-2 block tracking-wider">Category</label>
                  <CustomSelect
                    value={eventData.category}
                    onChange={(val) => setEventData({ ...eventData, category: val })}
                    options={CATEGORIES}
                    placeholder="Select category"
                  />
                </div>

                <ColorPicker
                  selectedColor={eventData.color || '#C9A962'}
                  onSelectColor={(color) => setEventData({ ...eventData, color })}
                />

                {!editingEvent.isRecurringInstance && (
                  <div>
                    <label className="text-xs text-[color:var(--app-text-2)] uppercase mb-2 block tracking-wider">Repeat</label>
                    <CustomSelect
                      value={eventData.repeat || 'none'}
                      onChange={(val) => setEventData({ ...eventData, repeat: val })}
                      options={REPEAT_OPTIONS}
                    />
                  </div>
                )}

                {hasRepeat && !editingEvent.isRecurringInstance && (
                  <div>
                    <label className="text-xs text-[color:var(--app-text-2)] uppercase mb-2 block tracking-wider">
                      End Repeat Date
                      <span className="ml-1 normal-case text-[color:var(--app-text-3)]">(optional)</span>
                    </label>
                    <input
                      type="date"
                      value={eventData.recurrence_end_date || ''}
                      min={eventData.date}
                      onChange={(e) => setEventData({ ...eventData, recurrence_end_date: e.target.value })}
                      className="w-full px-4 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-xl text-[color:var(--app-text)] focus:border-[#C9A962] focus:outline-none font-light"
                      style={{ colorScheme: 'dark' }}
                    />
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <Repeat className="w-3 h-3 flex-shrink-0 text-[color:var(--app-text-3)]" strokeWidth={1.5} />
                      <p className="text-xs font-light text-[color:var(--app-text-3)]">
                        {eventData.recurrence_end_date
                          ? `Repeats ${eventData.repeat} until ${eventData.recurrence_end_date}`
                          : `Repeats ${eventData.repeat} indefinitely`}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs text-[color:var(--app-text-2)] uppercase mb-2 block tracking-wider">Notes</label>
                  <textarea
                    placeholder="Add notes..."
                    value={eventData.notes || ''}
                    onChange={(e) => setEventData({ ...eventData, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-xl text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:border-[#C9A962] focus:outline-none font-light resize-none"
                    style={{ minHeight: '80px' }}
                  />
                </div>

                <div className="flex gap-3 pt-2 pb-8">
                  <button
                    onClick={() => setEditingEvent(null)}
                    className="flex-1 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-full text-sm text-[color:var(--app-text-2)] hover:bg-[rgba(201,169,98,0.1)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEvent}
                    disabled={!eventData.title?.trim() || loading}
                    className="flex-1 py-3 bg-[#C9A962] rounded-full text-sm text-[#000000] font-medium hover:bg-[#D4B574] transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Update Event'}
                  </button>
                </div>
              </div>
            </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
