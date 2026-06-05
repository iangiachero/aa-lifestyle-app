import { addDays, addWeeks, addMonths, addYears, format, isAfter, isBefore, isEqual } from 'date-fns';

function dateFromStr(str) {
  const [year, month, day] = str.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function isExcluded(dateStr, exceptions) {
  if (!exceptions || !Array.isArray(exceptions)) return false;
  return exceptions.includes(dateStr);
}

function generateInstances(event, rangeStart, rangeEnd) {
  const instances = [];
  const baseDate = dateFromStr(event.date);
  const exceptions = event.recurrence_exceptions || [];
  const endDate = event.recurrence_end_date ? dateFromStr(event.recurrence_end_date) : null;

  let current = baseDate;
  let safetyLimit = 0;
  const maxIterations = 1500;

  while (safetyLimit < maxIterations) {
    safetyLimit++;

    const currentStr = format(current, 'yyyy-MM-dd');

    if (endDate && isAfter(current, endDate)) break;
    if (isAfter(current, rangeEnd)) break;

    if (!isBefore(current, rangeStart) || isEqual(current, rangeStart)) {
      if (!isExcluded(currentStr, exceptions)) {
        if (isEqual(current, baseDate)) {
        } else {
          instances.push({
            ...event,
            date: currentStr,
            isRecurringInstance: true,
            baseEventId: event.id,
            id: `${event.id}_${currentStr}`,
          });
        }
      }
    }

    if (event.repeat === 'daily') {
      current = addDays(current, 1);
    } else if (event.repeat === 'weekly') {
      current = addWeeks(current, 1);
    } else if (event.repeat === 'monthly') {
      current = addMonths(current, 1);
    } else if (event.repeat === 'yearly') {
      current = addYears(current, 1);
    } else {
      break;
    }
  }

  return instances;
}

export function expandRecurringEvents(events, rangeStart, rangeEnd) {
  const result = [];

  for (const event of events) {
    const eventDate = dateFromStr(event.date);
    const exceptions = event.recurrence_exceptions || [];
    const eventDateStr = format(eventDate, 'yyyy-MM-dd');

    const isExcludedOnBase = isExcluded(eventDateStr, exceptions);

    if (!isExcludedOnBase) {
      const inRange = !isAfter(eventDate, rangeEnd) && !isBefore(eventDate, rangeStart);
      if (inRange) {
        result.push({ ...event, isRecurringInstance: false });
      } else if (event.repeat === 'none' || !event.repeat) {
        result.push({ ...event, isRecurringInstance: false });
      }
    }

    if (event.repeat && event.repeat !== 'none') {
      const instances = generateInstances(event, rangeStart, rangeEnd);
      result.push(...instances);
    }
  }

  return result;
}

export function getRecurrenceRangeForCalendar() {
  const today = new Date();
  const rangeStart = addYears(today, -1);
  const rangeEnd = addYears(today, 2);
  return { rangeStart, rangeEnd };
}

export function expandMultiDayEvents(events) {
  const result = [];
  for (const event of events) {
    const startStr = event.date;
    const endStr = event.end_date && event.end_date !== startStr ? event.end_date : null;

    if (!endStr) {
      result.push(event);
      continue;
    }

    const start = dateFromStr(startStr);
    const end = dateFromStr(endStr);
    let current = start;

    const endStr2 = format(end, 'yyyy-MM-dd');
    while (!isAfter(current, end)) {
      const displayDate = format(current, 'yyyy-MM-dd');
      const isFirst = displayDate === startStr;
      const isLast = displayDate === endStr2;
      result.push({
        ...event,
        display_date: displayDate,
        is_multi_day: true,
        is_first_day: isFirst,
        is_last_day: isLast,
        is_middle_day: !isFirst && !isLast,
      });
      current = addDays(current, 1);
    }
  }
  return result;
}
