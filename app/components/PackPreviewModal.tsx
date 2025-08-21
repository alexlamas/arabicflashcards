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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StarterPackService, StarterPack, StarterPackWord, StarterPackPhrase } from "../services/starterPackService";
import { BookOpen, Users, Sparkles, Package, ArrowRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface PackPreviewModalProps {
  pack: StarterPack | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PackPreviewModal({ pack, isOpen, onClose }: PackPreviewModalProps) {
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


  function getLevelIcon(level: string | null) {
    switch (level) {
      case "beginner":
        return <BookOpen className="h-4 w-4" />;
      case "intermediate":
        return <Users className="h-4 w-4" />;
      case "advanced":
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  }

  const handleSignUp = () => {
    onClose();
    setShowAuthDialog(true);
  };

  if (!pack) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{pack.name}</DialogTitle>
              {pack.description && (
                <DialogDescription className="mt-2 text-base">
                  {pack.description}
                </DialogDescription>
              )}
            </div>
            {pack.level && (
              <Badge variant="secondary" className="ml-4">
                <span className="flex items-center gap-1">
                  {getLevelIcon(pack.level)}
                  {pack.level}
                </span>
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Tabs defaultValue="words" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="words">
                  Words ({words.length})
                </TabsTrigger>
                <TabsTrigger value="phrases">
                  Phrases ({phrases.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="words" className="flex-1 min-h-0">
                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                  <div className="space-y-3">
                    {words.map((word) => (
                      <div
                        key={word.id}
                        className="flex items-start justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {word.english}
                          </div>
                          <div className="text-xl mt-1 text-gray-700" dir="rtl">
                            {word.arabic}
                          </div>
                          {word.transliteration && (
                            <div className="text-sm text-gray-500 mt-1 italic">
                              {word.transliteration}
                            </div>
                          )}
                        </div>
                        {word.type && (
                          <Badge variant="outline" className="ml-2">
                            {word.type}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="phrases" className="flex-1 min-h-0">
                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                  <div className="space-y-3">
                    {phrases.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        No phrases in this pack
                      </p>
                    ) : (
                      phrases.map((phrase) => (
                        <div
                          key={phrase.id}
                          className="flex items-start justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {phrase.english}
                            </div>
                            <div className="text-xl mt-1 text-gray-700" dir="rtl">
                              {phrase.arabic}
                            </div>
                            {phrase.transliteration && (
                              <div className="text-sm text-gray-500 mt-1 italic">
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

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleSignUp} className="gap-2">
            Sign up to import this pack
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}