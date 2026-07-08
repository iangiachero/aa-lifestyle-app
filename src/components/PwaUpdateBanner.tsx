import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface PwaUpdateBannerProps {
  onUpdate: () => void;
}

export default function PwaUpdateBanner({ onUpdate }: PwaUpdateBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] flex flex-col"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div style={{ height: 'env(safe-area-inset-top, 0px)' }} />
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          background: 'linear-gradient(90deg, #000000 0%, #232323 100%)',
          borderBottom: '1px solid rgba(201, 169, 98, 0.35)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.5)',
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <RefreshCw
            className="w-4 h-4 flex-shrink-0"
            style={{ color: 'var(--app-gold)' }}
            strokeWidth={2}
          />
          <span
            className="text-sm truncate"
            style={{
              color: '#E8D9B8',
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '15px',
              letterSpacing: '0.03em',
            }}
          >
            A new version is available
          </span>
        </div>

        <button
          onClick={onUpdate}
          className="flex-shrink-0 ml-3 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #B8955A 0%, #C9A962 100%)',
            color: '#1A1209',
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '14px',
            letterSpacing: '0.04em',
            border: 'none',
          }}
        >
          Update
        </button>
      </div>
    </div>
  );
}
