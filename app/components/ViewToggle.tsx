// app/components/ViewToggle.tsx
export function ViewToggle({ 
    current, 
    onChange 
  }: {
    current: 'list' | 'flashcard';
    onChange: (view: 'list' | 'flashcard') => void;
  }) {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => onChange('list')}
          className={`px-4 py-2 rounded ${
            current === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100'
          }`}
        >
          List View
        </button>
        <button
          onClick={() => onChange('flashcard')}
          className={`px-4 py-2 rounded ${
            current === 'flashcard' ? 'bg-blue-500 text-white' : 'bg-gray-100'
          }`}
        >
          Flashcard Mode
        </button>
      </div>
    );
  }