import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CalendarDays } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();

  const [showHolidays, setShowHolidays] = useState(() => {
    const stored = localStorage.getItem('showHolidays');
    return stored === null ? true : stored === 'true';
  });

  const handleToggleHolidays = (val) => {
    setShowHolidays(val);
    localStorage.setItem('showHolidays', String(val));
    window.dispatchEvent(new StorageEvent('storage', { key: 'showHolidays', newValue: String(val) }));
  };

  return (
    <div className="min-h-full pb-8 bg-[#000000]">
      <div className="relative border-b-2 border-[rgba(201,169,98,0.25)] page-safe-x py-6">
        <button onClick={() => navigate(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity">
          <ChevronLeft className="w-6 h-6 text-[#C9A962]" strokeWidth={1.5} />
        </button>
        <div className="w-full text-center">
          <h1 className="text-3xl text-[#C9A962] font-light tracking-wide">Settings</h1>
        </div>
      </div>

      <div className="page-safe-x pt-6 space-y-6">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: '1px solid rgba(201,169,98,0.18)',
            backgroundColor: 'rgba(255,255,255,0.03)',
          }}
        >
          <div
            className="px-5 py-3 text-[10px] font-semibold tracking-widest uppercase"
            style={{ color: 'rgba(201,169,98,0.55)', borderBottom: '1px solid rgba(201,169,98,0.10)' }}
          >
            Calendar
          </div>

          <div className="px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'rgba(201,169,98,0.12)', border: '1px solid rgba(201,169,98,0.20)' }}
              >
                <CalendarDays className="w-4 h-4" style={{ color: '#C9A962' }} strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium" style={{ color: '#F5F1E8' }}>
                  Show USA Holidays
                </div>
                <div className="text-xs mt-0.5 font-light" style={{ color: '#6B6B6B' }}>
                  Display federal holidays in your calendar
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
                backgroundColor: showHolidays ? '#C9A962' : 'rgba(255,255,255,0.10)',
                border: showHolidays ? '1px solid rgba(201,169,98,0.6)' : '1px solid rgba(255,255,255,0.12)',
                position: 'relative',
              }}
              aria-label="Toggle USA holidays"
            >
              <span
                className="absolute top-0.5 transition-all duration-200"
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  backgroundColor: showHolidays ? '#1A1612' : '#B8B8B8',
                  left: showHolidays ? 'calc(100% - 24px)' : 2,
                }}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
