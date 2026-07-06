// src/pages/home/ProductivitySection.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductivitySection({ isStudent }) {
  const STYLE = {
    container: {
      background: 'bg-[color:var(--app-bg)]',
      blur: '',
      border: 'border border-[rgba(226,186,139,0.3)]',
      glow: 'shadow-[0_0_8px_rgba(226,186,139,0.12),0_0_16px_rgba(226,186,139,0.05)]',
      radius: 'rounded-2xl',
    },
    header: {
      padding: 'px-4 py-3',
    },
    colors: {
      title: 'text-[color:var(--app-text)]',
    },
    itemCard: {
      background: 'bg-[color:var(--app-bg)]',
      border: 'border border-[rgba(226,186,139,0.3)]',
      glow: 'shadow-[0_0_6px_rgba(226,186,139,0.1)]',
      hoverBorder: 'hover:border-[rgba(226,186,139,0.5)]',
      hoverGlow: 'hover:shadow-[0_0_10px_rgba(226,186,139,0.15),0_0_20px_rgba(226,186,139,0.08)]',
      hoverBg: 'hover:bg-[rgba(226,186,139,0.05)]',
      padding: 'px-1 pt-0.5 pb-1',
      radius: 'rounded-xl',
      height: 'h-[110px]',
    },
    expandedBg: 'bg-[color:var(--app-bg)]',
    grid: {
      cols: 'grid-cols-4',
      gap: 'gap-3',
      padding: 'px-4 pb-4',
    },
  };

  const items = [
    { 
      icon: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/dashboard-icon/ChatGPT%20Image%20Notes.png', 
      label: 'Notes/Pass', 
      path: '/notes' 
    },
    { 
      icon: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/dashboard-icon/ChatGPT%20Image%20Task.png', 
      label: 'Checklists', 
      path: '/checklists' 
    },
    ...(isStudent ? [{ 
      icon: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/dashboard-icon/ChatGPT%20Image%20Student.png', 
      label: 'Student', 
      path: '/student' 
    }] : []),
    { 
      icon: 'https://yxuiwdhbtphanuzusxks.supabase.co/storage/v1/object/public/dashboard-icon/ChatGPT%20Image%20Home%20Organization.png', 
      label: 'Org', 
      path: '/home-organization' 
    },
  ];

  return (
    <div className={`${STYLE.container.background} ${STYLE.container.blur} ${STYLE.container.radius} ${STYLE.container.border} ${STYLE.container.glow} overflow-hidden`}>
      <div className={`${STYLE.header.padding} flex items-center`}>
        <span className={`text-xl font-serif font-semibold ${STYLE.colors.title}`}>Productivity</span>
      </div>
      <div className={`${STYLE.expandedBg}`}>
        <div className={`${STYLE.grid.padding} grid ${items.length === 3 ? 'grid-cols-3' : STYLE.grid.cols} ${STYLE.grid.gap}`}>
          {items.map((item) => (
            <Link key={item.label} to={item.path}>
              <div className={`${STYLE.itemCard.background} ${STYLE.itemCard.height} backdrop-blur-sm ${STYLE.itemCard.radius} ${STYLE.itemCard.padding} cursor-pointer transition-all duration-200 ${STYLE.itemCard.border} ${STYLE.itemCard.glow} ${STYLE.itemCard.hoverBorder} ${STYLE.itemCard.hoverGlow} ${STYLE.itemCard.hoverBg} flex flex-col items-center justify-between`}>
                <img
                  src={item.icon}
                  alt={item.label}
                  loading="lazy"
                  decoding="async"
                  className="w-[90px] h-[90px] object-cover flex-shrink-0"
                />
                <div className={`text-[9px] font-serif font-medium ${STYLE.colors.title} text-center leading-tight px-1`}>{item.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}