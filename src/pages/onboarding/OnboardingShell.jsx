import React from 'react';

const GOLD = '#C9A962';
const GOLD_DIM = 'rgba(201,169,98,0.25)';

export function OnboardingShell({ children, step, totalSteps, footer }) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(to bottom, #000000, #1e1a16, #000000)',
        fontFamily: "'Inter', sans-serif",
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
      `}</style>

      <div
        style={{
          width: '100%',
          maxWidth: '384px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          flex: '1 0 auto',
          padding: '40px 24px 0',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '40px' }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? '24px' : '8px',
                height: '8px',
                borderRadius: '9999px',
                background: i === step ? GOLD : GOLD_DIM,
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        <div style={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>

        <p
          style={{
            textAlign: 'center',
            fontSize: '12px',
            color: 'rgba(201,169,98,0.35)',
            fontFamily: "'Inter', sans-serif",
            marginTop: '24px',
            paddingBottom: footer ? '0' : '32px',
          }}
        >
          Designed for those who value clarity, beauty, and intention
        </p>
      </div>

      {footer && (
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            width: '100%',
            background: 'linear-gradient(to top, #000000 70%, transparent)',
            paddingTop: '24px',
            paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
            zIndex: 10,
          }}
        >
          <div
            style={{
              maxWidth: '384px',
              margin: '0 auto',
              padding: '0 24px',
            }}
          >
            {footer}
          </div>
        </div>
      )}
    </div>
  );
}

export function GoldButton({ onClick, children, disabled, outline }) {
  if (outline) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-medium transition-all duration-200"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: '17px',
          border: `1.5px solid ${disabled ? GOLD_DIM : 'rgba(201,169,98,0.5)'}`,
          color: disabled ? GOLD_DIM : GOLD,
          background: 'transparent',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center gap-2 flex-1 py-4 rounded-2xl font-medium transition-all duration-200"
      style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: '17px',
        background: disabled
          ? 'rgba(201,169,98,0.15)'
          : 'linear-gradient(135deg, #B8955A 0%, #C9A962 100%)',
        color: disabled ? 'rgba(201,169,98,0.35)' : 'white',
        boxShadow: disabled ? 'none' : '0 4px 20px rgba(201,169,98,0.3)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: disabled ? '1.5px solid rgba(201,169,98,0.2)' : 'none',
      }}
    >
      {children}
    </button>
  );
}
