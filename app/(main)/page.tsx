"use client";

import { useAuth } from "../contexts/AuthContext";
import { useWords } from "../contexts/WordsContext";
import { LandingPage } from "../components/LandingPage";
import { Dashboard } from "../components/Dashboard";

function HomeContent() {
  const { session, isLoading: isAuthLoading } = useAuth();
  const { isLoading: isWordsLoading } = useWords();

  if (isAuthLoading) {
    return null;
  }

  // Show landing page for non-authenticated users
  if (!session) {
    return <LandingPage />;
  }

  // Show loading for authenticated users while words are loading
  if (isWordsLoading) {
    return null;
  }

  return <Dashboard />;
}

export default function Home() {
  return <HomeContent />;
}
