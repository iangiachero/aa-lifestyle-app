//src/pages/calendar/components/DayView.jsx
import React, { useState, useRef } from 'react';
import { format, isToday } from 'date-fns';
import { Calendar, Repeat } from 'lucide-react';
import { UI, TIME_SLOTS, getBlockStyle, isBirthdayOnDate, formatTime, getBirthdayCountdown, calculateAge, getAgeOrdinal } from '../constants';

const SLOT_HEIGHT = 80;

function computeNewTimes(slotIndex, offsetMinutes, durationMinutes) {
  const startMinutes = slotIndex * 60 + Math.round(offsetMinutes / 15) * 15;
  const clamped = Math.max(0, Math.min(startMinutes, 23 * 60 + 45));
  const endMinutes = clamped + durationMinutes;
  const clampedEnd = Math.min(endMinutes, 24 * 60);
  const sh = Math.floor(clamped / 60).toString().padStart(2, '0');
  const sm = (clamped % 60).toString().padStart(2, '0');
  const eh = Math.floor(clampedEnd / 60).toString().padStart(2, '0');
  const em = (clampedEnd % 60).toString().padStart(2, '0');
  return [`${sh}:${sm}`, `${eh}:${em}`];
}

// Assigns overlapping events to side-by-side columns.
// Returns { [eventId]: { col, cols } } where cols is the column count of the event's overlap cluster.
function computeOverlapLayout(events) {
  const items = events
    .map((e) => {
      const [sh, sm] = (e.start_time || '00:00').split(':').map(Number);
      const [eh, em] = (e.end_time || '00:00').split(':').map(Number);
      const start = sh * 60 + sm;
      // Enforce the same 40px visual minimum so short back-to-back events still split columns
      const end = Math.max(eh * 60 + em, start + 30);
      return { id: e.id, start, end };
    })
    .sort((a, b) => a.start - b.start || b.end - a.end);

  const layout = {};
  let cluster = [];
  let clusterEnd = -1;

  const flushCluster = () => {
    if (!cluster.length) return;
    const colEnds = [];
    for (const it of cluster) {
      let col = colEnds.findIndex((end) => end <= it.start);
      if (col === -1) {
        col = colEnds.length;
        colEnds.push(it.end);
      } else {
        colEnds[col] = it.end;
      }
      it.col = col;
    }
    for (const it of cluster) layout[it.id] = { col: it.col, cols: colEnds.length };
    cluster = [];
  };

  for (const it of items) {
    if (cluster.length && it.start >= clusterEnd) flushCluster();
    cluster.push(it);
    clusterEnd = Math.max(clusterEnd, it.end);
  }
  flushCluster();
  return layout;
}

