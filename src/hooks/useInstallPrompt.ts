import { useState, useEffect, useRef } from 'react';

const INSTALL_DISMISSED_KEY = 'pwa-install-dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function useInstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    if (localStorage.getItem(INSTALL_DISMISSED_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      deferredPromptRef.current = null;
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPromptRef.current) return;
    await deferredPromptRef.current.prompt();
    const { outcome } = await deferredPromptRef.current.userChoice;
    deferredPromptRef.current = null;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setIsInstalled(true);
    }
  };

  const dismissInstall = () => {
    localStorage.setItem(INSTALL_DISMISSED_KEY, '1');
    setIsInstallable(false);
    deferredPromptRef.current = null;
  };

  return { isInstallable, isInstalled, promptInstall, dismissInstall };
}
