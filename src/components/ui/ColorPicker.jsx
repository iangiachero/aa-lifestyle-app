import { useState } from 'react';
import { Palette } from 'lucide-react';

const PRESET_COLORS = [
  '#EF4444',
  '#F97316',
  '#F59E0B',
  '#10B981',
  '#14B8A6',
  '#3B82F6',
  '#EC4899',
  '#C9A962',
];

export const COLOR_OPTIONS = PRESET_COLORS.map((value) => ({ value }));

export default function ColorPicker({ selectedColor, onSelectColor }) {
  const [customColor, setCustomColor] = useState(
    selectedColor && !PRESET_COLORS.includes(selectedColor) ? selectedColor : '#C9A962'
  );

  const isCustomSelected = selectedColor && !PRESET_COLORS.includes(selectedColor);

  const handlePresetClick = (color) => {
    onSelectColor(color);
  };

  const handleCustomChange = (e) => {
    const color = e.target.value;
    setCustomColor(color);
    onSelectColor(color);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs uppercase font-light tracking-wider" style={{ color: '#9B9B9B' }}>
        Color
      </label>

      <div className="flex flex-wrap gap-2.5">
        {PRESET_COLORS.map((color) => {
          const isSelected = selectedColor === color;
          return (
            <button
              key={color}
              type="button"
              onClick={() => handlePresetClick(color)}
              className="w-10 h-10 rounded-full transition-all duration-150 hover:scale-110 focus:outline-none flex-shrink-0"
              style={{
                backgroundColor: color,
                border: isSelected ? '2.5px solid #C9A962' : '2.5px solid transparent',
                boxShadow: isSelected
                  ? '0 0 0 2px #000000, 0 0 0 4px #C9A962'
                  : '0 2px 4px rgba(0,0,0,0.35)',
                transform: isSelected ? 'scale(1.12)' : undefined,
              }}
            />
          );
        })}

        <label
          className="relative cursor-pointer flex-shrink-0"
          style={{ width: '40px', height: '40px' }}
          title="Custom color"
        >
          <input
            type="color"
            value={customColor}
            onChange={handleCustomChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="w-10 h-10 rounded-full transition-all duration-150 hover:scale-110 flex items-center justify-center"
            style={{
              background: isCustomSelected
                ? customColor
                : 'conic-gradient(from 0deg, #EF4444, #F97316, #F59E0B, #10B981, #3B82F6, #EC4899, #EF4444)',
              border: isCustomSelected ? '2.5px solid #C9A962' : '2.5px solid transparent',
              boxShadow: isCustomSelected
                ? '0 0 0 2px #000000, 0 0 0 4px #C9A962'
                : '0 2px 4px rgba(0,0,0,0.35)',
              transform: isCustomSelected ? 'scale(1.12)' : undefined,
            }}
          >
            {!isCustomSelected && (
              <Palette
                className="w-4 h-4"
                style={{ color: 'white', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.6))' }}
              />
            )}
          </div>
        </label>
      </div>
    </div>
  );
}
