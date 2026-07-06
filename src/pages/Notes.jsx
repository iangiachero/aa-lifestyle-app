import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, ArrowLeft, Trash2, Pin, CreditCard as Edit3, ChevronRight, Shield, X, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { NotesSkeleton } from '../components/ui/PageSkeleton';

export default function Notes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openModal, closeModal } = useModal();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  const isModalOpen = showDeleteConfirm || showPinModal;
  useEffect(() => {
    if (isModalOpen) {
      openModal();
      return () => closeModal();
    }
  }, [isModalOpen, openModal, closeModal]);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const { data: notes = [], isLoading: notesLoading } = useQuery({
    queryKey: ['notes', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      if (error) return [];
      return data || [];
    },
    enabled: !!user?.id,
  });

  const invalidateNotes = () => queryClient.invalidateQueries({ queryKey: ['notes', user?.id] });

  const handleCreateNote = async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from('notes')
      .insert({ user_id: user.id, title: 'New Note', content: '', pinned: false })
      .select()
      .single();
    if (!error && data) {
      invalidateNotes();
      setSelectedNote(data);
      setEditingNote({ title: data.title, content: data.content || '' });
    }
  };

  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setEditingNote({ title: note.title, content: note.content || '' });
  };

  const handleAutoSave = (field, value) => {
    if (!selectedNote) return;
    const updatedData = { ...editingNote, [field]: value };
    setEditingNote(updatedData);
    clearTimeout(window.noteSaveTimeout);
    window.noteSaveTimeout = setTimeout(async () => {
      await supabase
        .from('notes')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', selectedNote.id)
        .eq('user_id', user.id);
      invalidateNotes();
    }, 500);
  };

  const togglePin = async () => {
    if (!selectedNote) return;
    const newPinned = !selectedNote.pinned;
    setSelectedNote({ ...selectedNote, pinned: newPinned });
    await supabase
      .from('notes')
      .update({ pinned: newPinned })
      .eq('id', selectedNote.id)
      .eq('user_id', user.id);
    invalidateNotes();
  };

  const handleDeleteNote = async () => {
    if (!selectedNote) return;
    await supabase
      .from('notes')
      .delete()
      .eq('id', selectedNote.id)
      .eq('user_id', user.id);
    invalidateNotes();
    setSelectedNote(null);
    setEditingNote(null);
    setShowDeleteConfirm(false);
  };

  const handleCreatePin = () => {
    if (pin.length >= 4 && pin.length <= 6 && pin === confirmPin) {
      localStorage.setItem('vaultPin', pin);
      setShowPinModal(false);
      setPin('');
      setConfirmPin('');
      navigate('/vault');
    }
  };

  const handlePasswordsVault = () => {
    const storedPin = localStorage.getItem('vaultPin');
    if (storedPin) {
      navigate('/vault');
    } else {
      setShowPinModal(true);
    }
  };

  const filteredNotes = notes
    .filter(note =>
      note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updated_at) - new Date(a.updated_at);
    });

  if (selectedNote && editingNote) {
    return (
      <div className="bg-[color:var(--app-bg)]">
        <div className="px-6 pt-6 pb-4 border-b-2 border-[rgba(201,169,98,0.25)]">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => { setSelectedNote(null); setEditingNote(null); }}
              className="w-10 h-10 rounded-full bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] flex items-center justify-center hover:bg-[rgba(201,169,98,0.1)] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#C9A962]" strokeWidth={1.5} />
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={togglePin}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${
                  selectedNote.pinned ? 'bg-[#C9A962] border-[#C9A962]' : 'bg-[color:var(--app-bg)] border-[rgba(201,169,98,0.3)]'
                } hover:scale-105`}
              >
                <Pin className={`w-5 h-5 ${selectedNote.pinned ? 'text-[#000000]' : 'text-[#C9A962]'}`} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-10 h-10 rounded-full bg-[color:var(--app-bg)] border border-red-400/30 hover:border-red-400 hover:scale-105 flex items-center justify-center transition-all"
              >
                <Trash2 className="w-5 h-5 text-red-400" strokeWidth={1.5} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl text-[#C9A962] font-light">Edit Note</h2>
            {selectedNote.pinned && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(201,169,98,0.2)] text-[#C9A962]">Pinned</span>
            )}
          </div>
        </div>

        <div className="px-6 pt-6 pb-24 space-y-4">
          <input
            value={editingNote.title}
            onChange={(e) => handleAutoSave('title', e.target.value)}
            placeholder="Untitled Note"
            className="w-full text-2xl font-light bg-transparent border-none text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:outline-none"
          />
          <textarea
            value={editingNote.content}
            onChange={(e) => handleAutoSave('content', e.target.value)}
            placeholder="Start writing..."
            className="w-full min-h-[500px] bg-transparent border-none text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] resize-none focus:outline-none leading-relaxed"
          />
          <div className="text-xs text-[color:var(--app-text-3)]">
            Last edited {new Date(selectedNote.updated_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6" onClick={() => setShowDeleteConfirm(false)}>
            <div className="w-full max-w-md bg-[color:var(--app-bg)] rounded-2xl p-6 border-2 border-[rgba(201,169,98,0.3)]" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl text-[#C9A962] font-light mb-2">Delete Note?</h3>
              <p className="text-sm text-[color:var(--app-text-2)] mb-6">Are you sure you want to delete "{selectedNote.title || 'Untitled Note'}"? This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-full text-sm text-[color:var(--app-text-2)] hover:bg-[rgba(201,169,98,0.1)] transition-colors">Cancel</button>
                <button onClick={handleDeleteNote} className="flex-1 py-3 bg-red-500 rounded-full text-sm text-white hover:bg-red-600 transition-colors">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[color:var(--app-bg)] pb-4">
      <div className="relative border-b-2 border-[rgba(201,169,98,0.25)] page-safe-x py-6">
        <button onClick={() => navigate(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity">
          <ChevronLeft className="w-6 h-6 text-[#C9A962]" strokeWidth={1.5} />
        </button>
        <div className="w-full text-center">
          <h1 className="text-3xl text-[#C9A962] font-light tracking-wide">Notes</h1>
        </div>
      </div>

      {notesLoading ? <NotesSkeleton /> : <div className="page-safe-x pt-4 space-y-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={handlePasswordsVault} className="w-full bg-[color:var(--app-bg)] rounded-2xl p-4 border border-[rgba(201,169,98,0.3)] hover:border-[#C9A962] transition-all flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#C9A962] flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-[#000000]" strokeWidth={1.5} />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-base text-[color:var(--app-text)] font-light">Passwords Vault</h3>
              <p className="text-xs text-[color:var(--app-text-2)]">Secure password storage</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#C9A962]" strokeWidth={1.5} />
          </button>
        </motion.div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A962]" strokeWidth={1.5} />
          <input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-xl text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:border-[#C9A962] focus:outline-none"
          />
        </div>

        <div className="space-y-3">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-16">
              <Edit3 className="w-12 h-12 mx-auto mb-3 text-[#C9A962]/20" strokeWidth={1.5} />
              <div className="text-sm text-[color:var(--app-text-2)] mb-5">
                {searchQuery ? 'No notes found' : 'No notes yet'}
              </div>
            </div>
          ) : (
            filteredNotes.map((note, idx) => (
              <motion.div key={note.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                <button
                  onClick={() => handleSelectNote(note)}
                  className="w-full bg-[color:var(--app-bg)] rounded-2xl p-4 border border-[rgba(201,169,98,0.3)] hover:border-[#C9A962] hover:shadow-lg transition-all text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-base text-[color:var(--app-text)] font-light line-clamp-1">{note.title || 'Untitled Note'}</h3>
                        {note.pinned && <Pin className="w-4 h-4 flex-shrink-0 ml-2 text-[#C9A962]" strokeWidth={1.5} />}
                      </div>
                      {note.content && (
                        <p className="text-sm text-[color:var(--app-text-2)] line-clamp-2 mb-2 leading-relaxed">{note.content}</p>
                      )}
                      <div className="text-xs text-[color:var(--app-text-3)]">
                        {new Date(note.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 flex-shrink-0 mt-1 text-[#C9A962]" strokeWidth={1.5} />
                  </div>
                </button>
              </motion.div>
            ))
          )}
        </div>
      </div>}

      <button onClick={handleCreateNote} className="fixed right-6 w-14 h-14 rounded-full bg-[#C9A962] flex items-center justify-center shadow-xl hover:bg-[#D4B574] hover:scale-110 transition-all z-[55]" style={{ bottom: 'calc(7.5rem + env(safe-area-inset-bottom, 0px))' }}>
        <Plus className="w-7 h-7 text-[#000000]" strokeWidth={2} />
      </button>

      {showPinModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6" onClick={() => setShowPinModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-[color:var(--app-bg)] rounded-2xl p-6 border-2 border-[rgba(201,169,98,0.3)]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowPinModal(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[color:var(--app-bg)] transition-colors">
              <X className="w-5 h-5 text-[#C9A962]" />
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[color:var(--app-bg)] flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-[#C9A962]" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl text-[#C9A962] font-light mb-2">Create PIN</h3>
              <p className="text-sm text-[color:var(--app-text-2)]">Set a 4-6 digit PIN to secure your vault</p>
            </div>
            <div className="space-y-4 pb-32">
              <div>
                <label className="text-xs text-[color:var(--app-text-2)] uppercase mb-2 block">Create PIN (4-6 digits)</label>
                <input type="password" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="••••\" className="w-full px-4 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-xl text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:border-[#C9A962] focus:outline-none text-center text-2xl tracking-widest\" maxLength={6} />
              </div>
              <div>
                <label className="text-xs text-[color:var(--app-text-2)] uppercase mb-2 block">Confirm PIN</label>
                <input type="password" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="••••\" className="w-full px-4 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-xl text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:border-[#C9A962] focus:outline-none text-center text-2xl tracking-widest\" maxLength={6} />
              </div>
              <button onClick={handleCreatePin} disabled={pin.length < 4 || pin !== confirmPin} className="w-full py-3 bg-[#C9A962] rounded-full text-sm text-[#000000] font-medium hover:bg-[#D4B574] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Create PIN & Unlock
              </button>
              <div className="bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.2)] rounded-xl p-3">
                <div className="flex gap-2">
                  <Shield className="w-4 h-4 text-[#C9A962] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <p className="text-xs text-[color:var(--app-text-2)] leading-relaxed">
                    <span className="text-[#C9A962] font-medium">Security Note:</span> Your PIN is required to access your passwords. If you forget it, you'll need to reset the vault.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
 