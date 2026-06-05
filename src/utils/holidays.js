const HOLIDAY_COLOR = '#C9A962';

function getNthWeekdayOfMonth(year, month, weekday, n) {
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const daysUntilWeekday = (weekday - firstWeekday + 7) % 7;
  const targetDate = 1 + daysUntilWeekday + (n - 1) * 7;
  const date = new Date(year, month, targetDate);
  return date.toISOString().split('T')[0];
}

function getLastWeekdayOfMonth(year, month, weekday) {
  const lastDay = new Date(year, month + 1, 0);
  const lastDate = lastDay.getDate();
  const lastWeekday = lastDay.getDay();
  const daysBack = (lastWeekday - weekday + 7) % 7;
  const targetDate = lastDate - daysBack;
  const date = new Date(year, month, targetDate);
  return date.toISOString().split('T')[0];
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function getEasterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day).toISOString().split('T')[0];
}

const CHINESE_NEW_YEAR = {
  2024: '2024-02-10',
  2025: '2025-01-29',
  2026: '2026-02-17',
  2027: '2027-02-06',
  2028: '2028-01-26',
  2029: '2029-02-13',
  2030: '2030-02-03',
  2031: '2031-01-23',
  2032: '2032-02-11',
};

const DRAGON_BOAT_FESTIVAL = {
  2024: '2024-06-10',
  2025: '2025-05-31',
  2026: '2026-06-19',
  2027: '2027-06-09',
  2028: '2028-05-28',
  2029: '2029-06-16',
  2030: '2030-06-05',
  2031: '2031-05-26',
  2032: '2032-06-12',
};

const MID_AUTUMN_FESTIVAL = {
  2024: '2024-09-17',
  2025: '2025-10-06',
  2026: '2026-09-25',
  2027: '2027-09-15',
  2028: '2028-10-03',
  2029: '2029-09-22',
  2030: '2030-09-12',
  2031: '2031-10-01',
  2032: '2032-09-19',
};

const DIWALI = {
  2024: '2024-11-01',
  2025: '2025-10-20',
  2026: '2026-11-08',
  2027: '2027-10-29',
  2028: '2028-10-17',
  2029: '2029-11-05',
  2030: '2030-10-26',
  2031: '2031-11-14',
  2032: '2032-11-02',
};

const HOLI = {
  2024: '2024-03-25',
  2025: '2025-03-14',
  2026: '2026-03-03',
  2027: '2027-03-22',
  2028: '2028-03-11',
  2029: '2029-03-01',
  2030: '2030-03-20',
  2031: '2031-03-09',
  2032: '2032-03-28',
};

const NAVRATRI = {
  2024: '2024-10-03',
  2025: '2025-09-22',
  2026: '2026-10-11',
  2027: '2027-09-30',
  2028: '2028-10-18',
  2029: '2029-10-07',
  2030: '2030-09-27',
  2031: '2031-10-16',
  2032: '2032-10-04',
};

const VESAK = {
  2024: '2024-05-23',
  2025: '2025-05-12',
  2026: '2026-05-31',
  2027: '2027-05-21',
  2028: '2028-05-09',
  2029: '2029-05-27',
  2030: '2030-05-17',
  2031: '2031-05-06',
  2032: '2032-05-24',
};

const ROSH_HASHANAH = {
  2024: '2024-10-03',
  2025: '2025-09-23',
  2026: '2026-09-12',
  2027: '2027-10-02',
  2028: '2028-09-21',
  2029: '2029-09-10',
  2030: '2030-09-28',
  2031: '2031-09-18',
  2032: '2032-09-06',
};

const PASSOVER = {
  2024: '2024-04-23',
  2025: '2025-04-13',
  2026: '2026-04-02',
  2027: '2027-04-22',
  2028: '2028-04-11',
  2029: '2029-03-31',
  2030: '2030-04-18',
  2031: '2031-04-08',
  2032: '2032-03-27',
};

const PURIM = {
  2024: '2024-03-24',
  2025: '2025-03-14',
  2026: '2026-03-03',
  2027: '2027-03-23',
  2028: '2028-03-12',
  2029: '2029-03-01',
  2030: '2030-03-19',
  2031: '2031-03-09',
  2032: '2032-03-27',
};

const HANUKKAH = {
  2024: '2024-12-26',
  2025: '2025-12-15',
  2026: '2026-12-05',
  2027: '2027-12-25',
  2028: '2028-12-13',
  2029: '2029-12-02',
  2030: '2030-12-21',
  2031: '2031-12-11',
  2032: '2032-11-29',
};

