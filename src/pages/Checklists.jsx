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

function ChecklistModal({
  checklist, onClose, checkedItems, onToggleItem, onToggleCustom,
  customItems, addingToTopic, setAddingToTopic, newItemText, setNewItemText,
  onAddItem, editingItem, setEditingItem, editText, setEditText, onEditItem, onDeleteItem,
}) {
  if (!checklist) return null;
  const templateItems = checklist.items;
  const customItemsList = customItems[checklist.id] || [];
  const iconColor = checklist.color_tag || CATEGORY_COLORS[checklist.category] || '#C9A962';

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
          className="relative w-full bg-[#000000] border-t-2 border-[rgba(201,169,98,0.3)] rounded-t-3xl max-h-[85vh] overflow-y-auto scrollbar-soft z-10"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-[rgba(201,169,98,0.3)]" />
          </div>

          <div className="page-safe-x" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}>
            <div className="flex items-center justify-between py-4 border-b border-[rgba(201,169,98,0.2)] mb-4">
              <div className="flex items-center gap-3">
                <ChecklistIcon iconName={checklist.icon_name} color={iconColor} size="w-8 h-8" />
                <div>
                  <h2 className="text-xl font-light text-[#C9A962]">{checklist.name}</h2>
                  <p className="text-xs text-[#B8B8B8] mt-0.5">{templateItems.length + customItemsList.length} items</p>
                </div>
              </div>
              <button onClick={onClose} className="text-[#B8B8B8] hover:text-[#C9A962] transition-colors">
                <ChevronDown className="w-7 h-7" strokeWidth={1.5} />
              </button>
            </div>

            {templateItems.length > 0 && (
              <div className="space-y-2 mb-4">
                <div className="text-[10px] font-light uppercase tracking-wider text-[#B8B8B8] opacity-70 mb-2">Included</div>
                {templateItems.map((item, idx) => {
                  const isChecked = checkedItems[`${checklist.id}-${idx}`] || false;
                  return (
                    <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl bg-[rgba(0,0,0,0.5)] border border-[rgba(201,169,98,0.15)] transition-opacity ${isChecked ? 'opacity-50' : ''}`}>
                      <button onClick={() => onToggleItem(checklist.id, idx)} className="flex-shrink-0">
                        {isChecked
                          ? <CheckCircle2 className="w-5 h-5 text-[#6BBF8A]" strokeWidth={1.5} />
                          : <Circle className="w-5 h-5 text-[#C9A962]" strokeWidth={1.5} />}
                      </button>
                      <span className={`text-sm font-light flex-1 ${isChecked ? 'line-through text-[#6B6B6B]' : 'text-[#F5F1E8]'}`}>{item}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {customItemsList.length > 0 && (
              <div className="space-y-2 mb-4">
                <div className="text-[10px] font-light uppercase tracking-wider text-[#B8B8B8] opacity-70 mb-2">Your Add-Ons</div>
                {customItemsList.map((item, idx) => {
                  const isChecked = checkedItems[`${checklist.id}-custom-${idx}`] || false;
                  const itemKey = `${checklist.id}-custom-${idx}`;
                  return (
                    <div key={itemKey}>
                      {editingItem === itemKey ? (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(0,0,0,0.5)] border border-[rgba(201,169,98,0.3)]">
                          <input value={editText} onChange={e => setEditText(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') onEditItem(checklist.id, idx); if (e.key === 'Escape') setEditingItem(null); }}
                            className="flex-1 text-sm bg-transparent border-none outline-none text-[#F5F1E8]" autoFocus />
                          <button onClick={() => onEditItem(checklist.id, idx)} className="p-1 text-[#C9A962]"><CheckCircle2 className="w-4 h-4" strokeWidth={1.5} /></button>
                          <button onClick={() => setEditingItem(null)} className="p-1 text-red-400"><X className="w-4 h-4" strokeWidth={1.5} /></button>
                        </div>
                      ) : (
                        <div className={`flex items-center gap-3 p-3 rounded-xl bg-[rgba(0,0,0,0.5)] border border-[rgba(201,169,98,0.15)] ${isChecked ? 'opacity-50' : ''}`}>
                          <button onClick={() => onToggleCustom(checklist.id, idx)} className="flex-shrink-0">
                            {isChecked
                              ? <CheckCircle2 className="w-5 h-5 text-[#6BBF8A]" strokeWidth={1.5} />
                              : <Circle className="w-5 h-5 text-[#C9A962]" strokeWidth={1.5} />}
                          </button>
                          <span className={`text-sm font-light flex-1 ${isChecked ? 'line-through text-[#6B6B6B]' : 'text-[#F5F1E8]'}`}>{item}</span>
                          <button onClick={() => { setEditingItem(itemKey); setEditText(item); }} className="p-1 text-[#C9A962] opacity-60 hover:opacity-100"><Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} /></button>
                          <button onClick={() => onDeleteItem(checklist.id, idx)} className="p-1 text-red-400 opacity-60 hover:opacity-100"><Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} /></button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {addingToTopic === checklist.id ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(0,0,0,0.5)] border border-[rgba(201,169,98,0.3)]">
                <input value={newItemText} onChange={e => setNewItemText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') onAddItem(checklist.id); if (e.key === 'Escape') { setAddingToTopic(null); setNewItemText(''); } }}
                  placeholder="New item..." className="flex-1 text-sm bg-transparent border-none outline-none text-[#F5F1E8] placeholder-[#6B6B6B]" autoFocus />
                <button onClick={() => onAddItem(checklist.id)} className="p-1 text-[#C9A962]"><CheckCircle2 className="w-4 h-4" strokeWidth={1.5} /></button>
                <button onClick={() => { setAddingToTopic(null); setNewItemText(''); }} className="p-1 text-red-400"><X className="w-4 h-4" strokeWidth={1.5} /></button>
              </div>
            ) : (
              <button onClick={() => setAddingToTopic(checklist.id)}
                className="w-full py-3 rounded-xl border border-dashed border-[#C9A962]/30 hover:border-[#C9A962]/50 hover:bg-[rgba(201,169,98,0.05)] transition-all flex items-center justify-center gap-2 text-[#C9A962]">
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

  const [newChecklistName, setNewChecklistName] = useState('');
  const [newChecklistItems, setNewChecklistItems] = useState([]);
  const [newChecklistItemInput, setNewChecklistItemInput] = useState('');
  const [newChecklistColor, setNewChecklistColor] = useState('#6B7280');
  const [newChecklistCategory, setNewChecklistCategory] = useState('Productivity');

  const { data: userChecklists = [] } = useQuery({
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

  const { data: checklistProgress = {} } = useQuery({
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

  const { data: customItemsData = {} } = useQuery({
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

  useEffect(() => {
    setCheckedItems(checklistProgress);
  }, [checklistProgress]);

  useEffect(() => {
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
      const existing = customItemsData[checklistId] || [];
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userChecklists'] }),
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

  const handleAddItem = useCallback((checklistId) => {
    const trimmed = newItemText.trim();
    if (!trimmed) return;
    const current = customItems[checklistId] || [];
    if (current.find(i => i.toLowerCase() === trimmed.toLowerCase())) { showNotification('Item already exists'); return; }
    addCustomItemMutation.mutate({ checklistId, text: trimmed });
    setAddingToTopic(null);
    setNewItemText('');
    showNotification('Item added');
  }, [newItemText, customItems, addCustomItemMutation]);

  const handleEditItem = useCallback((checklistId, idx) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    const items = customItemsData[checklistId] || [];
    const item = items[idx];
    if (!item) return;
    updateCustomItemMutation.mutate({ id: item.id, text: trimmed });
    setEditingItem(null);
    showNotification('Item updated');
  }, [editText, customItemsData, updateCustomItemMutation]);

  const handleDeleteItem = useCallback((checklistId, idx) => {
    const items = customItemsData[checklistId] || [];
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

  const handleAddChecklistItem = () => {
    const trimmed = newChecklistItemInput.trim();
    if (!trimmed) return;
    if (newChecklistItems.find(i => i.toLowerCase() === trimmed.toLowerCase())) { showNotification('Item already added'); return; }
    setNewChecklistItems([...newChecklistItems, trimmed]);
    setNewChecklistItemInput('');
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
    setShowAddChecklist(false);
    setNewChecklistName('');
    setNewChecklistItems([]);
    setNewChecklistItemInput('');
    setNewChecklistColor('#6B7280');
    setNewChecklistCategory('Productivity');
    showNotification('Checklist created');
  };

  const CATEGORY_ORDER = ['Travel', 'Events', 'Home', 'Wellness', 'Productivity', 'Safety'];

  const filteredChecklists = useMemo(() => {
    const list = activeCategory === 'All' ? userChecklists : userChecklists.filter(c => c.category === activeCategory);
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
    <div className="min-h-screen pb-24" style={{ background: '#000000' }}>
      {notification && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl bg-gradient-to-br from-[#e2ba8b] to-[#C9A962] text-white shadow-lg text-sm font-light">
          {notification}
        </div>
      )}

      <div className="relative border-b-2 border-[rgba(201,169,98,0.25)] page-safe-x py-6">
        <button onClick={() => navigate(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity">
          <ChevronLeft className="w-6 h-6 text-[#C9A962]" strokeWidth={1.5} />
        </button>
        <div className="w-full text-center">
          <h1 className="text-3xl text-[#C9A962] font-light tracking-wide">Checklists</h1>
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="border-b border-[rgba(201,169,98,0.15)]">
        <div
          ref={tabsRef}
          className="flex gap-1 px-4 py-3 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {CATEGORY_TABS.map(tab => {
            const isActive = activeCategory === tab;
            const color = tab === 'All' ? '#C9A962' : CATEGORY_COLORS[tab];
            return (
              <button
                key={tab}
                onClick={() => setActiveCategory(tab)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-light transition-all duration-200 ${
                  isActive
                    ? 'text-[#000000] shadow-sm'
                    : 'text-[#B8B8B8] hover:text-[#F5F1E8] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.07)]'
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
            <ListChecks className="w-16 h-16 text-[#C9A962] opacity-30 mb-4" strokeWidth={1} />
            <p className="text-[#B8B8B8] font-light text-base mb-1">
              {activeCategory === 'All' ? 'No checklists yet' : `No ${activeCategory} checklists`}
            </p>
            <p className="text-[#6B6B6B] text-sm font-light">Tap the + button to create a checklist</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredChecklists.map((checklist, idx) => {
              const { totalItems, totalCompleted } = getStats(checklist);
              const iconColor = checklist.color_tag || CATEGORY_COLORS[checklist.category] || '#C9A962';
              const progress = totalItems > 0 ? (totalCompleted / totalItems) * 100 : 0;
              const categoryColor = CATEGORY_COLORS[checklist.category] || '#C9A962';

              const checklistImage = getChecklistImage(checklist.name);

              return (
                <motion.div
                  key={checklist.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="rounded-2xl border border-[rgba(201,169,98,0.3)] shadow-[0_0_8px_rgba(201,169,98,0.1)] backdrop-blur-sm hover:border-[rgba(201,169,98,0.5)] transition-all duration-300 overflow-hidden bg-gradient-to-br from-[rgba(0,0,0,0.8)] to-[rgba(0,0,0,0.6)]"
                >
                  <button
                    onClick={() => setActiveChecklist(checklist.id)}
                    className="w-full flex items-center gap-4 px-0 py-0 hover:bg-[rgba(201,169,98,0.03)] transition-colors"
                  >
                    {checklistImage ? (
                      <div className="w-16 h-16 rounded-l-2xl overflow-hidden flex-shrink-0">
                        <img
                          src={checklistImage}
                          alt={checklist.name}
                          loading="eager"
                          decoding="async"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                    ) : (
                      <div className="pl-4">
                        <ChecklistIcon iconName={checklist.icon_name} color={iconColor} size="w-10 h-10" />
                      </div>
                    )}
                    <div className="flex-1 text-left min-w-0 py-4 pr-4">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-light text-base text-[#F5F1E8] truncate">{checklist.name}</h3>
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
                        <div className="flex-1 h-1 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%`, backgroundColor: iconColor }}
                          />
                        </div>
                        <span className="text-xs text-[#B8B8B8] font-light flex-shrink-0">
                          {totalCompleted}/{totalItems}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#C9A962] flex-shrink-0 mr-4" strokeWidth={1.5} />
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
        className="fixed right-6 w-14 h-14 bg-[#C9A962] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all z-[55]"
        style={{ bottom: 'calc(7.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <Plus className="w-6 h-6 text-[#000000]" strokeWidth={2} />
      </button>

      {/* Checklist Modal */}
      {activeChecklistObj && (
        <ChecklistModal
          checklist={activeChecklistObj}
          onClose={() => { setActiveChecklist(null); setAddingToTopic(null); setNewItemText(''); setEditingItem(null); }}
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
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
        />
      )}

      {/* Add Checklist Bottom Sheet */}
      {showAddChecklist && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => { setShowAddChecklist(false); setNewChecklistName(''); setNewChecklistItems([]); setNewChecklistItemInput(''); }} />
          <div className="fixed bottom-0 left-0 right-0 bg-[#000000] border-t-2 border-[rgba(201,169,98,0.3)] rounded-t-3xl z-50 max-h-[85dvh] overflow-y-auto scrollbar-hide" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-light text-[#C9A962]">Create Checklist</h2>
                <button onClick={() => { setShowAddChecklist(false); setNewChecklistName(''); setNewChecklistItems([]); setNewChecklistItemInput(''); }} className="text-[#B8B8B8] hover:text-[#C9A962]">
                  <X className="w-6 h-6" strokeWidth={1.5} />
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-light text-[#B8B8B8] mb-2">Checklist Name</label>
                <Input value={newChecklistName} onChange={e => setNewChecklistName(e.target.value)} placeholder="e.g., Morning Routine" className="w-full border-[#C9A962]/20 bg-white/5 text-[#F5F1E8]" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-light text-[#B8B8B8] mb-2">Category</label>
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
                <label className="block text-sm font-light text-[#B8B8B8] mb-2">Add Items</label>
                <div className="flex items-center gap-2">
                  <Input value={newChecklistItemInput} onChange={e => setNewChecklistItemInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleAddChecklistItem(); }} placeholder="Enter item..." className="flex-1 border-[#C9A962]/20 bg-white/5 text-[#F5F1E8]" />
                  <button onClick={handleAddChecklistItem} className="w-10 h-10 bg-[#C9A962] rounded-lg flex items-center justify-center hover:bg-[#D4B978]">
                    <Plus className="w-5 h-5 text-[#000000]" strokeWidth={2} />
                  </button>
                </div>
              </div>
              {newChecklistItems.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-light text-[#B8B8B8] mb-2">Items ({newChecklistItems.length})</label>
                  <div className="space-y-2">
                    {newChecklistItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 rounded-lg bg-[rgba(0,0,0,0.4)] border border-[rgba(201,169,98,0.15)]">
                        <div className="flex-1 text-sm font-light text-[#F5F1E8]">{item}</div>
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
