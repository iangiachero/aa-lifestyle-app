import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Timer, Pencil, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { seedLifestyleRoutines } from '../lib/seedLifestyleRoutines';
import AddRoutineModal from './lifestyle/components/AddRoutineModal';
import AddModuleModal from './lifestyle/components/AddModuleModal';
import DeleteModuleModal from './lifestyle/components/DeleteModuleModal';

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #2a2520 0%, #1a1510 100%)',
  'linear-gradient(135deg, #252028 0%, #15101a 100%)',
  'linear-gradient(135deg, #202520 0%, #101a10 100%)',
  'linear-gradient(135deg, #252520 0%, #1a1a10 100%)',
  'linear-gradient(135deg, #28201a 0%, #1a1008 100%)',
  'linear-gradient(135deg, #202028 0%, #101018 100%)',
];


const PatternOverlay = ({ index }) => {
  const patterns = [
    <svg key={0} className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 200 200">
      <path d="M 0 100 Q 50 60 100 100 Q 150 140 200 100" stroke="rgba(201,169,98,0.6)" strokeWidth="1.5" fill="none"/>
      <path d="M 0 120 Q 50 80 100 120 Q 150 160 200 120" stroke="rgba(201,169,98,0.4)" strokeWidth="1" fill="none"/>
      <path d="M 0 80 Q 50 40 100 80 Q 150 120 200 80" stroke="rgba(201,169,98,0.3)" strokeWidth="1" fill="none"/>
    </svg>,
    <svg key={1} className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 200 200">
      <polygon points="100,30 170,100 100,170 30,100" stroke="rgba(201,169,98,0.5)" strokeWidth="1.5" fill="none"/>
      <polygon points="100,55 145,100 100,145 55,100" stroke="rgba(201,169,98,0.3)" strokeWidth="1" fill="none"/>
    </svg>,
    <svg key={2} className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="60" stroke="rgba(201,169,98,0.5)" strokeWidth="1.5" fill="none"/>
      <circle cx="100" cy="100" r="40" stroke="rgba(201,169,98,0.3)" strokeWidth="1" fill="none"/>
      <circle cx="100" cy="100" r="20" stroke="rgba(201,169,98,0.2)" strokeWidth="1" fill="none"/>
    </svg>,
    <svg key={3} className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 200 200">
      {[40,80,120,160].map(x => [40,80,120,160].map(y =>
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="rgba(201,169,98,0.5)"/>
      ))}
    </svg>,
    <svg key={4} className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 200 200">
      <path d="M 100 20 Q 160 80 100 180 Q 40 80 100 20" stroke="rgba(201,169,98,0.5)" strokeWidth="1.5" fill="none"/>
      <path d="M 20 100 Q 80 40 180 100 Q 80 160 20 100" stroke="rgba(201,169,98,0.3)" strokeWidth="1" fill="none"/>
    </svg>,
    <svg key={5} className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 200 200">
      <polyline points="0,80 40,40 80,80 120,40 160,80 200,40" stroke="rgba(201,169,98,0.5)" strokeWidth="1.5" fill="none"/>
      <polyline points="0,120 40,80 80,120 120,80 160,120 200,80" stroke="rgba(201,169,98,0.3)" strokeWidth="1" fill="none"/>
    </svg>,
  ];
  return patterns[index % patterns.length];
};

function ModuleThumb({ module, size = 'sm' }) {
  const dim = size === 'lg' ? 'w-14 h-14' : 'w-10 h-10';
  return (
    <div
      className={`${dim} rounded-xl overflow-hidden flex-shrink-0 relative border border-[rgba(201,169,98,0.3)]`}
      style={{ background: CARD_GRADIENTS[module.gradient_index % CARD_GRADIENTS.length] }}
    >
      {module.image_url ? (
        <img src={module.image_url} alt={module.name} loading="lazy" decoding="async" className="w-full h-full object-cover object-top" />
      ) : (
        <PatternOverlay index={module.gradient_index} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.4)] to-transparent" />
    </div>
  );
}

