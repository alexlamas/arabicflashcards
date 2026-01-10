"use client";

import { useWords } from "../contexts/WordsContext";
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../contexts/ProfileContext";
import { useEffect, useState, useMemo } from "react";
import { StarterPackService, StarterPack } from "../services/starterPackService";
import { SpacedRepetitionService } from "../services/spacedRepetitionService";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { CardsThree } from "@phosphor-icons/react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { PackPreviewModal } from "./PackPreviewModal";
import { DashboardPackCard } from "./DashboardPackCard";
import { WelcomeBanner } from "./WelcomeBanner";
import { FluencyProgressBar } from "./FluencyProgressBar";

type PackLevel = "beginner" | "intermediate" | "advanced";

const LEVEL_CONFIG: Record<PackLevel, { label: string; color: string; bgColor: string }> = {
  beginner: { label: "Beginner", color: "text-emerald-600", bgColor: "bg-emerald-100" },
  intermediate: { label: "Intermediate", color: "text-blue-600", bgColor: "bg-blue-100" },
  advanced: { label: "Advanced", color: "text-purple-600", bgColor: "bg-purple-100" },
};

const LEVEL_ORDER: PackLevel[] = ["beginner", "intermediate", "advanced"];

export function Dashboard() {
  const { session } = useAuth();
  const { firstName: profileFirstName } = useProfile();
  const {
    words,
    reviewCount,
    isLoading: isWordsLoading,
    refreshWords,
  } = useWords();

  const [availablePacks, setAvailablePacks] = useState<StarterPack[]>([]);
  const [installedPackIds, setInstalledPackIds] = useState<string[]>([]);
  const [packWordCounts, setPackWordCounts] = useState<Record<string, number>>({});
  const [packSentenceCounts, setPackSentenceCounts] = useState<Record<string, number>>({});
  const [loadingPacks, setLoadingPacks] = useState(true);
  const [installingPackId, setInstallingPackId] = useState<string | null>(null);
  const [uninstallingPackId, setUninstallingPackId] = useState<string | null>(null);
  const [selectedPack, setSelectedPack] = useState<StarterPack | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState<{ thisWeek: number; lastWeek: number } | null>(null);
  const [streak, setStreak] = useState<number>(0);

  // Count personal words (words without a source pack)
  const myWordsCount = useMemo(() => {
    return words.filter(w => !w.pack_id).length;
  }, [words]);

  // Count learned words (next_review_date > 1 month away) for fluency level
  const learnedCount = useMemo(() => {
    const now = new Date();
    const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return words.filter(w =>
      w.next_review_date && new Date(w.next_review_date) > oneMonthFromNow
    ).length;
  }, [words]);

  // Calculate progress for each installed pack
  const packProgress = useMemo(() => {
    const progress: Record<string, { total: number; learned: number }> = {};
    const now = new Date();
    const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    installedPackIds.forEach(packId => {
      // Use packWordCounts for total (from database), not filtered user words
      const total = packWordCounts[packId] || 0;

      // Count learned from user's words with progress on this pack
      const packWords = words.filter(w => w.pack_id === packId);
      const learnedWords = packWords.filter(w =>
        w.next_review_date && new Date(w.next_review_date) > oneMonthFromNow
      );

      progress[packId] = {
        total,
        learned: learnedWords.length,
      };
    });

    return progress;
  }, [words, installedPackIds, packWordCounts]);

  useEffect(() => {
    async function loadPacks() {
      try {
        const [packs, installed, wordCounts] = await Promise.all([
          StarterPackService.getAvailablePacks(),
          StarterPackService.getUserImportedPacks(),
          StarterPackService.getPackWordCounts(),
        ]);
        setAvailablePacks(packs);
        setInstalledPackIds(installed);
        setPackWordCounts(wordCounts);

        // Fetch sentence counts per pack
        const supabase = createClient();
        const { data: sentenceData } = await supabase
          .from("sentences")
          .select("pack_id")
          .not("pack_id", "is", null);

        const sentenceCounts: Record<string, number> = {};
        (sentenceData || []).forEach(row => {
          if (row.pack_id) {
            sentenceCounts[row.pack_id] = (sentenceCounts[row.pack_id] || 0) + 1;
          }
        });
        setPackSentenceCounts(sentenceCounts);
      } catch {
        toast({
          variant: "destructive",
          title: "Failed to load packs",
        });
      } finally {
        setLoadingPacks(false);
      }
    }
    loadPacks();
  }, []);

  // Fetch weekly review stats and streak
  useEffect(() => {
    async function loadWeeklyStats() {
      if (!session?.user?.id) return;
      const [stats, userStreak] = await Promise.all([
        SpacedRepetitionService.getWeeklyReviewStats(session.user.id),
        SpacedRepetitionService.getStreak(session.user.id),
      ]);
      setWeeklyStats(stats);
      setStreak(userStreak);
    }
    loadWeeklyStats();
  }, [session?.user?.id]);

  // Separate installed and available packs
  const installedPacks = useMemo(() => {
    return availablePacks.filter(pack => installedPackIds.includes(pack.id));
  }, [availablePacks, installedPackIds]);

  const availablePacksByLevel = useMemo(() => {
    const grouped: Record<PackLevel, StarterPack[]> = {
      beginner: [],
      intermediate: [],
      advanced: [],
    };

    availablePacks
      .filter(pack => !installedPackIds.includes(pack.id))
      .forEach(pack => {
        const level = (pack.level as PackLevel) || "beginner";
        grouped[level].push(pack);
      });

    return grouped;
  }, [availablePacks, installedPackIds]);

  const handleUninstallPack = async (packId: string) => {
    setUninstallingPackId(packId);
    try {
      await StarterPackService.uninstallPack(packId);
      setInstalledPackIds(installedPackIds.filter(id => id !== packId));
      setIsPreviewOpen(false);
      await refreshWords(true);
      toast({
        title: "Pack removed",
        description: "The pack has been uninstalled from your library.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to uninstall pack",
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setUninstallingPackId(null);
    }
  };

  const handleInstallPack = async (packId: string) => {
    setInstallingPackId(packId);
    try {
      await StarterPackService.importPack(packId);
      setInstalledPackIds([...installedPackIds, packId]);
      setIsPreviewOpen(false);
      await refreshWords(true);
      toast({
        title: "Pack installed",
        description: "The pack has been added to your library.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to install pack",
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setInstallingPackId(null);
    }
  };

  const openPackPreview = (pack: StarterPack) => {
    setSelectedPack(pack);
    setIsPreviewOpen(true);
  };

  // Use profile first name, fallback to email prefix
  const firstName = profileFirstName || session?.user?.email?.split("@")[0] || "there";

  return (
    <div className="p-6 pt-12 max-w-4xl mx-auto space-y-8 w-full">
      {/* Welcome & Stats - connected */}
      <div className="rounded-2xl overflow-hidden border border-gray-200">
        <WelcomeBanner
          firstName={firstName}
          reviewCount={reviewCount}
          learnedCount={learnedCount}
          totalWords={words.length}
          isLoading={isWordsLoading}
        />
        {words.length > 0 && (
          <FluencyProgressBar
            words={words}
            reviewsThisWeek={weeklyStats?.thisWeek}
            reviewsLastWeek={weeklyStats?.lastWeek}
            streak={streak}
          />
        )}
      </div>

      {/* My Words Section */}
      <Link href="/my-words" className="block">
        <div className="bg-white border rounded-2xl p-5 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <CardsThree className="w-6 h-6 text-body" />
              </div>
              <div>
                <h3 className="font-medium text-heading">My words</h3>
                <p className="text-sm text-body">
                  {myWordsCount > 0
                    ? `${myWordsCount} personal ${myWordsCount === 1 ? 'word' : 'words'} & expressions`
                    : "Add your own words and expressions"
                  }
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              {myWordsCount > 0 ? "View all" : "Add words"}
            </Button>
          </div>
        </div>
      </Link>

      {/* Installed Packs Section */}
      {!loadingPacks && installedPacks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Your packs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {installedPacks.map((pack) => {
              const progress = packProgress[pack.id] || { total: 0, learned: 0 };

              return (
                <DashboardPackCard
                  key={pack.id}
                  pack={pack}
                  variant="installed"
                  progress={progress}
                  sentenceCount={packSentenceCounts[pack.id] || 0}
                  onClick={() => openPackPreview(pack)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Available Packs by Level */}
      {!loadingPacks && LEVEL_ORDER.map(level => {
        const packs = availablePacksByLevel[level];
        if (packs.length === 0) return null;

        const config = LEVEL_CONFIG[level];

        return (
          <div key={level}>
            <div className="flex items-baseline gap-2 mb-4">
              <h2 className="text-lg font-semibold">{config.label}</h2>
              <span className="text-sm text-disabled">•</span>
              <span className="text-sm text-subtle">{packs.length} {packs.length === 1 ? "pack" : "packs"} available</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packs.map((pack) => {
                const wordCount = packWordCounts[pack.id] || 0;
                return (
                  <DashboardPackCard
                    key={pack.id}
                    pack={pack}
                    variant="available"
                    progress={{ learned: 0, total: wordCount }}
                    sentenceCount={packSentenceCounts[pack.id] || 0}
                    onClick={() => openPackPreview(pack)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}


      {/* Pack Preview Modal */}
      <PackPreviewModal
        pack={selectedPack}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        isInstalled={selectedPack ? installedPackIds.includes(selectedPack.id) : false}
        userWords={words}
        onInstall={handleInstallPack}
        onUninstall={handleUninstallPack}
        isInstalling={installingPackId === selectedPack?.id}
        isUninstalling={uninstallingPackId === selectedPack?.id}
      />
    </div>
  );
}
