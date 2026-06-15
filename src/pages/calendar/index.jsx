// src/pages/calendar/index.jsx
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  getDay,
  startOfWeek,
} from 'date-fns';
import { UI, CATEGORIES, calculateAge, getAgeOrdinal } from './constants';
import { CalendarSkeleton } from '../../components/ui/PageSkeleton';
import { Plus } from 'lucide-react';
import CalendarHeader from './components/CalendarHeader';
import MonthView from './components/MonthView';
import WeekView from './components/WeekView';
import DayView from './components/DayView';
import DayEventList from './components/DayEventList';
import EventModal from './components/EventModal';
import RecurrenceDialog from './components/RecurrenceDialog';

import { expandRecurringEvents, expandMultiDayEvents, getRecurrenceRangeForCalendar } from '../../utils/recurrence';
import { getHolidaysForRange } from '../../utils/holidays';

const DAY_ABBR = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const DEFAULT_EVENT = {
  title: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  end_date: '',
  start_time: '09:00',
  end_time: '10:00',
  category: 'personal',
  color: '#C9A962',
  notes: '',
  repeat: 'none',
  recurrence_end_date: '',
};

function getMondayFirstWeeks(selectedDate) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);

  const dayOfWeekStart = getDay(monthStart);
  const gridStart = addDays(monthStart, -dayOfWeekStart);

  const dayOfWeekEnd = getDay(monthEnd);
  const offsetToSaturday = dayOfWeekEnd === 6 ? 0 : 6 - dayOfWeekEnd;
  const gridEnd = addDays(monthEnd, offsetToSaturday);

  const days = [];
  let d = gridStart;
  while (d <= gridEnd) {
    days.push(d);
    d = addDays(d, 1);
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export default function CalendarIndex() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('monthly');
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventData, setEventData] = useState(DEFAULT_EVENT);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const [recurrenceDialog, setRecurrenceDialog] = useState(null);
  const eventListRef = useRef(null);

  const [showHolidays, setShowHolidays] = useState(() => {
    const stored = localStorage.getItem('showHolidays');
    return stored === null ? true : stored === 'true';
  });

  const [holidayCategories, setHolidayCategories] = useState(() => {
    try {
      const stored = localStorage.getItem('holidayCategories');
      if (stored) return JSON.parse(stored);
    } catch {}
    return ['usa', 'christian', 'cultural', 'seasonal'];
  });

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'showHolidays') {
        setShowHolidays(e.newValue === null ? true : e.newValue === 'true');
      }
      if (e.key === 'holidayCategories') {
        try { setHolidayCategories(JSON.parse(e.newValue) || []); } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const clampEventListScroll = useCallback((e) => {
    const el = e.currentTarget ?? e.target;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (el.scrollTop < 0) {
      el.scrollTop = 0;
    } else if (el.scrollTop > maxScroll) {
      el.scrollTop = maxScroll;
    }
  }, []);

  useEffect(() => {
    const el = eventListRef.current;
    if (!el) return;
    el.addEventListener('scroll', clampEventListScroll, { passive: true });
    return () => el.removeEventListener('scroll', clampEventListScroll);
  }, [clampEventListScroll]);


  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['events', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['calendar-tasks', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, due_date, category, color_tag, status, priority')
        .eq('user_id', user.id)
        .not('due_date', 'is', null)
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: birthdays = [] } = useQuery({
    queryKey: ['birthdays', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('birthdays')
        .select('*')
        .eq('user_id', user.id)
        .order('birth_date', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const holidays = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return getHolidaysForRange(currentYear - 1, currentYear + 5);
  }, []);

  const expandedEvents = useMemo(() => {
    const { rangeStart, rangeEnd } = getRecurrenceRangeForCalendar();
    const recurring = events.length ? expandRecurringEvents(events, rangeStart, rangeEnd) : [];
    const expanded = expandMultiDayEvents(recurring);
    if (!showHolidays || holidayCategories.length === 0) return expanded;
    const filtered = holidays.filter((h) => holidayCategories.includes(h.holidayCategory));
    return [...expanded, ...filtered];
  }, [events, holidays, showHolidays, holidayCategories]);

  const createEventMutation = useMutation({
    mutationFn: async (payload) => {
      const { data: { user } } = await supabase.auth.getUser();
      const cleanPayload = { ...payload };
      if (!cleanPayload.recurrence_end_date) delete cleanPayload.recurrence_end_date;
      if (!cleanPayload.end_date || cleanPayload.end_date === cleanPayload.date) delete cleanPayload.end_date;
      const { data, error } = await supabase
        .from('events')
        .insert({ ...cleanPayload, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (newEvent) => {
      queryClient.setQueryData(['events', user?.id], (old) => [...(old || []), newEvent]);
      queryClient.invalidateQueries({ queryKey: ['events', user?.id] });
      setShowEventModal(false);
      setSelectedDate(parseISO(newEvent.date));
      resetForm();
    },
    onError: () => { queryClient.invalidateQueries({ queryKey: ['events', user?.id] }); },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const cleanData = {
        title: data.title,
        date: data.date,
        end_date: (!data.end_date || data.end_date === data.date) ? null : data.end_date,
        start_time: data.start_time ? data.start_time.slice(0, 5) : data.start_time,
        end_time: data.end_time ? data.end_time.slice(0, 5) : data.end_time,
        category: data.category,
        color: data.color,
        notes: data.notes,
        repeat: data.repeat,
        recurrence_exceptions: data.recurrence_exceptions,
      };
      if (data.recurrence_end_date) {
        cleanData.recurrence_end_date = data.recurrence_end_date;
      }
      const { data: result, error } = await supabase
        .from('events')
        .update(cleanData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: (updatedEvent) => {
      queryClient.setQueryData(['events', user?.id], (old) =>
        (old || []).map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
      );
      queryClient.invalidateQueries({ queryKey: ['events', user?.id] });
      setShowEventModal(false);
      resetForm();
    },
    onError: (err) => {
      queryClient.invalidateQueries({ queryKey: ['events', user?.id] });
      console.error('Event update failed:', err);
      alert('Failed to update event. Please try again.');
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(['events', user?.id], (old) =>
        (old || []).filter((e) => e.id !== deletedId)
      );
      queryClient.invalidateQueries({ queryKey: ['events', user?.id] });
      setShowEventModal(false);
      resetForm();
    },
    onError: () => { queryClient.invalidateQueries({ queryKey: ['events', user?.id] }); },
  });

  const addExceptionMutation = useMutation({
    mutationFn: async ({ id, exceptionDate }) => {
      const baseEvent = events.find(e => e.id === id);
      if (!baseEvent) throw new Error('Event not found');
      const currentExceptions = baseEvent.recurrence_exceptions || [];
      const newExceptions = [...currentExceptions, exceptionDate];
      const { data: result, error } = await supabase
        .from('events')
        .update({ recurrence_exceptions: newExceptions })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: (updatedEvent) => {
      queryClient.setQueryData(['events', user?.id], (old) =>
        (old || []).map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
      );
      setShowEventModal(false);
      resetForm();
    },
    onError: () => { queryClient.invalidateQueries({ queryKey: ['events', user?.id] }); },
  });

  const createBirthdayMutation = useMutation({
    mutationFn: async (payload) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: birthday, error: birthdayError } = await supabase
        .from('birthdays')
        .insert({ ...payload, user_id: user.id })
        .select()
        .single();
      if (birthdayError) throw birthdayError;

      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          title: `${birthday.name}'s Birthday`,
          date: birthday.birth_date,
          start_time: '00:00',
          end_time: '23:59',
          category: 'birthday',
          color: '#F472B6',
          repeat: 'yearly',
          recurrence_end_date: null,
          user_id: user.id,
        })
        .select()
        .single();
      if (eventError) throw eventError;

      const { error: linkError } = await supabase
        .from('birthdays')
        .update({ birthday_event_id: event.id })
        .eq('id', birthday.id);
      if (linkError) throw linkError;

      return { ...birthday, birthday_event_id: event.id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['birthdays']);
      queryClient.invalidateQueries({ queryKey: ['events', user?.id] });
    },
  });

  const deleteBirthdayMutation = useMutation({
    mutationFn: async (id) => {
      const { data: birthday, error: fetchError } = await supabase
        .from('birthdays')
        .select('birthday_event_id')
        .eq('id', id)
        .maybeSingle();
      if (fetchError) throw fetchError;

      const { error } = await supabase.from('birthdays').delete().eq('id', id);
      if (error) throw error;

      if (birthday?.birthday_event_id) {
        await supabase.from('events').delete().eq('id', birthday.birthday_event_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['birthdays']);
      queryClient.invalidateQueries({ queryKey: ['events', user?.id] });
    },
  });

  const resetForm = () => {
    setEventData({ ...DEFAULT_EVENT, date: format(selectedDate, 'yyyy-MM-dd') });
    setEditingEvent(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setEventData((prev) => ({ ...prev, date: format(selectedDate, 'yyyy-MM-dd') }));
    setShowEventModal(true);
  };

  const handleQuickAdd = (category, defaultTitle, color) => {
    resetForm();
    setEventData({
      ...DEFAULT_EVENT,
      date: format(selectedDate, 'yyyy-MM-dd'),
      category,
      title: defaultTitle,
      color: color || DEFAULT_EVENT.color,
    });
    setShowEventModal(true);
  };

  const handleEditEvent = (event) => {
    if (event.isHoliday) return;
    const isRecurring = event.isRecurringInstance || (event.repeat && event.repeat !== 'none');
    if (isRecurring) {
      setRecurrenceDialog({
        type: 'edit',
        event: event.isRecurringInstance ? event : { ...event, baseEventId: event.id },
      });
      return;
    }
    openEditModal(event);
  };

  const normalizeTime = (t) => {
    if (!t) return '';
    return t.slice(0, 5);
  };

  const openEditModal = (event) => {
    const baseEvent = event.baseEventId
      ? events.find(e => e.id === event.baseEventId) || event
      : event;

    if (event.isRecurringInstance) {
      setEditingEvent({
        ...baseEvent,
        isRecurringInstance: true,
        baseEventId: event.baseEventId || event.id,
        originalDate: event.originalDate || event.date,
      });
    } else {
      setEditingEvent(baseEvent);
    }

    setEventData({
      title: baseEvent.title,
      date: event.isRecurringInstance ? event.date : baseEvent.date,
      end_date: baseEvent.end_date || '',
      start_time: normalizeTime(baseEvent.start_time),
      end_time: normalizeTime(baseEvent.end_time),
      category: baseEvent.category,
      color: baseEvent.color,
      notes: baseEvent.notes || '',
      repeat: event.isRecurringInstance ? 'none' : (baseEvent.repeat || 'none'),
      recurrence_end_date: event.isRecurringInstance ? '' : (baseEvent.recurrence_end_date || ''),
    });
    setShowEventModal(true);
  };

  const handleSaveEvent = async () => {
    if (!eventData.title.trim()) return;
    if (editingEvent) {
      // "Edit this event only" for a recurring instance:
      // 1. Add exception to base event for the original date
      // 2. Create a new standalone event with the edited data
      if (editingEvent.isRecurringInstance && editingEvent.baseEventId) {
        const baseEventId = editingEvent.baseEventId;
        const originalDate = editingEvent.originalDate || editingEvent.date;
        // Add exception to base event
        const baseEvent = events.find(e => e.id === baseEventId);
        if (baseEvent) {
          const currentExceptions = baseEvent.recurrence_exceptions || [];
          if (!currentExceptions.includes(originalDate)) {
            await supabase
              .from('events')
              .update({ recurrence_exceptions: [...currentExceptions, originalDate] })
              .eq('id', baseEventId);
          }
        }
        // Create new standalone event for this occurrence
        const newPayload = { ...eventData, repeat: 'none', recurrence_end_date: null, recurrence_exceptions: [] };
        delete newPayload.recurrence_end_date;
        createEventMutation.mutate(newPayload);
      } else {
        // Normal edit (edit all in series, or non-recurring event)
        const payload = { ...eventData };
        if (!payload.recurrence_end_date) delete payload.recurrence_end_date;
        updateEventMutation.mutate({ id: editingEvent.id, data: payload });
      }
    } else {
      createEventMutation.mutate(eventData);
    }
  };

  const handleDeleteEvent = () => {
    if (!editingEvent) return;

    const baseRepeat = editingEvent.repeat || 'none';
    if (baseRepeat !== 'none') {
      const instanceDate = eventData.date;

      setShowEventModal(false);
      setRecurrenceDialog({
        type: 'delete',
        event: {
          ...editingEvent,
          isRecurringInstance: true,
          date: instanceDate,
          baseEventId: editingEvent.id,
        },
      });
      return;
    }

    deleteEventMutation.mutate(editingEvent.id);
  };

  const handleRecurrenceDialogConfirm = (choice) => {
    const { type, event } = recurrenceDialog;
    setRecurrenceDialog(null);

    if (type === 'edit') {
      if (choice === 'this') {
        openEditModal({ ...event, isRecurringInstance: true, originalDate: event.date });
      } else {
        const baseEvent = events.find(e => e.id === event.baseEventId) || event;
        openEditModal({ ...baseEvent, isRecurringInstance: false });
      }
    } else if (type === 'delete') {
      if (choice === 'this') {
        addExceptionMutation.mutate({
          id: event.baseEventId || event.id,
          exceptionDate: event.date,
        });
      } else {
        deleteEventMutation.mutate(event.baseEventId || event.id);
      }
    }
  };

  const handleEventDrop = (eventId, newDate, newStartTime, newEndTime) => {
    if (typeof eventId === 'string' && eventId.startsWith('holiday-')) return;
    const event = events.find((e) => e.id === eventId);
    if (!event) return;
    const hasDateChange = event.date !== newDate;
    const hasTimeChange = newStartTime && (event.start_time !== newStartTime || event.end_time !== newEndTime);
    if (!hasDateChange && !hasTimeChange) return;

    let newEndDate = event.end_date || null;
    if (hasDateChange && event.end_date && event.end_date !== event.date) {
      const oldStart = parseISO(event.date);
      const oldEnd = parseISO(event.end_date);
      const diffMs = oldEnd.getTime() - oldStart.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      const newStart = parseISO(newDate);
      newEndDate = format(addDays(newStart, diffDays), 'yyyy-MM-dd');
    }

    const updatedFields = {
      date: newDate,
      ...(newEndDate && { end_date: newEndDate }),
      ...(newStartTime && { start_time: newStartTime }),
      ...(newEndTime && { end_time: newEndTime }),
    };
    queryClient.setQueryData(['events', user?.id], (old) =>
      (old || []).map((e) => (e.id === eventId ? { ...e, ...updatedFields } : e))
    );
    updateEventMutation.mutate({ id: eventId, data: { ...event, ...updatedFields } });
  };

  const navigateDate = (direction) => {
    if (viewMode === 'monthly') setSelectedDate((d) => addMonths(d, direction));
    else if (viewMode === 'weekly') setSelectedDate((d) => addWeeks(d, direction));
    else setSelectedDate((d) => addDays(d, direction));
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(deltaX) < Math.abs(deltaY) * 1.5) return;
    if (Math.abs(deltaX) < 60) return;
    if (deltaX < 0) navigateDate(1);
    else navigateDate(-1);
  };

  const monthWeeks = useMemo(() => getMondayFirstWeeks(selectedDate), [selectedDate]);
  const weekDates = useMemo(() => {
    const monday = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, [selectedDate]);

  const isSaving = createEventMutation.isPending || updateEventMutation.isPending || deleteEventMutation.isPending || addExceptionMutation.isPending;

  if (eventsLoading) {
    return (
      <div className="min-h-full" style={{ backgroundColor: '#000000' }}>
        <CalendarSkeleton />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col w-full overflow-hidden"
      style={{ height: 'calc(100dvh - 64px)', backgroundColor: '#000000', touchAction: 'pan-y', overflowX: 'hidden' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex-shrink-0" style={{ backgroundColor: '#000000' }}>
        <CalendarHeader
          selectedDate={selectedDate}
          viewMode={viewMode}
          weekDates={weekDates}
          onViewModeChange={setViewMode}
          onQuickAdd={handleQuickAdd}
          birthdays={birthdays}
          onAddBirthday={(payload) => createBirthdayMutation.mutateAsync(payload)}
          onDeleteBirthday={(id) => deleteBirthdayMutation.mutate(id)}
        />
      </div>

      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {viewMode === 'monthly' && (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-shrink-0 overflow-hidden" style={{ backgroundColor: '#000000' }}>
              <MonthView
                selectedDate={selectedDate}
                monthWeeks={monthWeeks}
                events={expandedEvents}
                tasks={tasks}
                birthdays={birthdays}
                onDayClick={setSelectedDate}
                onEventDrop={handleEventDrop}
              />
              <div
                className="px-5 pt-4 pb-3 flex items-start justify-between"
                style={{ borderTop: `1px solid rgba(201,169,98,0.12)` }}
              >
                <div className="flex items-baseline gap-2.5">
                  <span
                    className="font-bold leading-none"
                    style={{ fontSize: 54, color: UI.gold, lineHeight: 1 }}
                  >
                    {format(selectedDate, 'd')}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: UI.muted,
                      fontWeight: 300,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      alignSelf: 'flex-end',
                      paddingBottom: 6,
                    }}
                  >
                    {DAY_ABBR[selectedDate.getDay()]}
                  </span>
                </div>
                <button
                  onClick={handleOpenCreateModal}
                  className="flex items-center justify-center flex-shrink-0 transition-transform active:scale-95"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    backgroundColor: UI.gold,
                    boxShadow: '0 4px 20px rgba(201,169,98,0.35)',
                    marginTop: 4,
                  }}
                >
                  <Plus className="w-6 h-6" style={{ color: '#1A1612' }} strokeWidth={2.5} />
                </button>
              </div>
            </div>
            <div
              ref={eventListRef}
              className="flex-1 min-h-0 overflow-y-auto scrollbar-hide pb-32"
              style={{
                backgroundColor: '#000000',
                overscrollBehavior: 'contain',
                overflowX: 'hidden',
                touchAction: 'pan-y',
              }}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              <DayEventList
                selectedDate={selectedDate}
                events={expandedEvents}
                tasks={tasks}
                birthdays={birthdays}
                onEditEvent={handleEditEvent}
              />
            </div>
          </div>
        )}

        {viewMode === 'weekly' && (
          <div
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
            style={{ touchAction: 'pan-y' }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <WeekView
              weekDates={weekDates}
              events={expandedEvents}
              tasks={tasks}
              birthdays={birthdays}
              onEditEvent={handleEditEvent}
              onEventDrop={handleEventDrop}
              onDayClick={(date) => { setSelectedDate(date); setViewMode('daily'); }}
            />
          </div>
        )}

        {viewMode === 'daily' && (
          <div
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
            style={{ touchAction: 'pan-y' }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <DayView
              selectedDate={selectedDate}
              events={expandedEvents}
              tasks={tasks}
              birthdays={birthdays}
              onEditEvent={handleEditEvent}
              onEventDrop={handleEventDrop}
            />
          </div>
        )}
      </div>

      <EventModal
        show={showEventModal}
        editingEvent={editingEvent}
        eventData={eventData}
        onChange={setEventData}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        onClose={() => { setShowEventModal(false); resetForm(); }}
        isSaving={isSaving}
      />

      {recurrenceDialog && (
        <RecurrenceDialog
          type={recurrenceDialog.type}
          onConfirm={handleRecurrenceDialogConfirm}
          onCancel={() => setRecurrenceDialog(null)}
        />
      )}
    </div>
  );
}
