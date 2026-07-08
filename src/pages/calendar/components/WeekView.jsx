import React, { useState, useRef } from 'react';
import { format, isToday } from 'date-fns';
import { Repeat } from 'lucide-react';
import { UI, isBirthdayOnDate, formatTime, getBirthdayCountdown, calculateAge, getAgeOrdinal } from '../constants';

export default function WeekView({ weekDates, events, tasks, birthdays, onEditEvent, onEventDrop, onDayClick }) {
  const [dragState, setDragState] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const cardRefs = useRef({});

  const getEventsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter((e) => (e.display_date || e.date) === dateStr && e.category !== 'birthday' && !e.isHoliday);
  };

  const getHolidaysForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter((e) => e.isHoliday && (e.display_date || e.date) === dateStr);
  };

  const getTasksForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter((t) => t.due_date === dateStr && t.status !== 'completed');
  };

  const getBirthdaysForDate = (date) => {
    return birthdays.filter((b) => isBirthdayOnDate(b, date));
  };

  const handleDragStart = (e, event) => {
    if (event.isHoliday) { e.preventDefault(); return; }
    const [startH, startM] = event.start_time.split(':').map(Number);
    const [endH, endM] = event.end_time.split(':').map(Number);
    const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    setDragState({ event, durationMinutes, offsetMinutes: 0 });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', event.id);
  };

  const handleDragOver = (e, dateStr, cardIndex) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragState) return;
    setDropTarget({ dateStr, cardIndex });
  };

  const handleDrop = (e, dateStr) => {
    e.preventDefault();
    if (!dragState) {
      setDragState(null);
      setDropTarget(null);
      return;
    }
    onEventDrop(dragState.event.id, dateStr, dragState.event.start_time, dragState.event.end_time);
    setDragState(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDragState(null);
    setDropTarget(null);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto scrollbar-hide" style={{ background: 'transparent' }}>
      <div className="flex flex-col gap-3 p-4" style={{ paddingBottom: 'calc(7rem + env(safe-area-inset-bottom, 0px))' }}>
        {weekDates.map((date, dateIndex) => {
          const isCurrentDay = isToday(date);
          const dayEvents = getEventsForDate(date);
          const dayTasks = getTasksForDate(date);
          const dayBirthdays = getBirthdaysForDate(date);
          const dayHolidays = getHolidaysForDate(date);
          const dateStr = format(date, 'yyyy-MM-dd');
          const isOver = dropTarget?.dateStr === dateStr && dragState !== null;
          const hasItems = dayEvents.length > 0 || dayTasks.length > 0 || dayBirthdays.length > 0 || dayHolidays.length > 0;

          return (
            <div
              key={dateIndex}
              ref={(el) => { cardRefs.current[dateIndex] = el; }}
              onDragOver={(e) => handleDragOver(e, dateStr, dateIndex)}
              onDrop={(e) => handleDrop(e, dateStr)}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setDropTarget(null);
                }
              }}
              style={{
                borderRadius: '14px',
                border: isOver
                  ? `1.5px solid ${UI.gold}`
                  : `1px solid ${isCurrentDay ? UI.borderSoft : UI.borderSofter}`,
                background: isOver
                  ? UI.wash2
                  : isCurrentDay
                  ? UI.wash
                  : 'var(--app-wash-soft)',
                transition: 'border-color 0.15s, background 0.15s',
                overflow: 'hidden',
              }}
            >
              <div className="px-4 pt-3 pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div
                      className="text-[10px] font-semibold tracking-widest uppercase mb-1"
                      style={{ color: isCurrentDay ? UI.gold : UI.muted2 }}
                    >
                      {format(date, 'EEEE')}
                    </div>
                    <div
                      className={`text-3xl font-light leading-none ${
                        isCurrentDay ? 'w-10 h-10 rounded-full flex items-center justify-center' : ''
                      }`}
                      style={{
                        color: isCurrentDay ? UI.onGold : UI.text,
                        backgroundColor: isCurrentDay ? UI.gold : 'transparent',
                      }}
                    >
                      {format(date, 'd')}
                    </div>
                  </div>
                  <button
                    onClick={() => onDayClick && onDayClick(date)}
                    className="text-[11px] font-light mt-0.5 transition-opacity hover:opacity-70 active:opacity-50"
                    style={{ color: 'var(--app-gold)' }}
                  >
                    View Day
                  </button>
                </div>
              </div>

              <div
                style={{
                  margin: '0 12px 12px',
                  borderRadius: '10px',
                  background: 'var(--app-wash-soft)',
                  border: `1px solid ${UI.borderSofter}`,
                  minHeight: '64px',
                  overflow: 'hidden',
                }}
              >
                {!hasItems ? (
                  <div
                    className="flex items-center justify-center py-5 text-[12px] font-light"
                    style={{ color: UI.muted2 }}
                  >
                    No events or tasks
                  </div>
                ) : (
                  <div className="flex flex-col divide-y" style={{ borderColor: UI.borderSofter }}>
                    {dayHolidays.map((holiday) => (
                      <div key={holiday.id} className="flex items-center gap-2.5 px-3 py-2.5 overflow-hidden" style={{ background: 'rgba(201,169,98,0.06)' }}>
                        <span className="text-base flex-shrink-0">{holiday.holidayEmoji}</span>
                        <span className="text-[12px] font-medium truncate min-w-0 flex-1" style={{ color: 'var(--app-gold)' }}>
                          {holiday.holidayName}
                        </span>
                        <span className="text-[10px] flex-shrink-0" style={{ color: UI.muted2 }}>
                          Holiday
                        </span>
                      </div>
                    ))}
                    {dayBirthdays.map((b) => {
                      const [birthYear] = b.birth_date.split('-').map(Number);
                      const ageOnDay = birthYear ? date.getFullYear() - birthYear : null;
                      const ageLabel = ageOnDay !== null && ageOnDay >= 0 ? `${getAgeOrdinal(ageOnDay)} ` : '';
                      return (
                        <div key={`bday-${b.id}`} className="flex items-center gap-2.5 px-3 py-2.5 overflow-hidden">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: UI.birthdayColor }}
                          />
                          <span className="text-[12px] font-light truncate min-w-0 flex-1" style={{ color: UI.text }}>
                            {b.name}'s {ageLabel}Birthday
                          </span>
                          <span className="text-[10px] flex-shrink-0" style={{ color: UI.birthdayColor }}>
                            {getBirthdayCountdown(b.birth_date)}
                          </span>
                        </div>
                      );
                    })}

                    {dayTasks.map((task) => (
                      <div key={`task-${task.id}`} className="flex items-center gap-2.5 px-3 py-2.5 overflow-hidden">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: UI.taskColor }}
                        />
                        <span className="text-[12px] font-light truncate min-w-0 flex-1" style={{ color: UI.text }}>
                          {task.title}
                        </span>
                        <span className="text-[10px] flex-shrink-0" style={{ color: UI.taskColor }}>
                          Task
                        </span>
                      </div>
                    ))}

                    {dayEvents.map((event) => {
                      const isDragging = dragState?.event?.id === event.id;
                      return (
                        <div
                          key={event.id}
                          draggable
                          onDragStart={(e) => {
                            e.stopPropagation();
                            handleDragStart(e, event);
                          }}
                          onDragEnd={handleDragEnd}
                          onClick={() => !isDragging && onEditEvent(event)}
                          className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-opacity active:opacity-60 overflow-hidden"
                          style={{ opacity: isDragging ? 0.35 : 1 }}
                        >
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: event.color || UI.gold }}
                          />
                          {event.is_multi_day && event.is_middle_day && (
                            <span className="text-[10px] flex-shrink-0 mr-0.5" style={{ color: event.color || UI.gold }}>↔</span>
                          )}
                          {event.is_multi_day && event.is_last_day && (
                            <span className="text-[10px] flex-shrink-0 mr-0.5" style={{ color: event.color || UI.gold }}>←</span>
                          )}
                          <span className="text-[12px] font-light truncate flex-1 min-w-0" style={{ color: UI.text }}>
                            {event.title}
                          </span>
                          {event.is_multi_day && event.is_first_day && (
                            <span className="text-[10px] flex-shrink-0 ml-0.5" style={{ color: event.color || UI.gold }}>→</span>
                          )}
                          {(event.repeat && event.repeat !== 'none') && (
                            <Repeat className="w-2.5 h-2.5 flex-shrink-0 opacity-50" style={{ color: event.color || UI.gold }} strokeWidth={1.5} />
                          )}
                          <span className="text-[10px] flex-shrink-0" style={{ color: UI.muted2 }}>
                            {event.is_first_day !== false ? formatTime(event.start_time) : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
