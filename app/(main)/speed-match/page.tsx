"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useWords } from "@/app/contexts/WordsContext";
import { Word } from "@/app/types/word";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  TrophyIcon,
  PlayIcon,
  ArrowClockwise,
  Timer,
  CheckCircle,
  XCircle,
  Clock,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Question {
  word: Word;
  options: string[];
  correctIndex: number;
}

type AnswerResult = "correct" | "wrong" | "timeout";
type GameState = "ready" | "playing" | "feedback" | "complete";

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
  const [gameState, setGameState] = useState<GameState>("ready");
  const [answers, setAnswers] = useState<AnswerResult[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Get learning words
  const learningWords = words.filter((word) => word.status === "learning");

  const generateQuestions = useCallback(() => {
    if (learningWords.length < 4) return [];

    // Shuffle and take up to QUESTIONS_PER_GAME words
    const shuffled = [...learningWords].sort(() => Math.random() - 0.5);
    const gameWords = shuffled.slice(
      0,
      Math.min(QUESTIONS_PER_GAME, shuffled.length)
    );

    // Get all unique English translations for distractors
    const allTranslations = learningWords.map((w) => w.english);

    return gameWords.map((word) => {
      // Get 3 random wrong answers (different from correct answer)
      const wrongOptions = allTranslations
        .filter((t) => t !== word.english)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      // Combine correct answer with wrong ones and shuffle
      const options = [word.english, ...wrongOptions].sort(
        () => Math.random() - 0.5
      );
      const correctIndex = options.indexOf(word.english);

      return {
        word,
        options,
        correctIndex,
      };
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

      // Stop the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setSelectedOption(optionIndex);
      const isCorrect =
        optionIndex === questions[currentIndex]?.correctIndex;

      if (isCorrect) {
        setScore((prev) => prev + 1);
        setAnswers((prev) => [...prev, "correct"]);
      } else {
        setAnswers((prev) => [...prev, "wrong"]);
      }

      setGameState("feedback");

      // Brief pause to show feedback, then advance
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

  // Timer effect
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            Please log in to play Speed Match
          </p>
        </Card>
      </div>
    );
  }

  // Not enough words
  if (learningWords.length < 4) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            You need at least 4 learning words to play Speed Match.
          </p>
          <Button onClick={() => router.push("/")}>Browse words</Button>
        </Card>
      </div>
    );
  }

  // Ready state - show start screen
  if (gameState === "ready") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <Card className="p-8 text-center max-w-md w-full">
          <Timer className="w-16 h-16 text-emerald-500 mx-auto mb-4" weight="duotone" />
          <h2 className="text-2xl font-bold mb-2">Speed Match</h2>
          <p className="text-muted-foreground mb-6">
            Match Arabic words to their English translations as fast as you can!
            You have {SECONDS_PER_QUESTION} seconds per question.
          </p>
          <div className="text-sm text-muted-foreground mb-6">
            {Math.min(QUESTIONS_PER_GAME, learningWords.length)} questions from
            your {learningWords.length} learning words
          </div>
          <Button
            size="lg"
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 rounded-full gap-2"
            onClick={startGame}
          >
            <PlayIcon weight="fill" className="w-5 h-5" />
            Start game
          </Button>
        </Card>
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <Card className="p-8 text-center max-w-md w-full">
          <TrophyIcon
            className={cn(
              "w-16 h-16 mx-auto mb-4",
              percentage >= 80
                ? "text-yellow-500"
                : percentage >= 50
                ? "text-gray-400"
                : "text-orange-400"
            )}
            weight="duotone"
          />
          <h2 className="text-2xl font-bold mb-2">
            {percentage >= 80
              ? "Excellent!"
              : percentage >= 50
              ? "Good job!"
              : "Keep practicing!"}
          </h2>
          <p className="text-4xl font-bold text-emerald-600 mb-2">
            {score}/{questions.length}
          </p>
          <p className="text-muted-foreground mb-6">{percentage}% correct</p>

          {/* Results breakdown */}
          <div className="flex justify-center gap-6 mb-6 text-sm">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" weight="fill" />
              <span>{correctCount} correct</span>
            </div>
            <div className="flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-red-500" weight="fill" />
              <span>{wrongCount} wrong</span>
            </div>
            {timeoutCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" weight="fill" />
                <span>{timeoutCount} timeout</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-center">
            <Button onClick={startGame} className="rounded-full gap-2">
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
        </Card>
      </div>
    );
  }

  // Playing state
  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return null;

  const isFeedback = gameState === "feedback";
  const wasTimeout = isFeedback && selectedOption === null;

  return (
    <div className="w-full px-4 py-6 pt-12">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {questions.length}
          </span>

          {/* Timer */}
          <div
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
              timeLeft <= 2
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700"
            )}
          >
            <Timer className="w-4 h-4" weight="bold" />
            {timeLeft}s
          </div>

          <span className="text-sm font-medium">
            Score: <span className="text-emerald-600">{score}</span>
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-200 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        {/* Question card */}
        <Card
          className={cn(
            "p-8 text-center mb-6 transition-colors",
            isFeedback && wasTimeout && "bg-amber-50 border-amber-200"
          )}
        >
          <div className="text-4xl md:text-5xl font-arabic mb-3">
            {currentQuestion.word.arabic}
          </div>
          <div className="text-lg text-muted-foreground">
            {currentQuestion.word.transliteration}
          </div>
          {isFeedback && wasTimeout && (
            <div className="mt-4 text-amber-600 font-medium flex items-center justify-center gap-2">
              <Clock className="w-5 h-5" weight="fill" />
              Time&apos;s up!
            </div>
          )}
        </Card>

        {/* Options grid */}
        <div className="grid grid-cols-2 gap-3">
          {currentQuestion.options.map((option, index) => {
            const isCorrect = index === currentQuestion.correctIndex;
            const isSelected = selectedOption === index;

            let buttonStyle = "bg-white hover:bg-gray-50 border-gray-200";
            if (isFeedback) {
              if (isCorrect) {
                buttonStyle = "bg-emerald-100 border-emerald-400 text-emerald-800";
              } else if (isSelected && !isCorrect) {
                buttonStyle = "bg-red-100 border-red-400 text-red-800";
              } else {
                buttonStyle = "bg-gray-50 border-gray-200 text-gray-400";
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={isFeedback}
                className={cn(
                  "p-4 md:p-6 rounded-xl border-2 text-base md:text-lg font-medium transition-all",
                  buttonStyle,
                  !isFeedback && "active:scale-95"
                )}
              >
                {option}
              </button>
            );
          })}
        </div>

        {/* Show correct answer on timeout */}
        {isFeedback && wasTimeout && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Correct answer:{" "}
            <span className="font-medium text-emerald-600">
              {currentQuestion.options[currentQuestion.correctIndex]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
