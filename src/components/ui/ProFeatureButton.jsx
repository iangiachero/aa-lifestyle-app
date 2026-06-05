import React from 'react';
import { Star } from 'lucide-react';

export default function ProFeatureButton({ children, onClick, className = "", ...props }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-medium hover:from-amber-600 hover:to-amber-700 transition-all ${className}`}
      {...props}
    >
      <Star className="w-4 h-4" />
      {children}
    </button>
  );
}
