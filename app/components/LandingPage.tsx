"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StarterPackService, StarterPack } from "../services/starterPackService";
import { BookOpen, Users, Sparkles, Package, LogIn, ArrowRight, Globe, Brain, Coffee, Eye } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { PackPreviewModal } from "./PackPreviewModal";

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

  function getLevelIcon(level: string | null) {
    switch (level) {
      case "beginner":
        return <BookOpen className="h-5 w-5" />;
      case "intermediate":
        return <Users className="h-5 w-5" />;
      case "advanced":
        return <Sparkles className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  }

  function getPackIcon(name: string) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("travel") || lowerName.includes("tourist")) {
      return <Globe className="h-8 w-8 text-blue-500" />;
    }
    if (lowerName.includes("essential") || lowerName.includes("basic")) {
      return <Brain className="h-8 w-8 text-green-500" />;
    }
    if (lowerName.includes("food") || lowerName.includes("restaurant")) {
      return <Coffee className="h-8 w-8 text-orange-500" />;
    }
    return <Package className="h-8 w-8 text-purple-500" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-70" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Learn Lebanese Arabic
              <span className="block text-blue-600 mt-2">The Fun Way</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Master Lebanese Arabic with our spaced repetition flashcards. 
              Start with curated word collections and track your progress.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => setShowAuthDialog(true)}
                className="gap-2"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setShowAuthDialog(true)}
                className="gap-2"
              >
                <LogIn className="h-4 w-4" />
                Log In
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Collections Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Learning Path
          </h2>
          <p className="text-lg text-gray-600">
            Start with one of our curated word collections. You can always add more later!
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4" />
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packs.map((pack) => (
              <Card 
                key={pack.id} 
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-blue-200 group"
                onClick={() => {
                  setSelectedPack(pack);
                  setShowPreview(true);
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {getPackIcon(pack.name)}
                    </div>
                    {pack.level && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                        {getLevelIcon(pack.level)}
                        <span className="capitalize">{pack.level}</span>
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-xl">{pack.name}</CardTitle>
                  {pack.description && (
                    <CardDescription className="mt-2">
                      {pack.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600 group-hover:text-blue-600 transition-colors">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      Click to preview
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Features Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Spaced Repetition</h3>
            <p className="text-gray-600">
              Our smart algorithm shows you words right when you&apos;re about to forget them
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Globe className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Offline Support</h3>
            <p className="text-gray-600">
              Practice anywhere, anytime. Your progress syncs when you&apos;re back online
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
            <p className="text-gray-600">
              See your learning stats and celebrate milestones as you master new words
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
            Join hundreds of learners mastering Lebanese Arabic
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => setShowAuthDialog(true)}
            className="gap-2"
          >
            Sign Up Free
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