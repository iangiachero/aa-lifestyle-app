import React from 'react';
import { Flame, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

export default function HabitTracker({ habits }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const today = format(new Date(), 'yyyy-MM-dd');

  const toggleHabit = async (habit) => {
    const isCompletedToday = habit.last_completed === today;
    const newStreak = isCompletedToday
      ? Math.max(0, (habit.streak || 0) - 1)
      : (habit.streak || 0) + 1;

    await supabase
      .from('habits')
      .update({
        last_completed: isCompletedToday ? null : today,
        streak: newStreak,
      })
      .eq('id', habit.id)
      .eq('user_id', user.id);
    queryClient.invalidateQueries({ queryKey: ['habits', user?.id] });
  };

  const activeHabits = habits || [];

  if (activeHabits.length === 0) {
    return (
      <div className="text-center py-6">
        <Flame className="w-8 h-8 opacity-20 mx-auto mb-2 text-[#C9A962]" />
        <div className="text-[#B8B8B8] text-sm">No habits yet</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {activeHabits.slice(0, 6).map((habit) => {
        const isCompletedToday = habit.last_completed === today;
        return (
          <div
            key={habit.id}
            onClick={() => toggleHabit(habit)}
            className={`relative overflow-hidden transition-all cursor-pointer bg-[#000000] rounded-xl p-4 border ${
              isCompletedToday
                ? 'border-[#C9A962] bg-[rgba(201,169,98,0.1)]'
                : 'border-[rgba(201,169,98,0.25)]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isCompletedToday
                  ? 'bg-[#C9A962] text-white'
                  : 'bg-[rgba(0,0,0,0.8)] text-[#B8B8B8]'
              }`}>
                {isCompletedToday ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-lg">{habit.icon || '✨'}</span>
                )}
              </div>
              {(habit.streak || 0) > 0 && (
                <div className="flex items-center gap-1 text-xs text-[#E89B6C]">
                  <Flame className="w-3 h-3" />
                  <span>{habit.streak}</span>
                </div>
              )}
            </div>
            <div className="font-medium text-sm text-[#F5F1E8] truncate">{habit.name}</div>
          </div>
        );
      })}
    </div>
  );
}
