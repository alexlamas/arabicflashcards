import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SpacedRepetitionService } from "../../services/spacedRepetitionService";
import { useAuth } from "../../contexts/AuthContext";
import { Word } from "../../types/word";
import BoostReview from "./BoostReview";
import InfoButton from "./InfoButton";
import { useWords } from "../../contexts/WordsContext";
import { useOfflineSync, offlineHelpers } from "../../hooks/useOfflineSync";
import { WordDetailModal } from "../WordDetailModal";
import {
  Eye,
  Star,
  Sparkle,
  Ghost,
  SmileyNervous,
  Balloon,
  ArrowsOutSimple,
} from "@phosphor-icons/react";
import { ArrowRight } from "lucide-react";

export function Review() {
  const { session } = useAuth();
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { fetchReviewCount } = useWords();
  const { handleOfflineAction } = useOfflineSync();

  const loadNextWord = useCallback(async () => {
    if (!session?.user) return;

    setError(null);
    try {
      const words = await SpacedRepetitionService.getDueWords(
        session.user.id,
        1
      );
      setCurrentWord(words?.[0] || null);
      setIsFlipped(false);
    } catch (error) {
      console.error("Error loading word:", error);
      setError("Failed to load words. Please try again.");
    } finally {
    }
  }, [session]);

  // Load the first word when component mounts

  useEffect(() => {
    loadNextWord();
  }, [loadNextWord]);

  const handleRating = async (rating: number) => {
    if (!session?.user || !currentWord) return;

    await handleOfflineAction(
      () =>
        SpacedRepetitionService.processReview(
          session.user.id,
          currentWord.english,
          rating
        ),
      () =>
        offlineHelpers.updateProgress(
          session.user.id,
          currentWord.english,
          rating
        )
    );

    fetchReviewCount();
    window.dispatchEvent(new CustomEvent("wordProgressUpdated"));
    await loadNextWord();
  };

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={loadNextWord}>Try Again</Button>
      </div>
    );
  }

  if (!currentWord) {
    if (!session) return null;
    return <BoostReview userId={session.user.id} loadNextWord={loadNextWord} />;
  }

  return (
    <div className="max-w-2xl w-full mx-auto px-4">
      <Card
        className="p-6 cursor-pointer shadow-md"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <CardContent className="min-h-[200px] flex items-center justify-center">
          {!isFlipped ? (
            <h3 className="text-2xl font-semibold select-none">
              {currentWord.english}
            </h3>
          ) : (
            <div className="text-center">
              <div className="text-3xl font-arabic mb-2 select-none">
                {currentWord.arabic}
              </div>
              <div className="text-sm text-gray-600 select-none">
                {currentWord.transliteration}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {!isFlipped ? (
        <div className="w-full pt-4">
          <InfoButton word={currentWord} />
        </div>
      ) : (
        <div className="w-full flex justify-end pt-4">
          <Button
            variant="ghost"
            className=" flex group"
            onClick={() => setIsModalOpen(true)}
          >
            Open
            <ArrowRight className="group-hover:translate-x-0.5 transition-all group-hover:-rotate-12" />
          </Button>
        </div>
      )}

      {isFlipped && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2 *:gap-2 *transition-all *:font-semibold">
          <Button
            variant="outline"
            onClick={() => handleRating(0)}
            className="bg-red-50 hover:bg-red-100 border-red-200 !text-red-700 flex items-center "
          >
            <Ghost className="h-4 w-4" weight="bold" />
            Forgot
          </Button>
          <Button
            variant="outline"
            onClick={() => handleRating(1)}
            className="bg-orange-50 hover:bg-orange-100 border-orange-200 !text-orange-700 flex items-center  "
          >
            <SmileyNervous weight="bold" className="h-4 w-4" />
            Struggled
          </Button>
          <Button
            variant="outline"
            onClick={() => handleRating(2)}
            className="bg-green-50 hover:bg-green-100 border-green-200 !text-green-700 flex items-center  "
          >
            <Balloon weight="bold" className="h-4 w-4" />
            Remembered
          </Button>
          <Button
            onClick={() => handleRating(3)}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:scale-105 active:scale-100 flex items-center relative overflow-hidden group shadow-lg hover:shadow-xl border-0 transition-all"
          >
            <div className="relative">
              <Star
                weight="fill"
                className="h-4 w-4 transition-transform group-hover:scale-0 group-hover:opacity-0 group-hover:rotate-12"
              />
              <Sparkle
                weight="fill"
                className="h-4 w-4 absolute inset-0 scale-0 opacity-0 transition-transform group-hover:scale-110 group-hover:opacity-100 group-hover:rotate-12"
              />
            </div>
            Perfect
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </div>
          </Button>
        </div>
      )}

      <WordDetailModal
        word={currentWord}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onWordUpdate={(updatedWord) => {
          setCurrentWord(updatedWord);
        }}
      />
    </div>
  );
}
