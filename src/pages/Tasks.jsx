import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { format, parseISO, isToday, isTomorrow, isPast, isThisWeek, isFuture } from 'date-fns';
import { Plus, Circle, CheckCircle2, ChevronDown, ChevronLeft, Trash2, CreditCard as Edit2, X, Briefcase, Home, ShoppingBag, Bell, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from '../components/ui/DatePicker';
import CustomSelect from '../components/ui/CustomSelect';
import ColorPicker from '../components/ui/ColorPicker';
import ColorDot from '../components/ui/ColorDot';
import { TasksSkeleton } from '../components/ui/PageSkeleton';

export default function Tasks() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openModal, closeModal } = useModal();
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const isModalOpen = showAddTask || !!editingTask;
  useEffect(() => {
    if (isModalOpen) {
      openModal();
      return () => closeModal();
    }
  }, [isModalOpen, openModal, closeModal]);
  const [loading, setLoading] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showBlockLibrary, setShowBlockLibrary] = useState(true);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const queryClient = useQueryClient();

  const [taskData, setTaskData] = useState({
    title: '',
    category: 'personal',
    priority: 'medium',
    due_date: null,
    color_tag: '#C9A962',
  });

  const taskBlocks = [
    { id: 'personal', label: 'Personal', icon: Sparkles, color: '#D4AF37', category: 'personal', image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/task-icon/ChatGPT%20Image%20Personal.png' },
    { id: 'work', label: 'Work', icon: Briefcase, color: '#8B7355', category: 'work', image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/task-icon/ChatGPT%20Image%20Work.png' },
    { id: 'school', label: 'School', icon: ShoppingBag, color: '#A67C52', category: 'school', image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/task-icon/ChatGPT%20Image%20School.png' },
    { id: 'home', label: 'Home', icon: Home, color: '#B8956A', category: 'home', image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/task-icon/ChatGPT%20Image%20healt.png' },
    { id: 'health', label: 'Health', icon: Bell, color: '#D4B574', category: 'health', image: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/task-icon/ChatGPT%20Image%20House.png' },
  ];

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) return [];
      return data || [];
    },
    enabled: !!user?.id,
  });

  const categoryLabels = { personal: 'Personal', work: 'Work', school: 'School', health: 'Health', home: 'Home' };
  const categoryColors = { personal: '#D4AF37', work: '#8B7355', school: '#A67C52', health: '#D4B574', home: '#B8956A' };

  const allTasks = [...tasks].sort((a, b) => {
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return a.due_date.localeCompare(b.due_date);
  });

  const todayTasks = allTasks.filter(t => !t.completed && t.due_date && isToday(parseISO(t.due_date)));
  const upcomingTasks = allTasks.filter(t => !t.completed && t.due_date && isFuture(parseISO(t.due_date)) && !isToday(parseISO(t.due_date)));
  const noDueDateTasks = allTasks.filter(t => !t.completed && !t.due_date);
  const completedTasks = allTasks.filter(t => t.completed);

  const handleAddBlock = (block) => {
    setTaskData({ title: '', category: block.category, priority: 'medium', due_date: null, color_tag: '#C9A962' });
    setEditingTask(null);
    setShowAddTask(true);
  };

  const toggleTask = async (task) => {
    await supabase.from('tasks').update({ completed: !task.completed }).eq('id', task.id).eq('user_id', user.id);
    queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
  };

  const deleteTask = async (taskId) => {
    await supabase.from('tasks').delete().eq('id', taskId).eq('user_id', user.id);
    queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
  };

  const handleSaveTask = async () => {
    if (!taskData.title.trim()) return;
    setLoading(true);
    try {
      if (editingTask) {
        await supabase.from('tasks').update({ title: taskData.title, category: taskData.category, priority: taskData.priority, due_date: taskData.due_date || null, color_tag: taskData.color_tag }).eq('id', editingTask.id).eq('user_id', user.id);
      } else {
        await supabase.from('tasks').insert({ user_id: user.id, title: taskData.title, category: taskData.category, priority: taskData.priority, due_date: taskData.due_date || null, color_tag: taskData.color_tag, completed: false });
      }
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      setShowAddTask(false);
      setEditingTask(null);
      setTaskData({ title: '', category: 'personal', priority: 'medium', due_date: null, color_tag: '#C9A962' });
    } finally {
      setLoading(false);
    }
  };

  const getDueDateLabel = (date) => {
    if (!date) return null;
    const parsed = parseISO(date);
    if (isToday(parsed)) return 'Today';
    if (isTomorrow(parsed)) return 'Tomorrow';
    if (isPast(parsed)) return 'Overdue';
    if (isThisWeek(parsed)) return format(parsed, 'EEEE');
    return format(parsed, 'MMM d');
  };

  const TaskItem = ({ task }) => {
    const dueDateLabel = getDueDateLabel(task.due_date);
    const isOverdue = task.due_date && isPast(parseISO(task.due_date)) && !task.completed;
    const categoryColor = categoryColors[task.category] || '#C9A962';
    const dotColor = task.color_tag || '#C9A962';
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.15 }}
        className="rounded-xl p-4 border transition-all bg-[color:var(--app-bg)] hover:shadow-md"
        style={{ borderColor: `${dotColor}50`, opacity: task.completed ? 0.6 : 1 }}>
        <div className="flex items-start gap-3">
          <button onClick={() => toggleTask(task)} className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110 active:scale-95">
            {task.completed ? <CheckCircle2 className="w-5 h-5" style={{ color: dotColor }} strokeWidth={1.5} /> : <Circle className="w-5 h-5" style={{ color: dotColor }} strokeWidth={1.5} />}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <ColorDot color={dotColor} size="sm" />
              <span className={`text-sm text-[color:var(--app-text)] ${task.completed ? 'line-through opacity-60' : ''}`}>{task.title}</span>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}>{categoryLabels[task.category] || task.category}</span>
              {task.priority !== 'medium' && <span className="text-xs px-2 py-0.5 rounded-full uppercase tracking-wider bg-[rgba(201,169,98,0.2)] text-[color:var(--app-gold)]">{task.priority}</span>}
              {dueDateLabel && !task.completed && <span className={`text-xs ${isOverdue ? 'text-red-400' : 'text-[color:var(--app-text-2)]'}`}>{dueDateLabel}</span>}
              {!task.due_date && !task.completed && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(201,169,98,0.12)', color: 'var(--app-gold)' }}>Ongoing</span>
              )}
            </div>
          </div>
          {!task.completed && (
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => { setEditingTask(task); setTaskData({ title: task.title, category: task.category, priority: task.priority, due_date: task.due_date || null, color_tag: task.color_tag || '#C9A962' }); setShowAddTask(true); }}
                className="p-2 rounded-lg transition-all text-[color:var(--app-text-2)] hover:text-[color:var(--app-gold)] hover:bg-[rgba(201,169,98,0.1)]">
                <Edit2 className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <button onClick={() => deleteTask(task.id)} className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          )}
          {task.completed && (
            <button onClick={() => deleteTask(task.id)} className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-full pb-8 bg-[color:var(--app-bg)]">
      <div className="relative border-b-2 border-[rgba(201,169,98,0.25)] page-safe-x py-6 flex items-center">
        <button onClick={() => navigate(-1)} className="absolute left-4 hover:opacity-70 transition-opacity">
          <ChevronLeft className="w-6 h-6 text-[color:var(--app-gold)]" strokeWidth={1.5} />
        </button>
        <div className="w-full text-center">
          <h1 className="text-3xl text-[color:var(--app-gold)] font-light tracking-wide">Tasks</h1>
        </div>
      </div>

      {tasksLoading ? <TasksSkeleton /> : <div className="page-safe-x pt-4 space-y-4">
        {showBlockLibrary && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm text-[color:var(--app-gold)] font-light">Quick Add</h3>
              <button onClick={() => setShowBlockLibrary(false)}><X className="w-4 h-4 text-[color:var(--app-text-2)]" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {taskBlocks.map((block) => {
                const BlockIcon = block.icon;
                return (
                  <button key={block.id} onClick={() => handleAddBlock(block)}
                    className="flex items-center rounded-xl overflow-hidden transition-all active:scale-95"
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
                        <span className="text-xs text-left leading-tight text-[color:var(--app-text)]">{block.label}</span>
                      </div>
                      <Plus className="w-4 h-4 self-end" style={{ color: 'var(--app-gold)' }} strokeWidth={1.5} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!showBlockLibrary && (
          <button onClick={() => setShowBlockLibrary(true)}
            className="w-full py-2 bg-[color:var(--app-bg)] rounded-xl border border-[rgba(201,169,98,0.3)] text-sm text-[color:var(--app-gold)] hover:bg-[rgba(201,169,98,0.1)] transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Show Quick Add
          </button>
        )}

        {todayTasks.length > 0 && (
          <div>
            <h3 className="text-sm text-[color:var(--app-text-2)] uppercase tracking-wider mb-3 px-1">Today</h3>
            <div className="space-y-2"><AnimatePresence>{todayTasks.map(task => <TaskItem key={task.id} task={task} />)}</AnimatePresence></div>
          </div>
        )}

        {upcomingTasks.length > 0 && (
          <div>
            <h3 className="text-sm text-[color:var(--app-text-2)] uppercase tracking-wider mb-3 px-1">Upcoming</h3>
            <div className="space-y-2"><AnimatePresence>{upcomingTasks.map(task => <TaskItem key={task.id} task={task} />)}</AnimatePresence></div>
          </div>
        )}

        {noDueDateTasks.length > 0 && (
          <div>
            <h3 className="text-sm text-[color:var(--app-text-2)] uppercase tracking-wider mb-3 px-1">No Due Date</h3>
            <div className="space-y-2"><AnimatePresence>{noDueDateTasks.map(task => <TaskItem key={task.id} task={task} />)}</AnimatePresence></div>
          </div>
        )}

        {todayTasks.length === 0 && upcomingTasks.length === 0 && noDueDateTasks.length === 0 && (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-[color:var(--app-gold)]/20 mx-auto mb-3" strokeWidth={1.5} />
            <div className="text-sm text-[color:var(--app-text-2)] mb-2">No active tasks</div>
            <div className="text-xs text-[color:var(--app-text-3)]">Use Quick Add blocks to create tasks</div>
          </div>
        )}

        {completedTasks.length > 0 && (
          <div className="pt-2">
            <button onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-2 text-sm text-[color:var(--app-text-2)] uppercase tracking-wider mb-3 hover:text-[color:var(--app-gold)] transition-colors px-1">
              <ChevronDown className={`w-4 h-4 transition-transform ${showCompleted ? 'rotate-180' : ''}`} strokeWidth={1.5} />
              Completed ({completedTasks.length})
            </button>
            <AnimatePresence>
              {showCompleted && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
                  {completedTasks.map((task) => <TaskItem key={task.id} task={task} />)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>}

      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowAddTask(false)}>
          <div className="w-full bg-[color:var(--app-bg)] rounded-t-3xl border-t-2 border-[rgba(201,169,98,0.3)] overflow-y-auto scrollbar-hide"
            style={{ maxHeight: '88dvh' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <button onClick={() => setShowAddTask(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[color:var(--app-bg)]">
                <X className="w-5 h-5 text-[color:var(--app-gold)]" />
              </button>
              <h2 className="text-xl text-[color:var(--app-gold)] font-light mb-6">{editingTask ? 'Edit Task' : 'Create Task'}</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[color:var(--app-text-2)] uppercase mb-2 block">Task Name</label>
                  <input type="text" placeholder="What needs to be done?" value={taskData.title}
                    onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-xl text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:border-[#C9A962] focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[color:var(--app-text-2)] uppercase mb-2 block">Category</label>
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
                    <label className="text-xs text-[color:var(--app-text-2)] uppercase mb-2 block">Priority</label>
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
                    <label className="text-xs text-[color:var(--app-text-2)] uppercase">Due Date</label>
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
                      style={{ color: taskData.due_date ? '#C9A962' : 'var(--app-text-3)' }}
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
                      <DatePicker value={taskData.due_date} onChange={(date) => setTaskData({ ...taskData, due_date: date })} placeholder="Select due date" onOpenChange={setCalendarOpen} />
                      {calendarOpen && <div style={{ height: '320px' }} />}
                    </>
                  ) : (
                    <div className="w-full px-4 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.15)] rounded-xl text-[color:var(--app-text-3)] text-sm italic">
                      No due date — task stays visible until completed
                    </div>
                  )}
                </div>
                <ColorPicker
                  selectedColor={taskData.color_tag}
                  onSelectColor={(color) => setTaskData({ ...taskData, color_tag: color })}
                />
                <div className="flex gap-3 pt-2" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}>
                  <button onClick={() => setShowAddTask(false)}
                    className="flex-1 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-full text-sm text-[color:var(--app-text-2)] hover:bg-[rgba(201,169,98,0.1)] transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSaveTask} disabled={!taskData.title.trim() || loading}
                    className="flex-1 py-3 bg-[#C9A962] rounded-full text-sm text-[#000000] font-medium hover:bg-[#D4B574] transition-colors disabled:opacity-50">
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}