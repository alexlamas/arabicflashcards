import React, { useState, useEffect } from "react";
import { Sentence } from "../../types/word";
import { SentenceService } from "../../services/sentenceService";

interface InfoButtonProps {
  word: {
    id: string;
    english: string;
    arabic: string;
    notes?: string;
  };
}

export default function InfoButton({ word }: InfoButtonProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [sentences, setSentences] = useState<Sentence[]>([]);

  useEffect(() => {
    if (word.id) {
      SentenceService.getSentencesForWord(word.id).then(setSentences);
    }
  }, [word.id]);

  const hasSentences = sentences.length > 0;
  const hasNotes = !!word.notes;
  const hasInfo = hasSentences || hasNotes;

  if (!hasInfo) {
    return null;
  }

  const currentSentence = hasSentences ? sentences[currentIndex] : null;

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = () => {
    if (hasSentences && currentIndex < sentences.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const getOverlayText = () => {
    if (hasSentences && sentences.length > 1 && isHovered) {
      return `Example ${currentIndex + 1} of ${sentences.length}`;
    }
    if (hasSentences && hasNotes) return "Show examples & notes";
    if (hasSentences) return "Show examples";
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
          {hasSentences && currentSentence && (
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
              <p className="text-sm text-body whitespace-pre-wrap">
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
          <p className="text-sm font-medium text-body">
            {getOverlayText()}
          </p>
        </div>
      </div>
    </div>
  );
}
