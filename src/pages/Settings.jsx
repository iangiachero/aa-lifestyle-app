import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CalendarDays, Globe, ChevronDown } from 'lucide-react';

const HOLIDAY_REGIONS = [
  { id: 'usa', label: 'USA Federal', emoji: '🇺🇸' },
  { id: 'christian', label: 'Christian', emoji: '✝️' },
  { id: 'jewish', label: 'Jewish', emoji: '🕎' },
  { id: 'islamic', label: 'Islamic', emoji: '🌙' },
  { id: 'hindu', label: 'Hindu', emoji: '🪔' },
  { id: 'buddhist', label: 'Buddhist', emoji: '☸️' },
  { id: 'chinese', label: 'Chinese', emoji: '🐉' },
  { id: 'mexican', label: 'Mexican', emoji: '🇲🇽' },
  { id: 'cultural', label: 'Cultural', emoji: '🎃' },
  { id: 'international', label: 'International', emoji: '🌍' },
  { id: 'seasonal', label: 'Seasonal', emoji: '☀️' },
];

const DEFAULT_CATEGORIES = ['usa', 'christian', 'cultural', 'seasonal'];

function getStoredCategories() {
  try {
    const stored = localStorage.getItem('holidayCategories');
    if (stored) return JSON.parse(stored);
  } catch {}
  const legacy = localStorage.getItem('showHolidays');
  if (legacy === 'false') return [];
  return DEFAULT_CATEGORIES;
}

export default function Settings() {
  const navigate = useNavigate();
  const [holidayCategories, setHolidayCategories] = useState(getStoredCategories);
  const [showRegions, setShowRegions] = useState(false);

  const showHolidays = holidayCategories.length > 0;

  const handleToggleHolidays = (val) => {
    const next = val ? DEFAULT_CATEGORIES : [];
    setHolidayCategories(next);
    localStorage.setItem('holidayCategories', JSON.stringify(next));
    localStorage.setItem('showHolidays', String(val));
    window.dispatchEvent(new StorageEvent('storage', { key: 'holidayCategories', newValue: JSON.stringify(next) }));
    window.dispatchEvent(new StorageEvent('storage', { key: 'showHolidays', newValue: String(val) }));
  };

  const toggleCategory = (catId) => {
    const next = holidayCategories.includes(catId)
      ? holidayCategories.filter((c) => c !== catId)
      : [...holidayCategories, catId];
    setHolidayCategories(next);
    localStorage.setItem('holidayCategories', JSON.stringify(next));
    localStorage.setItem('showHolidays', String(next.length > 0));
    window.dispatchEvent(new StorageEvent('storage', { key: 'holidayCategories', newValue: JSON.stringify(next) }));
    window.dispatchEvent(new StorageEvent('storage', { key: 'showHolidays', newValue: String(next.length > 0) }));
  };

  return (
    <div className="min-h-full pb-8 bg-[color:var(--app-bg)]">
      <div className="relative border-b-2 border-[rgba(201,169,98,0.25)] page-safe-x py-6">
        <button onClick={() => navigate(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity">
          <ChevronLeft className="w-6 h-6 text-[color:var(--app-gold)]" strokeWidth={1.5} />
        </button>
        <div className="w-full text-center">
          <h1 className="text-3xl text-[color:var(--app-gold)] font-light tracking-wide">Settings</h1>
        </div>
      </div>

      <div className="page-safe-x pt-6 space-y-6">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: '1px solid rgba(201,169,98,0.18)',
            backgroundColor: 'var(--app-wash-soft)',
          }}
        >
          <div
            className="px-5 py-3 text-[10px] font-semibold tracking-widest uppercase"
            style={{ color: 'rgba(201,169,98,0.55)', borderBottom: '1px solid rgba(201,169,98,0.10)' }}
          >
            Calendar
          </div>

          {/* Main holidays toggle */}
          <div className="px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'rgba(201,169,98,0.12)', border: '1px solid rgba(201,169,98,0.20)' }}
              >
                <CalendarDays className="w-4 h-4" style={{ color: 'var(--app-gold)' }} strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium" style={{ color: 'var(--app-text)' }}>
                  Show Holidays
                </div>
                <div className="text-xs mt-0.5 font-light" style={{ color: 'var(--app-text-3)' }}>
                  Display holidays in your calendar
                </div>
              </div>
            </div>

            <button
              onClick={() => handleToggleHolidays(!showHolidays)}
              className="flex-shrink-0 transition-all duration-200"
              style={{
                width: 48,
                height: 28,
                borderRadius: 14,
                backgroundColor: showHolidays ? '#C9A962' : 'var(--app-wash-2)',
                border: showHolidays ? '1px solid rgba(201,169,98,0.6)' : '1px solid var(--app-wash-2)',
                position: 'relative',
              }}
              aria-label="Toggle holidays"
            >
              <span
                className="absolute top-0.5 transition-all duration-200"
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  backgroundColor: showHolidays ? '#1A1612' : 'var(--app-text-2)',
                  left: showHolidays ? 'calc(100% - 24px)' : 2,
                }}
              />
            </button>
          </div>

          {/* Region selector */}
          {showHolidays && (
            <>
              <div style={{ borderTop: '1px solid rgba(201,169,98,0.08)' }}>
                <button
                  onClick={() => setShowRegions(!showRegions)}
                  className="w-full px-5 py-3.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'rgba(201,169,98,0.12)', border: '1px solid rgba(201,169,98,0.20)' }}
                    >
                      <Globe className="w-4 h-4" style={{ color: 'var(--app-gold)' }} strokeWidth={1.5} />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium" style={{ color: 'var(--app-text)' }}>
                        Holiday Regions
                      </div>
                      <div className="text-xs mt-0.5 font-light" style={{ color: 'var(--app-text-3)' }}>
                        {holidayCategories.length} {holidayCategories.length === 1 ? 'region' : 'regions'} selected
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    className="w-4 h-4 transition-transform duration-200"
                    style={{ color: 'var(--app-gold)', transform: showRegions ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    strokeWidth={1.5}
                  />
                </button>
              </div>

              {showRegions && (
                <div className="px-4 pb-4 pt-1">
                  <div className="flex flex-wrap gap-2">
                    {HOLIDAY_REGIONS.map((region) => {
                      const active = holidayCategories.includes(region.id);
                      return (
                        <button
                          key={region.id}
                          onClick={() => toggleCategory(region.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                          style={{
                            backgroundColor: active ? 'rgba(201,169,98,0.18)' : 'var(--app-wash)',
                            border: active
                              ? '1px solid rgba(201,169,98,0.45)'
                              : '1px solid var(--app-wash-2)',
                            color: active ? '#C9A962' : 'var(--app-text-3)',
                          }}
                        >
                          <span>{region.emoji}</span>
                          <span>{region.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
