import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, X, ChevronUp, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { useModal } from '../../../context/ModalContext';

const MODAL_STYLE = {
  overlay: 'fixed inset-0 bg-black/60 z-50 flex items-end',
  sheet: 'w-full bg-[color:var(--app-bg)] rounded-t-[2rem] border-t border-[rgba(201,169,98,0.25)] max-h-[90vh] flex flex-col',
  header: 'sticky top-0 bg-[color:var(--app-bg)] px-6 pt-5 pb-4 flex items-center justify-between border-b border-[rgba(201,169,98,0.15)]',
  title: 'text-xl text-[color:var(--app-gold)] font-light',
  input: 'w-full bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-xl px-4 py-3 text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:border-[#C9A962] focus:outline-none text-sm',
  label: 'text-xs text-[color:var(--app-text-2)] font-light uppercase tracking-wider mb-2 block',
};

const CYCLE_OPTIONS = ['Daily', 'Weekly', 'Monthly', 'Yearly', 'Custom'];

const EMPTY_FORM = {
  name: '',
  cycle: '',
  customCycle: '',
  duration: '',
  steps: [],
};

export default function AddRoutineModal({ visible, onClose, onSaved, moduleId, editingRoutine }) {
  const { user } = useAuth();
  const { openModal, closeModal } = useModal();
  const [form, setForm] = useState(EMPTY_FORM);
  const [expandedStep, setExpandedStep] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!editingRoutine;

  useEffect(() => {
    if (visible) {
      openModal();
      return () => closeModal();
    }
  }, [visible, openModal, closeModal]);

  useEffect(() => {
    if (visible) {
      if (editingRoutine) {
        setForm({
          name: editingRoutine.name || '',
          cycle: CYCLE_OPTIONS.includes(editingRoutine.cycle) ? editingRoutine.cycle : (editingRoutine.cycle ? 'Custom' : ''),
          customCycle: CYCLE_OPTIONS.includes(editingRoutine.cycle) ? '' : (editingRoutine.cycle || ''),
          duration: editingRoutine.duration_minutes != null ? String(editingRoutine.duration_minutes) : '',
          steps: (editingRoutine.steps || []).map((s, i) => ({ id: s.id || `tmp-${i}`, title: s.title || '' })),
        });
      } else {
        setForm(EMPTY_FORM);
        setExpandedStep(null);
      }
      setError('');
    }
  }, [visible, editingRoutine]);

  const handleClose = () => {
    setError('');
    onClose();
  };

  const addStep = () => {
    const newStep = { id: `tmp-${Date.now()}`, title: '' };
    setForm(prev => ({ ...prev, steps: [...prev.steps, newStep] }));
    setExpandedStep(newStep.id);
  };

  const updateStep = (stepId, value) => {
    setForm(prev => ({ ...prev, steps: prev.steps.map(s => s.id === stepId ? { ...s, title: value } : s) }));
  };

  const removeStep = (stepId) => {
    setForm(prev => ({ ...prev, steps: prev.steps.filter(s => s.id !== stepId) }));
    if (expandedStep === stepId) setExpandedStep(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Please enter a routine name.'); return; }
    setSaving(true);
    setError('');

    const cycleFinal = form.cycle === 'Custom' ? form.customCycle : form.cycle;
    const durationVal = form.duration ? parseInt(form.duration, 10) : null;

    try {
      let routineId;
      if (isEditing) {
        const { error: updateErr } = await supabase
          .from('lifestyle_routines')
          .update({ name: form.name.trim(), cycle: cycleFinal, duration_minutes: durationVal })
          .eq('id', editingRoutine.id);
        if (updateErr) throw updateErr;
        routineId = editingRoutine.id;

        await supabase.from('lifestyle_steps').delete().eq('routine_id', routineId);
      } else {
        const { data: routine, error: insertErr } = await supabase
          .from('lifestyle_routines')
          .insert({ user_id: user.id, module_id: moduleId, name: form.name.trim(), cycle: cycleFinal, duration_minutes: durationVal, sort_order: 0 })
          .select()
          .single();
        if (insertErr) throw insertErr;
        routineId = routine.id;
      }

      const validSteps = form.steps.filter(s => s.title.trim());
      if (validSteps.length > 0) {
        const stepRows = validSteps.map((s, i) => ({
          user_id: user.id,
          routine_id: routineId,
          title: s.title.trim(),
          sort_order: i,
        }));
        const { error: stepsErr } = await supabase.from('lifestyle_steps').insert(stepRows);
        if (stepsErr) throw stepsErr;
      }

      const { data: freshRoutine, error: fetchErr } = await supabase
        .from('lifestyle_routines')
        .select('*, steps:lifestyle_steps(id, title, sort_order)')
        .eq('id', routineId)
        .order('sort_order', { referencedTable: 'lifestyle_steps' })
        .single();
      if (fetchErr) throw fetchErr;

      onSaved(freshRoutine, isEditing);
      handleClose();
    } catch (e) {
      setError('Failed to save. Please try again.');
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
              <h2 className={MODAL_STYLE.title}>{isEditing ? 'Edit Routine' : 'Add Routine'}</h2>
              <button onClick={handleClose} className="text-[color:var(--app-gold)] hover:text-[color:var(--app-gold-light)] transition-colors">
                <ChevronDown className="w-7 h-7" strokeWidth={1.5} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5 scrollbar-hide" style={{ paddingBottom: '3rem' }}>

              <div>
                <label className={MODAL_STYLE.label}>Routine Name</label>
                <input
                  type="text"
                  placeholder="e.g., Morning Skincare"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className={MODAL_STYLE.input}
                />
              </div>

              <div>
                <label className={MODAL_STYLE.label}>Frequency</label>
                <div className="grid grid-cols-5 gap-2">
                  {CYCLE_OPTIONS.map(option => (
                    <button
                      key={option}
                      onClick={() => setForm(prev => ({ ...prev, cycle: option }))}
                      className={`py-2 px-1 rounded-xl text-xs font-light transition-all border ${
                        form.cycle === option
                          ? 'bg-[rgba(201,169,98,0.15)] border-[#C9A962] text-[color:var(--app-gold)]'
                          : 'bg-[color:var(--app-bg)] border-[rgba(201,169,98,0.3)] text-[color:var(--app-text-2)] hover:border-[rgba(201,169,98,0.5)]'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <AnimatePresence>
                  {form.cycle === 'Custom' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2"
                    >
                      <input
                        type="text"
                        placeholder="e.g., Every 3 days"
                        value={form.customCycle}
                        onChange={(e) => setForm(prev => ({ ...prev, customCycle: e.target.value }))}
                        className={MODAL_STYLE.input}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label className={MODAL_STYLE.label}>Duration (minutes)</label>
                <div className="relative">
                  <Timer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--app-text-3)]" strokeWidth={1.5} />
                  <input
                    type="number"
                    min="1"
                    max="999"
                    placeholder="e.g., 15"
                    value={form.duration}
                    onChange={(e) => setForm(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-xl pl-10 pr-16 py-3 text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:border-[#C9A962] focus:outline-none text-sm [color-scheme:dark]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[color:var(--app-text-3)]">min</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className={`${MODAL_STYLE.label} mb-0`}>
                    Steps{form.steps.length > 0 && <span className="text-[color:var(--app-gold)] normal-case ml-1">({form.steps.length})</span>}
                  </label>
                  <button
                    onClick={addStep}
                    className="flex items-center gap-1.5 text-xs text-[color:var(--app-gold)] hover:text-[color:var(--app-gold-light)] transition-colors bg-[rgba(201,169,98,0.1)] hover:bg-[rgba(201,169,98,0.15)] px-3 py-1.5 rounded-lg border border-[rgba(201,169,98,0.25)]"
                  >
                    <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                    Add Step
                  </button>
                </div>

                <div className="space-y-2">
                  <AnimatePresence>
                    {form.steps.map((step, index) => {
                      const isExp = expandedStep === step.id;
                      return (
                        <motion.div
                          key={step.id}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8, height: 0 }}
                          className="bg-[color:var(--app-bg)] rounded-xl border border-[rgba(201,169,98,0.25)] overflow-hidden"
                        >
                          <div
                            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[rgba(201,169,98,0.05)] transition-colors"
                            onClick={() => setExpandedStep(isExp ? null : step.id)}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[color:var(--app-gold)] w-5 h-5 rounded-full border border-[rgba(201,169,98,0.4)] flex items-center justify-center font-light flex-shrink-0">
                                {index + 1}
                              </span>
                              <span className={`text-sm font-light ${step.title ? 'text-[color:var(--app-text)]' : 'text-[color:var(--app-text-3)]'}`}>
                                {step.title || 'Untitled step'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); removeStep(step.id); }}
                                className="text-[color:var(--app-text-3)] hover:text-red-400 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                              </button>
                              {isExp
                                ? <ChevronUp className="w-4 h-4 text-[color:var(--app-gold)]" strokeWidth={1.5} />
                                : <ChevronDown className="w-4 h-4 text-[color:var(--app-gold)]" strokeWidth={1.5} />
                              }
                            </div>
                          </div>
                          <AnimatePresence>
                            {isExp && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="border-t border-[rgba(201,169,98,0.15)] px-4 py-3"
                              >
                                <label className="text-[10px] text-[color:var(--app-text-2)] uppercase tracking-wider mb-1 block">Title</label>
                                <input
                                  type="text"
                                  placeholder="Step title..."
                                  value={step.title}
                                  onChange={(e) => updateStep(step.id, e.target.value)}
                                  className="w-full bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.25)] rounded-lg px-3 py-2.5 text-[color:var(--app-text)] placeholder-[color:var(--app-text-3)] focus:border-[#C9A962] focus:outline-none text-sm"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {form.steps.length === 0 && (
                    <div className="text-center py-6 border border-dashed border-[rgba(201,169,98,0.2)] rounded-xl">
                      <p className="text-xs text-[color:var(--app-text-3)]">No steps added yet</p>
                      <p className="text-[10px] text-[color:var(--app-text-3)] mt-1">Tap "Add Step" to begin</p>
                    </div>
                  )}
                </div>
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={!form.name.trim() || saving}
                className="w-full bg-[#C9A962] hover:bg-[#D4B978] disabled:opacity-40 disabled:cursor-not-allowed text-[#000000] font-medium py-4 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-[#000000] border-t-transparent rounded-full animate-spin" />
                ) : (
                  isEditing ? 'Save Changes' : 'Add Routine'
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
