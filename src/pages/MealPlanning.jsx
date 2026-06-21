import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Notification from '../components/Notification';
import { MealPlanningSkeleton } from '../components/ui/PageSkeleton';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useModal } from '../context/ModalContext';
import { format, startOfWeek, addDays } from 'date-fns';
import { Utensils, Plus, Calendar, Clock, CreditCard as Edit2, Trash2, X, Coffee, UtensilsCrossed, Moon, Apple, Flame, Search, SlidersHorizontal, ChevronLeft, ChevronDown, Users, ShoppingCart, Camera } from 'lucide-react';
import { CURATED_RECIPES, RECIPE_CATEGORIES } from '../data/curatedRecipes';
import CustomSelect from '../components/ui/CustomSelect';
import { getIconifyIconUrl } from '../services/iconifyService';
import TimePicker from '../components/ui/TimePicker';
import { useDebounce } from '../hooks/useDebounce';

const WEEK_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_ICONS = { breakfast: Coffee, lunch: UtensilsCrossed, dinner: Moon, snack: Apple };
const RECIPE_CATEGORY_ICONS = {
  'Breakfast':     'mdi:food-croissant',
  'Lunch':         'mdi:food',
  'Dinner':        'mdi:silverware-fork-knife',
  'Snacks':        'mdi:food-apple',
  'Desserts':      'mdi:cake-variant',
  'Drinks':        'mdi:coffee',
  'Healthy':       'mdi:leaf',
  'High-Protein':  'mdi:dumbbell',
  'Quick & Easy':  'mdi:flash',
  'Comfort Food':  'mdi:pot-mix',
  'Meal Prep':     'mdi:food-variant',
};
const SUPABASE_MEAL_BASE = 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/meal-photos';
const getWeeklyMealImage = (day, mealType) => `${SUPABASE_MEAL_BASE}/week-${day}-${mealType}.jpg`;
const EMPTY_FORM = { name: '', time: '', notes: '', ingredients: '' };
const EMPTY_RECIPE_FORM = { title: '', category: 'Breakfast', time: '', calories: '', servings: '1', difficulty: 'easy', ingredients: '', image_url: '' };

function todayDayName() {
  return format(new Date(), 'EEEE').toLowerCase();
}

function parseIngredients(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') return raw.split('\n').map(s => s.trim()).filter(Boolean);
  return [];
}

function ingredientsToText(raw) {
  if (Array.isArray(raw)) return raw.join('\n');
  if (typeof raw === 'string') return raw;
  return '';
}

