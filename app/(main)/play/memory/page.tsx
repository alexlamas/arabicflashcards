"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useWords } from "@/app/contexts/WordsContext";
import { Button } from "@/components/ui/button";
import {
  ShuffleIcon,
  TrophyIcon,
  ArrowClockwise,
  Cards,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MemoryCard {
  id: string;
  wordId: string;
  content: string;
  transliteration?: string;
  type: "arabic" | "english";
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryGamePage() {
  const router = useRouter();
  const { session } = useAuth();
  const { words } = useWords();
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [gameState, setGameState] = useState<"playing" | "complete">("playing");

  const learningWords = words.filter((word) => word.status === "learning");

  const initializeGame = useCallback(() => {
    const gameWords = learningWords
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(6, learningWords.length));

    const memoryCards: MemoryCard[] = [];

    gameWords.forEach((word) => {
      memoryCards.push({
        id: `${word.id}-arabic`,
        wordId: word.id!,
        content: word.arabic,
        transliteration: word.transliteration,
        type: "arabic",
        isFlipped: false,
        isMatched: false,
      });

      memoryCards.push({
        id: `${word.id}-english`,
        wordId: word.id!,
        content: word.english,
        type: "english",
        isFlipped: false,
        isMatched: false,
      });
    });

    const shuffledCards = memoryCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setSelectedCards([]);
    setMoves(0);
    setMatches(0);
    setGameState("playing");
  }, [learningWords]);

  // Auto-start game on mount
  useEffect(() => {
    if (learningWords.length >= 2 && cards.length === 0) {
      initializeGame();
    }
  }, [learningWords, cards.length, initializeGame]);

  const handleCardClick = (cardId: string) => {
    if (isChecking || gameState !== "playing") return;

    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || selectedCards.length >= 2)
      return;

    const newCards = cards.map((c) =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);

    const newSelected = [...selectedCards, cardId];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setIsChecking(true);
      checkForMatch(newSelected, newCards);
    }
  };

  const checkForMatch = (selected: string[], currentCards: MemoryCard[]) => {
    const [firstId, secondId] = selected;
    const firstCard = currentCards.find((c) => c.id === firstId);
    const secondCard = currentCards.find((c) => c.id === secondId);

    if (!firstCard || !secondCard) return;

    setMoves((prev) => prev + 1);

    if (
      firstCard.wordId === secondCard.wordId &&
      firstCard.type !== secondCard.type
    ) {
      setTimeout(() => {
        setCards((prev) =>
          prev.map((c) =>
            c.wordId === firstCard.wordId ? { ...c, isMatched: true } : c
          )
        );
        setMatches((prev) => {
          const newMatches = prev + 1;
          if (newMatches === currentCards.length / 2) {
            setGameState("complete");
          }
          return newMatches;
        });
        setSelectedCards([]);
        setIsChecking(false);
      }, 800);
    } else {
      setTimeout(() => {
        setCards((prev) =>
          prev.map((c) =>
            c.id === firstId || c.id === secondId
              ? { ...c, isFlipped: false }
              : c
          )
        );
        setSelectedCards([]);
        setIsChecking(false);
      }, 1200);
    }
  };

  // Auth check
  if (!session) {
    return (
      <div className="pt-8 px-6 md:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <p className="text-muted-foreground">
              Please log in to play Memory
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Not enough words - redirect to /play
  if (learningWords.length < 2) {
    return (
      <div className="pt-8 px-6 md:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <Cards className="w-12 h-12 text-gray-300 mx-auto mb-4" weight="duotone" />
            <p className="text-muted-foreground mb-4">
              You need at least 2 learning words to play Memory.
            </p>
            <Button onClick={() => router.push("/")} className="rounded-full">
              Browse words
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Complete state
  if (gameState === "complete") {
    const efficiency = Math.round((cards.length / 2 / moves) * 100);

    return (
      <div className="pt-8 px-6 md:px-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-50 rounded-2xl p-8 md:p-12 text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <TrophyIcon
                className="w-16 h-16 text-amber-500 mx-auto mb-4"
                weight="fill"
              />
            </motion.div>

            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-heading">
              {efficiency >= 80 ? "Perfect!" : efficiency >= 50 ? "Well done!" : "Good effort!"}
            </h2>

            <div className="text-5xl font-bold text-blue-600 mb-2">
              {moves} <span className="text-2xl text-muted-foreground font-normal">moves</span>
            </div>

            <p className="text-muted-foreground mb-8">
              {cards.length / 2} pairs matched
            </p>

            <div className="flex gap-3 justify-center">
              <Button
                onClick={initializeGame}
                className="rounded-full gap-2 bg-blue-600 hover:bg-blue-500"
              >
                <ArrowClockwise className="w-4 h-4" />
                Play again
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/review")}
                className="rounded-full"
              >
                Go to review
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Playing state
  return (
    <div className="pt-8 px-6 md:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm">
            <span className="text-muted-foreground">Moves: </span>
            <span className="font-medium">{moves}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={initializeGame}
            className="rounded-full gap-1.5"
          >
            <ShuffleIcon className="h-4 w-4" />
            Shuffle
          </Button>

          <div className="text-sm">
            <span className="text-muted-foreground">Matched: </span>
            <span className="font-medium">{matches}/{cards.length / 2}</span>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {cards.map((card) => (
            <motion.button
              key={card.id}
              whileHover={!card.isFlipped && !card.isMatched ? { scale: 1.02 } : {}}
              whileTap={!card.isFlipped && !card.isMatched ? { scale: 0.98 } : {}}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isFlipped || card.isMatched || isChecking}
              className={cn(
                "aspect-square rounded-xl border-2 flex items-center justify-center p-3 transition-all relative overflow-hidden",
                card.isFlipped || card.isMatched
                  ? "bg-white border-gray-200"
                  : card.type === "arabic"
                  ? "bg-blue-50 border-blue-200 hover:border-blue-300 hover:bg-blue-100"
                  : "bg-emerald-50 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-100",
                card.isMatched && "opacity-50"
              )}
            >
              {!card.isFlipped && !card.isMatched && (
                <div
                  className={cn(
                    "absolute top-2 right-2 w-2.5 h-2.5 rounded-full",
                    card.type === "arabic" ? "bg-blue-400" : "bg-emerald-400"
                  )}
                />
              )}
              <div className="text-center">
                {card.isFlipped || card.isMatched ? (
                  <div className="flex flex-col gap-1">
                    <span
                      className={cn(
                        "break-words max-w-full px-1",
                        card.type === "arabic" ? "text-xl md:text-2xl font-arabic" : "text-sm md:text-base"
                      )}
                    >
                      {card.content}
                    </span>
                    {card.type === "arabic" && card.transliteration && (
                      <span className="text-xs text-muted-foreground">
                        {card.transliteration}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-2xl text-muted-foreground">?</span>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Legend */}
        <div className="text-xs text-muted-foreground text-center mt-6 flex items-center justify-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            Arabic
          </span>
          <span className="inline-flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            English
          </span>
        </div>
      </div>
    </div>
  );
}
