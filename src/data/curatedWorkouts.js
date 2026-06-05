export const MUSCLE_GROUPS_MALE = [
  { id: 'Back', label: 'Back', image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/workout-icon/raw%20(1).png' },
  { id: 'Chest', label: 'Chest', image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/workout-icon/20940203-68d0-42f4-8f9c-f9789fc5e50b%20(1).png' },
  { id: 'Shoulders', label: 'Shoulders', image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/workout-icon/687dfc05-8643-450c-b6fb-fa70399de8ed%20(1).png' },
  { id: 'Legs', label: 'Legs', image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/workout-icon/21744b7b-9fc2-4eba-9bf8-8bd3ffc5121f%20(1).png' },
  { id: 'Core', label: 'Core', image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/workout-icon/347ee9ec-91d9-47ce-8f64-40ee1d1024d9%20(1).png' },
  { id: 'Arms', label: 'Arms', image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/workout-icon/418bf7a6-fc50-4cd0-9349-a247880d767d%20(1).png' },
];

export const MUSCLE_GROUPS_FEMALE = [
  { id: 'Back', label: 'Back', image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/workout-icon/7929c8e3-9fe1-4488-9cbe-fa389db0175e%20(1).png' },
  { id: 'Chest', label: 'Chest', image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/workout-icon/cd6416a6-f343-4546-a074-0861e491ae6c%20(1).png' },
  { id: 'Shoulders', label: 'Shoulders', image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/workout-icon/6c6ff7f2-2e1e-401d-8f83-13e6a4183494%20(1).png' },
  { id: 'Legs', label: 'Legs', image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/workout-icon/ecd0b2ea-57b3-461f-83ce-db76784af6a6%20(1)%20(1).png' },
  { id: 'Core', label: 'Core', image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/workout-icon/c92e60a0-f5f2-4109-a0a6-b46ce753925c%20(1).png' },
  { id: 'Arms', label: 'Arms', image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/workout-icon/c96e17e3-3d16-40da-a38c-892120479b33%20(1).png' },
];

export const MUSCLE_GROUPS = MUSCLE_GROUPS_FEMALE;

export const CURATED_WORKOUTS = [
  // ─── FEMALE BACK (10) ───
  {
    id: 'curated-back-female-1',
    name: 'Sculpted Back',
    duration: 40,
    difficulty: 'Beginner',
    muscle_groups: ['Back'],
    gender: 'female',
    is_favorite: false,
    exercises: [
      { name: 'Assisted Pull-Ups', sets: 3, reps: '10', rest_seconds: 90, notes: '' },
      { name: 'Dumbbell Rows', sets: 4, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Seated Cable Rows', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Straight Arm Pulldowns', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
    ],
  },
  {
    id: 'curated-back-female-2',
    name: 'Lean Back Tone',
    duration: 35,
    difficulty: 'Beginner',
    muscle_groups: ['Back'],
    gender: 'female',
    is_favorite: false,
    exercises: [
      { name: 'Lat Pulldown', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Dumbbell Rows', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Cable Pullovers', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
      { name: 'Rear Delt Fly', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
    ],
  },
  {
    id: 'curated-back-female-3',
    name: 'Back Definition',
    duration: 45,
    difficulty: 'Intermediate',
    muscle_groups: ['Back'],
    gender: 'female',
    is_favorite: false,
    exercises: [
      { name: 'Pull-Ups', sets: 4, reps: '8-10', rest_seconds: 90, notes: '' },
      { name: 'Barbell Rows', sets: 4, reps: '10', rest_seconds: 90, notes: '' },
      { name: 'Lat Pulldowns', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Face Pulls', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
    ],
  },
  {
    id: 'curated-back-female-4',
    name: 'Upper Back Sculpt',
    duration: 40,
    difficulty: 'Intermediate',
    muscle_groups: ['Back'],
    gender: 'female',
    is_favorite: false,
    exercises: [
      { name: 'Face Pulls', sets: 4, reps: '15', rest_seconds: 45, notes: '' },
      { name: 'Reverse Fly Machine', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Seated Rows', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Band Pull Aparts', sets: 3, reps: '20', rest_seconds: 30, notes: '' },
    ],
  },
  {
    id: 'curated-back-female-5',
    name: 'Toned Back Builder',
    duration: 45,
    difficulty: 'Intermediate',
    muscle_groups: ['Back'],
    gender: 'female',
    is_favorite: false,
    exercises: [
      { name: 'Wide Grip Pulldown', sets: 4, reps: '10', rest_seconds: 60, notes: '' },
      { name: 'Single Arm Pulldown', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Cable Rows', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Rear Delt Fly', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
    ],
  },
  {
    id: 'curated-back-female-6',
    name: 'Back & Burn',
    duration: 40,
    difficulty: 'Intermediate',
    muscle_groups: ['Back'],
    gender: 'female',
    is_favorite: false,
    exercises: [
      { name: 'Inverted Rows', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Lat Pulldown', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Kettlebell Swings', sets: 3, reps: '15', rest_seconds: 60, notes: '' },
      { name: 'Battle Ropes', sets: 3, reps: '30 sec', rest_seconds: 60, notes: '' },
    ],
  },
  {
    id: 'curated-back-female-7',
    name: 'Strength + Sculpt Back',
    duration: 50,
    difficulty: 'Advanced',
    muscle_groups: ['Back'],
    gender: 'female',
    is_favorite: false,
    exercises: [
      { name: 'Deadlifts', sets: 5, reps: '5', rest_seconds: 180, notes: '' },
      { name: 'Pull-Ups', sets: 4, reps: '6', rest_seconds: 120, notes: '' },
      { name: 'Barbell Rows', sets: 4, reps: '8', rest_seconds: 90, notes: '' },
      { name: 'Cable Rows', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
    ],
  },
  {
    id: 'curated-back-female-8',
    name: 'Back Isolation',
    duration: 40,
    difficulty: 'Intermediate',
    muscle_groups: ['Back'],
    gender: 'female',
    is_favorite: false,
    exercises: [
      { name: 'Straight Arm Pulldown', sets: 4, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Single Arm Cable Rows', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Machine Rows', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Rear Delt Fly', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
    ],
  },
  {
    id: 'curated-back-female-9',
    name: 'Snatched Back Routine',
    duration: 40,
    difficulty: 'Intermediate',
    muscle_groups: ['Back'],
    gender: 'female',
    is_favorite: false,
    exercises: [
      { name: 'Lat Pulldown', sets: 4, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Dumbbell Rows', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Cable Rows', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Rear Delt Fly', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
    ],
  },
  {
    id: 'curated-back-female-10',
    name: 'Back Sculpt + Core',
    duration: 35,
    difficulty: 'Beginner',
    muscle_groups: ['Back'],
    gender: 'female',
    is_favorite: false,
    exercises: [
      { name: 'Lat Pulldown', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Rows', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Plank', sets: 3, reps: '30 sec', rest_seconds: 45, notes: '' },
      { name: 'Dead Bugs', sets: 3, reps: '12', rest_seconds: 45, notes: '' },
    ],
  },

  // ─── FEMALE CHEST (10) ───
  {
    id: 'curated-chest-female-1',
    name: 'Chest Tone',
    duration: 35,
    difficulty: 'Beginner',
    muscle_groups: ['Chest'],
    gender: 'female',
    is_favorite: false,
    exercises: [
      { name: 'Dumbbell Press', sets: 4, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Incline Fly', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
      { name: 'Cable Crossovers', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
      { name: 'Push-Ups', sets: 3, reps: '10', rest_seconds: 60, notes: '' },
    ],
  },
  {
    id: 'curated-chest-female-2',
    name: 'Lift & Sculpt Chest',
    duration: 40,
    difficulty: 'Intermediate',
    muscle_groups: ['Chest'],
    gender: 'female',
    is_favorite: false,
    exercises: [
      { name: 'Incline Dumbbell Press', sets: 4, reps: '10', rest_seconds: 90, notes: '' },
      { name: 'Cable Fly', sets: 4, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Push-Ups', sets: 3, reps: 'Max', rest_seconds: 60, notes: '' },
      { name: 'Chest Press Machine', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
    ],
  },
  {
    id: 'curated-chest-female-3',
    name: 'Lean Chest Definition',
    duration: 35,
    difficulty: 'Beginner',
    muscle_groups: ['Chest'],
    gender: 'female',
    is_favorite: false,
    exercises: [
      { name: 'Light DB Press', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Cable Fly', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
      { name: 'Push-Ups', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Incline Fly', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
    ],
  },
  {
    id: 'curated-chest-female-4',
    name: 'Upper Chest Lift',
    duration: 45,
    difficulty: 'Intermediate',
    muscle_groups: ['Chest'],
    gender: 'female',
    is_favorite: false,
    exercises: [
      { name: 'Incline Barbell Press', sets: 4, reps: '8', rest_seconds: 90, notes: '' },
      { name: 'Incline DB Press', sets: 4, reps: '10', rest_seconds: 90, notes: '' },
      { name: 'Low to High Fly', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Push-Ups', sets: 3, reps: 'Max', rest_seconds: 60, notes: '' },
    ],
  },
  {
    id: 'curated-chest-female-5',
    name: 'Chest + Core Tone',
    duration: 40,
    difficulty: 'Intermediate',
    muscle_groups: ['Chest'],
    gender: 'female',
    is_favorite: false,
    exercises: [
      { name: 'Bench Press', sets: 4, reps: '10', rest_seconds: 90, notes: '' },
      { name: 'Cable Fly', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Push-Ups', sets: 3, reps: 'Max', rest_seconds: 60, notes: '' },
      { name: 'Plank', sets: 3, reps: '45 sec', rest_seconds: 45, notes: '' },
    ],
  },
  {
    id: 'curated-chest-female-6',
    name: 'Beginner Chest Sculpt',
    duration: 30,
    difficulty: 'Beginner',
    muscle_groups: ['Chest'],
    gender: 'female',
    is_favorite: false,
    exercises: [
      { name: 'Machine Press', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Pec Deck', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
      { name: 'Push-Ups', sets: 3, reps: '10', rest_seconds: 60, notes: '' },
      { name: 'Light Fly', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
    ],
  },
  {
    id: 'curated-chest-female-7',
    name: 'Chest Burn',
    duration: 40,
    difficulty: 'Intermediate',
    muscle_groups: ['Chest'],
    gender: 'female',
    is_favorite: false,
    exercises: [
      { name: 'DB Press', sets: 4, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Incline Fly', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
      { name: 'Cable Fly', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
      { name: 'Push-Up Burnout', sets: 1, reps: 'Max', rest_seconds: 60, notes: '' },
    ],
  },
  {
    id: 'curated-chest-female-8',
    name: 'Athletic Chest Tone',
    duration: 40,
    difficulty: 'Intermediate',
    muscle_groups: ['Chest'],
    gender: 'female',
    is_favorite: false,
    exercises: [
      { name: 'Push-Ups', sets: 4, reps: 'Max', rest_seconds: 60, notes: '' },
      { name: 'Incline Press', sets: 3, reps: '10', rest_seconds: 90, notes: '' },
      { name: 'Cable Fly', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Med Ball Throws', sets: 3, reps: '10', rest_seconds: 60, notes: '' },
    ],
  },
  {
    id: 'curated-chest-female-9',
    name: 'Defined Chest Routine',
    duration: 40,
    difficulty: 'Intermediate',
    muscle_groups: ['Chest'],
    gender: 'female',
    is_favorite: false,
    exercises: [
      { name: 'Bench Press', sets: 4, reps: '10', rest_seconds: 90, notes: '' },
      { name: 'Incline DB Press', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Cable Fly', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Push-Ups', sets: 3, reps: 'Max', rest_seconds: 60, notes: '' },
    ],
  },
  {
    id: 'curated-chest-female-10',
    name: 'Light Chest Sculpt',
    duration: 30,
    difficulty: 'Beginner',
    muscle_groups: ['Chest'],
    gender: 'female',
    is_favorite: false,
    exercises: [
      { name: 'DB Press', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
      { name: 'Fly', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
      { name: 'Push-Ups', sets: 3, reps: '10', rest_seconds: 60, notes: '' },
      { name: 'Plank', sets: 3, reps: '30 sec', rest_seconds: 45, notes: '' },
    ],
  },

  // ─── FEMALE SHOULDERS (5) ───
  { id: 'curated-shoulders-female-1', name: 'Sculpted Shoulders', duration: 35, difficulty: 'Beginner', muscle_groups: ['Shoulders'], gender: 'female', is_favorite: false, exercises: [
    { name: 'Dumbbell Shoulder Press', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
    { name: 'Lateral Raises', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
    { name: 'Front Raises', sets: 3, reps: '12', rest_seconds: 45, notes: '' },
    { name: 'Rear Delt Fly', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
  ]},
  { id: 'curated-shoulders-female-2', name: 'Shoulder Tone & Define', duration: 40, difficulty: 'Intermediate', muscle_groups: ['Shoulders'], gender: 'female', is_favorite: false, exercises: [
    { name: 'Arnold Press', sets: 4, reps: '10', rest_seconds: 60, notes: '' },
    { name: 'Cable Lateral Raises', sets: 3, reps: '12', rest_seconds: 45, notes: '' },
    { name: 'Face Pulls', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
    { name: 'Overhead Press Machine', sets: 3, reps: '10', rest_seconds: 60, notes: '' },
  ]},
  { id: 'curated-shoulders-female-3', name: 'Light Shoulder Burn', duration: 30, difficulty: 'Beginner', muscle_groups: ['Shoulders'], gender: 'female', is_favorite: false, exercises: [
    { name: 'Seated DB Press', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
    { name: 'Lateral Raises', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
    { name: 'Band Pull Aparts', sets: 3, reps: '20', rest_seconds: 30, notes: '' },
  ]},
  { id: 'curated-shoulders-female-4', name: 'Shoulder Shaper', duration: 40, difficulty: 'Intermediate', muscle_groups: ['Shoulders'], gender: 'female', is_favorite: false, exercises: [
    { name: 'Barbell Press', sets: 4, reps: '8', rest_seconds: 90, notes: '' },
    { name: 'Dumbbell Lateral Raises', sets: 4, reps: '12', rest_seconds: 45, notes: '' },
    { name: 'Rear Delt Cable Fly', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
    { name: 'Shrugs', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
  ]},
  { id: 'curated-shoulders-female-5', name: 'Boulder Shoulders', duration: 45, difficulty: 'Advanced', muscle_groups: ['Shoulders'], gender: 'female', is_favorite: false, exercises: [
    { name: 'Military Press', sets: 5, reps: '6-8', rest_seconds: 120, notes: '' },
    { name: 'Upright Rows', sets: 4, reps: '10', rest_seconds: 60, notes: '' },
    { name: 'Cable Lateral Raises', sets: 4, reps: '12', rest_seconds: 45, notes: '' },
    { name: 'Rear Delt Fly', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
    { name: 'Face Pulls', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
  ]},

  // ─── FEMALE LEGS (5) ───
  { id: 'curated-legs-female-1', name: 'Glute & Leg Sculpt', duration: 45, difficulty: 'Beginner', muscle_groups: ['Legs'], gender: 'female', is_favorite: false, exercises: [
    { name: 'Goblet Squats', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
    { name: 'Romanian Deadlifts', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
    { name: 'Walking Lunges', sets: 3, reps: '10 each', rest_seconds: 60, notes: '' },
    { name: 'Hip Thrusts', sets: 3, reps: '15', rest_seconds: 60, notes: '' },
  ]},
  { id: 'curated-legs-female-2', name: 'Lower Body Burn', duration: 40, difficulty: 'Intermediate', muscle_groups: ['Legs'], gender: 'female', is_favorite: false, exercises: [
    { name: 'Barbell Squats', sets: 4, reps: '10', rest_seconds: 90, notes: '' },
    { name: 'Leg Press', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
    { name: 'Leg Curls', sets: 3, reps: '12', rest_seconds: 45, notes: '' },
    { name: 'Calf Raises', sets: 4, reps: '15', rest_seconds: 30, notes: '' },
  ]},
  { id: 'curated-legs-female-3', name: 'Glute Builder', duration: 45, difficulty: 'Intermediate', muscle_groups: ['Legs'], gender: 'female', is_favorite: false, exercises: [
    { name: 'Hip Thrusts', sets: 4, reps: '12', rest_seconds: 60, notes: '' },
    { name: 'Sumo Deadlifts', sets: 4, reps: '10', rest_seconds: 90, notes: '' },
    { name: 'Bulgarian Split Squats', sets: 3, reps: '10 each', rest_seconds: 60, notes: '' },
    { name: 'Cable Kickbacks', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
  ]},
  { id: 'curated-legs-female-4', name: 'Quad & Hamstring Focus', duration: 50, difficulty: 'Advanced', muscle_groups: ['Legs'], gender: 'female', is_favorite: false, exercises: [
    { name: 'Front Squats', sets: 4, reps: '8', rest_seconds: 120, notes: '' },
    { name: 'Romanian Deadlifts', sets: 4, reps: '10', rest_seconds: 90, notes: '' },
    { name: 'Leg Extensions', sets: 3, reps: '12', rest_seconds: 45, notes: '' },
    { name: 'Lying Leg Curls', sets: 3, reps: '12', rest_seconds: 45, notes: '' },
    { name: 'Calf Raises', sets: 4, reps: '15', rest_seconds: 30, notes: '' },
  ]},
  { id: 'curated-legs-female-5', name: 'Toned Legs Circuit', duration: 35, difficulty: 'Beginner', muscle_groups: ['Legs'], gender: 'female', is_favorite: false, exercises: [
    { name: 'Bodyweight Squats', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
    { name: 'Glute Bridges', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
    { name: 'Step-Ups', sets: 3, reps: '12 each', rest_seconds: 45, notes: '' },
    { name: 'Wall Sit', sets: 3, reps: '30 sec', rest_seconds: 30, notes: '' },
  ]},

  // ─── FEMALE CORE (5) ───
  { id: 'curated-core-female-1', name: 'Core Sculpt', duration: 25, difficulty: 'Beginner', muscle_groups: ['Core'], gender: 'female', is_favorite: false, exercises: [
    { name: 'Crunches', sets: 3, reps: '15', rest_seconds: 30, notes: '' },
    { name: 'Plank', sets: 3, reps: '30 sec', rest_seconds: 30, notes: '' },
    { name: 'Bicycle Crunches', sets: 3, reps: '20', rest_seconds: 30, notes: '' },
    { name: 'Leg Raises', sets: 3, reps: '12', rest_seconds: 30, notes: '' },
  ]},
  { id: 'curated-core-female-2', name: 'Ab Burn', duration: 30, difficulty: 'Intermediate', muscle_groups: ['Core'], gender: 'female', is_favorite: false, exercises: [
    { name: 'Hanging Leg Raises', sets: 3, reps: '12', rest_seconds: 45, notes: '' },
    { name: 'Cable Crunches', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
    { name: 'Russian Twists', sets: 3, reps: '20', rest_seconds: 30, notes: '' },
    { name: 'Plank', sets: 3, reps: '45 sec', rest_seconds: 30, notes: '' },
  ]},
  { id: 'curated-core-female-3', name: 'Flat Tummy Routine', duration: 20, difficulty: 'Beginner', muscle_groups: ['Core'], gender: 'female', is_favorite: false, exercises: [
    { name: 'Dead Bug', sets: 3, reps: '10 each', rest_seconds: 30, notes: '' },
    { name: 'Bird Dog', sets: 3, reps: '10 each', rest_seconds: 30, notes: '' },
    { name: 'Mountain Climbers', sets: 3, reps: '20', rest_seconds: 30, notes: '' },
  ]},
  { id: 'curated-core-female-4', name: 'Oblique Shredder', duration: 30, difficulty: 'Intermediate', muscle_groups: ['Core'], gender: 'female', is_favorite: false, exercises: [
    { name: 'Side Plank', sets: 3, reps: '30 sec each', rest_seconds: 30, notes: '' },
    { name: 'Woodchoppers', sets: 3, reps: '12 each', rest_seconds: 45, notes: '' },
    { name: 'Russian Twists', sets: 3, reps: '20', rest_seconds: 30, notes: '' },
    { name: 'Bicycle Crunches', sets: 3, reps: '20', rest_seconds: 30, notes: '' },
  ]},
  { id: 'curated-core-female-5', name: 'Total Core Power', duration: 35, difficulty: 'Advanced', muscle_groups: ['Core'], gender: 'female', is_favorite: false, exercises: [
    { name: 'Dragon Flags', sets: 3, reps: '8', rest_seconds: 60, notes: '' },
    { name: 'Ab Wheel Rollouts', sets: 3, reps: '10', rest_seconds: 60, notes: '' },
    { name: 'Hanging Windshield Wipers', sets: 3, reps: '8 each', rest_seconds: 60, notes: '' },
    { name: 'Plank', sets: 3, reps: '60 sec', rest_seconds: 30, notes: '' },
  ]},

  // ─── FEMALE ARMS (5) ───
  { id: 'curated-arms-female-1', name: 'Toned Arms', duration: 30, difficulty: 'Beginner', muscle_groups: ['Arms'], gender: 'female', is_favorite: false, exercises: [
    { name: 'Bicep Curls', sets: 3, reps: '12', rest_seconds: 45, notes: '' },
    { name: 'Tricep Dips', sets: 3, reps: '10', rest_seconds: 45, notes: '' },
    { name: 'Hammer Curls', sets: 3, reps: '12', rest_seconds: 45, notes: '' },
    { name: 'Tricep Pushdowns', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
  ]},
  { id: 'curated-arms-female-2', name: 'Arm Sculpt', duration: 35, difficulty: 'Intermediate', muscle_groups: ['Arms'], gender: 'female', is_favorite: false, exercises: [
    { name: 'EZ Bar Curls', sets: 4, reps: '10', rest_seconds: 60, notes: '' },
    { name: 'Overhead Tricep Extension', sets: 3, reps: '12', rest_seconds: 45, notes: '' },
    { name: 'Concentration Curls', sets: 3, reps: '12 each', rest_seconds: 45, notes: '' },
    { name: 'Diamond Push-Ups', sets: 3, reps: '10', rest_seconds: 60, notes: '' },
  ]},
  { id: 'curated-arms-female-3', name: 'Lean Arms Circuit', duration: 25, difficulty: 'Beginner', muscle_groups: ['Arms'], gender: 'female', is_favorite: false, exercises: [
    { name: 'Light Dumbbell Curls', sets: 3, reps: '15', rest_seconds: 30, notes: '' },
    { name: 'Tricep Kickbacks', sets: 3, reps: '15', rest_seconds: 30, notes: '' },
    { name: 'Resistance Band Curls', sets: 3, reps: '15', rest_seconds: 30, notes: '' },
  ]},
  { id: 'curated-arms-female-4', name: 'Arm Definition', duration: 35, difficulty: 'Intermediate', muscle_groups: ['Arms'], gender: 'female', is_favorite: false, exercises: [
    { name: 'Barbell Curls', sets: 4, reps: '10', rest_seconds: 60, notes: '' },
    { name: 'Skull Crushers', sets: 4, reps: '10', rest_seconds: 60, notes: '' },
    { name: 'Incline Dumbbell Curls', sets: 3, reps: '12', rest_seconds: 45, notes: '' },
    { name: 'Rope Pushdowns', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
  ]},
  { id: 'curated-arms-female-5', name: 'Strong Arms', duration: 40, difficulty: 'Advanced', muscle_groups: ['Arms'], gender: 'female', is_favorite: false, exercises: [
    { name: 'Weighted Chin-Ups', sets: 4, reps: '8', rest_seconds: 90, notes: '' },
    { name: 'Close Grip Bench Press', sets: 4, reps: '8', rest_seconds: 90, notes: '' },
    { name: 'Preacher Curls', sets: 3, reps: '10', rest_seconds: 60, notes: '' },
    { name: 'Overhead Tricep Extension', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
    { name: 'Hammer Curls', sets: 3, reps: '12', rest_seconds: 45, notes: '' },
  ]},

  // ═══════════════════════════════════════════
  // ─── MALE WORKOUTS ───
  // ═══════════════════════════════════════════

  // ─── MALE BACK (5) ───
  { id: 'curated-back-male-1', name: 'Back Destroyer', duration: 50, difficulty: 'Intermediate', muscle_groups: ['Back'], gender: 'male', is_favorite: false, exercises: [
    { name: 'Deadlifts', sets: 4, reps: '6-8', rest_seconds: 120, notes: '' },
    { name: 'Barbell Rows', sets: 4, reps: '8-10', rest_seconds: 90, notes: '' },
    { name: 'Lat Pulldowns', sets: 3, reps: '10-12', rest_seconds: 60, notes: '' },
    { name: 'Seated Cable Rows', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
    { name: 'Face Pulls', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
  ]},
  { id: 'curated-back-male-2', name: 'Wide Back Builder', duration: 45, difficulty: 'Intermediate', muscle_groups: ['Back'], gender: 'male', is_favorite: false, exercises: [
    { name: 'Pull-Ups', sets: 4, reps: '8-10', rest_seconds: 90, notes: '' },
    { name: 'T-Bar Rows', sets: 4, reps: '10', rest_seconds: 90, notes: '' },
    { name: 'Single Arm Dumbbell Rows', sets: 3, reps: '10 each', rest_seconds: 60, notes: '' },
    { name: 'Straight Arm Pulldowns', sets: 3, reps: '12', rest_seconds: 45, notes: '' },
  ]},
  { id: 'curated-back-male-3', name: 'Thick Back Power', duration: 55, difficulty: 'Advanced', muscle_groups: ['Back'], gender: 'male', is_favorite: false, exercises: [
    { name: 'Heavy Deadlifts', sets: 5, reps: '5', rest_seconds: 180, notes: '' },
    { name: 'Pendlay Rows', sets: 4, reps: '6-8', rest_seconds: 120, notes: '' },
    { name: 'Weighted Pull-Ups', sets: 4, reps: '6-8', rest_seconds: 90, notes: '' },
    { name: 'Cable Rows', sets: 3, reps: '10', rest_seconds: 60, notes: '' },
    { name: 'Rear Delt Fly', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
  ]},
  { id: 'curated-back-male-4', name: 'Back Pump Session', duration: 40, difficulty: 'Beginner', muscle_groups: ['Back'], gender: 'male', is_favorite: false, exercises: [
    { name: 'Lat Pulldown', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
    { name: 'Dumbbell Rows', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
    { name: 'Cable Pullovers', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
    { name: 'Reverse Fly', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
  ]},
  { id: 'curated-back-male-5', name: 'V-Taper Back', duration: 50, difficulty: 'Intermediate', muscle_groups: ['Back'], gender: 'male', is_favorite: false, exercises: [
    { name: 'Wide Grip Pull-Ups', sets: 4, reps: '8-10', rest_seconds: 90, notes: '' },
    { name: 'Close Grip Cable Rows', sets: 4, reps: '10', rest_seconds: 60, notes: '' },
    { name: 'Dumbbell Pullovers', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
    { name: 'Hyperextensions', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
  ]},

  // ─── MALE CHEST (5) ───
  { id: 'curated-chest-male-1', name: 'Chest Mass Builder', duration: 50, difficulty: 'Intermediate', muscle_groups: ['Chest'], gender: 'male', is_favorite: false, exercises: [
    { name: 'Flat Barbell Bench Press', sets: 4, reps: '8-10', rest_seconds: 120, notes: '' },
    { name: 'Incline Dumbbell Press', sets: 4, reps: '10', rest_seconds: 90, notes: '' },
    { name: 'Cable Flyes', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
    { name: 'Dips', sets: 3, reps: '10-12', rest_seconds: 60, notes: '' },
  ]},
  { id: 'curated-chest-male-2', name: 'Upper Chest Focus', duration: 45, difficulty: 'Intermediate', muscle_groups: ['Chest'], gender: 'male', is_favorite: false, exercises: [
    { name: 'Incline Barbell Press', sets: 4, reps: '8', rest_seconds: 120, notes: '' },
    { name: 'Incline Dumbbell Fly', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
    { name: 'Landmine Press', sets: 3, reps: '10 each', rest_seconds: 60, notes: '' },
    { name: 'Push-Ups', sets: 3, reps: '15-20', rest_seconds: 45, notes: '' },
  ]},
  { id: 'curated-chest-male-3', name: 'Chest Power Day', duration: 55, difficulty: 'Advanced', muscle_groups: ['Chest'], gender: 'male', is_favorite: false, exercises: [
    { name: 'Heavy Flat Bench Press', sets: 5, reps: '5', rest_seconds: 180, notes: '' },
    { name: 'Weighted Dips', sets: 4, reps: '8', rest_seconds: 90, notes: '' },
    { name: 'Dumbbell Flyes', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
    { name: 'Cable Crossovers', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
  ]},
  { id: 'curated-chest-male-4', name: 'Chest Pump Session', duration: 40, difficulty: 'Beginner', muscle_groups: ['Chest'], gender: 'male', is_favorite: false, exercises: [
    { name: 'Machine Chest Press', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
    { name: 'Dumbbell Fly', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
    { name: 'Push-Ups', sets: 3, reps: '12', rest_seconds: 45, notes: '' },
    { name: 'Pec Deck', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
  ]},
  { id: 'curated-chest-male-5', name: 'Complete Chest Blast', duration: 50, difficulty: 'Intermediate', muscle_groups: ['Chest'], gender: 'male', is_favorite: false, exercises: [
    { name: 'Flat Dumbbell Press', sets: 4, reps: '10', rest_seconds: 90, notes: '' },
    { name: 'Incline Smith Machine Press', sets: 3, reps: '10', rest_seconds: 90, notes: '' },
    { name: 'Low Cable Fly', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
    { name: 'Decline Push-Ups', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
  ]},

  // ─── MALE SHOULDERS (5) ───
  { id: 'curated-shoulders-male-1', name: 'Boulder Shoulders', duration: 45, difficulty: 'Intermediate', muscle_groups: ['Shoulders'], gender: 'male', is_favorite: false, exercises: [
    { name: 'Overhead Barbell Press', sets: 4, reps: '8', rest_seconds: 120, notes: '' },
    { name: 'Dumbbell Lateral Raises', sets: 4, reps: '12', rest_seconds: 45, notes: '' },
    { name: 'Face Pulls', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
    { name: 'Rear Delt Fly', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
  ]},
  { id: 'curated-shoulders-male-2', name: 'Shoulder Power Press', duration: 50, difficulty: 'Advanced', muscle_groups: ['Shoulders'], gender: 'male', is_favorite: false, exercises: [
    { name: 'Standing Military Press', sets: 5, reps: '5', rest_seconds: 180, notes: '' },
    { name: 'Push Press', sets: 4, reps: '6-8', rest_seconds: 120, notes: '' },
    { name: 'Upright Rows', sets: 3, reps: '10', rest_seconds: 60, notes: '' },
    { name: 'Cable Lateral Raises', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
  ]},
  { id: 'curated-shoulders-male-3', name: 'Capped Delts', duration: 45, difficulty: 'Intermediate', muscle_groups: ['Shoulders'], gender: 'male', is_favorite: false, exercises: [
    { name: 'Arnold Press', sets: 4, reps: '10', rest_seconds: 90, notes: '' },
    { name: 'Cable Lateral Raises', sets: 4, reps: '12', rest_seconds: 45, notes: '' },
    { name: 'Bent Over Rear Delt Fly', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
    { name: 'Shrugs', sets: 4, reps: '12', rest_seconds: 60, notes: '' },
  ]},
  { id: 'curated-shoulders-male-4', name: 'Shoulder Starter', duration: 35, difficulty: 'Beginner', muscle_groups: ['Shoulders'], gender: 'male', is_favorite: false, exercises: [
    { name: 'Machine Shoulder Press', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
    { name: 'Dumbbell Lateral Raises', sets: 3, reps: '12', rest_seconds: 45, notes: '' },
    { name: 'Rear Delt Machine', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
  ]},
  { id: 'curated-shoulders-male-5', name: '3D Shoulder Workout', duration: 50, difficulty: 'Intermediate', muscle_groups: ['Shoulders'], gender: 'male', is_favorite: false, exercises: [
    { name: 'Dumbbell Shoulder Press', sets: 4, reps: '10', rest_seconds: 90, notes: '' },
    { name: 'Lu Raises', sets: 3, reps: '10', rest_seconds: 60, notes: '' },
    { name: 'Cable Face Pulls', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
    { name: 'Lateral Raises (Drop Set)', sets: 3, reps: '10-12-15', rest_seconds: 45, notes: '' },
    { name: 'Front Plate Raises', sets: 3, reps: '12', rest_seconds: 45, notes: '' },
  ]},

  // ─── MALE LEGS (5) ───
  { id: 'curated-legs-male-1', name: 'Leg Day Destroyer', duration: 55, difficulty: 'Intermediate', muscle_groups: ['Legs'], gender: 'male', is_favorite: false, exercises: [
    { name: 'Barbell Back Squats', sets: 4, reps: '8-10', rest_seconds: 120, notes: '' },
    { name: 'Romanian Deadlifts', sets: 4, reps: '10', rest_seconds: 90, notes: '' },
    { name: 'Leg Press', sets: 3, reps: '12', rest_seconds: 90, notes: '' },
    { name: 'Leg Curls', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
    { name: 'Calf Raises', sets: 4, reps: '15', rest_seconds: 30, notes: '' },
  ]},
  { id: 'curated-legs-male-2', name: 'Heavy Squat Day', duration: 60, difficulty: 'Advanced', muscle_groups: ['Legs'], gender: 'male', is_favorite: false, exercises: [
    { name: 'Heavy Barbell Squats', sets: 5, reps: '5', rest_seconds: 180, notes: '' },
    { name: 'Front Squats', sets: 4, reps: '8', rest_seconds: 120, notes: '' },
    { name: 'Walking Lunges', sets: 3, reps: '12 each', rest_seconds: 60, notes: '' },
    { name: 'Leg Extensions', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
  ]},
  { id: 'curated-legs-male-3', name: 'Quad Crusher', duration: 50, difficulty: 'Intermediate', muscle_groups: ['Legs'], gender: 'male', is_favorite: false, exercises: [
    { name: 'Hack Squats', sets: 4, reps: '10', rest_seconds: 90, notes: '' },
    { name: 'Sissy Squats', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
    { name: 'Leg Extensions', sets: 4, reps: '12', rest_seconds: 45, notes: '' },
    { name: 'Bulgarian Split Squats', sets: 3, reps: '10 each', rest_seconds: 60, notes: '' },
  ]},
  { id: 'curated-legs-male-4', name: 'Leg Day Basics', duration: 40, difficulty: 'Beginner', muscle_groups: ['Legs'], gender: 'male', is_favorite: false, exercises: [
    { name: 'Goblet Squats', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
    { name: 'Leg Press', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
    { name: 'Leg Curls', sets: 3, reps: '12', rest_seconds: 45, notes: '' },
    { name: 'Calf Raises', sets: 3, reps: '15', rest_seconds: 30, notes: '' },
  ]},
  { id: 'curated-legs-male-5', name: 'Hamstring & Glute Focus', duration: 50, difficulty: 'Intermediate', muscle_groups: ['Legs'], gender: 'male', is_favorite: false, exercises: [
    { name: 'Conventional Deadlifts', sets: 4, reps: '6-8', rest_seconds: 120, notes: '' },
    { name: 'Stiff Leg Deadlifts', sets: 3, reps: '10', rest_seconds: 90, notes: '' },
    { name: 'Lying Leg Curls', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
    { name: 'Hip Thrusts', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
    { name: 'Calf Raises', sets: 4, reps: '15', rest_seconds: 30, notes: '' },
  ]},

  // ─── MALE CORE (5) ───
  { id: 'curated-core-male-1', name: 'Six Pack Shredder', duration: 30, difficulty: 'Intermediate', muscle_groups: ['Core'], gender: 'male', is_favorite: false, exercises: [
    { name: 'Hanging Leg Raises', sets: 4, reps: '12', rest_seconds: 45, notes: '' },
    { name: 'Cable Crunches', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
    { name: 'Ab Wheel Rollouts', sets: 3, reps: '10', rest_seconds: 60, notes: '' },
    { name: 'Plank', sets: 3, reps: '45 sec', rest_seconds: 30, notes: '' },
  ]},
  { id: 'curated-core-male-2', name: 'Core Strength', duration: 25, difficulty: 'Beginner', muscle_groups: ['Core'], gender: 'male', is_favorite: false, exercises: [
    { name: 'Crunches', sets: 3, reps: '20', rest_seconds: 30, notes: '' },
    { name: 'Plank', sets: 3, reps: '30 sec', rest_seconds: 30, notes: '' },
    { name: 'Mountain Climbers', sets: 3, reps: '20', rest_seconds: 30, notes: '' },
    { name: 'Reverse Crunches', sets: 3, reps: '15', rest_seconds: 30, notes: '' },
  ]},
  { id: 'curated-core-male-3', name: 'Oblique Destroyer', duration: 30, difficulty: 'Intermediate', muscle_groups: ['Core'], gender: 'male', is_favorite: false, exercises: [
    { name: 'Woodchoppers', sets: 3, reps: '12 each', rest_seconds: 45, notes: '' },
    { name: 'Side Plank', sets: 3, reps: '30 sec each', rest_seconds: 30, notes: '' },
    { name: 'Russian Twists', sets: 3, reps: '20', rest_seconds: 30, notes: '' },
    { name: 'Pallof Press', sets: 3, reps: '12 each', rest_seconds: 45, notes: '' },
  ]},
  { id: 'curated-core-male-4', name: 'Hardcore Abs', duration: 35, difficulty: 'Advanced', muscle_groups: ['Core'], gender: 'male', is_favorite: false, exercises: [
    { name: 'Dragon Flags', sets: 4, reps: '8', rest_seconds: 60, notes: '' },
    { name: 'Hanging Windshield Wipers', sets: 3, reps: '8 each', rest_seconds: 60, notes: '' },
    { name: 'Weighted Decline Sit-Ups', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
    { name: 'L-Sit Hold', sets: 3, reps: '20 sec', rest_seconds: 45, notes: '' },
  ]},
  { id: 'curated-core-male-5', name: 'Functional Core', duration: 30, difficulty: 'Intermediate', muscle_groups: ['Core'], gender: 'male', is_favorite: false, exercises: [
    { name: 'Dead Bug', sets: 3, reps: '10 each', rest_seconds: 30, notes: '' },
    { name: 'Bird Dog', sets: 3, reps: '10 each', rest_seconds: 30, notes: '' },
    { name: 'Farmer\'s Walk', sets: 3, reps: '40 sec', rest_seconds: 60, notes: '' },
    { name: 'Plank Shoulder Taps', sets: 3, reps: '20', rest_seconds: 30, notes: '' },
  ]},

  // ─── MALE ARMS (5) ───
  { id: 'curated-arms-male-1', name: 'Arm Blaster', duration: 45, difficulty: 'Intermediate', muscle_groups: ['Arms'], gender: 'male', is_favorite: false, exercises: [
    { name: 'Barbell Curls', sets: 4, reps: '10', rest_seconds: 60, notes: '' },
    { name: 'Close Grip Bench Press', sets: 4, reps: '10', rest_seconds: 90, notes: '' },
    { name: 'Hammer Curls', sets: 3, reps: '12', rest_seconds: 45, notes: '' },
    { name: 'Skull Crushers', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
    { name: 'Cable Curls', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
  ]},
  { id: 'curated-arms-male-2', name: 'Big Arms Day', duration: 50, difficulty: 'Advanced', muscle_groups: ['Arms'], gender: 'male', is_favorite: false, exercises: [
    { name: 'Weighted Chin-Ups', sets: 4, reps: '6-8', rest_seconds: 90, notes: '' },
    { name: 'Weighted Dips', sets: 4, reps: '8', rest_seconds: 90, notes: '' },
    { name: 'Preacher Curls', sets: 3, reps: '10', rest_seconds: 60, notes: '' },
    { name: 'Overhead Tricep Extension', sets: 3, reps: '12', rest_seconds: 60, notes: '' },
    { name: 'Reverse Curls', sets: 3, reps: '12', rest_seconds: 45, notes: '' },
  ]},
  { id: 'curated-arms-male-3', name: 'Arm Pump Session', duration: 35, difficulty: 'Beginner', muscle_groups: ['Arms'], gender: 'male', is_favorite: false, exercises: [
    { name: 'Dumbbell Curls', sets: 3, reps: '12', rest_seconds: 45, notes: '' },
    { name: 'Tricep Pushdowns', sets: 3, reps: '12', rest_seconds: 45, notes: '' },
    { name: 'Hammer Curls', sets: 3, reps: '12', rest_seconds: 45, notes: '' },
    { name: 'Overhead Tricep Extension', sets: 3, reps: '12', rest_seconds: 45, notes: '' },
  ]},
  { id: 'curated-arms-male-4', name: 'Peak & Horseshoe', duration: 45, difficulty: 'Intermediate', muscle_groups: ['Arms'], gender: 'male', is_favorite: false, exercises: [
    { name: 'Incline Dumbbell Curls', sets: 4, reps: '10', rest_seconds: 60, notes: '' },
    { name: 'Dips', sets: 4, reps: '10', rest_seconds: 60, notes: '' },
    { name: 'Spider Curls', sets: 3, reps: '12', rest_seconds: 45, notes: '' },
    { name: 'Rope Pushdowns', sets: 3, reps: '15', rest_seconds: 45, notes: '' },
    { name: 'Wrist Curls', sets: 3, reps: '15', rest_seconds: 30, notes: '' },
  ]},
  { id: 'curated-arms-male-5', name: 'Superset Arms', duration: 40, difficulty: 'Intermediate', muscle_groups: ['Arms'], gender: 'male', is_favorite: false, exercises: [
    { name: 'EZ Bar Curls + Skull Crushers', sets: 4, reps: '10', rest_seconds: 60, notes: 'Superset' },
    { name: 'Hammer Curls + Rope Pushdowns', sets: 3, reps: '12', rest_seconds: 45, notes: 'Superset' },
    { name: 'Concentration Curls + Diamond Push-Ups', sets: 3, reps: '12', rest_seconds: 45, notes: 'Superset' },
  ]},
];

export const getCuratedWorkoutsByMuscleGroup = (muscleGroup, gender) => {
  const genderFilter = gender === 'male' ? 'male' : 'female';
  return CURATED_WORKOUTS.filter(
    (w) => w.muscle_groups.includes(muscleGroup) && w.gender === genderFilter
  );
};

export const getAllCuratedWorkouts = () => CURATED_WORKOUTS; 