import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Target, CreditCard as Edit2, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { isToday, parseISO, format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import DatePicker from '../ui/DatePicker';
import CustomSelect from '../ui/CustomSelect';
import ColorPicker from '../ui/ColorPicker';
import ColorDot from '../ui/ColorDot';

export default function TodayTasks({ tasks }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [editingTask, setEditingTask] = useState(null);
  const [taskData, setTaskData] = useState({});
  const [loading, setLoading] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const sortedTasks = useMemo(() => {
    const relevantTasks = tasks?.filter(t => {
      if (t.completed) return true;
      if (!t.due_date) return true;
      try {
        return isToday(parseISO(t.due_date));
      } catch {
        return false;
      }
    }) || [];
    return [...relevantTasks].sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      if (a.due_date && !b.due_date) return -1;
      if (!a.due_date && b.due_date) return 1;
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
    });
  }, [tasks]);

  const toggleTask = async (task) => {
    const newCompleted = !task.completed;
    await supabase
      .from('tasks')
      .update({ completed: newCompleted })
      .eq('id', task.id)
      .eq('user_id', user.id);
    queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
  };

  const handleEditTask = (e, task) => {
    e.stopPropagation();
    setEditingTask(task);
    setTaskData({
      title: task.title,
      category: task.category || 'personal',
      priority: task.priority || 'medium',
      due_date: task.due_date || null,
      color_tag: task.color_tag || '#6B7280',
    });
  };

  const handleSaveTask = async () => {
    if (!taskData.title?.trim()) return;
    setLoading(true);
    try {
      await supabase
        .from('tasks')
        .update({
          title: taskData.title,
          category: taskData.category,
          priority: taskData.priority,
          due_date: taskData.due_date || null,
          color_tag: taskData.color_tag,
        })
        .eq('id', editingTask.id)
        .eq('user_id', user.id);
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      setEditingTask(null);
      setTaskData({});
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = (e, task) => {
    e.stopPropagation();
    setDeleteTarget(task);
  };

  const confirmDeleteTask = async () => {
    if (!deleteTarget) return;
    await supabase.from('tasks').delete().eq('id', deleteTarget.id).eq('user_id', user.id);
    queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    setDeleteTarget(null);
  };

  const priorityColors = {
    urgent: '#EF4444',
    high: '#F59E0B',
    medium: '#C9A962',
    low: '#9CA3AF',
  };

  if (sortedTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80px] py-3">
        <Target className="w-8 h-8 opacity-20 mb-2 text-[#C9A962]" strokeWidth={1.3} />
        <div className="text-xs text-[#B8B8B8] font-light">No priorities</div>
      </div>
    );
  }

  return (
    <>
      <div className="max-h-[350px] overflow-y-auto space-y-1.5 pr-0.5">
        {sortedTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-2 bg-[#0A0A0A] rounded-xl p-2 border border-[rgba(201,169,98,0.2)] hover:border-[rgba(201,169,98,0.4)] transition-colors"
          >
            <button
              onClick={(e) => { e.stopPropagation(); toggleTask(task); }}
              className="flex-shrink-0 transition-transform hover:scale-110 active:scale-95 p-0.5"
            >
              {task.completed ? (
                <CheckCircle2 className="w-4 h-4 text-[#C9A962]" strokeWidth={1.5} />
              ) : (
                <Circle className="w-4 h-4 text-[#C9A962]" strokeWidth={1.5} />
              )}
            </button>

            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <ColorDot color={task.color_tag || priorityColors[task.priority] || '#C9A962'} size="sm" />
              <span
                className={`text-sm leading-snug truncate ${task.completed ? 'line-through text-[#6B6B6B]' : 'text-[#F5F1E8]'}`}
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, letterSpacing: '0.01em' }}
              >
                {task.title}
              </span>
              {!task.due_date && !task.completed && (
                <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(201,169,98,0.12)', color: '#C9A962' }}>Ongoing</span>
              )}
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: priorityColors[task.priority] || '#C9A962' }}
              />
              <button
                onClick={(e) => handleEditTask(e, task)}
                className="p-1.5 rounded-lg transition-all text-[#6B6B6B] hover:text-[#C9A962] hover:bg-[rgba(201,169,98,0.12)]"
              >
                <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={(e) => handleDeleteTask(e, task)}
                className="p-1.5 rounded-lg transition-all text-[#6B6B6B] hover:text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {createPortal(
        <AnimatePresence>
          {deleteTarget && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-[100]"
                onClick={() => setDeleteTarget(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-x-4 z-[200]"
                style={{ top: '50%', transform: 'translateY(-50%)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="rounded-2xl p-6" style={{ background: '#000000', border: '1px solid rgba(201,169,98,0.25)' }}>
                  <h3 className="text-base text-[#F5F1E8] font-light mb-1">Delete Task?</h3>
                  <p className="text-sm text-[#6B6B6B] mb-5">
                    "{deleteTarget.title}" will be permanently deleted.
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(null)}
                      className="flex-1 py-3 rounded-xl text-sm text-[#B8B8B8] transition-colors"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,169,98,0.2)' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={confirmDeleteTask}
                      className="flex-1 py-3 rounded-xl text-sm text-white font-medium transition-colors hover:opacity-90"
                      style={{ background: 'rgba(239,68,68,0.85)' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {createPortal(
        <AnimatePresence>
          {editingTask && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-[100]"
                onClick={() => setEditingTask(null)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed inset-x-0 bottom-0 z-[200]"
                style={{ maxHeight: '85vh', borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="relative overflow-y-auto"
                  style={{
                    background: '#000000',
                    borderTop: '2px solid rgba(201,169,98,0.3)',
                    borderTopLeftRadius: '24px',
                    borderTopRightRadius: '24px',
                    maxHeight: '85vh',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  <div className="p-6">
                    <button
                      onClick={() => setEditingTask(null)}
                      className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#000000] transition-colors"
                    >
                      <X className="w-5 h-5 text-[#C9A962]" />
                    </button>
                    <h2 className="text-xl text-[#F5F1E8] font-light mb-6">Edit Task</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-[#B8B8B8] uppercase mb-2 block">Task Name</label>
                        <input
                          type="text"
                          placeholder="What needs to be done?"
                          value={taskData.title || ''}
                          onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                          className="w-full px-4 py-3 bg-[#000000] border border-[rgba(201,169,98,0.3)] rounded-xl text-[#F5F1E8] placeholder-[#6B6B6B] focus:border-[#C9A962] focus:outline-none"
                          autoFocus
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-[#B8B8B8] uppercase mb-2 block">Category</label>
                          <CustomSelect
                            value={taskData.category}
                            onChange={(val) => setTaskData({ ...taskData, category: val })}
                            options={[
                              { value: 'personal', label: 'Personal' },
                              { value: 'work', label: 'Work' },
                              { value: 'school', label: 'School' },
                              { value: 'health', label: 'Health' },
                              { value: 'home', label: 'Home' },
                            ]}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#B8B8B8] uppercase mb-2 block">Priority</label>
                          <CustomSelect
                            value={taskData.priority}
                            onChange={(val) => setTaskData({ ...taskData, priority: val })}
                            options={[
                              { value: 'low', label: 'Low' },
                              { value: 'medium', label: 'Medium' },
                              { value: 'high', label: 'High' },
                              { value: 'urgent', label: 'Urgent' },
                            ]}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs text-[#B8B8B8] uppercase">Due Date</label>
                          <button
                            type="button"
                            onClick={() => {
                              if (taskData.due_date) {
                                setTaskData({ ...taskData, due_date: null });
                                setCalendarOpen(false);
                              } else {
                                setTaskData({ ...taskData, due_date: format(new Date(), 'yyyy-MM-dd') });
                              }
                            }}
                            className="flex items-center gap-1.5 text-xs transition-colors"
                            style={{ color: taskData.due_date ? '#C9A962' : '#6B6B6B' }}
                          >
                            <span className="w-4 h-4 rounded border flex items-center justify-center transition-colors"
                              style={{ borderColor: taskData.due_date ? '#C9A962' : '#4A4A4A', backgroundColor: taskData.due_date ? 'rgba(201,169,98,0.15)' : 'transparent' }}>
                              {taskData.due_date && <span className="block w-2 h-2 rounded-sm" style={{ backgroundColor: '#C9A962' }} />}
                            </span>
                            {taskData.due_date ? 'Remove date' : 'Set date'}
                          </button>
                        </div>
                        {taskData.due_date ? (
                          <>
                            <DatePicker
                              value={taskData.due_date}
                              onChange={(date) => setTaskData({ ...taskData, due_date: date })}
                              placeholder="Select due date"
                              onOpenChange={setCalendarOpen}
                            />
                            {calendarOpen && <div style={{ height: '320px' }} />}
                          </>
                        ) : (
                          <div className="w-full px-4 py-3 bg-[#000000] border border-[rgba(201,169,98,0.15)] rounded-xl text-[#6B6B6B] text-sm italic">
                            No due date — task stays visible until completed
                          </div>
                        )}
                      </div>
                      <ColorPicker
                        selectedColor={taskData.color_tag}
                        onSelectColor={(color) => setTaskData({ ...taskData, color_tag: color })}
                      />
                      <div className="flex gap-3 pt-2 pb-8">
                        <button
                          onClick={() => setEditingTask(null)}
                          className="flex-1 py-3 bg-[#000000] border border-[rgba(201,169,98,0.3)] rounded-full text-sm text-[#B8B8B8] hover:bg-[rgba(201,169,98,0.1)] transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveTask}
                          disabled={!taskData.title?.trim() || loading}
                          className="flex-1 py-3 bg-[#C9A962] rounded-full text-sm text-[#000000] font-medium hover:bg-[#D4B574] transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Saving...' : 'Update Task'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}