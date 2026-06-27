import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { encryptPassword, decryptPassword } from '../utils/crypto';
import PinSetup from './passwordvault/PinSetup';
import PinVerify from './passwordvault/PinVerify';
import ChangePinModal from './passwordvault/ChangePinModal';
import {
  Plus, ChevronLeft, X, Eye, EyeOff, Copy, Pencil, Trash2,
  Shield, Globe, CreditCard, ShoppingBag, Briefcase, Users, Lock,
  Check, KeyRound,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'work', label: 'Work', icon: Briefcase, color: '#8B7355' },
  { id: 'social', label: 'Social', icon: Users, color: '#A67C52' },
  { id: 'banking', label: 'Banking', icon: CreditCard, color: '#C9A962' },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag, color: '#B8956A' },
  { id: 'other', label: 'Other', icon: Globe, color: '#6B8A7A' },
];

const CATEGORY_META = {
  work: { icon: Briefcase, color: '#8B7355' },
  social: { icon: Users, color: '#A67C52' },
  banking: { icon: CreditCard, color: '#C9A962' },
  shopping: { icon: ShoppingBag, color: '#B8956A' },
  other: { icon: Globe, color: '#6B8A7A' },
};

const EMPTY_FORM = {
  site_name: '',
  username: '',
  password: '',
  url: '',
  category: 'other',
  notes: '',
};

function VaultContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openModal: registerModal, closeModal: unregisterModal } = useModal();
  const queryClient = useQueryClient();

  const [activeCategory, setActiveCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [currentPinHash, setCurrentPinHash] = useState(null);

  useEffect(() => {
    if (showModal) {
      registerModal();
      return () => unregisterModal();
    }
  }, [showModal, registerModal, unregisterModal]);

  useEffect(() => {
    if (showChangePinModal) {
      registerModal();
      return () => unregisterModal();
    }
  }, [showChangePinModal, registerModal, unregisterModal]);

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('users').select('vault_pin_hash').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => setCurrentPinHash(data?.vault_pin_hash || null));
  }, [user?.id]);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [decryptedPasswords, setDecryptedPasswords] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['password_vault', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('password_vault')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) return [];
      return data || [];
    },
    enabled: !!user?.id,
  });

  const filteredEntries = entries.filter((e) => {
    const matchesCategory = activeCategory === 'all' || e.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || e.site_name.toLowerCase().includes(q) || e.username.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const togglePasswordVisible = useCallback(async (id, encryptedPassword) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
    if (!decryptedPasswords[id]) {
      const plain = await decryptPassword(encryptedPassword, user.id);
      setDecryptedPasswords((prev) => ({ ...prev, [id]: plain }));
    }
  }, [decryptedPasswords, user?.id]);

  const handleCopy = useCallback(async (entry) => {
    let plain = decryptedPasswords[entry.id];
    if (!plain) {
      plain = await decryptPassword(entry.encrypted_password, user.id);
      setDecryptedPasswords((prev) => ({ ...prev, [entry.id]: plain }));
    }
    await navigator.clipboard.writeText(plain);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2000);
  }, [decryptedPasswords, user?.id]);

  const openAdd = () => {
    setEditingEntry(null);
    setFormData(EMPTY_FORM);
    setShowFormPassword(false);
    setShowDeleteConfirm(false);
    setShowModal(true);
  };

  const openEdit = async (entry) => {
    let plain = decryptedPasswords[entry.id];
    if (!plain) {
      plain = await decryptPassword(entry.encrypted_password, user.id);
      setDecryptedPasswords((prev) => ({ ...prev, [entry.id]: plain }));
    }
    setEditingEntry(entry);
    setFormData({
      site_name: entry.site_name,
      username: entry.username,
      password: plain,
      url: entry.url,
      category: entry.category,
      notes: entry.notes,
    });
    setShowFormPassword(false);
    setShowDeleteConfirm(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEntry(null);
    setFormData(EMPTY_FORM);
    setShowDeleteConfirm(false);
  };

  const handleSave = async () => {
    if (!formData.site_name.trim() || !formData.username.trim() || !formData.password.trim()) return;
    setLoading(true);
    try {
      const encrypted = await encryptPassword(formData.password, user.id);
      const payload = {
        site_name: formData.site_name.trim(),
        username: formData.username.trim(),
        encrypted_password: encrypted,
        url: formData.url.trim(),
        category: formData.category,
        notes: formData.notes.trim(),
        updated_at: new Date().toISOString(),
      };

      if (editingEntry) {
        await supabase
          .from('password_vault')
          .update(payload)
          .eq('id', editingEntry.id)
          .eq('user_id', user.id);
        setDecryptedPasswords((prev) => ({ ...prev, [editingEntry.id]: formData.password }));
      } else {
        await supabase.from('password_vault').insert({ ...payload, user_id: user.id });
      }

      queryClient.invalidateQueries({ queryKey: ['password_vault', user?.id] });
      closeModal();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingEntry) return;
    setLoading(true);
    try {
      await supabase
        .from('password_vault')
        .delete()
        .eq('id', editingEntry.id)
        .eq('user_id', user.id);
      setDecryptedPasswords((prev) => {
        const next = { ...prev };
        delete next[editingEntry.id];
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ['password_vault', user?.id] });
      closeModal();
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { score, label: 'Weak', color: '#EF4444' };
    if (score <= 2) return { score, label: 'Fair', color: '#F59E0B' };
    if (score <= 3) return { score, label: 'Good', color: '#10B981' };
    return { score, label: 'Strong', color: '#C9A962' };
  };

  const strength = getPasswordStrength(formData.password);
  const isFormValid = formData.site_name.trim() && formData.username.trim() && formData.password.trim();

  return (
    <div className="min-h-full pb-32">
      <div className="relative border-b-2 border-[rgba(201,169,98,0.25)] page-safe-x py-6 flex items-center">
        <button onClick={() => navigate(-1)} className="absolute left-4 hover:opacity-70 transition-opacity">
          <ChevronLeft className="w-6 h-6 text-[#C9A962]" strokeWidth={1.5} />
        </button>
        <div className="w-full text-center">
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-5 h-5 text-[#C9A962]" strokeWidth={1.5} />
            <h1 className="text-3xl text-[#C9A962] font-light tracking-wide">Password Vault</h1>
          </div>
        </div>
        <button
          onClick={() => setShowChangePinModal(true)}
          className="absolute right-4 hover:opacity-70 transition-opacity"
          title="Change PIN"
        >
          <KeyRound className="w-5 h-5 text-[#C9A962]" strokeWidth={1.5} />
        </button>
      </div>

      <div className="page-safe-x pt-4 space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by site or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-10 bg-[#000000] border border-[rgba(201,169,98,0.2)] rounded-xl text-[#F5F1E8] placeholder-[#6B6B6B] focus:border-[#C9A962] focus:outline-none text-sm"
          />
          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" strokeWidth={1.5} />
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#C9A962] text-[#000000]'
                  : 'bg-[#000000] border border-[rgba(201,169,98,0.2)] text-[#B8B8B8] hover:border-[#C9A962] hover:text-[#C9A962]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-[#000000] rounded-2xl animate-pulse border border-[rgba(201,169,98,0.1)]" />
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-[rgba(201,169,98,0.08)] border border-[rgba(201,169,98,0.15)] flex items-center justify-center mb-4">
              <Lock className="w-9 h-9 text-[#C9A962]/40" strokeWidth={1.5} />
            </div>
            <p className="text-[#B8B8B8] text-sm mb-1">
              {searchQuery || activeCategory !== 'all' ? 'No passwords found' : 'Your vault is empty'}
            </p>
            <p className="text-[#6B6B6B] text-xs">
              {searchQuery || activeCategory !== 'all'
                ? 'Try adjusting your filters'
                : 'Tap + to securely store your first password'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-[#6B6B6B] px-1">
              {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
            </p>
            <AnimatePresence>
              {filteredEntries.map((entry) => {
                const meta = CATEGORY_META[entry.category] || CATEGORY_META.other;
                const CategoryIcon = meta.icon;
                const isVisible = visiblePasswords[entry.id];
                const isCopied = copiedId === entry.id;
                const displayPassword = isVisible && decryptedPasswords[entry.id]
                  ? decryptedPasswords[entry.id]
                  : '••••••••••';

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="bg-gradient-to-br from-[rgba(0,0,0,0.9)] to-[rgba(0,0,0,0.7)] rounded-2xl border border-[rgba(201,169,98,0.2)] p-4 hover:border-[rgba(201,169,98,0.4)] transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${meta.color}18` }}
                      >
                        <CategoryIcon className="w-5 h-5" style={{ color: meta.color }} strokeWidth={1.5} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[#F5F1E8] text-sm font-medium truncate">{entry.site_name}</p>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0"
                            style={{ backgroundColor: `${meta.color}18`, color: meta.color }}
                          >
                            {entry.category}
                          </span>
                        </div>
                        <p className="text-[#B8B8B8] text-xs mt-0.5 truncate">{entry.username}</p>
                        <p className="text-[#6B6B6B] text-xs mt-1 font-mono tracking-widest">{displayPassword}</p>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => togglePasswordVisible(entry.id, entry.encrypted_password)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#B8B8B8] hover:text-[#C9A962] hover:bg-[rgba(201,169,98,0.1)] transition-all"
                        >
                          {isVisible
                            ? <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                            : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                        </button>
                        <button
                          onClick={() => handleCopy(entry)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#B8B8B8] hover:text-[#C9A962] hover:bg-[rgba(201,169,98,0.1)] transition-all"
                        >
                          {isCopied
                            ? <Check className="w-4 h-4 text-emerald-400" strokeWidth={2} />
                            : <Copy className="w-4 h-4" strokeWidth={1.5} />}
                        </button>
                        <button
                          onClick={() => openEdit(entry)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#B8B8B8] hover:text-[#C9A962] hover:bg-[rgba(201,169,98,0.1)] transition-all"
                        >
                          <Pencil className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>

                    {entry.url && (
                      <div className="mt-2 ml-13 pl-[52px]">
                        <p className="text-xs text-[#6B6B6B] truncate">{entry.url}</p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <button
        onClick={openAdd}
        className="fixed right-6 w-14 h-14 rounded-full bg-[#C9A962] shadow-[0_0_24px_rgba(201,169,98,0.4)] flex items-center justify-center hover:bg-[#D4B574] active:scale-95 transition-all z-[55]"
        style={{ bottom: 'calc(7.5rem + env(safe-area-inset-bottom, 0px))' }}
        aria-label="Add password"
      >
        <Plus className="w-7 h-7 text-[#000000]" strokeWidth={2} />
      </button>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={closeModal}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#000000] rounded-t-3xl border-t-2 border-[rgba(201,169,98,0.3)] overflow-y-auto scrollbar-hide"
              style={{ maxHeight: '92dvh', paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-[#000000] pt-4 pb-2 px-6 z-10 border-b border-[rgba(201,169,98,0.1)]">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl text-[#C9A962] font-light">
                    {editingEntry ? 'Edit Entry' : 'New Entry'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#000000] transition-colors"
                  >
                    <X className="w-5 h-5 text-[#C9A962]" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="text-xs text-[#B8B8B8] uppercase tracking-wider mb-2 block">Site Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Google, Netflix"
                    value={formData.site_name}
                    onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#000000] border border-[rgba(201,169,98,0.3)] rounded-xl text-[#F5F1E8] placeholder-[#6B6B6B] focus:border-[#C9A962] focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#B8B8B8] uppercase tracking-wider mb-2 block">Username / Email *</label>
                  <input
                    type="text"
                    placeholder="e.g. user@example.com"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    autoComplete="off"
                    className="w-full px-4 py-3 bg-[#000000] border border-[rgba(201,169,98,0.3)] rounded-xl text-[#F5F1E8] placeholder-[#6B6B6B] focus:border-[#C9A962] focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#B8B8B8] uppercase tracking-wider mb-2 block">Password *</label>
                  <div className="relative">
                    <input
                      type={showFormPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      autoComplete="new-password"
                      className="w-full px-4 py-3 pr-12 bg-[#000000] border border-[rgba(201,169,98,0.3)] rounded-xl text-[#F5F1E8] placeholder-[#6B6B6B] focus:border-[#C9A962] focus:outline-none text-sm font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowFormPassword(!showFormPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#C9A962] transition-colors"
                    >
                      {showFormPassword
                        ? <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                        : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                    </button>
                  </div>

                  {formData.password && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="h-1 flex-1 rounded-full transition-all duration-300"
                            style={{
                              backgroundColor: i <= strength.score - 1
                                ? strength.color
                                : 'rgba(201,169,98,0.1)',
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-xs" style={{ color: strength.color }}>{strength.label}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs text-[#B8B8B8] uppercase tracking-wider mb-2 block">URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-4 py-3 bg-[#000000] border border-[rgba(201,169,98,0.3)] rounded-xl text-[#F5F1E8] placeholder-[#6B6B6B] focus:border-[#C9A962] focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#B8B8B8] uppercase tracking-wider mb-2 block">Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
                      const CatIcon = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: cat.id })}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs transition-all ${
                            formData.category === cat.id
                              ? 'border-[#C9A962] bg-[rgba(201,169,98,0.12)] text-[#C9A962]'
                              : 'border-[rgba(201,169,98,0.2)] bg-[#000000] text-[#B8B8B8] hover:border-[rgba(201,169,98,0.4)]'
                          }`}
                        >
                          <CatIcon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} style={{ color: formData.category === cat.id ? '#C9A962' : cat.color }} />
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#B8B8B8] uppercase tracking-wider mb-2 block">Notes</label>
                  <textarea
                    placeholder="Optional notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#000000] border border-[rgba(201,169,98,0.3)] rounded-xl text-[#F5F1E8] placeholder-[#6B6B6B] focus:border-[#C9A962] focus:outline-none text-sm resize-none"
                  />
                </div>

                {editingEntry && !showDeleteConfirm && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full py-2.5 border border-red-500/30 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    Delete Entry
                  </button>
                )}

                {showDeleteConfirm && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl space-y-3">
                    <p className="text-sm text-red-400 text-center">Delete this entry permanently?</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-2.5 bg-[#000000] border border-[rgba(201,169,98,0.2)] rounded-xl text-sm text-[#B8B8B8] hover:bg-[rgba(201,169,98,0.1)] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="flex-1 py-2.5 bg-red-500/20 border border-red-500/40 rounded-xl text-sm text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pb-10">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-3 bg-[#000000] border border-[rgba(201,169,98,0.3)] rounded-full text-sm text-[#B8B8B8] hover:bg-[rgba(201,169,98,0.1)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!isFormValid || loading}
                    className="flex-1 py-3 bg-[#C9A962] rounded-full text-sm text-[#000000] font-medium hover:bg-[#D4B574] transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingEntry ? 'Update' : 'Save'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Change PIN modal */}
      <AnimatePresence>
        {showChangePinModal && currentPinHash && (
          <ChangePinModal
            pinHash={currentPinHash}
            onClose={() => setShowChangePinModal(false)}
            onChanged={(newHash) => {
              setCurrentPinHash(newHash);
              setShowChangePinModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PasswordVault() {
  const { user } = useAuth();
  const [pinStatus, setPinStatus] = useState('loading');
  const [pinHash, setPinHash] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data } = await supabase
        .from('users')
        .select('vault_pin_hash')
        .eq('user_id', user.id)
        .maybeSingle();
      const hash = data?.vault_pin_hash || null;
      setPinHash(hash);
      if (!hash) {
        setPinStatus('setup');
      } else {
        const expiry = parseInt(localStorage.getItem('vault_unlock_expiry') || '0');
        if (Date.now() < expiry) {
          setPinStatus('unlocked');
        } else {
          localStorage.removeItem('vault_unlock_expiry');
          setPinStatus('locked');
        }
      }
    })();
  }, [user?.id]);

  if (pinStatus === 'loading') {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[rgba(201,169,98,0.3)] border-t-[#C9A962] rounded-full animate-spin" />
      </div>
    );
  }

  if (pinStatus === 'setup') {
    return (
      <PinSetup
        onComplete={async () => {
          const { data } = await supabase
            .from('users')
            .select('vault_pin_hash')
            .eq('user_id', user.id)
            .maybeSingle();
          setPinHash(data?.vault_pin_hash || null);
          setPinStatus('unlocked');
        }}
      />
    );
  }

  if (pinStatus === 'locked') {
    return (
      <PinVerify
        pinHash={pinHash}
        onUnlock={() => setPinStatus('unlocked')}
        onReset={() => { setPinHash(null); setPinStatus('setup'); }}
      />
    );
  }

  return <VaultContent />;
}
