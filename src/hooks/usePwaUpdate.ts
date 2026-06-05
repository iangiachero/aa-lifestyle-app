import { useState, useEffect, useRef } from 'react';

const JUST_UPDATED_KEY = 'pwa-just-updated';

export function usePwaUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);
  const hasAppliedRef = useRef(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    if (sessionStorage.getItem(JUST_UPDATED_KEY)) {
      sessionStorage.removeItem(JUST_UPDATED_KEY);
      return;
    }

    let registration: ServiceWorkerRegistration | null = null;

    const onUpdateFound = () => {
      if (!registration) return;
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          waitingWorkerRef.current = newWorker;
          setUpdateAvailable(true);
        }
      });
    };

    const registerSW = async () => {
      try {
        registration = await navigator.serviceWorker.register('/sw.js', {
          updateViaCache: 'none',
        });

        if (registration.waiting && navigator.serviceWorker.controller) {
          waitingWorkerRef.current = registration.waiting;
          setUpdateAvailable(true);
        }

        registration.addEventListener('updatefound', onUpdateFound);

        const pollInterval = setInterval(() => {
          registration?.update().catch(() => {});
        }, 30 * 60 * 1000);

        const onVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
            registration?.update().catch(() => {});
          }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
          clearInterval(pollInterval);
          document.removeEventListener('visibilitychange', onVisibilityChange);
          registration?.removeEventListener('updatefound', onUpdateFound);
        };
      } catch {
        return undefined;
      }
    };

    const controllerChangeHandler = () => {
      if (hasAppliedRef.current) {
        sessionStorage.setItem(JUST_UPDATED_KEY, '1');
        window.location.reload();
      }
    };
    navigator.serviceWorker.addEventListener('controllerchange', controllerChangeHandler);

    let cleanup: (() => void) | undefined;
    registerSW().then((fn) => { cleanup = fn; });

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', controllerChangeHandler);
      cleanup?.();
    };
  }, []);

  const applyUpdate = () => {
    if (!waitingWorkerRef.current) return;
    hasAppliedRef.current = true;
    waitingWorkerRef.current.postMessage({ type: 'SKIP_WAITING' });
  };

  const triggerCheck = async () => {
    if (!('serviceWorker' in navigator)) return;
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
      }
    } catch {}
  };

  return { updateAvailable, applyUpdate, triggerCheck };
}
