// Birthday helper functions

export const getUpcomingBirthdays = (birthdays, daysAhead = 30) => {
  const today = new Date();
  const upcoming = [];

  birthdays.forEach(birthday => {
    if (!birthday.date) return;

    const [month, day] = birthday.date.split('-').map(num => parseInt(num));
    const thisYear = today.getFullYear();

    // Create birthday date for this year
    let birthdayThisYear = new Date(thisYear, month - 1, day);

    // If birthday already passed this year, check next year
    if (birthdayThisYear < today) {
      birthdayThisYear = new Date(thisYear + 1, month - 1, day);
    }

    // Calculate days until birthday
    const daysUntil = Math.ceil((birthdayThisYear - today) / (1000 * 60 * 60 * 24));

    if (daysUntil >= 0 && daysUntil <= daysAhead) {
      upcoming.push({
        ...birthday,
        daysUntil,
        displayDate: birthdayThisYear
      });
    }
  });

  // Sort by days until birthday
  return upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
};

export const formatBirthdayDate = (date) => {
  if (!date) return '';

  const [month, day] = date.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return `${months[parseInt(month) - 1]} ${parseInt(day)}`;
};

export const calculateAge = (birthYear) => {
  if (!birthYear) return null;
  return new Date().getFullYear() - parseInt(birthYear);
};
