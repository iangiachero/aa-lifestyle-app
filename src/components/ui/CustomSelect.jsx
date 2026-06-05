// src/components/ui/CustomSelect.jsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  className = '',
  style = {},
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  
  const ui = {
    gold: '#C9A962',
    panel: '#000000',
    text: '#F5F1E8',
    muted: '#B8B8B8',
    border: 'rgba(201,169,98,0.3)',
    wash: 'rgba(201,169,98,0.1)',
  };
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    const handleEscape = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);
  
  const selected = options.find((o) => String(o.value) === String(value));
  const displayLabel = selected ? selected.label : placeholder;
  const isPlaceholder = !selected;
  
  return (
    <div ref={containerRef} className={`relative ${className}`} style={style}>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="w-full px-4 py-3 rounded-xl font-light flex items-center justify-between gap-2 transition-colors outline-none"
        style={{
          backgroundColor: ui.panel,
          border: `1px solid ${isOpen ? ui.gold : ui.border}`,
          color: isPlaceholder ? ui.muted : ui.text,
        }}
      >
        <span className="truncate text-sm">{displayLabel}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-4 h-4" style={{ color: ui.gold }} strokeWidth={1.5} />
        </motion.span>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-xl z-50 overflow-hidden scrollbar-hide"
            style={{
              backgroundColor: ui.panel,
              border: `1px solid ${ui.border}`,
              maxHeight: '220px',
              overflowY: 'auto',
            }}
          >
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setIsOpen(false); }}
                  className="w-full px-4 py-3 text-left text-sm font-light transition-colors"
                  style={{
                    color: isSelected ? ui.gold : ui.text,
                    backgroundColor: isSelected ? 'rgba(201,169,98,0.12)' : 'transparent',
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = ui.wash; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {opt.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}