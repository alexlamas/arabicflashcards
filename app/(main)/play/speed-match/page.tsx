"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useWords } from "@/app/contexts/WordsContext";
import { Word } from "@/app/types/word";
import { Button } from "@/components/ui/button";
import {
  TrophyIcon,
  ArrowClockwise,
  Lightning,
  CheckCircle,
  XCircle,
  Clock,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  word: Word;
  options: string[];
  correctIndex: number;
}

type AnswerResult = "correct" | "wrong" | "timeout";
type GameState = "playing" | "feedback" | "complete";

const QUESTIONS_PER_GAME = 10;
const SECONDS_PER_QUESTION = 5;

export default function SpeedMatchPage() {
  const router = useRouter();
  const { session } = useAuth();
  const { words } = useWords();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [gameState, setGameState] = useState<GameState>("playing");
  const [answers, setAnswers] = useState<AnswerResult[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const learningWords = words.filter((word) => word.status === "learning");

  const generateQuestions = useCallback(() => {
    if (learningWords.length < 4) return [];

    const shuffled = [...learningWords].sort(() => Math.random() - 0.5);
    const gameWords = shuffled.slice(
      0,
      Math.min(QUESTIONS_PER_GAME, shuffled.length)
    );

    const allTranslations = learningWords.map((w) => w.english);

    return gameWords.map((word) => {
      const wrongOptions = allTranslations
        .filter((t) => t !== word.english)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const options = [word.english, ...wrongOptions].sort(
        () => Math.random() - 0.5
      );
      const correctIndex = options.indexOf(word.english);

      return { word, options, correctIndex };
    });
  }, [learningWords]);

  const startGame = useCallback(() => {
    const newQuestions = generateQuestions();
    if (newQuestions.length === 0) return;

    setQuestions(newQuestions);
    setCurrentIndex(0);
    setScore(0);
    setTimeLeft(SECONDS_PER_QUESTION);
    setAnswers([]);
    setSelectedOption(null);
    setGameState("playing");
  }, [generateQuestions]);

  // Auto-start game on mount
  useEffect(() => {
    if (learningWords.length >= 4 && questions.length === 0) {
      startGame();
    }
  }, [learningWords, questions.length, startGame]);

  const advanceToNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      setGameState("complete");
    } else {
      setCurrentIndex((prev) => prev + 1);
      setTimeLeft(SECONDS_PER_QUESTION);
      setSelectedOption(null);
      setGameState("playing");
    }
  }, [currentIndex, questions.length]);

  const handleAnswer = useCallback(
    (optionIndex: number) => {
      if (gameState !== "playing") return;

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setSelectedOption(optionIndex);
      const isCorrect = optionIndex === questions[currentIndex]?.correctIndex;

      if (isCorrect) {
        setScore((prev) => prev + 1);
        setAnswers((prev) => [...prev, "correct"]);
      } else {
        setAnswers((prev) => [...prev, "wrong"]);
      }

      setGameState("feedback");

      setTimeout(() => {
        advanceToNext();
      }, 800);
    },
    [gameState, questions, currentIndex, advanceToNext]
  );

  const handleTimeout = useCallback(() => {
    if (gameState !== "playing") return;

    setAnswers((prev) => [...prev, "timeout"]);
    setGameState("feedback");

    setTimeout(() => {
      advanceToNext();
    }, 800);
  }, [gameState, advanceToNext]);

  useEffect(() => {
    if (gameState !== "playing") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState, currentIndex, handleTimeout]);

  // Auth check
  if (!session) {
    return (
      <div className="pt-8 px-6 md:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <p className="text-muted-foreground">
              Please log in to play Speed Match
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Not enough words
  if (learningWords.length < 4) {
    return (
      <div className="pt-8 px-6 md:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <Lightning className="w-12 h-12 text-gray-300 mx-auto mb-4" weight="duotone" />
            <p className="text-muted-foreground mb-4">
              You need at least 4 learning words to play Speed Match.
            </p>
            <Button onClick={() => router.push("/")} className="rounded-full">
              Browse words
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Game complete
  if (gameState === "complete") {
    const percentage = Math.round((score / questions.length) * 100);
    const correctCount = answers.filter((a) => a === "correct").length;
    const wrongCount = answers.filter((a) => a === "wrong").length;
    const timeoutCount = answers.filter((a) => a === "timeout").length;

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
              {percentage >= 80 ? "Amazing!" : percentage >= 50 ? "Good job!" : "Keep practicing!"}
            </h2>

            <div className="text-5xl font-bold text-emerald-600 mb-2">
              {score}<span className="text-2xl text-muted-foreground font-normal">/{questions.length}</span>
            </div>

            <p className="text-muted-foreground mb-6">{percentage}% correct</p>

            {/* Results breakdown */}
            <div className="inline-flex items-center gap-4 bg-white border rounded-full px-5 py-2.5 mb-8">
              <div className="flex items-center gap-1.5 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-500" weight="fill" />
                <span className="font-medium">{correctCount}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <XCircle className="w-4 h-4 text-red-500" weight="fill" />
                <span className="font-medium">{wrongCount}</span>
              </div>
              {timeoutCount > 0 && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Clock className="w-4 h-4 text-amber-500" weight="fill" />
                  <span className="font-medium">{timeoutCount}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                onClick={startGame}
                className="rounded-full gap-2 bg-emerald-600 hover:bg-emerald-500"
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
  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return null;

  const isFeedback = gameState === "feedback";
  const wasTimeout = isFeedback && selectedOption === null;
  const wasCorrect = isFeedback && selectedOption === currentQuestion.correctIndex;
  const wasWrong = isFeedback && selectedOption !== null && selectedOption !== currentQuestion.correctIndex;

  return (
    <div className="pt-8 px-6 md:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {questions.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i < currentIndex
                    ? answers[i] === "correct"
                      ? "w-2 bg-emerald-500"
                      : "w-2 bg-red-400"
                    : i === currentIndex
                    ? "w-6 bg-emerald-500"
                    : "w-2 bg-gray-200"
                )}
              />
            ))}
          </div>

          {/* Score */}
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-500" weight="fill" />
            <span>{score}</span>
          </div>
        </div>

        {/* Timer bar */}
        <div className="h-1.5 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <motion.div
            key={currentIndex}
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: SECONDS_PER_QUESTION, ease: "linear" }}
            className={cn(
              "h-full rounded-full",
              timeLeft <= 2 ? "bg-red-500" : "bg-emerald-500"
            )}
          />
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={cn(
                "rounded-2xl p-8 md:p-10 text-center mb-6 transition-colors border-2",
                isFeedback && wasCorrect && "bg-emerald-50 border-emerald-200",
                isFeedback && wasWrong && "bg-red-50 border-red-200",
                isFeedback && wasTimeout && "bg-amber-50 border-amber-200",
                !isFeedback && "bg-gray-50 border-transparent"
              )}
            >
              <div className="text-4xl md:text-5xl font-arabic mb-3">
                {currentQuestion.word.arabic}
              </div>
              <div className="text-base text-muted-foreground">
                {currentQuestion.word.transliteration}
              </div>

              {isFeedback && wasTimeout && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-amber-600 font-medium flex items-center justify-center gap-2"
                >
                  <Clock className="w-5 h-5" weight="fill" />
                  Time&apos;s up!
                </motion.div>
              )}

              {isFeedback && wasCorrect && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 text-emerald-600 font-medium flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" weight="fill" />
                  Correct!
                </motion.div>
              )}

              {isFeedback && wasWrong && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 text-red-600 font-medium flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" weight="fill" />
                  Wrong
                </motion.div>
              )}
            </div>

            {/* Options grid */}
            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.options.map((option, index) => {
                const isCorrect = index === currentQuestion.correctIndex;
                const isSelected = selectedOption === index;

                return (
                  <motion.button
                    key={index}
                    whileHover={!isFeedback ? { scale: 1.02 } : {}}
                    whileTap={!isFeedback ? { scale: 0.98 } : {}}
                    onClick={() => handleAnswer(index)}
                    disabled={isFeedback}
                    className={cn(
                      "p-4 md:p-5 rounded-xl border-2 text-base font-medium transition-all",
                      !isFeedback && "bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50",
                      isFeedback && isCorrect && "bg-emerald-500 border-emerald-500 text-white",
                      isFeedback && isSelected && !isCorrect && "bg-red-500 border-red-500 text-white",
                      isFeedback && !isCorrect && !isSelected && "bg-gray-50 border-gray-100 text-gray-300"
                    )}
                  >
                    {option}
                  </motion.button>
                );
              })}
            </div>

            {/* Show correct answer on timeout */}
            {isFeedback && wasTimeout && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-center text-sm text-muted-foreground"
              >
                Correct answer:{" "}
                <span className="font-semibold text-emerald-600">
                  {currentQuestion.options[currentQuestion.correctIndex]}
                </span>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
