import React, { useState } from "react";
import { Word, Sentence } from "../types/word";
import { WordDetailModal } from "./WordDetailModal";
import { formatTimeUntilReview } from "../utils/formatReviewTime";
import { SentenceService } from "../services/sentenceService";

const StatusBadge = ({
  word,
}: {
  word: Word;
}) => {
  const reviewTime = formatTimeUntilReview(word.next_review_date);
  if (!reviewTime) return null;

  return (
    <div className="text-xs text-subtle">
      {reviewTime}
    </div>
  );
};

const ListCard = ({
  word,
  onShowDetails,
  hideArabic = false,
}: {
  word: Word;
  onShowDetails: () => void;
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
        <StatusBadge word={word} />
      </div>
      {!hideArabic && (
        <>
          <div className="text-3xl mt-4 mb-3 font-arabic">{word.arabic}</div>
          <div className="text-base text-body">{word.transliteration}</div>
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
  const [selectedWordSentences, setSelectedWordSentences] = useState<Sentence[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleShowDetails = async (word: Word) => {
    setSelectedWord(word);
    // Pre-fetch sentences before opening modal to avoid jump
    const sentences = await SentenceService.getSentencesForWord(word.id);
    setSelectedWordSentences(sentences);
    setIsModalOpen(true);
  };

  return (
    <>
      <WordDetailModal
        word={selectedWord}
        sentences={selectedWordSentences}
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
            hideArabic={hideArabic}
          />
        ))}
      </div>
    </>
  );
}

export default WordGrid;
