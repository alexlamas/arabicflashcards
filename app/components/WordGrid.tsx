import React, { useState } from "react";
import { Word } from "../types/word";
import { WordDetailModal } from "./WordDetailModal";
import { formatTimeUntilReview } from "../utils/formatReviewTime";
import { useOfflineSync, offlineHelpers } from "../hooks/useOfflineSync";
import { useAuth } from "../contexts/AuthContext";
import { SpacedRepetitionService } from "../services/spacedRepetitionService";

const StatusBadge = ({
  word,
}: {
  word: Word;
  onStartLearning?: () => void;
}) => {
  const reviewTime = formatTimeUntilReview(word.next_review_date);
  if (!reviewTime) return null;

  return (
    <div className="text-xs text-gray-500">
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
      className="h-full p-6 rounded-lg border-[0.5px] border-gray-200 relative group hover:shadow-md transition-shadow cursor-pointer"
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
          word.id
        );
        window.dispatchEvent(
          new CustomEvent("wordProgressUpdated", { detail: { count } })
        );
        return count;
      },
      () => offlineHelpers.startLearning(session.user.id, word.id)
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {words.map((word) => (
          <ListCard
            key={word.id}
            word={word}
            onShowDetails={() => handleShowDetails(word)}
            onStartLearning={() => handleStartLearning(word)}
            hideArabic={hideArabic}
          />
        ))}
      </div>
    </>
  );
}

export default WordGrid;
