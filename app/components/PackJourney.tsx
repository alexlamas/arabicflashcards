"use client";

import { useMemo, useCallback } from "react";
import { StarterPack } from "@/app/services/starterPackService";
import { PackJourneyNode, PackStatus } from "./PackJourneyNode";

interface PackJourneyProps {
  packs: (StarterPack & { sort_order?: number | null })[];
  installedPackIds: string[];
  packProgress: Record<string, { total: number; learned: number }>;
  packWordCounts: Record<string, number>;
  onPackClick: (pack: StarterPack) => void;
}

export function PackJourney({
  packs,
  installedPackIds,
  packProgress,
  packWordCounts,
  onPackClick,
}: PackJourneyProps) {
  // Sort packs by sort_order then name
  const sortedPacks = useMemo(() => {
    return [...packs].sort((a, b) => {
      const orderDiff = (a.sort_order || 999) - (b.sort_order || 999);
      if (orderDiff !== 0) return orderDiff;
      return a.name.localeCompare(b.name);
    });
  }, [packs]);

  // Calculate status for each pack
  const getPackStatus = useCallback((packId: string): PackStatus => {
    const progress = packProgress[packId];
    if (!installedPackIds.includes(packId)) return "not-started";
    if (!progress || progress.total === 0) return "in-progress";

    const percent = (progress.learned / progress.total) * 100;
    if (percent >= 100) return "completed";
    return "in-progress";
  }, [packProgress, installedPackIds]);

  // Split into learning (installed, not completed) and available packs
  const { learningPacks, availablePacks } = useMemo(() => {
    const learning: typeof sortedPacks = [];
    const available: typeof sortedPacks = [];

    for (const pack of sortedPacks) {
      const status = getPackStatus(pack.id);
      if (status === "in-progress" || status === "completed") {
        learning.push(pack);
      } else {
        available.push(pack);
      }
    }

    return { learningPacks: learning, availablePacks: available };
  }, [sortedPacks, getPackStatus]);

  const renderPack = (pack: typeof sortedPacks[0]) => {
    const status = getPackStatus(pack.id);
    const progress = packProgress[pack.id];
    const total = packWordCounts[pack.id] || progress?.total || 0;
    const learned = progress?.learned || 0;
    const percent = total > 0 ? Math.round((learned / total) * 100) : 0;

    return (
      <PackJourneyNode
        key={pack.id}
        pack={pack}
        status={status}
        progressPercent={percent}
        progressCount={{ learned, total }}
        onClick={() => onPackClick(pack)}
      />
    );
  };

  return (
    <div className="space-y-8">
      {/* Learning section - only show if user has started packs */}
      {learningPacks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Currently learning</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {learningPacks.map(renderPack)}
          </div>
        </div>
      )}

      {/* All available packs */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          {learningPacks.length > 0 ? "More vocabulary" : "Vocabulary Packs"}
        </h2>
        <p className="text-sm text-gray-500 mb-4">More words to learn, from most to least common</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {availablePacks.map(renderPack)}
        </div>
      </div>
    </div>
  );
}
