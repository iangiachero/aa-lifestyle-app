// src/pages/homeorganization/components/Create.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Plus, X, Check, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '../../../hooks/useDebounce';
import { searchIconifyIcons, getIconifyIconUrl } from '../../../services/iconifyService';
import ColorPicker from '../../../components/ui/ColorPicker';
import { useModal } from '../../../context/ModalContext';

/* === CREATE MODAL STYLING CONFIGURATION === */
const STYLE = {
  overlay: 'fixed inset-0 bg-black/60 z-[100] flex items-end',
  sheet: 'w-full bg-[#000000] rounded-t-[2rem] border-t border-[rgba(201,169,98,0.25)] max-h-[90vh] flex flex-col',
  header: 'sticky top-0 bg-[#000000] px-6 pt-5 pb-4 flex items-center justify-between border-b border-[rgba(201,169,98,0.15)]',
  title: 'text-xl text-[#C9A962] font-light',
  subtitle: 'text-xs text-[#B8B8B8] mt-0.5',
  label: 'text-xs text-[#B8B8B8] font-light uppercase tracking-wider mb-2 block',
  input: 'w-full bg-[#000000] border border-[rgba(201,169,98,0.3)] rounded-xl px-4 py-3 text-[#F5F1E8] placeholder-[#6B6B6B] focus:border-[#C9A962] focus:outline-none text-sm',
  chipActive: 'bg-[rgba(201,169,98,0.15)] border-[#C9A962] text-[#C9A962]',
  chipInactive: 'bg-[#000000] border-[rgba(201,169,98,0.3)] text-[#B8B8B8] hover:border-[rgba(201,169,98,0.5)]',
};
/* === END STYLING CONFIGURATION === */

const SECTION_OPTIONS = [
  { id: 'daily-reset-adhd',          label: 'Daily Reset (ADHD Quick Wins)',  icon: 'mdi:white-balance-sunny' },
  { id: 'weekly-cleaning',           label: 'Weekly Cleaning',                icon: 'mdi:calendar-week' },
  { id: 'monthly-deep-clean',        label: 'Monthly Deep Clean',             icon: 'mdi:broom' },
  { id: 'seasonal-reset',            label: 'Seasonal Reset',                 icon: 'mdi:leaf' },
  { id: 'kitchen-organization',      label: 'Kitchen Organization',           icon: 'mdi:silverware-fork-knife' },
  { id: 'pantry-organization',       label: 'Pantry Organization',            icon: 'mdi:package-variant' },
  { id: 'refrigerator-freezer',      label: 'Refrigerator & Freezer',         icon: 'mdi:fridge-outline' },
  { id: 'bedroom-organization',      label: 'Bedroom Organization',           icon: 'mdi:bed' },
  { id: 'closet-organization',       label: 'Closet Organization',            icon: 'mdi:hanger' },
  { id: 'bathroom-organization',     label: 'Bathroom Organization',          icon: 'mdi:shower' },
  { id: 'linen-closet',              label: 'Linen Closet',                   icon: 'mdi:layers-outline' },
  { id: 'laundry-room',              label: 'Laundry Room',                   icon: 'mdi:washing-machine' },
  { id: 'living-room-common-areas',  label: 'Living Room / Common Areas',     icon: 'mdi:sofa' },
  { id: 'entryway-mudroom',          label: 'Entryway / Mudroom',             icon: 'mdi:door' },
  { id: 'home-office-desk',          label: 'Home Office / Desk',             icon: 'mdi:monitor' },
  { id: 'storage-areas',             label: 'Storage Areas',                  icon: 'mdi:archive-outline' },
  { id: 'garage',                    label: 'Garage',                         icon: 'mdi:garage' },
  { id: 'under-bed-hidden-storage',  label: 'Under-Bed / Hidden Storage',     icon: 'mdi:package-variant-closed' },
  { id: 'digital-home-organization', label: 'Digital Home Organization',      icon: 'mdi:devices' },
  { id: 'decluttering-donation-prep',label: 'Decluttering & Donation Prep',   icon: 'mdi:recycle' },
  { id: 'moving-reset-checklist',    label: 'Moving / Reset Checklist',       icon: 'mdi:truck-outline' },
];

const DEFAULT_ICON = 'mdi:home-outline';

const EMPTY_FORM = {
  title: '',
  section: 'daily-reset-adhd',
  tasks: [],
  color_tag: '#6B7280',
};