export default function Lifestyle() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [showAddRoutineModal, setShowAddRoutineModal] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [deletingModule, setDeletingModule] = useState(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const selectedModule = modules.find(m => m.id === selectedModuleId) || null;

  const loadModules = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: existingModules } = await supabase
        .from('lifestyle_modules')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order');

      let mods = existingModules || [];

      if (mods.length === 0) {
        const gender = userProfile?.gender;
        if (gender) {
          await seedLifestyleRoutines(user.id, gender);
        }
        const { data: seeded } = await supabase
          .from('lifestyle_modules')
          .select('*')
          .eq('user_id', user.id)
          .order('sort_order');
        mods = seeded || [];
      }

      const { data: allRoutines } = await supabase
        .from('lifestyle_routines')
        .select('*, steps:lifestyle_steps(id, title, sort_order)')
        .eq('user_id', user.id)
        .order('sort_order')
        .order('sort_order', { referencedTable: 'lifestyle_steps' });

      const routinesByModule = {};
      (allRoutines || []).forEach(r => {
        if (!routinesByModule[r.module_id]) routinesByModule[r.module_id] = [];
        routinesByModule[r.module_id].push(r);
      });

      mods = mods.map(m => ({ ...m, routines: routinesByModule[m.id] || [] }));
      setModules(mods);
    } finally {
      setLoading(false);
    }
  }, [user, userProfile]);

  useEffect(() => { loadModules(); }, [loadModules]);

  const handleBack = () => {
    if (selectedModuleId) {
      setSelectedModuleId(null);
    } else {
      navigate(-1);
    }
  };

  const handleModuleAdded = (newModule) => {
    setModules(prev => [...prev, newModule]);
  };

  const handleRoutineSaved = (savedRoutine, isEdit) => {
    setModules(prev => prev.map(mod => {
      if (mod.id !== selectedModuleId) return mod;
      if (isEdit) {
        return { ...mod, routines: mod.routines.map(r => r.id === savedRoutine.id ? savedRoutine : r) };
      }
      return { ...mod, routines: [...mod.routines, savedRoutine] };
    }));
  };

  const handleDeleteRoutine = async (routineId) => {
    const routine = selectedModule?.routines?.find(r => r.id === routineId);
    if (!routine || routine.is_curated) return;
    await supabase.from('lifestyle_routines').delete().eq('id', routineId).eq('is_curated', false);
    setModules(prev => prev.map(mod => {
      if (mod.id !== selectedModuleId) return mod;
      return { ...mod, routines: mod.routines.filter(r => r.id !== routineId) };
    }));
  };

  const handleDeleteStep = async (routineId, stepId) => {
    await supabase.from('lifestyle_steps').delete().eq('id', stepId);
    setModules(prev => prev.map(mod => {
      if (mod.id !== selectedModuleId) return mod;
      return {
        ...mod,
        routines: mod.routines.map(r => {
          if (r.id !== routineId) return r;
          return { ...r, steps: (r.steps || []).filter(s => s.id !== stepId) };
        }),
      };
    }));
  };

  const openEditRoutine = (routine) => {
    setEditingRoutine(routine);
    setShowAddRoutineModal(true);
  };

  const handleFabClick = () => {
    if (selectedModuleId) {
      setEditingRoutine(null);
      setShowAddRoutineModal(true);
    } else {
      setShowAddModuleModal(true);
    }
  };

  const handleConfirmDeleteModule = async () => {
    if (!deletingModule) return;
    setDeleteInProgress(true);
    try {
      await supabase.from('lifestyle_modules').delete().eq('id', deletingModule.id);
      setModules(prev => prev.filter(m => m.id !== deletingModule.id));
      if (selectedModuleId === deletingModule.id) setSelectedModuleId(null);
      setDeletingModule(null);
    } finally {
      setDeleteInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full pb-8 bg-[#000000]">
        <div className="border-b-2 border-[rgba(201,169,98,0.25)] page-safe-x py-5 relative">
          <button onClick={handleBack} className="absolute left-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity">
            <ChevronLeft className="w-6 h-6 text-[#C9A962]" strokeWidth={1.5} />
          </button>
          <div className="w-full text-center">
            <h1 className="text-3xl text-[#C9A962] font-light tracking-wide">Lifestyle</h1>
          </div>
        </div>
        <div className="page-safe-x pt-5 pb-28">
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-[#000000] animate-pulse border border-[rgba(201,169,98,0.1)]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full pb-8 bg-[#000000]">
      <div className="relative border-b-2 border-[rgba(201,169,98,0.25)] page-safe-x py-5">
        <button onClick={handleBack} className="absolute left-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity">
          <ChevronLeft className="w-6 h-6 text-[#C9A962]" strokeWidth={1.5} />
        </button>
        <div className="w-full text-center">
          <h1 className="text-3xl text-[#C9A962] font-light tracking-wide">
            {selectedModule ? selectedModule.name : 'Lifestyle'}
          </h1>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedModuleId && (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="page-safe-x pt-5 pb-28"
          >
            <div className="grid grid-cols-2 gap-3">
              {modules.map((module, idx) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => setSelectedModuleId(module.id)}
                  className="relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 aspect-square border border-[rgba(201,169,98,0.35)]"
                >
                  {module.image_url ? (
                    <>
                      <img src={module.image_url} alt={module.name} loading="lazy" decoding="async" className="w-full h-full object-cover object-top" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    </>
                  ) : (
                    <>
                      <div style={{ background: CARD_GRADIENTS[module.gradient_index % CARD_GRADIENTS.length] }} className="absolute inset-0" />
                      <PatternOverlay index={module.gradient_index} />
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.82)] via-[rgba(0,0,0,0.25)] to-[rgba(0,0,0,0.1)]" />
                    </>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-6">
                    <p className="text-sm text-[#F5F1E8] font-light tracking-wide">{module.name}</p>
                    <p className="text-xs text-[#B8B8B8] mt-0.5">{(module.routines || []).length} {(module.routines || []).length === 1 ? 'routine' : 'routines'}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {selectedModuleId && selectedModule && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="page-safe-x pb-24"
          >
            <div className="mt-4 mb-5 flex items-center gap-3 p-3 rounded-2xl border border-[rgba(201,169,98,0.2)] bg-gradient-to-r from-[rgba(37,37,37,0.6)] to-[rgba(26,26,26,0.4)]">
              <ModuleThumb module={selectedModule} size="lg" />
              <div className="flex-1 min-w-0">
                <p className="text-[#F5F1E8] text-base font-light">{selectedModule.name}</p>
                <p className="text-[#B8B8B8] text-xs mt-0.5">
                  {(selectedModule.routines || []).length} {(selectedModule.routines || []).length === 1 ? 'routine' : 'routines'}
                </p>
              </div>
              {!selectedModule.is_default && (
                <button
                  onClick={() => setDeletingModule(selectedModule)}
                  className="w-8 h-8 rounded-xl bg-[rgba(255,80,80,0.06)] border border-[rgba(255,80,80,0.15)] flex items-center justify-center text-red-400 hover:bg-[rgba(255,80,80,0.12)] hover:border-[rgba(255,80,80,0.3)] transition-all flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              )}
            </div>

            {(selectedModule.routines || []).length === 0 ? (
              <div className="text-center py-16 border border-dashed border-[rgba(201,169,98,0.2)] rounded-2xl">
                <div className="text-3xl mb-3 opacity-30">✦</div>
                <p className="text-sm text-[#6B6B6B]">No routines yet</p>
                <p className="text-xs text-[#4B4B4B] mt-1">Tap + to add your first routine</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(selectedModule.routines || []).map((routine, idx) => (
                  <motion.div
                    key={routine.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-gradient-to-br from-[rgba(37,37,37,0.9)] to-[rgba(26,26,26,0.7)] rounded-2xl border border-[rgba(201,169,98,0.25)] overflow-hidden"
                  >
                    <div className="px-4 pt-4 pb-3">
                      <div className="flex items-start gap-3 mb-2">
                        <ModuleThumb module={selectedModule} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm text-[#F5F1E8] font-light flex-1 leading-snug">{routine.name}</h4>
                            {!routine.is_curated && (
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <button
                                  onClick={() => openEditRoutine(routine)}
                                  className="w-7 h-7 rounded-lg bg-[rgba(201,169,98,0.08)] border border-[rgba(201,169,98,0.2)] flex items-center justify-center text-[#C9A962] hover:bg-[rgba(201,169,98,0.15)] transition-colors"
                                >
                                  <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                                </button>
                                <button
                                  onClick={() => handleDeleteRoutine(routine.id)}
                                  className="w-7 h-7 rounded-lg bg-[rgba(255,80,80,0.06)] border border-[rgba(255,80,80,0.15)] flex items-center justify-center text-red-400 hover:bg-[rgba(255,80,80,0.12)] transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {routine.cycle && (
                              <span className="text-[10px] text-[#C9A962] bg-[rgba(201,169,98,0.12)] px-2 py-0.5 rounded-full border border-[rgba(201,169,98,0.2)]">
                                {routine.cycle}
                              </span>
                            )}
                            {routine.duration_minutes != null && (
                              <span className="text-[10px] text-[#B8B8B8] bg-[rgba(255,255,255,0.05)] px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Timer className="w-2.5 h-2.5" strokeWidth={1.5} />
                                {routine.duration_minutes}m
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {(routine.steps || []).length > 0 && (
                        <div className="space-y-1.5 mt-3 ml-13 pl-0.5">
                          {(routine.steps || []).map((step, stepIdx) => (
                            <div key={step.id} className="flex items-center gap-2.5 group">
                              <div className="flex-shrink-0 w-5 h-5 rounded-full border border-[rgba(201,169,98,0.35)] flex items-center justify-center">
                                <span className="text-[9px] text-[#C9A962]">{stepIdx + 1}</span>
                              </div>
                              <div className="flex-1 h-px bg-[rgba(201,169,98,0.1)]" />
                              <span className="text-xs text-[#B8B8B8] font-light flex-shrink-0 max-w-[55%] text-right">{step.title}</span>
                              {!routine.is_curated && (
                                <button
                                  onClick={() => handleDeleteStep(routine.id, step.id)}
                                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#4B4B4B] hover:text-red-400"
                                >
                                  <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-[rgba(201,169,98,0.3)] to-transparent" />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleFabClick}
        className="fixed right-6 w-14 h-14 bg-[#C9A962] rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-110 z-[55]"
        style={{ bottom: 'calc(7.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <Plus className="w-6 h-6 text-white" strokeWidth={2} />
      </button>

      <AddModuleModal
        visible={showAddModuleModal}
        onClose={() => setShowAddModuleModal(false)}
        onAdd={handleModuleAdded}
      />

      <AddRoutineModal
        visible={showAddRoutineModal}
        onClose={() => { setShowAddRoutineModal(false); setEditingRoutine(null); }}
        onSaved={handleRoutineSaved}
        moduleId={selectedModuleId}
        editingRoutine={editingRoutine}
      />

      <DeleteModuleModal
        visible={!!deletingModule}
        moduleName={deletingModule?.name || ''}
        onConfirm={handleConfirmDeleteModule}
        onCancel={() => setDeletingModule(null)}
        deleting={deleteInProgress}
      />
    </div>
  );
}
