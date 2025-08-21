"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarterPackService, StarterPack } from "../services/starterPackService";
import { useWords } from "../contexts/WordsContext";
import { CheckCircle2, Package, Users, BookOpen, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StarterPackSelectorProps {
  onComplete?: () => void;
  showSkip?: boolean;
}

export function StarterPackSelector({ onComplete, showSkip = true }: StarterPackSelectorProps) {
  const [packs, setPacks] = useState<StarterPack[]>([]);
  const [importedPacks, setImportedPacks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { refreshWords } = useWords();

  useEffect(() => {
    loadPacks();
  }, []);

  async function loadPacks() {
    try {
      setLoading(true);
      const [availablePacks, userImportedPacks] = await Promise.all([
        StarterPackService.getAvailablePacks(),
        StarterPackService.getUserImportedPacks()
      ]);
      setPacks(availablePacks);
      setImportedPacks(userImportedPacks);
    } catch (err) {
      console.error("Error loading starter packs:", err);
      setError("Failed to load starter packs");
    } finally {
      setLoading(false);
    }
  }

  async function handleImportPack(packId: string) {
    try {
      setImporting(packId);
      setError(null);
      setSuccess(null);

      const result = await StarterPackService.importPack(packId);
      
      setSuccess(`Successfully imported ${result.wordsImported} words and ${result.phrasesImported} phrases!`);
      setImportedPacks([...importedPacks, packId]);
      
      // Refresh the words in the context
      await refreshWords();

      // Auto-close success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error importing pack:", err);
      setError(err instanceof Error ? err.message : "Failed to import pack");
    } finally {
      setImporting(null);
    }
  }

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

  function getLevelColor(level: string | null) {
    switch (level) {
      case "beginner":
        return "text-green-600";
      case "intermediate":
        return "text-blue-600";
      case "advanced":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading starter packs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Choose Your Starter Packs</h2>
        <p className="text-gray-600">
          Select word collections to begin your learning journey
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {packs.map((pack) => {
          const isImported = importedPacks.includes(pack.id);
          const isImporting = importing === pack.id;

          return (
            <Card key={pack.id} className={isImported ? "opacity-75" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {pack.icon && <span className="text-2xl">{pack.icon}</span>}
                      <span>{pack.name}</span>
                    </CardTitle>
                    {pack.level && (
                      <div className={`flex items-center gap-1 text-sm ${getLevelColor(pack.level)}`}>
                        {getLevelIcon(pack.level)}
                        <span className="capitalize">{pack.level}</span>
                      </div>
                    )}
                  </div>
                  {isImported && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {pack.description || "A collection of essential words and phrases"}
                </CardDescription>
                <Button
                  onClick={() => handleImportPack(pack.id)}
                  disabled={isImported || isImporting}
                  variant={isImported ? "outline" : "default"}
                  className="w-full"
                >
                  {isImporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Importing...
                    </>
                  ) : isImported ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Imported
                    </>
                  ) : (
                    <>
                      <Package className="h-4 w-4 mr-2" />
                      Import Pack
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {showSkip && (
        <div className="text-center pt-4">
          <Button
            variant="ghost"
            onClick={onComplete}
            className="text-gray-600"
          >
            Skip for now
          </Button>
        </div>
      )}
    </div>
  );
}