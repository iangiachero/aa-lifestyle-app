import React from 'react';

export default function GoldButton({ children, onClick, className = "", ...props }) {
  return (
    <button
      onClick={onClick}
      className={`btn-gold px-6 py-3 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
