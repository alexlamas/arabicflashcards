"use client";

import { useWords } from "../contexts/WordsContext";
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../contexts/ProfileContext";
import { useEffect, useState, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { GearSix, SignOut } from "@phosphor-icons/react";
import { StarterPackService, StarterPack } from "../services/starterPackService";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Play, TrendingUp, Check, Sparkles } from "lucide-react";
import { BookOpen } from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";
import { PackPreviewModal } from "./PackPreviewModal";
import { DashboardPackCard } from "./DashboardPackCard";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";
import { SettingsModal } from "./SettingsModal";

type PackLevel = "beginner" | "intermediate" | "advanced";

const LEVEL_CONFIG: Record<PackLevel, { label: string; color: string; bgColor: string }> = {
  beginner: { label: "Beginner", color: "text-green-600", bgColor: "bg-green-100" },
  intermediate: { label: "Intermediate", color: "text-blue-600", bgColor: "bg-blue-100" },
  advanced: { label: "Advanced", color: "text-purple-600", bgColor: "bg-purple-100" },
};

const LEVEL_ORDER: PackLevel[] = ["beginner", "intermediate", "advanced"];

export function Dashboard() {
  const { session, handleLogout } = useAuth();
  const { firstName: profileFirstName } = useProfile();
  const {
    words,
    totalWords,
    learnedCount,
    weekCount,
    reviewCount,
    isLoading: isWordsLoading,
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const learningCount = totalWords - learnedCount;
  const progressPercent = totalWords > 0 ? Math.round((learnedCount / totalWords) * 100) : 0;

  // Count personal words (words without a source pack)
  const myWordsCount = useMemo(() => {
    return words.filter(w => !w.pack_id).length;
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

  // Calculate due words count for each installed pack
  const packDueCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const now = new Date();

    installedPackIds.forEach(packId => {
      const packWords = words.filter(w => w.pack_id === packId);
      const dueWords = packWords.filter(w =>
        w.next_review_date &&
        new Date(w.next_review_date) <= now &&
        (w.status === "learning" || w.status === "learned")
      );
      counts[packId] = dueWords.length;
    });

    return counts;
  }, [words, installedPackIds]);

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
      } catch (error) {
        console.error("Error loading packs:", error);
      } finally {
        setLoadingPacks(false);
      }
    }
    loadPacks();
  }, []);

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
      window.location.reload();
    } catch (error) {
      console.error("Error uninstalling pack:", error);
      alert(`Failed to uninstall pack: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUninstallingPackId(null);
    }
  };

  const handleInstallPack = async (packId: string) => {
    setInstallingPackId(packId);
    try {
      const result = await StarterPackService.importPack(packId);
      console.log("Pack imported:", result);
      setInstalledPackIds([...installedPackIds, packId]);
      setIsPreviewOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error installing pack:", error);
      alert(`Failed to install pack: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
  const displayName = profileFirstName || session?.user?.email?.split("@")[0] || "User";

  return (
    <div className="p-6 lg:pt-24 max-w-4xl mx-auto space-y-8 w-full">
      {/* Top right avatar dropdown */}
      {session && (
        <div className="absolute top-4 right-4 lg:top-6 lg:right-6 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
                <Image
                  src="/avatar-pomegranate.png"
                  alt="Avatar"
                  width={28}
                  height={28}
                  className="rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">{displayName}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem disabled className="text-xs text-gray-500">
                {session.user.email}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                <GearSix className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <SignOut className="w-4 h-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      {/* Welcome & Review CTA */}
      {isWordsLoading ? (
        <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-gray-100 to-gray-50 border">
          <div className="space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse" />
            <div className="h-5 w-64 bg-gray-200 rounded-md animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse mt-2" />
          </div>
        </div>
      ) : reviewCount > 0 ? (
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
      ) : (
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
      )}

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isWordsLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-7 w-12 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="bg-white border rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{learnedCount}</p>
                  <p className="text-sm text-gray-500">Learned</p>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{learningCount}</p>
                  <p className="text-sm text-gray-500">Learning</p>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">+{weekCount}</p>
                  <p className="text-sm text-gray-500">This week</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Overall Progress Bar */}
      {totalWords > 0 && (
        <div className="bg-white border rounded-xl p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall progress</span>
            <span className="text-sm text-gray-500">{learnedCount}/{totalWords} words learned</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">{progressPercent}% complete</p>
        </div>
      )}

      {/* My Words Section */}
      {myWordsCount > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">My words</h3>
                <p className="text-sm text-gray-500">{myWordsCount} personal words & expressions</p>
              </div>
            </div>
            <Link href="/learning?filter=personal">
              <Button variant="outline" size="sm">View all</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Installed Packs Section */}
      {!loadingPacks && installedPacks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Your packs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {installedPacks.map((pack) => {
              const progress = packProgress[pack.id] || { total: 0, learned: 0 };
              const dueCount = packDueCounts[pack.id] || 0;

              return (
                <DashboardPackCard
                  key={pack.id}
                  pack={pack}
                  variant="installed"
                  progress={progress}
                  sentenceCount={packSentenceCounts[pack.id] || 0}
                  onClick={() => openPackPreview(pack)}
                  actionSlot={
                    dueCount > 0 ? (
                      <Link href={`/review?pack=${pack.id}`}>
                        <Button size="sm" className="gap-1">
                          <Play className="w-3 h-3" />
                          {dueCount}
                        </Button>
                      </Link>
                    ) : undefined
                  }
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
              <span className="text-sm text-gray-400">•</span>
              <span className="text-sm text-gray-500">{packs.length} {packs.length === 1 ? "pack" : "packs"} available</span>
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

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link href="/learning">
          <Button variant="outline">View learning ({learningCount})</Button>
        </Link>
        <Link href="/learned">
          <Button variant="outline">View learned ({learnedCount})</Button>
        </Link>
      </div>

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

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
