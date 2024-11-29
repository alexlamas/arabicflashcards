import { useState } from "react";
import { Check, X, CircleWavyQuestion } from "@phosphor-icons/react";

// app/components/WordGrid.tsx
export function WordGrid({
  words,
  view,
  progress,
  onProgressChange,
}: {
  words: Array<{
    english: string;
    arabic: string;
    transliteration: string;
    category: string;
    type: string;
  }>;
  view: "list" | "flashcard";
  progress: Record<string, "learned" | "learning" | "new">;
  onProgressChange: (
    value: Record<string, "learned" | "learning" | "new">
  ) => void;
}) {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  const handleFlip = (english: string) => {
    setFlipped((prev) => ({
      ...prev,
      [english]: !prev[english],
    }));
  };

  const handleProgress = (
    english: string,
    status: "learned" | "learning" | "new"
  ) => {
    onProgressChange({
      ...progress,
      [english]: status,
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "verb":
        return "text-blue-500";
      case "noun":
        return "text-purple-500";
      case "adjective":
        return "text-green-500";
      case "phrase":
        return "text-orange-500";
      default:
        return "text-gray-500";
    }
  };

  if (view === "flashcard") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {words.map((word) => (
          <div
            key={word.english}
            onClick={() => handleFlip(word.english)}
            className={`cursor-pointer p-6 rounded-lg shadow-md transition-all ${
              progress[word.english] === "learned"
                ? "bg-green-50"
                : progress[word.english] === "learning"
                ? "bg-yellow-50"
                : "bg-white"
            }`}
          >
            {flipped[word.english] ? (
              <>
                <div className="text-3xl mb-4 tracking-wider font-arabic">
                  {word.arabic}
                </div>
                <div className="text-gray-600 text-sm">
                  {word.transliteration}
                </div>
              </>
            ) : (
              <>
                <div className="text-xl font-medium">{word.english}</div>
                <div
                  className={`text-xs mt-1 font-medium ${getTypeColor(
                    word.type
                  )}`}
                >
                  {word.type}
                </div>
              </>
            )}
            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleProgress(word.english, "learned");
                }}
                className="p-1.5 rounded-md transition-colors hover:bg-black/5"
                aria-label="Mark as learned"
              >
                <Check size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleProgress(word.english, "learning");
                }}
                className="p-1.5 rounded-md transition-colors hover:bg-black/5"
                aria-label="Mark as still learning"
              >
                <CircleWavyQuestion size={18} />
              </button>
              {progress[word.english] && (
                <button
                  onClick={() => handleProgress(word.english, "new")}
                  className="p-1.5 rounded-md transition-colors hover:bg-black/5 "
                  aria-label="Clear progress"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {words.map((word) => (
        <div
          key={word.english}
          className={`p-4 rounded-lg shadow-md transition ${
            progress[word.english] === "learned"
              ? "bg-green-50 border border-green-200 shadow"
              : progress[word.english] === "learning"
              ? "bg-yellow-50 border border-yellow-200 shadow"
              : "bg-white"
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="font-medium">{word.english}</div>
            <div className="text-xs font-medium px-2 py-0.5 rounded-full border border-gray-200 text-gray-600">
              {word.type}
            </div>
          </div>
          <div className="text-3xl mt-4 mb-3 font-arabic">{word.arabic}</div>
          <div className="text-sm text-gray-400">{word.transliteration}</div>

          <div className="mt-4 flex gap-2 justify-end">
            <button
              onClick={() => handleProgress(word.english, "learned")}
              className="p-1.5 rounded-md transition-colors hover:bg-black/5"
              aria-label="Mark as learned"
            >
              <Check size={18} />
            </button>
            <button
              onClick={() => handleProgress(word.english, "learning")}
              className="p-1.5 rounded-md transition-colors hover:bg-black/5"
              aria-label="Mark as still learning"
            >
              <CircleWavyQuestion size={18} />
            </button>
            {progress[word.english] != "new" && (
              <button
                onClick={() => handleProgress(word.english, "new")}
                className="p-1.5 rounded-md transition-colors hover:bg-black/5"
                aria-label="Clear progress"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
