import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, Check, Plus, Trash2, X, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModal } from '../../../context/ModalContext';
import IconPicker, { DEFAULT_ICON } from '../../../components/ui/IconPicker';
import { getIconifyIconUrl } from '../../../services/iconifyService';

function QuickAddModal({ sectionId, onClose, onAdd }) {
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setSaving(true);
    await onAdd({ title: trimmed, color_tag: '#6B7280', section: sectionId });
    setSaving(false);
    setTitle('');
    // Stay open with the caret in place so a list can be typed in one go.
    requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 35, stiffness: 300 }}
        className="w-full bg-[color:var(--app-bg)] rounded-t-[2rem] border-t border-[rgba(201,169,98,0.3)] shadow-[0_-8px_40px_rgba(201,169,98,0.15)] p-6 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg text-[color:var(--app-gold-light)] font-light tracking-wide">Add Item</h3>
          <button
            onClick={onClose}
            className="text-[color:var(--app-text-3)] hover:text-[color:var(--app-gold)] transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs text-[color:var(--app-text-3)] font-light tracking-wider uppercase">Item Name</label>
            <input
              ref={(el) => { inputRef.current = el; if (el && !el.dataset.autofocused) { el.dataset.autofocused = '1'; el.focus({ preventScroll: true }); } }}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              enterKeyHint="done"
              placeholder="e.g. Clean countertops"
              className="w-full bg-[color:var(--app-wash)] border border-[rgba(201,169,98,0.25)] rounded-xl px-4 py-3 text-sm text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:outline-none focus:border-[rgba(201,169,98,0.5)] transition-all"
            />
            <p className="text-[11px] text-[color:var(--app-text-3)]">Press enter to add and keep going.</p>
          </div>

          <button
            type="submit"
            disabled={!title.trim() || saving}
            className="w-full py-3.5 rounded-xl bg-gradient-to-br from-[#D4B978] to-[#C9A962] text-[#0A0A0A] font-medium text-sm tracking-wide shadow-[0_4px_12px_rgba(201,169,98,0.3)] hover:shadow-[0_4px_16px_rgba(201,169,98,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Adding…' : 'Add Item'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function ViewCategoryModal({
  visible,
  onClose,
  section,
  tasks,
  onToggleComplete,
  onDelete,
  onCreateTask,
  onRenameTask,
  onRenameCategory,
  onChangeCategoryIcon,
  onDeleteCategory,
}) {
  const { openModal, closeModal } = useModal();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameText, setNameText] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editText, setEditText] = useState('');

  const isCustom = !!section?.isCustom;

  useEffect(() => {
    if (visible) {
      openModal();
      return () => closeModal();
    }
  }, [visible, openModal, closeModal]);

  useEffect(() => {
    setNameText(section?.title || '');
    setRenaming(false);
    setConfirmDelete(false);
    setEditingTaskId(null);
  }, [section?.id, section?.title]);

  const focusCaretEnd = useCallback((el) => {
    if (!el) return;
    el.focus({ preventScroll: true });
    const len = el.value.length;
    try { el.setSelectionRange(len, len); } catch { /* not supported */ }
  }, []);

  if (!section) return null;

  const completed = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const progressPercent = total > 0 ? (completed / total) * 100 : 0;

  const saveName = () => {
    const t = nameText.trim();
    if (!t) return;
    onRenameCategory?.(section.id, t);
    setRenaming(false);
  };

  const saveTaskTitle = (task) => {
    const t = editText.trim();
    if (!t) return;
    onRenameTask?.(task, t);
    setEditingTaskId(null);
  };

  // Two separate AnimatePresence blocks, each with a single keyed child:
  // nesting them under one parent gave both children the same implicit key,
  // which React warns about and which lets framer-motion duplicate or drop one.
  return (
    <>
      <AnimatePresence>
      {visible && (
        <motion.div
          key="view-category-sheet"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-end"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 35, stiffness: 300 }}
            className="w-full bg-[color:var(--app-bg)] rounded-t-[2rem] border-t border-[rgba(201,169,98,0.3)] max-h-[88dvh] flex flex-col shadow-[0_-8px_40px_rgba(201,169,98,0.12)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-[rgba(201,169,98,0.15)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Category image, or an editable icon for the user's own bars */}
                  {isCustom ? (
                    <IconPicker
                      value={section.icon || DEFAULT_ICON}
                      onChange={(icon) => onChangeCategoryIcon?.(section.id, icon)}
                    />
                  ) : (
                    <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-[rgba(201,169,98,0.1)]">
                      {section.image_url ? (
                        <img src={section.image_url} alt={section.title} className="w-full h-full object-cover" />
                      ) : section.icon ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <img src={getIconifyIconUrl(section.icon, section.color_tag)} alt="" className="w-7 h-7" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-[rgba(201,169,98,0.3)]" />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {renaming ? (
                      <input
                        value={nameText}
                        onChange={(e) => setNameText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') { e.preventDefault(); saveName(); }
                          if (e.key === 'Escape') { setRenaming(false); setNameText(section.title); }
                        }}
                        ref={focusCaretEnd}
                        enterKeyHint="done"
                        className="w-full text-xl text-[color:var(--app-gold)] font-light bg-transparent border-b border-[rgba(201,169,98,0.4)] outline-none"
                      />
                    ) : (
                      <h2
                        className="text-xl text-[color:var(--app-gold)] font-light tracking-wide leading-snug truncate"
                        style={{ fontFamily: 'Cormorant Garamond, serif' }}
                      >
                        {section.title}
                      </h2>
                    )}
                    <p className="text-sm text-[color:var(--app-wash-3)] mt-0.5">
                      {completed} of {total} completed
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  {isCustom && (renaming ? (
                    <>
                      <button onClick={saveName} className="p-1 text-[color:var(--app-gold)]" aria-label="Save name">
                        <Check className="w-5 h-5" strokeWidth={2} />
                      </button>
                      <button onClick={() => { setRenaming(false); setNameText(section.title); }} className="p-1 text-red-400" aria-label="Cancel rename">
                        <X className="w-5 h-5" strokeWidth={2} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setRenaming(true)} className="p-1.5 text-[color:var(--app-gold)] opacity-70 hover:opacity-100" aria-label="Rename category">
                        <Pencil className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                      <button onClick={() => setConfirmDelete(true)} className="p-1.5 text-red-400 opacity-70 hover:opacity-100" aria-label="Delete category">
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </>
                  ))}
                  <button
                    onClick={onClose}
                    className="text-[color:var(--app-gold)] hover:text-[color:var(--app-gold-light)] transition-colors"
                    aria-label="Close"
                  >
                    <ChevronDown className="w-7 h-7" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {total > 0 && (
                <div className="mt-4 w-full h-1 bg-[rgba(201,169,98,0.12)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-[#D4B978] to-[#C9A962]"
                  />
                </div>
              )}
            </div>

            {confirmDelete && (
              <div className="mx-4 mt-4 p-4 rounded-xl border border-red-300/40 bg-red-500/5">
                <p className="text-sm font-light text-[color:var(--app-text)] mb-3">
                  Delete &ldquo;{section.title}&rdquo; and its {total} item{total === 1 ? '' : 's'}? This can&rsquo;t be undone.
                </p>
                <div className="flex gap-2">
                  <button onClick={() => onDeleteCategory?.(section.id)} className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-light">Delete</button>
                  <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2 rounded-lg border border-[rgba(201,169,98,0.3)] text-[color:var(--app-text-2)] text-sm font-light">Cancel</button>
                </div>
              </div>
            )}

            {/* Task List */}
            <div
              className="overflow-y-auto flex-1 min-h-0 px-4 py-3 space-y-2 scrollbar-hide"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {tasks.map((task, idx) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx, 12) * 0.02 }}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
                  style={{
                    backgroundColor: 'var(--app-bg)',
                    border: '1px solid rgba(201,169,98,0.15)',
                    opacity: task.completed && editingTaskId !== task.id ? 0.55 : 1,
                  }}
                >
                  {editingTaskId === task.id ? (
                    <>
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') { e.preventDefault(); saveTaskTitle(task); }
                          if (e.key === 'Escape') setEditingTaskId(null);
                        }}
                        ref={focusCaretEnd}
                        enterKeyHint="done"
                        className="flex-1 text-sm bg-transparent border-none outline-none text-[color:var(--app-text)]"
                      />
                      <button onClick={() => saveTaskTitle(task)} className="p-1 text-[color:var(--app-gold)]" aria-label="Save item">
                        <Check className="w-4 h-4" strokeWidth={2} />
                      </button>
                      <button onClick={() => setEditingTaskId(null)} className="p-1 text-red-400" aria-label="Cancel edit">
                        <X className="w-4 h-4" strokeWidth={2} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleComplete(task); }}
                        className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                        style={{
                          borderColor: task.completed ? '#C9A962' : 'rgba(201,169,98,0.35)',
                          backgroundColor: task.completed ? '#C9A962' : 'transparent',
                        }}
                      >
                        {task.completed && <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />}
                      </button>

                      <span
                        className="flex-1 text-sm font-light"
                        style={{
                          color: task.completed ? 'var(--app-text-3)' : 'var(--app-text)',
                          textDecoration: task.completed ? 'line-through' : 'none',
                        }}
                      >
                        {task.title}
                      </span>

                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingTaskId(task.id); setEditText(task.title); }}
                        className="flex-shrink-0 text-[color:var(--app-gold)] opacity-60 hover:opacity-100 transition-colors"
                        aria-label="Edit item"
                      >
                        <Pencil className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(task); }}
                        className="flex-shrink-0 text-[color:var(--app-wash-3)] hover:text-red-400 transition-colors"
                        aria-label="Delete item"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </>
                  )}
                </motion.div>
              ))}

              {total === 0 && (
                <div className="text-center py-12">
                  <p className="text-sm text-[color:var(--app-text-2)] font-light">No items yet</p>
                  <p className="text-xs text-[color:var(--app-text-3)] mt-1">Tap the + button to add your first item</p>
                </div>
              )}

              <div className="h-2" />
            </div>

            {/* Add Item Button */}
            <div className="flex-shrink-0 px-4 pb-6 pt-2 border-t border-[rgba(201,169,98,0.12)]">
              <motion.button
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                onClick={() => setShowQuickAdd(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl border border-[rgba(201,169,98,0.25)] hover:border-[rgba(201,169,98,0.45)] transition-all"
                style={{ backgroundColor: 'rgba(201,169,98,0.06)' }}
              >
                <Plus className="w-5 h-5 text-[color:var(--app-gold)]" strokeWidth={2} />
                <span className="text-sm font-light text-[color:var(--app-gold)]">Add Item</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
        {showQuickAdd && (
          <QuickAddModal
            key="quick-add-sheet"
            sectionId={section.id}
            onClose={() => setShowQuickAdd(false)}
            onAdd={onCreateTask}
          />
        )}
      </AnimatePresence>
    </>
  );
}
