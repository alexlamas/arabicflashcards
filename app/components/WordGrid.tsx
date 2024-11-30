import React, { useState } from "react";
import WordList from "./WordList";
import { ViewMode } from "../types/word";
import ProgressButtons from "./ProgressButtons";

interface WordType {
  english: string;
  arabic: string;
  transliteration: string;
  category: string;
  type: string;
}

type ProgressType = "learned" | "learning" | "new";

const getProgressBackground = (progress: ProgressType | undefined) => {
  switch (progress) {
    case "learned":
      return "bg-emerald-50 !border-emerald-500 shadow-sm transition";
    case "learning":
      return "bg-amber-50 !border-amber-500 shadow-sm transition";
    default:
      return "bg-white";
  }
};

const TypeBadge: React.FC<{ type: string }> = ({ type }) => (
  <div className="text-xs font-medium px-2 py-0.5 rounded-full border-[0.5px] border-black/10 text-gray-600 mix-blend-luminosity">
    {type}
  </div>
);

const ListCard: React.FC<{
  word: WordType;
  progress: Record<string, ProgressType>;
  onProgressChange: (value: Record<string, ProgressType>) => void;
}> = ({ word, progress, onProgressChange }) => (
  <div
    className={`p-6 rounded-lg border-[0.5px] border-gray-200 ${getProgressBackground(
      progress[word.english]
    )}`}
  >
    <div className="flex justify-between items-start">
      <div className="text-xl font-medium">{word.english}</div>
      <TypeBadge type={word.type} />
    </div>

    <div className="text-3xl mt-4 mb-3 font-arabic">{word.arabic}</div>
    <div className="text-sm text-gray-400">{word.transliteration}</div>

    <ProgressButtons
      word={word}
      progress={progress}
      onProgressChange={onProgressChange}
    />
  </div>
);

const FlashCard: React.FC<{
  word: WordType;
  progress: Record<string, ProgressType>;
  onProgressChange: (value: Record<string, ProgressType>) => void;
  isFlipped: boolean;
  onFlip: () => void;
}> = ({ word, progress, onProgressChange, isFlipped, onFlip }) => (
  <div className="h-36" style={{ perspective: "1000px" }}>
    <div
      className="absolute inset-0 w-full h-full transition-transform duration-500 preserve-3d cursor-pointer"
      style={{ transform: isFlipped ? "rotateY(180deg)" : "" }}
      onClick={onFlip}
    >
      {/* Front of card */}
      <div
        className={`absolute inset-0 w-full h-full p-6 rounded-lg shadow-sm hover:shadow-md transition border-[0.5px] border-gray-200 group
    ${getProgressBackground(progress[word.english])} backface-hidden`}
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
        className={`absolute inset-0 w-full h-full p-6 rounded-lg shadow-xl border-[0.5px] border-gray-200 
          ${getProgressBackground(
            progress[word.english]
          )} backface-hidden [transform:rotateY(180deg)]`}
      >
        <div className="flex justify-between items-start">
          <div className="text-3xl font-arabic">{word.arabic}</div>
          <TypeBadge type={word.type} />
        </div>
        <div className="text-sm text-gray-400 mt-4 mix-blend-luminosity">
          {word.transliteration}
        </div>

        <ProgressButtons
          word={word}
          progress={progress}
          onProgressChange={onProgressChange}
        />
      </div>
    </div>
  </div>
);

export function WordGrid({
  words,
  view,
  progress,
  onProgressChange,
}: {
  words: WordType[];
  view: ViewMode;
  progress: Record<string, ProgressType>;
  onProgressChange: (value: Record<string, ProgressType>) => void;
}) {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  const handleFlip = (english: string) => {
    setFlipped((prev) => ({
      ...prev,
      [english]: !prev[english],
    }));
  };

  if (view === "list") {
    return (
      <WordList
        words={words}
        progress={progress}
        onProgressChange={onProgressChange}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {words.map((word) => (
        <div key={word.english}>
          {view === "flashcard" ? (
            <FlashCard
              word={word}
              progress={progress}
              onProgressChange={onProgressChange}
              isFlipped={flipped[word.english]}
              onFlip={() => handleFlip(word.english)}
            />
          ) : (
            <ListCard
              word={word}
              progress={progress}
              onProgressChange={onProgressChange}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default WordGrid;
