import React, { useState } from "react";
import WordList from "./WordList";
import { Word, ViewMode } from "../types/word";
import { WordDetailModal } from "./WordDetailModal";
import { formatTimeUntilReview } from "../utils/formatReviewTime";
import { useOfflineSync, offlineHelpers } from "../hooks/useOfflineSync";
import { CalendarDotsIcon, Plus } from "@phosphor-icons/react";
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
      <CalendarDotsIcon size={14} className="mr-2 text-neutral-400" />
      {reviewTime}
    </div>
  );
};

const ListCard = ({
  word,
  onShowDetails,
  onStartLearning,
}: {
  word: Word;
  onShowDetails: () => void;
  onStartLearning?: () => void;
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

      <div className="text-3xl mt-4 mb-3 font-arabic">{word.arabic}</div>
      <div className="text-base text-gray-500">{word.transliteration}</div>
    </div>
  );
};

const FlashCard = ({
  word,
  isFlipped,
  onFlip,
  onShowDetails,
  onStartLearning,
}: {
  word: Word;
  isFlipped: boolean;
  onFlip: () => void;
  onShowDetails: () => void;
  onStartLearning?: () => void;
}) => (
  <div className="h-36" style={{ perspective: "1000px" }}>
    <div
      className="absolute inset-0 w-full h-full transition-transform duration-500 preserve-3d cursor-pointer"
      style={{ transform: isFlipped ? "rotateY(180deg)" : "" }}
      onClick={onFlip}
    >
      {/* Front of card */}
      <div className="absolute inset-0 w-full h-full p-6 rounded-lg shadow-sm hover:shadow-md transition border-[0.5px] border-gray-200 group backface-hidden">
        <div className="flex flex-col h-full justify-between">
          <div className="flex justify-between items-start">
            <div className="text-xl font-medium">{word.english}</div>
            <StatusBadge word={word} onStartLearning={onStartLearning} />
          </div>
          <div className="text-sm text-gray-400 group-hover:opacity-100 opacity-0 transition mix-blend-luminosity">
            Click to view
          </div>
        </div>
      </div>

      {/* Back of card */}
      <div
        className="absolute inset-0 w-full h-full p-6 rounded-lg shadow-xl border-[0.5px] border-gray-200 backface-hidden [transform:rotateY(180deg)]"
        onClick={(e) => {
          e.stopPropagation();
          onShowDetails();
        }}
      >
        <div className="flex justify-between items-start">
          <div className="text-3xl font-arabic">{word.arabic}</div>
          <StatusBadge word={word} onStartLearning={onStartLearning} />
        </div>
        <div className="text-sm text-gray-400 mt-4 mix-blend-luminosity">
          {word.transliteration}
        </div>
      </div>
    </div>
  </div>
);

export function WordGrid({
  words,
  view,
  onWordDeleted,
  onWordUpdate,
}: {
  words: Word[];
  view: ViewMode;
  onWordDeleted: () => void;
  onWordUpdate: (updatedWord: Word) => void;
}) {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { session } = useAuth();
  const { handleOfflineAction } = useOfflineSync();

  const handleFlip = (english: string) => {
    setFlipped((prev) => ({ ...prev, [english]: !prev[english] }));
  };

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

    // Use the same logic as the modal - call SpacedRepetitionService.startLearning
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

  if (view === "list") {
    return (
      <WordList
        words={words}
        onWordDeleted={onWordDeleted}
        onWordUpdate={onWordUpdate}
      />
    );
  }

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
            {view === "flashcard" ? (
              <FlashCard
                word={word}
                isFlipped={flipped[word.english]}
                onFlip={() => handleFlip(word.english)}
                onShowDetails={() => handleShowDetails(word)}
                onStartLearning={() => handleStartLearning(word)}
              />
            ) : (
              <ListCard
                word={word}
                onShowDetails={() => handleShowDetails(word)}
                onStartLearning={() => handleStartLearning(word)}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default WordGrid;
