import React, { useState } from "react";
import { ExampleSentence } from "../../types/word";

interface InfoButtonProps {
  word: {
    english: string;
    arabic: string;
    example_sentences?: ExampleSentence[];
    notes?: string;
  };
}

export default function InfoButton({ word }: InfoButtonProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const hasSavedSentences =
    word.example_sentences && word.example_sentences.length > 0;
  const hasNotes = !!word.notes;
  const hasInfo = hasSavedSentences || hasNotes;

  if (!hasInfo) {
    return null;
  }

  const currentSentence = hasSavedSentences
    ? word.example_sentences![currentIndex]
    : null;

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = () => {
    if (
      hasSavedSentences &&
      currentIndex < word.example_sentences!.length - 1
    ) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const getOverlayText = () => {
    if (hasSavedSentences && word.example_sentences!.length > 1 && isHovered) {
      return `Example ${currentIndex + 1} of ${word.example_sentences!.length}`;
    }
    if (hasSavedSentences && hasNotes) return "Show examples & notes";
    if (hasSavedSentences) return "Show examples";
    return "Show notes";
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg group mt-4"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Content container with blur effect */}
      <div
        className={`transition-all duration-300 ${
          !isHovered ? "blur-sm scale-[0.95]" : "blur-0 scale-100"
        }`}
      >
        <div className="space-y-3 p-0">
          {hasSavedSentences && currentSentence && (
            <div className="p-3 bg-white group-hover:bg-neutral-100 transition-all rounded-lg border border-transparent group-hover:border-gray-100 font-medium select-none">
              {currentSentence.arabic && (
                <p className="text-3xl font-arabic text-black/90 mb-2 font-medium">
                  {currentSentence.arabic}
                </p>
              )}
              <p className="text-sm text-black/70">
                {currentSentence.transliteration}
              </p>
              <div className="h-[0.5px] w-full bg-black/10 my-2"></div>
              <p className="text-sm text-black mt-2">
                {currentSentence.english}
              </p>
            </div>
          )}
          {hasNotes && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-md border border-yellow-100">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {word.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Overlay with CTA text */}
      <div
        className={`absolute inset-0 flex items-center justify-center bg-white/80 transition-opacity duration-300 ${
          isHovered ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="bg-white/20 px-4 py-2 rounded-full border border-gray-200 pointer-events-none select-none">
          <p className="text-sm font-medium text-gray-700">
            {getOverlayText()}
          </p>
        </div>
      </div>
    </div>
  );
}