const RAMADAN_START = {
  2024: '2024-03-11',
  2025: '2025-03-01',
  2026: '2026-02-18',
  2027: '2027-02-08',
  2028: '2028-01-28',
  2029: '2029-01-16',
  2030: '2030-01-06',
  2031: '2030-12-26',
  2032: '2031-12-15',
};

const EID_AL_FITR = {
  2024: '2024-04-10',
  2025: '2025-03-30',
  2026: '2026-03-20',
  2027: '2027-03-09',
  2028: '2028-02-27',
  2029: '2029-02-14',
  2030: '2030-02-04',
  2031: '2031-01-24',
  2032: '2032-01-13',
};

const EID_AL_ADHA = {
  2024: '2024-06-17',
  2025: '2025-06-07',
  2026: '2026-05-27',
  2027: '2027-05-17',
  2028: '2028-05-05',
  2029: '2029-04-24',
  2030: '2030-04-14',
  2031: '2031-04-03',
  2032: '2032-03-23',
};

export function getHolidaysForYear(year) {
  const easter = getEasterDate(year);

  const raw = [
    { name: "New Year's Day", date: `${year}-01-01`, emoji: '🎉', holidayCategory: 'usa' },
    { name: "Valentine's Day", date: `${year}-02-14`, emoji: '💝', holidayCategory: 'cultural' },
    { name: 'Independence Day', date: `${year}-07-04`, emoji: '🇺🇸', holidayCategory: 'usa' },
    { name: 'Christmas Eve', date: `${year}-12-24`, emoji: '🎄', holidayCategory: 'christian' },
    { name: 'Christmas Day', date: `${year}-12-25`, emoji: '🎁', holidayCategory: 'christian' },
    { name: "New Year's Eve", date: `${year}-12-31`, emoji: '🥳', holidayCategory: 'usa' },
    { name: 'Martin Luther King Jr. Day', date: getNthWeekdayOfMonth(year, 0, 1, 3), emoji: '✊', holidayCategory: 'usa' },
    { name: "Presidents' Day", date: getNthWeekdayOfMonth(year, 1, 1, 3), emoji: '🎩', holidayCategory: 'usa' },
    { name: 'Memorial Day', date: getLastWeekdayOfMonth(year, 4, 1), emoji: '🇺🇸', holidayCategory: 'usa' },
    { name: 'Labor Day', date: getNthWeekdayOfMonth(year, 8, 1, 1), emoji: '⚒️', holidayCategory: 'usa' },
    { name: 'Thanksgiving', date: getNthWeekdayOfMonth(year, 10, 4, 4), emoji: '🦃', holidayCategory: 'usa' },

    { name: 'Epiphany', date: `${year}-01-06`, emoji: '⭐', holidayCategory: 'christian' },
    { name: 'Ash Wednesday', date: addDays(easter, -46), emoji: '✝️', holidayCategory: 'christian' },
    { name: 'Good Friday', date: addDays(easter, -2), emoji: '✝️', holidayCategory: 'christian' },
    { name: 'Easter Sunday', date: easter, emoji: '🐣', holidayCategory: 'christian' },
    { name: 'Pentecost', date: addDays(easter, 49), emoji: '🕊️', holidayCategory: 'christian' },
    { name: "All Saints' Day", date: `${year}-11-01`, emoji: '👼', holidayCategory: 'christian' },

    ROSH_HASHANAH[year] && { name: 'Rosh Hashanah', date: ROSH_HASHANAH[year], emoji: '🍎', holidayCategory: 'jewish' },
    ROSH_HASHANAH[year] && { name: 'Yom Kippur', date: addDays(ROSH_HASHANAH[year], 9), emoji: '🕍', holidayCategory: 'jewish' },
    PASSOVER[year] && { name: 'Passover', date: PASSOVER[year], emoji: '🍷', holidayCategory: 'jewish' },
    PURIM[year] && { name: 'Purim', date: PURIM[year], emoji: '🎭', holidayCategory: 'jewish' },
    HANUKKAH[year] && { name: 'Hanukkah', date: HANUKKAH[year], emoji: '🕎', holidayCategory: 'jewish' },

    RAMADAN_START[year] && { name: 'Ramadan Begins', date: RAMADAN_START[year], emoji: '🌙', holidayCategory: 'islamic' },
    EID_AL_FITR[year] && { name: 'Eid al-Fitr', date: EID_AL_FITR[year], emoji: '🌙', holidayCategory: 'islamic' },
    EID_AL_ADHA[year] && { name: 'Eid al-Adha', date: EID_AL_ADHA[year], emoji: '🕌', holidayCategory: 'islamic' },

    DIWALI[year] && { name: 'Diwali', date: DIWALI[year], emoji: '🪔', holidayCategory: 'hindu' },
    HOLI[year] && { name: 'Holi', date: HOLI[year], emoji: '🎨', holidayCategory: 'hindu' },
    NAVRATRI[year] && { name: 'Navratri', date: NAVRATRI[year], emoji: '💃', holidayCategory: 'hindu' },

    VESAK[year] && { name: 'Vesak (Buddha Day)', date: VESAK[year], emoji: '☸️', holidayCategory: 'buddhist' },
    { name: 'Bodhi Day', date: `${year}-12-08`, emoji: '🧘', holidayCategory: 'buddhist' },

    CHINESE_NEW_YEAR[year] && { name: 'Chinese New Year', date: CHINESE_NEW_YEAR[year], emoji: '🐉', holidayCategory: 'chinese' },
    { name: 'Qingming Festival', date: `${year}-04-04`, emoji: '🌸', holidayCategory: 'chinese' },
    DRAGON_BOAT_FESTIVAL[year] && { name: 'Dragon Boat Festival', date: DRAGON_BOAT_FESTIVAL[year], emoji: '🐉', holidayCategory: 'chinese' },
    MID_AUTUMN_FESTIVAL[year] && { name: 'Mid-Autumn Festival', date: MID_AUTUMN_FESTIVAL[year], emoji: '🥮', holidayCategory: 'chinese' },

    { name: 'Cinco de Mayo', date: `${year}-05-05`, emoji: '🇲🇽', holidayCategory: 'mexican' },
    { name: 'Mexican Independence Day', date: `${year}-09-16`, emoji: '🇲🇽', holidayCategory: 'mexican' },
    { name: 'Día de los Muertos', date: `${year}-11-02`, emoji: '💀', holidayCategory: 'mexican' },

    { name: "International Women's Day", date: `${year}-03-08`, emoji: '♀️', holidayCategory: 'international' },
    { name: 'World Health Day', date: `${year}-04-07`, emoji: '🏥', holidayCategory: 'international' },
    { name: 'Earth Day', date: `${year}-04-22`, emoji: '🌍', holidayCategory: 'international' },
    { name: 'International Day of Peace', date: `${year}-09-21`, emoji: '🕊️', holidayCategory: 'international' },
    { name: 'United Nations Day', date: `${year}-10-24`, emoji: '🇺🇳', holidayCategory: 'international' },
    { name: 'Human Rights Day', date: `${year}-12-10`, emoji: '⚖️', holidayCategory: 'international' },

    { name: 'Groundhog Day', date: `${year}-02-02`, emoji: '🦫', holidayCategory: 'cultural' },
    { name: "St. Patrick's Day", date: `${year}-03-17`, emoji: '☘️', holidayCategory: 'cultural' },
    { name: "April Fool's Day", date: `${year}-04-01`, emoji: '🤡', holidayCategory: 'cultural' },
    { name: 'May Day', date: `${year}-05-01`, emoji: '🌸', holidayCategory: 'cultural' },
    { name: 'Halloween', date: `${year}-10-31`, emoji: '🎃', holidayCategory: 'cultural' },
    { name: 'Summer Solstice', date: `${year}-06-21`, emoji: '☀️', holidayCategory: 'seasonal' },
    { name: 'Winter Solstice', date: `${year}-12-21`, emoji: '❄️', holidayCategory: 'seasonal' },
  ];

  return raw
    .filter(Boolean)
    .map((h) => ({
      id: `holiday-${year}-${h.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`,
      title: `${h.emoji} ${h.name}`,
      date: h.date,
      display_date: h.date,
      start_time: '00:00',
      end_time: '23:59',
      category: 'holiday',
      color: HOLIDAY_COLOR,
      notes: '',
      repeat: 'none',
      recurrence_exceptions: [],
      isHoliday: true,
      is_curated: true,
      all_day: true,
      holidayName: h.name,
      holidayEmoji: h.emoji,
      holidayCategory: h.holidayCategory,
    }));
}

export function getHolidaysForRange(startYear, endYear) {
  const all = [];
  for (let y = startYear; y <= endYear; y++) {
    all.push(...getHolidaysForYear(y));
  }
  return all;
}
