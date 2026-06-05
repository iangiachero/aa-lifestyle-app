import { useState, useEffect } from 'react';

const LOGO_URL = 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/logo-icon/logo_transparent.png';
const MIN_DISPLAY_MS = 1200;

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [mounted] = useState(() => Date.now());

  useEffect(() => {
    const elapsed = Date.now() - mounted;
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
    const timer = setTimeout(() => setVisible(false), remaining);
    return () => clearTimeout(timer);
  }, [mounted]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[9999] animate-fade-in"
      style={{ backgroundColor: '#000000' }}
    >
      <div className="flex flex-col items-center gap-6">
        <div
          className="w-28 h-28 rounded-full overflow-hidden"
          style={{
            border: '2px solid #C9A962',
            boxShadow: '0 0 30px rgba(201,169,98,0.25)',
          }}
        >
          <img
            src={LOGO_URL}
            alt="AA Lifestyle"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col items-center gap-1">
          <h1
            className="text-2xl font-light tracking-[0.15em]"
            style={{
              color: '#C9A962',
              fontFamily: "'Cormorant Garamond', serif",
            }}
          >
            AA LIFESTYLE
          </h1>
          <p
            className="text-sm font-light tracking-[0.05em]"
            style={{
              color: 'rgba(201,169,98,0.7)',
              fontFamily: "'Cormorant Garamond', serif",
            }}
          >
            All Access Lifestyle
          </p>
        </div>
      </div>
    </div>
  );
}
