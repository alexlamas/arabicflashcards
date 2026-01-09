"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

interface WelcomeBannerProps {
  firstName: string;
  reviewCount: number;
  isLoading?: boolean;
}

export function WelcomeBanner({ firstName, reviewCount, isLoading }: WelcomeBannerProps) {
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
            src="/logo.svg"
            alt="Yalla Flash"
            width={64}
            height={64}
            className="flex-shrink-0"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2 text-gray-900">Welcome back, {firstName}!</h1>
            <p className="text-gray-600 mb-5">
              You have <span className="text-gray-900 font-semibold">{reviewCount} words</span> ready for review.
            </p>
            <Link href="/review">
              <Button className="bg-emerald-600 text-white hover:bg-emerald-700 font-medium">
                <Play className="w-4 h-4 mr-2" />
                Start review
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl p-8 text-gray-800 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 border border-amber-200/50">
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 rounded-full mb-4">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-amber-700">All caught up</span>
        </div>
        <h1 className="text-2xl font-bold mb-2 text-gray-900">
          Beautiful progress, {firstName}!
        </h1>
        <p className="text-gray-600 max-w-md">
          No words waiting for review. Your dedication is paying off — enjoy the moment, your next session will be ready soon.
        </p>
      </div>
    </div>
  );
}
