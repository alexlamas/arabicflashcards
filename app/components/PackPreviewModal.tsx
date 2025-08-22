"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  StarterPackService,
  StarterPack,
  StarterPackWord,
  StarterPackPhrase,
} from "../services/starterPackService";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface PackPreviewModalProps {
  pack: StarterPack | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PackPreviewModal({
  pack,
  isOpen,
  onClose,
}: PackPreviewModalProps) {
  const [words, setWords] = useState<StarterPackWord[]>([]);
  const [phrases, setPhrases] = useState<StarterPackPhrase[]>([]);
  const [loading, setLoading] = useState(false);
  const { setShowAuthDialog } = useAuth();

  useEffect(() => {
    async function load() {
      if (pack && isOpen) {
        setLoading(true);
        try {
          const contents = await StarterPackService.getPackContents(pack.id);
          setWords(contents.words);
          setPhrases(contents.phrases);
        } catch (error) {
          console.error("Error loading pack contents:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    load();
  }, [pack, isOpen]);

  const handleSignUp = () => {
    onClose();
    setShowAuthDialog(true);
  };

  if (!pack) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col bg-brand-accent border-none  items-center items-stretch p-8">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-3xl font-title">
                {pack.name}
              </DialogTitle>
              {pack.description && (
                <DialogDescription className="mt-2 text-base font-mono text-black/90">
                  {pack.description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          {loading ? (
            <Skeleton className="h-full w-full rounded-md bg-brand-bg/5" />
          ) : (
            <Tabs
              defaultValue="words"
              className="h-full flex flex-col gap-2 animate-fade-in"
            >
              {phrases.length > 0 && (
                <TabsList className="block inline-flex !rounded-md *:rounded-md bg-brand-bg/20 *:p-2 *:px-6 p-2 h-auto w-fit">
                  <TabsTrigger className="text-black font-mono" value="words">
                    Words <span className="opacity-50">({words.length})</span>
                  </TabsTrigger>
                  <TabsTrigger className="text-black font-mono" value="phrases">
                    Phrases{" "}
                    <span className="opacity-50">({phrases.length})</span>
                  </TabsTrigger>
                </TabsList>
              )}

              <TabsContent value="words" className="flex-1 min-h-0 h-full">
                <ScrollArea className="h-full w-full rounded-md bg-brand-bg/20 p-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {words.map((word) => (
                      <div
                        key={word.id}
                        className="flex items-start justify-between p-3 rounded-md bg-white/80 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-xl text-gray-900 font-pphatton">
                            {word.english}
                          </div>
                          <div
                            className="text-3xl text-gray-700 pr-3"
                            dir="rtl"
                          >
                            {word.arabic}
                          </div>
                          {word.transliteration && (
                            <div className="text-sm text-gray-500 font-mono">
                              {word.transliteration}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="phrases" className="flex-1 min-h-0">
                <ScrollArea className="h-full w-full rounded-md bg-brand-bg/20 p-4">
                  <div className="space-y-3">
                    {phrases.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        No phrases in this pack
                      </p>
                    ) : (
                      phrases.map((phrase) => (
                        <div
                          key={phrase.id}
                          className="flex items-start justify-between p-4 rounded-md bg-white/60 transition-colors"
                        >
                          <div className="flex-1">
                            <div className=" text-lg">{phrase.english}</div>

                            {phrase.transliteration && (
                              <div className="text-sm mt-1 font-mono opacity-80">
                                {phrase.transliteration}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </div>

        <DialogFooter className="flex !justify-between w-full mt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 sm:px-8 py-5 sm:py-6 border-white/50
            !bg-white/20 !text-black font-geist-mono font-medium rounded-full group transition hover:scale-105 text-sm sm:text-base"
          >
            Close
          </Button>
          <Button
            onClick={handleSignUp}
            className="gap-2 px-6 sm:px-8 py-5 sm:py-6 !bg-black !text-white font-geist-mono font-medium rounded-full group transition hover:scale-105 text-sm sm:text-base"
          >
            Start learning
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-2 group-hover:-rotate-12 transition" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
