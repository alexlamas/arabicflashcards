// app/components/ViewToggle.tsx
import { SquaresFour, Cards } from "@phosphor-icons/react";

export function ViewToggle({ 
    current, 
    onChange 
  }: {
    current: 'list' | 'flashcard';
    onChange: (view: 'list' | 'flashcard') => void;
  }) {
    return (
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => onChange('list')}
          className={`p-2 rounded-md transition-all group relative ${
            current === 'list' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:bg-white/50'
          }`}
          aria-label="List View"
        >
          <SquaresFour 
            size={20} 
            weight={current === 'list' ? "fill" : "regular"}
          />
          <span className="opacity-0 group-hover:opacity-100 absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap transition-opacity">
            List View
          </span>
        </button>

        <button
          onClick={() => onChange('flashcard')}
          className={`p-2 rounded-md transition-all group relative ${
            current === 'flashcard' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:bg-white/50'
          }`}
          aria-label="Flashcard Mode"
        >
          <Cards 
            size={20} 
            weight={current === 'flashcard' ? "fill" : "regular"}
          />
          <span className="opacity-0 group-hover:opacity-100 absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap transition-opacity">
            Flashcard Mode
          </span>
        </button>
      </div>
    );
  }