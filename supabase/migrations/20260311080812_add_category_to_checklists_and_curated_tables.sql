/*
  # Add category to user_checklists + create curated checklists tables

  ## Summary
  This migration:
  1. Adds a `category` TEXT column to `user_checklists` for filter tabs (All / Travel / Events / Home / Wellness / Productivity / Safety)
  2. Creates `curated_checklists` table with global template data (public read, no per-user data)
  3. Creates `curated_checklist_items` table with individual items per curated checklist
  4. Populates both tables with 26 curated checklists and all their items

  ## New Columns
  - `user_checklists.category` (text) - category name for filter tabs

  ## New Tables
  - `curated_checklists`: id (text PK), name, description, icon, category, sort_order
  - `curated_checklist_items`: id (uuid PK), checklist_id (FK), title, order_index

  ## Security
  - Both curated tables have RLS enabled with public SELECT only (templates are global)
*/

-- 1. Add category column to user_checklists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_checklists' AND column_name = 'category'
  ) THEN
    ALTER TABLE user_checklists ADD COLUMN category TEXT DEFAULT 'Productivity';
  END IF;
END $$;

-- 2. Create curated_checklists table
CREATE TABLE IF NOT EXISTS curated_checklists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'list-checks',
  category TEXT NOT NULL DEFAULT 'Productivity',
  sort_order INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE curated_checklists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read curated checklists" ON curated_checklists;
CREATE POLICY "Anyone can read curated checklists"
  ON curated_checklists FOR SELECT
  TO authenticated
  USING (true);

-- 3. Create curated_checklist_items table
CREATE TABLE IF NOT EXISTS curated_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id TEXT NOT NULL REFERENCES curated_checklists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE curated_checklist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read curated checklist items" ON curated_checklist_items;
CREATE POLICY "Anyone can read curated checklist items"
  ON curated_checklist_items FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_curated_checklist_items_checklist_id ON curated_checklist_items(checklist_id);

-- 4. Insert curated checklists (26 total)
INSERT INTO curated_checklists (id, name, description, icon, category, sort_order) VALUES
  ('flight-packing',     'Flight Packing',         'Everything you need before boarding a flight', 'plane', 'Travel', 1),
  ('road-trip',          'Road Trip',              'Car essentials for a smooth journey', 'car', 'Travel', 2),
  ('hotel-stay',         'Hotel Stay',             'Must-haves for a comfortable hotel stay', 'building-2', 'Travel', 3),
  ('beach-vacation',     'Beach Vacation',         'Sun, sand and sea essentials', 'waves', 'Travel', 4),
  ('camping-trip',       'Camping Trip',           'Outdoor adventure gear and supplies', 'tent', 'Travel', 5),
  ('business-trip',      'Business Trip',          'Professional travel essentials', 'briefcase', 'Travel', 6),
  ('wedding-day',        'Wedding Day',            'Bride & groom day-of checklist', 'heart', 'Events', 7),
  ('birthday-party',     'Birthday Party',         'Party planning and supplies', 'cake', 'Events', 8),
  ('dinner-party',       'Dinner Party',           'Host a memorable dinner at home', 'utensils', 'Events', 9),
  ('holiday-gathering',  'Holiday Gathering',      'Family holiday celebration prep', 'gift', 'Events', 10),
  ('house-cleaning',     'House Cleaning',         'Full home deep-clean routine', 'home', 'Home', 11),
  ('moving-day',         'Moving Day',             'Relocation day essentials', 'package', 'Home', 12),
  ('grocery-run',        'Grocery Run',            'Weekly grocery essentials', 'shopping-cart', 'Home', 13),
  ('home-maintenance',   'Home Maintenance',       'Monthly home upkeep tasks', 'wrench', 'Home', 14),
  ('morning-routine',    'Morning Routine',        'Start your day right', 'sun', 'Wellness', 15),
  ('gym-session',        'Gym Session',            'Workout bag and session prep', 'dumbbell', 'Wellness', 16),
  ('self-care-day',      'Self-Care Day',          'Full body and mind reset', 'sparkles', 'Wellness', 17),
  ('meditation-session', 'Meditation Session',     'Mindfulness practice setup', 'brain', 'Wellness', 18),
  ('work-week-prep',     'Work Week Prep',         'Sunday night prep for a productive week', 'calendar', 'Productivity', 19),
  ('deep-work-session',  'Deep Work Session',      'Focus block setup and ritual', 'zap', 'Productivity', 20),
  ('meeting-prep',       'Meeting Prep',           'Professional meeting checklist', 'users', 'Productivity', 21),
  ('study-session',      'Study Session',          'Focused learning session essentials', 'graduation-cap', 'Productivity', 22),
  ('emergency-kit',      'Emergency Kit',          'Home emergency preparedness', 'alert-triangle', 'Safety', 23),
  ('car-safety',         'Car Safety',             'Vehicle safety and readiness check', 'shield', 'Safety', 24),
  ('first-aid-bag',      'First Aid Bag',          'Medical essentials to always have ready', 'heart-pulse', 'Safety', 25),
  ('home-security',      'Home Security',          'Secure your home checklist', 'lock', 'Safety', 26)
