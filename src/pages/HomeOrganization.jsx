import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Plus, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import CreateModal from './homeorganization/components/Create';
import ViewCategoryModal from './homeorganization/components/ViewCategoryModal';
import { homeOrgImages, homeOrgImagesById } from '../data/homeOrgImages';

const CATEGORY_META = {
  'daily-reset-adhd':          { name: 'Daily Reset (ADHD Quick Wins)',  color: '#F59E0B' },
  'weekly-cleaning':           { name: 'Weekly Cleaning',                color: '#3B82F6' },
  'monthly-deep-clean':        { name: 'Monthly Deep Clean',             color: '#EF4444' },
  'seasonal-reset':            { name: 'Seasonal Reset',                 color: '#10B981' },
  'kitchen-organization':      { name: 'Kitchen Organization',           color: '#F59E0B' },
  'pantry-organization':       { name: 'Pantry Organization',            color: '#8B5CF6' },
  'refrigerator-freezer':      { name: 'Refrigerator & Freezer',         color: '#06B6D4' },
  'bedroom-organization':      { name: 'Bedroom Organization',           color: '#EC4899' },
  'closet-organization':       { name: 'Closet Organization',            color: '#3B82F6' },
  'bathroom-organization':     { name: 'Bathroom Organization',          color: '#14B8A6' },
  'linen-closet':              { name: 'Linen Closet',                   color: '#A855F7' },
  'laundry-room':              { name: 'Laundry Room',                   color: '#0EA5E9' },
  'living-room-common-areas':  { name: 'Living Room / Common Areas',     color: '#F97316' },
  'entryway-mudroom':          { name: 'Entryway / Mudroom',             color: '#84CC16' },
  'home-office-desk':          { name: 'Home Office / Desk',             color: '#6366F1' },
  'storage-areas':             { name: 'Storage Areas',                  color: '#78716C' },
  'garage':                    { name: 'Garage',                         color: '#0D9488' },
  'under-bed-hidden-storage':  { name: 'Under-Bed / Hidden Storage',     color: '#E11D48' },
  'digital-home-organization': { name: 'Digital Home Organization',      color: '#6366F1' },
  'decluttering-donation-prep':{ name: 'Decluttering & Donation Prep',   color: '#10B981' },
  'moving-reset-checklist':    { name: 'Moving / Reset Checklist',       color: '#F59E0B' },
};

const CATEGORY_ORDER = Object.keys(CATEGORY_META);

