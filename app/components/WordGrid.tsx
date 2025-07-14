import React, { useState } from "react";
import WordList from "./WordList";
import { Word, ViewMode } from "../types/word";
import ProgressButtons from "./ProgressButtons";
import { EditWord } from "./EditWord";
import { useAuth } from "../contexts/AuthContext";

const TypeBadge = ({ type }: { type: string }) => (
  <div className="text-xs font-medium px-2 py-0.5 rounded-full border-[0.5px] border-black/10 text-gray-600 mix-blend-luminosity">
    {type}
  </div>
);

const ListCard = ({ 
  word, 
  onProgressUpdate, 
  onWordUpdate, 
  isAdmin 
}: {
  word: Word;
  onProgressUpdate: (updatedWord: Word) => void;
  onWordUpdate: (updatedWord: Word) => void;
  isAdmin: boolean;
}) => (
  <div className="p-6 rounded-lg border-[0.5px] border-gray-200 relative group">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="text-xl font-medium">{word.english}</div>
        {isAdmin && (
          <div className="group-hover:opacity-100 opacity-0 transition mix-blend-luminosity">
            <EditWord word={word} onWordUpdate={onWordUpdate} />
          </div>
        )}
      </div>
      <TypeBadge type={word.type} />
    </div>

    <div className="text-3xl mt-4 mb-3 font-arabic">{word.arabic}</div>
    <div className="text-sm text-gray-400">{word.transliteration}</div>

    <ProgressButtons word={word} onProgressUpdate={onProgressUpdate} />
  </div>
);

const FlashCard = ({ 
  word, 
  isFlipped, 
  onFlip, 
  onProgressUpdate, 
  onWordUpdate, 
  isAdmin 
}: {
  word: Word;
  isFlipped: boolean;
  onFlip: () => void;
  onProgressUpdate: (updatedWord: Word) => void;
  onWordUpdate: (updatedWord: Word) => void;
  isAdmin: boolean;
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
          </div>
          <div className="text-sm text-gray-400 group-hover:opacity-100 opacity-0 transition mix-blend-luminosity">
            Click to view
          </div>
        </div>
      </div>

      {/* Back of card */}
      <div className="absolute inset-0 w-full h-full p-6 rounded-lg shadow-xl border-[0.5px] border-gray-200 backface-hidden [transform:rotateY(180deg)]">
        <div className="flex justify-between items-start">
          <div className="text-3xl font-arabic">{word.arabic}</div>
          <TypeBadge type={word.type} />
        </div>
        <div className="text-sm text-gray-400 mt-4 mix-blend-luminosity">
          {word.transliteration}
        </div>

        <ProgressButtons word={word} onProgressUpdate={onProgressUpdate} />

        {isAdmin && (
          <div className="absolute left-2 bottom-2">
            <EditWord word={word} onWordUpdate={onWordUpdate} />
          </div>
        )}
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
  const { session } = useAuth();
  const isAdmin = session?.user.email === "lamanoujaim@gmail.com";
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  const handleFlip = (english: string) => {
    setFlipped(prev => ({ ...prev, [english]: !prev[english] }));
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {words.map((word) => (
        <div key={word.english}>
          {view === "flashcard" ? (
            <FlashCard
              word={word}
              isFlipped={flipped[word.english]}
              onFlip={() => handleFlip(word.english)}
              onProgressUpdate={onWordUpdate}
              onWordUpdate={onWordUpdate}
              isAdmin={isAdmin}
            />
          ) : (
            <ListCard
              word={word}
              onProgressUpdate={onWordUpdate}
              onWordUpdate={onWordUpdate}
              isAdmin={isAdmin}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default WordGrid;
