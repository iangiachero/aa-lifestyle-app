import React, { useState, useEffect } from 'react';
import { ChevronDown, Circle, Check, Plus, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ColorPicker from '../../../components/ui/ColorPicker';
import { useModal } from '../../../context/ModalContext';

function QuickAddModal({ sectionId, onClose, onAdd }) {
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setSaving(true);
    await onAdd({ title: trimmed, color_tag: '#6B7280', section: sectionId });
    setSaving(false);
    onClose();
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
          <h3 className="text-lg text-[#e2ba8b] font-light tracking-wide">Add Task</h3>
          <button
            onClick={onClose}
            className="text-[color:var(--app-text-3)] hover:text-[#C9A962] transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs text-[color:var(--app-text-3)] font-light tracking-wider uppercase">Task Name</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Clean countertops"
              className="w-full bg-[color:var(--app-wash)] border border-[rgba(201,169,98,0.25)] rounded-xl px-4 py-3 text-sm text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:outline-none focus:border-[rgba(201,169,98,0.5)] focus:bg-[color:var(--app-wash)] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!title.trim() || saving}
            className="w-full py-3.5 rounded-xl bg-gradient-to-br from-[#D4B978] to-[#C9A962] text-[#0A0A0A] font-medium text-sm tracking-wide shadow-[0_4px_12px_rgba(201,169,98,0.3)] hover:shadow-[0_4px_16px_rgba(201,169,98,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Adding…' : 'Add Task'}
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
}) {
  const { openModal, closeModal } = useModal();
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  useEffect(() => {
    if (visible) {
      openModal();
      return () => closeModal();
    }
  }, [visible, openModal, closeModal]);

  if (!section) return null;

  const completed = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const progressPercent = total > 0 ? (completed / total) * 100 : 0;

  const handleToggle = (e, task) => {
    e.stopPropagation();
    onToggleComplete(task);
  };

  const handleDelete = (e, task) => {
    e.stopPropagation();
    onDelete(task);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
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
            className="w-full bg-[color:var(--app-bg)] rounded-t-[2rem] border-t border-[rgba(201,169,98,0.3)] max-h-[88vh] flex flex-col shadow-[0_-8px_40px_rgba(201,169,98,0.12)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-[rgba(201,169,98,0.15)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Category image */}
                  <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-[rgba(201,169,98,0.1)]">
                    {section.image_url ? (
                      <img
                        src={section.image_url}
                        alt={section.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-[rgba(201,169,98,0.3)]" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2
                      className="text-xl text-[#C9A962] font-light tracking-wide leading-snug truncate"
                      style={{ fontFamily: 'Cormorant Garamond, serif' }}
                    >
                      {section.title}
                    </h2>
                    <p className="text-sm text-[color:var(--app-wash-3)] mt-0.5">
                      {completed} of {total} completed
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="text-[#C9A962] hover:text-[#e2ba8b] transition-colors flex-shrink-0 ml-2"
                >
                  <ChevronDown className="w-7 h-7" strokeWidth={1.5} />
                </button>
              </div>

              {/* Progress Bar */}
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
                  transition={{ delay: idx * 0.02 }}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
                  style={{
                    backgroundColor: 'var(--app-bg)',
                    border: '1px solid rgba(201,169,98,0.15)',
                    opacity: task.completed ? 0.55 : 1,
                  }}
                >
                  {/* Checkbox */}
                  <button
                    onClick={(e) => handleToggle(e, task)}
                    className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                    style={{
                      borderColor: task.completed ? '#C9A962' : 'rgba(201,169,98,0.35)',
                      backgroundColor: task.completed ? '#C9A962' : 'transparent',
                    }}
                  >
                    {task.completed && (
                      <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />
                    )}
                  </button>

                  {/* Title */}
                  <span
                    className="flex-1 text-sm font-light"
                    style={{
                      color: task.completed ? '#6B6B6B' : '#F5F1E8',
                      textDecoration: task.completed ? 'line-through' : 'none',
                    }}
                  >
                    {task.title}
                  </span>

                  {/* Delete - only for user-added tasks */}
                  {!task.is_curated && (
                    <button
                      onClick={(e) => handleDelete(e, task)}
                      className="flex-shrink-0 text-[color:var(--app-wash-3)] hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  )}
                </motion.div>
              ))}

              {total === 0 && (
                <div className="text-center py-12">
                  <p className="text-sm text-[color:var(--app-text-2)] font-light">No tasks yet</p>
                  <p className="text-xs text-[color:var(--app-text-3)] mt-1">Tap the + button to add your first task</p>
                </div>
              )}

              <div className="h-2" />
            </div>

            {/* Add Task Button */}
            <div className="flex-shrink-0 px-4 pb-6 pt-2 border-t border-[rgba(201,169,98,0.12)]">
              <motion.button
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                onClick={() => setShowQuickAdd(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl border border-[rgba(201,169,98,0.25)] hover:border-[rgba(201,169,98,0.45)] transition-all"
                style={{ backgroundColor: 'rgba(201,169,98,0.06)' }}
              >
                <Plus className="w-5 h-5 text-[#C9A962]" strokeWidth={2} />
                <span className="text-sm font-light text-[#C9A962]">Add Task</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <AnimatePresence>
        {showQuickAdd && (
          <QuickAddModal
            sectionId={section.id}
            onClose={() => setShowQuickAdd(false)}
            onAdd={onCreateTask}
          />
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}
