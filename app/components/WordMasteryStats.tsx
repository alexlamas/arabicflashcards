import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WordStats {
  id: string;
  easeFactor: number;
  interval: number;
  reviewCount: number;
}

interface MasteryStatsProps {
  words: WordStats[];
}

export default function MasteryStats({ words }: MasteryStatsProps) {
  // Calculate overall stats
  const calculateStats = () => {
    if (!words.length)
      return {
        totalMastery: 0,
        masteryLevels: {
          novice: 0,
          beginner: 0,
          intermediate: 0,
          advanced: 0,
          mastered: 0,
        },
        averageReviews: 0,
        totalReviews: 0,
      };

    let totalMastery = 0;
    const masteryLevels = {
      novice: 0,
      beginner: 0,
      intermediate: 0,
      advanced: 0,
      mastered: 0,
    };
    let totalReviews = 0;

    words.forEach((word) => {
      const easeScore = Math.min(((word.easeFactor - 1.3) / 1.2) * 30, 30);
      const intervalScore = Math.min((word.interval / 30) * 40, 40);
      const reviewScore = Math.min((word.reviewCount / 5) * 30, 30);
      const score = Math.round(easeScore + intervalScore + reviewScore);

      totalMastery += score;
      totalReviews += word.reviewCount;

      if (score < 20) masteryLevels.novice++;
      else if (score < 40) masteryLevels.beginner++;
      else if (score < 60) masteryLevels.intermediate++;
      else if (score < 80) masteryLevels.advanced++;
      else masteryLevels.mastered++;
    });

    return {
      totalMastery: Math.round(totalMastery / words.length),
      masteryLevels,
      averageReviews: Math.round(totalReviews / words.length),
      totalReviews,
    };
  };

  const stats = calculateStats();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Mastery Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall mastery ring */}
        <div className="flex items-center justify-center py-4">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-gray-100"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="42"
                cx="50"
                cy="50"
              />
              <circle
                className="text-blue-500"
                strokeWidth="8"
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="42"
                cx="50"
                cy="50"
                strokeDasharray={`${stats.totalMastery * 2.64}, 264`}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-2xl font-bold">{stats.totalMastery}%</div>
            </div>
          </div>
        </div>

        {/* Mastery level distribution */}
        <div className="space-y-2">
          {Object.entries(stats.masteryLevels).map(([level, count]) => (
            <div key={level} className="space-y-1">
              <div className="flex justify-between text-sm capitalize">
                <span>{level}</span>
                <span>{count}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full">
                <div
                  className={cn("h-full rounded-full", {
                    "bg-slate-400": level === "novice",
                    "bg-blue-500": level === "beginner",
                    "bg-green-500": level === "intermediate",
                    "bg-violet-500": level === "advanced",
                    "bg-amber-500": level === "mastered",
                  })}
                  style={{ width: `${(count / words.length) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Review stats */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.averageReviews}</div>
            <div className="text-sm text-muted-foreground">Avg. Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
            <div className="text-sm text-muted-foreground">Total Reviews</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
