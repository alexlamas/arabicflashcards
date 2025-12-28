"use client";

import { useWords } from "../contexts/WordsContext";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState, useMemo } from "react";
import { StarterPackService, StarterPack } from "../services/starterPackService";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, Plus, Loader2, Check, X, Sparkles } from "lucide-react";
import { BookOpen, Package } from "@phosphor-icons/react";
import Link from "next/link";

type PackLevel = "beginner" | "intermediate" | "advanced";

const LEVEL_CONFIG: Record<PackLevel, { label: string; color: string; bgColor: string }> = {
  beginner: { label: "Beginner", color: "text-green-600", bgColor: "bg-green-100" },
  intermediate: { label: "Intermediate", color: "text-blue-600", bgColor: "bg-blue-100" },
  advanced: { label: "Advanced", color: "text-purple-600", bgColor: "bg-purple-100" },
};

const LEVEL_ORDER: PackLevel[] = ["beginner", "intermediate", "advanced"];

export function Dashboard() {
  const { session } = useAuth();
  const {
    words,
    totalWords,
    learnedCount,
    weekCount,
    reviewCount,
  } = useWords();

  const [availablePacks, setAvailablePacks] = useState<StarterPack[]>([]);
  const [installedPackIds, setInstalledPackIds] = useState<string[]>([]);
  const [loadingPacks, setLoadingPacks] = useState(true);
  const [installingPackId, setInstallingPackId] = useState<string | null>(null);
  const [uninstallingPackId, setUninstallingPackId] = useState<string | null>(null);

  const learningCount = totalWords - learnedCount;
  const progressPercent = totalWords > 0 ? Math.round((learnedCount / totalWords) * 100) : 0;

  // Count personal words (words without a source pack)
  const myWordsCount = useMemo(() => {
    return words.filter(w => !w.source_pack_id).length;
  }, [words]);

  useEffect(() => {
    async function loadPacks() {
      try {
        const [packs, installed] = await Promise.all([
          StarterPackService.getAvailablePacks(),
          StarterPackService.getUserImportedPacks(),
        ]);
        setAvailablePacks(packs);
        setInstalledPackIds(installed);
      } catch (error) {
        console.error("Error loading packs:", error);
      } finally {
        setLoadingPacks(false);
      }
    }
    loadPacks();
  }, []);

  // Group packs by level
  const packsByLevel = useMemo(() => {
    const grouped: Record<PackLevel, { installed: StarterPack[]; available: StarterPack[] }> = {
      beginner: { installed: [], available: [] },
      intermediate: { installed: [], available: [] },
      advanced: { installed: [], available: [] },
    };

    availablePacks.forEach(pack => {
      const level = (pack.level as PackLevel) || "beginner";
      if (installedPackIds.includes(pack.id)) {
        grouped[level].installed.push(pack);
      } else {
        grouped[level].available.push(pack);
      }
    });

    return grouped;
  }, [availablePacks, installedPackIds]);

  const handleUninstallPack = async (packId: string) => {
    setUninstallingPackId(packId);
    try {
      await StarterPackService.uninstallPack(packId);
      setInstalledPackIds(installedPackIds.filter(id => id !== packId));
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
      // Refresh words context
      window.location.reload();
    } catch (error) {
      console.error("Error installing pack:", error);
      alert(`Failed to install pack: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setInstallingPackId(null);
    }
  };

  const firstName = session?.user?.email?.split("@")[0] || "there";

  return (
    <div className="p-6 lg:pt-24 max-w-4xl mx-auto space-y-8 w-full">
      {/* Welcome & Review CTA */}
      {reviewCount > 0 ? (
        <div className="relative overflow-hidden rounded-2xl p-8 text-white bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/5 rounded-full" />

          {/* Arabic decorative text */}
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
                Start Review
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl p-8 text-gray-800 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 border border-amber-200/50">
          {/* Geometric pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />

          {/* Decorative Arabic calligraphy */}
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-[120px] font-arabic text-amber-900/[0.04] select-none leading-none">
            ممتاز
          </div>

          {/* Floating shapes */}
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
        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
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
          <div className="flex items-center gap-3 mb-3">
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
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">+{weekCount}</p>
              <p className="text-sm text-gray-500">This week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      {totalWords > 0 && (
        <div className="bg-white border rounded-xl p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
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
                <h3 className="font-medium text-gray-900">My Words</h3>
                <p className="text-sm text-gray-500">{myWordsCount} personal words & expressions</p>
              </div>
            </div>
            <Link href="/learning">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Packs by Level */}
      {!loadingPacks && LEVEL_ORDER.map(level => {
        const { installed, available } = packsByLevel[level];
        const hasContent = installed.length > 0 || available.length > 0;
        if (!hasContent) return null;

        const config = LEVEL_CONFIG[level];

        return (
          <div key={level}>
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.bgColor} ${config.color}`}>
                {config.label}
              </span>
              <h2 className="text-lg font-semibold">Packs</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Installed packs first */}
              {installed.map((pack) => (
                <div
                  key={pack.id}
                  className="bg-white border rounded-xl p-5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.bgColor}`}>
                      <Check className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div>
                      <h3 className="font-medium">{pack.name}</h3>
                      <span className={`text-xs ${config.color}`}>Installed</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUninstallPack(pack.id)}
                    disabled={uninstallingPackId === pack.id}
                    className="text-gray-400 hover:text-red-500"
                  >
                    {uninstallingPackId === pack.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}

              {/* Available packs */}
              {available.map((pack) => (
                <div
                  key={pack.id}
                  className="bg-white border rounded-xl p-5 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-gray-400" />
                      <h3 className="font-medium">{pack.name}</h3>
                    </div>
                    {pack.description && (
                      <p className="text-sm text-gray-500 mt-1">{pack.description}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleInstallPack(pack.id)}
                    disabled={installingPackId === pack.id}
                  >
                    {installingPackId === pack.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link href="/learning">
          <Button variant="outline">View Learning ({learningCount})</Button>
        </Link>
        <Link href="/learned">
          <Button variant="outline">View Learned ({learnedCount})</Button>
        </Link>
      </div>
    </div>
  );
}
