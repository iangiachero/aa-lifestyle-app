import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard as Edit2, Copy, Trash2, Play, Star, Clock, Dumbbell } from 'lucide-react';
import { useModal } from '../../context/ModalContext';

export default function WorkoutViewModal({
  isOpen,
  onClose,
  workout,
  onEdit,
  onDuplicate,
  onDelete,
  isCurated = false
}) {
  const { openModal, closeModal } = useModal();

  useEffect(() => {
    if (isOpen) {
      openModal();
      return () => closeModal();
    }
  }, [isOpen, openModal, closeModal]);

  if (!isOpen || !workout) return null;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'text-green-400';
      case 'Intermediate':
        return 'text-yellow-400';
      case 'Advanced':
        return 'text-red-400';
      default:
        return 'text-[color:var(--app-gold)]';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80"
          onClick={onClose}
        />

        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative w-full h-[90dvh] sm:h-[85dvh] sm:max-w-2xl bg-[color:var(--app-bg)] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-b border-[rgba(201,169,98,0.3)]">
            <h2 className="text-xl text-[color:var(--app-text)] font-light">Workout Details</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] flex items-center justify-center hover:bg-[color:var(--app-bg)] transition-colors"
            >
              <X className="w-5 h-5 text-[color:var(--app-gold)]" strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-6">
            <div>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-2xl text-[color:var(--app-text)] font-light">{workout.name}</h3>
                {workout.is_favorite && (
                  <Star className="w-6 h-6 text-[color:var(--app-gold)] fill-[#C9A962]" strokeWidth={1.5} />
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[color:var(--app-bg)] rounded-full border border-[rgba(201,169,98,0.3)]">
                  <Clock className="w-4 h-4 text-[color:var(--app-gold)]" strokeWidth={1.5} />
                  <span className="text-sm text-[color:var(--app-text)]">{workout.duration} min</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[color:var(--app-bg)] rounded-full border border-[rgba(201,169,98,0.3)]">
                  <Dumbbell className="w-4 h-4 text-[color:var(--app-gold)]" strokeWidth={1.5} />
                  <span className={`text-sm ${getDifficultyColor(workout.difficulty)}`}>
                    {workout.difficulty}
                  </span>
                </div>
              </div>

              {workout.muscle_groups && workout.muscle_groups.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {workout.muscle_groups.map((group, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-[rgba(201,169,98,0.2)] text-[color:var(--app-gold)] rounded-full text-xs"
                    >
                      {group}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="h-px w-full bg-[rgba(201,169,98,0.2)]" />

            <div>
              <h4 className="text-sm text-[color:var(--app-gold)] mb-4 uppercase tracking-wide">
                Exercises ({workout.exercises?.length || 0})
              </h4>
              <div className="space-y-4">
                {workout.exercises?.map((exercise, index) => (
                  <div
                    key={index}
                    className="bg-[color:var(--app-bg)] rounded-xl p-4 border border-[rgba(201,169,98,0.3)]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#C9A962] flex items-center justify-center text-[#000000] text-sm font-medium">
                          {index + 1}
                        </div>
                        <h5 className="text-[color:var(--app-text)] font-light">{exercise.name}</h5>
                      </div>
                    </div>

                    <div className="ml-11 space-y-2">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-[color:var(--app-text-2)]">Sets:</span>
                          <span className="text-[color:var(--app-text)] font-medium">{exercise.sets}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[color:var(--app-text-2)]">Reps:</span>
                          <span className="text-[color:var(--app-text)] font-medium">{exercise.reps}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[color:var(--app-text-2)]">Rest:</span>
                          <span className="text-[color:var(--app-text)] font-medium">{exercise.rest_seconds}s</span>
                        </div>
                      </div>

                      {exercise.notes && (
                        <p className="text-xs text-[color:var(--app-text-2)] bg-[color:var(--app-bg)] rounded-lg p-3">
                          {exercise.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pb-8" />
          </div>

          <div className="p-6 border-t border-[rgba(201,169,98,0.3)] bg-[color:var(--app-bg)]">
            {isCurated ? (
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-[color:var(--app-bg)] text-[color:var(--app-gold)] rounded-xl border border-[rgba(201,169,98,0.3)] hover:bg-[color:var(--app-bg)] transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => onDuplicate(workout)}
                  className="flex-1 px-6 py-3 bg-[#C9A962] text-[#000000] rounded-xl hover:bg-[#D4B574] transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" strokeWidth={2} />
                  Duplicate to My Workouts
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  className="w-full px-6 py-3 bg-[#C9A962] text-[#000000] rounded-xl hover:bg-[#D4B574] transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" strokeWidth={2} />
                  Start Workout
                </button>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => onEdit(workout)}
                    className="px-4 py-3 bg-[color:var(--app-bg)] text-[color:var(--app-gold)] rounded-xl border border-[rgba(201,169,98,0.3)] hover:bg-[color:var(--app-bg)] transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-sm">Edit</span>
                  </button>
                  <button
                    onClick={() => onDuplicate(workout)}
                    className="px-4 py-3 bg-[color:var(--app-bg)] text-[color:var(--app-gold)] rounded-xl border border-[rgba(201,169,98,0.3)] hover:bg-[color:var(--app-bg)] transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-sm">Copy</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this workout?')) {
                        onDelete(workout);
                      }
                    }}
                    className="px-4 py-3 bg-[color:var(--app-bg)] text-red-400 rounded-xl border border-[rgba(201,169,98,0.3)] hover:bg-[color:var(--app-bg)] transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-sm">Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
