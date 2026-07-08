import React, { useState } from 'react';
import Notification from '../components/Notification';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import {
  ShoppingCart, Plus, Check, X, ChevronDown, ChevronRight,
  Apple, Drumstick, Milk, Wheat, Carrot, Package, ChevronLeft
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import CustomSelect from '../components/ui/CustomSelect';

const GROCERY_BLOCKS = [
  { id: 'produce',   label: 'Produce',        icon: Apple,        color: 'var(--app-gold-light)', image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/grocery-icon/ChatGPT%20Image%20grocery%20produce.png' },
  { id: 'protein',   label: 'Protein',         icon: Drumstick,    color: '#d4ab77', image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/grocery-icon/ChatGPT%20Image%20grocery%20protein.png' },
  { id: 'dairy',     label: 'Dairy',           icon: Milk,         color: '#edc9a0', image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/grocery-icon/ChatGPT%20Image%20grocery%20dairy.png' },
  { id: 'grains',    label: 'Grains & Bread',  icon: Wheat,        color: 'var(--app-gold)', image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/grocery-icon/ChatGPT%20Image%20grocery%20bread.png' },
  { id: 'frozen',    label: 'Frozen',          icon: Carrot,       color: '#b8a07a', image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/grocery-icon/ChatGPT%20Image%20grocery%20frozen.png' },
  { id: 'pantry',    label: 'Pantry',          icon: Package,      color: '#d4b574', image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/grocery-icon/ChatGPT%20Image%20grocery%20pantry.png' },
];

const ALL_DISPLAY_BLOCKS = [
  ...GROCERY_BLOCKS,
  { id: 'meal-plan', label: 'From Meal Plan',  icon: ShoppingCart, color: '#a89060', quickAdd: false },
  { id: 'recipe',    label: 'From Recipes',    icon: ShoppingCart, color: '#a89060', quickAdd: false },
];

const EMPTY_FORM = { name: '', category: 'produce', notes: '' };

export default function GroceryList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showDialog, setShowDialog] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [notification, setNotification] = useState(null);
  const [newItem, setNewItem] = useState(EMPTY_FORM);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const { data: groceryItems = [] } = useQuery({
    queryKey: ['groceryItems'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('grocery_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (item) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('grocery_items')
        .insert({
          user_id: user.id,
          name: item.name.trim(),
          category: item.category,
          notes: item.notes,
          is_completed: false,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groceryItems'] });
      setShowDialog(false);
      setNewItem(EMPTY_FORM);
      showNotification('Item added');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_completed }) => {
      const { data, error } = await supabase
        .from('grocery_items')
        .update({ is_completed })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groceryItems'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('grocery_items').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groceryItems'] });
      showNotification('Item removed');
    },
  });

  const deleteCheckedMutation = useMutation({
    mutationFn: async (ids) => {
      const { error } = await supabase.from('grocery_items').delete().in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groceryItems'] });
    },
  });

  const handleAddBlock = (block) => {
    setNewItem({ ...EMPTY_FORM, category: block.id });
    setShowDialog(true);
  };

  const toggleItem = (item) => {
    toggleMutation.mutate({ id: item.id, is_completed: !item.is_completed });
  };

  const deleteItem = (id) => deleteMutation.mutate(id);

  const addItem = () => {
    if (!newItem.name.trim()) return;
    createItemMutation.mutate(newItem);
  };

  const toggleCategory = (id) => {
    setCollapsedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const clearChecked = () => {
    const ids = groceryItems.filter(i => i.is_completed).map(i => i.id);
    if (ids.length) deleteCheckedMutation.mutate(ids);
  };

  const getCategoryItems = (categoryId) => {
    const items = groceryItems.filter(i => (i.category || 'produce') === categoryId);
    return [...items.filter(i => !i.is_completed), ...items.filter(i => i.is_completed)];
  };

  const checkedCount = groceryItems.filter(i => i.is_completed).length;

  return (
    <div className="min-h-full pb-8">
      <Notification
        message={notification}
        show={!!notification}
        onClose={() => setNotification(null)}
      />

      <div className="relative border-b-2 border-[rgba(201,169,98,0.25)] page-safe-x py-6">
        <button onClick={() => navigate(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity">
          <ChevronLeft className="w-6 h-6 text-[color:var(--app-gold)]" strokeWidth={1.5} />
        </button>
        <div className="w-full text-center">
          <h1 className="text-3xl text-[color:var(--app-gold)] font-light tracking-wide">Grocery List</h1>
        </div>
      </div>

      <div className="page-safe-x pt-4 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-[color:var(--app-gold-light)]" strokeWidth={1.5} />
            <h3 className="text-xs text-[color:var(--app-gold-light)] uppercase tracking-wider font-light">Quick Add</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {GROCERY_BLOCKS.map((block) => {
              const BlockIcon = block.icon;
              return (
                <button key={block.id} onClick={() => handleAddBlock(block)}
                  className="flex items-center rounded-xl overflow-hidden transition-all active:scale-95 hover:shadow-lg"
                  style={{ backgroundColor: 'rgba(201,169,98,0.06)', border: '1px solid rgba(201,169,98,0.30)', height: 'clamp(76px, 22vw, 90px)' }}>
                  <div className="flex-shrink-0 overflow-hidden" style={{ width: 'clamp(76px, 22vw, 90px)', height: 'clamp(76px, 22vw, 90px)' }}>
                    <img
                      src={block.image}
                      alt={block.label}
                      loading="eager"
                      decoding="async"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  <div className="flex-1 flex flex-col items-start justify-between px-2.5 py-2.5 h-full">
                    <div className="flex items-center gap-1.5">
                      <BlockIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: block.color }} strokeWidth={1.5} />
                      <span className="text-xs text-left leading-tight text-[color:var(--app-text)] font-light">{block.label}</span>
                    </div>
                    <Plus className="w-4 h-4 self-end" style={{ color: 'var(--app-gold)' }} strokeWidth={1.5} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          {ALL_DISPLAY_BLOCKS.map((block) => {
            const items = getCategoryItems(block.id);
            if (items.length === 0) return null;
            const isCollapsed = collapsedCategories[block.id];
            const uncheckedCount = items.filter(i => !i.is_completed).length;
            const BlockIcon = block.icon;
            return (
              <div key={block.id} className="card-luxury overflow-hidden">
                <button onClick={() => toggleCategory(block.id)}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[rgba(226,186,139,0.05)] transition-colors border-b border-[rgba(226,186,139,0.15)]">
                  <div className="flex items-center gap-2.5">
                    <BlockIcon className="w-5 h-5" style={{ color: block.color }} strokeWidth={1.5} />
                    <span className="text-sm text-[color:var(--app-text)] font-light">{block.label}</span>
                    <span className="text-xs text-[color:var(--app-text-2)]">({uncheckedCount})</span>
                  </div>
                  {isCollapsed
                    ? <ChevronRight className="w-4 h-4 text-[color:var(--app-gold-light)]" strokeWidth={1.5} />
                    : <ChevronDown className="w-4 h-4 text-[color:var(--app-gold-light)]" strokeWidth={1.5} />
                  }
                </button>

                {!isCollapsed && (
                  <div className="p-3 space-y-0">
                    {items.map((item, idx) => (
                      <div key={item.id}
                        className={`flex items-start gap-3 px-3 py-3 transition-all ${idx < items.length - 1 ? 'border-b border-[rgba(226,186,139,0.1)]' : ''} ${item.is_completed ? 'opacity-50' : 'hover:bg-[rgba(226,186,139,0.05)]'}`}>
                        <button onClick={() => toggleItem(item)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all flex-shrink-0 mt-0.5 ${item.is_completed ? 'bg-[#e2ba8b] border-[#e2ba8b]' : 'border-[rgba(226,186,139,0.5)] hover:border-[#e2ba8b]'}`}>
                          {item.is_completed && <Check className="w-3.5 h-3.5 text-[#000000]" strokeWidth={2.5} />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm block font-light ${item.is_completed ? 'line-through text-[color:var(--app-text-3)]' : 'text-[color:var(--app-text)]'}`}>
                            {item.name}
                          </span>
                          {item.notes && !item.is_completed && (
                            <span className="text-xs text-[color:var(--app-text-2)] font-light">{item.notes}</span>
                          )}
                        </div>
                        <button onClick={() => deleteItem(item.id)} className="hover:text-red-400 transition-colors text-[color:var(--app-text-2)] flex-shrink-0 mt-0.5">
                          <X className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {groceryItems.length === 0 && (
          <div className="card-luxury p-12 text-center border-2 border-dashed border-[rgba(201,169,98,0.2)]">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-[rgba(201,169,98,0.20)]" strokeWidth={1.5} />
            <div className="text-sm text-[color:var(--app-text-2)] mb-2">No items yet</div>
            <div className="text-xs text-[color:var(--app-text-3)]">Use Quick Add to start your list</div>
          </div>
        )}

        {checkedCount > 0 && (
          <button onClick={clearChecked}
            className="w-full py-3 card-luxury text-sm text-[color:var(--app-gold-light)] hover:bg-[rgba(226,186,139,0.05)] transition-colors font-light">
            Clear Checked Items ({checkedCount})
          </button>
        )}
      </div>

      {showDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowDialog(false)}>
          <div className="w-full bg-[color:var(--app-bg)] rounded-t-3xl border-t-2 border-[rgba(201,169,98,0.3)] max-h-[85vh] overflow-y-auto scrollbar-hide"
            onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-[color:var(--app-bg)] border-b border-[rgba(201,169,98,0.2)] px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl text-[color:var(--app-gold-light)] font-light">Add Grocery Item</h2>
                <p className="text-xs text-[color:var(--app-text-2)] mt-1">Add to your shopping list</p>
              </div>
              <button onClick={() => setShowDialog(false)}
                className="w-8 h-8 rounded-full bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] flex items-center justify-center">
                <X className="w-4 h-4 text-[color:var(--app-gold-light)]" strokeWidth={1.5} />
              </button>
            </div>

            <div className="px-6 py-6 pb-32 space-y-4">
              <div>
                <label className="text-xs text-[color:var(--app-gold-light)]/70 font-light uppercase tracking-wider mb-2 block">Item Name</label>
                <Input placeholder="e.g., Organic Spinach"
                  value={newItem.name}
                  onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                  className="border-[#e2ba8b]/20 focus:border-[#e2ba8b] rounded-xl bg-[rgba(0,0,0,0.5)] text-[color:var(--app-text)]" />
              </div>

              <div>
                <label className="text-xs text-[color:var(--app-gold-light)]/70 font-light uppercase tracking-wider mb-2 block">Category</label>
                <select
                  value={newItem.category}
                  onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full px-4 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-xl text-sm text-[color:var(--app-text)] focus:border-[#C9A962] focus:outline-none appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23C9A962' stroke-width='1.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                >
                  {GROCERY_BLOCKS.map(block => (
                    <option key={block.id} value={block.id} style={{ backgroundColor: 'var(--app-bg)', color: 'var(--app-text)' }}>
                      {block.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-[color:var(--app-gold-light)]/70 font-light uppercase tracking-wider mb-2 block">Notes (Optional)</label>
                <Textarea placeholder="Quantity, brand, or other details..."
                  value={newItem.notes}
                  onChange={e => setNewItem({ ...newItem, notes: e.target.value })}
                  className="border-[#e2ba8b]/20 focus:border-[#e2ba8b] rounded-xl min-h-[80px] bg-[rgba(0,0,0,0.5)] text-[color:var(--app-text)]" />
              </div>

              <button onClick={addItem}
                disabled={!newItem.name.trim() || createItemMutation.isPending}
                className="w-full px-6 py-4 rounded-xl bg-gradient-to-br from-[#e2ba8b] to-[#C9A962] text-white font-light shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                {createItemMutation.isPending ? 'Adding...' : 'Add to List'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}