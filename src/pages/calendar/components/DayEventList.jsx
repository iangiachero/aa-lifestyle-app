// src/pages/calendar/components/DayEventList.jsx
import React from 'react';
import { format } from 'date-fns';
import { Cake, Repeat } from 'lucide-react';
import { UI, isBirthdayOnDate, formatTime, getBirthdayCountdown, calculateAge, getAgeOrdinal } from '../constants';

const DAY_ABBR = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function HolidayRow({ event }) {
  return (
    <div
      className="flex items-center gap-3 py-3 overflow-hidden"
      style={{ borderBottom: `1px solid ${UI.borderSofter}` }}
    >
      <div
        className="text-xs flex-shrink-0 tracking-wide"
        style={{ color: 'var(--app-gold)', minWidth: 44, fontWeight: 300, fontSize: 20 }}
      >
        {event.holidayEmoji}
      </div>
      <div
        className="w-0.5 self-stretch rounded-full flex-shrink-0"
        style={{ backgroundColor: UI.gold, minHeight: 28 }}
      />
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="text-sm font-medium truncate" style={{ color: 'var(--app-gold)' }}>
          {event.holidayName}
        </div>
        <div className="text-xs mt-0.5" style={{ color: UI.muted2, fontWeight: 300 }}>
        </div>
      </div>
    </div>
  );
}

function EventRow({ event, onEdit }) {
  return (
    <div
      className="flex items-start gap-3 py-3 cursor-pointer overflow-hidden"
      style={{ borderBottom: `1px solid ${UI.borderSofter}` }}
      onClick={() => onEdit && onEdit(event)}
    >
      <div
        className="text-xs flex-shrink-0 mt-0.5 tracking-wide"
        style={{ color: UI.muted, minWidth: 44, fontWeight: 300 }}
      >
        {formatTime(event.start_time)}
      </div>
      <div
        className="w-0.5 self-stretch rounded-full flex-shrink-0"
        style={{ backgroundColor: event.color || UI.gold, minHeight: 32 }}
      />
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
          {event.is_multi_day && event.is_middle_day && (
            <span className="text-xs flex-shrink-0" style={{ color: event.color || UI.gold }}>↔</span>
          )}
          {event.is_multi_day && event.is_last_day && (
            <span className="text-xs flex-shrink-0" style={{ color: event.color || UI.gold }}>←</span>
          )}
          <div className="text-sm font-medium truncate min-w-0 flex-1" style={{ color: event.category === 'birthday' ? UI.birthdayColor : UI.text, letterSpacing: '0.01em' }}>
            {event.title}
          </div>
          {event.is_multi_day && event.is_first_day && (
            <span className="text-xs flex-shrink-0" style={{ color: event.color || UI.gold }}>→</span>
          )}
          {event.category === 'birthday' && (
            <Cake className="w-3.5 h-3.5 flex-shrink-0" style={{ color: UI.birthdayColor }} strokeWidth={1.5} />
          )}
          {(event.repeat && event.repeat !== 'none' && event.category !== 'birthday') && (
            <Repeat className="w-3 h-3 flex-shrink-0 opacity-60" style={{ color: event.color || UI.gold }} strokeWidth={1.5} />
          )}
        </div>
        <div className="text-xs mt-0.5 truncate" style={{ color: UI.muted2, fontWeight: 300 }}>
          {event.is_multi_day && !event.is_first_day
            ? 'Continues...'
            : `${formatTime(event.start_time)} – ${formatTime(event.end_time)}`}
        </div>
      </div>
    </div>
  );
}

function BirthdayRow({ birthday, displayDate }) {
  const countdown = getBirthdayCountdown(birthday.birth_date);
  const displayYear = displayDate ? displayDate.getFullYear() : new Date().getFullYear();
  const [birthYear] = birthday.birth_date.split('-').map(Number);
  const ageOnDay = birthYear ? displayYear - birthYear : null;
  const ageLabel = ageOnDay !== null && ageOnDay >= 0 ? `${getAgeOrdinal(ageOnDay)} ` : '';
  return (
    <div
      className="flex items-start gap-3 py-3 overflow-hidden"
      style={{ borderBottom: `1px solid ${UI.borderSofter}` }}
    >
      <div className="flex-shrink-0 mt-1" style={{ minWidth: 44 }}>
        <Cake className="w-4 h-4" style={{ color: UI.birthdayColor }} strokeWidth={1.5} />
      </div>
      <div
        className="w-0.5 self-stretch rounded-full flex-shrink-0"
        style={{ backgroundColor: UI.birthdayColor, minHeight: 32 }}
      />
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="text-sm font-medium truncate" style={{ color: UI.birthdayColor }}>
          {birthday.name}'s {ageLabel}Birthday
        </div>
        <div className="text-xs mt-0.5" style={{ color: UI.muted2, fontWeight: 300 }}>
          {countdown}
        </div>
      </div>
    </div>
  );
}

