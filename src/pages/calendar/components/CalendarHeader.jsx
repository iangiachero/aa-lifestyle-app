// src/pages/calendar/components/CalendarHeader.jsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Plus, Trash2, Cake, X, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, isSameMonth, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UI, getBirthdayCountdown, calculateAge, getAgeOrdinal } from '../constants';
import BirthdayDatePicker from './BirthdayDatePicker';

const VIEW_MODES = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'daily', label: 'Daily' },
];

const QUICK_ADD_TYPES = [
  { category: 'work', label: 'Meeting', defaultTitle: 'Meeting', color: '#8B7355' },
  { category: 'work', label: 'Work Block', defaultTitle: 'Work Block', color: '#8B7355' },
  { category: 'health', label: 'Gym', defaultTitle: 'Gym', color: '#A67C52' },
  { category: 'personal', label: 'Personal', defaultTitle: 'Personal', color: 'var(--app-gold)' },
  { category: 'social', label: 'Social', defaultTitle: 'Social', color: '#B8956A' },
  { category: 'school', label: 'Study Session', defaultTitle: 'Study Session', color: '#D4AF37' },
];

function GridIcon({ size = 20, color = 'currentColor' }) {
  const gap = 2.5;
  const sq = (size - gap * 3) / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <rect x={gap} y={gap} width={sq} height={sq} rx={2} stroke={color} strokeWidth={1.5} />
      <rect x={gap * 2 + sq} y={gap} width={sq} height={sq} rx={2} stroke={color} strokeWidth={1.5} />
      <rect x={gap} y={gap * 2 + sq} width={sq} height={sq} rx={2} stroke={color} strokeWidth={1.5} />
      <rect x={gap * 2 + sq} y={gap * 2 + sq} width={sq} height={sq} rx={2} stroke={color} strokeWidth={1.5} />
    </svg>
  );
}

