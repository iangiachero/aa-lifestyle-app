import { useState, useEffect } from 'react';

const DISMISSED_KEY = 'pwa-banner-dismissed';

export type Platform = 'ios' | 'android' | 'other';

export function detectPlatform(): Platform {
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  return 'ios';
}

export function usePWAInstallBanner() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [platform, setPlatform] = useState<Platform>('ios');

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);
    setIsDismissed(localStorage.getItem(DISMISSED_KEY) === 'true');
    setPlatform(detectPlatform());
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setIsDismissed(true);
  };

  const showBanner = !isStandalone && !isDismissed;

  return { showBanner, dismiss, platform };
}