export default function CreateModal({ visible, onClose, onAdd, defaultSection }) {
  const { openModal, closeModal } = useModal();
  const [form, setForm]               = useState({ ...EMPTY_FORM, section: defaultSection || 'daily-reset-adhd' });
  const [expandedTask, setExpandedTask] = useState(null);

  useEffect(() => {
    if (visible) {
      openModal();
      return () => closeModal();
    }
  }, [visible, openModal, closeModal]);

  // Icon picker state
  const [selectedIconId, setSelectedIconId]     = useState(null);
  const [showIconPicker, setShowIconPicker]      = useState(false);
  const [iconSearchQuery, setIconSearchQuery]    = useState('');
  const [iconSearchResults, setIconSearchResults] = useState([]);
  const [isSearching, setIsSearching]            = useState(false);

  const iconPickerRef  = useRef(null);
  const iconSearchRef  = useRef(null);
  const debouncedQuery = useDebounce(iconSearchQuery, 250);

  /* ── reset ── */
  const resetForm = () => {
    setForm({ ...EMPTY_FORM, section: defaultSection || 'daily-reset-adhd' });
    setExpandedTask(null);
    setSelectedIconId(null);
    setShowIconPicker(false);
    setIconSearchQuery('');
    setIconSearchResults([]);
  };

  const handleClose = () => { onClose(); resetForm(); };

  /* ── icon search ── */
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setIsSearching(true);
      searchIconifyIcons(debouncedQuery).then((results) => {
        setIconSearchResults(results);
        setIsSearching(false);
      });
    } else {
      setIconSearchResults([]);
      setIsSearching(false);
    }
  }, [debouncedQuery]);

  // Auto-focus search input when picker opens
  useEffect(() => {
    if (showIconPicker) {
      setTimeout(() => iconSearchRef.current?.focus(), 100);
    } else {
      setIconSearchQuery('');
      setIconSearchResults([]);
    }
  }, [showIconPicker]);

  // Click-outside & Esc to close picker
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (iconPickerRef.current && !iconPickerRef.current.contains(e.target)) {
        setShowIconPicker(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowIconPicker(false);
    };
    if (showIconPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [showIconPicker]);

  const handleIconSelect = (iconId) => {
    setSelectedIconId(iconId);
    setShowIconPicker(false);
  };

  const handleClearIcon = (e) => {
    e.stopPropagation();
    setSelectedIconId(null);
  };

  /* ── tasks ── */
  const addTask = () => {
    const newTask = { id: Date.now(), name: '' };
    setForm(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
    setExpandedTask(newTask.id);
  };

  const updateTask = (taskId, value) => {
    setForm(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, name: value } : t),
    }));
  };

  const removeTask = (taskId) => {
    setForm(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== taskId) }));
    if (expandedTask === taskId) setExpandedTask(null);
  };

  /* ── submit ── */
  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onAdd({
      title: form.title.trim(),
      icon: selectedIconId || DEFAULT_ICON,
      section: form.section,
      sub_tasks: form.tasks.filter(t => t.name.trim()).map(t => t.name.trim()),
      color_tag: form.color_tag,
    });
    handleClose();
  };

  const isValid = form.title.trim().length > 0;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={STYLE.overlay}
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={STYLE.sheet}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div className={STYLE.header}>
              <div>
                <h2 className={STYLE.title}>Create Task</h2>
                <p className={STYLE.subtitle}>Add a new home organization task</p>
              </div>
              <button onClick={handleClose} className="text-[#C9A962] hover:text-[#e2ba8b] transition-colors">
                <ChevronDown className="w-7 h-7" strokeWidth={1.5} />
              </button>
            </div>

            {/* ── Scrollable body ── */}
            <div
              className="overflow-y-auto flex-1 px-6 py-5 space-y-5 scrollbar-hide"
              style={{ paddingBottom: '3rem' }}
            >

              {/* ── 1. Icon + Title on the same row ── */}
              <div>
                <label className={STYLE.label}>Title</label>
                <div className="flex items-center gap-3">

                  {/* Icon trigger button */}
                  <div className="relative flex-shrink-0" ref={iconPickerRef}>
                    <button
                      onClick={() => setShowIconPicker(prev => !prev)}
                      className={`w-12 h-12 flex items-center justify-center rounded-xl border transition-all ${
                        showIconPicker
                          ? 'border-[#C9A962] bg-[rgba(201,169,98,0.1)]'
                          : 'border-[rgba(201,169,98,0.3)] bg-[#000000] hover:border-[rgba(201,169,98,0.55)]'
                      }`}
                      title={selectedIconId ? 'Change icon' : 'Pick an icon'}
                    >
                      {selectedIconId ? (
                        <img
                          src={getIconifyIconUrl(selectedIconId)}
                          alt=""
                          className="w-6 h-6"
                        />
                      ) : (
                        // Placeholder grid of dots
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          {[3,10,17].map(cx =>
                            [3,10,17].map(cy => (
                              <circle
                                key={`${cx}-${cy}`}
                                cx={cx} cy={cy} r="1.5"
                                fill="rgba(201,169,98,0.45)"
                              />
                            ))
                          )}
                        </svg>
                      )}
                    </button>

                    {/* Clear badge when icon selected */}
                    {selectedIconId && (
                      <button
                        onClick={handleClearIcon}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#000000] border border-[rgba(201,169,98,0.4)] rounded-full flex items-center justify-center hover:bg-[rgba(201,169,98,0.15)] transition-colors z-10"
                        title="Clear icon"
                      >
                        <X className="w-2.5 h-2.5 text-[#C9A962]" strokeWidth={2} />
                      </button>
                    )}

                    {/* ── Icon Picker Panel ── */}
                    <AnimatePresence>
                      {showIconPicker && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 top-full mt-2 w-72 bg-[#000000] border border-[rgba(201,169,98,0.3)] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-[200] overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Search bar inside picker */}
                          <div className="px-3 pt-3 pb-2 border-b border-[rgba(201,169,98,0.15)]">
                            <div className="flex items-center gap-2 bg-[#000000] border border-[rgba(201,169,98,0.25)] rounded-xl px-3 py-2">
                              <Search className="w-3.5 h-3.5 text-[#6B6B6B] flex-shrink-0" strokeWidth={1.5} />
                              <input
                                ref={iconSearchRef}
                                type="text"
                                placeholder="Search icons..."
                                value={iconSearchQuery}
                                onChange={(e) => setIconSearchQuery(e.target.value)}
                                className="flex-1 bg-transparent text-[#F5F1E8] placeholder-[#6B6B6B] focus:outline-none text-xs"
                              />
                              {iconSearchQuery && (
                                <button
                                  onClick={() => { setIconSearchQuery(''); setIconSearchResults([]); }}
                                  className="text-[#6B6B6B] hover:text-[#B8B8B8] transition-colors"
                                >
                                  <X className="w-3 h-3" strokeWidth={2} />
                                </button>
                              )}
                            </div>
                            {iconSearchQuery.length > 0 && iconSearchQuery.length < 2 && (
                              <p className="text-[10px] text-[#6B6B6B] mt-1.5 px-1">
                                Type at least 2 characters to search
                              </p>
                            )}
                          </div>

                          {/* Results area */}
                          <div
                            className="overflow-y-auto scrollbar-hide"
                            style={{ maxHeight: '220px' }}
                          >
                            {isSearching ? (
                              <div className="flex items-center justify-center gap-2 py-8 text-[#6B6B6B] text-xs">
                                <div className="w-4 h-4 border border-[rgba(201,169,98,0.4)] border-t-[#C9A962] rounded-full animate-spin" />
                                Searching...
                              </div>
                            ) : iconSearchQuery.length >= 2 && iconSearchResults.length === 0 ? (
                              <div className="py-8 text-center text-[#6B6B6B] text-xs">
                                No icons found for "{iconSearchQuery}"
                              </div>
                            ) : iconSearchResults.length > 0 ? (
                              /* Grid of icon results */
                              <div className="p-3 grid grid-cols-6 gap-1.5">
                                {iconSearchResults.map((iconId) => (
                                  <button
                                    key={iconId}
                                    onClick={() => handleIconSelect(iconId)}
                                    className={`aspect-square flex items-center justify-center rounded-lg transition-all border ${
                                      selectedIconId === iconId
                                        ? 'border-[#C9A962] bg-[rgba(201,169,98,0.15)]'
                                        : 'border-transparent hover:border-[rgba(201,169,98,0.35)] hover:bg-[rgba(201,169,98,0.08)]'
                                    }`}
                                    title={iconId}
                                  >
                                    <img
                                      src={getIconifyIconUrl(iconId)}
                                      alt=""
                                      className="w-6 h-6"
                                    />
                                  </button>
                                ))}
                              </div>
                            ) : (
                              /* Empty/idle state */
                              <div className="py-8 text-center">
                                <div className="text-2xl mb-1 opacity-30">⌕</div>
                                <p className="text-xs text-[#6B6B6B]">Search for an icon above</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Title input */}
                  <input
                    type="text"
                    placeholder="e.g., Wipe kitchen counters"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    className={`${STYLE.input} flex-1`}
                  />
                </div>
              </div>

              {/* ── 2. Section selector ── */}
              <div>
                <label className={STYLE.label}>Section</label>
                <div className="grid grid-cols-2 gap-2">
                  {SECTION_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setForm(prev => ({ ...prev, section: opt.id }))}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-light transition-all border ${
                        form.section === opt.id ? STYLE.chipActive : STYLE.chipInactive
                      }`}
                    >
                      <img src={getIconifyIconUrl(opt.icon)} alt="" className="w-5 h-5 flex-shrink-0" />
                      <span>{opt.label}</span>
                      {form.section === opt.id && (
                        <Check className="w-3 h-3 ml-auto flex-shrink-0" strokeWidth={2.5} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── 2b. Color Tag ── */}
              <ColorPicker
                selectedColor={form.color_tag}
                onSelectColor={(color) => setForm(prev => ({ ...prev, color_tag: color }))}
              />

              {/* ── 3. Sub-Tasks ── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className={`${STYLE.label} mb-0`}>
                    Sub-Tasks{' '}
                    {form.tasks.length > 0 && (
                      <span className="text-[#C9A962] normal-case">({form.tasks.length})</span>
                    )}
                  </label>
                  <button
                    onClick={addTask}
                    className="flex items-center gap-1.5 text-xs text-[#C9A962] hover:text-[#e2ba8b] transition-colors bg-[rgba(201,169,98,0.1)] hover:bg-[rgba(201,169,98,0.15)] px-3 py-1.5 rounded-lg border border-[rgba(201,169,98,0.25)]"
                  >
                    <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                    Add Task
                  </button>
                </div>

                <div className="space-y-2">
                  <AnimatePresence>
                    {form.tasks.map((task, index) => {
                      const isExp = expandedTask === task.id;
                      return (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="bg-[#000000] rounded-xl border border-[rgba(201,169,98,0.25)] overflow-hidden"
                        >
                          <div
                            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[rgba(201,169,98,0.05)] transition-colors"
                            onClick={() => setExpandedTask(isExp ? null : task.id)}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-xs text-[#C9A962] w-5 h-5 rounded-full border border-[rgba(201,169,98,0.4)] flex items-center justify-center font-light flex-shrink-0">
                                {index + 1}
                              </span>
                              <span className={`text-sm font-light truncate ${task.name ? 'text-[#F5F1E8]' : 'text-[#6B6B6B]'}`}>
                                {task.name || 'Untitled task'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={(e) => { e.stopPropagation(); removeTask(task.id); }}
                                className="text-[#6B6B6B] hover:text-red-400 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                              </button>
                              {isExp
                                ? <ChevronUp className="w-4 h-4 text-[#C9A962]" strokeWidth={1.5} />
                                : <ChevronDown className="w-4 h-4 text-[#C9A962]" strokeWidth={1.5} />
                              }
                            </div>
                          </div>

                          <AnimatePresence>
                            {isExp && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="border-t border-[rgba(201,169,98,0.15)] px-4 py-3"
                              >
                                <label className="text-[10px] text-[#B8B8B8] uppercase tracking-wider mb-1.5 block">
                                  Task Name
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g., Wipe counters"
                                  value={task.name}
                                  onChange={(e) => updateTask(task.id, e.target.value)}
                                  className="w-full bg-[#000000] border border-[rgba(201,169,98,0.25)] rounded-lg px-3 py-2.5 text-[#F5F1E8] placeholder-[#6B6B6B] focus:border-[#C9A962] focus:outline-none text-sm"
                                  onClick={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') { e.preventDefault(); setExpandedTask(null); }
                                  }}
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {form.tasks.length === 0 && (
                    <div className="text-center py-6 border border-dashed border-[rgba(201,169,98,0.2)] rounded-xl">
                      <p className="text-xs text-[#6B6B6B]">No sub-tasks added yet</p>
                      <p className="text-[10px] text-[#4B4B4B] mt-1">Tap "Add Task" to begin</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!isValid}
                className="w-full bg-[#C9A962] hover:bg-[#D4B978] disabled:bg-[#3a3a3a] disabled:cursor-not-allowed disabled:text-[#6B6B6B] text-[#000000] font-medium py-4 rounded-xl transition-all text-sm"
              >
                Create Task
              </button>

              <div className="h-10" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}