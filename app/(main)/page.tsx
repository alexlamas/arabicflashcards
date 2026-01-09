"use client";

import { useAuth } from "../contexts/AuthContext";
import { useWords } from "../contexts/WordsContext";
import NewLandingPage from "../new/page";
import { Dashboard } from "../components/Dashboard";

function HomeContent() {
  const { session, isLoading: isAuthLoading } = useAuth();
  const { isLoading: isWordsLoading } = useWords();

  if (isAuthLoading) {
    return null;
  }

  // Show landing page for non-authenticated users
  if (!session) {
    return <NewLandingPage />;
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
