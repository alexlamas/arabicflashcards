"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Header } from "../../components/Header";
import { Phrase } from "../../types/phrase";
import { PhraseService } from "../../services/phraseService";
import PhraseGrid from "../../components/PhraseGrid";

function PhrasesContent() {
  const { session, isLoading: isAuthLoading } = useAuth();
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [hideArabic, setHideArabic] = useState(false);

  useEffect(() => {
    loadPhrases();
  }, []);

  const loadPhrases = async () => {
    try {
      setIsLoading(true);
      const data = await PhraseService.getAllPhrases();
      setPhrases(data);
    } catch (error) {
      console.error("Error loading phrases:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhraseDeleted = async (phraseId: string) => {
    try {
      await PhraseService.deletePhrase(phraseId);
      setPhrases(phrases.filter(p => p.id !== phraseId));
    } catch (error) {
      console.error("Error deleting phrase:", error);
    }
  };

  const handlePhraseUpdate = async (phraseId: string, updates: Partial<Phrase>) => {
    try {
      const updatedPhrase = await PhraseService.updatePhrase(phraseId, updates);
      setPhrases(phrases.map(p => p.id === phraseId ? updatedPhrase : p));
    } catch (error) {
      console.error("Error updating phrase:", error);
    }
  };

  const filteredPhrases = phrases.filter(phrase => {
    const term = searchTerm.toLowerCase();
    return (
      phrase.english?.toLowerCase().includes(term) ||
      phrase.arabic?.toLowerCase().includes(term) ||
      phrase.transliteration?.toLowerCase().includes(term)
    );
  });

  if (isAuthLoading || isLoading) {
    return null;
  }

  return (
    <>
      <Header
        session={session}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        hideArabic={hideArabic}
        setHideArabic={setHideArabic}
        title="All Phrases"
      />
      <div className="p-4">
        <PhraseGrid
          phrases={filteredPhrases}
          hideArabic={hideArabic}
          onPhraseDeleted={handlePhraseDeleted}
          onPhraseUpdate={handlePhraseUpdate}
        />
      </div>
    </>
  );
}

export default function PhrasesPage() {
  return <PhrasesContent />;
}