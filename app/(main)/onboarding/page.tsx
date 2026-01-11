"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProfile } from "../../contexts/ProfileContext";
import { useAuth } from "../../contexts/AuthContext";
import { AVATAR_OPTIONS, FluencyLevel } from "../../services/profileService";
import { PackService, Pack } from "../../services/packService";
import { cn } from "@/lib/utils";
import { ArrowRight, Check, Loader2, Sparkle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FLUENCY_OPTIONS: {
  value: FluencyLevel;
  label: string;
  description: string;
}[] = [
  {
    value: "beginner",
    label: "Beginner",
    description: "I'm just starting to learn Arabic",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "I know some words and basic phrases",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "I can hold conversations in Arabic",
  },
];

type PackWithCount = Pack & { wordCount: number };

export default function OnboardingPage() {
  const router = useRouter();
  const { session, isLoading: isAuthLoading } = useAuth();
  const { updateProfile, onboardingCompleted, isLoading: isProfileLoading } = useProfile();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("pomegranate");
  const [fluency, setFluency] = useState<FluencyLevel | null>(null);
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [packs, setPacks] = useState<PackWithCount[]>([]);
  const [isLoadingPacks, setIsLoadingPacks] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if already onboarded
  useEffect(() => {
    if (!isAuthLoading && !isProfileLoading && onboardingCompleted) {
      router.replace("/");
    }
  }, [isAuthLoading, isProfileLoading, onboardingCompleted, router]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthLoading && !session) {
      router.replace("/");
    }
  }, [isAuthLoading, session, router]);

  // Load packs when reaching step 4
  useEffect(() => {
    if (step === 4 && packs.length === 0) {
      loadPacks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, packs.length]);

  async function loadPacks() {
    setIsLoadingPacks(true);
    try {
      const [availablePacks, wordCounts] = await Promise.all([
        PackService.getAvailablePacks(),
        PackService.getPackWordCounts(),
      ]);

      const packsWithCounts = availablePacks.map((p) => ({
        ...p,
        wordCount: wordCounts[p.id] || 0,
      }));

      // Sort by fluency match
      packsWithCounts.sort((a, b) => {
        const aMatch = a.level === fluency;
        const bMatch = b.level === fluency;
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });

      setPacks(packsWithCounts);
    } catch (error) {
      console.error("Failed to load packs:", error);
    } finally {
      setIsLoadingPacks(false);
    }
  }

  async function handleComplete() {
    if (!selectedPack) return;

    setIsSaving(true);
    try {
      // Save profile
      await updateProfile({
        first_name: name.trim() || undefined,
        avatar,
        fluency: fluency || undefined,
        onboarding_completed: true,
      });

      // Start the selected pack
      await PackService.startPack(selectedPack);

      // Redirect to home with tour flag
      localStorage.setItem("show_app_tour", "true");
      router.replace("/");
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    } finally {
      setIsSaving(false);
    }
  }

  function canProceed() {
    switch (step) {
      case 1:
        return true; // Name is optional
      case 2:
        return true; // Avatar has default
      case 3:
        return fluency !== null;
      case 4:
        return selectedPack !== null;
      default:
        return false;
    }
  }

  function handleNext() {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  }

  // Show loading while checking auth/profile
  if (isAuthLoading || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Don't render if should redirect
  if (!session || onboardingCompleted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      {/* Progress indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200">
        <div
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-center gap-2 pt-8">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              s === step
                ? "bg-emerald-500 w-6"
                : s < step
                  ? "bg-emerald-500"
                  : "bg-gray-300"
            )}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md"
          >
            {/* Step 1: Welcome + Name */}
            {step === 1 && (
              <div className="text-center space-y-6">
                <div className="text-4xl mb-2">مرحبا</div>
                <h1 className="text-2xl font-bold text-heading">
                  Welcome to Arabic Flashcards
                </h1>
                <p className="text-subtle">
                  Let&apos;s get you set up in just a few steps
                </p>
                <div className="pt-4">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="What should we call you?"
                    className="text-center text-lg h-12"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Step 2: Avatar */}
            {step === 2 && (
              <div className="text-center space-y-6">
                <h1 className="text-2xl font-bold text-heading">
                  Choose your avatar
                </h1>
                <p className="text-subtle">Pick one that represents you</p>
                <div className="flex justify-center gap-4 pt-4">
                  {AVATAR_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setAvatar(option.id)}
                      className={cn(
                        "relative w-16 h-16 rounded-full overflow-hidden border-3 transition-all",
                        avatar === option.id
                          ? "border-emerald-500 ring-4 ring-emerald-100 scale-110"
                          : "border-gray-200 hover:border-gray-300 hover:scale-105"
                      )}
                    >
                      <Image
                        src={option.image}
                        alt={option.label}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Fluency */}
            {step === 3 && (
              <div className="text-center space-y-6">
                <h1 className="text-2xl font-bold text-heading">
                  What&apos;s your level?
                </h1>
                <p className="text-subtle">
                  This helps us recommend the right content
                </p>
                <div className="space-y-3 pt-4">
                  {FLUENCY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFluency(option.value)}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 text-left transition-all",
                        fluency === option.value
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-heading">
                            {option.label}
                          </div>
                          <div className="text-sm text-subtle">
                            {option.description}
                          </div>
                        </div>
                        {fluency === option.value && (
                          <Check className="h-5 w-5 text-emerald-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Pack Selection */}
            {step === 4 && (
              <div className="text-center space-y-6">
                <h1 className="text-2xl font-bold text-heading">
                  Pick a pack to start
                </h1>
                <p className="text-subtle">
                  You can add more packs later from the home page
                </p>
                {isLoadingPacks ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="space-y-3 pt-4 max-h-[50vh] overflow-y-auto">
                    {packs.map((pack) => {
                      const isRecommended = pack.level === fluency;
                      return (
                        <button
                          key={pack.id}
                          onClick={() => setSelectedPack(pack.id)}
                          className={cn(
                            "w-full p-4 rounded-xl border-2 text-left transition-all",
                            selectedPack === pack.id
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-heading">
                                  {pack.name}
                                </span>
                                {isRecommended && (
                                  <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                    <Sparkle className="h-3 w-3" />
                                    Recommended
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-subtle">
                                {pack.wordCount} words · {pack.level || "All levels"}
                              </div>
                            </div>
                            {selectedPack === pack.id && (
                              <Check className="h-5 w-5 text-emerald-500" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom button */}
      <div className="p-4 pb-8">
        <div className="max-w-md mx-auto">
          <Button
            onClick={handleNext}
            disabled={!canProceed() || isSaving}
            className="w-full h-12 text-base rounded-full"
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : step === 4 ? (
              "Start learning"
            ) : (
              <>
                Continue
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
