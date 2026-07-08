import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Dumbbell, Plus, CreditCard as Edit2, Trash2, Star, Clock, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import WorkoutFormModal from '../components/fitness/WorkoutFormModal';
import WorkoutViewModal from '../components/fitness/WorkoutViewModal';
import { MUSCLE_GROUPS_MALE, MUSCLE_GROUPS_FEMALE, getCuratedWorkoutsByMuscleGroup } from '../data/curatedWorkouts';
import { useAuth } from '../context/AuthContext';
import { FitnessSkeleton } from '../components/ui/PageSkeleton';

export default function Fitness() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userProfile } = useAuth();

  const isMale = userProfile?.gender?.toLowerCase() === 'male';
  const MUSCLE_GROUPS = isMale ? MUSCLE_GROUPS_MALE : MUSCLE_GROUPS_FEMALE;

  const [activeTab, setActiveTab] = useState('library');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('Back');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const { data: workouts = [], isLoading: workoutsLoading } = useQuery({
    queryKey: ['workouts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select('*, exercises:workout_exercises(*)')
        .order('is_favorite', { ascending: false })
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const createWorkoutMutation = useMutation({
    mutationFn: async (workoutData) => {
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert([{ user_id: user.id, name: workoutData.name, duration: workoutData.duration, difficulty: workoutData.difficulty, muscle_groups: workoutData.muscle_groups, is_favorite: workoutData.is_favorite }])
        .select().single();
      if (workoutError) throw workoutError;
      if (workoutData.exercises.length > 0) {
        const exercises = workoutData.exercises.map((ex, index) => ({ workout_id: workout.id, name: ex.name, sets: ex.sets, reps: ex.reps, rest_seconds: ex.rest_seconds, notes: ex.notes || null, order_index: index }));
        const { error: exercisesError } = await supabase.from('workout_exercises').insert(exercises);
        if (exercisesError) throw exercisesError;
      }
      return workout;
    },
    onSuccess: () => { queryClient.invalidateQueries(['workouts']); setShowFormModal(false); setSelectedWorkout(null); }
  });

  const updateWorkoutMutation = useMutation({
    mutationFn: async ({ id, workoutData }) => {
      const { error: workoutError } = await supabase.from('workouts').update({ name: workoutData.name, duration: workoutData.duration, difficulty: workoutData.difficulty, muscle_groups: workoutData.muscle_groups, is_favorite: workoutData.is_favorite, updated_at: new Date().toISOString() }).eq('id', id);
      if (workoutError) throw workoutError;
      const { error: deleteError } = await supabase.from('workout_exercises').delete().eq('workout_id', id);
      if (deleteError) throw deleteError;
      if (workoutData.exercises.length > 0) {
        const exercises = workoutData.exercises.map((ex, index) => ({ workout_id: id, name: ex.name, sets: ex.sets, reps: ex.reps, rest_seconds: ex.rest_seconds, notes: ex.notes || null, order_index: index }));
        const { error: exercisesError } = await supabase.from('workout_exercises').insert(exercises);
        if (exercisesError) throw exercisesError;
      }
      return id;
    },
    onSuccess: () => { queryClient.invalidateQueries(['workouts']); setShowFormModal(false); setSelectedWorkout(null); setEditMode(false); }
  });

  const deleteWorkoutMutation = useMutation({
    mutationFn: async (workoutId) => {
      const { error } = await supabase.from('workouts').delete().eq('id', workoutId);
      if (error) throw error;
      return workoutId;
    },
    onSuccess: () => { queryClient.invalidateQueries(['workouts']); setShowViewModal(false); setSelectedWorkout(null); }
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }) => {
      const { error } = await supabase.from('workouts').update({ is_favorite: !isFavorite }).eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => { queryClient.invalidateQueries(['workouts']); }
  });

  const handleCreateWorkout = useCallback(() => { setSelectedWorkout(null); setEditMode(false); setShowFormModal(true); }, []);
  const handleEditWorkout = useCallback((workout) => { setSelectedWorkout(workout); setEditMode(true); setShowViewModal(false); setShowFormModal(true); }, []);
  const handleViewWorkout = useCallback((workout, isCurated = false) => { setSelectedWorkout({ ...workout, isCurated }); setShowViewModal(true); }, []);
  const handleDuplicateWorkout = useCallback((workout) => { setSelectedWorkout({ ...workout, name: `${workout.name} (Copy)`, id: null }); setEditMode(false); setShowViewModal(false); setShowFormModal(true); }, []);
  const handleSaveWorkout = useCallback((workoutData) => { if (editMode && selectedWorkout) { updateWorkoutMutation.mutate({ id: selectedWorkout.id, workoutData }); } else { createWorkoutMutation.mutate(workoutData); } }, [editMode, selectedWorkout, updateWorkoutMutation, createWorkoutMutation]);
  const handleDeleteWorkout = useCallback((workout) => { deleteWorkoutMutation.mutate(workout.id); }, [deleteWorkoutMutation]);
  const handleToggleFavorite = useCallback((workout) => { toggleFavoriteMutation.mutate({ id: workout.id, isFavorite: workout.is_favorite }); }, [toggleFavoriteMutation]);

  const curatedWorkouts = getCuratedWorkoutsByMuscleGroup(selectedMuscleGroup, userProfile?.gender?.toLowerCase());

  return (
    <div className="min-h-full pb-36 bg-[color:var(--app-bg)]">
      <div className="relative border-b-2 border-[rgba(201,169,98,0.25)] page-safe-x py-6">
        <button onClick={() => navigate(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity">
          <ChevronLeft className="w-6 h-6 text-[color:var(--app-gold)]" strokeWidth={1.5} />
        </button>
        <div className="w-full text-center">
          <h1 className="text-3xl text-[color:var(--app-gold)] font-light tracking-wide">Fitness</h1>
        </div>
      </div>

      {workoutsLoading ? <FitnessSkeleton /> : <div className="page-safe-x pt-4 space-y-4">
        <div className="w-full flex gap-2">
          {[{ id: 'library', label: 'Library' }, { id: 'myworkouts', label: 'My Workouts' }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-light tracking-wide transition-all ${activeTab === tab.id ? 'bg-[#C9A962] text-[#000000]' : 'text-[color:var(--app-gold)] border border-[rgba(201,169,98,0.3)]'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'library' && (
          <>
            <div className="bg-[color:var(--app-bg)] rounded-2xl border border-[rgba(201,169,98,0.3)] p-5">
              <h2 className="text-sm text-[color:var(--app-gold)] font-light mb-4 tracking-wide">CURATED WORKOUTS</h2>
              <div className="grid grid-cols-3 gap-3">
                {MUSCLE_GROUPS.map((group) => (
                  <button key={group.id} onClick={() => setSelectedMuscleGroup(group.id)}
                    className={`aspect-square bg-[color:var(--app-bg)] rounded-2xl border-2 transition-all overflow-hidden relative group ${selectedMuscleGroup === group.id ? 'border-[#C9A962] shadow-lg shadow-[rgba(201,169,98,0.3)]' : 'border-[rgba(201,169,98,0.3)]'}`}>
                    <img src={group.image} alt={group.label} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover brightness-75 group-hover:brightness-90 transition-all duration-300" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-8 pb-2 px-2">
                      <div className="relative z-10 text-[11px] text-[color:var(--app-text)] font-light text-center tracking-wide">{group.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {curatedWorkouts.map((workout) => (
                <motion.div key={workout.id} whileHover={{ scale: 1.01 }} onClick={() => handleViewWorkout(workout, true)}
                  className="bg-[color:var(--app-bg)] rounded-2xl border border-[rgba(201,169,98,0.3)] p-5 cursor-pointer hover:border-[#C9A962] transition-all">
                  <h3 className="text-base text-[color:var(--app-text)] font-light mb-2">{workout.name}</h3>
                  <div className="flex gap-3 text-xs text-[color:var(--app-text-2)] mb-4">
                    <div className="flex items-center gap-1"><Clock className="w-3 h-3" /><span>{workout.duration} min</span></div>
                    <span>•</span><span>{workout.difficulty}</span>
                  </div>
                  <div className="space-y-2">
                    {workout.exercises.slice(0, 3).map((ex, j) => (
                      <div key={j} className="text-sm text-[color:var(--app-text-2)] flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-[#C9A962]" />
                        <span className="flex-1">{ex.name}</span>
                        <span className="text-xs text-[color:var(--app-text-3)]">{ex.sets}×{ex.reps}</span>
                      </div>
                    ))}
                    {workout.exercises.length > 3 && <div className="text-xs text-[color:var(--app-text-3)] ml-3">+{workout.exercises.length - 3} more exercises</div>}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'myworkouts' && (
          <div className="space-y-4">
            <div className="bg-[color:var(--app-bg)] rounded-2xl border border-[rgba(201,169,98,0.3)] p-4">
              <h2 className="text-sm text-[color:var(--app-gold)] font-light mb-1 tracking-wide">MY CUSTOM WORKOUTS</h2>
              <p className="text-xs text-[color:var(--app-text-2)]">Create and manage your personal workouts</p>
            </div>

            {workouts.length === 0 ? (
              <div className="bg-[color:var(--app-bg)] rounded-2xl border border-[rgba(201,169,98,0.3)] text-center py-16 px-6">
                <Dumbbell className="w-16 h-16 text-[color:var(--app-gold)] opacity-20 mx-auto mb-4" strokeWidth={1} />
                <h3 className="text-lg text-[color:var(--app-text)] font-light mb-2">No workouts yet</h3>
                <p className="text-sm text-[color:var(--app-text-2)] mb-6 max-w-sm mx-auto">Start building your perfect workout routine with custom exercises</p>
                <button onClick={handleCreateWorkout} className="px-6 py-3 bg-[#C9A962] text-[#000000] rounded-full text-sm font-light flex items-center gap-2 mx-auto hover:bg-[#D4B574] transition-colors">
                  <Plus className="w-4 h-4" />Create Your First Workout
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {workouts.map((workout) => (
                  <motion.div key={workout.id} whileHover={{ scale: 1.01 }} className="bg-[color:var(--app-bg)] rounded-2xl border border-[rgba(201,169,98,0.3)] p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1" onClick={() => handleViewWorkout(workout)}>
                        <h4 className="text-base text-[color:var(--app-text)] font-light mb-2 cursor-pointer">{workout.name}</h4>
                        <div className="flex flex-wrap gap-2">
                          <div className="flex items-center gap-1 text-xs text-[color:var(--app-text-2)]"><Clock className="w-3 h-3" /><span>{workout.duration} min</span></div>
                          <span className="text-xs text-[color:var(--app-text-3)]">•</span>
                          <span className="text-xs text-[color:var(--app-text-2)]">{workout.difficulty}</span>
                          {workout.exercises?.length > 0 && <><span className="text-xs text-[color:var(--app-text-3)]">•</span><span className="text-xs text-[color:var(--app-text-2)]">{workout.exercises.length} exercises</span></>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleToggleFavorite(workout)} className="p-2 rounded-xl hover:bg-[color:var(--app-bg)] transition-colors">
                          <Star className={`w-4 h-4 ${workout.is_favorite ? 'text-[color:var(--app-gold)] fill-[#C9A962]' : 'text-[color:var(--app-text-3)]'}`} strokeWidth={1.5} />
                        </button>
                        <button onClick={() => handleEditWorkout(workout)} className="p-2 rounded-xl hover:bg-[color:var(--app-bg)] transition-colors">
                          <Edit2 className="w-4 h-4 text-[color:var(--app-gold)]" strokeWidth={1.5} />
                        </button>
                        <button onClick={() => { if (window.confirm('Delete this workout?')) handleDeleteWorkout(workout); }} className="p-2 rounded-xl hover:bg-[color:var(--app-bg)] transition-colors">
                          <Trash2 className="w-4 h-4 text-red-400" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                    {workout.muscle_groups?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {workout.muscle_groups.map((group, i) => <span key={i} className="px-2 py-0.5 bg-[rgba(201,169,98,0.2)] text-[color:var(--app-gold)] rounded-full text-xs">{group}</span>)}
                      </div>
                    )}
                    {workout.exercises?.length > 0 && (
                      <>
                        <div className="h-[1px] w-full bg-[rgba(201,169,98,0.2)] mb-3" />
                        <div className="space-y-1.5">
                          {workout.exercises.slice(0, 3).map((ex, i) => (
                            <div key={i} className="text-xs text-[color:var(--app-text-2)] flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-[#C9A962]" />
                              <span>{ex.name}</span>
                              <span className="text-[10px] text-[color:var(--app-text-3)]">{ex.sets}×{ex.reps}</span>
                            </div>
                          ))}
                          {workout.exercises.length > 3 && <div className="text-xs text-[color:var(--app-text-3)] ml-3">+{workout.exercises.length - 3} more</div>}
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>}

      {activeTab === 'myworkouts' && workouts.length > 0 && (
        <button onClick={handleCreateWorkout} className="fixed right-6 w-14 h-14 bg-[#C9A962] rounded-full shadow-lg shadow-[rgba(201,169,98,0.4)] flex items-center justify-center hover:bg-[#D4B574] transition-all z-[55]" style={{ bottom: 'calc(7.5rem + env(safe-area-inset-bottom, 0px))' }}>
          <Plus className="w-6 h-6 text-[#000000]" strokeWidth={2} />
        </button>
      )}

      <WorkoutFormModal isOpen={showFormModal} onClose={() => { setShowFormModal(false); setSelectedWorkout(null); setEditMode(false); }} onSave={handleSaveWorkout} initialData={selectedWorkout} isLoading={createWorkoutMutation.isPending || updateWorkoutMutation.isPending} muscleGroups={MUSCLE_GROUPS} />
      <WorkoutViewModal isOpen={showViewModal} onClose={() => { setShowViewModal(false); setSelectedWorkout(null); }} workout={selectedWorkout} onEdit={handleEditWorkout} onDuplicate={handleDuplicateWorkout} onDelete={handleDeleteWorkout} isCurated={selectedWorkout?.isCurated || false} />
    </div>
  );
}