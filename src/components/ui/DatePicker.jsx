import React, { useState, useRef, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DatePicker({ value, onChange, placeholder = 'Select date', onOpenChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const parseLocalDate = (str) => { const [y, m, d] = str.split('-'); return new Date(+y, +m - 1, +d); };
  const [currentMonth, setCurrentMonth] = useState(value ? parseLocalDate(value) : new Date());
  const containerRef = useRef(null);

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (onOpenChange) onOpenChange(open);
  };

  const ui = {
    gold: 'var(--app-gold)', bg: 'var(--app-bg)', panel: 'var(--app-bg)', text: 'var(--app-text)',
    muted: 'var(--app-text-2)', muted2: 'var(--app-text-3)', border: 'rgba(201,169,98,0.3)',
    borderSoft: 'rgba(201,169,98,0.18)', wash: 'rgba(201,169,98,0.1)',
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) handleOpenChange(false);
    };
    const handleEscape = (event) => { if (event.key === 'Escape') handleOpenChange(false); };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = [];
    let day = startDate;
    while (day <= endDate) { days.push(day); day = addDays(day, 1); }
    return days;
  };

  const handleDateSelect = (date) => { onChange(format(date, 'yyyy-MM-dd')); handleOpenChange(false); };
  const days = getDaysInMonth();
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  const displayValue = value ? format(parseLocalDate(value), 'MMM d, yyyy') : '';

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => handleOpenChange(!isOpen)}
        className="w-full px-4 py-3 rounded-xl font-light flex items-center gap-3 transition-colors"
        style={{ backgroundColor: ui.panel, border: `1px solid ${ui.border}`, color: displayValue ? ui.text : ui.muted }}
      >
        <Calendar className="w-4 h-4" style={{ color: 'var(--app-gold)' }} strokeWidth={1.5} />
        <span className="flex-1 text-left">{displayValue || placeholder}</span>
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
            style={{ backgroundColor: ui.panel, border: `1px solid ${ui.border}` }}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[rgba(201,169,98,0.1)]">
                  <ChevronLeft className="w-5 h-5" style={{ color: 'var(--app-gold)' }} strokeWidth={1.5} />
                </button>
                <h3 className="text-sm font-light" style={{ color: ui.text }}>{format(currentMonth, 'MMMM yyyy')}</h3>
                <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[rgba(201,169,98,0.1)]">
                  <ChevronRight className="w-5 h-5" style={{ color: 'var(--app-gold)' }} strokeWidth={1.5} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div key={day} className="text-center text-xs font-light py-2" style={{ color: ui.muted2 }}>{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {weeks.map((week, weekIndex) =>
                  week.map((day, dayIndex) => {
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isSelected = value && isSameDay(day, parseLocalDate(value));
                    const isTodayDate = isToday(day);
                    return (
                      <button
                        key={`${weekIndex}-${dayIndex}`}
                        type="button"
                        onClick={() => handleDateSelect(day)}
                        className="aspect-square rounded-lg text-sm font-light transition-all relative"
                        style={{
                          color: isSelected ? ui.bg : isTodayDate ? ui.gold : isCurrentMonth ? ui.text : ui.muted2,
                          backgroundColor: isSelected ? ui.gold : 'transparent',
                          opacity: isCurrentMonth ? 1 : 0.4,
                          border: isTodayDate && !isSelected ? `2px solid ${ui.gold}` : 'none',
                        }}
                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = ui.wash; }}
                        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        {format(day, 'd')}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}