"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  StarterPackService,
  StarterPack,
} from "../services/starterPackService";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { PackPreviewModal } from "./PackPreviewModal";
import { PackCard } from "./PackCard";

export function LandingPage() {
  const [packs, setPacks] = useState<StarterPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPack, setSelectedPack] = useState<StarterPack | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [currentPackIndex, setCurrentPackIndex] = useState(0);
  const { setShowAuthDialog } = useAuth();

  useEffect(() => {
    async function loadPacks() {
      try {
        const availablePacks = await StarterPackService.getAvailablePacks();
        setPacks(availablePacks);
      } catch (error) {
        console.error("Error loading packs:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPacks();
  }, []);

  const handlePackPreview = (pack: StarterPack) => {
    setSelectedPack(pack);
    setShowPreview(true);
  };

  const nextPack = () => {
    setCurrentPackIndex((prev) => (prev + 1) % packs.length);
  };

  const prevPack = () => {
    setCurrentPackIndex((prev) => (prev - 1 + packs.length) % packs.length);
  };

  return (
    <div className="h-screen bg-brand-bg overflow-hidden flex flex-col justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Title and Subtitle */}
        <div className="text-center mb-8 flex flex-col items-center">
          <h1 className="font-pphatton text-7xl sm:text-6xl md:text-7xl font-bold text-brand-fg mb-4 max-w-2xl">
            Yalla! let&apos;s learn Lebanese arabic
          </h1>
          <p className="font-geist-mono text-white/90 max-w-2xl mx-auto px-12">
            Master Lebanese with smart flashcards that adapt to your learning
            pace and add your own as you go.
          </p>
        </div>

        {/* Pack Carousel */}
        <div className="mb-10 h-64 flex items-center justify-center">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-80 h-56 rounded-lg bg-gray-100/10 animate-pulse" />
            </div>
          ) : packs.length > 0 ? (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={prevPack}
                className="p-2 rounded-full bg-brand-fg/10 hover:bg-brand-fg/20 transition text-brand-fg"
                aria-label="Previous pack"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <div className="w-[30rem]">
                <PackCard
                  pack={packs[currentPackIndex]}
                  onPreview={handlePackPreview}
                  showImportButton={false}
                />
              </div>

              <button
                onClick={nextPack}
                className="p-2 rounded-full bg-brand-fg/10 hover:bg-brand-fg/20 transition text-brand-fg"
                aria-label="Next pack"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          ) : null}
        </div>

        {/* CTAs */}
        <div className="flex gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => setShowAuthDialog(true)}
            className="gap-2 px-8 py-6 !bg-brand-fg !text-brand-bg font-geist-mono font-medium rounded-full group transition hover:scale-105"
          >
            Start learning
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition" />
          </Button>
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
    </div>
  );
}