export default function DayView({ selectedDate, events, tasks, birthdays, onEditEvent, onEventDrop }) {
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayEvents = events.filter((e) => (e.display_date || e.date) === dateStr && e.category !== 'birthday');
  const overlapLayout = computeOverlapLayout(dayEvents);
  const dayTasks = tasks.filter((t) => t.due_date === dateStr && t.status !== 'completed');
  const dayBirthdays = birthdays.filter((b) => isBirthdayOnDate(b, selectedDate));

  const [dragState, setDragState] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const gridRef = useRef(null);

  const handleDragStart = (e, event) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const [startH, startM] = event.start_time.split(':').map(Number);
    const [endH, endM] = event.end_time.split(':').map(Number);
    const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    const offsetMinutes = (offsetY / SLOT_HEIGHT) * 60;
    setDragState({ event, durationMinutes, offsetMinutes });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', event.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragState || !gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const rawSlot = y / SLOT_HEIGHT;
    const slotIndex = Math.max(0, Math.min(Math.floor(rawSlot), 23));
    const slotOffsetY = (rawSlot - slotIndex) * SLOT_HEIGHT;
    const slotOffsetMinutes = (slotOffsetY / SLOT_HEIGHT) * 60;
    const [newStart, newEnd] = computeNewTimes(slotIndex, slotOffsetMinutes - dragState.offsetMinutes, dragState.durationMinutes);
    setDropTarget({ slotIndex, newStart, newEnd });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!dragState || !dropTarget) {
      setDragState(null);
      setDropTarget(null);
      return;
    }
    onEventDrop(dragState.event.id, dateStr, dropTarget.newStart, dropTarget.newEnd);
    setDragState(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDragState(null);
    setDropTarget(null);
  };

  return (
    <div
      className="flex flex-col flex-1 min-h-0 overflow-hidden"
      style={{ background: 'transparent' }}
    >
      {(dayBirthdays.length > 0 || dayTasks.length > 0) && (
        <div
          className="px-4 py-2 flex flex-col gap-1 flex-shrink-0"
          style={{ borderBottom: `1px solid ${UI.borderSofter}` }}
        >
          {dayBirthdays.map((b) => {
            const [birthYear] = b.birth_date.split('-').map(Number);
            const ageOnDay = birthYear ? selectedDate.getFullYear() - birthYear : null;
            const ageLabel = ageOnDay !== null && ageOnDay >= 0 ? `${getAgeOrdinal(ageOnDay)} ` : '';
            return (
              <div
                key={b.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: `${UI.birthdayColor}15`, border: `1px solid ${UI.birthdayColor}40` }}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: UI.birthdayColor }} />
                <span className="text-xs flex-1" style={{ color: UI.birthdayColor }}>
                  {b.name}'s {ageLabel}Birthday
                </span>
                <span className="text-xs" style={{ color: UI.muted2 }}>
                  {getBirthdayCountdown(b.birth_date)}
                </span>
              </div>
            );
          })}
          {dayTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: `${UI.taskColor}10`, border: `1px dashed ${UI.taskColor}50` }}
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: UI.taskColor }} />
              <span className="text-xs" style={{ color: UI.taskColor }}>
                {task.title}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex overflow-y-auto flex-1 scrollbar-none pb-32">
        <div className="w-16 flex-shrink-0">
          {TIME_SLOTS.map((slot, index) => (
            <div
              key={index}
              className="h-20 flex items-start justify-end pr-3 pt-2 text-[10px] font-light"
              style={{ color: UI.muted2, borderBottom: `1px solid ${UI.borderSofter}` }}
            >
              {slot.display}
            </div>
          ))}
        </div>

        <div
          ref={gridRef}
          className="flex-1 relative"
          style={{ minHeight: `${TIME_SLOTS.length * SLOT_HEIGHT}px` }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setDropTarget(null);
            }
          }}
        >
          {TIME_SLOTS.map((slot, index) => (
            <div
              key={index}
              className="h-20 transition-colors"
              style={{
                borderBottom: `1px solid ${UI.borderSofter}`,
                borderLeft: `1px solid ${UI.borderSofter}`,
                backgroundColor:
                  dropTarget?.slotIndex === index && dragState
                    ? UI.wash2
                    : 'transparent',
              }}
            />
          ))}

          {dropTarget && dragState && (() => {
            const [dsh, dsm] = dropTarget.newStart.split(':').map(Number);
            const [deh, dem] = dropTarget.newEnd.split(':').map(Number);
            const startMin = dsh * 60 + dsm;
            const endMin = deh * 60 + dem;
            const top = (startMin / 60) * SLOT_HEIGHT;
            const height = Math.max(((endMin - startMin) / 60) * SLOT_HEIGHT, 40);
            return (
              <div
                className="absolute left-2 right-2 rounded-xl pointer-events-none"
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                  backgroundColor: `${UI.gold}25`,
                  border: `2px dashed ${UI.gold}`,
                  zIndex: 20,
                }}
              >
                <div className="px-4 py-2">
                  <div className="text-xs font-medium" style={{ color: 'var(--app-gold)' }}>
                    {formatTime(dropTarget.newStart)} – {formatTime(dropTarget.newEnd)}
                  </div>
                </div>
              </div>
            );
          })()}

          {dayEvents.length === 0 && dayTasks.length === 0 && dayBirthdays.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-20" style={{ color: 'var(--app-gold)' }} />
                <p className="text-xs" style={{ color: UI.muted2 }}>No events scheduled</p>
              </div>
            </div>
          )}

          {dayEvents.map((event) => {
            const style = getBlockStyle(event.start_time, event.end_time);
            const isDragging = dragState?.event?.id === event.id;
            const lay = overlapLayout[event.id] || { col: 0, cols: 1 };
            const colFraction = lay.col / lay.cols;
            return (
              <div
                key={event.id}
                draggable
                onDragStart={(e) => {
                  e.stopPropagation();
                  handleDragStart(e, event);
                }}
                onDragEnd={handleDragEnd}
                className="absolute rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all"
                style={{
                  top: `${style.top}px`,
                  height: `${style.height}px`,
                  left: `calc(8px + (100% - 16px) * ${colFraction}${lay.col > 0 ? ' + 2px' : ''})`,
                  width: `calc((100% - 16px) / ${lay.cols}${lay.cols > 1 ? ' - 2px' : ''})`,
                  backgroundColor: `${event.color}20`,
                  border: `2px solid ${event.color}`,
                  minHeight: '40px',
                  zIndex: 10,
                  opacity: isDragging ? 0.3 : 1,
                }}
                onClick={() => !isDragging && onEditEvent(event)}
              >
                <div className={`${lay.cols > 1 ? 'px-2.5' : 'px-4'} py-3 h-full flex flex-col overflow-hidden`}>
                  <div className="flex items-center gap-1.5 mb-1 min-w-0 overflow-hidden">
                    {event.is_multi_day && event.is_middle_day && (
                      <span className="text-xs flex-shrink-0" style={{ color: event.color || UI.gold }}>↔</span>
                    )}
                    {event.is_multi_day && event.is_last_day && (
                      <span className="text-xs flex-shrink-0" style={{ color: event.color || UI.gold }}>←</span>
                    )}
                    <div className="font-medium text-sm truncate min-w-0 flex-1" style={{ color: UI.text }}>
                      {event.title}
                    </div>
                    {event.is_multi_day && event.is_first_day && (
                      <span className="text-xs flex-shrink-0" style={{ color: event.color || UI.gold }}>→</span>
                    )}
                    {(event.repeat && event.repeat !== 'none') && (
                      <Repeat className="w-3 h-3 flex-shrink-0 opacity-60" style={{ color: event.color || UI.gold }} strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="text-xs truncate" style={{ color: UI.muted }}>
                    {event.is_multi_day && !event.is_first_day
                      ? 'Continues...'
                      : `${formatTime(event.start_time)} – ${formatTime(event.end_time)}`}
                  </div>
                  {event.notes && style.height > 100 && (
                    <div className="text-xs mt-auto line-clamp-2" style={{ color: UI.muted2 }}>
                      {event.notes}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isToday(selectedDate) && (() => {
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const currentTop = (currentMinutes / 60) * SLOT_HEIGHT;
            const nowHour = now.getHours();
            const nowMin = now.getMinutes().toString().padStart(2, '0');
            const ampm = nowHour >= 12 ? 'PM' : 'AM';
            const displayHour = nowHour % 12 || 12;
            const timeLabel = `${displayHour}:${nowMin} ${ampm}`;
            return (
              <div
                className="absolute left-0 right-0 z-30"
                style={{ top: `${currentTop}px` }}
              >
                <div className="relative flex items-center">
                  <span
                    className="absolute text-[8px] font-medium"
                    style={{ color: '#EF4444', left: -48, top: -6, whiteSpace: 'nowrap' }}
                  >
                    {timeLabel}
                  </span>
                  <div
                    className="absolute -left-0.5 -top-1 w-2 h-2 rounded-full"
                    style={{ backgroundColor: '#EF4444' }}
                  />
                  <div
                    className="absolute left-1.5 right-0 h-px"
                    style={{ backgroundColor: '#EF4444', opacity: 0.8 }}
                  />
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
