//src/pages/ContentPlanner.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { supabase } from '../lib/supabase';
import { format, parseISO } from 'date-fns';
import { Plus, Instagram, Youtube, Twitter, Pencil, FileText, Calendar, Trash2, ArrowLeft, CreditCard as Edit2, Sparkles, Filter, Search, MoreVertical, CheckCircle2, X, SlidersHorizontal, Inbox, CalendarClock, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import DatePicker from '../components/ui/DatePicker';
import CustomSelect from '../components/ui/CustomSelect';

export default function ContentPlanner() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const GOLD = '#C9A962';
  const ui = useMemo(
    () => ({
      gold: GOLD,
      bg: 'var(--app-bg)',
      panel: 'var(--app-bg)',
      panel2: 'var(--app-bg)',
      text: 'var(--app-text)',
      muted: 'var(--app-text-2)',
      muted2: 'var(--app-text-3)',
      border: 'rgba(201,169,98,0.30)',
      borderSoft: 'rgba(201,169,98,0.18)',
      borderSofter: 'rgba(201,169,98,0.10)',
      wash: 'rgba(201,169,98,0.06)',
      wash2: 'rgba(201,169,98,0.10)'
    }),
    []
  );

  const { openModal, closeModal } = useModal();
  const [showAddContent, setShowAddContent] = useState(false);
  const [editingContent, setEditingContent] = useState(null);

  const isModalOpen = showAddContent || !!editingContent;
  useEffect(() => {
    if (isModalOpen) {
      openModal();
      return () => closeModal();
    }
  }, [isModalOpen, openModal, closeModal]);

  const [viewMode, setViewMode] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const queryClient = useQueryClient();

  const [contentData, setContentData] = useState({
    title: '',
    description: '',
    platform: '',
    status: 'idea',
    scheduled_date: '',
    tags: [],
  });

  const { data: contentIdeas = [] } = useQuery({
    queryKey: ['contentIdeas', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_ideas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const platformIcons = {
    instagram: { icon: Instagram, color: 'var(--app-gold)', label: 'Instagram' },
    tiktok: { icon: FileText, color: '#8B7892', label: 'TikTok' },
    youtube: { icon: Youtube, color: '#E89B6C', label: 'YouTube' },
    twitter: { icon: Twitter, color: '#7BA3D4', label: 'Twitter' },
    blog: { icon: Pencil, color: '#B5D4C3', label: 'Blog' },
  };

  const statusColors = {
    idea: { color: '#D9CAB3', label: 'Idea' },
    'in-progress': { color: '#7BA3D4', label: 'In Progress' },
    ready: { color: '#B5D4C3', label: 'Ready' },
  };

  const inspirationalPrompts = [
    "What did you talk about today that people ask you about?",
    "What content performed well this week?",
    "What do you want to film but haven't yet?",
    "What's a question you get asked all the time?",
    "What's trending that you have a unique take on?",
  ];

  const filteredByView = (contentIdeas || []).filter(item => {
    if (viewMode === 'inbox') return !item.scheduled_date && item.status !== 'published';
    if (viewMode === 'planned') return item.scheduled_date && item.status !== 'published';
    if (viewMode === 'posted') return item.status === 'published';
    return true;
  });

  const filteredBySearch = filteredByView.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return item.title?.toLowerCase().includes(query) ||
           item.notes?.toLowerCase().includes(query);
  });

  const sortedContent = [...filteredBySearch].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    if (sortBy === 'oldest') return new Date(a.created_at || 0) - new Date(b.created_at || 0);
    if (sortBy === 'scheduled') {
      if (!a.scheduled_date) return 1;
      if (!b.scheduled_date) return -1;
      return new Date(a.scheduled_date) - new Date(b.scheduled_date);
    }
    return 0;
  });

  const createContentMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        title: data.title,
        platform: data.platform || null,
        status: data.status || 'idea',
        scheduled_date: data.scheduled_date || null,
        notes: data.description || null,
        user_id: user.id,
      };
      if (editingContent) {
        const { error } = await supabase
          .from('content_ideas')
          .update(payload)
          .eq('id', editingContent.id)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('content_ideas')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentIdeas', user?.id] });
      setShowAddContent(false);
      setEditingContent(null);
      resetForm();
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('content_ideas')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentIdeas', user?.id] });
    },
  });

  const resetForm = () => {
    setContentData({
      title: '',
      description: '',
      platform: '',
      status: 'idea',
      scheduled_date: '',
      tags: [],
    });
    setDatePickerOpen(false);
  };

  const handleEditContent = (content) => {
    setEditingContent(content);
    setContentData({
      title: content.title || '',
      description: content.notes || '',
      platform: content.platform || '',
      status: content.status || 'idea',
      scheduled_date: content.scheduled_date || '',
      tags: [],
    });
    setShowAddContent(true);
  };

  const markAsPosted = async (id) => {
    const { error } = await supabase
      .from('content_ideas')
      .update({ status: 'published' })
      .eq('id', id)
      .eq('user_id', user.id);
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['contentIdeas', user?.id] });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilterDropdown && !event.target.closest('.filter-dropdown-container')) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterDropdown]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="relative border-b-2 border-[rgba(201,169,98,0.25)] page-safe-x py-6">
        <button onClick={() => navigate(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity">
          <ChevronLeft className="w-6 h-6 text-[color:var(--app-gold)]" strokeWidth={1.5} />
        </button>
        <div className="w-full text-center">
          <h1 className="text-3xl text-[color:var(--app-gold)] font-light tracking-wide">Content Planner</h1>
        </div>
      </div>

      <div className="page-safe-x pt-4 pb-4 space-y-4">
        {/* View Toggle */}
        <div className="w-full flex rounded-xl gap-2">
          <button
            onClick={() => setViewMode('inbox')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2 text-sm rounded-lg transition-all font-light"
            style={{
              backgroundColor: viewMode === 'inbox' ? ui.wash2 : 'transparent',
              color: viewMode === 'inbox' ? ui.gold : ui.muted,
              border: viewMode === 'inbox' ? `1px solid ${ui.border}` : '1px solid transparent'
            }}
          >
            <Inbox className="w-4 h-4" strokeWidth={1.5} />
            <span>Inbox</span>
          </button>
          <button
            onClick={() => setViewMode('planned')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2 text-sm rounded-lg transition-all font-light"
            style={{
              backgroundColor: viewMode === 'planned' ? ui.wash2 : 'transparent',
              color: viewMode === 'planned' ? ui.gold : ui.muted,
              border: viewMode === 'planned' ? `1px solid ${ui.border}` : '1px solid transparent'
            }}
          >
            <CalendarClock className="w-4 h-4" strokeWidth={1.5} />
            <span>Planned</span>
          </button>
          <button
            onClick={() => setViewMode('posted')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2 text-sm rounded-lg transition-all font-light"
            style={{
              backgroundColor: viewMode === 'posted' ? ui.wash2 : 'transparent',
              color: viewMode === 'posted' ? ui.gold : ui.muted,
              border: viewMode === 'posted' ? `1px solid ${ui.border}` : '1px solid transparent'
            }}
          >
            <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
            <span>Posted</span>
          </button>
        </div>

        {/* Search + Filter */}
        <div className="relative filter-dropdown-container">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: ui.muted }} strokeWidth={1.5} />
            <input
              placeholder="Search ideas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-12 py-3 rounded-xl focus:outline-none"
              style={{
                backgroundColor: ui.panel,
                border: `1px solid ${ui.border}`,
                color: ui.text
              }}
            />
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:scale-110"
              style={{ color: 'var(--app-gold)' }}
            >
              <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* Filter Dropdown */}
          {showFilterDropdown && (
            <div
              className="absolute top-full right-0 mt-2 rounded-xl shadow-lg border z-50 min-w-[200px]"
              style={{
                backgroundColor: ui.panel2,
                borderColor: ui.border
              }}
            >
              <div className="p-2">
                <button
                  onClick={() => {
                    setSortBy('newest');
                    setShowFilterDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 rounded-lg transition-colors"
                  style={{
                    color: sortBy === 'newest' ? ui.gold : ui.text,
                    backgroundColor: sortBy === 'newest' ? ui.wash2 : 'transparent'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = ui.wash}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = sortBy === 'newest' ? ui.wash2 : 'transparent'}
                >
                  Newest First
                </button>
                <button
                  onClick={() => {
                    setSortBy('oldest');
                    setShowFilterDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 rounded-lg transition-colors"
                  style={{
                    color: sortBy === 'oldest' ? ui.gold : ui.text,
                    backgroundColor: sortBy === 'oldest' ? ui.wash2 : 'transparent'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = ui.wash}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = sortBy === 'oldest' ? ui.wash2 : 'transparent'}
                >
                  Oldest First
                </button>
                <button
                  onClick={() => {
                    setSortBy('scheduled');
                    setShowFilterDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 rounded-lg transition-colors"
                  style={{
                    color: sortBy === 'scheduled' ? ui.gold : ui.text,
                    backgroundColor: sortBy === 'scheduled' ? ui.wash2 : 'transparent'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = ui.wash}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = sortBy === 'scheduled' ? ui.wash2 : 'transparent'}
                >
                  By Scheduled Date
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content Ideas List */}
        <div className="space-y-3 pb-8">
          {sortedContent?.length === 0 ? (
            <div className="p-12 text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(201,169,98,0.20)' }} strokeWidth={1.5} />
              <div className="text-sm mb-2 font-light" style={{ color: ui.muted }}>
                Start capturing ideas
              </div>
              <div className="text-xs font-light" style={{ color: ui.muted2 }}>
                {inspirationalPrompts[Math.floor(Math.random() * inspirationalPrompts.length)]}
              </div>
            </div>
          ) : (
            sortedContent?.map((content, idx) => {
              const platform = content.platform && platformIcons[content.platform];

              return (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <div
                    onClick={() => handleEditContent(content)}
                    className="p-4 cursor-pointer transition-all"
                  >
                    <div className="flex items-start gap-3">
                      {platform && (
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            border: `1.5px solid ${platform.color}30`,
                            backgroundColor: `${platform.color}08`
                          }}
                        >
                          <platform.icon className="w-5 h-5" style={{ color: platform.color }} strokeWidth={1.5} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-light text-base mb-1" style={{ color: ui.text }}>
                          {content.title}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-light" style={{ color: ui.muted }}>
                          {platform && <span>{platform.label}</span>}
                          <span>•</span>
                          <span>{viewMode === 'inbox' ? 'Inbox' : viewMode === 'planned' ? 'Planned' : 'Posted'}</span>
                          {content.scheduled_date && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" strokeWidth={1.5} />
                                {format(parseISO(content.scheduled_date), 'MMM d')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Delete this idea?')) {
                            deleteContentMutation.mutate(content.id);
                          }
                        }}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: ui.muted }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#F87171'}
                        onMouseLeave={(e) => e.currentTarget.style.color = ui.muted}
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* FAB - Add Button */}
      <button
        onClick={() => {
          resetForm();
          setEditingContent(null);
          setShowAddContent(true);
        }}
        className="fixed right-6 w-14 h-14 bg-[#C9A962] rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-110 z-[35]"
        style={{ bottom: 'calc(7.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <Plus className="w-6 h-6 text-white" strokeWidth={2} />
      </button>

      {/* Add/Edit Content Modal */}
      {showAddContent && (
        <div
          className="fixed inset-0 z-[100] flex items-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
          onClick={() => {
            setShowAddContent(false);
            setEditingContent(null);
            resetForm();
          }}
        >
          <div
            className={`w-full rounded-t-3xl p-6 max-h-[80vh] ${datePickerOpen ? 'overflow-y-hidden' : 'overflow-y-auto'} scrollbar-hide border-t-2 relative`}
            style={{
              backgroundColor: ui.panel2,
              borderColor: ui.border
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowAddContent(false);
                setEditingContent(null);
                resetForm();
              }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = ui.panel}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <X className="w-5 h-5" style={{ color: 'var(--app-gold)' }} />
            </button>

            <h2 className="text-xl font-light mb-6" style={{ color: 'var(--app-gold)' }}>
              {editingContent ? 'Edit Idea' : 'New Idea'}
            </h2>

            <div className="space-y-4 pb-32">
              <div>
                <label className="text-xs uppercase mb-2 block font-light" style={{ color: ui.muted }}>
                  Title
                </label>
                <input
                  placeholder="e.g., Morning routine vlog"
                  value={contentData.title}
                  onChange={(e) => setContentData({ ...contentData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none"
                  style={{
                    backgroundColor: ui.panel,
                    border: `1px solid ${ui.border}`,
                    color: ui.text
                  }}
                />
              </div>

              <details className="group">
                <summary className="text-sm font-light cursor-pointer mb-3" style={{ color: ui.muted }}>
                  More details
                </summary>
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-xs uppercase mb-2 block font-light" style={{ color: ui.muted }}>
                      Notes
                    </label>
                    <textarea
                      placeholder="Quick thoughts, caption ideas..."
                      value={contentData.description}
                      onChange={(e) => setContentData({ ...contentData, description: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl focus:outline-none resize-none min-h-[80px]"
                      style={{
                        backgroundColor: ui.panel,
                        border: `1px solid ${ui.border}`,
                        color: ui.text
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs uppercase mb-2 block font-light" style={{ color: ui.muted }}>
                        Platform
                      </label>
                      <CustomSelect
                        value={contentData.platform}
                        onChange={(val) => setContentData({ ...contentData, platform: val })}
                        options={[
                          { value: 'instagram', label: 'Instagram' },
                          { value: 'tiktok', label: 'TikTok' },
                          { value: 'youtube', label: 'YouTube' },
                          { value: 'twitter', label: 'Twitter' },
                          { value: 'blog', label: 'Blog' },
                        ]}
                        placeholder="Select..."
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase mb-2 block font-light" style={{ color: ui.muted }}>
                        Priority
                      </label>
                      <CustomSelect
                        value={contentData.priority || 'medium'}
                        onChange={(val) => setContentData({ ...contentData, priority: val })}
                        options={[
                          { value: 'low', label: 'Low' },
                          { value: 'medium', label: 'Medium' },
                          { value: 'high', label: 'High' },
                        ]}
                      />
                    </div>
                  </div>
                  <div className="pb-64">
                    <label className="text-xs uppercase mb-2 block font-light" style={{ color: ui.muted }}>
                      Scheduled Date
                    </label>
                    <DatePicker
                      value={contentData.scheduled_date}
                      onChange={(date) => setContentData({ ...contentData, scheduled_date: date })}
                      placeholder="Select scheduled date"
                      onOpenChange={setDatePickerOpen}
                    />
                  </div>
                </div>
              </details>

              <div className="pt-2">
                <button
                  onClick={() => createContentMutation.mutate(contentData)}
                  disabled={!contentData.title || createContentMutation.isPending}
                  className="w-full py-3 rounded-xl text-sm text-white font-light transition-all active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, ${ui.gold} 0%, ${ui.gold} 100%)`,
                    opacity: !contentData.title ? 0.5 : 1
                  }}
                >
                  {createContentMutation.isPending ? 'Saving...' : editingContent ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
