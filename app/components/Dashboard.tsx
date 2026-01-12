"use client";

import { useWords } from "../contexts/WordsContext";
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../contexts/ProfileContext";
import { useEffect, useState, useMemo } from "react";
import { StarterPackService, StarterPack } from "../services/starterPackService";
import { SpacedRepetitionService } from "../services/spacedRepetitionService";
import { toast } from "@/hooks/use-toast";
import { PackPreviewModal } from "./PackPreviewModal";
import { WelcomeBanner } from "./WelcomeBanner";
import { FluencyProgressBar } from "./FluencyProgressBar";
import { PackJourney } from "./PackJourney";
import { MyWordsSection } from "./MyWordsSection";
import AddWordDialog from "./AddWordDialog";


export function Dashboard() {
  const { session } = useAuth();
  const { firstName: profileFirstName } = useProfile();
  const {
    words,
    reviewCount,
    isLoading: isWordsLoading,
    refreshWords,
  } = useWords();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [availablePacks, setAvailablePacks] = useState<StarterPack[]>([]);
  const [installedPackIds, setInstalledPackIds] = useState<string[]>([]);
  const [packWordCounts, setPackWordCounts] = useState<Record<string, number>>({});
  const [loadingPacks, setLoadingPacks] = useState(true);
  const [installingPackId, setInstallingPackId] = useState<string | null>(null);
  const [uninstallingPackId, setUninstallingPackId] = useState<string | null>(null);
  const [selectedPack, setSelectedPack] = useState<StarterPack | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState<{ thisWeek: number; lastWeek: number } | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [droppedImage, setDroppedImage] = useState<File | null>(null);
  const [droppedText, setDroppedText] = useState<string>("");

  // Count personal words (words without a source pack)
  const myWordsCount = useMemo(() => {
    return words.filter(w => !w.pack_id).length;
  }, [words]);

  // Derive installed packs from words (as fallback/supplement to loaded installedPackIds)
  const installedPackIdsFromWords = useMemo(() => {
    const packIds = new Set<string>();
    words.forEach(w => {
      if (w.pack_id) packIds.add(w.pack_id);
    });
    return Array.from(packIds);
  }, [words]);

  // Merge loaded installedPackIds with derived ones from words
  const effectiveInstalledPackIds = useMemo(() => {
    const combined = new Set([...installedPackIds, ...installedPackIdsFromWords]);
    return Array.from(combined);
  }, [installedPackIds, installedPackIdsFromWords]);

  const LEARNED_INTERVAL_THRESHOLD = 7; // days

  // Count learned words (interval >= 7 days) for fluency level
  const learnedCount = useMemo(() => {
    return words.filter(w => w.interval && w.interval >= LEARNED_INTERVAL_THRESHOLD).length;
  }, [words]);

  // Calculate progress for each pack (both installed and not)
  const packProgress = useMemo(() => {
    const progress: Record<string, { total: number; learned: number }> = {};

    // Calculate for all packs
    availablePacks.forEach(pack => {
      const total = packWordCounts[pack.id] || 0;

      // Count learned from user's words with progress on this pack
      const packWords = words.filter(w => w.pack_id === pack.id);
      const learnedWords = packWords.filter(w => w.interval && w.interval >= LEARNED_INTERVAL_THRESHOLD);

      progress[pack.id] = {
        total,
        learned: learnedWords.length,
      };
    });

    return progress;
  }, [words, availablePacks, packWordCounts]);

  // Load packs on mount
  useEffect(() => {
    async function init() {
      // Load packs from database
      try {
        const [packs, installed, wordCounts] = await Promise.all([
          StarterPackService.getAvailablePacks(),
          StarterPackService.getUserImportedPacks(),
          StarterPackService.getPackWordCounts(),
        ]);
        setAvailablePacks(packs);
        // Merge with any existing installed packs (from URL params)
        setInstalledPackIds(prev => [...new Set([...prev, ...installed])]);
        setPackWordCounts(wordCounts);
      } catch {
        toast({
          variant: "destructive",
          title: "Failed to load packs",
        });
      } finally {
        setLoadingPacks(false);
      }
    }
    init();
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
      <MyWordsSection
        wordCount={myWordsCount}
        onAddClick={() => {
          setDroppedImage(null);
          setDroppedText("");
          setAddDialogOpen(true);
        }}
        onFileDrop={(file) => {
          setDroppedImage(file);
          setDroppedText("");
          setAddDialogOpen(true);
        }}
        onTextDrop={(text) => {
          setDroppedText(text);
          setDroppedImage(null);
          setAddDialogOpen(true);
        }}
      />

      {/* Pack Journey */}
      {!loadingPacks && (
        <PackJourney
          packs={availablePacks}
          installedPackIds={effectiveInstalledPackIds}
          packProgress={packProgress}
          packWordCounts={packWordCounts}
          onPackClick={openPackPreview}
        />
      )}


      {/* Pack Preview Modal */}
      <PackPreviewModal
        pack={selectedPack}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        isInstalled={selectedPack ? effectiveInstalledPackIds.includes(selectedPack.id) : false}
        userWords={words}
        onInstall={handleInstallPack}
        onUninstall={handleUninstallPack}
        isInstalling={installingPackId === selectedPack?.id}
        isUninstalling={uninstallingPackId === selectedPack?.id}
      />

      {/* Add Word Dialog */}
      <AddWordDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        initialImage={droppedImage}
        initialText={droppedText}
        onWordAdded={() => {
          refreshWords(true);
        }}
      />

    </div>
  );
}
