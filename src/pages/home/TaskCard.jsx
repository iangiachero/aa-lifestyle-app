import React from 'react';
import TodayTasks from '../../components/home/TodayTasks';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TaskCard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) return [];
      return data || [];
    },
    enabled: !!user?.id,
  });

  const CARD_STYLE = {
    background: 'bg-[#000000]',
    border: 'border border-[rgba(226,186,139,0.3)]',
    glow: 'shadow-[0_0_8px_rgba(226,186,139,0.12),0_0_16px_rgba(226,186,139,0.05)]',
    padding: 'p-4',
    radius: 'rounded-2xl',
    titleColor: 'text-[#F5F1E8]',
    titleSize: 'text-xl',
    titleWeight: 'font-serif font-semibold',
    titleSpacing: 'mb-3',
    titleUnderline: 'pb-2 border-b border-[rgba(226,186,139,0.3)]',
  };

  const cardClasses = `${CARD_STYLE.background} ${CARD_STYLE.radius} ${CARD_STYLE.padding} ${CARD_STYLE.border} ${CARD_STYLE.glow} cursor-pointer transition-all duration-200 hover:brightness-105 active:scale-[0.99]`;

  if (isLoading) {
    return (
      <div className={cardClasses}>
        <div className="skeleton-pulse h-5 rounded mb-3" style={{ width: '30%' }} />
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="skeleton-pulse w-5 h-5 rounded-full flex-shrink-0" />
              <div className="skeleton-pulse h-3 rounded flex-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cardClasses} onClick={() => navigate('/tasks')}>
      <h2 className={`${CARD_STYLE.titleSize} ${CARD_STYLE.titleWeight} ${CARD_STYLE.titleColor} ${CARD_STYLE.titleSpacing} ${CARD_STYLE.titleUnderline}`}>
        Tasks
      </h2>
      <TodayTasks tasks={tasks} />
    </div>
  );
}