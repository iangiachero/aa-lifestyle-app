// Time formatting utilities

export const formatTimeForUser = (time, format = '12h') => {
  if (!time) return '';

  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);

  if (format === '24h') {
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  }

  // 12h format
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const convertTo24Hour = (time12h) => {
  if (!time12h) return '';

  const [time, period] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours);

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

export const convertTo12Hour = (time24h) => {
  if (!time24h) return '';

  const [hours, minutes] = time24h.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minutes} ${ampm}`;
};
