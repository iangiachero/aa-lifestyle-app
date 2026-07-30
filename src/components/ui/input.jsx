import React from 'react';

// forwardRef so callers can focus/select the field programmatically
// (e.g. keeping the caret in the "add item" field for continuous entry).
export const Input = React.forwardRef(function Input({ className = "", ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`w-full px-4 py-2 bg-[color:var(--app-input-bg)] border border-[#e2ba8b]/20 rounded-lg text-[color:var(--app-text)] placeholder:text-[color:var(--app-text-3)] focus:outline-none focus:ring-2 focus:ring-[#e2ba8b]/50 focus:border-[#e2ba8b] transition-colors ${className}`}
      {...props}
    />
  );
});
