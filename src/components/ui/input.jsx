import React from 'react';

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full px-4 py-2 bg-[rgba(0,0,0,0.5)] border border-[#e2ba8b]/20 rounded-lg text-[#F5F1E8] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#e2ba8b]/50 focus:border-[#e2ba8b] transition-colors ${className}`}
      {...props}
    />
  );
}
