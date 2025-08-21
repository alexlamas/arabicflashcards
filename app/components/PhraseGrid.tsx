import React, { useState } from "react";
import { Phrase } from "../types/phrase";
import { ViewMode } from "../types/word";
import { PhraseDetailModal } from "./PhraseDetailModal";

const PhraseCard = ({
  phrase,
  onShowDetails,
  arabicHidden = false,
}: {
  phrase: Phrase;
  onShowDetails: () => void;
  arabicHidden?: boolean;
}) => {
  const hasLinkedWords = phrase.linked_words && phrase.linked_words.length > 0;

  return (
    <div
      className="break-inside-avoid mb-4 p-5 rounded-xl bg-white border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer group"
      onClick={onShowDetails}
    >
      <div className="space-y-3">
        <div className="text-2xl font-medium text-gray-900 leading-snug">
          {phrase.english}
        </div>
        {!arabicHidden && (
          <div className="text-sm text-gray-500">{phrase.transliteration}</div>
        )}

        {hasLinkedWords && (
          <div className="flex flex-wrap gap-1 pt-2">
            {phrase.linked_words?.map((word) => (
              <span
                key={word.id}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
              >
                {word.english}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function PhraseGrid({
  phrases,
  view,
  onPhraseDeleted,
  onPhraseUpdate,
}: {
  phrases: Phrase[];
  view: ViewMode;
  onPhraseDeleted: (phraseId: string) => void;
  onPhraseUpdate: (phraseId: string, updates: Partial<Phrase>) => void;
}) {
  const [selectedPhrase, setSelectedPhrase] = useState<Phrase | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleShowDetails = (phrase: Phrase) => {
    setSelectedPhrase(phrase);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPhrase(null);
  };

  const handlePhraseUpdate = async (updatedPhrase: Phrase) => {
    if (updatedPhrase.id) {
      onPhraseUpdate(updatedPhrase.id, updatedPhrase);
    }
    handleModalClose();
  };

  const handlePhraseDelete = async () => {
    if (selectedPhrase?.id) {
      onPhraseDeleted(selectedPhrase.id);
      handleModalClose();
    }
  };

  // Add styles for 3D transforms and masonry layout
  const style = (
    <style jsx>{`
      .preserve-3d {
        transform-style: preserve-3d;
      }
      .backface-hidden {
        backface-visibility: hidden;
      }
      .break-inside-avoid {
        break-inside: avoid;
      }
    `}</style>
  );

  return (
    <>
      {style}
      <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4">
        {phrases.map((phrase) => (
          <PhraseCard
            key={phrase.id}
            phrase={phrase}
            onShowDetails={() => handleShowDetails(phrase)}
            arabicHidden={view === "flashcard"}
          />
        ))}
      </div>

      {selectedPhrase && (
        <PhraseDetailModal
          phrase={selectedPhrase}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onUpdate={handlePhraseUpdate}
          onDelete={handlePhraseDelete}
        />
      )}
    </>
  );
}
