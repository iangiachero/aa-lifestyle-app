import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ListChecks, Circle, CheckCircle2, ChevronDown, ChevronRight, Plus,
  CreditCard as Edit2, Trash2, X, ChevronLeft,
  Plane, Car, Building2, Waves, Tent, Briefcase,
  Heart, Cake, UtensilsCrossed, Gift,
  Home, Package, ShoppingCart, Wrench,
  Sun, Dumbbell, Sparkles, Brain,
  Calendar, Zap, Users, GraduationCap,
  AlertTriangle, Shield, HeartPulse, Lock,
  Luggage, Backpack, RefreshCw, School, Building,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '../components/ui/input';
import { supabase } from '../lib/supabase';
import { useModal } from '../context/ModalContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { seedChecklists } from '../lib/seedChecklists';
import ColorPicker from '../components/ui/ColorPicker';
import { getChecklistImage } from '../data/checklistImages';

const ICON_MAP = {
  'plane': Plane,
  'car': Car,
  'building-2': Building2,
  'waves': Waves,
  'tent': Tent,
  'briefcase': Briefcase,
  'heart': Heart,
  'cake': Cake,
  'utensils': UtensilsCrossed,
  'gift': Gift,
  'home': Home,
  'package': Package,
  'shopping-cart': ShoppingCart,
  'wrench': Wrench,
  'sun': Sun,
  'dumbbell': Dumbbell,
  'sparkles': Sparkles,
  'brain': Brain,
  'calendar': Calendar,
  'zap': Zap,
  'users': Users,
  'graduation-cap': GraduationCap,
  'alert-triangle': AlertTriangle,
  'shield': Shield,
  'heart-pulse': HeartPulse,
  'lock': Lock,
  'luggage': Luggage,
  'backpack': Backpack,
  'refresh-cw': RefreshCw,
  'school': School,
  'building': Building,
};

const CATEGORY_TABS = ['All', 'Travel', 'Events', 'Home', 'Wellness', 'Productivity', 'Safety'];

// iOS keeps the on-screen keyboard up — and paints a stray caret where the field
// used to be — when a focused input is unmounted, which is what happens when a
// sheet closes while the "add item" field still holds focus. Blur first so the
// keyboard retracts and the caret goes with it.
const dismissKeyboard = () => {
  const el = typeof document !== 'undefined' ? document.activeElement : null;
  if (el && typeof el.blur === 'function') el.blur();
};

// Shown on the user's own checklists, which have no curated artwork of their own.
// Same bucket as the curated checklist images, so all of it is managed in one place.
const DEFAULT_MINE_IMAGE =
  'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/checklist-icon/my-checklist.png';

// Stops iOS offering "AutoFill Contact" on fields whose label contains "Name".
const NO_AUTOFILL = {
  autoComplete: 'off',
  autoCorrect: 'off',
  spellCheck: false,
};

// Top filter row: adds a dedicated "Mine" tab for user-created checklists so they
// are kept separate from the curated ones (which live under All / categories).
const FILTER_TABS = ['All', 'Mine', 'Travel', 'Events', 'Home', 'Wellness', 'Productivity', 'Safety'];

// Curated checklists are seeded with a kebab-case slug id as icon_name
// (e.g. 'flight-packing', always lowercase). User-created checklists don't set
// one, so the DB defaults icon_name to 'ListChecks' (PascalCase) — any icon_name
// that is missing or contains an uppercase letter marks a personal checklist.
const isPersonalChecklist = (c) => {
  const icon = c && c.icon_name;
  return !icon || /[A-Z]/.test(icon);
};

const CATEGORY_COLORS = {
  Travel: '#3B82F6',
  Events: '#F59E0B',
  Home: '#10B981',
  Wellness: '#F472B6',
  Productivity: '#0EA5E9',
  Safety: '#F97316',
};

function ChecklistIcon({ iconName, color, size = 'w-10 h-10' }) {
  const Icon = ICON_MAP[iconName] || ListChecks;
  return <Icon className={`${size} flex-shrink-0`} style={{ color: color || '#C9A962' }} strokeWidth={1.5} />;
}

