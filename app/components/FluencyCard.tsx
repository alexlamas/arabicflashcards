"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface FluencyCardProps {
  learnedCount: number;
  reviewCount: number;
  isLoading?: boolean;
}

const FLUENCY_TARGET = 350;

const MILESTONES = [
  { name: "Tourist", words: 0 },
  { name: "Visitor", words: 50 },
  { name: "Resident", words: 150 },
  { name: "Local", words: 350 },
];

export function FluencyCard({ learnedCount, reviewCount, isLoading }: FluencyCardProps) {
  const fluencyPercent = Math.min(Math.round((learnedCount / FLUENCY_TARGET) * 100), 100);
  const wordsToFluency = Math.max(FLUENCY_TARGET - learnedCount, 0);
  const progressPercent = Math.min((learnedCount / FLUENCY_TARGET) * 100, 100);

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700">
        <div className="space-y-4">
          <div className="h-4 w-32 bg-white/20 rounded animate-pulse" />
          <div className="h-12 w-20 bg-white/20 rounded animate-pulse" />
          <div className="h-4 w-48 bg-white/20 rounded animate-pulse" />
          <div className="h-2 w-full bg-white/20 rounded-full animate-pulse mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-emerald-100 text-sm font-medium">Conversational fluency</p>
          <p className="text-5xl font-bold tracking-tight">{fluencyPercent}%</p>
          <p className="text-emerald-100 text-sm">
            {wordsToFluency > 0
              ? `${wordsToFluency} more core words to daily fluency`
              : "You've reached daily fluency!"
            }
          </p>
        </div>

        {reviewCount > 0 && (
          <Link href="/review">
            <Button
              variant="secondary"
              className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold shadow-lg"
            >
              Review {reviewCount} {reviewCount === 1 ? "word" : "words"}
            </Button>
          </Link>
        )}
      </div>

      {/* Progress bar with milestones */}
      <div className="mt-6">
        {/* Track */}
        <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Milestone labels */}
        <div className="relative mt-2 flex justify-between text-xs">
          {MILESTONES.map((milestone) => {
            const position = (milestone.words / FLUENCY_TARGET) * 100;
            const isReached = learnedCount >= milestone.words;

            return (
              <div
                key={milestone.name}
                className="flex flex-col items-center"
                style={{
                  position: "absolute",
                  left: `${position}%`,
                  transform: "translateX(-50%)"
                }}
              >
                <span className={`font-medium ${isReached ? "text-white" : "text-white/60"}`}>
                  {milestone.name}
                </span>
                <span className={isReached ? "text-emerald-200" : "text-white/40"}>
                  {milestone.words}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
