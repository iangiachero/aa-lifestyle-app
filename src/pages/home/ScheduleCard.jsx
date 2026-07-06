import React from 'react';
import TodaySchedule from '../../components/home/TodaySchedule';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ScheduleCard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
      if (error) return [];
      return data || [];
    },
    enabled: !!user?.id,
  });

  const CARD_STYLE = {
    background: 'bg-[color:var(--app-bg)]',
    border: 'border border-[rgba(226,186,139,0.3)]',
    glow: 'shadow-[0_0_8px_rgba(226,186,139,0.12),0_0_16px_rgba(226,186,139,0.05)]',
    padding: 'p-4',
    radius: 'rounded-2xl',
    titleColor: 'text-[color:var(--app-text)]',
    titleSize: 'text-xl',
    titleWeight: 'font-serif font-semibold',
    titleSpacing: 'mb-3',
    titleUnderline: 'pb-2 border-b border-[rgba(226,186,139,0.3)]',
  };

  const cardClasses = `${CARD_STYLE.background} ${CARD_STYLE.radius} ${CARD_STYLE.padding} ${CARD_STYLE.border} ${CARD_STYLE.glow} cursor-pointer transition-all duration-200 hover:brightness-105 active:scale-[0.99]`;

  if (isLoading) {
    return (
      <div className={cardClasses}>
        <div className="skeleton-pulse h-5 rounded mb-3" style={{ width: '40%' }} />
        <div className="space-y-2.5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton-pulse w-8 h-8 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton-pulse h-3 rounded" style={{ width: '65%' }} />
                <div className="skeleton-pulse h-3 rounded" style={{ width: '40%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cardClasses} onClick={() => navigate('/calendar')}>
      <h2 className={`${CARD_STYLE.titleSize} ${CARD_STYLE.titleWeight} ${CARD_STYLE.titleColor} ${CARD_STYLE.titleSpacing} ${CARD_STYLE.titleUnderline}`}>
        Schedule
      </h2>
      <TodaySchedule events={events} />
    </div>
  );
}