ON CONFLICT (id) DO NOTHING;

-- 5. Insert all checklist items (only if checklist_items table is empty for this checklist)
INSERT INTO curated_checklist_items (checklist_id, title, order_index)
SELECT checklist_id, title, order_index FROM (VALUES
-- Flight Packing
('flight-packing', 'Passport / ID', 1),
('flight-packing', 'Boarding pass (printed or digital)', 2),
('flight-packing', 'Phone + charger', 3),
('flight-packing', 'Earbuds / headphones', 4),
('flight-packing', 'Neck pillow', 5),
('flight-packing', 'Eye mask', 6),
('flight-packing', 'Snacks', 7),
('flight-packing', 'Water bottle (empty for security)', 8),
('flight-packing', 'Change of clothes in carry-on', 9),
('flight-packing', 'Travel-size toiletries', 10),
('flight-packing', 'Medications', 11),
('flight-packing', 'Luggage lock', 12),
('flight-packing', 'Travel insurance documents', 13),
('flight-packing', 'Cash / cards', 14),
('flight-packing', 'Laptop / tablet + charger', 15),
-- Road Trip
('road-trip', 'Full tank of gas', 1),
('road-trip', 'Tire pressure checked', 2),
('road-trip', 'Oil level checked', 3),
('road-trip', 'Spare tire in trunk', 4),
('road-trip', 'Roadside emergency kit', 5),
('road-trip', 'Phone mount + charger', 6),
('road-trip', 'Downloaded offline maps', 7),
('road-trip', 'Snacks & drinks packed', 8),
('road-trip', 'Sunglasses', 9),
('road-trip', 'First aid kit', 10),
('road-trip', 'Blanket', 11),
('road-trip', 'Playlist / podcasts ready', 12),
('road-trip', 'Insurance + registration documents', 13),
('road-trip', 'Toll money / pass', 14),
-- Hotel Stay
('hotel-stay', 'Reservation confirmation', 1),
('hotel-stay', 'ID for check-in', 2),
('hotel-stay', 'Credit card for incidentals', 3),
('hotel-stay', 'Toiletries', 4),
('hotel-stay', 'Phone charger', 5),
('hotel-stay', 'Sleepwear', 6),
('hotel-stay', 'Workout clothes', 7),
('hotel-stay', 'Adapter (international)', 8),
('hotel-stay', 'Earplugs / eye mask', 9),
('hotel-stay', 'Medications', 10),
('hotel-stay', 'Hotel loyalty card', 11),
('hotel-stay', 'Lock valuables in safe', 12),
-- Beach Vacation
('beach-vacation', 'Sunscreen SPF 50+', 1),
('beach-vacation', 'Beach towel', 2),
('beach-vacation', 'Swimsuit(s)', 3),
('beach-vacation', 'Sunglasses (UV protection)', 4),
('beach-vacation', 'Hat / sun hat', 5),
('beach-vacation', 'Flip flops / sandals', 6),
('beach-vacation', 'Beach bag', 7),
('beach-vacation', 'Reusable water bottle', 8),
('beach-vacation', 'After-sun lotion / aloe vera', 9),
('beach-vacation', 'Waterproof phone case', 10),
('beach-vacation', 'Cash for beach vendors', 11),
('beach-vacation', 'Snorkeling gear (if applicable)', 12),
-- Camping Trip
('camping-trip', 'Tent + stakes', 1),
('camping-trip', 'Sleeping bag (season-appropriate)', 2),
('camping-trip', 'Sleeping pad', 3),
('camping-trip', 'Headlamp + extra batteries', 4),
('camping-trip', 'Matches / lighter + fire starter', 5),
('camping-trip', 'Camp stove + fuel', 6),
('camping-trip', 'Cookware + utensils', 7),
('camping-trip', 'Food + bear canister', 8),
('camping-trip', 'Water filter / purification tablets', 9),
('camping-trip', 'First aid kit', 10),
('camping-trip', 'Insect repellent', 11),
('camping-trip', 'Map + compass', 12),
('camping-trip', 'Layers + rain jacket', 13),
('camping-trip', 'Trekking poles (optional)', 14),
-- Business Trip
('business-trip', 'Laptop + charger', 1),
('business-trip', 'Business cards', 2),
('business-trip', 'Presentation slides (offline copy)', 3),
('business-trip', 'Professional attire', 4),
('business-trip', 'Dress shoes', 5),
('business-trip', 'Notebook + pen', 6),
('business-trip', 'Phone + charger', 7),
('business-trip', 'Power bank', 8),
('business-trip', 'Expense report template', 9),
('business-trip', 'Travel receipts folder', 10),
('business-trip', 'Toiletries', 11),
('business-trip', 'Medications', 12),
-- Wedding Day
('wedding-day', 'Rings', 1),
('wedding-day', 'Marriage license', 2),
('wedding-day', 'Vows (printed backup)', 3),
('wedding-day', 'Emergency sewing kit', 4),
('wedding-day', 'Stain remover pen', 5),
('wedding-day', 'Breath mints', 6),
('wedding-day', 'Touch-up makeup kit', 7),
('wedding-day', 'Phone + charger (fully charged)', 8),
('wedding-day', 'Cash for tips (vendors)', 9),
('wedding-day', 'Comfortable shoes for dancing', 10),
('wedding-day', 'Wedding timeline printout', 11),
('wedding-day', 'Contact list (vendors, bridal party)', 12),
-- Birthday Party
('birthday-party', 'Invitations sent', 1),
('birthday-party', 'Venue booked / decorated', 2),
('birthday-party', 'Birthday cake ordered', 3),
('birthday-party', 'Candles + lighter', 4),
('birthday-party', 'Plates, cups, napkins', 5),
('birthday-party', 'Balloons / decorations', 6),
('birthday-party', 'Party favors', 7),
('birthday-party', 'Music playlist ready', 8),
('birthday-party', 'Camera charged', 9),
('birthday-party', 'Food & drinks stocked', 10),
('birthday-party', 'Games / activities planned', 11),
-- Dinner Party
('dinner-party', 'Menu planned', 1),
('dinner-party', 'Groceries purchased', 2),
('dinner-party', 'Table set (plates, cutlery, glasses)', 3),
('dinner-party', 'Wine / drinks chilled', 4),
('dinner-party', 'Appetizers prepped', 5),
('dinner-party', 'Main course prep started', 6),
('dinner-party', 'Dessert ready', 7),
('dinner-party', 'Music playlist on', 8),
('dinner-party', 'House clean & tidy', 9),
('dinner-party', 'Candles / ambiance lighting', 10),
('dinner-party', 'Checked for dietary restrictions', 11),
-- Holiday Gathering
('holiday-gathering', 'Guest list confirmed', 1),
('holiday-gathering', 'Grocery shopping done', 2),
('holiday-gathering', 'Main dish prepared or ordered', 3),
('holiday-gathering', 'Side dishes assigned', 4),
('holiday-gathering', 'Decorations up', 5),
('holiday-gathering', 'Seating arranged', 6),
('holiday-gathering', 'Drinks & ice stocked', 7),
('holiday-gathering', 'Music / movies queued', 8),
('holiday-gathering', 'Gifts wrapped', 9),
('holiday-gathering', 'Extra linens / guest room ready', 10),
('holiday-gathering', 'Trash bags handy', 11),
-- House Cleaning
('house-cleaning', 'Vacuum all floors', 1),
('house-cleaning', 'Mop hard floors', 2),
('house-cleaning', 'Clean bathrooms (toilet, sink, shower)', 3),
('house-cleaning', 'Wipe down kitchen surfaces', 4),
('house-cleaning', 'Clean stovetop & oven', 5),
('house-cleaning', 'Wipe microwave inside/out', 6),
('house-cleaning', 'Clean fridge (toss expired food)', 7),
('house-cleaning', 'Dust furniture & shelves', 8),
('house-cleaning', 'Wipe light switches & door handles', 9),
('house-cleaning', 'Empty all trash cans', 10),
('house-cleaning', 'Wash bed linens', 11),
('house-cleaning', 'Clean mirrors & glass surfaces', 12),
-- Moving Day
('moving-day', 'All boxes packed & labeled', 1),
('moving-day', 'Furniture disassembled', 2),
('moving-day', 'Moving truck booked / confirmed', 3),
('moving-day', 'Utilities transferred', 4),
('moving-day', 'Change of address filed', 5),
('moving-day', 'Valuables packed separately', 6),
('moving-day', 'Appliances unplugged & ready', 7),
('moving-day', 'Keys to old place returned', 8),
('moving-day', 'Walkthrough of old place done', 9),
('moving-day', 'Cleaning old place completed', 10),
('moving-day', 'New place keys received', 11),
('moving-day', 'First-night essentials bag packed', 12),
-- Grocery Run
('grocery-run', 'Check pantry before leaving', 1),
('grocery-run', 'Make a meal plan for the week', 2),
('grocery-run', 'List organized by store section', 3),
('grocery-run', 'Reusable bags packed', 4),
('grocery-run', 'Check for coupons / deals', 5),
('grocery-run', 'Proteins', 6),
('grocery-run', 'Vegetables & fruits', 7),
('grocery-run', 'Dairy / alternatives', 8),
('grocery-run', 'Grains / bread', 9),
('grocery-run', 'Snacks', 10),
('grocery-run', 'Cleaning supplies', 11),
('grocery-run', 'Check expiry on perishables', 12),
-- Home Maintenance
('home-maintenance', 'Test smoke & CO detectors', 1),
('home-maintenance', 'Replace HVAC / air filter', 2),
('home-maintenance', 'Check water heater temperature', 3),
('home-maintenance', 'Inspect for leaks under sinks', 4),
('home-maintenance', 'Clean dryer lint trap & vent', 5),
('home-maintenance', 'Check caulk around tub/shower', 6),
('home-maintenance', 'Flush water heater sediment (annually)', 7),
('home-maintenance', 'Test GFCI outlets', 8),
('home-maintenance', 'Inspect roof / gutters', 9),
('home-maintenance', 'Lubricate door hinges', 10),
('home-maintenance', 'Check fire extinguisher pressure', 11),
-- Morning Routine
('morning-routine', 'Wake up on first alarm', 1),
('morning-routine', 'Drink a full glass of water', 2),
('morning-routine', 'Stretch or light movement (5 min)', 3),
('morning-routine', 'Shower / wash face', 4),
('morning-routine', 'Skincare routine', 5),
('morning-routine', 'Get dressed', 6),
('morning-routine', 'Healthy breakfast', 7),
('morning-routine', 'Review top 3 priorities for the day', 8),
('morning-routine', 'Take vitamins / medications', 9),
('morning-routine', 'Pack bag for the day', 10),
-- Gym Session
('gym-session', 'Gym clothes packed', 1),
('gym-session', 'Water bottle filled', 2),
('gym-session', 'Pre-workout snack eaten', 3),
('gym-session', 'Earbuds + playlist ready', 4),
('gym-session', 'Gym bag (towel, lock)', 5),
('gym-session', 'Warm-up (5-10 min)', 6),
('gym-session', 'Main workout completed', 7),
('gym-session', 'Cool-down & stretching', 8),
('gym-session', 'Post-workout nutrition', 9),
('gym-session', 'Shower / change', 10),
('gym-session', 'Log workout', 11),
-- Self-Care Day
('self-care-day', 'No work emails / notifications off', 1),
('self-care-day', 'Sleep in or rest', 2),
('self-care-day', 'Nourishing breakfast', 3),
('self-care-day', 'Face mask / skin treatment', 4),
('self-care-day', 'Long bath or shower', 5),
('self-care-day', 'Body lotion / moisturize', 6),
('self-care-day', 'Gentle exercise or walk', 7),
('self-care-day', 'Read or journal', 8),
('self-care-day', 'Nap if needed', 9),
('self-care-day', 'Favorite meal or treat', 10),
('self-care-day', 'Screen-free wind-down', 11),
-- Meditation Session
('meditation-session', 'Quiet space set up', 1),
('meditation-session', 'Phone on silent / do not disturb', 2),
('meditation-session', 'Comfortable seat or cushion', 3),
('meditation-session', 'Timer set (10-20 min)', 4),
('meditation-session', 'Breathing warm-up (2 min)', 5),
('meditation-session', 'Focused meditation session', 6),
('meditation-session', 'Body scan or progressive relaxation', 7),
('meditation-session', 'Gratitude reflection (2 min)', 8),
('meditation-session', 'Journal insights after', 9),
-- Work Week Prep
('work-week-prep', 'Review upcoming meetings & deadlines', 1),
('work-week-prep', 'Set top 3 priorities for the week', 2),
('work-week-prep', 'Clear email inbox', 3),
('work-week-prep', 'Prepare work bag / desk', 4),
('work-week-prep', 'Meal prep for weekdays', 5),
('work-week-prep', 'Lay out outfits for the week', 6),
('work-week-prep', 'Charge all devices', 7),
('work-week-prep', 'Review budget & finances', 8),
('work-week-prep', 'Schedule any personal appointments', 9),
('work-week-prep', 'Tidy workspace', 10),
-- Deep Work Session
('deep-work-session', 'Phone on silent / away', 1),
('deep-work-session', 'Notifications paused', 2),
('deep-work-session', 'Session goal defined (1 task)', 3),
('deep-work-session', 'Timer set (25-90 min)', 4),
('deep-work-session', 'Water / coffee within reach', 5),
('deep-work-session', 'Noise-cancelling headphones on', 6),
('deep-work-session', 'Focus music / white noise on', 7),
('deep-work-session', 'Work session completed', 8),
('deep-work-session', 'Break taken (5-15 min)', 9),
('deep-work-session', 'Progress logged', 10),
-- Meeting Prep
('meeting-prep', 'Agenda reviewed', 1),
('meeting-prep', 'Relevant documents opened', 2),
('meeting-prep', 'Goals for the meeting defined', 3),
('meeting-prep', 'Questions prepared', 4),
('meeting-prep', 'Notepad + pen ready', 5),
('meeting-prep', 'Camera & microphone tested (virtual)', 6),
('meeting-prep', 'Quiet, professional background set', 7),
('meeting-prep', 'On time / early', 8),
('meeting-prep', 'Action items noted during meeting', 9),
('meeting-prep', 'Follow-up email sent after', 10),
-- Study Session
('study-session', 'Study space clean & organized', 1),
('study-session', 'Phone away or on focus mode', 2),
('study-session', 'Materials / books ready', 3),
('study-session', 'Session goal set', 4),
('study-session', 'Pomodoro timer started', 5),
('study-session', 'Notes taken or flashcards made', 6),
('study-session', 'Practice problems completed', 7),
('study-session', 'Short break taken', 8),
('study-session', 'Review & summarize key points', 9),
('study-session', 'Schedule next study session', 10),
-- Emergency Kit
('emergency-kit', 'Water (1 gallon/person/day for 3 days)', 1),
('emergency-kit', 'Non-perishable food (3-day supply)', 2),
('emergency-kit', 'Battery-powered or hand-crank radio', 3),
('emergency-kit', 'Flashlight + extra batteries', 4),
('emergency-kit', 'First aid kit', 5),
('emergency-kit', 'Whistle (signal for help)', 6),
('emergency-kit', 'Dust masks', 7),
('emergency-kit', 'Plastic sheeting + duct tape', 8),
('emergency-kit', 'Moist towelettes, garbage bags', 9),
('emergency-kit', 'Wrench / pliers (shut off utilities)', 10),
('emergency-kit', 'Can opener', 11),
('emergency-kit', 'Phone charger + power bank', 12),
('emergency-kit', 'Cash in small bills', 13),
('emergency-kit', 'Copies of important documents', 14),
-- Car Safety
('car-safety', 'Tire tread & pressure checked', 1),
('car-safety', 'Brakes inspected', 2),
('car-safety', 'Oil level & quality checked', 3),
('car-safety', 'Windshield wipers working', 4),
('car-safety', 'All lights functioning', 5),
('car-safety', 'Coolant level checked', 6),
('car-safety', 'Seat belts working', 7),
('car-safety', 'Emergency kit in trunk', 8),
('car-safety', 'Spare tire + jack available', 9),
('car-safety', 'Insurance & registration current', 10),
('car-safety', 'First aid kit present', 11),
-- First Aid Bag
('first-aid-bag', 'Adhesive bandages (assorted sizes)', 1),
('first-aid-bag', 'Sterile gauze pads', 2),
('first-aid-bag', 'Adhesive tape', 3),
('first-aid-bag', 'Antiseptic wipes', 4),
('first-aid-bag', 'Antibiotic ointment', 5),
('first-aid-bag', 'Pain relievers (ibuprofen, acetaminophen)', 6),
('first-aid-bag', 'Antihistamine tablets', 7),
('first-aid-bag', 'Tweezers', 8),
('first-aid-bag', 'Scissors', 9),
('first-aid-bag', 'Digital thermometer', 10),
('first-aid-bag', 'Cold pack', 11),
('first-aid-bag', 'CPR face shield', 12),
('first-aid-bag', 'Emergency contact list', 13),
-- Home Security
('home-security', 'All doors locked', 1),
('home-security', 'All windows locked', 2),
('home-security', 'Alarm system armed', 3),
('home-security', 'Outdoor lights on / motion sensor active', 4),
('home-security', 'Spare key secured (not under mat)', 5),
('home-security', 'Valuables out of sight from windows', 6),
('home-security', 'Smart doorbell / camera active', 7),
('home-security', 'Trusted neighbor informed (if away)', 8),
('home-security', 'Mail / deliveries paused (if traveling)', 9),
('home-security', 'Social media location not shared', 10)
) AS v(checklist_id, title, order_index)
WHERE NOT EXISTS (
  SELECT 1 FROM curated_checklist_items ci WHERE ci.checklist_id = v.checklist_id
);
