"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

// Fluency level thresholds and configuration
const FLUENCY_LEVELS = [
  { level: "tourist", label: "Tourist", threshold: 0, logo: "/logo-tourist.svg" },
  { level: "visitor", label: "Visitor", threshold: 50, logo: "/logo-visitor.svg" },
  { level: "resident", label: "Resident", threshold: 150, logo: "/logo-resident.svg" },
  { level: "local", label: "Local", threshold: 350, logo: "/logo-local.svg" },
] as const;

type FluencyLevel = typeof FLUENCY_LEVELS[number]["level"];

interface FluencyInfo {
  level: FluencyLevel;
  label: string;
  logo: string;
  wordsToNext: number;
  nextLevel: string | null;
}

function getFluencyLevel(learnedCount: number): FluencyInfo {
  // Find current level (highest threshold that learnedCount meets)
  let currentIndex = 0;
  for (let i = FLUENCY_LEVELS.length - 1; i >= 0; i--) {
    if (learnedCount >= FLUENCY_LEVELS[i].threshold) {
      currentIndex = i;
      break;
    }
  }

  const current = FLUENCY_LEVELS[currentIndex];
  const next = FLUENCY_LEVELS[currentIndex + 1];

  return {
    level: current.level,
    label: current.label,
    logo: current.logo,
    wordsToNext: next ? next.threshold - learnedCount : 0,
    nextLevel: next ? next.label : null,
  };
}

interface WelcomeBannerProps {
  firstName: string;
  reviewCount: number;
  learnedCount?: number;
  isLoading?: boolean;
}

export function WelcomeBanner({ firstName, reviewCount, learnedCount = 0, isLoading }: WelcomeBannerProps) {
  const fluency = getFluencyLevel(learnedCount);

  // Fluency level subtitle
  const levelSubtitle = fluency.nextLevel
    ? `${fluency.label} · ${fluency.wordsToNext} more to ${fluency.nextLevel}`
    : `${fluency.label} · You've reached the top!`;

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-gray-100 to-gray-50 border">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse" />
          <div className="h-5 w-64 bg-gray-200 rounded-md animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse mt-2" />
        </div>
      </div>
    );
  }

  if (reviewCount > 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl p-8 bg-gray-50 border border-gray-200">
        <DottedGlowBackground
          gap={16}
          radius={1.5}
          color="rgba(0,0,0,0.15)"
          glowColor="rgba(16, 185, 129, 0.8)"
          opacity={0.8}
          speedScale={0.5}
        />
        <div className="relative z-10 flex items-start gap-6">
          <Image
            src={fluency.logo}
            alt="Yalla Flash"
            width={96}
            height={96}
            className="flex-shrink-0"
            onError={(e) => {
              // Fallback to default logo if level-specific one doesn't exist
              e.currentTarget.src = "/logo.svg";
            }}
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1 text-gray-900">Welcome back, {firstName}!</h1>
            <p className="text-sm text-gray-500 mb-4">{levelSubtitle}</p>
            <Link href="/review">
              <Button className="bg-emerald-600 text-white hover:bg-emerald-700 font-medium">
                <Play className="w-4 h-4 mr-2" />
                Review {reviewCount} words
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl p-8 text-gray-800 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 border border-amber-200/50">
      <div className="relative z-10 flex items-start gap-6">
        <Image
          src={fluency.logo}
          alt="Yalla Flash"
          width={64}
          height={64}
          className="flex-shrink-0"
          onError={(e) => {
            e.currentTarget.src = "/logo.svg";
          }}
        />
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 rounded-full mb-3">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-amber-700">All caught up</span>
          </div>
          <h1 className="text-2xl font-bold mb-1 text-gray-900">
            Beautiful progress, {firstName}!
          </h1>
          <p className="text-sm text-gray-500 mb-3">{levelSubtitle}</p>
          <p className="text-gray-600 max-w-md">
            No words waiting for review — check back soon.
          </p>
        </div>
      </div>
    </div>
  );
}
