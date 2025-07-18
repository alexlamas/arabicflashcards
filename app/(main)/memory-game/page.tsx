"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useWords } from "@/app/contexts/WordsContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Shuffle, Trophy } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

interface MemoryCard {
  id: string;
  wordId: string;
  content: string;
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
  const [gameComplete, setGameComplete] = useState(false);

  // Get learning words
  const learningWords = words.filter((word) => word.status === "learning");

  useEffect(() => {
    if (learningWords.length > 0) {
      initializeGame();
    }
  }, [learningWords.length]);

  const initializeGame = () => {
    // Take up to 6 random learning words for the game
    const gameWords = learningWords
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(6, learningWords.length));

    // Create memory cards (each word creates 2 cards: arabic and english)
    const memoryCards: MemoryCard[] = [];

    gameWords.forEach((word) => {
      // Arabic card
      memoryCards.push({
        id: `${word.id}-arabic`,
        wordId: word.id!,
        content: word.arabic,
        type: "arabic",
        isFlipped: false,
        isMatched: false,
      });

      // English card
      memoryCards.push({
        id: `${word.id}-english`,
        wordId: word.id!,
        content: word.english,
        type: "english",
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle cards
    const shuffledCards = memoryCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setSelectedCards([]);
    setMoves(0);
    setMatches(0);
    setGameComplete(false);
  };

  const handleCardClick = (cardId: string) => {
    if (isChecking) return;

    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newCards = cards.map((c) =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);

    const newSelected = [...selectedCards, cardId];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setIsChecking(true);
      checkForMatch(newSelected);
    }
  };

  const checkForMatch = (selected: string[]) => {
    const [firstId, secondId] = selected;
    const firstCard = cards.find((c) => c.id === firstId);
    const secondCard = cards.find((c) => c.id === secondId);

    if (!firstCard || !secondCard) return;

    setMoves((prev) => prev + 1);

    if (
      firstCard.wordId === secondCard.wordId &&
      firstCard.type !== secondCard.type
    ) {
      // Match found!
      setTimeout(() => {
        setCards((prev) =>
          prev.map((c) =>
            c.wordId === firstCard.wordId ? { ...c, isMatched: true } : c
          )
        );
        setMatches((prev) => {
          const newMatches = prev + 1;
          if (newMatches === cards.length / 2) {
            setGameComplete(true);
          }
          return newMatches;
        });
        setSelectedCards([]);
        setIsChecking(false);
      }, 1000);
    } else {
      // No match - flip cards back
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
      }, 1500);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            Please log in to play the memory game
          </p>
        </Card>
      </div>
    );
  }

  if (learningWords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            There are no words in your learning list yet.
          </p>
          <Button onClick={() => router.push("/")}>Browse Words</Button>
        </Card>
      </div>
    );
  }

  if (gameComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Card className="p-8 text-center max-w-md">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
          <p className="text-muted-foreground mb-4">
            You completed the game in {moves} moves
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={initializeGame}>Play Again</Button>
            <Button variant="outline" onClick={() => router.push("/review")}>
              Go to Review
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Memory Game</h1>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={initializeGame}
            title="Restart game"
          >
            <Shuffle className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex justify-between mb-6 text-sm text-muted-foreground">
          <span>Moves: {moves}</span>
          <span>
            Matches: {matches}/{cards.length / 2}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {cards.map((card) => (
            <Card
              key={card.id}
              className={`aspect-square flex items-center justify-center p-3 cursor-pointer transition-all relative overflow-hidden ${
                card.isFlipped || card.isMatched
                  ? "bg-primary/10"
                  : card.type === "arabic"
                  ? "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-950/30"
                  : "bg-green-50 hover:bg-green-100 dark:bg-green-950/20 dark:hover:bg-green-950/30"
              } ${card.isMatched ? "opacity-50" : ""}`}
              onClick={() => handleCardClick(card.id)}
            >
              {!card.isFlipped && !card.isMatched && (
                <div
                  className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                    card.type === "arabic"
                      ? "bg-blue-400 dark:bg-blue-600"
                      : "bg-green-400 dark:bg-green-600"
                  }`}
                />
              )}
              <div className="text-center">
                {card.isFlipped || card.isMatched ? (
                  <span
                    className={`${
                      card.type === "arabic"
                        ? "text-2xl font-arabic"
                        : "text-base"
                    } break-words max-w-full px-2`}
                  >
                    {card.content}
                  </span>
                ) : (
                  <span className="text-3xl text-muted-foreground">?</span>
                )}
              </div>
            </Card>
          ))}
        </div>

        <div className="text-sm text-muted-foreground text-center mt-6 flex flex-col gap-1">
          <p>Match Arabic words with their English translations</p>
          <p className="text-xs">
            <span className="inline-flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-400 dark:bg-blue-600" />
              Arabic
            </span>
            <span className="mx-2">•</span>
            <span className="inline-flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-400 dark:bg-green-600" />
              English
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
