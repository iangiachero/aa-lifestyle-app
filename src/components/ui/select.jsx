import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function Select({ value, onValueChange, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {React.Children.map(children, child => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, {
            onClick: () => setIsOpen(!isOpen),
            isOpen
          });
        }
        if (child.type === SelectContent && isOpen) {
          return React.cloneElement(child, {
            onSelect: (val) => {
              onValueChange(val);
              setIsOpen(false);
            },
            currentValue: value
          });
        }
        return null;
      })}
    </div>
  );
}

export function SelectTrigger({ onClick, isOpen, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full pl-4 pr-10 py-2 bg-[rgba(0,0,0,0.5)] border border-[#e2ba8b]/20 rounded-lg text-[color:var(--app-text)] focus:outline-none focus:ring-2 focus:ring-[#e2ba8b]/50 focus:border-[#e2ba8b] transition-colors flex items-center justify-between ${className}`}
    >
      {children}
      <ChevronDown className={`w-4 h-4 text-[color:var(--app-gold-light)] transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );
}

export function SelectValue({ placeholder, children }) {
  return <span className="text-left">{children || placeholder}</span>;
}

export function SelectContent({ onSelect, currentValue, children, className = "" }) {
  return (
    <div className={`absolute z-50 w-full mt-1 bg-[color:var(--app-bg)] border border-[#e2ba8b]/20 rounded-lg shadow-xl max-h-60 overflow-y-auto scrollbar-hide ${className}`}>
      {React.Children.map(children, child => {
        if (child.type === SelectItem) {
          return React.cloneElement(child, {
            onSelect,
            isSelected: child.props.value === currentValue
          });
        }
        return child;
      })}
    </div>
  );
}

export function SelectItem({ value, children, onSelect, isSelected, className = "" }) {
  return (
    <div
      onClick={() => onSelect(value)}
      className={`px-4 py-2 text-[color:var(--app-text)] cursor-pointer hover:bg-[#e2ba8b]/10 transition-colors ${isSelected ? 'bg-[#e2ba8b]/20' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
