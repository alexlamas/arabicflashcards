import React, { useState } from "react";
import {
  Check,
  X,
  SmileyNervous,
  ArrowCounterClockwise,
} from "@phosphor-icons/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
      return "bg-green-50 border-green-200 shadow-sm transition";
    case "learning":
      return "bg-yellow-50 border-yellow-200 shadow-sm transition";
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
        className={`p-1.5 rounded-md transition hover:bg-black/5 ${
          progress[word.english] === "learned" &&
          "text-emerald-800 no-pointer-events"
        }
          ${progress[word.english] === "learning" && "hidden"}
        `}
        aria-label="Mark as learned"
      >
        <Check
          size={18}
          weight={progress[word.english] === "learned" ? "bold" : "regular"}
        />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleProgress("learning");
        }}
        className={`p-1.5 rounded-md transition hover:bg-black/5 ${
          progress[word.english] === "learning" && "text-amber-600"
        }
        ${progress[word.english] === "learned" && "hidden"}
        `}
        aria-label="Mark as still learning"
      >
        <SmileyNervous
          size={18}
          weight={progress[word.english] === "learning" ? "fill" : "regular"}
        />
      </button>
      {(progress[word.english] === "learning" ||
        progress[word.english] === "learned") && (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleProgress("new");
                }}
                className="p-1.5 rounded-md transition hover:bg-black/5"
                aria-label="Clear progress"
              >
                <ArrowCounterClockwise size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Reset progress</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

const ListCard: React.FC<{
  word: WordType;
  progress: Record<string, ProgressType>;
  onProgressChange: (value: Record<string, ProgressType>) => void;
}> = ({ word, progress, onProgressChange }) => (
  <div
    className={`p-6 rounded-lg shadow border-[0.5px] border-gray-200 ${getProgressBackground(
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
  <div className=" h-40" style={{ perspective: "1000px" }}>
    <div
      className="absolute inset-0 w-full h-full transition-transform duration-500 preserve-3d cursor-pointer"
      style={{ transform: isFlipped ? "rotateY(180deg)" : "" }}
      onClick={onFlip}
    >
      {/* Front of card */}
      <div
        className={`absolute inset-0 w-full h-full p-6 rounded-lg shadow border-[0.5px] border-gray-200 group
          ${getProgressBackground(progress[word.english])} backface-hidden`}
      >
        <div className="flex justify-between items-start">
          <div className="text-xl font-medium">{word.english}</div>
          <TypeBadge type={word.type} />
        </div>
        <div className="text-sm text-gray-400 mt-4 group-hover:opacity-100 opacity-0 transition">
          Click to view
        </div>

        <ProgressButtons
          word={word}
          progress={progress}
          onProgressChange={onProgressChange}
        />
      </div>

      {/* Back of card */}
      <div
        className={`absolute inset-0 w-full h-full p-6 rounded-lg shadow border-[0.5px] border-gray-200 
          ${getProgressBackground(
            progress[word.english]
          )} backface-hidden [transform:rotateY(180deg)]`}
      >
        <div className="flex justify-between items-start">
          <div className="text-3xl font-arabic">{word.arabic}</div>
          <TypeBadge type={word.type} />
        </div>
        <div className="text-sm text-gray-400 mt-4">{word.transliteration}</div>

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
