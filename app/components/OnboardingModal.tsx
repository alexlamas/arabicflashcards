"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StarterPackSelector } from "./StarterPackSelector";
import { useAuth } from "../contexts/AuthContext";
import { useWords } from "../contexts/WordsContext";

export function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const { session } = useAuth();
  const { words } = useWords();

  useEffect(() => {
    // Show onboarding if user is logged in and has no words
    if (session?.user && words.length === 0) {
      // Check if we've already shown onboarding in this session
      const hasSeenOnboarding = sessionStorage.getItem("hasSeenOnboarding");
      if (!hasSeenOnboarding) {
        setOpen(true);
      }
    }
  }, [session, words]);

  function handleComplete() {
    sessionStorage.setItem("hasSeenOnboarding", "true");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Welcome to Arabic Flashcards!</DialogTitle>
        </DialogHeader>
        <StarterPackSelector 
          onComplete={handleComplete}
          showSkip={true}
        />
      </DialogContent>
    </Dialog>
  );
}