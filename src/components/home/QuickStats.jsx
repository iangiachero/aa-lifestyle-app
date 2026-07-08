import React from 'react';
import { CheckCircle2, Calendar, Flame, Target } from 'lucide-react';

export default function QuickStats({ tasks, habits, events }) {
  const todayTasks = tasks?.filter(t => t.status !== 'completed')?.length || 0;
  const completedToday = tasks?.filter(t => t.status === 'completed')?.length || 0;
  const todayEvents = events?.length || 0;
  const activeStreak = habits?.reduce((max, h) => Math.max(max, h.current_streak || 0), 0) || 0;

  const stats = [
    { label: 'Tasks', value: todayTasks, icon: CheckCircle2, color: 'var(--app-gold)' },
    { label: 'Done', value: completedToday, icon: Target, color: '#6BBF8A' },
    { label: 'Events', value: todayEvents, icon: Calendar, color: '#7BA3D4' },
    { label: 'Streak', value: activeStreak, icon: Flame, color: '#E89B6C' },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="bg-[color:var(--app-bg)] rounded-xl p-3 text-center border border-[rgba(201,169,98,0.25)]">
            <div
              className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center"
              style={{ backgroundColor: `${stat.color}15` }}
            >
              <Icon className="w-4 h-4" style={{ color: stat.color }} />
            </div>
            <div className="text-xl font-semibold text-[color:var(--app-text)]">{stat.value}</div>
            <div className="text-[10px] text-[color:var(--app-text-2)] uppercase tracking-wide">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
}