export default function HomeOrganization() {
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [createDefaultSection, setCreateDefaultSection] = useState('daily-reset-adhd');
  const [viewingCategory, setViewingCategory] = useState(null);
  const queryClient = useQueryClient();

  const { data: orgTasks = [] } = useQuery({
    queryKey: ['organizationTasks'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('organization_tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('organization_tasks')
        .insert({ ...taskData, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organizationTasks'] }),
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('organization_tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['organizationTasks'] });
      const previous = queryClient.getQueryData(['organizationTasks']);
      queryClient.setQueryData(['organizationTasks'], (old = []) =>
        old.map(t => t.id === id ? { ...t, ...updates } : t)
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['organizationTasks'], ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['organizationTasks'] }),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('organization_tasks')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['organizationTasks'] });
      const previous = queryClient.getQueryData(['organizationTasks']);
      queryClient.setQueryData(['organizationTasks'], (old = []) => old.filter(t => t.id !== id));
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['organizationTasks'], ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['organizationTasks'] }),
  });

  const handleCreate = ({ icon, title, section, sub_tasks, color_tag }) => {
    createTaskMutation.mutate({ icon, title, section, sub_tasks, color_tag, is_curated: false });
  };

  const handleToggleComplete = (task) => {
    updateTaskMutation.mutate({
      id: task.id,
      updates: {
        completed: !task.completed,
        last_completed: !task.completed ? new Date().toISOString().split('T')[0] : task.last_completed,
      },
    });
  };

  const handleDelete = (task) => {
    deleteTaskMutation.mutate(task.id);
  };

  const tasksBySection = useMemo(() => {
    return orgTasks.reduce((acc, task) => {
      const key = task.section;
      if (!acc[key]) acc[key] = [];
      const meta = CATEGORY_META[key];
      if (meta && task.title === meta.name) return acc;
      acc[key].push(task);
      return acc;
    }, {});
  }, [orgTasks]);

  const activeSections = useMemo(() => {
    const allSectionIds = new Set(Object.keys(tasksBySection));
    const ordered = CATEGORY_ORDER.filter(id => allSectionIds.has(id));
    const remaining = [...allSectionIds].filter(id => !CATEGORY_META[id]);

    return [...ordered, ...remaining].map(sectionId => {
      const meta = CATEGORY_META[sectionId];
      const title = meta ? meta.name : sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
      return {
        id: sectionId,
        title,
        color_tag: meta ? meta.color : '#C9A962',
        image_url: homeOrgImagesById[sectionId] || homeOrgImages[title] || null,
      };
    });
  }, [tasksBySection]);

  return (
    <div className="w-full min-h-screen bg-[#000000] overflow-hidden">
      <div className="min-h-screen" style={{ paddingBottom: 'calc(8rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="relative border-b-2 border-[rgba(201,169,98,0.25)] page-safe-x py-6">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6 text-[#C9A962]" strokeWidth={1.5} />
          </button>
          <div className="w-full text-center">
            <h1 className="text-3xl text-[#C9A962] font-light tracking-wide">Home Organization</h1>
          </div>
        </div>

        <div className="px-4 pt-6 pb-24">
          {activeSections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Home className="w-16 h-16 text-[#C9A962] opacity-30 mb-4" strokeWidth={1} />
              <p className="text-[#B8B8B8] font-light text-base mb-1">Setting up your home organization...</p>
              <p className="text-[#6B6B6B] text-sm font-light">Your 21 categories are being loaded</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeSections.map((section, idx) => {
                const sectionTasks = tasksBySection[section.id] || [];
                const completed = sectionTasks.filter(t => t.completed).length;
                const total = sectionTasks.length;

                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => setViewingCategory(section)}
                    className="flex items-center gap-4 p-4 rounded-xl cursor-pointer hover:opacity-90 active:scale-[0.99] transition-all duration-200"
                    style={{
                      backgroundColor: '#000000',
                      border: '1px solid rgba(201,169,98,0.2)',
                    }}
                  >
                    <div
                      className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
                      style={{ backgroundColor: section.image_url ? 'transparent' : `${section.color_tag}33` }}
                    >
                      {section.image_url ? (
                        <img
                          src={section.image_url}
                          alt={section.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{ background: `linear-gradient(135deg, ${section.color_tag}55 0%, ${section.color_tag}22 100%)` }}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-[#C9A962] font-light text-base leading-snug mb-1 truncate"
                        style={{ fontFamily: 'Cormorant Garamond, serif' }}
                      >
                        {section.title}
                      </h3>
                      <p className="text-white/40 text-sm">
                        {completed}/{total} completed
                      </p>
                    </div>

                    <ChevronRight className="w-5 h-5 text-[#C9A962] opacity-40 flex-shrink-0" />
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => { setCreateDefaultSection('daily-reset-adhd'); setShowCreate(true); }}
        className="fixed right-6 w-14 h-14 bg-gradient-to-br from-[#D4B978] to-[#C9A962] rounded-full shadow-[0_0_12px_rgba(201,169,98,0.3),0_4px_10px_rgba(0,0,0,0.25)] hover:shadow-[0_0_16px_rgba(201,169,98,0.4),0_4px_12px_rgba(0,0,0,0.3)] flex items-center justify-center transition-all hover:scale-105 z-[55]"
        style={{ bottom: 'calc(7.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <Plus className="w-6 h-6 text-white" strokeWidth={2} />
      </button>

      <CreateModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onAdd={handleCreate}
        defaultSection={createDefaultSection}
      />

      <ViewCategoryModal
        visible={!!viewingCategory}
        onClose={() => setViewingCategory(null)}
        section={viewingCategory}
        tasks={viewingCategory ? (tasksBySection[viewingCategory.id] || []) : []}
        onToggleComplete={handleToggleComplete}
        onDelete={handleDelete}
        onCreateTask={({ title, color_tag, section }) => {
          const meta = CATEGORY_META[section];
          createTaskMutation.mutate({
            icon: meta ? meta.icon : 'Home',
            title,
            section,
            sub_tasks: [],
            color_tag,
            is_curated: false,
          });
        }}
      />
    </div>
  );
}