export default function MealPlanning() {
  const navigate = useNavigate();
  const { openModal, closeModal } = useModal();
  const queryClient = useQueryClient();

  const [activeView, setActiveView] = useState('today');
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('breakfast');
  const [selectedDay, setSelectedDay] = useState(todayDayName());
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const [activeRecipeCategory, setActiveRecipeCategory] = useState('all');
  const [recipeSearch, setRecipeSearch] = useState('');
  const debouncedRecipeSearch = useDebounce(recipeSearch, 250);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const [showCreateRecipe, setShowCreateRecipe] = useState(false);
  const [recipeForm, setRecipeForm] = useState(EMPTY_RECIPE_FORM);
  const [uploadingRecipeImage, setUploadingRecipeImage] = useState(false);
  const [recipeImagePreview, setRecipeImagePreview] = useState(null);
  const recipeImageRef = useRef(null);

  const isModalOpen = showAddMeal || showCreateRecipe;
  useEffect(() => {
    if (isModalOpen) {
      openModal();
      return () => closeModal();
    }
  }, [isModalOpen, openModal, closeModal]);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  /* ── Auto-reset logic ── */
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayDay = format(new Date(), 'EEEE').toLowerCase();
    const weekStartStr = format(weekStart, 'yyyy-MM-dd');

    const lastDailyDate = localStorage.getItem('mealLastDailyDate');
    const lastWeeklyDate = localStorage.getItem('mealLastWeeklyDate');

    const doWeeklyReset = lastWeeklyDate !== weekStartStr;
    const doDailyReset = !doWeeklyReset && lastDailyDate !== today;

    if (!doWeeklyReset && !doDailyReset) return;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      if (doWeeklyReset) {
        supabase.from('meals').delete().eq('user_id', user.id).then(() => {
          queryClient.invalidateQueries({ queryKey: ['meals'] });
          localStorage.setItem('mealLastWeeklyDate', weekStartStr);
          localStorage.setItem('mealLastDailyDate', today);
        });
      } else if (doDailyReset) {
        supabase.from('meals').delete().eq('user_id', user.id).eq('day', todayDay).then(() => {
          queryClient.invalidateQueries({ queryKey: ['meals'] });
          localStorage.setItem('mealLastDailyDate', today);
        });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  /* ── Query: meals ── */
  const { data: meals = [], isLoading: mealsLoading } = useQuery({
    queryKey: ['meals'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  /* ── Query: custom recipes ── */
  const { data: customRecipes = [] } = useQuery({
    queryKey: ['custom_recipes'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('custom_recipes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  /* ── Mutations: meals ── */
  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingMeal) {
        const { data, error } = await supabase
          .from('meals')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', editingMeal.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase
          .from('meals')
          .insert({ ...payload, user_id: user.id })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      const wasEditing = !!editingMeal;
      closeDrawer();
      showNotification(wasEditing ? 'Meal updated' : 'Meal added');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('meals').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      showNotification('Meal removed');
    },
  });

  /* ── Mutations: custom recipes ── */
  const saveRecipeMutation = useMutation({
    mutationFn: async (payload) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('custom_recipes')
        .insert({ ...payload, user_id: user.id })
        .select()
        .single();
      if (error) {
        // If image_url column doesn't exist yet in DB, retry without it
        if (payload.image_url && (error.message?.includes('image_url') || error.code === 'PGRST204')) {
          const { image_url: _dropped, ...rest } = payload;
          const { data: data2, error: error2 } = await supabase
            .from('custom_recipes')
            .insert({ ...rest, user_id: user.id })
            .select()
            .single();
          if (error2) throw error2;
          return data2;
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom_recipes'] });
      setShowCreateRecipe(false);
      setRecipeForm(EMPTY_RECIPE_FORM);
      setRecipeImagePreview(null);
      showNotification('Recipe saved');
    },
  });

  const deleteRecipeMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('custom_recipes').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom_recipes'] });
      showNotification('Recipe removed');
    },
  });

  /* ── Helpers ── */
  const closeDrawer = useCallback(() => {
    setShowAddMeal(false);
    setEditingMeal(null);
    setFormData(EMPTY_FORM);
    setSelectedCategory('breakfast');
    setSelectedDay(todayDayName());
  }, []);

  const openAdd = useCallback((category = 'breakfast', day = null) => {
    setFormData(EMPTY_FORM);
    setEditingMeal(null);
    setSelectedCategory(category);
    setSelectedDay(day || todayDayName());
    setShowAddMeal(true);
  }, []);

  const openEdit = useCallback((meal) => {
    setEditingMeal(meal);
    setFormData({
      name: meal.name || '',
      time: meal.time || '',
      notes: meal.notes || '',
      ingredients: ingredientsToText(meal.ingredients),
    });
    setSelectedCategory(meal.category || 'breakfast');
    setSelectedDay(meal.day || todayDayName());
    setShowAddMeal(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!formData.name.trim()) return;
    saveMutation.mutate({
      name: formData.name.trim(),
      category: selectedCategory,
      time: formData.time,
      day: selectedDay,
      notes: formData.notes,
      ingredients: parseIngredients(formData.ingredients),
    });
  }, [formData, selectedCategory, selectedDay, saveMutation]);

  const handleRecipeImagePick = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show instant local preview — doesn't wait for upload
    const localUrl = URL.createObjectURL(file);
    setRecipeImagePreview(localUrl);
    setUploadingRecipeImage(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      // Convert HEIC/HEIF (iPhone) to a supported extension fallback
      const rawExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const ext = ['heic', 'heif'].includes(rawExt) ? 'jpg' : rawExt;
      const path = `${user.id}/recipe_${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from('public_user_pfp')
        .upload(path, file, { upsert: false, contentType: file.type || 'image/jpeg' });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('public_user_pfp').getPublicUrl(path);
      setRecipeForm(prev => ({ ...prev, image_url: publicUrl }));
    } catch (err) {
      setNotification({ message: 'Photo upload failed — recipe will be saved without image.', type: 'error' });
      // Keep local preview so user sees their selection, but clear the URL so save works without it
      setRecipeForm(prev => ({ ...prev, image_url: '' }));
    } finally {
      setUploadingRecipeImage(false);
      if (recipeImageRef.current) recipeImageRef.current.value = '';
    }
  }, []);

  const handleSaveRecipe = useCallback(() => {
    if (!recipeForm.title.trim()) return;
    saveRecipeMutation.mutate({
      title: recipeForm.title.trim(),
      category: recipeForm.category,
      time: recipeForm.time.trim(),
      calories: parseInt(recipeForm.calories, 10) || 0,
      servings: parseInt(recipeForm.servings, 10) || 1,
      difficulty: recipeForm.difficulty,
      ingredients: parseIngredients(recipeForm.ingredients),
      image_url: recipeForm.image_url || null,
    });
  }, [recipeForm, saveRecipeMutation]);

  const handleAddRecipeToMealPlan = useCallback((recipe) => {
    const categoryMap = { Breakfast: 'breakfast', Lunch: 'lunch', Dinner: 'dinner', Snacks: 'snack' };
    setFormData({
      name: recipe.title,
      time: '',
      notes: '',
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.join('\n') : '',
    });
    setEditingMeal(null);
    setSelectedCategory(categoryMap[recipe.category] || 'breakfast');
    setSelectedDay(todayDayName());
    setShowAddMeal(true);
  }, []);

  const handleAddRecipeToGrocery = useCallback(async (recipe) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const rows = (Array.isArray(recipe.ingredients) ? recipe.ingredients : []).map(ing => ({
        name: ing, category: 'recipe', is_completed: false, user_id: user.id, notes: `From: ${recipe.title}`,
      }));
      const { error } = await supabase.from('grocery_items').insert(rows);
      if (error) throw error;
      showNotification('Ingredients added to Grocery');
    } catch {
      showNotification('Failed to add ingredients');
    }
  }, []);

  const handleAddMealToGrocery = useCallback(async (meal) => {
    try {
      const ingredients = parseIngredients(meal.ingredients);
      if (!ingredients.length) { showNotification('No ingredients to add'); return; }
      const { data: { user } } = await supabase.auth.getUser();
      const rows = ingredients.map(ing => ({
        name: ing, category: 'meal-plan', is_completed: false, user_id: user.id, notes: `From: ${meal.name}`,
      }));
      const { error } = await supabase.from('grocery_items').insert(rows);
      if (error) throw error;
      showNotification('Ingredients added to Grocery');
    } catch {
      showNotification('Failed to add ingredients');
    }
  }, []);

  /* ── Derived data ── */
  const currentDay = todayDayName();

  const getMealsForDayAndCategory = (day, category) =>
    meals.filter(m => m.day === day && m.category === category);

  const getMealForDayAndCategory = (day, category) =>
    meals.find(m => m.day === day && m.category === category);

  const filteredRecipes = useMemo(() => {
    const normalizedCustomRecipes = customRecipes.map(r => ({ ...r, is_custom: true }));
    const allRecipes = [...normalizedCustomRecipes, ...CURATED_RECIPES];
    return allRecipes.filter(r => {
      const matchCat = activeRecipeCategory === 'all' || r.category === activeRecipeCategory;
      const matchSearch = !debouncedRecipeSearch || r.title.toLowerCase().includes(debouncedRecipeSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [customRecipes, activeRecipeCategory, debouncedRecipeSearch]);

  const DIFFICULTY_COLORS = { easy: 'text-emerald-400', medium: 'text-amber-400' };

  const recipeCategoryOptions = RECIPE_CATEGORIES
    .filter(c => c.id !== 'all')
    .map(c => ({ value: c.label, label: c.label }));

  return (
    <div className="min-h-full pb-8 bg-[#000000]">
      <Notification
        message={notification}
        show={!!notification}
        onClose={() => setNotification(null)}
      />

      <div className="relative border-b-2 border-[rgba(201,169,98,0.25)] page-safe-x py-6">
        <button onClick={() => navigate(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity">
          <ChevronLeft className="w-6 h-6 text-[#C9A962]" strokeWidth={1.5} />
        </button>
        <div className="w-full text-center">
          <h1 className="text-3xl text-[#C9A962] font-light tracking-wide">Meal Planning</h1>
        </div>
      </div>

      {mealsLoading ? <MealPlanningSkeleton /> : <div className="page-safe-x pt-4 space-y-6">
        {/* Tab bar */}
        <div className="w-full flex gap-2">
          {[{ id: 'today', label: 'Today' }, { id: 'week', label: 'Weekly Plan' }, { id: 'recipes', label: 'Recipes' }].map(tab => (
            <button key={tab.id} onClick={() => setActiveView(tab.id)}
              className={`flex-1 text-xs font-light py-2.5 rounded-xl transition-all ${
                activeView === tab.id
                  ? 'bg-gradient-to-br from-[#e2ba8b] to-[#C9A962] text-white shadow-sm'
                  : 'text-[#e2ba8b] border border-[rgba(201,169,98,0.3)]'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* TODAY VIEW */}
        {activeView === 'today' && (
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-[#e2ba8b]" strokeWidth={1.5} />
                <h3 className="font-serif text-2xl font-light text-[#e2ba8b] tracking-tight">Today's Meals</h3>
              </div>
              <div className="h-[1px] w-16 bg-[#e2ba8b]/40" />
            </div>
            <div className="space-y-3">
              {MEAL_TYPES.map(type => {
                const meal = getMealForDayAndCategory(currentDay, type);
                const MealIcon = MEAL_ICONS[type] || Utensils;
                return (
                  <div key={type} className="card-luxury p-0 overflow-hidden">
                    <div className="flex items-stretch">
                      <div className="flex-shrink-0 w-[clamp(100px,28vw,130px)] overflow-hidden">
                        <img src={getWeeklyMealImage(currentDay, type)} alt={type} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="flex-1 flex items-start justify-between p-4">
                        <div className="flex-1">
                          <div className="text-[9px] text-[#C9A962] uppercase font-light tracking-[0.15em] mb-2">{type}</div>
                          <div className="font-light text-[#F5F1E8] text-base mb-1">{meal?.name || 'Not planned'}</div>
                          {meal?.time && (
                            <div className="flex items-center gap-1.5 text-xs text-[#B8B8B8] font-light mb-1">
                              <Clock className="w-3 h-3" strokeWidth={1.5} />{(() => { const [h, m] = meal.time.split(':'); const hr = parseInt(h, 10); return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`; })()}
                            </div>
                          )}
                          {meal?.notes && <div className="text-xs text-[#B8B8B8] font-light italic mt-2">{meal.notes}</div>}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {meal ? (
                            <>
                              {parseIngredients(meal.ingredients).length > 0 && (
                                <button onClick={() => handleAddMealToGrocery(meal)} className="p-2 rounded-lg hover:bg-[#e2ba8b]/10 transition-colors">
                                  <ShoppingCart className="w-4 h-4 text-[#e2ba8b]" strokeWidth={1.5} />
                                </button>
                              )}
                              <button onClick={() => openEdit(meal)} className="p-2 rounded-lg hover:bg-[#e2ba8b]/10 transition-colors">
                                <Edit2 className="w-4 h-4 text-[#e2ba8b]" strokeWidth={1.5} />
                              </button>
                              <button onClick={() => deleteMutation.mutate(meal.id)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors">
                                <Trash2 className="w-4 h-4 text-red-400" strokeWidth={1.5} />
                              </button>
                            </>
                          ) : (
                            <button onClick={() => openAdd(type, currentDay)}
                              className="px-4 py-2 rounded-xl bg-gradient-to-br from-[#e2ba8b] to-[#C9A962] text-white text-xs font-light shadow-lg flex items-center gap-2">
                              <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />Add
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* WEEKLY VIEW */}
        {activeView === 'week' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif text-2xl font-light text-[#e2ba8b] tracking-tight mb-2">This Week</h3>
                <div className="h-[1px] w-16 bg-[#e2ba8b]/40" />
              </div>
            </div>
            <div className="space-y-4">
              {WEEK_DAYS.map((day, idx) => {
                const dayDate = addDays(weekStart, idx);
                return (
                  <div key={day} className="card-luxury p-5">
                    <div className="font-light text-[#e2ba8b] mb-4 capitalize">{day} • {format(dayDate, 'MMM d')}</div>
                    <div className="space-y-3">
                      {MEAL_TYPES.map(type => {
                        const meal = getMealForDayAndCategory(day, type);
                        return (
                          <div key={type} className="flex items-center gap-3 text-sm py-2 border-b border-[#e2ba8b]/5 last:border-0">
                            <div className="flex-shrink-0 w-[clamp(80px,22vw,110px)] h-[clamp(50px,14vw,70px)] rounded-lg overflow-hidden">
                              <img src={getWeeklyMealImage(day, type)} alt={type} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                            <div className="w-20 text-[9px] text-[#C9A962] uppercase tracking-wider font-light">{type}</div>
                            <div className="flex-1 text-[#F5F1E8] font-light truncate">{meal?.name || '—'}</div>
                            {meal ? (
                              <div className="flex gap-1 flex-shrink-0">
                                {parseIngredients(meal.ingredients).length > 0 && (
                                  <button onClick={() => handleAddMealToGrocery(meal)} className="p-1.5 rounded-lg hover:bg-[#e2ba8b]/10 transition-colors">
                                    <ShoppingCart className="w-3.5 h-3.5 text-[#e2ba8b]" strokeWidth={1.5} />
                                  </button>
                                )}
                                <button onClick={() => openEdit(meal)} className="p-1.5 rounded-lg hover:bg-[#e2ba8b]/10 transition-colors">
                                  <Edit2 className="w-3.5 h-3.5 text-[#e2ba8b]" strokeWidth={1.5} />
                                </button>
                                <button onClick={() => deleteMutation.mutate(meal.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                                  <Trash2 className="w-3.5 h-3.5 text-red-400" strokeWidth={1.5} />
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => openAdd(type, day)} className="text-xs text-[#e2ba8b] font-light px-2 py-1 rounded-lg hover:bg-[#e2ba8b]/10 transition-colors flex-shrink-0">
                                + Add
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* RECIPES VIEW */}
        {activeView === 'recipes' && (
          <div className="pb-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-2xl font-light text-[#e2ba8b] tracking-tight">Recipes</h3>
              <button
                onClick={() => { setRecipeForm(EMPTY_RECIPE_FORM); setRecipeImagePreview(null); setShowCreateRecipe(true); }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-light text-[#C9A962] border border-[rgba(201,169,98,0.4)] hover:bg-[#C9A962]/10 transition-all active:scale-95">
                <Plus className="w-3.5 h-3.5" strokeWidth={2} />Create Recipe
              </button>
            </div>
            <div className="relative mb-5">
              <div className="flex items-center gap-3 px-4 rounded-xl h-11" style={{ backgroundColor: '#000000', border: '1px solid rgba(201,169,98,0.30)' }}>
                <Search className="w-4 h-4 text-[#C9A962] flex-shrink-0" strokeWidth={1.5} />
                <input type="text" placeholder="Search recipes..." value={recipeSearch}
                  onChange={e => setRecipeSearch(e.target.value)}
                  className="flex-1 bg-transparent focus:outline-none text-sm font-light"
                  style={{ color: '#F5F1E8' }} />
                <button onClick={() => setShowFilterDropdown(v => !v)} className="flex-shrink-0">
                  <SlidersHorizontal className="w-4 h-4 transition-colors"
                    style={{ color: activeRecipeCategory !== 'all' ? '#C9A962' : 'rgba(201,169,98,0.5)' }}
                    strokeWidth={1.5} />
                </button>
              </div>
              {showFilterDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowFilterDropdown(false)} />
                  <div className="absolute left-0 right-0 top-13 z-20 rounded-xl overflow-hidden mt-2 py-1"
                    style={{ backgroundColor: '#1E1E1E', border: '1px solid rgba(201,169,98,0.25)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                    {RECIPE_CATEGORIES.map(cat => (
                      <button key={cat.id} onClick={() => { setActiveRecipeCategory(cat.id); setShowFilterDropdown(false); }}
                        className="w-full px-4 py-2.5 text-left text-sm font-light transition-colors flex items-center justify-between"
                        style={{ color: activeRecipeCategory === cat.id ? '#C9A962' : '#B8B8B8', backgroundColor: activeRecipeCategory === cat.id ? 'rgba(201,169,98,0.08)' : 'transparent' }}>
                        <span>{cat.label}</span>
                        {activeRecipeCategory === cat.id && <span className="w-1.5 h-1.5 rounded-full bg-[#C9A962]" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="space-y-3">
              {filteredRecipes.length === 0 ? (
                <div className="text-center py-12 text-[#B8B8B8] font-light text-sm">No recipes in this category.</div>
              ) : (
                filteredRecipes.map(recipe => (
                  <RecipeCard key={recipe.id} recipe={recipe}
                    onAddToMealPlan={handleAddRecipeToMealPlan}
                    onAddToGrocery={handleAddRecipeToGrocery}
                    onDelete={recipe.is_custom ? () => deleteRecipeMutation.mutate(recipe.id) : undefined}
                    difficultyColors={DIFFICULTY_COLORS} />
                ))
              )}
            </div>
          </div>
        )}
      </div>}

      {/* Add / Edit Meal Drawer */}
      {showAddMeal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={closeDrawer} />
          <div className="fixed bottom-0 left-0 right-0 bg-[#000000] border-t-2 border-[rgba(201,169,98,0.3)] rounded-t-3xl z-50 max-h-[80dvh] overflow-y-auto scrollbar-hide">
            <div className="p-6" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}>
              <button onClick={closeDrawer} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#e2ba8b]/10 transition-colors">
                <X className="w-5 h-5 text-[#e2ba8b]" strokeWidth={1.5} />
              </button>
              <h2 className="font-serif text-2xl font-light text-[#e2ba8b] mb-1">{editingMeal ? 'Edit Meal' : 'Add Meal'}</h2>
              <p className="text-xs text-[#B8B8B8] font-light mb-6 tracking-widest uppercase">Plan with intention</p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[#e2ba8b]/70 font-light uppercase tracking-wider mb-2 block">Meal Name</label>
                  <input placeholder="e.g., Grilled Salmon with Vegetables"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none text-sm font-light"
                    style={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(226,186,139,0.2)', color: '#F5F1E8' }} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#e2ba8b]/70 font-light uppercase tracking-wider mb-2 block">Category</label>
                    <CustomSelect
                      value={selectedCategory}
                      onChange={(val) => setSelectedCategory(val)}
                      options={[
                        { value: 'breakfast', label: 'Breakfast' },
                        { value: 'lunch', label: 'Lunch' },
                        { value: 'dinner', label: 'Dinner' },
                        { value: 'snack', label: 'Snack' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#e2ba8b]/70 font-light uppercase tracking-wider mb-2 block">Time (Optional)</label>
                    <TimePicker
                      value={formData.time}
                      onChange={(val) => setFormData({ ...formData, time: val })}
                      placeholder="Optional time"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#e2ba8b]/70 font-light uppercase tracking-wider mb-2 block">Day</label>
                  <CustomSelect
                    value={selectedDay}
                    onChange={(val) => setSelectedDay(val)}
                    options={WEEK_DAYS.map(d => ({ value: d, label: d.charAt(0).toUpperCase() + d.slice(1) }))}
                  />
                </div>

                <div>
                  <label className="text-xs text-[#e2ba8b]/70 font-light uppercase tracking-wider mb-2 block">Notes (Optional)</label>
                  <textarea placeholder="Add special instructions or dietary notes..."
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none resize-none text-sm font-light"
                    style={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(226,186,139,0.2)', color: '#F5F1E8' }} />
                </div>

                <div>
                  <label className="text-xs text-[#e2ba8b]/70 font-light uppercase tracking-wider mb-2 block">Ingredients (Optional)</label>
                  <textarea
                    placeholder={'One ingredient per line\ne.g.,\n2 salmon fillets\n1 cup broccoli\nolive oil'}
                    value={formData.ingredients}
                    onChange={e => setFormData({ ...formData, ingredients: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none resize-none text-xs font-mono"
                    style={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(226,186,139,0.2)', color: '#F5F1E8' }} />
                </div>

                <div className="pt-2">
                  <button onClick={handleSave}
                    disabled={!formData.name.trim() || saveMutation.isPending}
                    className="w-full px-6 py-3 rounded-xl bg-gradient-to-br from-[#e2ba8b] to-[#C9A962] text-white font-light shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                    {saveMutation.isPending ? 'Saving...' : editingMeal ? 'Update Meal' : 'Save Meal'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create Recipe Drawer */}
      {showCreateRecipe && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => { setShowCreateRecipe(false); setRecipeImagePreview(null); }} />
          <div className="fixed bottom-0 left-0 right-0 bg-[#000000] border-t-2 border-[rgba(201,169,98,0.3)] rounded-t-3xl z-50 max-h-[85dvh] overflow-y-auto scrollbar-hide">
            <div className="p-6" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}>
              <button onClick={() => { setShowCreateRecipe(false); setRecipeImagePreview(null); }} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#e2ba8b]/10 transition-colors">
                <X className="w-5 h-5 text-[#e2ba8b]" strokeWidth={1.5} />
              </button>
              <h2 className="font-serif text-2xl font-light text-[#e2ba8b] mb-1">Create Recipe</h2>
              <p className="text-xs text-[#B8B8B8] font-light mb-6 tracking-widest uppercase">Save your favourite dishes</p>

              <div className="space-y-4">
                {/* Photo upload */}
                <div>
                  <label className="text-xs text-[#e2ba8b]/70 font-light uppercase tracking-wider mb-2 block">Photo (Optional)</label>
                  <input
                    ref={recipeImageRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleRecipeImagePick}
                  />
                  <button
                    type="button"
                    onClick={() => recipeImageRef.current?.click()}
                    disabled={uploadingRecipeImage}
                    className="w-full rounded-xl overflow-hidden transition-opacity active:opacity-70 disabled:opacity-50"
                    style={{ border: '1px dashed rgba(226,186,139,0.35)', minHeight: 96 }}
                  >
                    {(recipeImagePreview || recipeForm.image_url) ? (
                      <div className="relative w-full h-24">
                        <img src={recipeImagePreview || recipeForm.image_url} alt="Recipe" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          {uploadingRecipeImage ? (
                            <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Camera className="w-5 h-5 text-white" strokeWidth={1.5} />
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 py-6">
                        {uploadingRecipeImage ? (
                          <span className="w-5 h-5 border-2 border-[#C9A962]/40 border-t-[#C9A962] rounded-full animate-spin" />
                        ) : (
                          <Camera className="w-6 h-6 text-[#e2ba8b]/50" strokeWidth={1.5} />
                        )}
                        <span className="text-xs text-[#e2ba8b]/50 font-light">
                          {uploadingRecipeImage ? 'Uploading…' : 'Tap to add a photo'}
                        </span>
                      </div>
                    )}
                  </button>
                  {(recipeImagePreview || recipeForm.image_url) && (
                    <button
                      type="button"
                      onClick={() => { setRecipeForm(prev => ({ ...prev, image_url: '' })); setRecipeImagePreview(null); }}
                      className="mt-1.5 text-xs text-red-400/70 hover:text-red-400 transition-colors"
                    >
                      Remove photo
                    </button>
                  )}
                </div>

                <div>
                  <label className="text-xs text-[#e2ba8b]/70 font-light uppercase tracking-wider mb-2 block">Recipe Name</label>
                  <input
                    placeholder="e.g., Creamy Tuscan Pasta"
                    value={recipeForm.title}
                    onChange={e => setRecipeForm({ ...recipeForm, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none text-sm font-light"
                    style={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(226,186,139,0.2)', color: '#F5F1E8' }} />
                </div>

                <div>
                  <label className="text-xs text-[#e2ba8b]/70 font-light uppercase tracking-wider mb-2 block">Category</label>
                  <CustomSelect
                    value={recipeForm.category}
                    onChange={(val) => setRecipeForm({ ...recipeForm, category: val })}
                    options={recipeCategoryOptions}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#e2ba8b]/70 font-light uppercase tracking-wider mb-2 block">Prep Time</label>
                    <input
                      placeholder="e.g., 30 min"
                      value={recipeForm.time}
                      onChange={e => setRecipeForm({ ...recipeForm, time: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl focus:outline-none text-sm font-light"
                      style={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(226,186,139,0.2)', color: '#F5F1E8' }} />
                  </div>
                  <div>
                    <label className="text-xs text-[#e2ba8b]/70 font-light uppercase tracking-wider mb-2 block">Calories</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g., 450"
                      value={recipeForm.calories}
                      onChange={e => setRecipeForm({ ...recipeForm, calories: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl focus:outline-none text-sm font-light"
                      style={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(226,186,139,0.2)', color: '#F5F1E8' }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#e2ba8b]/70 font-light uppercase tracking-wider mb-2 block">Servings</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g., 2"
                      value={recipeForm.servings}
                      onChange={e => setRecipeForm({ ...recipeForm, servings: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl focus:outline-none text-sm font-light"
                      style={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(226,186,139,0.2)', color: '#F5F1E8' }} />
                  </div>
                  <div>
                    <label className="text-xs text-[#e2ba8b]/70 font-light uppercase tracking-wider mb-2 block">Difficulty</label>
                    <CustomSelect
                      value={recipeForm.difficulty}
                      onChange={(val) => setRecipeForm({ ...recipeForm, difficulty: val })}
                      options={[
                        { value: 'easy', label: 'Easy' },
                        { value: 'medium', label: 'Medium' },
                      ]}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#e2ba8b]/70 font-light uppercase tracking-wider mb-2 block">Ingredients</label>
                  <textarea
                    placeholder={'One ingredient per line\ne.g.,\n200g pasta\n1 cup cream\n2 cloves garlic'}
                    value={recipeForm.ingredients}
                    onChange={e => setRecipeForm({ ...recipeForm, ingredients: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none resize-none text-xs font-mono"
                    style={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(226,186,139,0.2)', color: '#F5F1E8' }} />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveRecipe}
                    disabled={!recipeForm.title.trim() || saveRecipeMutation.isPending}
                    className="w-full px-6 py-3 rounded-xl bg-gradient-to-br from-[#e2ba8b] to-[#C9A962] text-white font-light shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                    {saveRecipeMutation.isPending ? 'Saving...' : 'Save Recipe'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function RecipeCard({ recipe, onAddToMealPlan, onAddToGrocery, onDelete, difficultyColors }) {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const visible = recipe.ingredients.slice(0, 4);
  const extra = recipe.ingredients.length - 4;
  const hasInstructions = recipe.instructions && recipe.instructions.length > 0;
  const categoryIcon = RECIPE_CATEGORY_ICONS[recipe.category] || 'mdi:silverware-variant';
  // Curated recipes have ids like cr-1 through cr-192
  const recipeNum = recipe.id?.startsWith('cr-') ? recipe.id.replace('cr-', '') : null;
  const hasCuratedPhoto = recipeNum && parseInt(recipeNum) <= 192;
  const curatedPhotoUrl = hasCuratedPhoto ? `https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/meal-photos/cr-${recipeNum}.jpg` : null;
  // Custom recipes may have an uploaded image_url
  const customPhotoUrl = recipe.is_custom && recipe.image_url ? recipe.image_url : null;
  const photoUrl = customPhotoUrl || curatedPhotoUrl;
  const showPhoto = photoUrl && !imgError;
  const showCreatedByYou = recipe.is_custom && !customPhotoUrl;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#000000', border: '1px solid rgba(201,169,98,0.25)' }}>
      <div className="flex items-stretch">
        {/* Photo/Icon panel */}
        <div className="flex-shrink-0 flex items-center justify-center overflow-hidden"
          style={{
            width: 'clamp(76px, 22vw, 96px)',
            background: 'linear-gradient(135deg, rgba(201,169,98,0.15) 0%, rgba(201,169,98,0.05) 100%)',
          }}>
          {showPhoto ? (
            <img
              src={photoUrl}
              alt={recipe.title}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
            />
          ) : showCreatedByYou ? (
            <div className="flex flex-col items-center justify-center gap-1.5 px-2 py-3 text-center">
              <Camera className="w-5 h-5 text-[#C9A962]/60" strokeWidth={1.5} />
              <span className="text-[9px] text-[#C9A962]/50 font-light leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Created<br />by You
              </span>
            </div>
          ) : (
            <img
              src={getIconifyIconUrl(categoryIcon, 'c9a962')}
              alt=""
              className="w-9 h-9"
              loading="eager"
              decoding="async"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
        </div>
        {/* Content */}
        <div className="flex-1 min-w-0 p-4">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full text-left"
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <h4 className="font-light text-[#F5F1E8] text-sm leading-snug flex-1">{recipe.title}</h4>
          <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
            <span className={`text-[10px] font-light capitalize ${difficultyColors[recipe.difficulty] || 'text-[#B8B8B8]'}`}>{recipe.difficulty}</span>
            {onDelete && (
              <button onClick={e => { e.stopPropagation(); onDelete(); }} className="p-1 rounded-lg hover:bg-red-500/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5 text-red-400" strokeWidth={1.5} />
              </button>
            )}
            <ChevronDown
              className={`w-4 h-4 text-[#C9A962] transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
              strokeWidth={1.5}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <div className="flex items-center gap-1 text-[11px] text-[#B8B8B8] font-light"><Flame className="w-3 h-3 text-[#e2ba8b]" strokeWidth={1.5} />{recipe.calories} cal</div>
          <div className="flex items-center gap-1 text-[11px] text-[#B8B8B8] font-light"><Clock className="w-3 h-3 text-[#e2ba8b]" strokeWidth={1.5} />{recipe.time}</div>
          <div className="flex items-center gap-1 text-[11px] text-[#B8B8B8] font-light"><Users className="w-3 h-3 text-[#e2ba8b]" strokeWidth={1.5} />{recipe.servings}</div>
        </div>
        {!expanded && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {visible.map((ing, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full text-[10px] font-light text-[#B8B8B8] border border-[rgba(226,186,139,0.12)] bg-[rgba(226,186,139,0.04)]">{ing}</span>
            ))}
            {extra > 0 && <span className="px-2.5 py-1 rounded-full text-[10px] font-light text-[#e2ba8b]/60 border border-[rgba(201,169,98,0.2)]">+{extra} more</span>}
          </div>
        )}
      </button>

      {expanded && (
        <div className="mb-4">
          <div className="border-t border-[rgba(201,169,98,0.15)] pt-4 mb-4">
            <p className="text-[10px] uppercase tracking-widest text-[#C9A962] font-light mb-3">Ingredients</p>
            <ul className="space-y-1.5">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-2 text-xs font-light text-[#B8B8B8]">
                  <span className="w-1 h-1 rounded-full bg-[#C9A962] flex-shrink-0 mt-1.5"></span>
                  {ing}
                </li>
              ))}
            </ul>
          </div>
          {recipe.instructions && recipe.instructions.length > 0 && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(201, 169, 98, 0.2)' }}>
              <h4 style={{ color: '#C9A962', fontSize: '14px', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase' }}>
                Instructions
              </h4>
              <ol style={{ paddingLeft: '20px', margin: 0 }}>
                {recipe.instructions.map((step, idx) => (
                  <li key={idx} style={{ marginBottom: '8px', lineHeight: '1.6', color: '#E0E0E0' }}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={() => onAddToMealPlan(recipe)}
          className="flex-1 py-2 rounded-xl bg-gradient-to-br from-[#e2ba8b] to-[#C9A962] text-white text-[11px] font-light tracking-wide shadow hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5">
          <Plus className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />Meal Plan
        </button>
        <button onClick={() => onAddToGrocery(recipe)}
          className="flex-1 py-2 rounded-xl bg-gradient-to-br from-[#e2ba8b] to-[#C9A962] text-white text-[11px] font-light tracking-wide shadow hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5">
          <Plus className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />Grocery
        </button>
      </div>
        </div>{/* end content */}
      </div>{/* end flex row */}
    </div>
  );
}
