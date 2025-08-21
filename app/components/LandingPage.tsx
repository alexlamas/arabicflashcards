"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { StarterPackService, StarterPack } from "../services/starterPackService";
import { LogIn, ArrowRight, Brain, Globe, Sparkles } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { PackPreviewModal } from "./PackPreviewModal";
import { PackCard } from "./PackCard";

export function LandingPage() {
  const [packs, setPacks] = useState<StarterPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPack, setSelectedPack] = useState<StarterPack | null>(null);
  const [showPreview, setShowPreview] = useState(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-70" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Yalla! Let&apos;s Learn
              <span className="block text-blue-600 mt-2">Lebanese Arabic</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Master Lebanese Arabic with smart flashcards that adapt to your learning pace. 
              Build confidence in real conversations, one word at a time.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => setShowAuthDialog(true)}
                className="gap-2"
              >
                Start Learning - It&apos;s Free!
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setShowAuthDialog(true)}
                className="gap-2"
              >
                <LogIn className="h-4 w-4" />
                I&apos;m Back for More!
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Collections Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Pick Your Starter Pack
          </h2>
          <p className="text-lg text-gray-600">
            Browse our curated word collections organized by theme and difficulty. 
            <span className="block mt-2 text-base">Preview any pack before signing up to see if it matches your learning goals.</span>
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packs.map((pack) => (
              <PackCard 
                key={pack.id}
                pack={pack}
                onPreview={handlePackPreview}
                showImportButton={false}
              />
            ))}
          </div>
        )}

        {/* Features Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Spaced Repetition</h3>
            <p className="text-gray-600">
              Our algorithm schedules reviews at optimal intervals, helping you remember words with less effort and better retention.
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Globe className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Works in Airplane Mode</h3>
            <p className="text-gray-600">
              Continue learning without an internet connection. Your progress automatically syncs when you reconnect.
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Track Your Progress</h3>
            <p className="text-gray-600">
              Monitor your learning journey with detailed statistics, streaks, and milestones that keep you motivated.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16 mt-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of learners mastering Lebanese Arabic with our proven method.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => setShowAuthDialog(true)}
            className="gap-2"
          >
            Yalla, Let&apos;s Go!
            <ArrowRight className="h-4 w-4" />
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