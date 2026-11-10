import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aalifestyle.app',
  appName: 'AA Lifestyle',
  webDir: 'dist',
  // Server config — remove or set to production URL when publishing
  // server: {
  //   url: 'http://localhost:5173',
  //   cleartext: true,
  // },
  ios: {
    scheme: 'AA Lifestyle',
    // 'never' (Capacitor's default): the web app already handles safe areas
    // in CSS with env(). 'automatic' let iOS add its own top inset whenever
    // the page became scrollable, e.g. while the keyboard was open, and it
    // could stay after the keyboard closed: the whole app sat ~15pt lower
    // with the black native background showing above it until a relaunch.
    contentInset: 'never',
    backgroundColor: '#000000',
    preferredContentMode: 'mobile',
    allowsLinkPreview: false,
    scrollEnabled: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,         // We handle splash in-app
      launchAutoHide: true,
      backgroundColor: '#000000',
      showSpinner: false,
      launchFadeOutDuration: 0,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',                 // Light text on dark background
      backgroundColor: '#000000',
      overlaysWebView: true,
    },
    Keyboard: {
      resize: 'body',                // Resizes body when keyboard opens
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
