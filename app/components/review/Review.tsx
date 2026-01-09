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
import { motion, AnimatePresence } from "framer-motion";
import { formatTimeUntilReview } from "../../utils/formatReviewTime";
import {
  Star,
  Sparkle,
  Ghost,
  SmileyNervous,
  Balloon,
} from "@phosphor-icons/react";
import { ArrowRight } from "lucide-react";

export function Review() {
  const { session } = useAuth();
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackAnimation, setFeedbackAnimation] = useState<{
    isPlaying: boolean;
    text: string;
    color: string;
    nextReviewText?: string;
  }>({ isPlaying: false, text: "", color: "" });
  const { fetchReviewCount } = useWords();
  const { handleOfflineAction } = useOfflineSync();

  const loadNextWord = useCallback(async (showLoading = true) => {
    if (!session?.user) return;

    setError(null);
    if (showLoading) setIsLoading(true);
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
      setIsLoading(false);
    }
  }, [session]);

  // Load the first word when component mounts

  useEffect(() => {
    loadNextWord();
  }, [loadNextWord]);

  const handleRating = async (rating: number) => {
    if (!session?.user || !currentWord) return;

    // Show feedback animation
    const feedbackText =
      rating === 0
        ? "Forgot"
        : rating === 1
        ? "Struggled"
        : rating === 2
        ? "Remembered"
        : "Perfect!";
    const feedbackColor =
      rating === 0
        ? "bg-red-500"
        : rating === 1
        ? "bg-orange-500"
        : rating === 2
        ? "bg-green-500"
        : "bg-emerald-500";

    setFeedbackAnimation({
      isPlaying: true,
      text: feedbackText,
      color: feedbackColor,
    });

    const result = await handleOfflineAction(
      () =>
        SpacedRepetitionService.processReview(
          session.user.id,
          currentWord.id,
          rating
        ),
      () =>
        offlineHelpers.updateProgress(
          session.user.id,
          currentWord.id,
          rating
        )
    );

    // Calculate next review time text
    let nextReviewText = "";
    if (result && result.nextReview) {
      const formattedTime = formatTimeUntilReview(
        result.nextReview.toISOString()
      );
      if (formattedTime) {
        if (formattedTime === "Today") {
          nextReviewText = "Later today";
        } else if (formattedTime === "Tomorrow") {
          nextReviewText = "Tomorrow";
        } else if (formattedTime === "Next week") {
          nextReviewText = "In a week";
        } else if (formattedTime === "Next month") {
          nextReviewText = "In a month";
        } else if (formattedTime.includes("days")) {
          nextReviewText = `In ${formattedTime}`;
        } else if (formattedTime.includes("weeks")) {
          nextReviewText = `In ${formattedTime}`;
        } else if (formattedTime.includes("months")) {
          nextReviewText = `In ${formattedTime}`;
        } else {
          nextReviewText = formattedTime;
        }
      }
    }

    setFeedbackAnimation({
      isPlaying: true,
      text: feedbackText,
      color: feedbackColor,
      nextReviewText: nextReviewText,
    });

    fetchReviewCount();
    window.dispatchEvent(new CustomEvent("wordProgressUpdated"));

    // Clear animation to trigger exit, then load next word
    setTimeout(() => {
      setFeedbackAnimation({ isPlaying: false, text: "", color: "" });
    }, 600);

    // Load next word after exit animation completes (skip loading skeleton)
    setTimeout(async () => {
      await loadNextWord(false);
    }, 800);
  };

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => loadNextWord()}>Try Again</Button>
      </div>
    );
  }

  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className="max-w-2xl w-full mx-auto">
        <div className="p-6 rounded-lg border shadow-md bg-white">
          <div className="min-h-[200px] flex items-center justify-center">
            <div className="space-y-4 w-full max-w-xs">
              <div className="h-8 bg-gray-200 rounded-md animate-pulse mx-auto w-3/4" />
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="h-10 bg-gray-100 rounded-md animate-pulse" />
          <div className="h-10 bg-gray-100 rounded-md animate-pulse" />
          <div className="h-10 bg-gray-100 rounded-md animate-pulse" />
          <div className="h-10 bg-gray-100 rounded-md animate-pulse" />
        </div>
      </div>
    );
  }

  if (!currentWord) {
    if (!session) return null;
    return <BoostReview userId={session.user.id} loadNextWord={loadNextWord} />;
  }

  return (
    <div className="max-w-2xl w-full mx-auto">
      <Card
        className="w-full p-6 cursor-pointer shadow-md relative overflow-hidden"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <CardContent className="min-h-[200px] flex items-center justify-center relative z-10">
          <motion.div
            key={`${currentWord.id}-${isFlipped ? "back" : "front"}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            {!isFlipped ? (
              <h3 className="text-2xl font-semibold select-none text-center">
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
          </motion.div>
        </CardContent>

          {/* Open button in bottom right of card */}
          {isFlipped && (
            <div className="absolute bottom-3 right-3 z-10">
              <Button
                variant="ghost"
                size="sm"
                className="flex group text-gray-500 hover:text-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(true);
                }}
              >
                Open
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-all group-hover:-rotate-12" />
              </Button>
            </div>
          )}

          <AnimatePresence>
            {feedbackAnimation.isPlaying && (
              <motion.div
                key="feedback-overlay"
                className={`absolute inset-0 ${feedbackAnimation.color} z-20 flex items-center justify-center`}
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.2,
                  ease: [0.23, 1, 0.32, 1],
                }}
              >
                {/* Gradient edge */}
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-black/10" />

                {/* Text and icon */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.15,
                    duration: 0.15,
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                  }}
                  className="relative z-30 flex flex-col items-center"
                >
                  <div className="text-white flex flex-col items-center gap-2">
                    {feedbackAnimation.text === "Forgot" && (
                      <Ghost size={48} weight="fill" />
                    )}
                    {feedbackAnimation.text === "Struggled" && (
                      <SmileyNervous size={48} weight="fill" />
                    )}
                    {feedbackAnimation.text === "Remembered" && (
                      <Balloon size={48} weight="fill" />
                    )}
                    {feedbackAnimation.text === "Perfect!" && (
                      <Star size={48} weight="fill" />
                    )}
                    <span className="text-2xl font-bold">{feedbackAnimation.text}</span>
                  </div>
                  {feedbackAnimation.nextReviewText && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        delay: 0.05,
                        duration: 0.1,
                      }}
                      className="mt-2 text-white/90 text-sm font-medium"
                    >
                      {feedbackAnimation.nextReviewText}
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

      {!isFlipped && (
        <div className="w-full pt-4">
          <InfoButton word={currentWord} />
        </div>
      )}

      {isFlipped && (
        <motion.div
          className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2 *:gap-2 *transition-all *:font-semibold"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.03,
              },
            },
          }}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={{
              hidden: { y: 8, opacity: 0 },
              show: {
                y: 0,
                opacity: 1,
                transition: {
                  duration: 0.15,
                  ease: "easeOut",
                },
              },
            }}
          >
            <Button
              variant="outline"
              onClick={() => handleRating(0)}
              className="bg-red-50 hover:bg-red-100 border-red-200 !text-red-700 flex items-center w-full"
            >
              <Ghost className="h-4 w-4" weight="bold" />
              Forgot
            </Button>
          </motion.div>
          <motion.div
            variants={{
              hidden: { y: 8, opacity: 0 },
              show: {
                y: 0,
                opacity: 1,
                transition: {
                  duration: 0.15,
                  ease: "easeOut",
                },
              },
            }}
          >
            <Button
              variant="outline"
              onClick={() => handleRating(1)}
              className="bg-orange-50 hover:bg-orange-100 border-orange-200 !text-orange-700 flex items-center w-full"
            >
              <SmileyNervous weight="bold" className="h-4 w-4" />
              Struggled
            </Button>
          </motion.div>
          <motion.div
            variants={{
              hidden: { y: 8, opacity: 0 },
              show: {
                y: 0,
                opacity: 1,
                transition: {
                  duration: 0.15,
                  ease: "easeOut",
                },
              },
            }}
          >
            <Button
              variant="outline"
              onClick={() => handleRating(2)}
              className="bg-green-50 hover:bg-green-100 border-green-200 !text-green-700 flex items-center w-full"
            >
              <Balloon weight="bold" className="h-4 w-4" />
              Remembered
            </Button>
          </motion.div>
          <motion.div
            variants={{
              hidden: { y: 8, opacity: 0 },
              show: {
                y: 0,
                opacity: 1,
                transition: {
                  duration: 0.15,
                  ease: "easeOut",
                },
              },
            }}
          >
            <Button
              onClick={() => handleRating(3)}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:scale-105 active:scale-100 flex items-center relative overflow-hidden group shadow-lg hover:shadow-xl border-0 transition-all w-full"
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
          </motion.div>
        </motion.div>
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
