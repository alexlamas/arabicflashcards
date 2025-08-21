"use client";

import { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import { useAuth } from "../../contexts/AuthContext";
import { useWords } from "../../contexts/WordsContext";
import { StarterPackService, StarterPack } from "../../services/starterPackService";
import { PackCard } from "../../components/PackCard";
import { PackPreviewModal } from "../../components/PackPreviewModal";
import { Package, Sparkles, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PacksPage() {
  const { session, isLoading: authLoading } = useAuth();
  const { refreshWords } = useWords();
  const [packs, setPacks] = useState<StarterPack[]>([]);
  const [importedPacks, setImportedPacks] = useState<string[]>([]);
  const [selectedPack, setSelectedPack] = useState<StarterPack | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !session) {
      router.push("/");
    }
  }, [authLoading, session, router]);

  useEffect(() => {
    if (session) {
      loadPacks();
    }
  }, [session]);

  async function loadPacks() {
    setLoading(true);
    try {
      const [availablePacks, userImportedPacks] = await Promise.all([
        StarterPackService.getAvailablePacks(),
        StarterPackService.getUserImportedPacks()
      ]);
      setPacks(availablePacks);
      setImportedPacks(userImportedPacks);
    } catch (error) {
      console.error("Error loading packs:", error);
      setError("Failed to load starter packs");
    } finally {
      setLoading(false);
    }
  }

  const handleImport = async (pack: StarterPack) => {
    setImporting(pack.id);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await StarterPackService.importPack(pack.id);
      setSuccess(`Successfully imported ${result.wordsImported} words and ${result.phrasesImported} phrases!`);
      setImportedPacks([...importedPacks, pack.id]);
      await refreshWords();
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import pack");
    } finally {
      setImporting(null);
    }
  };

  const handlePreview = (pack: StarterPack) => {
    setSelectedPack(pack);
    setShowPreview(true);
  };

  if (authLoading || !session) {
    return null;
  }

  return (
    <>
      <Header
        variant="default"
        session={session}
        title="Word Collections"
      />
      <div className="p-6 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Word Collections</h1>
              </div>
              <p className="text-gray-700 text-lg max-w-2xl">
                Expand your vocabulary with our curated collections. Each pack is carefully designed 
                to help you learn practical, everyday Lebanese Arabic.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadPacks}
              disabled={loading}
              className="hidden sm:flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <Sparkles className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Packs Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : packs.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No starter packs available at the moment.</p>
            <p className="text-gray-500 mt-2">Check back later for new collections!</p>
          </div>
        ) : (
          <>
            {/* Available Packs */}
            <div className="mb-12">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                {importedPacks.length === packs.length ? 'All Packs' : 'Available Packs'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packs.filter(pack => !importedPacks.includes(pack.id)).map((pack) => (
                  <div key={pack.id} className={importing === pack.id ? 'opacity-50' : ''}>
                    <PackCard 
                      pack={pack}
                      onPreview={handlePreview}
                      onImport={handleImport}
                      isImported={false}
                      showImportButton={true}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Imported Packs */}
            {importedPacks.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Already Imported</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
                  {packs.filter(pack => importedPacks.includes(pack.id)).map((pack) => (
                    <PackCard 
                      key={pack.id}
                      pack={pack}
                      onPreview={handlePreview}
                      isImported={true}
                      showImportButton={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Info Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Curated Content</h3>
            <p className="text-gray-700 text-sm">
              Each pack is carefully curated with the most useful words and phrases for real-life situations.
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Instant Import</h3>
            <p className="text-gray-700 text-sm">
              Import any pack with one click. All words are added to your personal collection immediately.
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Full Control</h3>
            <p className="text-gray-700 text-sm">
              After importing, you can edit, delete, or reorganize any words to match your learning style.
            </p>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <PackPreviewModal 
        pack={selectedPack}
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false);
          setSelectedPack(null);
        }}
      />
    </>
  );
}