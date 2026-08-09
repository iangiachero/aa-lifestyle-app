// src/pages/homeorganization/components/Create.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, ChevronUp, Plus, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getIconifyIconUrl } from '../../../services/iconifyService';
import ColorPicker from '../../../components/ui/ColorPicker';
import { useModal } from '../../../context/ModalContext';
import { supabase } from '../../../lib/supabase';
import { DEFAULT_CATEGORY_IMAGE } from '../../../data/homeOrgImages';

/* === CREATE MODAL STYLING CONFIGURATION === */
const STYLE = {
  overlay: 'fixed inset-0 bg-black/60 z-[100] flex items-end',
  sheet: 'w-full bg-[color:var(--app-bg)] rounded-t-[2rem] border-t border-[rgba(201,169,98,0.25)] max-h-[90dvh] flex flex-col',
  header: 'sticky top-0 bg-[color:var(--app-bg)] px-6 pt-5 pb-4 flex items-center justify-between border-b border-[rgba(201,169,98,0.15)]',
  title: 'text-xl text-[color:var(--app-gold)] font-light',
  subtitle: 'text-xs text-[color:var(--app-text-2)] mt-0.5',
  label: 'text-xs text-[color:var(--app-text-2)] font-light uppercase tracking-wider mb-2 block',
  input: 'w-full bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-xl px-4 py-3 text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:border-[#C9A962] focus:outline-none text-sm',
  chipActive: 'bg-[rgba(201,169,98,0.15)] border-[#C9A962] text-[color:var(--app-gold)]',
  chipInactive: 'bg-[color:var(--app-bg)] border-[rgba(201,169,98,0.3)] text-[color:var(--app-text-2)] hover:border-[rgba(201,169,98,0.5)]',
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

const EMPTY_FORM = {
  title: '',
  section: 'daily-reset-adhd',
  tasks: [],
  color_tag: '#6B7280',
};

export default function CreateModal({
  visible, onClose, onAdd, onAddCategory, defaultSection, customCategories = [],
}) {
  const { openModal, closeModal } = useModal();
  // 'task'     -> add a single task into an existing section
  // 'category' -> create a brand new custom category (bar) with its own items
  const [mode, setMode] = useState('task');
  const [form, setForm] = useState({ ...EMPTY_FORM, section: defaultSection || 'daily-reset-adhd' });
  const [expandedTask, setExpandedTask] = useState(null);
  const taskInputRefs = useRef({});
  // Category photo, mirroring the recipe flow: default artwork until the user
  // picks one of their own.
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef(null);

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));   // instant preview
    setUploadingImage(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const rawExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const ext = ['heic', 'heif'].includes(rawExt) ? 'jpg' : rawExt;   // iPhone
      const path = `${user.id}/homeorg_${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from('public_user_pfp')
        .upload(path, file, { upsert: false, contentType: file.type || 'image/jpeg' });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('public_user_pfp').getPublicUrl(path);
      setImageUrl(publicUrl);
    } catch {
      setImageUrl('');
      window.alert('Photo upload failed — the category will use the default image.');
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (visible) {
      openModal();
      return () => closeModal();
    }
  }, [visible, openModal, closeModal]);

  const resetForm = useCallback(() => {
    setForm({ ...EMPTY_FORM, section: defaultSection || 'daily-reset-adhd' });
    setExpandedTask(null);
    setMode('task');
    setImageUrl('');
    setImagePreview(null);
  }, [defaultSection]);

  const handleClose = () => { onClose(); resetForm(); };

  /* ── items ── */
  const addTask = () => {
    const newTask = { id: Date.now(), name: '' };
    setForm(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
    setExpandedTask(newTask.id);
    // Drop the caret straight into the new row instead of making the user tap it.
    requestAnimationFrame(() => {
      setTimeout(() => taskInputRefs.current[newTask.id]?.focus({ preventScroll: true }), 60);
    });
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
    const items = form.tasks.filter(t => t.name.trim()).map(t => t.name.trim());

    if (mode === 'category') {
      onAddCategory({
        name: form.title.trim(),
        image_url: imageUrl || null,   // null → the app's default artwork
        color_tag: form.color_tag,
        items,
      });
    } else {
      onAdd({
        title: form.title.trim(),
        section: form.section,
        sub_tasks: items,
        color_tag: form.color_tag,
      });
    }
    handleClose();
  };

  const isCategory = mode === 'category';
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
                <h2 className={STYLE.title}>{isCategory ? 'Create Category' : 'Create Task'}</h2>
                <p className={STYLE.subtitle}>
                  {isCategory ? 'Your own home organization bar' : 'Add a task to an existing section'}
                </p>
              </div>
              <button onClick={handleClose} className="text-[color:var(--app-gold)] hover:text-[color:var(--app-gold-light)] transition-colors">
                <ChevronDown className="w-7 h-7" strokeWidth={1.5} />
              </button>
            </div>

            {/* ── Scrollable body ── */}
            <div
              className="overflow-y-auto flex-1 px-6 py-5 space-y-5 scrollbar-hide"
              style={{ paddingBottom: '3rem' }}
            >
              {/* ── 0. What are we creating? ── */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'task', label: 'New Task' },
                  { id: 'category', label: 'New Category' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setMode(opt.id)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-light transition-all border ${
                      mode === opt.id ? STYLE.chipActive : STYLE.chipInactive
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* ── 1. Icon + Title ── */}
              <div>
                <label className={STYLE.label}>{isCategory ? 'Category Name' : 'Title'}</label>
                <div className="flex items-center gap-3">
                  {isCategory && (
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="w-12 h-12 rounded-xl overflow-hidden border border-[rgba(201,169,98,0.3)] hover:border-[rgba(201,169,98,0.55)] flex-shrink-0 relative"
                      title="Choose a photo"
                      aria-label="Choose a photo"
                    >
                      <img
                        src={imagePreview || imageUrl || DEFAULT_CATEGORY_IMAGE}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                      />
                      {uploadingImage && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <span className="w-4 h-4 border border-[rgba(201,169,98,0.4)] border-t-[#C9A962] rounded-full animate-spin" />
                        </span>
                      )}
                    </button>
                  )}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImagePick}
                  />
                  <input
                    type="text"
                    placeholder={isCategory ? 'e.g., Craft Room' : 'e.g., Wipe kitchen counters'}
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    className={`${STYLE.input} flex-1`}
                  />
                </div>
                {isCategory && (
                  <p className="text-[11px] text-[color:var(--app-text-3)] mt-2">
                    Tap the image to use your own photo. Appears in{' '}
                    <span className="text-[color:var(--app-gold)]">Your Categories</span>, below the curated ones.
                  </p>
                )}
              </div>

              {/* ── 2. Section selector (task mode only) ── */}
              {!isCategory && (
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
                        <img src={getIconifyIconUrl(opt.icon)} alt="" className="w-5 h-5 flex-shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        <span className="truncate">{opt.label}</span>
                        {form.section === opt.id && (
                          <Check className="w-3 h-3 ml-auto flex-shrink-0" strokeWidth={2.5} />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* User's own categories are valid targets too */}
                  {customCategories.length > 0 && (
                    <>
                      <p className="text-[10px] uppercase tracking-wider text-[color:var(--app-text-3)] mt-4 mb-2">
                        Your Categories
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {customCategories.map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => setForm(prev => ({ ...prev, section: cat.id }))}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-light transition-all border ${
                              form.section === cat.id ? STYLE.chipActive : STYLE.chipInactive
                            }`}
                          >
                            <img src={cat.image_url || DEFAULT_CATEGORY_IMAGE} alt="" className="w-5 h-5 rounded object-cover flex-shrink-0" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
                            <span className="truncate">{cat.name}</span>
                            {form.section === cat.id && (
                              <Check className="w-3 h-3 ml-auto flex-shrink-0" strokeWidth={2.5} />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── 3. Color Tag ── */}
              <ColorPicker
                selectedColor={form.color_tag}
                onSelectColor={(color) => setForm(prev => ({ ...prev, color_tag: color }))}
              />

              {/* ── 4. Items ── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className={`${STYLE.label} mb-0`}>
                    {isCategory ? 'Checklist Items' : 'Sub-Tasks'}{' '}
                    {form.tasks.length > 0 && (
                      <span className="text-[color:var(--app-gold)] normal-case">({form.tasks.length})</span>
                    )}
                  </label>
                  <button
                    onClick={addTask}
                    className="flex items-center gap-1.5 text-xs text-[color:var(--app-gold)] hover:text-[color:var(--app-gold-light)] transition-colors bg-[rgba(201,169,98,0.1)] hover:bg-[rgba(201,169,98,0.15)] px-3 py-1.5 rounded-lg border border-[rgba(201,169,98,0.25)]"
                  >
                    <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                    Add Item
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
                          className="bg-[color:var(--app-bg)] rounded-xl border border-[rgba(201,169,98,0.25)] overflow-hidden"
                        >
                          <div
                            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[rgba(201,169,98,0.05)] transition-colors"
                            onClick={() => setExpandedTask(isExp ? null : task.id)}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-xs text-[color:var(--app-gold)] w-5 h-5 rounded-full border border-[rgba(201,169,98,0.4)] flex items-center justify-center font-light flex-shrink-0">
                                {index + 1}
                              </span>
                              <span className={`text-sm font-light truncate ${task.name ? 'text-[color:var(--app-text)]' : 'text-[color:var(--app-text-3)]'}`}>
                                {task.name || 'Untitled item'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={(e) => { e.stopPropagation(); removeTask(task.id); }}
                                className="text-[color:var(--app-text-3)] hover:text-red-400 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                              </button>
                              {isExp
                                ? <ChevronUp className="w-4 h-4 text-[color:var(--app-gold)]" strokeWidth={1.5} />
                                : <ChevronDown className="w-4 h-4 text-[color:var(--app-gold)]" strokeWidth={1.5} />
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
                                <label className="text-[10px] text-[color:var(--app-text-2)] uppercase tracking-wider mb-1.5 block">
                                  Item Name
                                </label>
                                <input
                                  ref={(el) => { taskInputRefs.current[task.id] = el; }}
                                  type="text"
                                  placeholder="e.g., Wipe counters"
                                  value={task.name}
                                  onChange={(e) => updateTask(task.id, e.target.value)}
                                  className="w-full bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.25)] rounded-lg px-3 py-2.5 text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:border-[#C9A962] focus:outline-none text-sm"
                                  onClick={(e) => e.stopPropagation()}
                                  enterKeyHint="done"
                                  onKeyDown={(e) => {
                                    // Enter closes this row and opens a fresh one, so a
                                    // whole list can be typed without reaching for the mouse.
                                    if (e.key === 'Enter') { e.preventDefault(); if (task.name.trim()) addTask(); else setExpandedTask(null); }
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
                      <p className="text-xs text-[color:var(--app-text-3)]">No items added yet</p>
                      <p className="text-[10px] text-[color:var(--app-text-3)] mt-1">Tap &ldquo;Add Item&rdquo; to begin</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!isValid}
                className="w-full bg-[#C9A962] hover:bg-[#D4B978] disabled:opacity-40 disabled:cursor-not-allowed text-[#000000] font-medium py-4 rounded-xl transition-all text-sm"
              >
                {isCategory ? 'Create Category' : 'Create Task'}
              </button>

              <div className="h-10" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
