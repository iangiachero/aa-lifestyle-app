import React, { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Camera, ChevronRight, ChevronLeft, LogOut, X, User, Check, Sparkles, Calendar, Heart, GraduationCap, Briefcase, Sun, Clock, Moon, Download, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resetAndReseedLifestyle } from '../lib/seedLifestyleRoutines';
import { useTheme } from '../hooks/useTheme';

const FOCUS_LABELS = {
  organize: { label: 'Organize', Icon: Sparkles },
  routine: { label: 'Routine', Icon: Calendar },
  lifestyle: { label: 'Lifestyle', Icon: Heart },
  academic: { label: 'Academic', Icon: GraduationCap },
  business: { label: 'Business', Icon: Briefcase },
};

const SCHEDULE_LABELS = {
  early_bird: { label: 'Early Bird', desc: '5am – 9pm', Icon: Sun },
  standard: { label: 'Standard', desc: '7am – 11pm', Icon: Clock },
  night_owl: { label: 'Night Owl', desc: '10am – 2am', Icon: Moon },
};

export default function Profile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const { user, userProfile, signOut, refreshUserProfile } = useAuth();
  const { theme, setTheme } = useTheme();

  const [formData, setFormData] = useState({
    full_name: userProfile?.full_name || '',
    gender: userProfile?.gender || '',
    focus: userProfile?.focus || '',
    schedule_type: userProfile?.schedule_type || '',
    timezone: userProfile?.timezone || '',
    is_student: userProfile?.is_student ?? false,
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null);

  React.useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || '',
        gender: userProfile.gender || '',
        focus: userProfile.focus || '',
        schedule_type: userProfile.schedule_type || '',
        timezone: userProfile.timezone || '',
        is_student: userProfile.is_student ?? false,
      });
    }
  }, [userProfile]);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user || uploading) return;
    setSaving(true);
    const previousGender = userProfile?.gender || '';
    const newGender = formData.gender || '';
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          gender: formData.gender || null,
          focus: formData.focus || null,
          schedule_type: formData.schedule_type || null,
          timezone: formData.timezone || null,
          is_student: formData.is_student,
        })
        .eq('user_id', user.id);
      if (!error) {
        if (newGender && newGender.toLowerCase() !== previousGender.toLowerCase()) {
          await resetAndReseedLifestyle(user.id, newGender);
        }
        await refreshUserProfile();
        queryClient.invalidateQueries(['userProfile']);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5242880) { setUploadError('File size must be less than 5MB'); return; }
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
      setUploadError('Only JPEG, PNG, or WebP images are allowed.'); return;
    }
    setUploadError('');
    setUploading(true);
    setUploadProgress(10);

    try {
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar_${timestamp}.${fileExt}`;

      if (userProfile?.pfp_url) {
        const urlWithoutQuery = userProfile.pfp_url.split('?')[0];
        const oldPath = urlWithoutQuery.split('/public_user_pfp/')[1];
        if (oldPath) await supabase.storage.from('public_user_pfp').remove([oldPath]);
      }

      setUploadProgress(30);

      const { error: uploadError } = await supabase.storage
        .from('public_user_pfp')
        .upload(fileName, file, { upsert: false });

      if (uploadError) { setUploadError('Upload failed. Please try again.'); setUploadProgress(0); return; }

      setUploadProgress(80);

      const { data: { publicUrl } } = supabase.storage.from('public_user_pfp').getPublicUrl(fileName);
      const cachedUrl = `${publicUrl}?t=${timestamp}`;

      const { error: updateError } = await supabase.from('users').update({ pfp_url: cachedUrl }).eq('user_id', user.id);
      if (updateError) { setUploadError('Could not save profile picture.'); return; }

      setUploadProgress(100);
      await refreshUserProfile();
      queryClient.invalidateQueries(['userProfile']);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 600);
    }
  };

  const handleRemovePicture = async () => {
    if (!userProfile?.pfp_url || uploading) return;
    setUploading(true);
    try {
      const urlWithoutQuery = userProfile.pfp_url.split('?')[0];
      const oldPath = urlWithoutQuery.split('/public_user_pfp/')[1];
      if (oldPath) await supabase.storage.from('public_user_pfp').remove([oldPath]);
      await supabase.from('users').update({ pfp_url: null }).eq('user_id', user.id);
      await refreshUserProfile();
      queryClient.invalidateQueries(['userProfile']);
    } finally {
      setUploading(false);
    }
  };

  const handleCheckUpdates = async () => {
    setUpdateStatus('checking');
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      }

      setUpdateStatus('clearing');

      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map(name => caches.delete(name)));
      }

      try { sessionStorage.clear(); } catch {}

      setUpdateStatus('updating');

      await new Promise(resolve => setTimeout(resolve, 600));

      const url = new URL(window.location.href);
      url.searchParams.set('v', Date.now().toString());
      window.location.replace(url.toString());
    } catch {
      setUpdateStatus(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    queryClient.clear();
    navigate('/login');
  };

  const pfpUrl = userProfile?.pfp_url;
  const inputClass = "w-full px-4 py-3 bg-[color:var(--app-bg)] border border-[rgba(201,169,98,0.3)] rounded-xl text-[color:var(--app-text)] placeholder-[#555] focus:outline-none focus:border-[#C9A962] transition-colors text-sm";
  const labelClass = "block text-xs uppercase tracking-widest text-[#8A7E72] mb-1.5";

  return (
    <div className="min-h-full pb-32 bg-[color:var(--app-bg)]">
      <div className="relative border-b-2 border-[rgba(201,169,98,0.2)] page-safe-x py-5 flex items-center">
        <button onClick={() => navigate(-1)} className="hover:opacity-70 transition-opacity">
          <ChevronLeft className="w-6 h-6 text-[color:var(--app-gold)]" strokeWidth={1.5} />
        </button>
        <h1 className="flex-1 text-center text-3xl text-[color:var(--app-gold)] font-light tracking-wide"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}>Profile</h1>
        <div className="w-6" />
      </div>

      <div className="page-safe-x py-6 max-w-lg mx-auto">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-3">
            <button onClick={() => !uploading && fileInputRef.current?.click()} disabled={uploading}
              className="relative w-28 h-28 rounded-full border-2 border-[#C9A962] overflow-hidden flex items-center justify-center group transition-all duration-200"
              style={{ background: 'var(--app-bg)', cursor: uploading ? 'not-allowed' : 'pointer' }}>
              {pfpUrl ? (
                <>
                  <img src={pfpUrl} alt="Profile" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                    <Camera className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <User className="w-10 h-10 text-[color:var(--app-gold)] mb-1" strokeWidth={1} />
                  <span className="text-xs text-[color:var(--app-gold)]">Add photo</span>
                </div>
              )}
            </button>
            {pfpUrl && !uploading && (
              <button onClick={handleRemovePicture}
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[rgba(0,0,0,0.95)] border border-[rgba(201,169,98,0.3)] flex items-center justify-center hover:border-red-400 hover:text-red-400 transition-all"
                style={{ color: 'var(--app-gold)' }}>
                <X size={12} />
              </button>
            )}
          </div>

          {uploading && (
            <div className="w-28 mb-2">
              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(201,169,98,0.2)' }}>
                <div className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%`, background: 'linear-gradient(90deg, #B8955A, #C9A962)' }} />
              </div>
              <p className="text-xs text-center mt-1" style={{ color: '#8A7E72' }}>Uploading...</p>
            </div>
          )}
          {uploadError && <p className="text-xs text-center mt-1" style={{ color: '#C0392B' }}>{uploadError}</p>}
          <button onClick={() => !uploading && fileInputRef.current?.click()} disabled={uploading}
            className="text-sm mt-1 transition-opacity hover:opacity-70"
            style={{ color: 'var(--app-gold)', fontFamily: "'Cormorant Garamond', serif", opacity: uploading ? 0.4 : 1 }}>
            {pfpUrl ? 'Change photo' : ''}
          </button>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/jpg,image/webp" onChange={handleFileChange} className="hidden" />
        </div>

        {/* Personal */}
        <div className="rounded-2xl p-5 mb-4 space-y-4" style={{ background: 'var(--app-bg)', border: '1px solid rgba(201,169,98,0.2)' }}>
          <h3 className="text-xs uppercase tracking-widest mb-3" style={{ color: '#8A7E72' }}>Personal</h3>
          <div>
            <label className={labelClass}>Full Name</label>
            <input type="text" value={formData.full_name} onChange={e => handleFieldChange('full_name', e.target.value)} placeholder="Your name" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" value={user?.email || ''} readOnly className={inputClass + ' opacity-50 cursor-not-allowed'} />
          </div>
          <div>
            <label className={labelClass}>Gender</label>
            <div className="flex gap-2">
              {['female', 'male'].map(g => (
                <button key={g} onClick={() => handleFieldChange('gender', g)}
                  className="flex-1 py-2.5 rounded-xl text-sm capitalize transition-all duration-200"
                  style={{
                    border: formData.gender === g ? '1.5px solid rgba(201,169,98,0.6)' : '1.5px solid rgba(201,169,98,0.2)',
                    background: formData.gender === g ? 'rgba(201,169,98,0.12)' : 'var(--app-bg)',
                    color: formData.gender === g ? '#C9A962' : '#8A7E72',
                  }}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>Student</label>
            <div className="flex gap-2">
              {[{ label: 'Yes', val: true }, { label: 'No', val: false }].map(({ label, val }) => (
                <button key={label} onClick={() => handleFieldChange('is_student', val)}
                  className="flex-1 py-2.5 rounded-xl text-sm transition-all duration-200"
                  style={{
                    border: formData.is_student === val ? '1.5px solid rgba(201,169,98,0.6)' : '1.5px solid rgba(201,169,98,0.2)',
                    background: formData.is_student === val ? 'rgba(201,169,98,0.12)' : 'var(--app-bg)',
                    color: formData.is_student === val ? '#C9A962' : '#8A7E72',
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="rounded-2xl p-5 mb-4 space-y-4" style={{ background: 'var(--app-bg)', border: '1px solid rgba(201,169,98,0.2)' }}>
          <h3 className="text-xs uppercase tracking-widest mb-3" style={{ color: '#8A7E72' }}>Preferences</h3>
          <div>
            <label className={labelClass}>Focus</label>
            <div className="space-y-2">
              {Object.entries(FOCUS_LABELS).map(([key, { label, Icon }]) => (
                <button key={key} onClick={() => handleFieldChange('focus', key)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 text-left"
                  style={{
                    border: formData.focus === key ? '1.5px solid rgba(201,169,98,0.6)' : '1.5px solid rgba(201,169,98,0.15)',
                    background: formData.focus === key ? 'rgba(201,169,98,0.1)' : 'var(--app-bg)',
                    color: formData.focus === key ? '#C9A962' : '#8A7E72',
                  }}>
                  <Icon size={15} />
                  <span>{label}</span>
                  {formData.focus === key && <Check size={13} className="ml-auto" style={{ color: 'var(--app-gold)' }} />}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>Schedule</label>
            <div className="space-y-2">
              {Object.entries(SCHEDULE_LABELS).map(([key, { label, desc, Icon }]) => (
                <button key={key} onClick={() => handleFieldChange('schedule_type', key)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 text-left"
                  style={{
                    border: formData.schedule_type === key ? '1.5px solid rgba(201,169,98,0.6)' : '1.5px solid rgba(201,169,98,0.15)',
                    background: formData.schedule_type === key ? 'rgba(201,169,98,0.1)' : 'var(--app-bg)',
                    color: formData.schedule_type === key ? '#C9A962' : '#8A7E72',
                  }}>
                  <Icon size={15} />
                  <span>{label}</span>
                  <span className="text-xs ml-1 opacity-60">{desc}</span>
                  {formData.schedule_type === key && <Check size={13} className="ml-auto" style={{ color: 'var(--app-gold)' }} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={saving || uploading}
          className="w-full py-4 rounded-2xl text-base font-medium mb-6 transition-all duration-200 flex items-center justify-center gap-2"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            background: (saving || uploading) ? 'rgba(201,169,98,0.3)' : 'linear-gradient(135deg, #B8955A 0%, #C9A962 100%)',
            color: 'white',
            boxShadow: (saving || uploading) ? 'none' : '0 4px 16px rgba(184,149,90,0.3)',
            cursor: (saving || uploading) ? 'not-allowed' : 'pointer',
            fontSize: '17px',
          }}>
          {saving ? <span className="inline-block w-5 h-5 border-2 border-[color:var(--app-wash-4)] border-t-white rounded-full animate-spin" />
            : saveSuccess ? <><Check size={18} /> Saved</> : 'Save Changes'}
        </button>

        {/* Appearance */}
        <div className="rounded-2xl overflow-hidden mb-6" style={{ border: '1px solid rgba(201,169,98,0.2)' }}>
          <div className="w-full flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2.5">
              {theme === 'light'
                ? <Sun className="w-4 h-4 text-[color:var(--app-gold)]" strokeWidth={1.5} />
                : <Moon className="w-4 h-4 text-[color:var(--app-gold)]" strokeWidth={1.5} />}
              <span className="text-base text-[color:var(--app-gold)]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Appearance</span>
            </div>
            <div className="flex rounded-full p-0.5" style={{ border: '1px solid rgba(201,169,98,0.3)', backgroundColor: 'var(--app-wash-soft)' }}>
              <button
                onClick={() => setTheme('dark')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all"
                style={theme === 'dark'
                  ? { backgroundColor: '#C9A962', color: '#1A1508', fontWeight: 500 }
                  : { color: 'var(--app-text-2)' }}
              >
                <Moon className="w-3 h-3" strokeWidth={2} /> Dark
              </button>
              <button
                onClick={() => setTheme('light')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all"
                style={theme === 'light'
                  ? { backgroundColor: '#C9A962', color: '#1A1508', fontWeight: 500 }
                  : { color: 'var(--app-text-2)' }}
              >
                <Sun className="w-3 h-3" strokeWidth={2} /> Light
              </button>
            </div>
          </div>
        </div>

        {/* Bottom links */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(201,169,98,0.2)' }}>
          <button onClick={() => navigate('/subscription')}
            className="w-full flex items-center justify-between px-5 py-4 transition-opacity hover:opacity-70"
            style={{ borderBottom: '1px solid rgba(201,169,98,0.15)' }}>
            <span className="text-base text-[color:var(--app-gold)]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Manage Subscription</span>
            <ChevronRight className="w-5 h-5 text-[color:var(--app-gold)]" strokeWidth={1.5} />
          </button>
          <button onClick={() => navigate('/pwa-tutorial')}
            className="w-full flex items-center justify-between px-5 py-4 transition-opacity hover:opacity-70"
            style={{ borderBottom: '1px solid rgba(201,169,98,0.15)' }}>
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-[color:var(--app-gold)]" strokeWidth={1.5} />
              <span className="text-base text-[color:var(--app-gold)]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>How to Install App</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[color:var(--app-gold)]" strokeWidth={1.5} />
          </button>
          <button
            onClick={handleCheckUpdates}
            disabled={updateStatus !== null}
            className="w-full flex items-center justify-between px-5 py-4 transition-opacity hover:opacity-70 disabled:opacity-50"
            style={{ borderBottom: '1px solid rgba(201,169,98,0.15)' }}>
            <div className="flex items-center gap-2.5">
              <RefreshCw
                className={`w-4 h-4 text-[color:var(--app-gold)] ${updateStatus && updateStatus !== 'updating' ? 'animate-spin' : ''}`}
                strokeWidth={1.5}
              />
              <div className="text-left">
                <span className="block text-base text-[color:var(--app-gold)]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {updateStatus === 'checking' ? 'Checking...' : updateStatus === 'clearing' ? 'Clearing cache...' : updateStatus === 'updating' ? 'Reloading...' : 'Check for Updates'}
                </span>
                <span className="block text-xs" style={{ color: 'var(--app-wash-3)' }}>
                  Install latest version available
                </span>
              </div>
            </div>
            {!updateStatus && <ChevronRight className="w-5 h-5 text-[color:var(--app-gold)]" strokeWidth={1.5} />}
            {updateStatus === 'updating' && <Check className="w-4 h-4 text-[color:var(--app-gold)]" strokeWidth={1.5} />}
          </button>
          <button onClick={handleSignOut}
            className="w-full flex items-center justify-between px-5 py-4 transition-opacity hover:opacity-70">
            <span className="text-base text-[color:var(--app-gold)]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Sign out</span>
            <LogOut className="w-5 h-5 text-[color:var(--app-gold)]" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
} 