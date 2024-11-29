import React, { useState } from "react";
import { Check, X, CircleWavyQuestion } from "@phosphor-icons/react";

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
      return "bg-green-50 border border-green-200 shadow";
    case "learning":
      return "bg-yellow-50 border border-yellow-200 shadow";
    default:
      return "bg-white";
  }
};

const TypeBadge: React.FC<{ type: string }> = ({ type }) => (
  <div className="text-xs font-medium px-2 py-0.5 rounded-full border border-gray-200 text-gray-600">
    {type}
  </div>
);

const ProgressButtons: React.FC<{
  word: WordType;
  progress: Record<string, ProgressType>;
  onProgressChange: (value: Record<string, ProgressType>) => void;
}> = ({ word, progress, onProgressChange }) => {
  const handleProgress = (status: ProgressType) => {
    onProgressChange({
      ...progress,
      [word.english]: status,
    });
  };

  return (
    <div className="mt-4 flex gap-2 justify-end">
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleProgress("learned");
        }}
        className="p-1.5 rounded-md transition hover:bg-black/5"
        aria-label="Mark as learned"
      >
        <Check size={18} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleProgress("learning");
        }}
        className="p-1.5 rounded-md transition hover:bg-black/5"
        aria-label="Mark as still learning"
      >
        <CircleWavyQuestion size={18} />
      </button>
      {progress[word.english] !== "new" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleProgress("new");
          }}
          className="p-1.5 rounded-md transition hover:bg-black/5"
          aria-label="Clear progress"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

const WordCard: React.FC<{
  word: WordType;
  progress: Record<string, ProgressType>;
  onProgressChange: (value: Record<string, ProgressType>) => void;
  isFlashcardMode?: boolean;
  isFlipped?: boolean;
  onFlip?: () => void;
}> = ({
  word,
  progress,
  onProgressChange,
  isFlashcardMode = false,
  isFlipped = false,
  onFlip,
}) => {
  const showArabic = !isFlashcardMode || (isFlashcardMode && isFlipped);

  return (
    <div
      onClick={onFlip}
      className={`${
        isFlashcardMode ? "cursor-pointer" : ""
      } p-6 rounded-lg shadow-md transition-all ${getProgressBackground(
        progress[word.english]
      )}`}
    >
      <div className="flex justify-between items-start">
        <div className="text-xl font-medium">{word.english}</div>
        <TypeBadge type={word.type} />
      </div>

      {showArabic && (
        <>
          <div className="text-3xl mt-4 mb-3 font-arabic">{word.arabic}</div>
          <div className="text-sm text-gray-400">{word.transliteration}</div>
        </>
      )}

      <ProgressButtons
        word={word}
        progress={progress}
        onProgressChange={onProgressChange}
      />
    </div>
  );
};

export function WordGrid({
  words,
  view,
  progress,
  onProgressChange,
}: {
  words: WordType[];
  view: "list" | "flashcard";
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {words.map((word) => (
        <WordCard
          key={word.english}
          word={word}
          progress={progress}
          onProgressChange={onProgressChange}
          isFlashcardMode={view === "flashcard"}
          isFlipped={flipped[word.english]}
          onFlip={
            view === "flashcard" ? () => handleFlip(word.english) : undefined
          }
        />
      ))}
    </div>
  );
}

export default WordGrid;
