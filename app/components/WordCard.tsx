import { Word, ProgressState } from "../types";

interface WordCardProps {
  word: Word;
  progress: ProgressState;
  onProgressChange: (status: ProgressState) => void;
  isFlashcardMode?: boolean;
  isFlipped?: boolean;
  onFlip?: () => void;
}

export function WordCard({
  word,
  progress,
  onProgressChange,
  isFlashcardMode = false,
  isFlipped = false,
  onFlip,
}: WordCardProps) {
  const showArabic = !isFlashcardMode || (isFlashcardMode && isFlipped);

  return (
    <div
      onClick={onFlip}
      className={`p-6 rounded-lg shadow border-[0.5px] ${
        isFlashcardMode ? "cursor-pointer" : ""
      } ${getProgressBackground(progress)}`}
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
        currentProgress={progress}
        onProgressChange={onProgressChange}
      />
    </div>
  );
}
