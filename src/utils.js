// Utility functions for AA Lifestyle app

// Create page URL for routing
export const createPageUrl = (pageName) => {
  const routes = {
    Home: '/',
    CalendarPage: '/calendar',
    Tasks: '/tasks',
    Lifestyle: '/lifestyle',
    Profile: '/profile',
    Settings: '/settings',
    Onboarding: '/onboarding',
    Login: '/login',
    Splash: '/splash',
    Habits: '/habits',
    Sleep: '/sleep',
    Birthdays: '/birthdays',
    Goals: '/goals',
    Journal: '/journal',
    Finance: '/finance',
    Fitness: '/fitness',
    Nutrition: '/nutrition',
    Reading: '/reading',
    Travel: '/travel',
    Projects: '/projects',
    Notes: '/notes',
    Contacts: '/contacts',
    Reminders: '/reminders',
    Shopping: '/shopping',
    Routines: '/routines',
    HomeOrganization: '/home-organization'
  };

  return routes[pageName] || '/';
};

// Date formatting helpers
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatTime = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

// Color utilities
export const getColorForCategory = (category) => {
  const colors = {
    personal: '#B8955A',
    work: '#4A5B6D',
    health: '#7A6D5E',
    social: '#D49FA4',
    default: '#C9A052'
  };
  return colors[category] || colors.default;
};

// Priority colors
export const getPriorityColor = (priority) => {
  const colors = {
    high: '#DC2626',
    medium: '#F59E0B',
    low: '#10B981',
    default: '#6B7280'
  };
  return colors[priority] || colors.default;
};
