import { useState, useCallback } from 'react';
import { syncStatusBar } from '../lib/statusBar';

const THEME_KEY = 'app_theme';

// Theme is bootstrapped in index.html before first paint; this hook reads and
// toggles the class on <html> plus the PWA theme-color meta tag.
export function useTheme() {
  const [theme, setThemeState] = useState(() =>
    document.documentElement.classList.contains('light') ? 'light' : 'dark'
  );

  const setTheme = useCallback((next) => {
    document.documentElement.classList.toggle('light', next === 'light');
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (e) {}
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'light' ? '#FDFCF9' : '#000000');
    syncStatusBar(next);
    setThemeState(next);
  }, []);

  return { theme, setTheme };
}
