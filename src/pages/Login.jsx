import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'register') {
      if (!fullName.trim()) { setError('Please enter your full name.'); return; }
      if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error: authError } = await signIn(email, password);
        if (authError) { setError(authError.message); return; }
        const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
        if (!hasSeenWelcome) {
          sessionStorage.setItem('hasSeenWelcome', 'true');
          navigate('/welcome');
        } else {
          navigate('/');
        }
      } else {
        const { error: authError } = await signUp(email, password, fullName.trim());
        if (authError) { setError(authError.message); return; }
        navigate('/onboarding');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputBase = `w-full px-4 py-3.5 rounded-xl border text-sm outline-none transition-all duration-200`;
  const inputStyle = {
    background: 'rgba(0,0,0,0.8)',
    border: '1.5px solid rgba(201,169,98,0.25)',
    color: '#F5F1E8',
    fontFamily: "'Inter', sans-serif",
  };
  const inputFocusHandler = (e) => { e.target.style.borderColor = 'rgba(201,169,98,0.6)'; };
  const inputBlurHandler = (e) => { e.target.style.borderColor = 'rgba(201,169,98,0.25)'; };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: '#000000', fontFamily: "'Inter', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
        .login-input::placeholder { color: rgba(138,126,114,0.6); }
      `}</style>

      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          {/* LOGO */}
          <div className="w-24 h-24 mx-auto mb-5 flex items-center justify-center">
            <img
              src="https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/logo-icon/logo_transparent.png"
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-semibold mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#C9A962' }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-sm" style={{ color: 'rgba(226,186,139,0.5)' }}>
            {mode === 'login' ? 'Sign in to your account' : 'Start your premium journey'}
          </p>
        </div>

        <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(201,169,98,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-xs font-medium uppercase tracking-widest mb-1.5 block" style={{ color: 'rgba(138,126,114,0.8)' }}>Full Name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="Your name" className={`${inputBase} login-input`} style={inputStyle} onFocus={inputFocusHandler} onBlur={inputBlurHandler} />
              </div>
            )}
            <div>
              <label className="text-xs font-medium uppercase tracking-widest mb-1.5 block" style={{ color: 'rgba(138,126,114,0.8)' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com" className={`${inputBase} login-input`} style={inputStyle} onFocus={inputFocusHandler} onBlur={inputBlurHandler} />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-widest mb-1.5 block" style={{ color: 'rgba(138,126,114,0.8)' }}>Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className={`${inputBase} login-input`} style={{ ...inputStyle, paddingRight: '48px' }} onFocus={inputFocusHandler} onBlur={inputBlurHandler} />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70" style={{ color: 'rgba(138,126,114,0.7)' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {mode === 'register' && (
              <div>
                <label className="text-xs font-medium uppercase tracking-widest mb-1.5 block" style={{ color: 'rgba(138,126,114,0.8)' }}>Confirm Password</label>
                <div className="relative">
                  <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="••••••••" className={`${inputBase} login-input`} style={{ ...inputStyle, paddingRight: '48px' }} onFocus={inputFocusHandler} onBlur={inputBlurHandler} />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70" style={{ color: 'rgba(138,126,114,0.7)' }}>
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}
            {error && (
              <p className="text-sm px-3 py-2.5 rounded-xl" style={{ color: '#e57373', background: 'rgba(229,115,115,0.08)', border: '1px solid rgba(229,115,115,0.2)' }}>{error}</p>
            )}
            <button type="submit" disabled={loading} className="w-full py-4 rounded-xl text-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 mt-2"
              style={{ fontFamily: "'Cormorant Garamond', serif", background: loading ? 'rgba(201,169,98,0.3)' : 'linear-gradient(135deg, #B8955A 0%, #C9A962 100%)', color: loading ? 'rgba(255,255,255,0.5)' : 'white', boxShadow: loading ? 'none' : '0 4px 20px rgba(184,149,90,0.3)', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <>{mode === 'login' ? 'Sign In' : 'Create Account'}<ArrowRight size={18} /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-sm" style={{ color: 'rgba(138,126,114,0.7)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setFullName(''); }} className="font-medium transition-opacity hover:opacity-70" style={{ color: '#C9A962' }}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        <p className="text-center text-xs mt-8" style={{ color: 'rgba(201,169,98,0.3)' }}>
          Designed for those who value clarity, beauty, and intention
        </p>
      </div>
    </div>
  );
}