function getDateLabel(viewMode, selectedDate, weekDates) {
  if (viewMode === 'monthly') return format(selectedDate, 'MMMM yyyy').toUpperCase();
  if (viewMode === 'weekly' && weekDates && weekDates.length === 7) {
    const start = weekDates[0];
    const end = weekDates[6];
    if (isSameMonth(start, end)) return `${format(start, 'MMM d')} – ${format(end, 'd, yyyy')}`.toUpperCase();
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`.toUpperCase();
  }
  if (viewMode === 'daily') return format(selectedDate, 'EEEE, MMM d').toUpperCase();
  return format(selectedDate, 'MMMM yyyy').toUpperCase();
}

function formatBirthDate(dateStr) {
  try {
    return format(parseISO(dateStr), 'MMMM d');
  } catch {
    return dateStr;
  }
}

function LeftDrawer({ open, onClose, onQuickAdd, birthdays, onAddBirthday, onDeleteBirthday }) {
  const [showBdForm, setShowBdForm] = useState(false);
  const [bdForm, setBdForm] = useState({ name: '', birth_date: '' });
  const [bdSaving, setBdSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setShowBdForm(false);
      setBdForm({ name: '', birth_date: '' });
      setShowDatePicker(false);
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleAddBirthday = async () => {
    if (!bdForm.name.trim() || !bdForm.birth_date) return;
    setBdSaving(true);
    await onAddBirthday(bdForm);
    setBdForm({ name: '', birth_date: '' });
    setShowBdForm(false);
    setBdSaving(false);
  };

  const handleQuickAdd = (type) => {
    onClose();
    onQuickAdd(type.category, type.defaultTitle, type.color);
  };

  const formatSelectedDate = (dateStr) => {
    if (!dateStr) return 'Select Date';
    try {
      return format(parseISO(dateStr), 'MMMM d, yyyy');
    } catch {
      return 'Select Date';
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex" style={{ pointerEvents: 'auto' }}>
          <motion.div
            key="drawer-panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            className="relative flex flex-col h-full overflow-hidden"
            style={{
              width: '78vw',
              maxWidth: 340,
              backgroundColor: UI.panel2,
              borderRight: `1px solid rgba(201,169,98,0.22)`,
              boxShadow: '4px 0 40px rgba(0,0,0,0.75)',
              zIndex: 2,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-5 pt-10 pb-4"
              style={{ borderBottom: `1px solid rgba(201,169,98,0.16)` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(201,169,98,0.25) 0%, rgba(201,169,98,0.08) 100%)',
                    border: `1px solid rgba(201,169,98,0.35)`,
                  }}
                >
                  <span style={{ color: 'var(--app-gold)', fontSize: 13, fontFamily: 'Georgia, serif', fontWeight: 400 }}>C</span>
                </div>
                <div>
                  <p
                    style={{
                      color: 'var(--app-gold)',
                      fontSize: 17,
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      fontWeight: 300,
                      letterSpacing: '0.12em',
                      lineHeight: 1.2,
                    }}
                  >
                    Calendar
                  </p>
                  <p style={{ color: UI.muted2, fontSize: 10, letterSpacing: '0.12em', fontWeight: 300 }}>
                    ORGANIZER
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-colors active:scale-95"
                style={{ backgroundColor: 'var(--app-wash)', border: '1px solid var(--app-wash-2)' }}
              >
                <X className="w-4 h-4" style={{ color: UI.muted }} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ paddingBottom: 32 }}>
              <div className="px-5 pt-5 pb-4">
                <p
                  className="text-xs uppercase tracking-widest mb-4"
                  style={{ color: 'var(--app-gold)', fontWeight: 400, letterSpacing: '0.20em', opacity: 0.85 }}
                >
                  Quick Add Event
                </p>
                <div className="flex flex-col gap-2">
                  {QUICK_ADD_TYPES.map((type) => (
                    <button
                      key={`${type.category}-${type.label}`}
                      onClick={() => handleQuickAdd(type)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-[0.98]"
                      style={{
                        backgroundColor: `${type.color}0E`,
                        border: `1px solid ${type.color}30`,
                      }}
                    >
                      <div
                        className="w-1 self-stretch rounded-full flex-shrink-0"
                        style={{ backgroundColor: type.color, minHeight: 16 }}
                      />
                      <span
                        className="flex-1 text-left text-sm font-light"
                        style={{ color: UI.text, letterSpacing: '0.04em' }}
                      >
                        {type.label}
                      </span>
                      <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: type.color, opacity: 0.6 }} strokeWidth={1.5} />
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ height: 1, backgroundColor: 'rgba(201,169,98,0.10)', margin: '0 20px 0 20px' }} />

              <div className="px-5 pt-4 pb-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Cake className="w-4 h-4" style={{ color: UI.birthdayColor }} strokeWidth={1.5} />
                    <p
                      className="text-xs uppercase tracking-widest"
                      style={{ color: UI.birthdayColor, fontWeight: 400, letterSpacing: '0.20em', opacity: 0.9 }}
                    >
                      Birthday Tracker
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBdForm((v) => !v)}
                    className="w-7 h-7 flex items-center justify-center rounded-full transition-all active:scale-90"
                    style={{
                      backgroundColor: showBdForm ? `${UI.birthdayColor}22` : `${UI.birthdayColor}12`,
                      border: `1px solid ${UI.birthdayColor}40`,
                    }}
                  >
                    <Plus
                      className="w-3.5 h-3.5"
                      strokeWidth={2}
                      style={{
                        color: UI.birthdayColor,
                        transform: showBdForm ? 'rotate(45deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </button>
                </div>

                <AnimatePresence>
                  {showBdForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden mb-4"
                    >
                      <div
                        className="rounded-xl p-4 space-y-3"
                        style={{
                          backgroundColor: 'rgba(244,114,182,0.05)',
                          border: `1px solid ${UI.birthdayColor}28`,
                        }}
                      >
                        <input
                          type="text"
                          value={bdForm.name}
                          onChange={(e) => setBdForm({ ...bdForm, name: e.target.value })}
                          placeholder="Name"
                          className="w-full px-3 py-2.5 rounded-lg text-sm font-light outline-none"
                          style={{
                            backgroundColor: UI.panel,
                            border: `1px solid rgba(201,169,98,0.18)`,
                            color: UI.text,
                          }}
                        />
                        
                        <button
                          type="button"
                          onClick={() => setShowDatePicker(true)}
                          className="w-full px-3 py-2.5 rounded-lg text-sm font-light outline-none flex items-center justify-between transition-colors"
                          style={{
                            backgroundColor: UI.panel,
                            border: `1px solid rgba(201,169,98,0.18)`,
                            color: bdForm.birth_date ? UI.text : UI.muted2,
                          }}
                        >
                          <span>{formatSelectedDate(bdForm.birth_date)}</span>
                          <CalendarIcon className="w-4 h-4" style={{ color: UI.birthdayColor, opacity: 0.6 }} strokeWidth={1.5} />
                        </button>

                        <div className="flex gap-2">
                          <button
                            onClick={() => { 
                              setShowBdForm(false); 
                              setBdForm({ name: '', birth_date: '' }); 
                              setShowDatePicker(false);
                            }}
                            className="flex-1 py-2 rounded-lg text-xs font-light transition-colors"
                            style={{
                              backgroundColor: 'transparent',
                              border: `1px solid rgba(201,169,98,0.22)`,
                              color: UI.muted,
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAddBirthday}
                            disabled={!bdForm.name.trim() || !bdForm.birth_date || bdSaving}
                            className="flex-1 py-2 rounded-lg text-xs font-light disabled:opacity-40 transition-opacity"
                            style={{ backgroundColor: UI.birthdayColor, color: '#fff' }}
                          >
                            {bdSaving ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {birthdays.length === 0 && !showBdForm ? (
                  <div className="flex flex-col items-center py-6 gap-2">
                    <Cake className="w-8 h-8 opacity-15" style={{ color: UI.birthdayColor }} strokeWidth={1.5} />
                    <p className="text-xs text-center" style={{ color: UI.muted2 }}>
                      No birthdays added yet
                    </p>
                    <p className="text-xs text-center" style={{ color: UI.muted2, opacity: 0.6 }}>
                      Tap + to add one
                    </p>
                  </div>
                ) : (
                  <div
                    className="birthday-list flex flex-col gap-2"
                    style={{
                      maxHeight: 460,
                      overflowY: 'auto',
                      scrollBehavior: 'smooth',
                      paddingRight: 4,
                    }}
                  >
                    {[...birthdays]
                      .sort((a, b) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const getDays = (dateStr) => {
                          const [, m, d] = dateStr.split('-').map(Number);
                          const next = new Date(today.getFullYear(), m - 1, d);
                          next.setHours(0, 0, 0, 0);
                          if (next < today) next.setFullYear(today.getFullYear() + 1);
                          return Math.round((next - today) / (1000 * 60 * 60 * 24));
                        };
                        return getDays(a.birth_date) - getDays(b.birth_date);
                      })
                      .map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={{
                          backgroundColor: `${UI.birthdayColor}0A`,
                          border: `1px solid ${UI.birthdayColor}22`,
                        }}
                      >
                        <Cake className="w-4 h-4 flex-shrink-0" style={{ color: UI.birthdayColor, opacity: 0.8 }} strokeWidth={1.5} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-light truncate" style={{ color: UI.text }}>
                            {b.name}
                            {calculateAge(b.birth_date) !== null && (
                              <span className="ml-1.5 text-xs" style={{ color: UI.birthdayColor, opacity: 0.75 }}>
                                ({calculateAge(b.birth_date)})
                              </span>
                            )}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: UI.birthdayColor, opacity: 0.75 }}>
                            {formatBirthDate(b.birth_date)}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: UI.birthdayColor }}>
                            {getBirthdayCountdown(b.birth_date)}
                          </div>
                        </div>
                        <button
                          onClick={() => onDeleteBirthday(b.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-full transition-colors active:scale-90 flex-shrink-0"
                          style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)' }}
                        >
                          <Trash2 className="w-3.5 h-3.5" style={{ color: '#EF4444' }} strokeWidth={1.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="flex-1 h-full cursor-pointer"
            style={{ backgroundColor: 'rgba(0,0,0,0.62)', zIndex: 1 }}
            onClick={onClose}
          />

          <BirthdayDatePicker
            show={showDatePicker}
            value={bdForm.birth_date}
            onChange={(date) => {
              setBdForm({ ...bdForm, birth_date: date });
              setShowDatePicker(false);
            }}
            onClose={() => setShowDatePicker(false)}
          />
        </div>
      )}
    </AnimatePresence>
  );
}

export default function CalendarHeader({
  selectedDate,
  viewMode,
  weekDates,
  onViewModeChange,
  onQuickAdd,
  birthdays = [],
  onAddBirthday,
  onDeleteBirthday,
}) {
  const navigate = useNavigate();
  const [showLeftDrawer, setShowLeftDrawer] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);

  const rightRef = useRef(null);
  const dateLabel = getDateLabel(viewMode, selectedDate, weekDates);

  useEffect(() => {
    if (!showViewMenu) return;
    const handler = (e) => {
      if (rightRef.current && !rightRef.current.contains(e.target)) setShowViewMenu(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [showViewMenu]);

  return (
    <>
      <LeftDrawer
        open={showLeftDrawer}
        onClose={() => setShowLeftDrawer(false)}
        onQuickAdd={onQuickAdd}
        birthdays={birthdays}
        onAddBirthday={onAddBirthday}
        onDeleteBirthday={onDeleteBirthday}
      />

      <div className="flex-shrink-0" style={{ background: 'transparent' }}>
        <div
          className="relative px-5 pt-5 pb-4 flex items-center justify-center"
          style={{ borderBottom: `1px solid rgba(201,169,98,0.22)` }}
        >
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6" style={{ color: 'var(--app-gold)' }} strokeWidth={1.5} />
          </button>
          <h1
            className="text-center"
            style={{
              color: 'var(--app-gold)',
              fontSize: 22,
              fontWeight: 300,
              letterSpacing: '0.18em',
              fontFamily: 'Georgia, "Times New Roman", serif',
            }}
          >
            Calendar
          </h1>
        </div>

        <div className="flex items-center justify-between px-6 py-3">
          <button
            onClick={() => { setShowLeftDrawer((v) => !v); setShowViewMenu(false); }}
            className="w-9 h-9 flex items-center justify-center transition-opacity active:opacity-60 rounded-xl"
            style={{
              backgroundColor: showLeftDrawer ? 'rgba(201,169,98,0.12)' : 'transparent',
              border: showLeftDrawer ? `1px solid rgba(201,169,98,0.30)` : '1px solid transparent',
            }}
          >
            <Plus
              className="w-5 h-5"
              strokeWidth={1.5}
              style={{ color: showLeftDrawer ? UI.gold : UI.muted2 }}
            />
          </button>

          <span
            className="text-xs uppercase tracking-widest"
            style={{ color: UI.muted, fontWeight: 300, letterSpacing: '0.2em' }}
          >
            {dateLabel}
          </span>

          <div className="relative" ref={rightRef}>
            <button
              onClick={() => { setShowViewMenu((v) => !v); }}
              className="w-9 h-9 flex items-center justify-center transition-opacity active:opacity-60 rounded-xl"
              style={{
                backgroundColor: showViewMenu ? 'rgba(201,169,98,0.12)' : 'transparent',
                border: showViewMenu ? `1px solid rgba(201,169,98,0.30)` : '1px solid transparent',
              }}
            >
              <GridIcon size={20} color={showViewMenu ? UI.gold : UI.muted2} />
            </button>

            <AnimatePresence>
              {showViewMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="absolute top-11 right-0 z-50 rounded-xl overflow-hidden"
                  style={{
                    backgroundColor: UI.panel,
                    border: `1px solid rgba(201,169,98,0.22)`,
                    minWidth: 140,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
                  }}
                >
                  {VIEW_MODES.map((mode, i) => {
                    const isActive = viewMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => { onViewModeChange(mode.id); setShowViewMenu(false); }}
                        className="w-full flex items-center justify-between px-4 py-3 transition-colors"
                        style={{
                          color: isActive ? UI.gold : UI.muted,
                          backgroundColor: isActive ? 'rgba(201,169,98,0.08)' : 'transparent',
                          borderBottom: i < VIEW_MODES.length - 1 ? `1px solid rgba(201,169,98,0.10)` : 'none',
                          fontSize: 13,
                          fontWeight: isActive ? 500 : 300,
                          letterSpacing: '0.06em',
                        }}
                      >
                        <span>{mode.label}</span>
                        {isActive && (
                          <div
                            className="rounded-full"
                            style={{ width: 5, height: 5, backgroundColor: UI.gold }}
                          />
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}