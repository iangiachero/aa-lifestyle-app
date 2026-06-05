import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Plus,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Home,
  Sparkles,
  Shirt,
  Laptop,
  Dumbbell,
  Gift,
  CreditCard,
  Tag,
  ChevronLeft
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import CustomSelect from '../components/ui/CustomSelect';
import ColorPicker from '../components/ui/ColorPicker';
import ColorDot from '../components/ui/ColorDot';

const EMPTY_ITEM = {
  name: '',
  category: 'home',
  link: '',
  notes: '',
  priority: 'medium',
  color_tag: '#6B7280',
};

export default function Shopping() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [newItem, setNewItem] = useState({ ...EMPTY_ITEM });

  const ui = useMemo(() => ({
    gold: '#C9A962',
    bg: '#000000',
    panel: '#000000',
    panel2: '#000000',
    text: '#F5F1E8',
    muted: '#B8B8B8',
    muted2: '#6B6B6B',
    border: 'rgba(201,169,98,0.30)',
    borderSoft: 'rgba(201,169,98,0.18)',
    borderSofter: 'rgba(201,169,98,0.10)',
    wash: 'rgba(201,169,98,0.06)',
    wash2: 'rgba(201,169,98,0.10)',
  }), []);

  const shopBlocks = [
    { id: 'home', label: 'Home Essentials', icon: Home, image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/shop-icon/ChatGPT%20Image%20Home%20essentials.png' },
    { id: 'beauty', label: 'Beauty & Self-Care', icon: Sparkles, image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/shop-icon/ChatGPT%20Image%20Beauty%20&%20Self-Care.png' },
    { id: 'clothing', label: 'Clothing', icon: Shirt, image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/shop-icon/ChatGPT%20Image%20Clothing.png' },
    { id: 'tech', label: 'Tech', icon: Laptop, image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/shop-icon/ChatGPT%20Image%20Tech.png' },
    { id: 'fitness', label: 'Fitness', icon: Dumbbell, image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/shop-icon/ChatGPT%20Image%20Fitnes.png' },
    { id: 'gifts', label: 'Gifts', icon: Gift, image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/shop-icon/ChatGPT%20Image%20Gifts%20shop.png' },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/shop-icon/ChatGPT%20Image%20Sub.png' },
    { id: 'custom', label: 'Custom', icon: Tag, image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/shop-icon/ChatGPT%20Image%20Custom.png' },
  ];

  const { data: shopItems = [] } = useQuery({
    queryKey: ['shoppingItems'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('shopping_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async (item) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('shopping_items')
        .insert({ ...item, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shoppingItems'] }),
  });

  const toggleItemMutation = useMutation({
    mutationFn: async ({ id, checked }) => {
      const { error } = await supabase
        .from('shopping_items')
        .update({ checked })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shoppingItems'] }),
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('shopping_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shoppingItems'] }),
  });

  const clearCheckedMutation = useMutation({
    mutationFn: async () => {
      const checkedIds = shopItems.filter(i => i.checked).map(i => i.id);
      if (checkedIds.length === 0) return;
      const { error } = await supabase
        .from('shopping_items')
        .delete()
        .in('id', checkedIds);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shoppingItems'] }),
  });

  const handleAddBlock = (block) => {
    setNewItem({ ...EMPTY_ITEM, category: block.id });
    setShowDialog(true);
  };

  const handleAddItem = () => {
    if (!newItem.name.trim()) return;
    addItemMutation.mutate({
      name: newItem.name.trim(),
      category: newItem.category,
      link: newItem.link,
      notes: newItem.notes,
      priority: newItem.priority,
      color_tag: newItem.color_tag,
    });
    setNewItem({ ...EMPTY_ITEM });
    setShowDialog(false);
  };

  const checkedCount = shopItems.filter(i => i.checked).length;

  const toggleCategory = (categoryId) => {
    setCollapsedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const getCategoryItems = (categoryId) => {
    const items = shopItems.filter(i => i.category === categoryId);
    return [...items.filter(i => !i.checked), ...items.filter(i => i.checked)];
  };

  return (
    <div className="w-full min-h-full bg-[#000000]">
      <div className="relative border-b-2 border-[rgba(201,169,98,0.25)] page-safe-x py-6">
        <button onClick={() => navigate(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity">
          <ChevronLeft className="w-6 h-6 text-[#C9A962]" strokeWidth={1.5} />
        </button>
        <div className="w-full text-center">
          <h1 className="text-3xl text-[#C9A962] font-light tracking-wide">Shopping</h1>
        </div>
      </div>

      <div className="page-safe-x pt-4 pb-4 space-y-4">
        <div>
          <h3 className="text-sm uppercase tracking-wider mb-3" style={{ color: ui.muted }}>Quick Add</h3>
          <div className="grid grid-cols-2 gap-2">
            {shopBlocks.map((block) => {
              const BlockIcon = block.icon;
              return (
                <button
                  key={block.id}
                  onClick={() => handleAddBlock(block)}
                  className="flex items-center rounded-xl overflow-hidden transition-all active:scale-95"
                  style={{ backgroundColor: ui.wash, border: `1px solid ${ui.border}`, height: '90px' }}
                >
                  <div className="flex-shrink-0 overflow-hidden" style={{ width: '90px', height: '90px' }}>
                    <img
                      src={block.image}
                      alt={block.label}
                      width="90"
                      height="90"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  <div className="flex-1 flex flex-col items-start justify-between px-2.5 py-2.5 h-full">
                    <div className="flex items-center gap-1.5">
                      <BlockIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: ui.gold }} strokeWidth={1.5} />
                      <span className="text-xs text-left leading-tight" style={{ color: ui.text }}>{block.label}</span>
                    </div>
                    <Plus className="w-4 h-4 self-end" style={{ color: ui.gold }} strokeWidth={1.5} />
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

        <div className="space-y-3">
          {shopBlocks.map((block) => {
            const items = getCategoryItems(block.id);
            if (items.length === 0) return null;

            const isCollapsed = collapsedCategories[block.id];
            const uncheckedCount = items.filter(i => !i.checked).length;
            const BlockIcon = block.icon;

            return (
              <div key={block.id} className="rounded-2xl overflow-hidden" style={{ backgroundColor: ui.panel, border: `1px solid ${ui.border}` }}>
                <button
                  onClick={() => toggleCategory(block.id)}
                  className="w-full px-4 py-3.5 flex items-center justify-between transition-colors"
                  style={{ borderBottom: `1px solid ${ui.borderSoft}` }}
                >
                  <div className="flex items-center gap-2.5">
                    <BlockIcon className="w-5 h-5" style={{ color: ui.gold }} strokeWidth={1.5} />
                    <span className="text-sm font-light" style={{ color: ui.text }}>{block.label}</span>
                    <span className="text-xs" style={{ color: ui.muted }}>({uncheckedCount})</span>
                  </div>
                  {isCollapsed
                    ? <ChevronRight className="w-4 h-4" style={{ color: ui.gold }} strokeWidth={1.5} />
                    : <ChevronDown className="w-4 h-4" style={{ color: ui.gold }} strokeWidth={1.5} />
                  }
                </button>

                {!isCollapsed && (
                  <div className="p-3">
                    {items.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 px-3 py-3 transition-all ${item.checked ? 'opacity-50' : ''}`}
                        style={{ borderBottom: idx < items.length - 1 ? `1px solid ${ui.borderSofter}` : 'none' }}
                      >
                        <button
                          onClick={() => toggleItemMutation.mutate({ id: item.id, checked: !item.checked })}
                          className="w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all flex-shrink-0"
                          style={{
                            borderColor: item.checked ? ui.gold : 'rgba(201,169,98,0.50)',
                            backgroundColor: item.checked ? ui.gold : 'transparent',
                          }}
                        >
                          {item.checked && <Check className="w-3.5 h-3.5" style={{ color: ui.bg }} strokeWidth={2.5} />}
                        </button>

                        <ColorDot color={item.color_tag || '#6B7280'} size="sm" />

                        <div className="flex-1 min-w-0">
                          <span className={`text-sm block ${item.checked ? 'line-through' : ''}`} style={{ color: item.checked ? ui.muted2 : ui.text }}>
                            {item.name}
                          </span>
                          {item.priority === 'high' && !item.checked && (
                            <span className="text-xs px-2 py-0.5 rounded-full uppercase tracking-wider mt-1 inline-block" style={{ backgroundColor: ui.wash2, color: ui.gold }}>
                              High
                            </span>
                          )}
                        </div>

                        <button style={{ color: ui.muted }} onClick={() => deleteItemMutation.mutate(item.id)}>
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
          <div className="rounded-2xl p-12 text-center border-2 border-dashed" style={{ backgroundColor: ui.panel, borderColor: ui.border }}>
            <ShoppingBag className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(201,169,98,0.20)' }} strokeWidth={1.5} />
            <div className="text-sm mb-2" style={{ color: ui.muted }}>No items yet</div>
            <div className="text-xs" style={{ color: ui.muted2 }}>Use Quick Add to start shopping</div>
          </div>
        )}

        {checkedCount > 0 && (
          <button
            onClick={() => clearCheckedMutation.mutate()}
            className="w-full py-3 rounded-full text-sm"
            style={{ backgroundColor: ui.panel, border: `1px solid ${ui.border}`, color: ui.gold }}
          >
            Clear Checked Items ({checkedCount})
          </button>
        )}
      </div>

      {showDialog && (
        <div
          className="fixed inset-0 flex items-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 99999 }}
          onClick={() => setShowDialog(false)}
        >
          <div
            className="w-full rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto scrollbar-hide border-t-2 relative"
            style={{ backgroundColor: ui.panel2, borderColor: ui.border }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDialog(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full"
            >
              <X className="w-5 h-5" style={{ color: ui.gold }} />
            </button>

            <h2 className="text-xl font-light mb-6" style={{ color: ui.gold }}>Add Shop Item</h2>

            <div className="space-y-4 pb-32">
              <div>
                <label className="text-xs uppercase mb-2 block" style={{ color: ui.muted }}>Item Name</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="What do you need?"
                  className="w-full px-4 py-3 rounded-xl focus:outline-none"
                  style={{ backgroundColor: ui.panel, border: `1px solid ${ui.border}`, color: ui.text }}
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs uppercase mb-2 block" style={{ color: ui.muted }}>Category</label>
                <CustomSelect
                  value={newItem.category}
                  onChange={(val) => setNewItem({ ...newItem, category: val })}
                  options={shopBlocks.map(b => ({ value: b.id, label: b.label }))}
                />
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

              <ColorPicker
                selectedColor={newItem.color_tag}
                onSelectColor={(color) => setNewItem({ ...newItem, color_tag: color })}
              />

              <div>
                <label className="text-xs uppercase mb-2 block" style={{ color: ui.muted }}>Link (Optional)</label>
                <input
                  type="text"
                  value={newItem.link}
                  onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl focus:outline-none"
                  style={{ backgroundColor: ui.panel, border: `1px solid ${ui.border}`, color: ui.text }}
                />
              </div>

              <div>
                <label className="text-xs uppercase mb-2 block" style={{ color: ui.muted }}>Notes (Optional)</label>
                <textarea
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none resize-none"
                  style={{ backgroundColor: ui.panel, border: `1px solid ${ui.border}`, color: ui.text }}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDialog(false)}
                  className="flex-1 py-3 rounded-full text-sm"
                  style={{ backgroundColor: ui.panel, border: `1px solid ${ui.border}`, color: ui.muted }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddItem}
                  disabled={!newItem.name.trim()}
                  className="flex-1 py-3 rounded-full text-sm font-medium disabled:opacity-50"
                  style={{ backgroundColor: ui.gold, color: ui.bg }}
                >
                  Add to Shop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
