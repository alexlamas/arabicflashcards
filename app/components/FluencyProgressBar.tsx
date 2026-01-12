"use client";

import { useMemo } from "react";
import { Word } from "../types/word";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendUp, TrendDown, Fire } from "@phosphor-icons/react";

const LEVELS = [
  { name: "Tourist", threshold: 0, endThreshold: 50 },
  { name: "Visitor", threshold: 50, endThreshold: 150 },
  { name: "Resident", threshold: 150, endThreshold: 350 },
  { name: "Local", threshold: 350, endThreshold: 600 },
];

const MAX_WORDS = 600;

interface FluencyProgressBarProps {
  words: Word[];
  reviewsThisWeek?: number;
  reviewsLastWeek?: number;
  streak?: number;
}

export function FluencyProgressBar({ words, reviewsThisWeek, reviewsLastWeek, streak }: FluencyProgressBarProps) {
  const { learned, learning } = useMemo(() => {
    const LEARNED_INTERVAL_THRESHOLD = 7; // days
    let learned = 0;
    let learning = 0;

    words.forEach((word) => {
      // Use interval as source of truth:
      // - "learned" = interval >= 7 days (proven retention over time)
      // - "learning" = everything else (not started or interval < 7 days)
      if (word.interval && word.interval >= LEARNED_INTERVAL_THRESHOLD) {
        learned++;
      } else {
        learning++;
      }
    });

    return { learned, learning };
  }, [words]);

  return (
    <div className="border-t border-gray-200 bg-white p-5">
      {/* Level labels (above bar) - hidden on mobile */}
      <div className="hidden md:flex gap-1 mb-2">
        {LEVELS.map((level) => {
          const width = ((level.endThreshold - level.threshold) / MAX_WORDS) * 100;
          return (
            <div
              key={level.name}
              className="text-xs text-subtle"
              style={{ width: `${width}%` }}
            >
              <span className="font-medium text-body">{level.name}</span>
              <span className="ml-1">{level.endThreshold}</span>
            </div>
          );
        })}
      </div>

      {/* Segmented progress bar */}
      <div className="flex gap-1">
        {LEVELS.map((level) => {
          const segmentWidth = ((level.endThreshold - level.threshold) / MAX_WORDS) * 100;
          const segmentStart = level.threshold;
          const segmentEnd = level.endThreshold;

          // Calculate fill percentages within this segment
          const learnedInSegment = Math.max(0, Math.min(learned - segmentStart, segmentEnd - segmentStart));
          const learnedPercent = (learnedInSegment / (segmentEnd - segmentStart)) * 100;

          const totalWithLearning = learned + learning;
          const learningInSegment = Math.max(0, Math.min(totalWithLearning - segmentStart, segmentEnd - segmentStart));
          const learningPercent = (learningInSegment / (segmentEnd - segmentStart)) * 100;

          // Show minimum fill in first segment so bar isn't empty
          const isFirstSegment = level.threshold === 0;
          const showMinimum = isFirstSegment && learningPercent === 0;

          return (
            <div
              key={level.name}
              className="relative h-3 rounded-full bg-gray-200 overflow-hidden"
              style={{ width: `${segmentWidth}%` }}
            >
              {/* Learning fill */}
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-300 to-teal-300 transition-all duration-500 rounded-full"
                style={{ width: showMinimum ? '12px' : `${learningPercent}%` }}
              />
              {/* Learned fill */}
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                style={{ width: `${learnedPercent}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <TooltipProvider>
        <div className="flex items-center gap-4 mt-5 text-sm">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 cursor-help">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                <span className="text-body">Learned</span>
                <span className="font-semibold text-heading">{learned}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Words with 7+ day review intervals</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 cursor-help">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-300 to-teal-300" />
                <span className="text-body">Learning</span>
                <span className="font-semibold text-heading">{learning}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Words you&apos;re still working on</p>
            </TooltipContent>
          </Tooltip>

          {reviewsThisWeek !== undefined && reviewsThisWeek > 0 && (
            <div className="hidden md:flex items-center gap-4">
              <div className="h-4 w-px bg-gray-200" />
              <WeeklyStats thisWeek={reviewsThisWeek} lastWeek={reviewsLastWeek} />
            </div>
          )}

          {streak !== undefined && streak > 0 && (
            <>
              <div className="h-4 w-px bg-gray-200" />
              <div className="flex items-center gap-1">
                <Fire className="w-4 h-4 text-red-500" weight="fill" />
                <span className="font-semibold text-heading">{streak}</span>
                <span className="hidden md:inline text-body">day streak</span>
              </div>
            </>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
}

function WeeklyStats({ thisWeek, lastWeek }: { thisWeek: number; lastWeek?: number }) {
  const percentChange = lastWeek && lastWeek > 0
    ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100)
    : null;

  const isUp = percentChange !== null && percentChange >= 0;

  return (
    <div className="flex items-center gap-2 md:gap-3">
      <div className="flex items-center gap-1">
        <span className="font-semibold text-heading">{thisWeek}</span>
        <span className="hidden md:inline text-body">{thisWeek === 1 ? "review" : "reviews"} this week</span>
      </div>
      {percentChange !== null && (
        <span className={`text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 ${
          isUp
            ? "bg-emerald-50 text-emerald-700 font-medium"
            : "bg-red-50 text-red-600 font-medium"
        }`}>
          {isUp ? <TrendUp className="w-3 h-3 mr-0.5" weight="bold" /> : <TrendDown className="w-3 h-3 mr-0.5" weight="bold" />}{Math.abs(percentChange)}%<span className="hidden md:inline"> vs last week</span>
        </span>
      )}
    </div>
  );
}
