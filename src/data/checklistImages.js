export const checklistImages = {
  // Exact DB names
  'Beach Day Checklist': 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/checklist-icon/ChatGPT%20Image%20Beach%20Day%20Checklist.png',
  'Carry-On Travel Checklist': 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/checklist-icon/ChatGPT%20Image%20Carry-On%20Travel%20Checklist.png',
  'International Packing Checklist': 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/checklist-icon/ChatGPT%20Image%20International%20Packing%20Checklist.png',
  'Packing Checklist': 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/checklist-icon/ChatGPT%20Image%20Packing%20Checklist.png',
  'Road Trip Checklist': 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/checklist-icon/ChatGPT%20Image%20Road%20Trip%20Checklist.png',
  'Birthday Party Planning Checklist': 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/checklist-icon/ChatGPT%20Image%20Birthday%20Party%20Planning.png',
  'Christmas Gift + Wrapping Checklist': 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/checklist-icon/ChatGPT%20Image%20Christmas%20Gift.png',
  'Holiday Event Checklist': 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/checklist-icon/Holiday%20event.png',
  'Wedding Checklist': 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/checklist-icon/Wedding%20Checklist.png',
  'Apartment Essentials Checklist': 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/checklist-icon/Appartament%20essenzial.png',
  'Dorm / College Move-In Checklist': 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/checklist-icon/Moving.png',
  'House Guest Prep Checklist': 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/checklist-icon/House%20guest.png',
  'Moving Checklist': 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/checklist-icon/Moving%20checklist.png',
  'New Home Setup Checklist': 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/checklist-icon/New%20Home.png',
  'Pet Care Checklist': 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/checklist-icon/Pet%20Care.png',
  'Spring Cleaning Checklist': 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/checklist-icon/Spring%20Cleaning.png',
  'Beauty / Self-Care Reset Checklist': 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/checklist-icon/Beauty.png',
  'Gym Bag Checklist': 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/checklist-icon/Gym.png',
  'Weekly Grocery + Meal Prep Checklist': 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/checklist-icon/meal%20prep.png',
  'Back-to-School / Semester Checklist': 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/checklist-icon/Back%20to%20school.png',
  'Interview / New Job Checklist': 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/checklist-icon/New%20jobe.png',
  'Weekend Reset Checklist': 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/checklist-icon/weekend%20reset.png',
  'Work Bag / Office Day Checklist': 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/checklist-icon/bag%20work.png',
  'Car Essentials Checklist': 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/checklist-icon/Car%20Essentials.png',
  'Emergency / Go-Bag Checklist': 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/checklist-icon/Emergency%20bag.png',
  'Emergency Preparedness Checklist': 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/checklist-icon/emergency%20preap.png',
};

// Fuzzy lookup: tries exact match first, then checks if checklist name contains a key or vice versa
export function getChecklistImage(name) {
  if (!name) return null;
  if (checklistImages[name]) return checklistImages[name];
  const lower = name.toLowerCase();
  for (const [key, url] of Object.entries(checklistImages)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return url;
    }
  }
  return null;
}
