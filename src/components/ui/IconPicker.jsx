// src/components/ui/IconPicker.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '../../hooks/useDebounce';
import { searchIconifyIcons, getIconifyIconUrl } from '../../services/iconifyService';

export const DEFAULT_ICON = 'mdi:home-outline';

// Shown before the user types anything, so the picker is useful on open instead
// of an empty "search for an icon" panel.
const SUGGESTED_ICONS = [
  'mdi:home-outline', 'mdi:silverware-fork-knife', 'mdi:bed', 'mdi:sofa',
  'mdi:shower', 'mdi:washing-machine', 'mdi:hanger', 'mdi:fridge-outline',
  'mdi:broom', 'mdi:leaf', 'mdi:package-variant', 'mdi:archive-outline',
  'mdi:door', 'mdi:monitor', 'mdi:garage', 'mdi:car',
  'mdi:paw', 'mdi:flower', 'mdi:tools', 'mdi:lightbulb-outline',
  'mdi:baby-carriage', 'mdi:book-open-outline', 'mdi:dumbbell', 'mdi:palette',
];

// Results are cached per query for the lifetime of the page: re-typing or
// backspacing through a word no longer re-hits the network.
const searchCache = new Map();

/**
 * Icon picker popover. Controlled: pass the selected Iconify id as `value`.
 * `anchor` = 'left' | 'right' controls which edge the panel aligns to.
 */
