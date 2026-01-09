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
import { PencilLine } from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";
import { PackPreviewModal } from "./PackPreviewModal";
import { DashboardPackCard } from "./DashboardPackCard";
import { SettingsModal } from "./SettingsModal";
import { WelcomeBanner } from "./WelcomeBanner";

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
      <WelcomeBanner
        firstName={firstName}
        reviewCount={reviewCount}
        isLoading={isWordsLoading}
      />


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
        <Link href="/my-words" className="block">
            <div className="bg-white border rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <PencilLine className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">My words</h3>
                    <p className="text-sm text-gray-500">{myWordsCount} personal {myWordsCount === 1 ? 'word' : 'words'} & expressions</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  View all
                </Button>
              </div>
            </div>
        </Link>
      )}

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
