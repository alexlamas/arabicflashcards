import React, { useEffect, useState } from "react";
import WordList from "./WordList";
import { Word, ViewMode } from "../types/word";
import ProgressButtons from "./ProgressButtons";

const TypeBadge: React.FC<{ type: string }> = ({ type }) => (
  <div className="text-xs font-medium px-2 py-0.5 rounded-full border-[0.5px] border-black/10 text-gray-600 mix-blend-luminosity">
    {type}
  </div>
);

const ListCard: React.FC<{
  word: Word;
  onProgressUpdate: (updatedWord: Word) => void;
}> = ({ word, onProgressUpdate }) => (
  <div className={`p-6 rounded-lg border-[0.5px] border-gray-200 relative`}>
    <div className="flex justify-between items-start">
      <div className="text-xl font-medium">{word.english}</div>
      <TypeBadge type={word.type} />
    </div>

    <div className="text-3xl mt-4 mb-3 font-arabic">{word.arabic}</div>
    <div className="text-sm text-gray-400">{word.transliteration}</div>

    <ProgressButtons word={word} onProgressUpdate={onProgressUpdate} />
  </div>
);

const FlashCard: React.FC<{
  word: Word;
  isFlipped: boolean;
  onFlip: () => void;
  onProgressUpdate: (updatedWord: Word) => void;
}> = ({ word, isFlipped, onFlip, onProgressUpdate }) => (
  <div className="h-36" style={{ perspective: "1000px" }}>
    <div
      className="absolute inset-0 w-full h-full transition-transform duration-500 preserve-3d cursor-pointer"
      style={{ transform: isFlipped ? "rotateY(180deg)" : "" }}
      onClick={onFlip}
    >
      {/* Front of card */}
      <div
        className={`absolute inset-0 w-full h-full p-6 rounded-lg shadow-sm hover:shadow-md transition border-[0.5px] border-gray-200 group backface-hidden`}
      >
        {/* Added flex flex-col h-full justify-between to create vertical spacing */}
        <div className="flex flex-col h-full justify-between">
          <div className="flex justify-between items-start">
            <div className="text-xl font-medium">{word.english}</div>
          </div>
          <div className="text-sm text-gray-400 group-hover:opacity-100 opacity-0 transition mix-blend-luminosity">
            Click to view
          </div>
        </div>
      </div>

      {/* Back of card */}
      <div
        className={`absolute inset-0 w-full h-full p-6 rounded-lg shadow-xl border-[0.5px] border-gray-200 backface-hidden [transform:rotateY(180deg)]`}
      >
        <div className="flex justify-between items-start">
          <div className="text-3xl font-arabic">{word.arabic}</div>
          <TypeBadge type={word.type} />
        </div>
        <div className="text-sm text-gray-400 mt-4 mix-blend-luminosity">
          {word.transliteration}
        </div>

        <ProgressButtons word={word} onProgressUpdate={onProgressUpdate} />
      </div>
    </div>
  </div>
);

export function WordGrid({
  words,
  view,
  onWordDeleted,
}: {
  words: Word[];
  view: ViewMode;
  onWordDeleted?: () => void;
}) {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [localWords, setLocalWords] = useState<Word[]>(words);

  useEffect(() => {
    setLocalWords(words);
  }, [words]);

  const handleProgressUpdate = (updatedWord: Word) => {
    setLocalWords((prevWords) =>
      prevWords.map((word) =>
        word.english === updatedWord.english ? updatedWord : word
      )
    );
  };

  const handleFlip = (english: string) => {
    setFlipped((prev) => ({
      ...prev,
      [english]: !prev[english],
    }));
  };

  if (view === "list") {
    return <WordList words={words} onWordDeleted={onWordDeleted} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {localWords.map((word) => (
        <div key={word.english}>
          {view === "flashcard" ? (
            <FlashCard
              word={word}
              isFlipped={flipped[word.english]}
              onFlip={() => handleFlip(word.english)}
              onProgressUpdate={handleProgressUpdate}
            />
          ) : (
            <ListCard word={word} onProgressUpdate={handleProgressUpdate} />
          )}
        </div>
      ))}
    </div>
  );
}

export default WordGrid;
