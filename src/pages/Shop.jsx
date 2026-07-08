import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import {
  ShoppingBag, Plus, Check, X, ChevronDown, ChevronRight,
  ChevronLeft, Home, Sparkles, Shirt, Laptop, Dumbbell, Gift, CreditCard, Tag
} from 'lucide-react';
import CustomSelect from '../components/ui/CustomSelect';

const SHOP_BLOCKS = [
  { id: 'home',          label: 'Home Essentials',    icon: Home,       image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/shop-icon/ChatGPT%20Image%20Home%20essentials.png' },
  { id: 'beauty',        label: 'Beauty & Self-Care', icon: Sparkles,   image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/shop-icon/ChatGPT%20Image%20Beauty%20&%20Self-Care.png' },
  { id: 'clothing',      label: 'Clothing',           icon: Shirt,      image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/shop-icon/ChatGPT%20Image%20Clothing.png' },
  { id: 'tech',          label: 'Tech',               icon: Laptop,     image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/shop-icon/ChatGPT%20Image%20Tech.png' },
  { id: 'fitness',       label: 'Fitness',            icon: Dumbbell,   image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/shop-icon/ChatGPT%20Image%20Fitnes.png' },
  { id: 'gifts',         label: 'Gifts',              icon: Gift,       image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/shop-icon/ChatGPT%20Image%20Gifts%20shop.png' },
  { id: 'subscriptions', label: 'Subscriptions',      icon: CreditCard, image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/shop-icon/ChatGPT%20Image%20Sub.png' },
  { id: 'custom',        label: 'Custom',             icon: Tag,        image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/shop-icon/ChatGPT%20Image%20Custom.png' },
];

const EMPTY_FORM = { name: '', category: 'home', link: '', notes: '', priority: 'medium' };

export default function Shop() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showDialog, setShowDialog] = useState(false);
  const [newItem, setNewItem] = useState(EMPTY_FORM);
  const [collapsedCategories, setCollapsedCategories] = useState(
    Object.fromEntries(SHOP_BLOCKS.map(b => [b.id, true]))
  );

  const ui = useMemo(() => ({
    gold: 'var(--app-gold)', bg: 'var(--app-bg)', panel: 'var(--app-bg)', panel2: 'var(--app-bg)',
    text: 'var(--app-text)', muted: 'var(--app-text-2)', muted2: 'var(--app-text-3)',
    border: 'rgba(201,169,98,0.30)', borderSoft: 'rgba(201,169,98,0.18)',
    borderSofter: 'rgba(201,169,98,0.10)', wash: 'rgba(201,169,98,0.06)', wash2: 'rgba(201,169,98,0.10)',
  }), []);

  /* ── Query ── */
  const { data: shopItems = [] } = useQuery({
    queryKey: ['shopItems'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('shop_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  /* ── Mutations ── */
  const insertMutation = useMutation({
    mutationFn: async (item) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('shop_items')
        .insert({ ...item, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shopItems'] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('shop_items')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shopItems'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('shop_items').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shopItems'] }),
  });

  const deleteCheckedMutation = useMutation({
    mutationFn: async (ids) => {
      const { error } = await supabase.from('shop_items').delete().in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shopItems'] }),
  });

  /* ── Handlers ── */
  const handleAddBlock = (block) => {
    setNewItem({ ...EMPTY_FORM, category: block.id });
    setShowDialog(true);
  };

  const handleAdd = () => {
    if (!newItem.name.trim()) return;
    insertMutation.mutate({ ...newItem, name: newItem.name.trim() });
    setNewItem(EMPTY_FORM);
    setShowDialog(false);
  };

  const toggleItem = (item) => {
    updateMutation.mutate({ id: item.id, updates: { checked: !item.checked } });
  };

  const deleteItem = (id) => {
    deleteMutation.mutate(id);
  };

  const clearChecked = () => {
    const ids = shopItems.filter(i => i.checked).map(i => i.id);
    if (ids.length) deleteCheckedMutation.mutate(ids);
  };

  const toggleCategory = (id) => {
    setCollapsedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getCategoryItems = (categoryId) => {
    const items = shopItems.filter(i => i.category === categoryId);
    return [...items.filter(i => !i.checked), ...items.filter(i => i.checked)];
  };

  const checkedCount = shopItems.filter(i => i.checked).length;

  return (
    <div className="w-full">
      <div className="relative border-b-2 border-[rgba(201,169,98,0.25)] page-safe-x py-6">
        <button onClick={() => navigate(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity">
          <ChevronLeft className="w-6 h-6 text-[color:var(--app-gold)]" strokeWidth={1.5} />
        </button>
        <div className="w-full text-center">
          <h1 className="text-3xl text-[color:var(--app-gold)] font-light tracking-wide">Shop</h1>
        </div>
      </div>

      <div className="page-safe-x pt-4 pb-4 space-y-4">
        {/* Quick Add */}
        <div>
          <h3 className="text-sm uppercase tracking-wider mb-3" style={{ color: ui.muted }}>Quick Add</h3>
          <div className="grid grid-cols-2 gap-2">
            {SHOP_BLOCKS.map((block) => {
              const BlockIcon = block.icon;
              return (
                <button key={block.id} onClick={() => handleAddBlock(block)}
                  className="flex items-center rounded-xl overflow-hidden transition-all active:scale-95"
                  style={{ backgroundColor: ui.wash, border: `1px solid ${ui.border}`, height: 'clamp(76px, 22vw, 90px)' }}>
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
                      <BlockIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--app-gold)' }} strokeWidth={1.5} />
                      <span className="text-xs text-left leading-tight" style={{ color: ui.text }}>{block.label}</span>
                    </div>
                    <Plus className="w-4 h-4 self-end" style={{ color: 'var(--app-gold)' }} strokeWidth={1.5} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 py-2">
          <div className="h-px flex-1" style={{ backgroundColor: ui.border }} />
          <h3 className="text-xs uppercase tracking-wider" style={{ color: ui.muted }}>Shopping List</h3>
          <div className="h-px flex-1" style={{ backgroundColor: ui.border }} />
        </div>

        {/* Category Groups */}
        <div className="space-y-3">
          {SHOP_BLOCKS.map((block) => {
            const items = getCategoryItems(block.id);
            if (items.length === 0) return null;
            const isCollapsed = collapsedCategories[block.id];
            const uncheckedCount = items.filter(i => !i.checked).length;
            const BlockIcon = block.icon;
            return (
              <div key={block.id} className="rounded-2xl overflow-hidden" style={{ backgroundColor: ui.panel, border: `1px solid ${ui.border}` }}>
                <button onClick={() => toggleCategory(block.id)}
                  className="w-full px-4 py-3.5 flex items-center justify-between"
                  style={{ borderBottom: `1px solid ${ui.borderSoft}` }}>
                  <div className="flex items-center gap-2.5">
                    <BlockIcon className="w-5 h-5" style={{ color: 'var(--app-gold)' }} strokeWidth={1.5} />
                    <span className="text-sm font-light" style={{ color: ui.text }}>{block.label}</span>
                    <span className="text-xs" style={{ color: ui.muted }}>({uncheckedCount})</span>
                  </div>
                  {isCollapsed
                    ? <ChevronRight className="w-4 h-4" style={{ color: 'var(--app-gold)' }} strokeWidth={1.5} />
                    : <ChevronDown className="w-4 h-4" style={{ color: 'var(--app-gold)' }} strokeWidth={1.5} />
                  }
                </button>

                {!isCollapsed && (
                  <div className="p-3">
                    {items.map((item, idx) => (
                      <div key={item.id}
                        className={`flex items-start gap-3 px-3 py-3 ${item.checked ? 'opacity-50' : ''}`}
                        style={{ borderBottom: idx < items.length - 1 ? `1px solid ${ui.borderSofter}` : 'none' }}>
                        <button
                          onClick={() => toggleItem(item)}
                          className="w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all flex-shrink-0 mt-0.5"
                          style={{ borderColor: item.checked ? ui.gold : 'rgba(201,169,98,0.50)', backgroundColor: item.checked ? ui.gold : 'transparent' }}>
                          {item.checked && <Check className="w-3.5 h-3.5" style={{ color: ui.bg }} strokeWidth={2.5} />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <span className={`text-sm block ${item.checked ? 'line-through' : ''}`}
                            style={{ color: item.checked ? ui.muted2 : ui.text }}>
                            {item.name}
                          </span>
                          {item.notes && (
                            <span className="text-xs block mt-0.5" style={{ color: ui.muted2 }}>{item.notes}</span>
                          )}
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {item.priority === 'high' && !item.checked && (
                              <span className="text-xs px-2 py-0.5 rounded-full uppercase tracking-wider inline-block"
                                style={{ backgroundColor: ui.wash2, color: 'var(--app-gold)' }}>High</span>
                            )}
                            {item.link && !item.checked && (
                              <a href={item.link} target="_blank" rel="noopener noreferrer"
                                className="text-xs underline"
                                style={{ color: 'var(--app-gold)' }}
                                onClick={e => e.stopPropagation()}>
                                View Link
                              </a>
                            )}
                          </div>
                        </div>

                        <button onClick={() => deleteItem(item.id)} style={{ color: ui.muted }} className="flex-shrink-0 mt-0.5">
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

        {shopItems.length === 0 && (
          <div className="rounded-2xl p-12 text-center border-2 border-dashed"
            style={{ backgroundColor: ui.panel, borderColor: ui.border }}>
            <ShoppingBag className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(201,169,98,0.20)' }} strokeWidth={1.5} />
            <div className="text-sm mb-2" style={{ color: ui.muted }}>No items yet</div>
            <div className="text-xs" style={{ color: ui.muted2 }}>Use Quick Add to start shopping</div>
          </div>
        )}

        {checkedCount > 0 && (
          <button onClick={clearChecked}
            className="w-full py-3 rounded-full text-sm"
            style={{ backgroundColor: ui.panel, border: `1px solid ${ui.border}`, color: 'var(--app-gold)' }}>
            Clear Checked Items ({checkedCount})
          </button>
        )}
      </div>

      {/* Add Item Dialog */}
      {showDialog && (
        <div className="fixed inset-0 flex items-end z-[99999]"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
          onClick={() => setShowDialog(false)}>
          <div className="w-full rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto border-t-2 relative scrollbar-hide"
            style={{ backgroundColor: ui.panel2, borderColor: ui.border }}
            onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowDialog(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full">
              <X className="w-5 h-5" style={{ color: 'var(--app-gold)' }} />
            </button>
            <h2 className="text-xl font-light mb-6" style={{ color: 'var(--app-gold)' }}>Add Shop Item</h2>

            <div className="space-y-4 pb-32">
              <div>
                <label className="text-xs uppercase mb-2 block" style={{ color: ui.muted }}>Item Name</label>
                <input type="text" value={newItem.name}
                  onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g. Yoga Mat"
                  className="w-full px-4 py-3 rounded-xl focus:outline-none"
                  style={{ backgroundColor: ui.panel, border: `1px solid ${ui.border}`, color: ui.text }} />
              </div>

              <div>
                <label className="text-xs uppercase mb-2 block" style={{ color: ui.muted }}>Category</label>
                <CustomSelect
                  value={newItem.category}
                  onChange={(val) => setNewItem({ ...newItem, category: val })}
                  options={SHOP_BLOCKS.map(b => ({ value: b.id, label: b.label }))}
                />
              </div>

              <div>
                <label className="text-xs uppercase mb-2 block" style={{ color: ui.muted }}>Link (Optional)</label>
                <input type="text" value={newItem.link}
                  onChange={e => setNewItem({ ...newItem, link: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl focus:outline-none"
                  style={{ backgroundColor: ui.panel, border: `1px solid ${ui.border}`, color: ui.text }} />
              </div>

              <div>
                <label className="text-xs uppercase mb-2 block" style={{ color: ui.muted }}>Priority</label>
                <CustomSelect
                  value={newItem.priority}
                  onChange={(val) => setNewItem({ ...newItem, priority: val })}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                  ]}
                />
              </div>

              <div>
                <label className="text-xs uppercase mb-2 block" style={{ color: ui.muted }}>Notes (Optional)</label>
                <textarea value={newItem.notes}
                  onChange={e => setNewItem({ ...newItem, notes: e.target.value })}
                  placeholder="Size, color, or other details..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none resize-none"
                  style={{ backgroundColor: ui.panel, border: `1px solid ${ui.border}`, color: ui.text }} />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowDialog(false)}
                  className="flex-1 py-3 rounded-full text-sm"
                  style={{ backgroundColor: ui.panel, border: `1px solid ${ui.border}`, color: ui.muted }}>
                  Cancel
                </button>
                <button onClick={handleAdd} disabled={!newItem.name.trim() || insertMutation.isPending}
                  className="flex-1 py-3 rounded-full text-sm font-medium disabled:opacity-50"
                  style={{ backgroundColor: ui.gold, color: ui.bg }}>
                  {insertMutation.isPending ? 'Adding...' : 'Add to Shop'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