export default function IconPicker({ value, onChange, anchor = 'left', disabled = false }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const containerRef = useRef(null);
  const panelRef = useRef(null);
  const searchRef = useRef(null);
  // The panel is portalled to <body> and positioned from the trigger's rect:
  // rendered in place it was clipped by the sheet's own scroll container, which
  // cut off the bottom row of icons once the keyboard shrank the sheet.
  const [pos, setPos] = useState(null);

  const PANEL_W = 280;

  const computePos = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const kb = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--kb-height')
    ) || 0;
    const visibleBottom = window.innerHeight - kb;
    const gap = 8, margin = 12;
    const left = Math.max(margin, Math.min(r.left, window.innerWidth - PANEL_W - margin));
    const below = visibleBottom - r.bottom - gap - margin;
    const above = r.top - gap - margin;
    // Prefer opening downwards, but flip up when the keyboard leaves no room.
    const openUp = below < 200 && above > below;
    const maxHeight = Math.max(150, Math.min(320, openUp ? above : below));
    setPos({
      left,
      top: openUp ? undefined : r.bottom + gap,
      bottom: openUp ? window.innerHeight - r.top + gap : undefined,
      maxHeight,
    });
  }, []);
  // Monotonic token: only the newest search may write results. Without this a
  // slow early request could land after a faster later one and show icons for
  // a query the user already moved on from.
  const requestSeq = useRef(0);

  const debouncedQuery = useDebounce(query, 200);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (q.length < 2) {
      requestSeq.current++;      // invalidate anything in flight
      setResults([]);
      setIsSearching(false);
      return;
    }

    if (searchCache.has(q)) {
      requestSeq.current++;
      setResults(searchCache.get(q));
      setIsSearching(false);
      return;
    }

    const seq = ++requestSeq.current;
    setIsSearching(true);
    searchIconifyIcons(q).then((icons) => {
      searchCache.set(q, icons);
      if (seq !== requestSeq.current) return;   // a newer query superseded this one
      setResults(icons);
      setIsSearching(false);
    }).catch(() => {
      if (seq !== requestSeq.current) return;
      setResults([]);
      setIsSearching(false);
    });
  }, [debouncedQuery]);

  useEffect(() => {
    if (open) {
      computePos();
      setTimeout(() => searchRef.current?.focus({ preventScroll: true }), 120);
    } else {
      setQuery('');
      setResults([]);
      setIsSearching(false);
      setPos(null);
    }
  }, [open, computePos]);

  // Keep the panel glued to the trigger while the sheet scrolls, the window
  // resizes, or the keyboard opens and changes the space available.
  useEffect(() => {
    if (!open) return;
    const update = () => computePos();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    window.visualViewport?.addEventListener('resize', update);
    const id = setInterval(update, 250);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      window.visualViewport?.removeEventListener('resize', update);
      clearInterval(id);
    };
  }, [open, computePos]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      const inTrigger = containerRef.current?.contains(e.target);
      const inPanel = panelRef.current?.contains(e.target);
      if (!inTrigger && !inPanel) setOpen(false);
    };
    const onEsc = (e) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); } };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const select = useCallback((iconId) => {
    onChange(iconId);
    setOpen(false);
  }, [onChange]);

  const shown = query.trim().length >= 2 ? results : SUGGESTED_ICONS;
  const showingSuggestions = query.trim().length < 2;

  return (
    <div className="relative flex-shrink-0" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className={`w-12 h-12 flex items-center justify-center rounded-xl border transition-all disabled:opacity-40 ${
          open
            ? 'border-[#C9A962] bg-[rgba(201,169,98,0.1)]'
            : 'border-[rgba(201,169,98,0.3)] bg-[color:var(--app-bg)] hover:border-[rgba(201,169,98,0.55)]'
        }`}
        title={value ? 'Change icon' : 'Pick an icon'}
        aria-label={value ? 'Change icon' : 'Pick an icon'}
      >
        {value ? (
          <img src={getIconifyIconUrl(value)} alt="" className="w-6 h-6"
            onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            {[3, 10, 17].map(cx => [3, 10, 17].map(cy => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.5" fill="rgba(201,169,98,0.45)" />
            )))}
          </svg>
        )}
      </button>

      {createPortal(
      <AnimatePresence>
        {open && pos && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="fixed bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-[300] overflow-hidden flex flex-col"
            style={{
              left: pos.left,
              top: pos.top,
              bottom: pos.bottom,
              width: PANEL_W,
              maxWidth: 'calc(100vw - 1.5rem)',
              maxHeight: pos.maxHeight,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 pt-3 pb-2 border-b border-[rgba(201,169,98,0.15)] flex-shrink-0">
              <div className="flex items-center gap-2 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.25)] rounded-xl px-3 py-2">
                <Search className="w-3.5 h-3.5 text-[color:var(--app-text-3)] flex-shrink-0" strokeWidth={1.5} />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search icons..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                  className="flex-1 bg-transparent text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:outline-none text-xs"
                />
                {query && (
                  <button type="button" onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setQuery('')}
                    className="text-[color:var(--app-text-3)] hover:text-[color:var(--app-text-2)] transition-colors">
                    <X className="w-3 h-3" strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto scrollbar-hide overscroll-contain flex-1 min-h-0">
              {isSearching ? (
                <div className="flex items-center justify-center gap-2 py-8 text-[color:var(--app-text-3)] text-xs">
                  <div className="w-4 h-4 border border-[rgba(201,169,98,0.4)] border-t-[#C9A962] rounded-full animate-spin" />
                  Searching...
                </div>
              ) : shown.length === 0 ? (
                <div className="py-8 text-center text-[color:var(--app-text-3)] text-xs">
                  No icons found for &ldquo;{query}&rdquo;
                </div>
              ) : (
                <>
                  <p className="px-3 pt-2.5 text-[10px] uppercase tracking-wider text-[color:var(--app-text-3)]">
                    {showingSuggestions ? 'Suggested' : `${shown.length} results`}
                  </p>
                  <div className="p-3 pt-2 grid grid-cols-6 gap-1.5">
                    {shown.map((iconId) => (
                      <button
                        key={iconId}
                        type="button"
                        onClick={() => select(iconId)}
                        className={`aspect-square flex items-center justify-center rounded-lg transition-all border ${
                          value === iconId
                            ? 'border-[#C9A962] bg-[rgba(201,169,98,0.15)]'
                            : 'border-transparent hover:border-[rgba(201,169,98,0.35)] hover:bg-[rgba(201,169,98,0.08)]'
                        }`}
                        title={iconId}
                      >
                        <img src={getIconifyIconUrl(iconId)} alt="" className="w-6 h-6" loading="lazy"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body)}
    </div>
  );
}
