import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Bell, Calendar, CheckSquare, GraduationCap, Cake } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { requestNotificationPermission, hasNotificationPermission } from '../lib/notifications';
import { isNativeApp } from '../lib/platform';

/*
  One card per reminder the send-push edge function actually sends, and it
  reads these rows before sending. A category with no row counts as ON: push
  reminders were already going to everyone, so turning the settings on must
  not silently stop them. Never list a category send-push doesn't send — a
  toggle that controls nothing is an App Review 2.1 risk.
*/

const CATEGORIES = [
  {
    key: 'calendar', label: 'Calendar', Icon: Calendar,
    description: 'Upcoming events, based on the reminder time you choose',
    control: 'offset',
  },
  {
    key: 'birthdays', label: 'Birthdays', Icon: Cake,
    description: 'On the morning of each birthday in your Birthday Tracker',
  },
  {
    key: 'tasks', label: 'Tasks', Icon: CheckSquare,
    description: 'Each morning, how many tasks are due that day',
  },
  {
    key: 'school', label: 'School', Icon: GraduationCap,
    description: 'The evening before assignments and exams are due',
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
};

export default function NotificationSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(null);
  const [permissionState, setPermissionState] = useState('unknown');
  const [saveError, setSaveError] = useState(null);

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
    setSaveError(null);
    const existing = prefsByCategory[category];
    const payload = {
      user_id: user.id,
      category,
      enabled: existing?.enabled ?? true,
      config: existing?.config ?? DEFAULT_CONFIG[category] ?? {},
      ...updates,
    };
    const { error } = await supabase.from('notification_preferences').upsert(payload, { onConflict: 'user_id,category' });
    if (error) setSaveError('Could not save your notification settings. Please try again.');
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
          const enabled = pref?.enabled ?? true;
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
            </div>
          );
        })}

        {saveError && (
          <p className="text-center text-xs pt-2 text-red-400">{saveError}</p>
        )}
      </div>
    </div>
  );
}
