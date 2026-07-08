import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Flame, Check, Trash2, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';

const ICONS = ['✦', '☀', '🏃', '💧', '📚', '🧘', '🍎', '💪', '✍', '🎯', '🛌', '🧹', '🎵', '🌿', '❤'];
const COLORS = ['#C9A962', '#E89B6C', '#6CB8E8', '#6CE8A0', '#E86C6C', '#C86CE8', '#E8C46C', '#6CE8D4'];

const today = format(new Date(), 'yyyy-MM-dd');

export default function Habits() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openModal, closeModal } = useModal();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (showModal) {
      openModal();
      return () => closeModal();
    }
  }, [showModal, openModal, closeModal]);
  const [form, setForm] = useState({ name: '', icon: '✦', color: 'var(--app-gold)' });

  const { data: habits = [], isLoading } = useQuery({
    queryKey: ['habits', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const toggleMutation = useMutation({
    mutationFn: async (habit) => {
      const isCompletedToday = habit.last_completed === today;
      const newStreak = isCompletedToday
        ? Math.max(0, (habit.streak || 0) - 1)
        : (habit.streak || 0) + 1;
      const { error } = await supabase
        .from('habits')
        .update({
          last_completed: isCompletedToday ? null : today,
          streak: newStreak,
        })
        .eq('id', habit.id)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits', user?.id] }),
  });

  const createMutation = useMutation({
    mutationFn: async ({ name, icon, color }) => {
      const { error } = await supabase
        .from('habits')
        .insert({ user_id: user.id, name, icon, color, streak: 0 });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', user?.id] });
      setShowModal(false);
      setForm({ name: '', icon: '✦', color: 'var(--app-gold)' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits', user?.id] }),
  });

  const completedCount = habits.filter(h => h.last_completed === today).length;

  return (
    <div className="min-h-full pb-24">
      {/* Header */}
      <div className="relative border-b-2 border-[rgba(201,169,98,0.25)] page-safe-x py-6">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
        >
          <ChevronLeft className="w-6 h-6 text-[color:var(--app-gold)]" strokeWidth={1.5} />
        </button>
        <div className="w-full text-center">
          <h1 className="text-3xl text-[color:var(--app-gold)] font-light tracking-wide">Habits</h1>
        </div>
      </div>

      <div className="page-safe-x pt-5">
        {/* Progress bar */}
        {habits.length > 0 && (
          <div className="mb-5 bg-gradient-to-br from-[rgba(0,0,0,0.9)] to-[rgba(0,0,0,0.7)] border border-[rgba(201,169,98,0.25)] rounded-2xl px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-light text-[color:var(--app-text)]">Today's Progress</span>
              <span className="text-sm text-[color:var(--app-gold)]">{completedCount}/{habits.length}</span>
            </div>
            <div className="h-1.5 bg-[color:var(--app-wash)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#C9A962] to-[#E8C46C] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: habits.length > 0 ? `${(completedCount / habits.length) * 100}%` : '0%' }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* Habit grid */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border border-[#C9A962] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Flame className="w-12 h-12 text-[color:var(--app-gold)] opacity-20 mb-4" />
            <p className="text-[color:var(--app-text-3)] text-sm font-light">No habits yet</p>
            <p className="text-[color:var(--app-text-3)] text-xs mt-1">Tap + to build your first streak</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence>
              {habits.map((habit, idx) => {
                const isCompleted = habit.last_completed === today;
                return (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.04 }}
                    className={`relative overflow-hidden rounded-2xl border cursor-pointer transition-all duration-200 ${
                      isCompleted
                        ? 'border-[#C9A962] bg-[rgba(201,169,98,0.08)]'
                        : 'border-[rgba(201,169,98,0.2)] bg-gradient-to-br from-[rgba(0,0,0,0.9)] to-[rgba(0,0,0,0.7)]'
                    }`}
                    onClick={() => toggleMutation.mutate(habit)}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all"
                          style={{
                            background: isCompleted
                              ? habit.color
                              : 'var(--app-wash)',
                          }}
                        >
                          {isCompleted ? (
                            <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
                          ) : (
                            <span>{habit.icon || '✦'}</span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMutation.mutate(habit.id);
                          }}
                          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[var(--app-wash-2)] transition-colors opacity-40 hover:opacity-80"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[color:var(--app-text-2)]" />
                        </button>
                      </div>
                      <p className="text-sm font-light text-[color:var(--app-text)] truncate mb-1.5">{habit.name}</p>
                      {(habit.streak || 0) > 0 && (
                        <div className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-[#E89B6C]" />
                          <span className="text-xs text-[#E89B6C]">{habit.streak} day{habit.streak !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                    {isCompleted && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-0.5 opacity-60"
                        style={{ background: `linear-gradient(90deg, transparent, ${habit.color}, transparent)` }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed right-6 w-14 h-14 bg-[#C9A962] rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-110 z-[55]"
        style={{ bottom: 'calc(7.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <Plus className="w-6 h-6 text-white" strokeWidth={2} />
      </button>

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              className="w-full max-w-md bg-gradient-to-b from-[#111111] to-[color:var(--app-bg)] rounded-t-3xl border-t border-x border-[rgba(201,169,98,0.3)] px-6 pt-6 pb-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-light text-[color:var(--app-text)]">New Habit</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--app-wash-2)] transition-colors"
                >
                  <X className="w-4 h-4 text-[color:var(--app-text-2)]" />
                </button>
              </div>

              {/* Name */}
              <div className="mb-5">
                <label className="text-xs text-[color:var(--app-text-3)] uppercase tracking-widest mb-2 block">Name</label>
                <input
                  type="text"
                  placeholder="e.g. Morning run"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-[color:var(--app-wash)] border border-[rgba(201,169,98,0.2)] rounded-xl px-4 py-3 text-sm text-[color:var(--app-text)] placeholder-[#4B4B4B] outline-none focus:border-[rgba(201,169,98,0.5)] transition-colors"
                />
              </div>

              {/* Icon picker */}
              <div className="mb-5">
                <label className="text-xs text-[color:var(--app-text-3)] uppercase tracking-widest mb-2 block">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setForm(f => ({ ...f, icon }))}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all border ${
                        form.icon === icon
                          ? 'border-[#C9A962] bg-[rgba(201,169,98,0.15)]'
                          : 'border-[var(--app-wash-2)] bg-[var(--app-wash-soft)] hover:border-[rgba(201,169,98,0.3)]'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              <div className="mb-7">
                <label className="text-xs text-[color:var(--app-text-3)] uppercase tracking-widest mb-2 block">Color</label>
                <div className="flex gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setForm(f => ({ ...f, color }))}
                      className="w-8 h-8 rounded-full border-2 transition-all"
                      style={{
                        background: color,
                        borderColor: form.color === color ? '#fff' : 'transparent',
                        transform: form.color === color ? 'scale(1.15)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  if (!form.name.trim()) return;
                  createMutation.mutate(form);
                }}
                disabled={!form.name.trim() || createMutation.isPending}
                className="w-full py-3.5 rounded-2xl bg-[#C9A962] text-white text-sm font-light tracking-wide disabled:opacity-40 transition-opacity"
              >
                {createMutation.isPending ? 'Adding...' : 'Add Habit'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
