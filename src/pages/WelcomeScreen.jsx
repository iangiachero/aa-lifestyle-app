import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LOGO_URL = 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/logo-icon/logo_transparent.png';

export default function WelcomeScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: 'var(--app-bg)' }}
    >
      <div className="flex flex-col items-center gap-8 px-6 text-center animate-fade-in">
        <div className="w-36 h-36 rounded-full overflow-hidden border-2 border-[#C9A962] shadow-2xl">
          <img
            src={LOGO_URL}
            alt="All Access Lifestyle"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-2">
          <h1
            className="text-4xl text-[#C9A962] font-light"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Welcome Back
          </h1>
          <p
            className="text-2xl text-[#C9A962]/70 font-light"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            to All Access Lifestyle
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="text-sm text-[#C9A962]/50 mt-6 hover:text-[#C9A962] transition-colors duration-200"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Tap to continue
        </button>
      </div>
    </div>
  );
}
