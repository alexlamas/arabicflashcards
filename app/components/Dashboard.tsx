"use client";

import { useWords } from "../contexts/WordsContext";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState, useMemo } from "react";
import { StarterPackService, StarterPack } from "../services/starterPackService";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, Check, Sparkles, ChevronRight } from "lucide-react";
import {
  BookOpen,
  Package,
  Coffee,
  ChatCircle,
  ForkKnife,
  Airplane,
  Heart,
  House,
  Star,
  HandWaving,
  ShoppingCart,
  Briefcase,
  Buildings,
  Heartbeat,
  CalendarBlank,
  Clock,
  SunHorizon,
  Lightning,
  Palette,
  MusicNote,
  Smiley,
  User,
} from "@phosphor-icons/react";
import Link from "next/link";
import { PackPreviewModal } from "./PackPreviewModal";

type PackLevel = "beginner" | "intermediate" | "advanced";

const LEVEL_CONFIG: Record<PackLevel, { label: string; color: string; bgColor: string }> = {
  beginner: { label: "Beginner", color: "text-green-600", bgColor: "bg-green-100" },
  intermediate: { label: "Intermediate", color: "text-blue-600", bgColor: "bg-blue-100" },
  advanced: { label: "Advanced", color: "text-purple-600", bgColor: "bg-purple-100" },
};

const LEVEL_ORDER: PackLevel[] = ["beginner", "intermediate", "advanced"];

// Icon mapping based on pack name keywords
const getPackIcon = (packName: string) => {
  const name = packName.toLowerCase();

  // Specific pack name mappings
  if (name.includes("greeting") || name.includes("hello")) return HandWaving;
  if (name.includes("food") || name.includes("eat") || name.includes("drink") || name.includes("restaurant")) return ForkKnife;
  if (name.includes("travel") || name.includes("transport") || name.includes("airport")) return Airplane;
  if (name.includes("family") || name.includes("people") || name.includes("relationship")) return Heart;
  if (name.includes("home") || name.includes("house") || name.includes("room")) return House;
  if (name.includes("essential") || name.includes("basic") || name.includes("common") || name.includes("core")) return Star;
  if (name.includes("shop") || name.includes("market") || name.includes("buy")) return ShoppingCart;
  if (name.includes("work") || name.includes("job") || name.includes("business") || name.includes("office")) return Briefcase;
  if (name.includes("city") || name.includes("place") || name.includes("location") || name.includes("building")) return Buildings;
  if (name.includes("health") || name.includes("body") || name.includes("medical")) return Heartbeat;
  if (name.includes("time") || name.includes("day") || name.includes("week") || name.includes("schedule")) return CalendarBlank;
  if (name.includes("daily") || name.includes("routine") || name.includes("morning") || name.includes("night")) return SunHorizon;
  if (name.includes("action") || name.includes("verb") || name.includes("do")) return Lightning;
  if (name.includes("color") || name.includes("colour") || name.includes("describe") || name.includes("adjective")) return Palette;
  if (name.includes("music") || name.includes("art") || name.includes("culture")) return MusicNote;
  if (name.includes("emotion") || name.includes("feeling") || name.includes("mood")) return Smiley;
  if (name.includes("phrase") || name.includes("expression") || name.includes("conversation") || name.includes("chat")) return ChatCircle;
  if (name.includes("abstract") || name.includes("concept")) return Clock;
  if (name.includes("personal") || name.includes("introduction") || name.includes("about")) return User;
  if (name.includes("cafe") || name.includes("coffee") || name.includes("beverage")) return Coffee;

  // Fallback based on level with some variety
  const fallbackIcons = [Star, BookOpen, Package, Lightning, ChatCircle];
  const hash = packName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return fallbackIcons[hash % fallbackIcons.length];
};

export function Dashboard() {
  const { session } = useAuth();
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
  const [loadingPacks, setLoadingPacks] = useState(true);
  const [installingPackId, setInstallingPackId] = useState<string | null>(null);
  const [uninstallingPackId, setUninstallingPackId] = useState<string | null>(null);
  const [selectedPack, setSelectedPack] = useState<StarterPack | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const learningCount = totalWords - learnedCount;
  const progressPercent = totalWords > 0 ? Math.round((learnedCount / totalWords) * 100) : 0;

  // Count personal words (words without a source pack)
  const myWordsCount = useMemo(() => {
    return words.filter(w => !w.source_pack_id).length;
  }, [words]);

  // Calculate progress for each installed pack
  const packProgress = useMemo(() => {
    const progress: Record<string, { total: number; learned: number }> = {};
    const now = new Date();
    const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    installedPackIds.forEach(packId => {
      const packWords = words.filter(w => w.source_pack_id === packId);
      const learnedWords = packWords.filter(w =>
        w.next_review_date && new Date(w.next_review_date) > oneMonthFromNow
      );
      progress[packId] = {
        total: packWords.length,
        learned: learnedWords.length,
      };
    });

    return progress;
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

  const firstName = session?.user?.email?.split("@")[0] || "there";

  return (
    <div className="p-6 lg:pt-24 max-w-4xl mx-auto space-y-8 w-full">
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
        <div className="relative overflow-hidden rounded-2xl p-8 text-white bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/5 rounded-full" />
          <div className="absolute top-4 right-6 text-6xl font-arabic text-white/10 select-none">
            يلا
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {firstName}!
            </h1>
            <p className="text-white/80 mb-5">
              You have <span className="text-white font-semibold">{reviewCount} words</span> ready for review.
            </p>
            <Link href="/review">
              <Button className="bg-white text-teal-700 hover:bg-white/90 font-medium shadow-lg shadow-black/10">
                <Target className="w-4 h-4 mr-2" />
                Start review
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl p-8 text-gray-800 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 border border-amber-200/50">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-[120px] font-arabic text-amber-900/[0.04] select-none leading-none">
            ممتاز
          </div>
          <div className="absolute top-4 right-12 w-20 h-20 rounded-full bg-gradient-to-br from-amber-200/40 to-orange-200/40 blur-xl" />
          <div className="absolute bottom-4 right-32 w-16 h-16 rounded-full bg-gradient-to-br from-rose-200/40 to-pink-200/40 blur-xl" />
          <div className="absolute top-8 right-40 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-200/60 to-amber-200/60 blur-md" />
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
            <Link href="/learning">
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
              const percent = progress.total > 0 ? Math.round((progress.learned / progress.total) * 100) : 0;
              const config = LEVEL_CONFIG[(pack.level as PackLevel) || "beginner"];

              const PackIcon = getPackIcon(pack.name);
              return (
                <button
                  key={pack.id}
                  onClick={() => openPackPreview(pack)}
                  className="bg-white border rounded-xl p-5 text-left hover:border-gray-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.bgColor}`}>
                        <PackIcon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div>
                        <h3 className="font-medium">{pack.name}</h3>
                        <span className={`text-xs ${config.color}`}>{config.label}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{progress.learned}/{progress.total} learned</span>
                      <span className="font-medium">{percent}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </button>
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
                const PackIcon = getPackIcon(pack.name);
                return (
                  <button
                    key={pack.id}
                    onClick={() => openPackPreview(pack)}
                    className="bg-white border rounded-xl p-5 text-left hover:border-gray-300 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.bgColor}`}>
                          <PackIcon className={`w-5 h-5 ${config.color}`} />
                        </div>
                        <div>
                          <h3 className="font-medium">{pack.name}</h3>
                          <p className="text-sm text-gray-500">
                            {wordCount} {wordCount === 1 ? "word" : "words"}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </div>
                  </button>
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
    </div>
  );
}
