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

  const handleEditEvent = (e, event) => {
    e.stopPropagation();
    const originalEvent = events?.find(ev => ev.id === event.id) || event;
    setEditingEvent(originalEvent);
    setEventData({
      title: originalEvent.title || '',
      date: originalEvent.date || '',
      start_time: originalEvent.start_time || '',
      end_time: originalEvent.end_time || '',
      category: originalEvent.category || 'personal',
      color: originalEvent.color || '#C9A962',
      repeat: originalEvent.repeat || 'none',
      recurrence_end_date: originalEvent.recurrence_end_date || '',
      notes: originalEvent.notes || '',
    });
  };

  const handleSaveEvent = async () => {
    if (!eventData.title?.trim()) return;
    setLoading(true);
    try {
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
      queryClient.invalidateQueries({ queryKey: ['events', user?.id] });
      setEditingEvent(null);
      setEventData({});
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = (e, event) => {
    e.stopPropagation();
    setDeleteTarget(event);
  };

  const confirmDeleteEvent = async () => {
    if (!deleteTarget) return;
    await supabase.from('events').delete().eq('id', deleteTarget.id).eq('user_id', user.id);
    queryClient.invalidateQueries({ queryKey: ['events', user?.id] });
    setDeleteTarget(null);
  };

  const hasRepeat = eventData.repeat && eventData.repeat !== 'none';

  if (todayEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80px] py-3">
        <Calendar className="w-8 h-8 opacity-20 mb-2 text-[#C9A962]" strokeWidth={1.3} />
        <div className="text-xs text-[#B8B8B8] font-light">No events scheduled</div>
      </div>
    );
  }

  return (
    <>
      <div className="max-h-[350px] overflow-y-auto scrollbar-hide space-y-2 pr-0.5">
        {todayEvents.map((event) => (
          <div key={event.id} className="flex items-start gap-2.5">
            <div className="text-[10px] text-[#C9A962] font-light w-12 pt-0.5 flex-shrink-0">
              {formatTime(event.start_time) || 'All day'}
            </div>
            <div className="flex-1 min-w-0 bg-[#0A0A0A] rounded-xl px-2.5 py-2 border-l-2 overflow-hidden" style={{ borderLeftColor: event.color || '#C9A962' }}>
              <div className="flex items-center gap-1.5">
                <div className="text-xs font-light leading-snug text-[#F5F1E8] truncate flex-1">{event.title}</div>
                {(event.repeat && event.repeat !== 'none') && (
                  <Repeat className="w-2.5 h-2.5 flex-shrink-0 opacity-50 text-[#C9A962]" strokeWidth={1.5} />
                )}
                <button
                  onClick={(e) => handleEditEvent(e, event)}
                  className="p-1 rounded-lg transition-all text-[#6B6B6B] hover:text-[#C9A962] hover:bg-[rgba(201,169,98,0.12)]"
                >
                  <Edit2 className="w-3 h-3" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDeleteEvent(e, event)}
                  className="p-1 rounded-lg transition-all text-[#6B6B6B] hover:text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                </button>
              </div>
              {event.end_time && (
                <div className="text-[10px] text-[#B8B8B8] font-light mt-0.5">
                  Until {formatTime(event.end_time)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

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
                <div className="rounded-2xl p-6" style={{ background: '#000000', border: '1px solid rgba(201,169,98,0.25)' }}>
                  <h3 className="text-base text-[#F5F1E8] font-light mb-1">Delete Event?</h3>
                  <p className="text-sm text-[#6B6B6B] mb-5">
                    "{deleteTarget.title}" will be permanently deleted.
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(null)}
                      className="flex-1 py-3 rounded-xl text-sm text-[#B8B8B8] transition-colors"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,169,98,0.2)' }}
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
                    background: '#000000',
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
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#000000] transition-colors"
              >
                <X className="w-5 h-5 text-[#C9A962]" />
              </button>
              <h2 className="text-xl text-[#F5F1E8] font-light mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                Edit Event
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[#B8B8B8] uppercase mb-2 block tracking-wider">Event Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Team Meeting"
                    value={eventData.title || ''}
                    onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-[#000000] border border-[rgba(201,169,98,0.3)] rounded-xl text-[#F5F1E8] placeholder-[#6B6B6B] focus:border-[#C9A962] focus:outline-none font-light"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs text-[#B8B8B8] uppercase mb-2 block tracking-wider">Date</label>
                  <input
                    type="date"
                    value={eventData.date || ''}
                    onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                    className="w-full px-4 py-3 bg-[#000000] border border-[rgba(201,169,98,0.3)] rounded-xl text-[#F5F1E8] focus:border-[#C9A962] focus:outline-none font-light"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#B8B8B8] uppercase mb-2 block tracking-wider">Start Time</label>
                    <TimePicker
                      value={eventData.start_time}
                      onChange={(val) => setEventData({ ...eventData, start_time: val })}
                      placeholder="Start time"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#B8B8B8] uppercase mb-2 block tracking-wider">End Time</label>
                    <TimePicker
                      value={eventData.end_time}
                      onChange={(val) => setEventData({ ...eventData, end_time: val })}
                      placeholder="End time"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#B8B8B8] uppercase mb-2 block tracking-wider">Category</label>
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

                <div>
                  <label className="text-xs text-[#B8B8B8] uppercase mb-2 block tracking-wider">Repeat</label>
                  <CustomSelect
                    value={eventData.repeat || 'none'}
                    onChange={(val) => setEventData({ ...eventData, repeat: val })}
                    options={REPEAT_OPTIONS}
                  />
                </div>

                {hasRepeat && (
                  <div>
                    <label className="text-xs text-[#B8B8B8] uppercase mb-2 block tracking-wider">
                      End Repeat Date
                      <span className="ml-1 normal-case text-[#6B6B6B]">(optional)</span>
                    </label>
                    <input
                      type="date"
                      value={eventData.recurrence_end_date || ''}
                      min={eventData.date}
                      onChange={(e) => setEventData({ ...eventData, recurrence_end_date: e.target.value })}
                      className="w-full px-4 py-3 bg-[#000000] border border-[rgba(201,169,98,0.3)] rounded-xl text-[#F5F1E8] focus:border-[#C9A962] focus:outline-none font-light"
                      style={{ colorScheme: 'dark' }}
                    />
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <Repeat className="w-3 h-3 flex-shrink-0 text-[#6B6B6B]" strokeWidth={1.5} />
                      <p className="text-xs font-light text-[#6B6B6B]">
                        {eventData.recurrence_end_date
                          ? `Repeats ${eventData.repeat} until ${eventData.recurrence_end_date}`
                          : `Repeats ${eventData.repeat} indefinitely`}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs text-[#B8B8B8] uppercase mb-2 block tracking-wider">Notes</label>
                  <textarea
                    placeholder="Add notes..."
                    value={eventData.notes || ''}
                    onChange={(e) => setEventData({ ...eventData, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-[#000000] border border-[rgba(201,169,98,0.3)] rounded-xl text-[#F5F1E8] placeholder-[#6B6B6B] focus:border-[#C9A962] focus:outline-none font-light resize-none"
                    style={{ minHeight: '80px' }}
                  />
                </div>

                <div className="flex gap-3 pt-2 pb-8">
                  <button
                    onClick={() => setEditingEvent(null)}
                    className="flex-1 py-3 bg-[#000000] border border-[rgba(201,169,98,0.3)] rounded-full text-sm text-[#B8B8B8] hover:bg-[rgba(201,169,98,0.1)] transition-colors"
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