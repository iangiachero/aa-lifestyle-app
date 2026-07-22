const LOGO_URL = 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/logo-icon/logo_transparent.png';

// Renders the exact same visuals as the #pre-splash in index.html so the
// hand-off from the HTML splash to the React auth-loading splash is invisible.
// No fade-in and no self-hide timer: it shows instantly and stays until the
// auth gate unmounts it, so there is never a blank frame during launch.
export default function SplashScreen() {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-[9999]"
      style={{ backgroundColor: 'var(--app-bg)', gap: 24 }}
    >
      <style>{`
        @keyframes splash-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(201,169,98,0.2); }
          50% { box-shadow: 0 0 40px rgba(201,169,98,0.4); }
        }
        @keyframes splash-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
      <div
        style={{
          width: 112,
          height: 112,
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2px solid #C9A962',
          animation: 'splash-pulse 2.5s ease-in-out infinite',
        }}
      >
        <img
          src={LOGO_URL}
          alt="AA Lifestyle"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <h1
          style={{
            color: 'var(--app-gold)',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 22,
            fontWeight: 300,
            letterSpacing: '0.15em',
            margin: 0,
          }}
        >
          AA LIFESTYLE
        </h1>
        <p
          style={{
            color: 'var(--app-gold)',
            opacity: 0.7,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 13,
            fontWeight: 300,
            letterSpacing: '0.05em',
            margin: 0,
          }}
        >
          All Access Lifestyle
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        {[0, 150, 300].map((delay) => (
          <div
            key={delay}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#C9A962',
              animation: `splash-bounce 1.2s ease-in-out infinite ${delay}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
