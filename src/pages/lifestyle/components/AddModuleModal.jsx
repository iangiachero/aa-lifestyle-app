import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, ImagePlus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { useModal } from '../../../context/ModalContext';

const MODAL_STYLE = {
  overlay: 'fixed inset-0 bg-black/60 z-50 flex items-end',
  sheet: 'w-full bg-[#000000] rounded-t-[2rem] border-t border-[rgba(201,169,98,0.25)] max-h-[90vh] flex flex-col',
  header: 'sticky top-0 bg-[#000000] px-6 pt-5 pb-4 flex items-center justify-between border-b border-[rgba(201,169,98,0.15)]',
  title: 'text-xl text-[#C9A962] font-light',
  input: 'w-full bg-[#000000] border border-[rgba(201,169,98,0.3)] rounded-xl px-4 py-3 text-[#F5F1E8] placeholder-[#6B6B6B] focus:border-[#C9A962] focus:outline-none text-sm',
  label: 'text-xs text-[#B8B8B8] font-light uppercase tracking-wider mb-2 block',
};

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #000000 0%, #000000 100%)',
  'linear-gradient(135deg, #000000 0%, #000000 100%)',
  'linear-gradient(135deg, #202520 0%, #101a10 100%)',
  'linear-gradient(135deg, #000000 0%, #000000 100%)',
  'linear-gradient(135deg, #000000 0%, #000000 100%)',
  'linear-gradient(135deg, #202028 0%, #101018 100%)',
];

export default function AddModuleModal({ visible, onClose, onAdd }) {
  const { user } = useAuth();
  const { openModal, closeModal } = useModal();

  useEffect(() => {
    if (visible) {
      openModal();
      return () => closeModal();
    }
  }, [visible, openModal, closeModal]);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const resetForm = () => {
    setName('');
    setImageUrl('');
    setImagePreview(null);
    setUploading(false);
    setSaving(false);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    setError('');
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `custom/${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('lifestyle-images')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('lifestyle-images').getPublicUrl(path);
      setImageUrl(data.publicUrl);
    } catch {
      setError('Image upload failed. You can still save without an image.');
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('Please enter a module name.'); return; }
    setSaving(true);
    setError('');
    try {
      const { data, error: insertError } = await supabase
        .from('lifestyle_modules')
        .insert({
          user_id: user.id,
          name: name.trim(),
          image_url: imageUrl || null,
          gradient_index: Math.floor(Math.random() * CARD_GRADIENTS.length),
          sort_order: 9999,
          is_default: false,
        })
        .select()
        .single();
      if (insertError) throw insertError;
      onAdd({ ...data, routines: [] });
      handleClose();
    } catch {
      setError('Failed to save module. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={MODAL_STYLE.overlay}
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={MODAL_STYLE.sheet}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={MODAL_STYLE.header}>
              <h2 className={MODAL_STYLE.title}>New Module</h2>
              <button onClick={handleClose} className="text-[#C9A962] hover:text-[#e2ba8b] transition-colors">
                <ChevronDown className="w-7 h-7" strokeWidth={1.5} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5 scrollbar-hide" style={{ paddingBottom: '3rem' }}>
              <div>
                <label className={MODAL_STYLE.label}>Module Name</label>
                <input
                  type="text"
                  placeholder="e.g., Fragrance, Wellness..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={MODAL_STYLE.input}
                />
              </div>

              <div>
                <label className={MODAL_STYLE.label}>Module Image</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {imagePreview ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[rgba(201,169,98,0.3)]">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    {uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-[#C9A962] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    <button
                      onClick={() => { setImagePreview(null); setImageUrl(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="absolute top-2 right-2 bg-black/60 rounded-full p-1 text-white hover:bg-black/80 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-video rounded-xl border-2 border-dashed border-[rgba(201,169,98,0.3)] flex flex-col items-center justify-center gap-2 hover:border-[rgba(201,169,98,0.5)] hover:bg-[rgba(201,169,98,0.04)] transition-all"
                  >
                    <ImagePlus className="w-7 h-7 text-[#C9A962] opacity-60" strokeWidth={1.5} />
                    <span className="text-xs text-[#6B6B6B]">Tap to upload image</span>
                    <span className="text-[10px] text-[#4B4B4B]">Optional — a pattern will be used if none</span>
                  </button>
                )}
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <button
                onClick={handleSave}
                disabled={!name.trim() || saving || uploading}
                className="w-full bg-[#C9A962] hover:bg-[#D4B978] disabled:bg-[#3a3a3a] disabled:cursor-not-allowed disabled:text-[#6B6B6B] text-[#000000] font-medium py-4 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-[#000000] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" strokeWidth={2} />
                    Create Module
                  </>
                )}
              </button>

              <div className="h-10" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
