import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface WordMasteryProps {
  easeFactor: number;
  interval: number;
  reviewCount: number;
  lastReviewDate?: string;
  successRate?: number;
}

export default function WordMasteryRing({
  easeFactor,
  interval,
  reviewCount,
  lastReviewDate,
  successRate = 0,
}: WordMasteryProps) {
  // Calculate component scores
  const easeScore = Math.min(((easeFactor - 1.3) / 1.2) * 30, 30);
  const intervalScore = Math.min((interval / 30) * 40, 40);
  const reviewScore = Math.min((reviewCount / 5) * 30, 30);

  // Calculate total mastery score (0-100)
  const totalScore = Math.round(easeScore + intervalScore + reviewScore);

  // Determine color based on score
  const getColor = () => {
    if (totalScore < 20) return "bg-slate-200 text-slate-600";
    if (totalScore < 40) return "bg-blue-100 text-blue-600";
    if (totalScore < 60) return "bg-green-100 text-green-600";
    if (totalScore < 80) return "bg-violet-100 text-violet-600";
    return "bg-amber-100 text-amber-600";
  };

  const getMasteryLabel = () => {
    if (totalScore < 20) return "Novice";
    if (totalScore < 40) return "Beginner";
    if (totalScore < 60) return "Intermediate";
    if (totalScore < 80) return "Advanced";
    return "Mastered";
  };

  // Calculate days since last review
  const daysSinceReview = lastReviewDate
    ? Math.round(
        (new Date().getTime() - new Date(lastReviewDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="relative">
            {/* Background ring */}
            <div className="w-8 h-8 rounded-full bg-gray-100" />

            {/* Progress ring */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(currentColor ${totalScore}%, transparent ${totalScore}%)`,
                opacity: 0.2,
              }}
            />

            {/* Inner circle with score */}
            <div
              className={cn(
                "absolute inset-1 rounded-full flex items-center justify-center text-xs font-medium",
                getColor()
              )}
            >
              {totalScore}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="w-64 p-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{getMasteryLabel()}</span>
              <span className="text-sm text-muted-foreground">
                {totalScore}% Mastery
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Ease</span>
                <span>{Math.round((easeScore / 30) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(easeScore / 30) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Retention</span>
                <span>{Math.round((intervalScore / 40) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${(intervalScore / 40) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Practice</span>
                <span>{Math.round((reviewScore / 30) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full">
                <div
                  className="h-full bg-violet-500 rounded-full"
                  style={{ width: `${(reviewScore / 30) * 100}%` }}
                />
              </div>
            </div>

            <div className="pt-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Reviews</span>
                <span>{reviewCount}</span>
              </div>
              {successRate > 0 && (
                <div className="flex justify-between">
                  <span>Success Rate</span>
                  <span>{Math.round(successRate * 100)}%</span>
                </div>
              )}
              {daysSinceReview !== null && (
                <div className="flex justify-between">
                  <span>Last Review</span>
                  <span>
                    {daysSinceReview === 0
                      ? "Today"
                      : `${daysSinceReview}d ago`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
