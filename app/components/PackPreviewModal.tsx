"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  StarterPackService,
  StarterPack,
} from "../services/starterPackService";
import { Word, Sentence } from "../types/word";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Plus, Check, Trash2 } from "lucide-react";
import {
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
  BookOpen,
} from "@phosphor-icons/react";
import { useToast } from "@/hooks/use-toast";

type PackLevel = "beginner" | "intermediate" | "advanced";

const LEVEL_CONFIG: Record<PackLevel, { color: string; bgColor: string }> = {
  beginner: { color: "text-emerald-600", bgColor: "bg-emerald-100" },
  intermediate: { color: "text-blue-600", bgColor: "bg-blue-100" },
  advanced: { color: "text-purple-600", bgColor: "bg-purple-100" },
};

// Icon mapping based on pack name keywords
const getPackIcon = (packName: string) => {
  const name = packName.toLowerCase();

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

  const fallbackIcons = [Star, BookOpen, Package, Lightning, ChatCircle];
  const hash = packName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return fallbackIcons[hash % fallbackIcons.length];
};

interface PackPreviewModalProps {
  pack: StarterPack | null;
  isOpen: boolean;
  onClose: () => void;
  isInstalled?: boolean;
  userWords?: Word[];
  onInstall?: (packId: string) => Promise<void>;
  onUninstall?: (packId: string) => Promise<void>;
  isInstalling?: boolean;
  isUninstalling?: boolean;
}

interface DisplayWord {
  id: string;
  arabic: string;
  english: string;
  transliteration: string | null;
  type: string | null;
  isLearned?: boolean;
}

type TabType = "words" | "sentences";

export function PackPreviewModal({
  pack,
  isOpen,
  onClose,
  isInstalled = false,
  userWords = [],
  onInstall,
  onUninstall,
  isInstalling,
  isUninstalling,
}: PackPreviewModalProps) {
  const [words, setWords] = useState<DisplayWord[]>([]);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [loading, setLoading] = useState(false);
  const [learnedCount, setLearnedCount] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>("words");
  const { toast } = useToast();

  useEffect(() => {
    if (!pack || !isOpen) return;

    const packId = pack.id;

    async function loadWords() {
      setLoading(true);
      try {
        // Always fetch pack words from the database
        const { words: packWords } = await StarterPackService.getPackContents(packId);

        // Fetch pack-level sentences
        const supabase = createClient();
        const { data: packSentences } = await supabase
          .from("sentences")
          .select("*")
          .eq("pack_id", packId)
          .order("english");

        setSentences(packSentences || []);

        if (isInstalled && userWords.length > 0) {
          // For installed packs, augment with user's progress
          const now = new Date();
          const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

          // Create a map of user's words by english (for progress lookup)
          const userWordMap = new Map(
            userWords
              .filter(w => w.pack_id === packId)
              .map(w => [w.id, w])
          );

          const wordsWithProgress: DisplayWord[] = packWords.map(w => {
            const userWord = userWordMap.get(w.id);
            return {
              id: w.id,
              arabic: w.arabic,
              english: w.english,
              transliteration: w.transliteration,
              type: w.type,
              isLearned: userWord?.next_review_date
                ? new Date(userWord.next_review_date) > oneMonthFromNow
                : false,
            };
          });

          setWords(wordsWithProgress);
          setLearnedCount(wordsWithProgress.filter(w => w.isLearned).length);
        } else {
          // For uninstalled packs, just show the words
          setWords(packWords.map(w => ({
            id: w.id,
            arabic: w.arabic,
            english: w.english,
            transliteration: w.transliteration,
            type: w.type,
          })));
          setLearnedCount(0);
        }
      } catch {
        toast({
          variant: "destructive",
          title: "Failed to load pack",
        });
      } finally {
        setLoading(false);
      }
    }

    loadWords();
  }, [pack, isOpen, isInstalled, userWords, toast]);

  if (!pack) return null;

  const progressPercent = words.length > 0 ? Math.round((learnedCount / words.length) * 100) : 0;
  const PackIcon = getPackIcon(pack.name);
  const levelConfig = LEVEL_CONFIG[(pack.level as PackLevel) || "beginner"];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {pack.image_url ? (
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 relative">
                <Image
                  src={pack.image_url}
                  alt={pack.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${levelConfig.bgColor}`}>
                <PackIcon className={`w-5 h-5 ${levelConfig.color}`} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl">{pack.name}</DialogTitle>
              {pack.description && (
                <DialogDescription className="mt-0.5">
                  {pack.description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Progress bar for installed packs */}
        {isInstalled && words.length > 0 && (
          <div className="pb-2">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm text-body">Progress</span>
              <span className="text-sm font-medium">{learnedCount}/{words.length} learned</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("words")}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              activeTab === "words"
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            Words ({words.length})
          </button>
          <button
            onClick={() => setActiveTab("sentences")}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              activeTab === "sentences"
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            Sentences ({sentences.length})
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 min-h-0 overflow-y-auto -mx-6 px-6 mt-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-disabled" />
            </div>
          ) : activeTab === "words" ? (
            words.length === 0 ? (
              <div className="text-center py-12 text-subtle">
                No words in this pack
              </div>
            ) : (
              <div className="space-y-2 pb-4">
                {words.map((word, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      word.isLearned ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{word.english}</span>
                          {word.type && (
                            <span className="text-xs text-disabled shrink-0">{word.type}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-lg font-arabic">{word.arabic}</span>
                          {word.transliteration && (
                            <span className="text-sm text-subtle">{word.transliteration}</span>
                          )}
                        </div>
                      </div>
                      {word.isLearned && (
                        <Check className="w-4 h-4 text-green-600 shrink-0 ml-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            sentences.length === 0 ? (
              <div className="text-center py-12 text-subtle">
                No sentences in this pack
              </div>
            ) : (
              <div className="space-y-2 pb-4">
                {sentences.map((sentence) => (
                  <div
                    key={sentence.id}
                    className="p-3 rounded-lg border bg-gray-50 border-gray-100"
                  >
                    <p className="font-arabic text-lg text-gray-800">{sentence.arabic}</p>
                    {sentence.transliteration && (
                      <p className="text-subtle text-sm mt-0.5">{sentence.transliteration}</p>
                    )}
                    <p className="text-body mt-1">{sentence.english}</p>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Action buttons */}
        <DialogFooter className="pt-4 border-t sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {isInstalled ? (
            <Button
              variant="outline"
              onClick={() => onUninstall?.(pack.id)}
              disabled={isUninstalling}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              {isUninstalling ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Remove pack
            </Button>
          ) : (
            <Button
              onClick={() => onInstall?.(pack.id)}
              disabled={isInstalling}
            >
              {isInstalling ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add pack
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