// Falls back to the lucide icon when the artwork is missing. Hiding the broken
// <img> (the previous behaviour) left an empty square instead.
function ChecklistThumb({ src, alt, iconName, color }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="pl-4">
        <ChecklistIcon iconName={iconName} color={color} size="w-10 h-10" />
      </div>
    );
  }
  return (
    <div className="w-16 h-16 rounded-l-2xl overflow-hidden flex-shrink-0">
      <img
        src={src}
        alt={alt}
        loading="eager"
        decoding="async"
        className="w-full h-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function ChecklistModal({
  checklist, isPersonal, onClose, checkedItems, onToggleItem, onToggleCustom,
  customItems, addingToTopic, setAddingToTopic, newItemText, setNewItemText,
  onAddItem, editingItem, setEditingItem, editText, setEditText,
  onEditCustomItem, onDeleteCustomItem, onEditTemplateItem, onDeleteTemplateItem,
  onRenameChecklist, onDeleteChecklist,
}) {
  const [renaming, setRenaming] = useState(false);
  const [nameText, setNameText] = useState(checklist?.name || '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const addInputRef = useRef(null);
  const addRowRef = useRef(null);

  useEffect(() => {
    setNameText(checklist?.name || '');
    setRenaming(false);
    setConfirmDelete(false);
  }, [checklist?.id]);

  // The add row is always the last thing in the sheet, so pinning the sheet's
  // scroller to the bottom is what keeps the field clear of the keyboard.
  // scrollIntoView is unreliable here: the sheet sits inside a transformed
  // framer-motion element and the scroll silently does nothing.
  const revealAddRow = useCallback(() => {
    const scroller = addInputRef.current?.closest('.overflow-y-auto');
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }, []);

  // Callback ref: focus the field the moment it mounts, so tapping "Add item"
  // (or an edit pencil) drops the caret straight in — no second tap needed.
  const setAddInput = useCallback((el) => {
    addInputRef.current = el;
    if (!el) return;
    el.focus({ preventScroll: true });
    // Once after mount, and again after the keyboard has had time to appear
    // and shrink the sheet.
    requestAnimationFrame(revealAddRow);
    setTimeout(revealAddRow, 400);
  }, [revealAddRow]);

  // Same for edit fields, with the caret parked at the end of the text.
  const focusCaretEnd = useCallback((el) => {
    if (!el) return;
    el.focus({ preventScroll: true });
    const len = el.value.length;
    try { el.setSelectionRange(len, len); } catch { /* type doesn't support it */ }
  }, []);

  const checklistId = checklist?.id;

  // Add, then keep the caret in the (now empty) field and pull it into view
  // above the keyboard so the next item can be typed immediately.
  const submitAdd = useCallback(() => {
    onAddItem(checklistId);
    requestAnimationFrame(() => {
      addInputRef.current?.focus({ preventScroll: true });
      revealAddRow();
    });
  }, [onAddItem, checklistId, revealAddRow]);

  const closeAddRow = useCallback(() => {
    dismissKeyboard();
    setAddingToTopic(null);
    setNewItemText('');
  }, [setAddingToTopic, setNewItemText]);

  if (!checklist) return null;
  const templateItems = checklist.items || [];
  const customItemsList = customItems[checklist.id] || [];
  const iconColor = checklist.color_tag || CATEGORY_COLORS[checklist.category] || '#C9A962';

  const saveName = () => {
    const t = nameText.trim();
    if (!t) return;
    onRenameChecklist(checklist.id, t);
    setRenaming(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60"
          onClick={onClose}
        />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative w-full bg-[color:var(--app-bg)] border-t-2 border-[rgba(201,169,98,0.3)] rounded-t-3xl max-h-[88dvh] overflow-y-auto scrollbar-soft z-10"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-[rgba(201,169,98,0.3)]" />
          </div>

          <div className="page-safe-x" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}>
            <div className="flex items-center justify-between py-4 border-b border-[rgba(201,169,98,0.2)] mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <ChecklistIcon iconName={checklist.icon_name} color={iconColor} size="w-8 h-8" />
                <div className="flex-1 min-w-0">
                  {renaming ? (
                    <input
                      value={nameText}
                      onChange={e => setNameText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); saveName(); } if (e.key === 'Escape') { setRenaming(false); setNameText(checklist.name); } }}
                      ref={focusCaretEnd} enterKeyHint="done"
                      className="w-full text-xl font-light text-[color:var(--app-gold)] bg-transparent border-b border-[rgba(201,169,98,0.4)] outline-none"
                    />
                  ) : (
                    <h2 className="text-xl font-light text-[color:var(--app-gold)] truncate">{checklist.name}</h2>
                  )}
                  <p className="text-xs text-[color:var(--app-text-2)] mt-0.5">{templateItems.length + customItemsList.length} items</p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                {isPersonal && (renaming ? (
                  <>
                    <button onClick={saveName} className="p-1 text-[color:var(--app-gold)]"><CheckCircle2 className="w-5 h-5" strokeWidth={1.5} /></button>
                    <button onClick={() => { setRenaming(false); setNameText(checklist.name); }} className="p-1 text-red-400"><X className="w-5 h-5" strokeWidth={1.5} /></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setRenaming(true)} className="p-1.5 text-[color:var(--app-gold)] opacity-70 hover:opacity-100" aria-label="Rename checklist"><Edit2 className="w-4 h-4" strokeWidth={1.5} /></button>
                    <button onClick={() => setConfirmDelete(true)} className="p-1.5 text-red-400 opacity-70 hover:opacity-100" aria-label="Delete checklist"><Trash2 className="w-4 h-4" strokeWidth={1.5} /></button>
                  </>
                ))}
                <button onClick={onClose} className="p-1 text-[color:var(--app-text-2)] hover:text-[color:var(--app-gold)] transition-colors">
                  <ChevronDown className="w-7 h-7" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {confirmDelete && (
              <div className="mb-4 p-4 rounded-xl border border-red-300/40 bg-red-500/5">
                <p className="text-sm font-light text-[color:var(--app-text)] mb-3">Delete &ldquo;{checklist.name}&rdquo;? This can&rsquo;t be undone.</p>
                <div className="flex gap-2">
                  <button onClick={() => onDeleteChecklist(checklist.id)} className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-light">Delete</button>
                  <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2 rounded-lg border border-[rgba(201,169,98,0.3)] text-[color:var(--app-text-2)] text-sm font-light">Cancel</button>
                </div>
              </div>
            )}

            {templateItems.length > 0 && (
              <div className="space-y-2 mb-4">
                <div className="text-[10px] font-light uppercase tracking-wider text-[color:var(--app-text-2)] opacity-70 mb-2">{isPersonal ? 'Items' : 'Included'}</div>
                {templateItems.map((item, idx) => {
                  const isChecked = checkedItems[`${checklist.id}-${idx}`] || false;
                  const itemKey = `${checklist.id}-tpl-${idx}`;
                  if (isPersonal && editingItem === itemKey) {
                    return (
                      <div key={itemKey} className="flex items-center gap-2 p-3 rounded-xl bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)]">
                        <input value={editText} onChange={e => setEditText(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onEditTemplateItem(checklist.id, idx); } if (e.key === 'Escape') setEditingItem(null); }}
                          ref={focusCaretEnd} enterKeyHint="done"
                          className="flex-1 text-sm bg-transparent border-none outline-none text-[color:var(--app-text)]" />
                        <button onClick={() => onEditTemplateItem(checklist.id, idx)} className="p-1 text-[color:var(--app-gold)]"><CheckCircle2 className="w-4 h-4" strokeWidth={1.5} /></button>
                        <button onClick={() => setEditingItem(null)} className="p-1 text-red-400"><X className="w-4 h-4" strokeWidth={1.5} /></button>
                      </div>
                    );
                  }
                  return (
                    <div key={itemKey} className={`flex items-center gap-3 p-3 rounded-xl bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.15)] transition-opacity ${isChecked ? 'opacity-50' : ''}`}>
                      <button onClick={() => onToggleItem(checklist.id, idx)} className="flex-shrink-0">
                        {isChecked
                          ? <CheckCircle2 className="w-5 h-5 text-[#6BBF8A]" strokeWidth={1.5} />
                          : <Circle className="w-5 h-5 text-[color:var(--app-gold)]" strokeWidth={1.5} />}
                      </button>
                      <span className={`text-sm font-light flex-1 ${isChecked ? 'line-through text-[color:var(--app-text-3)]' : 'text-[color:var(--app-text)]'}`}>{item}</span>
                      {isPersonal && (
                        <>
                          <button onClick={() => { setEditingItem(itemKey); setEditText(item); }} className="p-1 text-[color:var(--app-gold)] opacity-60 hover:opacity-100"><Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} /></button>
                          <button onClick={() => onDeleteTemplateItem(checklist.id, idx)} className="p-1 text-red-400 opacity-60 hover:opacity-100"><Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} /></button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {customItemsList.length > 0 && (
              <div className="space-y-2 mb-4">
                <div className="text-[10px] font-light uppercase tracking-wider text-[color:var(--app-text-2)] opacity-70 mb-2">Your Add-Ons</div>
                {customItemsList.map((item, idx) => {
                  const isChecked = checkedItems[`${checklist.id}-custom-${idx}`] || false;
                  const itemKey = `${checklist.id}-custom-${idx}`;
                  return (
                    <div key={itemKey}>
                      {editingItem === itemKey ? (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)]">
                          <input value={editText} onChange={e => setEditText(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onEditCustomItem(checklist.id, idx); } if (e.key === 'Escape') setEditingItem(null); }}
                            ref={focusCaretEnd} enterKeyHint="done"
                            className="flex-1 text-sm bg-transparent border-none outline-none text-[color:var(--app-text)]" />
                          <button onClick={() => onEditCustomItem(checklist.id, idx)} className="p-1 text-[color:var(--app-gold)]"><CheckCircle2 className="w-4 h-4" strokeWidth={1.5} /></button>
                          <button onClick={() => setEditingItem(null)} className="p-1 text-red-400"><X className="w-4 h-4" strokeWidth={1.5} /></button>
                        </div>
                      ) : (
                        <div className={`flex items-center gap-3 p-3 rounded-xl bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.15)] ${isChecked ? 'opacity-50' : ''}`}>
                          <button onClick={() => onToggleCustom(checklist.id, idx)} className="flex-shrink-0">
                            {isChecked
                              ? <CheckCircle2 className="w-5 h-5 text-[#6BBF8A]" strokeWidth={1.5} />
                              : <Circle className="w-5 h-5 text-[color:var(--app-gold)]" strokeWidth={1.5} />}
                          </button>
                          <span className={`text-sm font-light flex-1 ${isChecked ? 'line-through text-[color:var(--app-text-3)]' : 'text-[color:var(--app-text)]'}`}>{item}</span>
                          <button onClick={() => { setEditingItem(itemKey); setEditText(item); }} className="p-1 text-[color:var(--app-gold)] opacity-60 hover:opacity-100"><Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} /></button>
                          <button onClick={() => onDeleteCustomItem(checklist.id, idx)} className="p-1 text-red-400 opacity-60 hover:opacity-100"><Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} /></button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {addingToTopic === checklist.id ? (
              <div ref={addRowRef} className="flex items-center gap-2 p-3 rounded-xl bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)]">
                <input value={newItemText} onChange={e => setNewItemText(e.target.value)}
                  ref={setAddInput}
                  {...NO_AUTOFILL} name="checklist-item"
                  enterKeyHint="done"
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submitAdd(); } if (e.key === 'Escape') closeAddRow(); }}
                  placeholder="New item..." className="flex-1 text-sm bg-transparent border-none outline-none text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)]" />
                {/* preventDefault on press keeps the caret (and the keyboard) in
                    the field, so several items can be added back to back. */}
                <button onMouseDown={e => e.preventDefault()} onClick={submitAdd} className="p-1 text-[color:var(--app-gold)]"><CheckCircle2 className="w-4 h-4" strokeWidth={1.5} /></button>
                <button onMouseDown={e => e.preventDefault()} onClick={closeAddRow} className="p-1 text-red-400"><X className="w-4 h-4" strokeWidth={1.5} /></button>
              </div>
            ) : (
              <button onClick={() => setAddingToTopic(checklist.id)}
                className="w-full py-3 rounded-xl border border-dashed border-[#C9A962]/30 hover:border-[#C9A962]/50 hover:bg-[rgba(201,169,98,0.05)] transition-all flex items-center justify-center gap-2 text-[color:var(--app-gold)]">
                <Plus className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-sm font-light">Add item</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default function Checklists() {
  const navigate = useNavigate();
  const { openModal, closeModal } = useModal();
  const queryClient = useQueryClient();
  const tabsRef = useRef(null);
  const newItemFieldRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeChecklist, setActiveChecklist] = useState(null);
  const [addingToTopic, setAddingToTopic] = useState(null);
  const [newItemText, setNewItemText] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editText, setEditText] = useState('');
  const [notification, setNotification] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [customItems, setCustomItems] = useState({});
  const [showAddChecklist, setShowAddChecklist] = useState(false);

  useEffect(() => {
    if (showAddChecklist) {
      openModal();
      return () => closeModal();
    }
  }, [showAddChecklist, openModal, closeModal]);

  // Hide the bottom nav while the checklist detail sheet is open so it doesn't
  // overlap and cut off the sheet's bottom content (e.g. the "Add item" button).
  useEffect(() => {
    if (activeChecklist) {
      openModal();
      return () => closeModal();
    }
  }, [activeChecklist, openModal, closeModal]);

  const [newChecklistName, setNewChecklistName] = useState('');
  const [newChecklistItems, setNewChecklistItems] = useState([]);
  const [newChecklistItemInput, setNewChecklistItemInput] = useState('');
  const [newChecklistColor, setNewChecklistColor] = useState('#6B7280');
  const [newChecklistCategory, setNewChecklistCategory] = useState('Productivity');

  const checklistSeeded = useRef(false);

  const { data: userChecklists = [], isLoading: checklistsLoading } = useQuery({
    queryKey: ['userChecklists'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_checklists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    if (checklistSeeded.current || checklistsLoading) return;
    if (userChecklists.length < 5) {
      checklistSeeded.current = true;
      (async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await seedChecklists(user.id);
          queryClient.invalidateQueries({ queryKey: ['userChecklists'] });
        }
      })();
    }
  }, [userChecklists, checklistsLoading, queryClient]);

  const { data: checklistProgress } = useQuery({
    queryKey: ['checklistProgress'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return {};
      const { data, error } = await supabase
        .from('checklist_progress')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      const map = {};
      (data || []).forEach(row => { map[row.item_key] = row.checked; });
      return map;
    },
  });

  const { data: customItemsData } = useQuery({
    queryKey: ['checklistCustomItems'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return {};
      const { data, error } = await supabase
        .from('checklist_custom_items')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      const map = {};
      (data || []).forEach(row => {
        if (!map[row.checklist_id]) map[row.checklist_id] = [];
        map[row.checklist_id].push({ id: row.id, text: row.text, sort_order: row.sort_order });
      });
      Object.keys(map).forEach(k => map[k].sort((a, b) => a.sort_order - b.sort_order));
      return map;
    },
  });

  // Guard against undefined query data: the previous `= {}` destructuring
  // defaults created a fresh object every render, which made these effects
  // re-run and setState in a loop ("Maximum update depth exceeded") whenever
  // the query was pending or errored.
  useEffect(() => {
    if (checklistProgress) setCheckedItems(checklistProgress);
  }, [checklistProgress]);

  useEffect(() => {
    if (!customItemsData) return;
    const mapped = {};
    Object.entries(customItemsData).forEach(([clId, items]) => {
      mapped[clId] = items.map(i => i.text);
    });
    setCustomItems(mapped);
  }, [customItemsData]);

  const upsertProgressMutation = useMutation({
    mutationFn: async ({ key, checked }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('checklist_progress')
        .upsert({ user_id: user.id, item_key: key, checked }, { onConflict: 'user_id,item_key' });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checklistProgress'] }),
  });

  const addCustomItemMutation = useMutation({
    mutationFn: async ({ checklistId, text }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const existing = (customItemsData || {})[checklistId] || [];
      const { error } = await supabase
        .from('checklist_custom_items')
        .insert({ user_id: user.id, checklist_id: checklistId, text, sort_order: existing.length });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checklistCustomItems'] }),
  });

  const updateCustomItemMutation = useMutation({
    mutationFn: async ({ id, text }) => {
      const { error } = await supabase.from('checklist_custom_items').update({ text }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checklistCustomItems'] }),
  });

  const deleteCustomItemMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('checklist_custom_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checklistCustomItems'] }),
  });

  const createChecklistMutation = useMutation({
    mutationFn: async ({ name, items, color_tag, category }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('user_checklists')
        .insert({ user_id: user.id, name, items, color_tag, category });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userChecklists'] });
      showNotification('Checklist created');
    },
    onError: (e) => showNotification(e?.message?.includes('duplicate') ? 'A checklist with that name already exists' : 'Could not create checklist'),
  });

  const updateChecklistMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const { error } = await supabase.from('user_checklists').update(updates).eq('id', id);
      if (error) throw error;
    },
    // Resync from the server once the write settles (also repairs the optimistic
    // cache entry written by saveItems if the request failed).
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['userChecklists'] }),
    onError: () => showNotification('Could not save changes'),
  });

  const deleteChecklistMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('user_checklists').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userChecklists'] }),
    onError: () => showNotification('Could not delete checklist'),
  });

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggleItem = useCallback((checklistId, idx) => {
    const key = `${checklistId}-${idx}`;
    const next = !checkedItems[key];
    setCheckedItems(prev => ({ ...prev, [key]: next }));
    upsertProgressMutation.mutate({ key, checked: next });
  }, [checkedItems, upsertProgressMutation]);

  const handleToggleCustom = useCallback((checklistId, idx) => {
    const key = `${checklistId}-custom-${idx}`;
    const next = !checkedItems[key];
    setCheckedItems(prev => ({ ...prev, [key]: next }));
    upsertProgressMutation.mutate({ key, checked: next });
  }, [checkedItems, upsertProgressMutation]);

  // Read the freshest row: the query cache carries optimistic writes that the
  // `userChecklists` closure hasn't re-rendered with yet.
  const getChecklist = useCallback((id) =>
    (queryClient.getQueryData(['userChecklists']) || userChecklists).find(c => c.id === id),
  [queryClient, userChecklists]);

  // A personal checklist keeps all its items in one jsonb array, so two quick
  // edits would both read the same stale array and the second would clobber the
  // first (typing three items fast used to persist only the last). Write the new
  // array into the cache synchronously so the next call builds on it.
  const saveItems = useCallback((checklistId, items) => {
    queryClient.setQueryData(['userChecklists'], (old = []) =>
      old.map(c => (c.id === checklistId ? { ...c, items } : c)));
    updateChecklistMutation.mutate({ id: checklistId, updates: { items } });
  }, [queryClient, updateChecklistMutation]);

  const handleAddItem = useCallback((checklistId) => {
    const trimmed = newItemText.trim();
    if (!trimmed) return;
    const cl = getChecklist(checklistId);
    if (isPersonalChecklist(cl)) {
      // Personal checklists store their items inline on user_checklists.items.
      const items = cl.items || [];
      if (items.find(i => i.toLowerCase() === trimmed.toLowerCase())) { showNotification('Item already exists'); return; }
      saveItems(checklistId, [...items, trimmed]);
    } else {
      // Curated checklists keep add-ons separate so the template stays intact.
      const current = customItems[checklistId] || [];
      if (current.find(i => i.toLowerCase() === trimmed.toLowerCase())) { showNotification('Item already exists'); return; }
      addCustomItemMutation.mutate({ checklistId, text: trimmed });
    }
    // Keep the field open (and focused, handled by the modal) so the user can
    // enter several items in a row without re-tapping "Add item" each time.
    setNewItemText('');
  }, [newItemText, getChecklist, saveItems, customItems, addCustomItemMutation]);

  const handleEditTemplateItem = useCallback((checklistId, idx) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    const cl = getChecklist(checklistId);
    if (!cl) return;
    const items = [...(cl.items || [])];
    if (idx < 0 || idx >= items.length) return;
    items[idx] = trimmed;
    saveItems(checklistId, items);
    setEditingItem(null);
    showNotification('Item updated');
  }, [editText, getChecklist, saveItems]);

  const handleDeleteTemplateItem = useCallback((checklistId, idx) => {
    const cl = getChecklist(checklistId);
    if (!cl) return;
    const items = [...(cl.items || [])];
    const total = items.length;
    if (idx < 0 || idx >= total) return;
    items.splice(idx, 1);
    saveItems(checklistId, items);

    // Item checked-state is keyed by index, so shift keys down to stay aligned.
    setCheckedItems(prev => {
      const next = { ...prev };
      for (let i = idx; i < total - 1; i++) next[`${checklistId}-${i}`] = prev[`${checklistId}-${i + 1}`] || false;
      delete next[`${checklistId}-${total - 1}`];
      return next;
    });
    for (let i = idx; i < total - 1; i++) {
      upsertProgressMutation.mutate({ key: `${checklistId}-${i}`, checked: checkedItems[`${checklistId}-${i + 1}`] || false });
    }
    upsertProgressMutation.mutate({ key: `${checklistId}-${total - 1}`, checked: false });
    showNotification('Item deleted');
  }, [getChecklist, saveItems, upsertProgressMutation, checkedItems]);

  const handleRenameChecklist = useCallback((id, name) => {
    const trimmed = name.trim();
    if (!trimmed) { showNotification('Please enter a name'); return; }
    updateChecklistMutation.mutate({ id, updates: { name: trimmed } });
    showNotification('Checklist renamed');
  }, [updateChecklistMutation]);

  const handleDeleteChecklist = useCallback((id) => {
    deleteChecklistMutation.mutate(id);
    setActiveChecklist(null);
    showNotification('Checklist deleted');
  }, [deleteChecklistMutation]);

  const handleEditItem = useCallback((checklistId, idx) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    const items = (customItemsData || {})[checklistId] || [];
    const item = items[idx];
    if (!item) return;
    updateCustomItemMutation.mutate({ id: item.id, text: trimmed });
    setEditingItem(null);
    showNotification('Item updated');
  }, [editText, customItemsData, updateCustomItemMutation]);

  const handleDeleteItem = useCallback((checklistId, idx) => {
    const items = (customItemsData || {})[checklistId] || [];
    const item = items[idx];
    if (!item) return;
    deleteCustomItemMutation.mutate(item.id);
    showNotification('Item deleted');
  }, [customItemsData, deleteCustomItemMutation]);

  const getStats = (checklist) => {
    const items = checklist.items || [];
    const customItemsList = customItems[checklist.id] || [];
    const templateChecked = items.filter((_, idx) => checkedItems[`${checklist.id}-${idx}`]).length;
    const customChecked = customItemsList.filter((_, idx) => checkedItems[`${checklist.id}-custom-${idx}`]).length;
    return {
      totalItems: items.length + customItemsList.length,
      totalCompleted: templateChecked + customChecked,
    };
  };

  const closeAddChecklist = useCallback(() => {
    dismissKeyboard();
    setShowAddChecklist(false);
    setNewChecklistName('');
    setNewChecklistItems([]);
    setNewChecklistItemInput('');
  }, []);

  const handleAddChecklistItem = () => {
    const trimmed = newChecklistItemInput.trim();
    if (!trimmed) return;
    if (newChecklistItems.find(i => i.toLowerCase() === trimmed.toLowerCase())) { showNotification('Item already added'); return; }
    setNewChecklistItems([...newChecklistItems, trimmed]);
    setNewChecklistItemInput('');
    // Keep the caret in the field so items can be typed one after another.
    requestAnimationFrame(() => newItemFieldRef.current?.focus({ preventScroll: true }));
  };

  const handleCreateChecklist = () => {
    if (!newChecklistName.trim()) { showNotification('Please enter a name'); return; }
    if (newChecklistItems.length === 0) { showNotification('Please add at least one item'); return; }
    createChecklistMutation.mutate({
      name: newChecklistName.trim(),
      items: newChecklistItems,
      color_tag: newChecklistColor,
      category: newChecklistCategory,
    });
    closeAddChecklist();
    setNewChecklistColor('#6B7280');
    setNewChecklistCategory('Productivity');
    setActiveCategory('Mine');
  };

  const CATEGORY_ORDER = ['Travel', 'Events', 'Home', 'Wellness', 'Productivity', 'Safety'];

  const filteredChecklists = useMemo(() => {
    // "Mine" shows the user's own checklists, newest first. All other tabs show
    // only curated checklists so personal ones never mix into the curated set.
    if (activeCategory === 'Mine') {
      return userChecklists
        .filter(isPersonalChecklist)
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }
    const curated = userChecklists.filter(c => !isPersonalChecklist(c));
    const list = activeCategory === 'All' ? curated : curated.filter(c => c.category === activeCategory);
    return [...list].sort((a, b) => {
      const catA = CATEGORY_ORDER.indexOf(a.category);
      const catB = CATEGORY_ORDER.indexOf(b.category);
      if (catA !== catB) return (catA === -1 ? 99 : catA) - (catB === -1 ? 99 : catB);
      return a.name.localeCompare(b.name);
    });
  }, [userChecklists, activeCategory]);

  const activeChecklistObj = activeChecklist
    ? userChecklists.find(c => c.id === activeChecklist)
    : null;

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--app-bg)' }}>
      {notification && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
          <div className="px-5 py-3 rounded-xl bg-gradient-to-br from-[#e2ba8b] to-[#C9A962] text-white shadow-lg text-sm font-light text-center max-w-[80%]">
            {notification}
          </div>
        </div>
      )}

      <div className="relative border-b-2 border-[rgba(201,169,98,0.25)] page-safe-x py-6">
        <button onClick={() => navigate(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity">
          <ChevronLeft className="w-6 h-6 text-[color:var(--app-gold)]" strokeWidth={1.5} />
        </button>
        <div className="w-full text-center">
          <h1 className="text-3xl text-[color:var(--app-gold)] font-light tracking-wide">Checklists</h1>
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="border-b border-[rgba(201,169,98,0.15)]">
        <div
          ref={tabsRef}
          className="flex gap-1 px-4 py-3 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {FILTER_TABS.map(tab => {
            const isActive = activeCategory === tab;
            const color = (tab === 'All' || tab === 'Mine') ? '#C9A962' : CATEGORY_COLORS[tab];
            return (
              <button
                key={tab}
                onClick={() => setActiveCategory(tab)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-light transition-all duration-200 ${
                  isActive
                    ? 'text-[#000000] shadow-sm'
                    : 'text-[color:var(--app-text-2)] hover:text-[color:var(--app-text)] bg-[var(--app-wash-soft)] hover:bg-[color:var(--app-wash)]'
                }`}
                style={isActive ? { backgroundColor: color } : {}}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-4 pb-8">
        {filteredChecklists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ListChecks className="w-16 h-16 text-[color:var(--app-gold)] opacity-30 mb-4" strokeWidth={1} />
            <p className="text-[color:var(--app-text-2)] font-light text-base mb-1">
              {activeCategory === 'All' ? 'No checklists yet'
                : activeCategory === 'Mine' ? 'No personal checklists yet'
                : `No ${activeCategory} checklists`}
            </p>
            <p className="text-[color:var(--app-text-3)] text-sm font-light">Tap the + button to create a checklist</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredChecklists.map((checklist, idx) => {
              const { totalItems, totalCompleted } = getStats(checklist);
              const iconColor = checklist.color_tag || CATEGORY_COLORS[checklist.category] || '#C9A962';
              const progress = totalItems > 0 ? (totalCompleted / totalItems) * 100 : 0;
              const categoryColor = CATEGORY_COLORS[checklist.category] || '#C9A962';

              const checklistImage = getChecklistImage(checklist.name)
                || (isPersonalChecklist(checklist) ? DEFAULT_MINE_IMAGE : null);

              return (
                <motion.div
                  key={checklist.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="rounded-2xl border border-[rgba(201,169,98,0.3)] shadow-[0_0_8px_rgba(201,169,98,0.1)] backdrop-blur-sm hover:border-[rgba(201,169,98,0.5)] transition-all duration-300 overflow-hidden bg-[color:var(--app-bg)]"
                >
                  <button
                    onClick={() => setActiveChecklist(checklist.id)}
                    className="w-full flex items-center gap-4 px-0 py-0 hover:bg-[rgba(201,169,98,0.03)] transition-colors"
                  >
                    <ChecklistThumb
                      src={checklistImage}
                      alt={checklist.name}
                      iconName={checklist.icon_name}
                      color={iconColor}
                    />
                    <div className="flex-1 text-left min-w-0 py-4 pr-4">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-light text-base text-[color:var(--app-text)] truncate">{checklist.name}</h3>
                        {checklist.category && (
                          <span
                            className="flex-shrink-0 text-[9px] font-light uppercase tracking-wider px-2 py-0.5 rounded-full"
                            style={{ color: categoryColor, backgroundColor: `${categoryColor}18` }}
                          >
                            {checklist.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 bg-[color:var(--app-wash)] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%`, backgroundColor: iconColor }}
                          />
                        </div>
                        <span className="text-xs text-[color:var(--app-text-2)] font-light flex-shrink-0">
                          {totalCompleted}/{totalItems}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[color:var(--app-gold)] flex-shrink-0 mr-4" strokeWidth={1.5} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAddChecklist(true)}
        className="fixed right-6 w-14 h-14 bg-[#C9A962] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all z-[35]"
        style={{ bottom: 'calc(7.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <Plus className="w-6 h-6 text-[#000000]" strokeWidth={2} />
      </button>

      {/* Checklist Modal */}
      {activeChecklistObj && (
        <ChecklistModal
          checklist={activeChecklistObj}
          isPersonal={isPersonalChecklist(activeChecklistObj)}
          onClose={() => { dismissKeyboard(); setActiveChecklist(null); setAddingToTopic(null); setNewItemText(''); setEditingItem(null); }}
          checkedItems={checkedItems}
          onToggleItem={handleToggleItem}
          onToggleCustom={handleToggleCustom}
          customItems={customItems}
          addingToTopic={addingToTopic}
          setAddingToTopic={setAddingToTopic}
          newItemText={newItemText}
          setNewItemText={setNewItemText}
          onAddItem={handleAddItem}
          editingItem={editingItem}
          setEditingItem={setEditingItem}
          editText={editText}
          setEditText={setEditText}
          onEditCustomItem={handleEditItem}
          onDeleteCustomItem={handleDeleteItem}
          onEditTemplateItem={handleEditTemplateItem}
          onDeleteTemplateItem={handleDeleteTemplateItem}
          onRenameChecklist={handleRenameChecklist}
          onDeleteChecklist={handleDeleteChecklist}
        />
      )}

      {/* Add Checklist Bottom Sheet */}
      {showAddChecklist && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={closeAddChecklist} />
          <div className="fixed bottom-0 left-0 right-0 bg-[color:var(--app-bg)] border-t-2 border-[rgba(201,169,98,0.3)] rounded-t-3xl z-50 max-h-[85dvh] overflow-y-auto scrollbar-hide" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-light text-[color:var(--app-gold)]">Create Checklist</h2>
                <button onClick={closeAddChecklist} className="text-[color:var(--app-text-2)] hover:text-[color:var(--app-gold)]">
                  <X className="w-6 h-6" strokeWidth={1.5} />
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-light text-[color:var(--app-text-2)] mb-2">Checklist Name</label>
                <Input {...NO_AUTOFILL} name="checklist-title" value={newChecklistName} onChange={e => setNewChecklistName(e.target.value)} placeholder="e.g., Morning Routine" className="w-full border-[#C9A962]/20 bg-[color:var(--app-wash)] text-[color:var(--app-text)]" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-light text-[color:var(--app-text-2)] mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_TABS.filter(t => t !== 'All').map(cat => {
                    const isActive = newChecklistCategory === cat;
                    const color = CATEGORY_COLORS[cat];
                    return (
                      <button
                        key={cat}
                        onClick={() => setNewChecklistCategory(cat)}
                        className="px-3 py-1.5 rounded-full text-xs font-light transition-all"
                        style={isActive
                          ? { backgroundColor: color, color: '#000000' }
                          : { backgroundColor: `${color}18`, color: color, border: `1px solid ${color}40` }
                        }
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mb-4">
                <ColorPicker selectedColor={newChecklistColor} onSelectColor={setNewChecklistColor} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-light text-[color:var(--app-text-2)] mb-2">Add Items</label>
                <div className="flex items-center gap-2">
                  <Input {...NO_AUTOFILL} name="checklist-item" ref={newItemFieldRef} value={newChecklistItemInput} onChange={e => setNewChecklistItemInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddChecklistItem(); } }} enterKeyHint="done" placeholder="Enter item..." className="flex-1 border-[#C9A962]/20 bg-[color:var(--app-wash)] text-[color:var(--app-text)]" />
                  <button onMouseDown={e => e.preventDefault()} onClick={handleAddChecklistItem} className="w-10 h-10 bg-[#C9A962] rounded-lg flex items-center justify-center hover:bg-[#D4B978]">
                    <Plus className="w-5 h-5 text-[#000000]" strokeWidth={2} />
                  </button>
                </div>
              </div>
              {newChecklistItems.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-light text-[color:var(--app-text-2)] mb-2">Items ({newChecklistItems.length})</label>
                  <div className="space-y-2">
                    {newChecklistItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 rounded-lg bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.15)]">
                        <div className="flex-1 text-sm font-light text-[color:var(--app-text)]">{item}</div>
                        <button onClick={() => setNewChecklistItems(newChecklistItems.filter((_, i) => i !== idx))} className="p-1 text-red-400">
                          <X className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={handleCreateChecklist} className="w-full py-3 bg-gradient-to-r from-[#D4B978] to-[#C9A962] text-[#000000] rounded-xl font-light">
                Create Checklist
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
