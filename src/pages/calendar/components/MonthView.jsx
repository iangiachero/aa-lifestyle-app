import React, { useState, useCallback } from 'react';
import { format, isSameDay, isToday, isSameMonth } from 'date-fns';
import { motion } from 'framer-motion';
import { UI, isBirthdayOnDate } from '../constants';

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function DayCell({
  date,
  dayEvents,
  dayTasks,
  dayBirthdays,
  isCurrentMonth,
  isCurrentDay,
  isSelected,
  isSundayCol,
  isSaturdayCol,
  draggedEvent,
  dragOverDate,
  flashDate,
  onDayClick,
  onDrop,
  onDragOver,
  onDragLeave,
  onDragStart,
  onDragEnd,
}) {
  const dateStr = format(date, 'yyyy-MM-dd');
  const isOver = dragOverDate === dateStr && draggedEvent !== null;
  const isFlashing = flashDate === dateStr;

  const isWeekend = isSundayCol || isSaturdayCol;
  const numberColor = isCurrentDay
    ? '#1A1612'
    : !isCurrentMonth
    ? 'rgba(245,241,232,0.22)'
    : isWeekend
    ? UI.gold
    : UI.text;

  return (
    <div
      onClick={() => onDayClick(date)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(dateStr); }}
      onDragLeave={() => onDragLeave(dateStr)}
      onDrop={(e) => { e.preventDefault(); onDrop(dateStr); }}
      className="flex flex-col items-center justify-center cursor-pointer select-none relative"
      style={{ paddingTop: 13, paddingBottom: 13 }}
    >
      <div className="relative flex items-center justify-center">
        {isCurrentDay && (
          <div
            className="absolute"
            style={{
              width: 36,
              height: 36,
              backgroundColor: UI.gold,
              borderRadius: 10,
            }}
          />
        )}
        {!isCurrentDay && isSelected && (
          <div
            className="absolute"
            style={{
              width: 36,
              height: 36,
              border: `1.5px solid ${UI.gold}`,
              borderRadius: 10,
              backgroundColor: 'rgba(201,169,98,0.07)',
            }}
          />
        )}
        {isOver && !isCurrentDay && !isSelected && (
          <div
            className="absolute"
            style={{
              width: 36,
              height: 36,
              border: `1px solid rgba(201,169,98,0.35)`,
              borderRadius: 10,
            }}
          />
        )}
        <span
          className="relative leading-none"
          style={{
            fontSize: 17,
            fontWeight: !isCurrentMonth ? 300 : 500,
            color: numberColor,
            zIndex: 1,
          }}
        >
          {format(date, 'd')}
        </span>
      </div>

      <div className="flex items-center justify-center gap-1 mt-1.5" style={{ minHeight: 4 }}>
        {dayEvents.slice(0, 1).map((event) => (
          <div
            key={event.id}
            draggable={!event.isHoliday}
            onDragStart={(e) => { if (event.isHoliday) { e.preventDefault(); return; } e.stopPropagation(); onDragStart(event); }}
            onDragEnd={(e) => { e.stopPropagation(); onDragEnd(); }}
            className={`rounded-full ${event.isHoliday ? 'cursor-default' : 'cursor-grab'}`}
            style={{
              width: 4,
              height: 4,
              backgroundColor: event.color || UI.gold,
              opacity: draggedEvent?.id === event.id ? 0.25 : 1,
            }}
          />
        ))}
        {dayTasks.slice(0, 1).map((task) => (
          <motion.div
            key={`task-${task.id}`}
            className="rounded-full flex-shrink-0"
            animate={isFlashing ? { opacity: [1, 0.15, 1, 0.15, 1] } : { opacity: 1 }}
            transition={{ duration: 0.65, ease: 'easeInOut' }}
            style={{ width: 4, height: 4, backgroundColor: task.color_tag || UI.taskColor }}
          />
        ))}
        {dayBirthdays.slice(0, 1).map((b) => (
          <div
            key={`bday-${b.id}`}
            className="rounded-full flex-shrink-0"
            style={{ width: 4, height: 4, backgroundColor: UI.birthdayColor }}
          />
        ))}
      </div>
    </div>
  );
}

export default function MonthView({
  selectedDate,
  monthWeeks,
  events,
  tasks,
  birthdays,
  onDayClick,
  onEventDrop,
}) {
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [dragOverDate, setDragOverDate] = useState(null);
  const [flashDate, setFlashDate] = useState(null);

  const getEventsForDate = useCallback(
    (date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return events.filter((e) => (e.display_date || e.date) === dateStr && e.category !== 'birthday');
    },
    [events]
  );

  const getTasksForDate = useCallback(
    (date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return tasks.filter((t) => t.due_date === dateStr && t.status !== 'completed');
    },
    [tasks]
  );

  const getBirthdaysForDate = useCallback(
    (date) => birthdays.filter((b) => isBirthdayOnDate(b, date)),
    [birthdays]
  );

  const handleDragStart = (event) => setDraggedEvent(event);
  const handleDragEnd = () => { setDraggedEvent(null); setDragOverDate(null); };
  const handleDragOver = (dateStr) => { if (draggedEvent) setDragOverDate(dateStr); };
  const handleDragLeave = (dateStr) => { setDragOverDate((prev) => prev === dateStr ? null : prev); };
  const handleDrop = (dateStr) => {
    if (!draggedEvent) return;
    setDragOverDate(null);
    if (draggedEvent.date !== dateStr) {
      onEventDrop(draggedEvent.id, dateStr);
      setFlashDate(dateStr);
      setTimeout(() => setFlashDate(null), 750);
    }
    setDraggedEvent(null);
  };

  return (
    <div className="flex flex-col overflow-hidden">
      <div
        className="grid grid-cols-7 px-3 pb-1 pt-2"
        style={{ borderBottom: `1px solid rgba(201,169,98,0.10)` }}
      >
        {DAY_LABELS.map((day, i) => (
          <div
            key={day}
            className="text-center"
            style={{
              color: i === 0 || i === 6 ? 'rgba(201,169,98,0.45)' : 'rgba(184,184,184,0.38)',
              fontWeight: 400,
              letterSpacing: '0.08em',
              fontSize: 9,
              paddingBottom: 5,
            }}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="flex flex-col">
        {monthWeeks.map((week, weekIndex) => (
          <div
            key={weekIndex}
            className="grid grid-cols-7 px-3"
            style={{
              borderBottom: weekIndex < monthWeeks.length - 1
                ? `1px solid rgba(201,169,98,0.08)`
                : 'none',
            }}
          >
            {week.map((date, dayIndex) => {
              const dayEvents = getEventsForDate(date);
              const dayTasks = getTasksForDate(date);
              const dayBirthdays = getBirthdaysForDate(date);
              const isCurrentMonth = isSameMonth(date, selectedDate);
              const isCurrentDay = isToday(date);
              const isSelected = isSameDay(date, selectedDate);

              return (
                <DayCell
                  key={dayIndex}
                  date={date}
                  dayEvents={dayEvents}
                  dayTasks={dayTasks}
                  dayBirthdays={dayBirthdays}
                  isCurrentMonth={isCurrentMonth}
                  isCurrentDay={isCurrentDay}
                  isSelected={isSelected}
                  isSundayCol={dayIndex === 0}
                  isSaturdayCol={dayIndex === 6}
                  draggedEvent={draggedEvent}
                  dragOverDate={dragOverDate}
                  flashDate={flashDate}
                  onDayClick={onDayClick}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
