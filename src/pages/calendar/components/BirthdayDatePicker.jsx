//src/pages/calendar/components/BirthdayDatePicker.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UI } from '../constants';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

const ITEM_HEIGHT = 52;
const VISIBLE_ITEMS = 5;
const DRUM_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

function DrumColumn({ items, selectedIndex, onSelect, width }) {
  const listRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startScrollTop = useRef(0);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = selectedIndex * ITEM_HEIGHT;
    }
  }, [selectedIndex]);

  const snapToNearest = useCallback(() => {
    if (!listRef.current) return;
    const rawIndex = listRef.current.scrollTop / ITEM_HEIGHT;
    const snapped = Math.round(rawIndex);
    const clamped = Math.max(0, Math.min(snapped, items.length - 1));
    listRef.current.scrollTop = clamped * ITEM_HEIGHT;
    onSelect(clamped);
  }, [items.length, onSelect]);

  const handleScroll = useCallback(() => {
    if (!isDragging.current && listRef.current) {
      clearTimeout(listRef.current._snapTimer);
      listRef.current._snapTimer = setTimeout(snapToNearest, 120);
    }
  }, [snapToNearest]);

  const handleTouchStart = (e) => {
    isDragging.current = true;
    startY.current = e.touches[0].clientY;
    startScrollTop.current = listRef.current.scrollTop;
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    const delta = startY.current - e.touches[0].clientY;
    listRef.current.scrollTop = startScrollTop.current + delta;
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    snapToNearest();
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
    startY.current = e.clientY;
    startScrollTop.current = listRef.current.scrollTop;
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    const delta = startY.current - e.clientY;
    listRef.current.scrollTop = startScrollTop.current + delta;
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    snapToNearest();
  }, [snapToNearest]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div
      style={{
        position: 'relative',
        width: width || 'auto',
        height: DRUM_HEIGHT,
        overflow: 'hidden',
        cursor: 'grab',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: ITEM_HEIGHT,
          transform: 'translateY(-50%)',
          backgroundColor: `${UI.birthdayColor}18`,
          borderTop: `1px solid ${UI.birthdayColor}40`,
          borderBottom: `1px solid ${UI.birthdayColor}40`,
          borderRadius: 8,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: ITEM_HEIGHT * 2,
          background: `linear-gradient(to bottom, ${UI.panel} 0%, transparent 100%)`,
          pointerEvents: 'none',
          zIndex: 3,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: ITEM_HEIGHT * 2,
          background: `linear-gradient(to top, ${UI.panel} 0%, transparent 100%)`,
          pointerEvents: 'none',
          zIndex: 3,
        }}
      />
      <div
        ref={listRef}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        style={{
          height: '100%',
          overflowY: 'scroll',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingTop: ITEM_HEIGHT * 2,
          paddingBottom: ITEM_HEIGHT * 2,
        }}
        className="scrollbar-hide"
      >
        {items.map((item, i) => (
          <div
            key={i}
            onClick={() => {
              onSelect(i);
              if (listRef.current) {
                listRef.current.scrollTo({ top: i * ITEM_HEIGHT, behavior: 'smooth' });
              }
            }}
            style={{
              height: ITEM_HEIGHT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: i === selectedIndex ? '1rem' : '0.875rem',
              fontWeight: i === selectedIndex ? 500 : 300,
              color: i === selectedIndex ? UI.birthdayColor : UI.muted2,
              transition: 'color 0.15s, font-size 0.15s',
              cursor: 'pointer',
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BirthdayDatePicker({ show, value, onChange, onClose }) {
  const currentYear = new Date().getFullYear();

  const parseInitial = () => {
    if (value) {
      const [y, m, d] = value.split('-').map(Number);
      return { monthIdx: m - 1, day: d, year: y };
    }
    return { monthIdx: new Date().getMonth(), day: new Date().getDate(), year: currentYear };
  };

  const [sel, setSel] = useState(parseInitial);

  useEffect(() => {
    if (show) setSel(parseInitial());
  }, [show, value]);

  const years = Array.from({ length: 101 }, (_, i) => String(currentYear - i));
  const days = Array.from(
    { length: daysInMonth(sel.monthIdx + 1, sel.year) },
    (_, i) => String(i + 1).padStart(2, '0')
  );

  const clampedDay = Math.min(sel.day, days.length);

  const handleConfirm = () => {
    const mm = String(sel.monthIdx + 1).padStart(2, '0');
    const dd = String(clampedDay).padStart(2, '0');
    onChange(`${sel.year}-${mm}-${dd}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 200 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 201,
              backgroundColor: UI.panel,
              borderRadius: '20px 20px 0 0',
              borderTop: `2px solid ${UI.birthdayColor}50`,
              padding: '28px 24px 120px',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div
                style={{
                  display: 'inline-block',
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: `${UI.birthdayColor}40`,
                  marginBottom: 20,
                }}
              />
              <p
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 300,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: UI.muted,
                  marginBottom: 0,
                }}
              >
                Select Birthday
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 12,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <DrumColumn
                items={MONTHS}
                selectedIndex={sel.monthIdx}
                onSelect={(i) => setSel((s) => ({ ...s, monthIdx: i }))}
                width={150}
              />
              <DrumColumn
                items={days}
                selectedIndex={clampedDay - 1}
                onSelect={(i) => setSel((s) => ({ ...s, day: i + 1 }))}
                width={68}
              />
              <DrumColumn
                items={years}
                selectedIndex={years.indexOf(String(sel.year))}
                onSelect={(i) => setSel((s) => ({ ...s, year: Number(years[i]) }))}
                width={82}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  height: 52,
                  borderRadius: 14,
                  border: `1px solid ${UI.border}`,
                  backgroundColor: UI.panel2,
                  color: UI.muted,
                  fontSize: '0.875rem',
                  fontWeight: 300,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  flex: 1,
                  height: 52,
                  borderRadius: 14,
                  border: 'none',
                  backgroundColor: UI.birthdayColor,
                  color: '#FFFFFF',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}