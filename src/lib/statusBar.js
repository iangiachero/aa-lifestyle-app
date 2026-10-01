import { StatusBar, Style } from '@capacitor/status-bar';
import { isNativeApp } from './platform';

// Style.Light = dark text for light backgrounds, Style.Dark = light text.
export async function syncStatusBar(theme) {
  if (!isNativeApp()) return;
  try {
    await StatusBar.setStyle({ style: theme === 'light' ? Style.Light : Style.Dark });
  } catch (e) {
    // Native shell built without `npx cap sync` has no StatusBar plugin.
  }
}
