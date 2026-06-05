const storage = {
  get: (key) => JSON.parse(localStorage.getItem(key) || '[]'),
  set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
  getSingle: (key) => JSON.parse(localStorage.getItem(key) || 'null')
};

const createEntity = (storageKey) => ({
  list: async () => storage.get(storageKey),
  
  create: async (data) => {
    const items = storage.get(storageKey);
    const newItem = { 
      ...data, 
      id: Date.now(),
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString()
    };
    storage.set(storageKey, [...items, newItem]);
    return newItem;
  },
  
  update: async (id, data) => {
    const items = storage.get(storageKey);
    const updated = items.map(item => 
      item.id === id 
        ? { ...item, ...data, updated_date: new Date().toISOString() } 
        : item
    );
    storage.set(storageKey, updated);
    const updatedItem = updated.find(item => item.id === id);
    return updatedItem;
  },
  
  delete: async (id) => {
    const items = storage.get(storageKey).filter(item => item.id !== id);
    storage.set(storageKey, items);
    return { id };
  }
});

export const mockClient = {
  auth: {
    me: async () => ({ 
      id: 1, 
      name: storage.getSingle('userName') || 'User',
      email: 'user@aalifestyle.com' 
    })
  },
  
  entities: {
    Task: createEntity('tasks'),
    Event: createEntity('events'),
    Habit: createEntity('habits'),
    SleepEntry: createEntity('sleepEntries'),
    Birthday: createEntity('birthdays'),
    Note: createEntity('notes'),
    GroceryItem: createEntity('groceryItems'),
    ContentIdea: createEntity('contentIdeas'),
    Workout: createEntity('workouts'),
    WorkoutExercise: createEntity('workoutExercises'),
    WorkoutLog: createEntity('workoutLogs'),
    UserPreferences: {
      list: async () => {
        const prefs = storage.getSingle('userPrefs');
        return prefs ? [prefs] : [{
          uses24HourTime: false,
          isStudent: false,
          theme: 'gold'
        }];
      },
      update: async (id, data) => {
        storage.set('userPrefs', data);
        return data;
      }
    }
  }
};

export const base44 = mockClient;