import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Bell, Calendar, CheckSquare, GraduationCap, UtensilsCrossed, Heart, Home, Sun, Moon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { requestNotificationPermission, hasNotificationPermission } from '../lib/notifications';
import { isNativeApp } from '../lib/platform';

/*
  Preferences only — this screen reads and writes notification_preferences,
  it does not itself schedule anything. The per-feature scheduling logic
  (turning "calendar reminders, 30 minutes before" into an actual scheduled
  notification whenever an event is created/edited) is the native-dependent
  work described in NOTIFICATIONS_SPEC.md, not built yet. On the web build
  this screen is fully functional as a preferences form; it just has nothing
  to schedule against until Capacitor exists.
*/

const CATEGORIES = [
  {
    key: 'calendar', label: 'Calendar', Icon: Calendar,
    description: 'Upcoming events, based on the reminder time you choose',
    control: 'offset',
  },
  {
    key: 'tasks', label: 'Tasks', Icon: CheckSquare,
    description: "Priorities coming up or due — not ongoing tasks",
    control: 'time',
  },
  {
    key: 'school', label: 'School', Icon: GraduationCap,
    description: 'Assignments, exams and projects — a few days before and the day due',
    control: 'daysBefore',
  },
  {
    key: 'meals', label: 'Meal Plan', Icon: UtensilsCrossed,
    description: 'Optional reminders for planned meals or prep',
    control: 'time',
  },
  {
    key: 'lifestyle', label: 'Lifestyle & Routines', Icon: Heart,
    description: 'For routines you choose to schedule',
    control: 'none',
  },
  {
    key: 'home_organization', label: 'Home Organization', Icon: Home,
    description: 'For scheduled cleaning and checklist categories',
    control: 'none',
  },
  {
    key: 'morning_overview', label: 'Morning Overview', Icon: Sun,
    description: "Today's events, priorities, tasks and deadlines in one notification",
    control: 'time',
  },
  {
    key: 'evening_reminder', label: 'Evening Reminder', Icon: Moon,
    description: 'Review unfinished tasks and prep for tomorrow',
    control: 'time',
  },
];

const OFFSET_OPTIONS = [
  { value: 10, label: '10 min before' },
  { value: 30, label: '30 min before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' },
];

const DEFAULT_CONFIG = {
  calendar: { offset_minutes: 30 },
  tasks: { time: '09:00' },
  school: { days_before: [3], time: '09:00' },
  meals: { time: '17:00' },
  lifestyle: {},
  home_organization: {},
  morning_overview: { time: '07:30' },
  evening_reminder: { time: '21:00' },
};

