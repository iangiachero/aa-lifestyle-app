import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TimePicker({ value, onChange, placeholder = 'Select time' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const ui = {
    gold: 'var(--app-gold)',
    bg: 'var(--app-bg)',
    panel: 'var(--app-bg)',
    text: 'var(--app-text)',
    muted: 'var(--app-text-2)',
    muted2: 'var(--app-text-3)',
    border: 'rgba(201,169,98,0.3)',
    borderSoft: 'rgba(201,169,98,0.18)',
    wash: 'rgba(201,169,98,0.1)',
  };

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  const [selectedHour, selectedMinute] = value ? value.split(':') : ['09', '00'];

  function formatDisplay(val) {
    if (!val) return null;
    const [h, m] = val.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  }

  function hourLabel(h) {
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${ampm}`;
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  const handleHourSelect = (hour) => {
    onChange(`${hour}:${selectedMinute}`);
  };

  const handleMinuteSelect = (minute) => {
    onChange(`${selectedHour}:${minute}`);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-xl font-light flex items-center gap-3 transition-colors"
        style={{
          backgroundColor: ui.panel,
          border: `1px solid ${ui.border}`,
          color: value ? ui.text : ui.muted,
        }}
      >
        <Clock className="w-4 h-4" style={{ color: 'var(--app-gold)' }} strokeWidth={1.5} />
        <span className="flex-1 text-left">{formatDisplay(value) || placeholder}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl z-[200] overflow-hidden"
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              backgroundColor: ui.panel,
              border: `1px solid ${ui.border}`,
            }}
          >
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-light mb-2 text-center" style={{ color: ui.muted }}>
                    Hour
                  </div>
                  <div className="max-h-48 overflow-y-auto scrollbar-hide">
                    {hours.map((hour) => {
                      const isSelected = hour === selectedHour;
                      return (
                        <button
                          key={hour}
                          type="button"
                          onClick={() => handleHourSelect(hour)}
                          className="w-full py-2 px-3 text-sm font-light rounded-lg transition-all mb-1"
                          style={{
                            backgroundColor: isSelected ? ui.gold : 'transparent',
                            color: isSelected ? ui.bg : ui.text,
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = ui.wash;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          {hourLabel(hour)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-light mb-2 text-center" style={{ color: ui.muted }}>
                    Minute
                  </div>
                  <div className="max-h-48 overflow-y-auto scrollbar-hide">
                    {minutes.map((minute) => {
                      const isSelected = minute === selectedMinute;
                      return (
                        <button
                          key={minute}
                          type="button"
                          onClick={() => handleMinuteSelect(minute)}
                          className="w-full py-2 px-3 text-sm font-light rounded-lg transition-all mb-1"
                          style={{
                            backgroundColor: isSelected ? ui.gold : 'transparent',
                            color: isSelected ? ui.bg : ui.text,
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = ui.wash;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          {minute}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}