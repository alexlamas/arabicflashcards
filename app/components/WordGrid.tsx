import React, { useState } from "react";
import { Word } from "../types/word";
import { WordDetailModal } from "./WordDetailModal";
import { formatTimeUntilReview } from "../utils/formatReviewTime";
import { useOfflineSync, offlineHelpers } from "../hooks/useOfflineSync";
import { CalendarDays, Plus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { SpacedRepetitionService } from "../services/spacedRepetitionService";

const StatusBadge = ({
  word,
  onStartLearning,
}: {
  word: Word;
  onStartLearning?: () => void;
}) => {
  // If word is archived, show "Not started" badge
  if (word.status === "archived") {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onStartLearning?.();
        }}
        className="w-20 h-6 relative overflow-hidden text-xs rounded-md border border-neutral-200 hover:border-transparent text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors group/badge"
      >
        {/* Default "Not started" text - moves up on hover */}
        <div className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover/badge:-translate-y-full">
          Not started
        </div>
        {/* "Start" with plus icon - moves up from bottom on hover */}
        <div className="absolute inset-0 flex items-center justify-center transition-transform duration-300 translate-y-full group-hover/badge:translate-y-0">
          <Plus size={12} className="mr-1" />
          <span>Learn</span>
        </div>
      </button>
    );
  }

  // Otherwise show review time badge if available
  const reviewTime = formatTimeUntilReview(word.next_review_date);
  if (!reviewTime) return null;

  return (
    <div className="flex items-center text-xs h-6 font-medium px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600">
      <CalendarDays size={14} className="mr-2 text-neutral-400" />
      {reviewTime}
    </div>
  );
};

const ListCard = ({
  word,
  onShowDetails,
  onStartLearning,
  hideArabic = false,
}: {
  word: Word;
  onShowDetails: () => void;
  onStartLearning?: () => void;
  hideArabic?: boolean;
}) => {
  return (
    <div
      className="p-6 rounded-lg border-[0.5px] border-gray-200 relative group cursor-pointer hover:shadow-md transition-shadow"
      onClick={onShowDetails}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="text-xl font-medium">{word.english}</div>
        </div>
        <StatusBadge word={word} onStartLearning={onStartLearning} />
      </div>
      {!hideArabic && (
        <>
          <div className="text-3xl mt-4 mb-3 font-arabic">{word.arabic}</div>
          <div className="text-base text-gray-500">{word.transliteration}</div>
        </>
      )}
    </div>
  );
};

export function WordGrid({
  words,
  hideArabic = false,
  onWordUpdate,
}: {
  words: Word[];
  hideArabic?: boolean;
  onWordUpdate: (updatedWord: Word) => void;
}) {
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { session } = useAuth();
  const { handleOfflineAction } = useOfflineSync();

  const handleShowDetails = (word: Word) => {
    setSelectedWord(word);
    setIsModalOpen(true);
  };

  const handleStartLearning = async (word: Word) => {
    if (!session?.user) return;

    const updatedWord = {
      ...word,
      status: "learning" as const,
      next_review_date: new Date().toISOString(),
    };

    await handleOfflineAction(
      async () => {
        const { count } = await SpacedRepetitionService.startLearning(
          session.user.id,
          word.english
        );
        window.dispatchEvent(
          new CustomEvent("wordProgressUpdated", { detail: { count } })
        );
        return count;
      },
      () => offlineHelpers.startLearning(session.user.id, word.english)
    );

    onWordUpdate(updatedWord);
  };

  return (
    <>
      <WordDetailModal
        word={selectedWord}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onWordUpdate={(updatedWord) => {
          onWordUpdate(updatedWord);
          // Update the selected word if it's the one being edited
          if (selectedWord && selectedWord.id === updatedWord.id) {
            setSelectedWord(updatedWord);
          }
        }}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {words.map((word) => (
          <div key={word.english}>
            <ListCard
              word={word}
              onShowDetails={() => handleShowDetails(word)}
              onStartLearning={() => handleStartLearning(word)}
              hideArabic={hideArabic}
            />
          </div>
        ))}
      </div>
    </>
  );
}

export default WordGrid;
