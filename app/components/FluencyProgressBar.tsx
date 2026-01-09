"use client";

import { useMemo } from "react";
import { Word } from "../types/word";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendUp } from "@phosphor-icons/react";

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
}

export function FluencyProgressBar({ words, reviewsThisWeek, reviewsLastWeek }: FluencyProgressBarProps) {
  const { learned, learning } = useMemo(() => {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneMonth = 30 * oneDay;
    const oneDayFromNow = new Date(now.getTime() + oneDay);
    const oneMonthFromNow = new Date(now.getTime() + oneMonth);

    let learned = 0;
    let learning = 0;

    words.forEach((word) => {
      if (!word.status || word.status === "new") {
        return;
      }

      if (!word.next_review_date) {
        return;
      }

      const reviewDate = new Date(word.next_review_date);

      if (reviewDate > oneMonthFromNow) {
        learned++;
      } else if (reviewDate > oneDayFromNow) {
        learning++;
      }
    });

    return { learned, learning };
  }, [words]);

  return (
    <div className="border-t border-gray-200 bg-white p-5">
      {/* Level labels (above bar) */}
      <div className="flex gap-1 mb-2">
        {LEVELS.map((level) => {
          const width = ((level.endThreshold - level.threshold) / MAX_WORDS) * 100;
          return (
            <div
              key={level.name}
              className="text-xs text-gray-500"
              style={{ width: `${width}%` }}
            >
              <span className="font-medium text-gray-700">{level.name}</span>
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

          return (
            <div
              key={level.name}
              className="relative h-3 rounded-full bg-gray-200 overflow-hidden"
              style={{ width: `${segmentWidth}%` }}
            >
              {/* Learning fill */}
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-300 to-teal-300 transition-all duration-500"
                style={{ width: `${learningPercent}%` }}
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
                <span className="text-gray-600">Learned</span>
                <span className="font-semibold text-gray-900">{learned}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Words you&apos;ve mastered (next review &gt; 1 month)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 cursor-help">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-300 to-teal-300" />
                <span className="text-gray-600">Learning</span>
                <span className="font-semibold text-gray-900">{learning}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Words you&apos;re actively reviewing</p>
            </TooltipContent>
          </Tooltip>

          {reviewsThisWeek !== undefined && (
            <>
              <div className="h-4 w-px bg-gray-200" />
              <WeeklyStats thisWeek={reviewsThisWeek} lastWeek={reviewsLastWeek} />
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
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        <TrendUp className="w-4 h-4 text-emerald-500" weight="bold" />
        <span className="text-gray-600">This week:</span>
        <span className="font-semibold text-gray-900">{thisWeek} reviews</span>
      </div>
      {percentChange !== null && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          isUp
            ? "bg-emerald-50 text-emerald-700 font-medium"
            : "bg-amber-50 text-amber-700 font-medium"
        }`}>
          {isUp ? "↑ " : "↓ "} {Math.abs(percentChange)}% vs last week
        </span>
      )}
    </div>
  );
}
