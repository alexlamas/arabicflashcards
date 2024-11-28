import { useState } from "react";

// app/components/WordGrid.tsx
export function WordGrid({ 
    words, 
    view,
    progress,
    onProgressChange 
  }: {
    words: Array<{
      english: string;
      arabic: string;
      transliteration: string;
      category: string;
    }>;
    view: 'list' | 'flashcard';
    progress: Record<string, 'learned' | 'learning' | 'new'>;
    onProgressChange: (value: Record<string, 'learned' | 'learning' | 'new'>) => void;
  }) {
    const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  
    const handleFlip = (english: string) => {
      setFlipped(prev => ({
        ...prev,
        [english]: !prev[english]
      }));
    };
  
    const handleProgress = (english: string, status: 'learned' | 'learning' | 'new') => {
      onProgressChange({
        ...progress,
        [english]: status
      });
    };
  
    if (view === 'flashcard') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {words.map(word => (
            <div
              key={word.english}
              onClick={() => handleFlip(word.english)}
              className={`cursor-pointer p-6 rounded-lg shadow-md transition-all ${
                progress[word.english] === 'learned' ? 'bg-green-50' :
                progress[word.english] === 'learning' ? 'bg-yellow-50' :
                'bg-white'
              }`}
            >
              {flipped[word.english] ? (
                <>
                  <div className="text-2xl text-right mb-2">{word.arabic}</div>
                  <div className="text-gray-600">{word.transliteration}</div>
                </>
              ) : (
                <div className="text-xl font-medium">{word.english}</div>
              )}
              <div className="mt-4 flex gap-2 justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProgress(word.english, 'learned');
                  }}
                  className="p-1 rounded hover:bg-green-100"
                >
                  ✓
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProgress(word.english, 'learning');
                  }}
                  className="p-1 rounded hover:bg-yellow-100"
                >
                  ⟳
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    }
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {words.map(word => (
          <div
            key={word.english}
            className={`p-4 rounded-lg shadow-md ${
              progress[word.english] === 'learned' ? 'bg-green-50' :
              progress[word.english] === 'learning' ? 'bg-yellow-50' :
              'bg-white'
            }`}
          >
            <div className="font-medium">{word.english}</div>
            <div className="text-xl text-right mt-2">{word.arabic}</div>
            <div className="text-sm text-gray-600">{word.transliteration}</div>
            <div className="text-xs text-gray-400 mt-2">{word.category}</div>
            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => handleProgress(word.english, 'learned')}
                className="p-1 rounded hover:bg-green-100"
              >
                ✓
              </button>
              <button
                onClick={() => handleProgress(word.english, 'learning')}
                className="p-1 rounded hover:bg-yellow-100"
              >
                ⟳
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }