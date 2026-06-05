// src/components/ui/BottomNav.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { List, Calendar, Home, Heart, User } from 'lucide-react';

export default function BottomNav() {
  /* === BOTTOM NAV STYLING CONFIGURATION === */
  const NAV_STYLE = {
    // Container styling
    background: 'bg-[#000000]',
    blur: '',
    border: 'border border-[rgba(226,186,139,0.3)]',
    glow: 'shadow-sm',
    radius: 'rounded-full',
    padding: 'px-8 py-4',
    gap: 'gap-8',
    
    // Icon colors
    iconActive: 'text-[#e2ba8b]',
    iconInactive: 'text-[#e2ba8b]/60',
    iconHover: 'hover:text-[#e2ba8b]',
    
    // Icon sizes and stroke
    iconSize: 'w-6 h-6',
    strokeActive: 2,
    strokeInactive: 1.5,
  };
  /* === END BOTTOM NAV STYLING CONFIGURATION === */

  const location = useLocation();

  const navItems = [
    { icon: List, label: 'Tasks', path: '/tasks' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: Home, label: 'Home', path: '/' },
    { icon: Heart, label: 'Lifestyle', path: '/lifestyle' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const containerClasses = `${NAV_STYLE.background} ${NAV_STYLE.blur} ${NAV_STYLE.border} ${NAV_STYLE.radius} ${NAV_STYLE.padding} ${NAV_STYLE.glow} flex items-center ${NAV_STYLE.gap}`;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-10"
      style={{
        background: 'transparent'
      }}
    >
      <div className="flex justify-center">
        <div className={containerClasses}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="transition-all duration-200 hover:scale-110"
                aria-label={item.label}
              >
                <Icon
                  className={`${NAV_STYLE.iconSize} transition-colors duration-200 ${
                    isActive
                      ? NAV_STYLE.iconActive
                      : `${NAV_STYLE.iconInactive} ${NAV_STYLE.iconHover}`
                  }`}
                  strokeWidth={isActive ? NAV_STYLE.strokeActive : NAV_STYLE.strokeInactive}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
} 