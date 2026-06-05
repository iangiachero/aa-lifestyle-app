import React from 'react';
import { X, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePWAInstallBanner, detectPlatform } from '../hooks/usePWAInstallBanner';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

export default function PWAInstallBanner() {
  const { showBanner, dismiss } = usePWAInstallBanner();
  const { isInstallable, promptInstall, dismissInstall } = useInstallPrompt();
  const navigate = useNavigate();

  const platform = detectPlatform();
  const isIOS = platform === 'ios';

  if (!showBanner) return null;

  const handleInstall = async () => {
    if (isInstallable && !isIOS) {
      await promptInstall();
      dismiss();
    } else {
      navigate('/pwa-tutorial');
    }
  };

  const handleDismiss = () => {
    dismissInstall();
    dismiss();
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9998] flex flex-col"
      style={{
        background: 'linear-gradient(90deg, #B8955A 0%, #C9A962 100%)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{ height: 'env(safe-area-inset-top, 0px)' }} />
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <Download className="w-4 h-4 text-[#1A1209] flex-shrink-0" strokeWidth={2} />
          <span
            className="text-[#1A1209] text-sm font-medium truncate"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '15px', letterSpacing: '0.02em' }}
          >
            Install AA Lifestyle
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          <button
            onClick={handleInstall}
            className="px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{
              background: 'rgba(26,18,9,0.18)',
              color: '#1A1209',
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '14px',
              letterSpacing: '0.03em',
              border: '1px solid rgba(26,18,9,0.25)',
            }}
          >
            {isInstallable && !isIOS ? 'Install' : 'Learn How'}
          </button>
          <button
            onClick={handleDismiss}
            className="w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200 hover:opacity-70 active:scale-95"
            style={{ background: 'rgba(26,18,9,0.12)' }}
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5 text-[#1A1209]" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
