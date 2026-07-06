export const GOLD = '#C9A962';

export const UI = {
  gold: GOLD,
  bg: 'var(--app-bg)',
  // Fixed dark ink for text sitting on gold accents (today circle, etc.) — same in both themes
  onGold: '#1A1508',
  panel: 'var(--app-bg)',
  panel2: 'var(--app-bg)',
  text: 'var(--app-text)',
  muted: 'var(--app-text-2)',
  muted2: 'var(--app-text-3)',
  border: 'rgba(201,169,98,0.30)',
  borderSoft: 'rgba(201,169,98,0.18)',
  borderSofter: 'rgba(201,169,98,0.10)',
  wash: 'rgba(201,169,98,0.06)',
  wash2: 'rgba(201,169,98,0.10)',
  taskColor: '#2DD4BF',
  birthdayColor: '#F472B6',
};

export const CATEGORIES = [
  { id: 'personal', name: 'Personal', color: '#C9A962' },
  { id: 'work', name: 'Work', color: '#8B7355' },
  { id: 'health', name: 'Health', color: '#A67C52' },
  { id: 'school', name: 'School', color: '#D4AF37' },
  { id: 'social', name: 'Social', color: '#B8956A' },
  { id: 'birthday', name: 'Birthday', color: '#F472B6' },
  { id: 'holiday', name: 'Holiday', color: '#C9A962' },
];

export const HOLIDAY_COLOR = '#C9A962';

export const TIME_SLOTS = (() => {
  const slots = [];
  for (let hour = 0; hour <= 23; hour++) {
    const display =
      hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
    slots.push({ hour, minute: 0, display });
  }
  return slots;
})();

export function getBlockStyle(startTime, endTime) {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const duration = endMinutes - startMinutes;
  const slotHeight = 80;
  const top = (startMinutes / 60) * slotHeight;
  const height = Math.max((duration / 60) * slotHeight, 75);
  return { top, height };
}

export function formatTime(time) {
  if (!time) return '';
  const [hours, minutes] = time.slice(0, 5).split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export function parseDateLocal(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function isBirthdayOnDate(birthday, date) {
  const bd = parseDateLocal(birthday.birth_date);
  return bd.getMonth() === date.getMonth() && bd.getDate() === date.getDate();
}

export function calculateAge(birthDateStr) {
  if (!birthDateStr) return null;
  const today = new Date();
  const [year, month, day] = birthDateStr.split('-').map(Number);
  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() - (month - 1);
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
    age--;
  }
  return age >= 0 ? age : null;
}

export function getAgeOrdinal(age) {
  if (age === null || age === undefined || age < 0) return '';
  const lastTwoDigits = age % 100;
  const lastDigit = age % 10;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) return `${age}th`;
  switch (lastDigit) {
    case 1: return `${age}st`;
    case 2: return `${age}nd`;
    case 3: return `${age}rd`;
    default: return `${age}th`;
  }
}

export function getBirthdayCountdown(birthDateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [birthYear, month, day] = birthDateStr.split('-').map(Number);
  const next = new Date(today.getFullYear(), month - 1, day);
  next.setHours(0, 0, 0, 0);
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  const diff = Math.round((next - today) / (1000 * 60 * 60 * 24));

  const upcomingAge = birthYear ? next.getFullYear() - birthYear : null;
  const ageText = upcomingAge !== null && upcomingAge >= 0 ? ` · turning ${upcomingAge}` : '';

  if (diff === 0) {
    const ordinal = upcomingAge !== null && upcomingAge >= 0 ? `${getAgeOrdinal(upcomingAge)} ` : '';
    return `${ordinal}Birthday today! 🎉`;
  }
  if (diff === 1) return `Tomorrow${ageText}`;
  if (diff < 60) return `${diff} days${ageText}`;
  const months = Math.round(diff / 30);
  return months === 1 ? `1 month${ageText}` : `${months} months${ageText}`;
}