export default function NotificationSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(null);
  const [permissionState, setPermissionState] = useState('unknown');

  useEffect(() => {
    if (!isNativeApp()) return;
    hasNotificationPermission().then((granted) => setPermissionState(granted ? 'granted' : 'not-granted'));
  }, []);

  const { data: prefsRows = [] } = useQuery({
    queryKey: ['notificationPreferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id);
      if (error) return [];
      return data || [];
    },
    enabled: !!user?.id,
  });

  const prefsByCategory = Object.fromEntries(prefsRows.map((r) => [r.category, r]));

  const upsertPref = useCallback(async (category, updates) => {
    if (!user?.id) return;
    setSaving(category);
    const existing = prefsByCategory[category];
    const payload = {
      user_id: user.id,
      category,
      enabled: existing?.enabled ?? false,
      config: existing?.config ?? DEFAULT_CONFIG[category] ?? {},
      ...updates,
    };
    await supabase.from('notification_preferences').upsert(payload, { onConflict: 'user_id,category' });
    await queryClient.invalidateQueries({ queryKey: ['notificationPreferences', user.id] });
    setSaving(null);
  }, [user?.id, prefsByCategory, queryClient]);

  const toggleCategory = async (category, nextEnabled) => {
    // First time any category is turned on, ask for the OS permission —
    // on web this resolves to false and just stays a no-op preference.
    if (nextEnabled && isNativeApp() && permissionState !== 'granted') {
      const granted = await requestNotificationPermission();
      setPermissionState(granted ? 'granted' : 'not-granted');
      if (!granted) return;
    }
    await upsertPref(category, { enabled: nextEnabled });
  };

  const setConfig = (category, config) => {
    upsertPref(category, { config });
  };

  return (
    <div className="min-h-full pb-32" style={{ background: 'var(--app-bg)' }}>
      <div className="relative border-b-2 border-[rgba(201,169,98,0.25)] page-safe-x py-6 flex items-center">
        <button onClick={() => navigate(-1)} className="absolute left-4 hover:opacity-70 transition-opacity">
          <ChevronLeft className="w-6 h-6 text-[color:var(--app-gold)]" strokeWidth={1.5} />
        </button>
        <div className="w-full text-center">
          <h1 className="text-3xl text-[color:var(--app-gold)] font-light tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Notifications
          </h1>
        </div>
      </div>

      <div className="page-safe-x pt-6 space-y-3">
        {isNativeApp() && permissionState === 'not-granted' && (
          <div className="rounded-xl px-4 py-3 flex items-start gap-2.5" style={{ background: 'rgba(220,60,60,0.08)', border: '1px solid rgba(220,60,60,0.25)' }}>
            <Bell className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
            <p className="text-xs text-red-300">
              Notifications are turned off in your iPhone settings for this app. Enable them there to receive any of the reminders below.
            </p>
          </div>
        )}

        {CATEGORIES.map(({ key, label, Icon, description, control }) => {
          const pref = prefsByCategory[key];
          const enabled = pref?.enabled ?? false;
          const config = pref?.config ?? DEFAULT_CONFIG[key] ?? {};

          return (
            <div key={key} className="rounded-2xl p-4" style={{ background: 'var(--app-surface)', border: '1px solid rgba(201,169,98,0.2)' }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <Icon className="w-4 h-4 text-[color:var(--app-gold)] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <div className="min-w-0">
                    <p className="text-sm text-[color:var(--app-text)] font-light" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px' }}>
                      {label}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--app-text-3)' }}>{description}</p>
                  </div>
                </div>
                <button
                  role="switch"
                  aria-checked={enabled}
                  aria-label={`Toggle ${label} notifications`}
                  disabled={saving === key}
                  onClick={() => toggleCategory(key, !enabled)}
                  className="flex-shrink-0 w-11 h-6 rounded-full relative transition-colors disabled:opacity-50"
                  style={{ background: enabled ? '#C9A962' : 'rgba(201,169,98,0.2)' }}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                    style={{ transform: enabled ? 'translateX(22px)' : 'translateX(2px)' }}
                  />
                </button>
              </div>

              {enabled && control === 'offset' && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {OFFSET_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setConfig(key, { ...config, offset_minutes: opt.value })}
                      className="px-3 py-1.5 rounded-full text-xs transition-all"
                      style={{
                        background: config.offset_minutes === opt.value ? 'rgba(201,169,98,0.15)' : 'transparent',
                        border: `1px solid ${config.offset_minutes === opt.value ? 'rgba(201,169,98,0.5)' : 'rgba(201,169,98,0.2)'}`,
                        color: config.offset_minutes === opt.value ? 'var(--app-gold)' : 'var(--app-text-2)',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {enabled && control === 'time' && (
                <div className="mt-3">
                  <input
                    type="time"
                    value={config.time || '09:00'}
                    onChange={(e) => setConfig(key, { ...config, time: e.target.value })}
                    className="px-3 py-2 rounded-lg text-sm"
                    style={{ background: 'var(--app-bg)', border: '1px solid rgba(201,169,98,0.3)', color: 'var(--app-text)' }}
                  />
                </div>
              )}

              {enabled && control === 'daysBefore' && (
                <div className="flex flex-wrap gap-2 mt-3 items-center">
                  {[3, 1, 0].map((d) => {
                    const active = (config.days_before || []).includes(d);
                    return (
                      <button
                        key={d}
                        onClick={() => {
                          const current = config.days_before || [];
                          const next = active ? current.filter((x) => x !== d) : [...current, d];
                          setConfig(key, { ...config, days_before: next });
                        }}
                        className="px-3 py-1.5 rounded-full text-xs transition-all"
                        style={{
                          background: active ? 'rgba(201,169,98,0.15)' : 'transparent',
                          border: `1px solid ${active ? 'rgba(201,169,98,0.5)' : 'rgba(201,169,98,0.2)'}`,
                          color: active ? 'var(--app-gold)' : 'var(--app-text-2)',
                        }}
                      >
                        {d === 0 ? 'Day of' : `${d} day${d > 1 ? 's' : ''} before`}
                      </button>
                    );
                  })}
                  <input
                    type="time"
                    value={config.time || '09:00'}
                    onChange={(e) => setConfig(key, { ...config, time: e.target.value })}
                    className="px-3 py-2 rounded-lg text-sm"
                    style={{ background: 'var(--app-bg)', border: '1px solid rgba(201,169,98,0.3)', color: 'var(--app-text)' }}
                  />
                </div>
              )}

              {enabled && control === 'none' && (
                <p className="text-[11px] mt-2" style={{ color: 'var(--app-text-3)' }}>
                  Set the day and time from each routine or category itself.
                </p>
              )}
            </div>
          );
        })}

        <p className="text-center text-xs pt-2" style={{ color: 'var(--app-text-3)' }}>
          Tapping a notification takes you straight to what it's about.
        </p>
      </div>
    </div>
  );
}
