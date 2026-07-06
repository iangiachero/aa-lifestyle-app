import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Star, ChevronDown, ChevronUp } from 'lucide-react';
import CustomSelect from '../ui/CustomSelect';
import { useModal } from '../../context/ModalContext';

export default function WorkoutFormModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  isLoading = false,
  muscleGroups = []
}) {
  const { openModal, closeModal } = useModal();

  useEffect(() => {
    if (isOpen) {
      openModal();
      return () => closeModal();
    }
  }, [isOpen, openModal, closeModal]);
  const [formData, setFormData] = useState({
    name: '',
    duration: 45,
    difficulty: 'Intermediate',
    muscle_groups: [],
    is_favorite: false,
    exercises: []
  });

  const [expandedExercise, setExpandedExercise] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        duration: initialData.duration || 45,
        difficulty: initialData.difficulty || 'Intermediate',
        muscle_groups: initialData.muscle_groups || [],
        is_favorite: initialData.is_favorite || false,
        exercises: initialData.exercises || []
      });
    } else {
      setFormData({ name: '', duration: 45, difficulty: 'Intermediate', muscle_groups: [], is_favorite: false, exercises: [] });
    }
  }, [initialData, isOpen]);

  const handleAddExercise = () => {
    setFormData({ ...formData, exercises: [...formData.exercises, { name: '', sets: 3, reps: '10', rest_seconds: 60, notes: '' }] });
    setExpandedExercise(formData.exercises.length);
  };

  const handleRemoveExercise = (index) => {
    setFormData({ ...formData, exercises: formData.exercises.filter((_, i) => i !== index) });
    if (expandedExercise === index) setExpandedExercise(null);
  };

  const handleExerciseChange = (index, field, value) => {
    const updatedExercises = [...formData.exercises];
    updatedExercises[index] = { ...updatedExercises[index], [field]: value };
    setFormData({ ...formData, exercises: updatedExercises });
  };

  const toggleMuscleGroup = (group) => {
    if (formData.muscle_groups.includes(group)) {
      setFormData({ ...formData, muscle_groups: formData.muscle_groups.filter(g => g !== group) });
    } else {
      setFormData({ ...formData, muscle_groups: [...formData.muscle_groups, group] });
    }
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) { alert('Please enter a workout name'); return; }
    if (formData.exercises.length === 0) { alert('Please add at least one exercise'); return; }
    for (let i = 0; i < formData.exercises.length; i++) {
      const ex = formData.exercises[i];
      if (!ex.name.trim() || !ex.reps.trim()) { alert(`Please complete all fields for exercise ${i + 1}`); return; }
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80" onClick={onClose} />

        <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative w-full sm:max-w-2xl bg-[color:var(--app-bg)] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
          style={{ height: '90dvh' }}>

          <div className="flex items-center justify-between p-6 border-b border-[rgba(201,169,98,0.3)]">
            <h2 className="text-xl text-[color:var(--app-text)] font-light">{initialData ? 'Edit Workout' : 'Create Workout'}</h2>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] flex items-center justify-center hover:bg-[color:var(--app-bg)] transition-colors">
              <X className="w-5 h-5 text-[#C9A962]" strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-6">
            <div>
              <label className="block text-sm text-[#C9A962] mb-2">Workout Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Pull Day, Upper Body Strength"
                className="w-full px-4 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-xl text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:outline-none focus:border-[#C9A962]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#C9A962] mb-2">Duration (min)</label>
                <input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  min="5" max="180"
                  className="w-full px-4 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-xl text-[color:var(--app-text)] focus:outline-none focus:border-[#C9A962]" />
              </div>
              <div>
                <label className="block text-sm text-[#C9A962] mb-2">Difficulty</label>
                <CustomSelect
                  value={formData.difficulty}
                  onChange={(val) => setFormData({ ...formData, difficulty: val })}
                  options={[
                    { value: 'Beginner', label: 'Beginner' },
                    { value: 'Intermediate', label: 'Intermediate' },
                    { value: 'Advanced', label: 'Advanced' },
                  ]}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#C9A962] mb-2">Muscle Groups</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {muscleGroups.map((group) => (
                  <button key={group.id} onClick={() => toggleMuscleGroup(group.id)}
                    className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                      formData.muscle_groups.includes(group.id)
                        ? 'bg-[#C9A962] text-[#000000] border-[#C9A962]'
                        : 'bg-[color:var(--app-bg)] text-[color:var(--app-text-2)] border-[rgba(201,169,98,0.3)] hover:border-[#C9A962]'
                    }`}>
                    {group.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-[color:var(--app-bg)] rounded-xl border border-[rgba(201,169,98,0.3)]">
              <div className="flex items-center gap-2">
                <Star className={`w-5 h-5 ${formData.is_favorite ? 'text-[#C9A962] fill-[#C9A962]' : 'text-[color:var(--app-text-3)]'}`} strokeWidth={1.5} />
                <span className="text-sm text-[color:var(--app-text)]">Mark as Favorite</span>
              </div>
              <button onClick={() => setFormData({ ...formData, is_favorite: !formData.is_favorite })}
                className={`relative w-12 h-6 rounded-full transition-colors ${formData.is_favorite ? 'bg-[#C9A962]' : 'bg-[#3A3A3A]'}`}>
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.is_favorite ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm text-[#C9A962]">Exercises ({formData.exercises.length})</label>
                <button onClick={handleAddExercise}
                  className="flex items-center gap-2 px-4 py-2 bg-[#C9A962] text-[#000000] rounded-xl text-sm hover:bg-[#D4B574] transition-colors">
                  <Plus className="w-4 h-4" strokeWidth={2} />Add Exercise
                </button>
              </div>

              <div className="space-y-3">
                {formData.exercises.map((exercise, index) => (
                  <div key={index} className="bg-[color:var(--app-bg)] rounded-xl border border-[rgba(201,169,98,0.3)] overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-[#C9A962]">Exercise {index + 1}</span>
                        <div className="flex gap-2">
                          <button onClick={() => setExpandedExercise(expandedExercise === index ? null : index)}
                            className="p-1.5 rounded-lg hover:bg-[color:var(--app-bg)] transition-colors">
                            {expandedExercise === index ? <ChevronUp className="w-4 h-4 text-[color:var(--app-text-2)]" /> : <ChevronDown className="w-4 h-4 text-[color:var(--app-text-2)]" />}
                          </button>
                          <button onClick={() => handleRemoveExercise(index)} className="p-1.5 rounded-lg hover:bg-[color:var(--app-bg)] transition-colors">
                            <Trash2 className="w-4 h-4 text-red-400" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                      <input type="text" value={exercise.name} onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                        placeholder="Exercise name"
                        className="w-full px-3 py-2 mb-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.2)] rounded-lg text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] text-sm focus:outline-none focus:border-[#C9A962]" />
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs text-[color:var(--app-text-2)] mb-1">Sets</label>
                          <input type="number" value={exercise.sets} onChange={(e) => handleExerciseChange(index, 'sets', parseInt(e.target.value) || 0)}
                            min="1" max="10"
                            className="w-full px-3 py-2 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.2)] rounded-lg text-[color:var(--app-text)] text-sm focus:outline-none focus:border-[#C9A962]" />
                        </div>
                        <div>
                          <label className="block text-xs text-[color:var(--app-text-2)] mb-1">Reps</label>
                          <input type="text" value={exercise.reps} onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                            placeholder="8-12"
                            className="w-full px-3 py-2 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.2)] rounded-lg text-[color:var(--app-text)] text-sm focus:outline-none focus:border-[#C9A962]" />
                        </div>
                        <div>
                          <label className="block text-xs text-[color:var(--app-text-2)] mb-1">Rest (s)</label>
                          <input type="number" value={exercise.rest_seconds} onChange={(e) => handleExerciseChange(index, 'rest_seconds', parseInt(e.target.value) || 0)}
                            min="0" max="300"
                            className="w-full px-3 py-2 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.2)] rounded-lg text-[color:var(--app-text)] text-sm focus:outline-none focus:border-[#C9A962]" />
                        </div>
                      </div>
                      {expandedExercise === index && (
                        <div className="mt-3">
                          <label className="block text-xs text-[color:var(--app-text-2)] mb-1">Notes (optional)</label>
                          <textarea value={exercise.notes} onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                            placeholder="Add form cues or tips..." rows="2"
                            className="w-full px-3 py-2 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.2)] rounded-lg text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] text-sm focus:outline-none focus:border-[#C9A962] resize-none" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {formData.exercises.length === 0 && (
                  <div className="text-center py-8 text-[color:var(--app-text-3)] text-sm">No exercises added yet. Click "Add Exercise" to start building your workout.</div>
                )}
              </div>
            </div>
            <div className="flex gap-3 pt-4" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}>
              <button onClick={onClose} disabled={isLoading}
                className="flex-1 px-6 py-3 bg-[color:var(--app-bg)] text-[#C9A962] rounded-xl border border-[rgba(201,169,98,0.3)] hover:bg-[color:var(--app-bg)] transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={isLoading}
                className="flex-1 px-6 py-3 bg-[#C9A962] text-[#000000] rounded-xl hover:bg-[#D4B574] transition-colors disabled:opacity-50">
                {isLoading ? 'Saving...' : 'Save Workout'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}