"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { StarterPack } from "@/app/services/starterPackService";

interface ProgressRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

function ProgressRing({ percent, size = 64, strokeWidth = 3, color = "#10b981" }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="absolute inset-0 -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
      />
      {/* Progress circle */}
      {percent > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      )}
    </svg>
  );
}

export type PackStatus = "completed" | "in-progress" | "not-started";

interface PackJourneyNodeProps {
  pack: StarterPack;
  status: PackStatus;
  progressPercent: number;
  progressCount?: { learned: number; total: number };
  onClick: () => void;
}

export function PackJourneyNode({
  pack,
  status,
  progressPercent,
  progressCount,
  onClick,
}: PackJourneyNodeProps) {
  const isCompleted = status === "completed";
  const isInProgress = status === "in-progress";

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-2 rounded-xl transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
    >
      {/* Node with progress ring */}
      <div className="relative">
        {/* Progress ring */}
        <ProgressRing
          percent={progressPercent}
          size={80}
          color="#10b981"
        />

        {/* Pack image/icon */}
        <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
          {pack.image_url ? (
            <Image
              src={pack.image_url}
              alt={pack.name}
              width={72}
              height={72}
              unoptimized
              className="object-cover w-[72px] h-[72px] rounded-full"
            />
          ) : (
            <span className="text-2xl">📚</span>
          )}
        </div>

        {/* Completed checkmark badge */}
        {isCompleted && (
          <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </div>
        )}

      </div>

      {/* Pack name */}
      <div className="text-center max-w-[90px]">
        <p className="text-sm font-medium leading-tight line-clamp-2 text-gray-900">
          {pack.name}
        </p>

        {/* Progress or word count */}
        <p className="text-xs text-gray-500 mt-0.5">
          {isInProgress && progressCount
            ? `${progressCount.learned}/${progressCount.total}`
            : isCompleted
            ? "Done"
            : progressCount
            ? `${progressCount.total} words`
            : ""}
        </p>
      </div>
    </button>
  );
}
