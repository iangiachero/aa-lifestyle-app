//src/components/Layout.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Home, Calendar, CheckSquare, Heart, User } from 'lucide-react';
import PWAInstallBanner from './PWAInstallBanner';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { usePWAInstallBanner } from '../hooks/usePWAInstallBanner';

export default function Layout({ children, currentPageName }) {
  const { userProfile } = useAuth();
  const { isAnyModalOpen } = useModal();
  const { showBanner } = usePWAInstallBanner();
  const [isStandalone, setIsStandalone] = useState(() =>
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  );
  const mainRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [currentPageName]);

  const clampScroll = useCallback((e) => {
    const el = e.currentTarget ?? e.target;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (el.scrollTop < 0) {
      el.scrollTop = 0;
    } else if (el.scrollTop > maxScroll) {
      el.scrollTop = maxScroll;
    }
  }, []);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    el.addEventListener('scroll', clampScroll, { passive: true });
    return () => el.removeEventListener('scroll', clampScroll);
  }, [clampScroll]);

  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)');
    const handler = (e) => setIsStandalone(e.matches || window.navigator.standalone === true);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const themeColors = {
    gold: {
      accent: '#B8955A',
      accentLight: 'rgba(184, 149, 90, 0.15)',
      accentVeryLight: 'rgba(184, 149, 90, 0.06)',
      bg: '#F3E8D8',
      bgGradient: '#E8D8C2',
      text: '#000000',
      textLight: '#5D5449',
      card: '#FFFFFF',
      border: 'rgba(184, 149, 90, 0.20)',
      logoFilter: 'brightness(0) saturate(100%) invert(60%) sepia(30%) saturate(520%) hue-rotate(6deg) brightness(88%) contrast(90%)'
    },
    champagne: {
      accent: '#C9A052',
      accentLight: 'rgba(201, 160, 82, 0.15)',
      accentVeryLight: 'rgba(201, 160, 82, 0.06)',
      bg: '#FFFCF7',
      bgGradient: '#FFF9F0',
      text: '#000000',
      textLight: '#5D5449',
      card: '#FFFFFF',
      border: 'rgba(201, 160, 82, 0.20)',
      logoFilter: 'brightness(0) saturate(100%) invert(62%) sepia(48%) saturate(458%) hue-rotate(2deg) brightness(92%) contrast(90%)'
    },
    blush: {
      accent: '#D49FA4',
      accentLight: 'rgba(212, 159, 164, 0.15)',
      accentVeryLight: 'rgba(212, 159, 164, 0.06)',
      bg: '#FFFAFB',
      bgGradient: '#FFF5F7',
      text: '#000000',
      textLight: '#5D5449',
      card: '#FFFFFF',
      border: 'rgba(212, 159, 164, 0.20)',
      logoFilter: 'brightness(0) saturate(100%) invert(70%) sepia(18%) saturate(450%) hue-rotate(300deg) brightness(95%) contrast(88%)'
    },
    slate: {
      accent: '#4A5B6D',
      accentLight: 'rgba(74, 91, 109, 0.15)',
      accentVeryLight: 'rgba(74, 91, 109, 0.06)',
      bg: '#FAFBFC',
      bgGradient: '#F5F7F9',
      text: '#1A1D23',
      textLight: '#4A5568',
      card: '#FFFFFF',
      border: 'rgba(74, 91, 109, 0.20)',
      logoFilter: 'brightness(0) saturate(100%) invert(38%) sepia(18%) saturate(650%) hue-rotate(172deg) brightness(90%) contrast(92%)'
    },
    earth: {
      accent: '#7A6D5E',
      accentLight: 'rgba(122, 109, 94, 0.15)',
      accentVeryLight: 'rgba(122, 109, 94, 0.06)',
      bg: '#FAFAF8',
      bgGradient: '#F6F5F2',
      text: '#000000',
      textLight: '#5D5449',
      card: '#FFFFFF',
      border: 'rgba(122, 109, 94, 0.20)',
      logoFilter: 'brightness(0) saturate(100%) invert(48%) sepia(12%) saturate(540%) hue-rotate(355deg) brightness(88%) contrast(88%)'
    },
  };

  const currentTheme = themeColors.gold;

  const isOnboarding = currentPageName === 'Onboarding';
  const isLogin = currentPageName === 'Login';
  const isSplash = currentPageName === 'Splash';
  const showNav = !isOnboarding && !isLogin && !isSplash && currentPageName !== 'Settings';

  const effectiveTheme = (isOnboarding || isLogin || isSplash) ? themeColors.gold : currentTheme;

  const navItems = [
    { name: 'Tasks', icon: CheckSquare, page: 'Tasks' },
    { name: 'Calendar', icon: Calendar, page: 'CalendarPage' },
    { name: 'Home', icon: Home, page: 'Home' },
    { name: 'Lifestyle', icon: Heart, page: 'Lifestyle' },
    { name: 'Profile', icon: User, page: 'Profile' },
  ];

  React.useEffect(() => {
    if (isOnboarding || isLogin || isSplash) {
      document.body.classList.add('onboarding-page');
      document.body.classList.add('scroll-mode');
      document.body.classList.remove('app-mode');
    } else {
      document.body.classList.remove('onboarding-page');
      document.body.classList.remove('scroll-mode');
      document.body.classList.add('app-mode');
    }
    return () => {
      document.body.classList.remove('onboarding-page');
      document.body.classList.remove('scroll-mode');
      document.body.classList.remove('app-mode');
    };
  }, [isOnboarding, isLogin, isSplash]);

  const isAuthPage = isOnboarding || isLogin || isSplash;

  const mainPaddingTop = !isAuthPage && showBanner && !isStandalone
    ? 'calc(44px + env(safe-area-inset-top, 0px))'
    : isStandalone && !isAuthPage
      ? 'env(safe-area-inset-top, 0px)'
      : undefined;

  return (
    <div
      className={isAuthPage ? "min-h-screen flex flex-col overflow-x-hidden" : "fixed inset-0 overflow-hidden"}
      style={{
        background: '#000000',
        color: '#F5F1E8',
        '--accent-color': effectiveTheme.accent,
        '--bg-color': '#000000',
        '--text-color': '#F5F1E8',
        maxWidth: '100vw',
      }}
    >
      <style>{`
        :root {
          --accent: ${effectiveTheme.accent};
          --accent-light: ${effectiveTheme.accentLight};
          --accent-very-light: ${effectiveTheme.accentVeryLight};
          --bg: ${effectiveTheme.bg};
          --bg-gradient: ${effectiveTheme.bgGradient};
          --text: ${effectiveTheme.text};
          --text-light: ${effectiveTheme.textLight};
          --card-bg: ${effectiveTheme.card};
          --border: ${effectiveTheme.border};
          --logo-filter: ${effectiveTheme.logoFilter};
        }

        .theme-logo {
          filter: ${effectiveTheme.logoFilter};
        }

        .font-serif {
          font-family: 'Cormorant Garamond', Georgia, serif;
        }

        .font-sans {
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        body {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 400;
          letter-spacing: 0.01em;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background: #000000 !important;
        }

        input, textarea, select {
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          letter-spacing: 0;
        }

        h1, h2, h3, h4, h5, h6 {
          font-family: 'Cormorant Garamond', Georgia, serif;
        }

        .accent-text {
          color: var(--accent) !important;
        }

        .accent-bg {
          background-color: var(--accent) !important;
        }

        .accent-border {
          border-color: var(--border) !important;
        }

        .accent-gradient {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent) 100%) !important;
        }

        .card-luxury {
          background: var(--card-bg);
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          border: 1px solid var(--border);
        }

        .btn-gold {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent) 100%);
          color: white;
          border-radius: 12px;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 400;
          letter-spacing: 0.04em;
          transition: all 0.2s ease;
        }

        .btn-gold:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        button, [role="tab"], [role="button"] {
          font-family: 'Cormorant Garamond', Georgia, serif !important;
          font-weight: 400 !important;
          letter-spacing: 0.04em !important;
        }
      `}</style>

      {!isAuthPage && !isStandalone && <PWAInstallBanner />}

      <main
        ref={!isAuthPage ? mainRef : undefined}
        className={isAuthPage ? `flex-1 ${showNav ? 'pb-24' : ''}` : (currentPageName === 'CalendarPage' ? 'h-full overflow-hidden relative' : 'h-full overflow-y-auto scrollbar-hide relative')}
        style={isAuthPage ? {} : {
          zIndex: 2,
          paddingTop: mainPaddingTop,
          overscrollBehavior: 'none',
          overscrollBehaviorY: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div
          className={!isAuthPage ? (currentPageName === 'CalendarPage' ? 'h-full' : '') : ''}
          style={!isAuthPage && currentPageName !== 'CalendarPage' ? { paddingBottom: 'calc(9rem + env(safe-area-inset-bottom, 0px))' } : undefined}
        >
          {children}
        </div>
      </main>

      {showNav && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-6"
          style={{
            paddingBottom: `calc(1rem + env(safe-area-inset-bottom, 0px))`,
            paddingTop: '0.75rem',
            background: '#000000',
            transform: isAnyModalOpen ? 'translateY(120%)' : 'translateY(0)',
            transition: 'transform 0.25s ease',
            pointerEvents: isAnyModalOpen ? 'none' : 'auto',
          }}
        >
          <nav
            className="rounded-full px-6 py-3 flex items-center gap-6 border-2"
            style={{
              background: 'rgba(10, 10, 10, 0.97)',
              backdropFilter: 'blur(12px)',
              borderColor: 'rgba(201, 169, 98, 0.30)',
              boxShadow: '0 0 20px rgba(201, 169, 98, 0.10)',
            }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.page;
              const isProfile = item.page === 'Profile';
              const showAvatar = isProfile && userProfile?.pfp_url;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className="flex flex-col items-center gap-1 transition-all duration-200 hover:scale-105"
                >
                  {showAvatar ? (
                    <div className={`w-6 h-6 rounded-full overflow-hidden border-2 transition-all duration-200 ${isActive ? 'border-[#C9A962]' : 'border-[#C9A962]/40'}`}>
                      <img src={userProfile.pfp_url} alt="Profile" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <Icon
                      className={`w-6 h-6 transition-colors duration-200 ${
                        isActive
                          ? 'text-[#C9A962]'
                          : 'text-[#C9A962]/60 hover:text-[#C9A962]'
                      }`}
                      strokeWidth={isActive ? 2.5 : 1.5}
                    />
                  )}
                  <span
                    className={`text-[11px] font-medium transition-colors duration-200 ${
                      isActive
                        ? 'text-[#C9A962]'
                        : 'text-[#C9A962]/60'
                    }`}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}