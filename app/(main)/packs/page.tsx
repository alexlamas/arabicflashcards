"use client";

import { useState } from "react";
import { Header } from "../../components/Header";
import { useAuth } from "../../contexts/AuthContext";
import { StarterPackSelector } from "../../components/StarterPackSelector";
import { Package } from "lucide-react";

export default function PacksPage() {
  const { session } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleComplete = () => {
    // Just refresh the component to show updated pack status
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <Header
        variant="default"
        session={session}
        title="Starter Packs"
      />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Word Collections</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Browse and import curated word collections to expand your vocabulary.
            Each pack contains words and phrases organized by theme or difficulty level.
          </p>
        </div>

        <StarterPackSelector 
          key={refreshKey}
          onComplete={handleComplete}
          showSkip={false}
        />

        <div className="mt-12 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">About Starter Packs</h2>
          <p className="text-gray-600">
            Starter packs are pre-made collections of words and phrases designed to help you learn efficiently. 
            You can import multiple packs, and all words will be added to your personal collection where you can 
            edit, delete, or organize them as you wish.
          </p>
        </div>
      </div>
    </>
  );
}