function TaskRow({ task }) {
  const color = task.color_tag || UI.taskColor;
  return (
    <div
      className="flex items-start gap-3 py-3 overflow-hidden"
      style={{ borderBottom: `1px solid ${UI.borderSofter}` }}
    >
      <div
        className="text-xs flex-shrink-0 mt-0.5 tracking-wide"
        style={{ color, minWidth: 44, fontWeight: 300 }}
      >
        —
      </div>
      <div
        className="w-0.5 self-stretch rounded-full flex-shrink-0"
        style={{ backgroundColor: color, minHeight: 32 }}
      />
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="text-sm font-medium truncate" style={{ color }}>
          {task.title}
        </div>
        <div className="text-xs mt-0.5 capitalize" style={{ color: UI.muted2, fontWeight: 300 }}>
          Task · {task.category || 'general'}
        </div>
      </div>
    </div>
  );
}

export default function DayEventList({
  selectedDate,
  events,
  tasks,
  birthdays,
  onEditEvent,
}) {
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayHolidays = events.filter((e) => e.isHoliday && (e.display_date || e.date) === dateStr);
  const dayEvents = events
    .filter((e) => !e.isHoliday && (e.display_date || e.date) === dateStr)
    .sort((a, b) => {
      if (!a.start_time) return 1;
      if (!b.start_time) return -1;
      return a.start_time.localeCompare(b.start_time);
    });
  const dayTasks = tasks.filter((t) => t.due_date === dateStr && t.status !== 'completed');
  const birthdayByName = Object.fromEntries(birthdays.map((b) => [b.name, b.birth_date]));
  const birthdayEventPersonNames = new Set(
    dayEvents
      .filter((e) => e.category === 'birthday')
      .map((e) => {
        const match = e.title.match(/^(.+?)'s /);
        return match ? match[1] : e.title;
      })
  );
  const dayBirthdays = birthdays.filter(
    (b) => isBirthdayOnDate(b, selectedDate) && !birthdayEventPersonNames.has(b.name)
  );

  const hasAnything = dayEvents.length > 0 || dayTasks.length > 0 || dayBirthdays.length > 0 || dayHolidays.length > 0;

  if (!hasAnything) {
    return (
      <div className="px-5 pt-4 pb-4">
        <p className="text-sm" style={{ color: UI.muted2, fontWeight: 300 }}>
          No events scheduled
        </p>
      </div>
    );
  }

  return (
    <div className="px-5 pb-4 overflow-x-hidden">
      {dayHolidays.map((event) => (
        <HolidayRow key={event.id} event={event} />
      ))}
      {dayBirthdays.map((b) => (
        <BirthdayRow key={`bday-${b.id}`} birthday={b} displayDate={selectedDate} />
      ))}
      {dayTasks.map((task) => (
        <TaskRow key={`task-${task.id}`} task={task} />
      ))}
      {dayEvents.map((event) => {
        let displayEvent = event;
        if (event.category === 'birthday') {
          const nameMatch = event.title.match(/^(.+?)'s /);
          const personName = nameMatch ? nameMatch[1] : null;
          const birthDate = personName ? birthdayByName[personName] : null;
          if (birthDate) {
            const [birthYear] = birthDate.split('-').map(Number);
            const ageOnDay = birthYear ? selectedDate.getFullYear() - birthYear : null;
            const ageLabel = ageOnDay !== null && ageOnDay >= 0 ? `${getAgeOrdinal(ageOnDay)} ` : '';
            displayEvent = { ...event, title: `${personName}'s ${ageLabel}Birthday` };
          }
        }
        return <EventRow key={event.id} event={displayEvent} onEdit={onEditEvent} />;
      })}
    </div>
  );
}
