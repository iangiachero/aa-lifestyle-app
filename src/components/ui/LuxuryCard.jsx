import React from 'react';

export default function LuxuryCard({ children, className = "", ...props }) {
  return (
    <div
      className={`bg-gradient-to-br from-[rgba(0,0,0,0.8)] to-[rgba(0,0,0,0.6)] rounded-2xl border border-[rgba(201,169,98,0.4)] shadow-[0_0_20px_rgba(201,169,98,0.2),0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_var(--app-wash)] backdrop-blur-sm hover:border-[rgba(201,169,98,0.6)] hover:shadow-[0_0_30px_rgba(201,169,98,0.3),0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_var(--app-wash)] transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
