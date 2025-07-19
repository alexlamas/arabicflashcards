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
import { motion } from "framer-motion";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackAnimation, setFeedbackAnimation] = useState<{
    isPlaying: boolean;
    text: string;
    color: string;
    nextReviewText?: string;
  }>({ isPlaying: false, text: "", color: "" });
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

    // Keep the animation visible a bit longer
    setTimeout(() => {
      setFeedbackAnimation({ isPlaying: false, text: "", color: "" });
    }, 1800);

    // Load next word slightly earlier to overlap with fade-out
    setTimeout(async () => {
      await loadNextWord();
    }, 1750);
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card
          className="p-6 cursor-pointer shadow-md relative overflow-hidden"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <CardContent className="min-h-[200px] flex items-center justify-center relative z-10">
            <motion.div
              key={isFlipped ? "back" : "front"}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
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
            </motion.div>
          </CardContent>

          {feedbackAnimation.isPlaying && (
            <>
              <motion.div
                className={`absolute inset-0 ${feedbackAnimation.color} z-20`}
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.4,
                  ease: [0.23, 1, 0.32, 1],
                }}
              >
                {/* Gradient edge */}
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-black/10" />
              </motion.div>

              {/* Text and icon */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center z-30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: 0.3,
                  duration: 0.2,
                }}
              >
                <div className="flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: 0.35,
                      duration: 0.3,
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                    }}
                    className="text-white text-3xl font-bold flex items-center gap-3"
                  >
                    {feedbackAnimation.text === "Forgot" && (
                      <Ghost
                        size={40}
                        weight="fill"
                        className="animate-pulse"
                      />
                    )}
                    {feedbackAnimation.text === "Struggled" && (
                      <SmileyNervous
                        size={40}
                        weight="fill"
                        className="animate-pulse"
                      />
                    )}
                    {feedbackAnimation.text === "Remembered" && (
                      <Balloon
                        size={40}
                        weight="fill"
                        className="animate-bounce"
                      />
                    )}
                    {feedbackAnimation.text === "Perfect!" && (
                      <Star size={40} weight="fill" className="animate-pulse" />
                    )}
                    {feedbackAnimation.text}
                  </motion.div>
                  {feedbackAnimation.nextReviewText && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        delay: 0.45,
                        duration: 0.3,
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                      className="text-white/90 text-sm font-medium"
                    >
                      {feedbackAnimation.nextReviewText}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </Card>
      </motion.div>

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
        <motion.div
          className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2 *:gap-2 *transition-all *:font-semibold"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={{
              hidden: { y: 20, opacity: 0 },
              show: {
                y: 0,
                opacity: 1,
                transition: {
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
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
              hidden: { y: 20, opacity: 0 },
              show: {
                y: 0,
                opacity: 1,
                transition: {
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
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
              hidden: { y: 20, opacity: 0 },
              show: {
                y: 0,
                opacity: 1,
                transition: {
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
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
              hidden: { y: 20, opacity: 0 },
              show: {
                y: 0,
                opacity: 1,
                transition: {
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
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
          // If word is archived, close modal and load next word
          if (updatedWord.status === "archived") {
            setIsModalOpen(false);
            loadNextWord();
          } else {
            setCurrentWord(updatedWord);
          }
        }}
      />
    </div>
  );
}
