/**
 * Capacitor native bridge hook.
 * Detects if the app is running inside a Capacitor iOS shell and applies
 * platform-specific CSS classes. No external Capacitor packages needed —
 * those will be installed when you run `npx cap init` + `npx cap add ios`.
 *
 * This hook is safe to use in both web (PWA) and native builds.
 */
import { useEffect } from 'react';

declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform?: () => boolean;
      getPlatform?: () => string;
    };
  }
}

function isNative(): boolean {
  return !!window.Capacitor?.isNativePlatform?.();
}

export function useCapacitor() {
  useEffect(() => {
    // Add platform detection classes
    if (isNative()) {
      const platform = window.Capacitor?.getPlatform?.() ?? 'unknown';
      document.body.classList.add('capacitor-native');
      document.documentElement.classList.add('capacitor-native');

      if (platform === 'ios') {
        document.body.classList.add('capacitor-ios');
        document.documentElement.classList.add('capacitor-ios');
      } else if (platform === 'android') {
        document.body.classList.add('capacitor-android');
        document.documentElement.classList.add('capacitor-android');
      }
    }
  }, []);
}
