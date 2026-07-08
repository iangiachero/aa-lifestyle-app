import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, ChevronDown, ChevronUp, ChevronLeft, Trash2, Pencil, Check, BookOpen, ClipboardList, FileText, Clock, Layers, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import CustomSelect from '../components/ui/CustomSelect';
import DatePicker from '../components/ui/DatePicker';
import TimePicker from '../components/ui/TimePicker';
import ColorPicker from '../components/ui/ColorPicker';

const CLASS_CATEGORIES = ['Math', 'English / Composition', 'Science', 'History', 'Elective', 'Custom'];
const DAYS = ['M', 'T', 'W', 'Th', 'F'];
const SEMESTERS = [
  'Spring 2026', 'Summer 2026', 'Fall 2026', 'Winter 2026',
  'Spring 2027', 'Summer 2027', 'Fall 2027', 'Winter 2027',
  'Spring 2028', 'Summer 2028', 'Fall 2028', 'Winter 2028'
];

const EMPTY_CLASS = {
  class_name: '', category: '', color: '#3B82F6',
  instructor_name: '', instructor_email: '',
  meeting_days: [], meeting_start_time: '09:00', meeting_end_time: '10:30',
  location: '', notes: '', is_online: false
};
const EMPTY_ASSIGNMENT = { title: '', class_id: '', due_date: '', due_time: '', priority: 'Medium', notes: '', color: '#3B82F6' };
const EMPTY_EXAM = { title: '', class_id: '', exam_date: '', exam_time: '', notes: '' };
const EMPTY_SESSION = { class_id: '', session_date: '', start_time: '15:00', duration_minutes: 60 };
const EMPTY_PROJECT = { title: '', class_id: '', due_date: '', notes: '' };
const EMPTY_CUSTOM = { title: '', class_id: '', due_date: '', due_time: '', custom_label: '', notes: '' };

function fmtTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export default function Student() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [semester, setSemester] = useState('Spring 2026');
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);

  const [activeModal, setActiveModal] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState({});

  const [classForm, setClassForm] = useState(EMPTY_CLASS);
  const [assignForm, setAssignForm] = useState(EMPTY_ASSIGNMENT);
  const [examForm, setExamForm] = useState(EMPTY_EXAM);
  const [sessionForm, setSessionForm] = useState(EMPTY_SESSION);
  const [projectForm, setProjectForm] = useState(EMPTY_PROJECT);
  const [customForm, setCustomForm] = useState(EMPTY_CUSTOM);

  const fetchClasses = useCallback(async () => {
    if (!user) return;
    setLoadingClasses(true);
    const { data } = await supabase
      .from('student_classes')
      .select('*')
      .eq('user_id', user.id)
      .eq('semester', semester)
      .order('created_at', { ascending: true });
    setClasses(data || []);
    setLoadingClasses(false);
  }, [user, semester]);

  const fetchAssignments = useCallback(async () => {
    if (!user) return;
    setLoadingAssignments(true);
    const { data } = await supabase
      .from('student_assignments')
      .select('*, student_classes(class_name, color)')
      .eq('user_id', user.id)
      .eq('semester', semester)
      .order('due_date', { ascending: true });
    setAssignments(data || []);
    setLoadingAssignments(false);
  }, [user, semester]);

  useEffect(() => {
    fetchClasses();
    fetchAssignments();
  }, [fetchClasses, fetchAssignments]);

  const today = todayStr();

  const visibleAssignments = useMemo(() => {
    return assignments.filter(a => {
      if (a.completed) return false;
      if (a.due_date && a.due_date < today) return false;
      return true;
    });
  }, [assignments, today]);

  const completedAssignments = useMemo(() => {
    return assignments.filter(a => a.completed);
  }, [assignments]);

  const upcoming = visibleAssignments[0] || null;

  async function toggleAssignment(id) {
    const a = assignments.find(x => x.id === id);
    if (!a) return;
    const newCompleted = !a.completed;
    await supabase.from('student_assignments').update({
      completed: newCompleted,
      completed_at: newCompleted ? new Date().toISOString() : null,
    }).eq('id', id);
    setAssignments(prev => prev.map(x => x.id === id ? { ...x, completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : null } : x));
  }

  function openModal(type) {
    setActiveModal(type);
    setEditingItem(null);
    setExpanded({});
    if (type === 'class') setClassForm(EMPTY_CLASS);
    if (type === 'assignment') setAssignForm(EMPTY_ASSIGNMENT);
    if (type === 'exam') setExamForm(EMPTY_EXAM);
    if (type === 'study') setSessionForm(EMPTY_SESSION);
    if (type === 'project') setProjectForm(EMPTY_PROJECT);
    if (type === 'custom') setCustomForm(EMPTY_CUSTOM);
  }

  function openEditClass(cls) {
    setClassForm({
      class_name: cls.class_name, category: cls.category || '', color: cls.color || '#3B82F6',
      instructor_name: cls.instructor_name || '', instructor_email: cls.instructor_email || '',
      meeting_days: cls.meeting_days || [], meeting_start_time: cls.meeting_start_time || '09:00',
      meeting_end_time: cls.meeting_end_time || '10:30', location: cls.location || '', notes: cls.notes || '',
      is_online: cls.is_online || false
    });
    setExpanded({
      instructorName: !!cls.instructor_name, instructorEmail: !!cls.instructor_email,
      meetingDays: (cls.meeting_days || []).length > 0,
      meetingTime: !!(cls.meeting_start_time || cls.meeting_end_time),
      location: !!cls.location, notes: !!cls.notes
    });
    setEditingItem(cls);
    setActiveModal('class');
  }

  function closeModal() {
    setActiveModal(null);
    setEditingItem(null);
  }

  function toggleExp(k) {
    setExpanded(prev => ({ ...prev, [k]: !prev[k] }));
  }

  function toggleDay(day) {
    setClassForm(prev => ({
      ...prev,
      meeting_days: prev.meeting_days.includes(day)
        ? prev.meeting_days.filter(d => d !== day)
        : [...prev.meeting_days, day]
    }));
  }

  async function saveClass() {
    if (!classForm.class_name.trim()) return;
    setSaving(true);
    const payload = { ...classForm, user_id: user.id, semester, updated_at: new Date().toISOString() };
    if (editingItem) {
      const { error } = await supabase.from('student_classes').update(payload).eq('id', editingItem.id);
      if (!error) setClasses(prev => prev.map(c => c.id === editingItem.id ? { ...c, ...payload } : c));
    } else {
      const { data, error } = await supabase.from('student_classes').insert(payload).select().single();
      if (!error && data) setClasses(prev => [...prev, data]);
    }
    setSaving(false);
    closeModal();
  }

  async function deleteClass(id) {
    await supabase.from('student_classes').delete().eq('id', id);
    setClasses(prev => prev.filter(c => c.id !== id));
  }

  async function saveAssignment() {
    if (!assignForm.title.trim()) return;
    setSaving(true);
    const payload = {
      ...assignForm, user_id: user.id, semester,
      class_id: assignForm.class_id || null,
      due_date: assignForm.due_date || null,
      completed: false,
    };
    const { data, error } = await supabase.from('student_assignments').insert(payload).select('*, student_classes(class_name, color)').single();
    if (!error && data) setAssignments(prev => [...prev, data].sort((a, b) => (a.due_date || '') > (b.due_date || '') ? 1 : -1));
    setSaving(false);
    closeModal();
  }

  async function saveExam() {
    if (!examForm.title.trim()) return;
    setSaving(true);
    const payload = {
      ...examForm, user_id: user.id, semester,
      class_id: examForm.class_id || null,
      exam_date: examForm.exam_date || null
    };
    await supabase.from('student_exams').insert(payload);
    setSaving(false);
    closeModal();
  }

  async function saveSession() {
    setSaving(true);
    const payload = {
      ...sessionForm, user_id: user.id, semester,
      class_id: sessionForm.class_id || null,
      session_date: sessionForm.session_date || null
    };
    await supabase.from('student_study_sessions').insert(payload);
    setSaving(false);
    closeModal();
  }

  async function saveProject() {
    if (!projectForm.title.trim()) return;
    setSaving(true);
    const payload = {
      ...projectForm, user_id: user.id, semester,
      class_id: projectForm.class_id || null,
      due_date: projectForm.due_date || null
    };
    await supabase.from('student_projects').insert(payload);
    setSaving(false);
    closeModal();
  }

  async function saveCustom() {
    if (!customForm.title.trim()) return;
    setSaving(true);
    const payload = {
      ...customForm, user_id: user.id, semester,
      class_id: customForm.class_id || null,
      due_date: customForm.due_date || null
    };
    await supabase.from('student_custom_blocks').insert(payload);
    setSaving(false);
    closeModal();
  }

  const academicBlocks = [
    { id: 'class', label: 'Class', icon: <BookOpen className="w-4 h-4 text-[color:var(--app-gold)]" strokeWidth={1.5} /> },
    { id: 'assignment', label: 'Assignment', icon: <ClipboardList className="w-4 h-4 text-[color:var(--app-gold)]" strokeWidth={1.5} /> },
    { id: 'exam', label: 'Exam', icon: <FileText className="w-4 h-4 text-[color:var(--app-gold)]" strokeWidth={1.5} /> },
    { id: 'study', label: 'Session', icon: <Clock className="w-4 h-4 text-[color:var(--app-gold)]" strokeWidth={1.5} /> },
    { id: 'project', label: 'Project', icon: <Layers className="w-4 h-4 text-[color:var(--app-gold)]" strokeWidth={1.5} /> },
    { id: 'custom', label: 'Custom', icon: <SlidersHorizontal className="w-4 h-4 text-[color:var(--app-gold)]" strokeWidth={1.5} /> },
  ];

  return (
    <div className="min-h-full bg-[color:var(--app-bg)]" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}>
      <div className="relative border-b-2 border-[rgba(201,169,98,0.25)] page-safe-x py-6">
        <button onClick={() => navigate(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity">
          <ChevronLeft className="w-6 h-6 text-[color:var(--app-gold)]" strokeWidth={1.5} />
        </button>
        <div className="w-full text-center">
          <h1 className="text-3xl text-[color:var(--app-gold)] font-light tracking-wide">Student</h1>
        </div>
      </div>

      <div className="pt-5 space-y-6">
        {/* Semester Selector */}
        <div className="page-safe-x">
          <CustomSelect
            value={semester}
            onChange={(val) => setSemester(val)}
            options={SEMESTERS.map(s => ({ value: s, label: s }))}
          />
        </div>

        {/* Academic Blocks — horizontal scroll */}
        <div>
          <div className="page-safe-x mb-3">
            <p className="text-[10px] text-[color:var(--app-gold)] font-light tracking-widest uppercase">Academic Blocks</p>
          </div>
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide px-4 pb-1">
            {academicBlocks.map(block => (
              <button
                key={block.id}
                onClick={() => openModal(block.id)}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 w-[4.5rem] pt-3.5 pb-3 px-1 rounded-2xl bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.25)] hover:border-[rgba(201,169,98,0.5)] active:scale-95 transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-[rgba(201,169,98,0.1)] border border-[rgba(201,169,98,0.12)] flex items-center justify-center">
                  {block.icon}
                </div>
                <span className="text-[11px] text-[color:var(--app-text)] font-light text-center leading-tight">{block.label}</span>
                <div className="w-5 h-5 rounded-full bg-[rgba(201,169,98,0.12)] flex items-center justify-center">
                  <Plus className="w-3 h-3 text-[color:var(--app-gold)]" strokeWidth={2.5} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Classes — horizontal scroll cards */}
        <div>
          <div className="page-safe-x mb-3">
            <p className="text-[10px] text-[color:var(--app-gold)] font-light tracking-widest uppercase">Classes</p>
          </div>
          {loadingClasses ? (
            <div className="page-safe-x"><p className="text-xs text-[color:var(--app-text-3)]">Loading...</p></div>
          ) : classes.length === 0 ? (
            <div className="page-safe-x py-2">
              <p className="text-xs text-[color:var(--app-text-3)]">No classes yet — tap "Class" above to add one</p>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-1">
              {classes.map(cls => (
                <div key={cls.id} className="flex-shrink-0 w-36 rounded-2xl bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.2)] overflow-hidden">
                  <div className="h-1" style={{ backgroundColor: cls.color || '#3B82F6' }} />
                  <div className="p-3.5">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full mt-[5px] flex-shrink-0" style={{ backgroundColor: cls.color || '#3B82F6' }} />
                      <p className="text-sm text-[color:var(--app-text)] font-medium leading-snug">{cls.class_name}</p>
                    </div>
                    {cls.is_online ? (
                      <span className="inline-block text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(201,169,98,0.15)] text-[color:var(--app-gold)] border border-[rgba(201,169,98,0.3)]">Online</span>
                    ) : (cls.meeting_days?.length > 0 || cls.meeting_start_time) ? (
                      <p className="text-[11px] text-[color:var(--app-text-3)] leading-tight">
                        {cls.meeting_days?.join(' ')}
                        {cls.meeting_start_time ? ` · ${fmtTime(cls.meeting_start_time)}` : ''}
                      </p>
                    ) : null}
                    <div className="flex gap-1.5 mt-3">
                      <button onClick={() => openEditClass(cls)} className="flex-1 flex items-center justify-center py-1.5 rounded-lg bg-[rgba(201,169,98,0.08)] hover:bg-[rgba(201,169,98,0.15)] transition-colors">
                        <Pencil className="w-3 h-3 text-[color:var(--app-gold)]" strokeWidth={1.5} />
                      </button>
                      <button onClick={() => deleteClass(cls.id)} className="flex-1 flex items-center justify-center py-1.5 rounded-lg bg-[rgba(255,60,60,0.06)] hover:bg-[rgba(255,60,60,0.15)] transition-colors">
                        <Trash2 className="w-3 h-3 text-red-400" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assignments — full-width rows */}
        <div className="page-safe-x">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] text-[color:var(--app-gold)] font-light tracking-widest uppercase">Upcoming Assignments</p>
            {completedAssignments.length > 0 && (
              <button
                onClick={() => setShowCompleted(v => !v)}
                className="flex items-center gap-1 text-[color:var(--app-text-3)] hover:text-[color:var(--app-text-3)] transition-colors"
              >
                {showCompleted
                  ? <ChevronUp className="w-3 h-3" strokeWidth={2} />
                  : <ChevronDown className="w-3 h-3" strokeWidth={2} />
                }
                <span className="text-[11px]">Completed ({completedAssignments.length})</span>
              </button>
            )}
          </div>
          {loadingAssignments ? (
            <p className="text-xs text-[color:var(--app-text-3)]">Loading...</p>
          ) : visibleAssignments.length === 0 && completedAssignments.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-[color:var(--app-text-3)] font-light">No upcoming assignments</p>
              <p className="text-xs text-[color:var(--app-text-3)] mt-1">Tap "Assignment" above to add one</p>
            </div>
          ) : (
            <div className="space-y-2">
              {visibleAssignments.map(a => (
                <AssignmentRow key={a.id} assignment={a} onToggle={toggleAssignment} />
              ))}
              {showCompleted && (
                <div className="space-y-2 mt-1 opacity-50">
                  {completedAssignments.map(a => (
                    <AssignmentRow key={a.id} assignment={a} onToggle={toggleAssignment} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ——— Modals ——— */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={closeModal}>
          <div
            className="w-full bg-[color:var(--app-bg)] rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto scrollbar-hide border-t-2 border-[rgba(201,169,98,0.3)]"
            style={{ animation: 'slideUp 0.3s ease-out' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-[color:var(--app-gold)] font-light">
                {activeModal === 'class' && (editingItem ? 'Edit Class' : 'Add Class')}
                {activeModal === 'assignment' && 'Add Assignment'}
                {activeModal === 'exam' && 'Add Exam'}
                {activeModal === 'study' && 'Add Study Session'}
                {activeModal === 'project' && 'Add Project'}
                {activeModal === 'custom' && 'Add Custom Block'}
              </h2>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[color:var(--app-bg)] transition-colors">
                <X className="w-5 h-5 text-[color:var(--app-gold)]" strokeWidth={1.5} />
              </button>
            </div>

            <div className="space-y-4 pb-28">
              {/* ——— Class Modal ——— */}
              {activeModal === 'class' && (
                <>
                  <div>
                    <label className="text-xs text-[color:var(--app-text-2)] uppercase mb-2 block">Quick Select</label>
                    <div className="grid grid-cols-3 gap-2">
                      {CLASS_CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setClassForm(prev => ({
                            ...prev,
                            category: cat,
                            class_name: cat === 'Custom' ? '' : (prev.class_name && prev.category !== 'Custom' ? prev.class_name : cat)
                          }))}
                          className={`py-2.5 px-2 rounded-xl text-xs border transition-colors ${
                            classForm.category === cat
                              ? 'bg-[rgba(201,169,98,0.2)] border-[#C9A962] text-[color:var(--app-gold)]'
                              : 'bg-[color:var(--app-bg)] border-[rgba(201,169,98,0.3)] text-[color:var(--app-text)] hover:border-[#C9A962]'
                          }`}
                        >{cat}</button>
                      ))}
                    </div>
                  </div>
                  {classForm.category === 'Custom' ? (
                    <div>
                      <label className="text-xs text-[color:var(--app-text-2)] uppercase mb-2 block">Class Name</label>
                      <input
                        type="text"
                        value={classForm.class_name}
                        onChange={e => setClassForm(prev => ({ ...prev, class_name: e.target.value }))}
                        placeholder="e.g., Advanced Physics, Creative Writing"
                        autoFocus
                        className="w-full px-4 py-3 bg-[color:var(--app-bg)] border border-[#C9A962] rounded-xl text-sm text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs text-[color:var(--app-text-2)] uppercase mb-2 block">Class Name</label>
                      <input
                        type="text"
                        value={classForm.class_name}
                        onChange={e => setClassForm(prev => ({ ...prev, class_name: e.target.value }))}
                        placeholder="e.g., Psychology 101"
                        className="w-full px-4 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-xl text-sm text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:border-[#C9A962] focus:outline-none"
                      />
                    </div>
                  )}
                  <ColorPicker
                    selectedColor={classForm.color}
                    onSelectColor={(color) => setClassForm(prev => ({ ...prev, color }))}
                  />
                  <button
                    onClick={() => setClassForm(prev => ({
                      ...prev,
                      is_online: !prev.is_online,
                      ...(prev.is_online ? {} : { meeting_days: [], meeting_start_time: '09:00', meeting_end_time: '10:30' })
                    }))}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                      classForm.is_online
                        ? 'bg-[rgba(201,169,98,0.12)] border-[#C9A962]'
                        : 'bg-[color:var(--app-bg)] border-[rgba(201,169,98,0.3)] hover:border-[rgba(201,169,98,0.5)]'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                      classForm.is_online ? 'bg-[#C9A962] border-[#C9A962]' : 'bg-transparent border-[rgba(201,169,98,0.5)]'
                    }`}>
                      {classForm.is_online && (
                        <svg className="w-2.5 h-2.5 text-[#000000]" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm ${classForm.is_online ? 'text-[color:var(--app-gold)]' : 'text-[color:var(--app-text-2)]'}`}>
                      Online class
                    </span>
                  </button>
                  <Collapsible label="Instructor Name" expanded={expanded.instructorName} onToggle={() => toggleExp('instructorName')}>
                    <input type="text" value={classForm.instructor_name} onChange={e => setClassForm(prev => ({ ...prev, instructor_name: e.target.value }))}
                      placeholder="Dr. Smith" className="w-full px-4 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-xl text-sm text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:border-[#C9A962] focus:outline-none mt-2" />
                  </Collapsible>
                  <Collapsible label="Instructor Email" expanded={expanded.instructorEmail} onToggle={() => toggleExp('instructorEmail')}>
                    <input type="email" value={classForm.instructor_email} onChange={e => setClassForm(prev => ({ ...prev, instructor_email: e.target.value }))}
                      placeholder="professor@university.edu" className="w-full px-4 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-xl text-sm text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:border-[#C9A962] focus:outline-none mt-2" />
                  </Collapsible>
                  {!classForm.is_online && (
                    <>
                      <Collapsible label="Meeting Days" expanded={expanded.meetingDays} onToggle={() => toggleExp('meetingDays')}>
                        <div className="flex gap-2 mt-2">
                          {DAYS.map(day => (
                            <button key={day} onClick={() => toggleDay(day)}
                              className={`flex-1 py-2 rounded-lg text-sm border transition-colors ${classForm.meeting_days.includes(day) ? 'bg-[#C9A962] text-[#000000] border-[#C9A962]' : 'bg-[color:var(--app-bg)] border-[rgba(201,169,98,0.3)] text-[color:var(--app-text)] hover:border-[#C9A962]'}`}>
                              {day}
                            </button>
                          ))}
                        </div>
                      </Collapsible>
                      <Collapsible label="Meeting Time" expanded={expanded.meetingTime} onToggle={() => toggleExp('meetingTime')}>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <div>
                            <label className="text-xs text-[color:var(--app-text-3)] mb-1 block">Start</label>
                            <TimePicker value={classForm.meeting_start_time} onChange={v => setClassForm(prev => ({ ...prev, meeting_start_time: v }))} placeholder="Start" />
                          </div>
                          <div>
                            <label className="text-xs text-[color:var(--app-text-3)] mb-1 block">End</label>
                            <TimePicker value={classForm.meeting_end_time} onChange={v => setClassForm(prev => ({ ...prev, meeting_end_time: v }))} placeholder="End" />
                          </div>
                        </div>
                      </Collapsible>
                    </>
                  )}
                  <Collapsible label="Location" expanded={expanded.location} onToggle={() => toggleExp('location')}>
                    <input type="text" value={classForm.location} onChange={e => setClassForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Building / Room or Zoom link" className="w-full px-4 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-xl text-sm text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:border-[#C9A962] focus:outline-none mt-2" />
                  </Collapsible>
                  <Collapsible label="Notes" expanded={expanded.notes} onToggle={() => toggleExp('notes')}>
                    <textarea value={classForm.notes} onChange={e => setClassForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Syllabus info, office hours, etc." rows={3}
                      className="w-full px-4 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-xl text-sm text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:border-[#C9A962] focus:outline-none resize-none mt-2" />
                  </Collapsible>
                  <ModalButtons onCancel={closeModal} onSave={saveClass} saving={saving} disabled={!classForm.class_name.trim()} label={editingItem ? 'Save Changes' : 'Add'} />
                </>
              )}

              {/* ——— Assignment Modal ——— */}
              {activeModal === 'assignment' && (
                <>
                  <Field label="Title">
                    <input type="text" value={assignForm.title} onChange={e => setAssignForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Essay on Chapter 5"
                      className="w-full px-4 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-xl text-sm text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:border-[#C9A962] focus:outline-none" />
                  </Field>
                  <Field label="Class">
                    <ClassSelect classes={classes} value={assignForm.class_id} onChange={v => setAssignForm(prev => ({ ...prev, class_id: v }))} />
                  </Field>
                  <Field label="Due Date">
                    <DatePicker value={assignForm.due_date} onChange={v => setAssignForm(prev => ({ ...prev, due_date: v }))} placeholder="Select due date" />
                  </Field>
                  <Collapsible label="Due Time (Optional)" expanded={expanded.dueTime} onToggle={() => toggleExp('dueTime')}>
                    <div className="mt-2">
                      <TimePicker value={assignForm.due_time} onChange={v => setAssignForm(prev => ({ ...prev, due_time: v }))} placeholder="Select time" />
                    </div>
                  </Collapsible>
                  <Field label="Priority">
                    <CustomSelect
                      value={assignForm.priority}
                      onChange={(val) => setAssignForm(prev => ({ ...prev, priority: val }))}
                      options={[{ value: 'Low', label: 'Low' }, { value: 'Medium', label: 'Medium' }, { value: 'High', label: 'High' }]}
                    />
                  </Field>
                  <Collapsible label="Notes (Optional)" expanded={expanded.notes} onToggle={() => toggleExp('notes')}>
                    <textarea value={assignForm.notes} onChange={e => setAssignForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add any notes or details" rows={3}
                      className="w-full px-4 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-xl text-sm text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:border-[#C9A962] focus:outline-none resize-none mt-2" />
                  </Collapsible>
                  <ColorPicker
                    selectedColor={assignForm.color}
                    onSelectColor={(color) => setAssignForm(prev => ({ ...prev, color }))}
                  />
                  <ModalButtons onCancel={closeModal} onSave={saveAssignment} saving={saving} disabled={!assignForm.title.trim()} />
                </>
              )}

              {/* ——— Exam Modal ——— */}
              {activeModal === 'exam' && (
                <>
                  <Field label="Title">
                    <input type="text" value={examForm.title} onChange={e => setExamForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Midterm Exam"
                      className="w-full px-4 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-xl text-sm text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:border-[#C9A962] focus:outline-none" />
                  </Field>
                  <Field label="Class">
                    <ClassSelect classes={classes} value={examForm.class_id} onChange={v => setExamForm(prev => ({ ...prev, class_id: v }))} />
                  </Field>
                  <Field label="Exam Date">
                    <DatePicker value={examForm.exam_date} onChange={v => setExamForm(prev => ({ ...prev, exam_date: v }))} placeholder="Select exam date" />
                  </Field>
                  <Collapsible label="Exam Time (Optional)" expanded={expanded.examTime} onToggle={() => toggleExp('examTime')}>
                    <div className="mt-2">
                      <TimePicker value={examForm.exam_time} onChange={v => setExamForm(prev => ({ ...prev, exam_time: v }))} placeholder="Select time" />
                    </div>
                  </Collapsible>
                  <Collapsible label="Notes (Optional)" expanded={expanded.notes} onToggle={() => toggleExp('notes')}>
                    <textarea value={examForm.notes} onChange={e => setExamForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Topics to study, location, etc." rows={3}
                      className="w-full px-4 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-xl text-sm text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:border-[#C9A962] focus:outline-none resize-none mt-2" />
                  </Collapsible>
                  <ModalButtons onCancel={closeModal} onSave={saveExam} saving={saving} disabled={!examForm.title.trim()} />
                </>
              )}

              {/* ——— Study Session Modal ——— */}
              {activeModal === 'study' && (
                <>
                  <Field label="Class">
                    <ClassSelect classes={classes} value={sessionForm.class_id} onChange={v => setSessionForm(prev => ({ ...prev, class_id: v }))} />
                  </Field>
                  <Field label="Date">
                    <DatePicker value={sessionForm.session_date} onChange={v => setSessionForm(prev => ({ ...prev, session_date: v }))} placeholder="Select date" />
                  </Field>
                  <Field label="Start Time">
                    <TimePicker value={sessionForm.start_time} onChange={v => setSessionForm(prev => ({ ...prev, start_time: v }))} placeholder="Select time" />
                  </Field>
                  <Field label="Duration (Minutes)">
                    <input type="number" value={sessionForm.duration_minutes} onChange={e => setSessionForm(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 60 }))}
                      min={5} step={5} className="w-full px-4 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-xl text-sm text-[color:var(--app-text)] focus:border-[#C9A962] focus:outline-none" />
                  </Field>
                  <ModalButtons onCancel={closeModal} onSave={saveSession} saving={saving} />
                </>
              )}

              {/* ——— Project Modal ——— */}
              {activeModal === 'project' && (
                <>
                  <Field label="Title">
                    <input type="text" value={projectForm.title} onChange={e => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Research Paper"
                      className="w-full px-4 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-xl text-sm text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:border-[#C9A962] focus:outline-none" />
                  </Field>
                  <Field label="Class">
                    <ClassSelect classes={classes} value={projectForm.class_id} onChange={v => setProjectForm(prev => ({ ...prev, class_id: v }))} />
                  </Field>
                  <Field label="Due Date">
                    <DatePicker value={projectForm.due_date} onChange={v => setProjectForm(prev => ({ ...prev, due_date: v }))} placeholder="Select due date" />
                  </Field>
                  <Collapsible label="Notes (Optional)" expanded={expanded.notes} onToggle={() => toggleExp('notes')}>
                    <textarea value={projectForm.notes} onChange={e => setProjectForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add any notes or details" rows={3}
                      className="w-full px-4 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-xl text-sm text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:border-[#C9A962] focus:outline-none resize-none mt-2" />
                  </Collapsible>
                  <ModalButtons onCancel={closeModal} onSave={saveProject} saving={saving} disabled={!projectForm.title.trim()} />
                </>
              )}

              {/* ——— Custom Block Modal ——— */}
              {activeModal === 'custom' && (
                <>
                  <Field label="Title">
                    <input type="text" value={customForm.title} onChange={e => setCustomForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Lab Report"
                      className="w-full px-4 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-xl text-sm text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:border-[#C9A962] focus:outline-none" />
                  </Field>
                  <Field label="Class">
                    <ClassSelect classes={classes} value={customForm.class_id} onChange={v => setCustomForm(prev => ({ ...prev, class_id: v }))} />
                  </Field>
                  <Field label="Due Date">
                    <DatePicker value={customForm.due_date} onChange={v => setCustomForm(prev => ({ ...prev, due_date: v }))} placeholder="Select due date" />
                  </Field>
                  <Collapsible label="Due Time (Optional)" expanded={expanded.dueTime} onToggle={() => toggleExp('dueTime')}>
                    <div className="mt-2">
                      <TimePicker value={customForm.due_time} onChange={v => setCustomForm(prev => ({ ...prev, due_time: v }))} placeholder="Select time" />
                    </div>
                  </Collapsible>
                  <Field label="Custom Label">
                    <input type="text" value={customForm.custom_label} onChange={e => setCustomForm(prev => ({ ...prev, custom_label: e.target.value }))}
                      placeholder="e.g., Research, Reading, Review"
                      className="w-full px-4 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-xl text-sm text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:border-[#C9A962] focus:outline-none" />
                  </Field>
                  <Collapsible label="Notes (Optional)" expanded={expanded.notes} onToggle={() => toggleExp('notes')}>
                    <textarea value={customForm.notes} onChange={e => setCustomForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add any notes or details" rows={3}
                      className="w-full px-4 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-xl text-sm text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:border-[#C9A962] focus:outline-none resize-none mt-2" />
                  </Collapsible>
                  <ModalButtons onCancel={closeModal} onSave={saveCustom} saving={saving} disabled={!customForm.title.trim()} />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
}

function AssignmentRow({ assignment, onToggle }) {
  return (
    <div
      className="flex items-center gap-2.5 p-2.5 bg-[color:var(--app-bg)] rounded-xl border border-[rgba(201,169,98,0.12)]"
      style={{ borderLeft: `3px solid ${assignment.color || '#3B82F6'}` }}
    >
      <button
        onClick={() => onToggle(assignment.id)}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          assignment.completed
            ? 'bg-[#C9A962] border-[#C9A962]'
            : 'border-[color:var(--app-wash-3)] hover:border-[#C9A962]'
        }`}
      >
        {assignment.completed && <Check className="w-3 h-3 text-[#000000]" strokeWidth={3} />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-xs text-[color:var(--app-text)] font-medium truncate ${assignment.completed ? 'line-through opacity-50' : ''}`}>
          {assignment.title}
        </p>
        <p className="text-[10px] text-[color:var(--app-text-3)] truncate">
          {assignment.student_classes?.class_name || ''}
          {assignment.due_date ? `${assignment.student_classes?.class_name ? ' · ' : ''}Due ${fmtDate(assignment.due_date)}` : ''}
        </p>
      </div>
      {assignment.priority === 'High' && !assignment.completed && (
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-900/40 text-red-300 flex-shrink-0">!</span>
      )}
    </div>
  );
}

function Collapsible({ label, expanded, onToggle, children }) {
  return (
    <div>
      <button onClick={onToggle} className="w-full flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[rgba(201,169,98,0.05)] transition-colors">
        <span className="text-xs text-[color:var(--app-text-2)] uppercase">{label}</span>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-[color:var(--app-gold)]" strokeWidth={1.5} />
          : <ChevronDown className="w-4 h-4 text-[color:var(--app-gold)]" strokeWidth={1.5} />
        }
      </button>
      {expanded && children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs text-[color:var(--app-text-2)] uppercase mb-2 block">{label}</label>
      {children}
    </div>
  );
}

function ClassSelect({ classes, value, onChange }) {
  const options = [
    { value: '', label: 'Select class' },
    ...classes.map(cls => ({ value: cls.id, label: cls.class_name })),
  ];
  return (
    <CustomSelect
      value={value}
      onChange={(val) => onChange(val)}
      options={options}
      placeholder="Select class"
    />
  );
}

function ModalButtons({ onCancel, onSave, saving, disabled = false, label = 'Add' }) {
  return (
    <div className="flex gap-3 pt-2">
      <button onClick={onCancel} disabled={saving}
        className="flex-1 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-full text-sm text-[color:var(--app-text-2)] hover:bg-[rgba(201,169,98,0.1)] transition-colors disabled:opacity-50">
        Cancel
      </button>
      <button onClick={onSave} disabled={saving || disabled}
        className="flex-1 py-3 bg-[#C9A962] rounded-full text-sm text-[#000000] font-medium hover:bg-[#D4B574] transition-colors disabled:opacity-50">
        {saving ? 'Saving...' : label}
      </button>
    </div>
  );
}
