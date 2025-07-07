import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Clock, BarChart2, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateMemoryStability, getStabilityLevel } from "@/app/utils/memoryStability";

interface WordMasteryProps {
  easeFactor: number;
  interval: number;
  reviewCount: number;
  nextReviewDate?: string;
  successRate?: number;
}

export default function WordMasteryRing({
  easeFactor,
  interval,
  reviewCount,
  nextReviewDate,
  successRate = 0,
}: WordMasteryProps) {
  const stability = calculateMemoryStability({
    interval,
    successRate,
    reviewCount,
    easeFactor,
  });
  const stabilityLevel = getStabilityLevel(stability);

  // Calculate days until next review
  const daysUntilReview = nextReviewDate
    ? Math.round(
        (new Date(nextReviewDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  // Format next review text
  const nextReviewText =
    daysUntilReview === null
      ? "Not started"
      : daysUntilReview === 0
      ? "Today"
      : daysUntilReview === 1
      ? "Tomorrow"
      : daysUntilReview < 0
      ? `${Math.abs(daysUntilReview)}d overdue`
      : `In ${daysUntilReview}d`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="relative">
            {/* Background ring */}
            <div className="w-8 h-8 rounded-full bg-gray-50" />

            {/* Progress ring */}
            <svg
              className="absolute inset-0 w-8 h-8 -rotate-90"
              viewBox="0 0 32 32"
            >
              <circle
                cx="16"
                cy="16"
                r="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${stability * 0.88} 88`}
                className={cn(
                  "transition-all duration-300",
                  stabilityLevel.colorClass.progress
                )}
              />
            </svg>

            {/* Inner circle with score */}
            <div
              className={cn(
                "absolute inset-1 rounded-full flex items-center justify-center text-xs font-medium",
                stabilityLevel.colorClass.bg,
                stabilityLevel.colorClass.text
              )}
            >
              {stability}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="p-0">
          <Card className="w-72 bg-gray-900 text-white shadow-xl border-gray-800">
            <CardContent className="space-y-4 p-4">
              {/* Memory Stability */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">Memory Stability</span>
                  </div>
                  <span className="text-sm font-medium">{stability}%</span>
                </div>
                <Progress value={stability} className="h-2 bg-gray-700" />
                <div className="text-xs text-gray-400">
                  {stabilityLevel.description}
                </div>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Repeat className="w-4 h-4" />
                    <span className="text-xs">Repetitions</span>
                  </div>
                  <div className="text-sm font-medium">{reviewCount}x</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-400">
                    <BarChart2 className="w-4 h-4" />
                    <span className="text-xs">Accuracy</span>
                  </div>
                  <div className="text-sm font-medium">
                    {Math.round(successRate * 100)}%
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">Current Interval</span>
                  </div>
                  <div className="text-sm font-medium">{interval} days</div>
                </div>

                <div className="space-y-1 text-gray-400">
                  <div className="text-xs">Ease Factor</div>
                  <div className="text-sm font-medium">
                    {easeFactor.toFixed(1)}x
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 pt-2">
                Next review: {nextReviewText}
              </div>
            </CardContent>
          </Card>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
