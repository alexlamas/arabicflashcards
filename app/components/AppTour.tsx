"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TOUR_STEPS = [
  {
    target: "my-words",
    title: "My Words",
    description: "Your personal vocabulary library. Add custom words and track your progress.",
    position: "bottom" as const,
  },
  {
    target: "review",
    title: "Review",
    description: "Practice words with spaced repetition. Complete daily reviews to build lasting memory.",
    position: "bottom" as const,
  },
  {
    target: "play",
    title: "Play",
    description: "Fun memory games to reinforce what you've learned. Great for a quick practice!",
    position: "bottom" as const,
  },
];

const TOUR_SHOWN_KEY = "app_tour_shown";
const SHOW_TOUR_KEY = "show_app_tour";

export function AppTour() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    // Check if we should show the tour (set by onboarding)
    const shouldShow = localStorage.getItem(SHOW_TOUR_KEY) === "true";
    const alreadyShown = localStorage.getItem(TOUR_SHOWN_KEY) === "true";

    if (shouldShow && !alreadyShown) {
      // Small delay to let the page render
      const timer = setTimeout(() => {
        setIsVisible(true);
        updateTooltipPosition(0);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      updateTooltipPosition(currentStep);

      // Recalculate on resize
      const handleResize = () => updateTooltipPosition(currentStep);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [currentStep, isVisible]);

  function updateTooltipPosition(stepIndex: number) {
    const step = TOUR_STEPS[stepIndex];
    const targetElement = document.querySelector(`[data-tour="${step.target}"]`);

    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom + 16,
        left: rect.left + rect.width / 2,
      });
    }
  }

  function handleNext() {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  }

  function handleClose() {
    setIsVisible(false);
    localStorage.setItem(TOUR_SHOWN_KEY, "true");
    localStorage.removeItem(SHOW_TOUR_KEY);
  }

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[100]"
        onClick={handleClose}
      />

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed z-[101] w-72"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            transform: "translateX(-50%)",
          }}
        >
          {/* Arrow */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l border-t border-gray-200" />

          {/* Content */}
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-4 relative">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="font-semibold text-heading mb-1">{step.title}</h3>
            <p className="text-sm text-subtle mb-4">{step.description}</p>

            <div className="flex items-center justify-between">
              {/* Step indicator */}
              <div className="flex gap-1">
                {TOUR_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${
                      i === currentStep ? "bg-emerald-500" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              {/* Next button */}
              <Button size="sm" onClick={handleNext} className="rounded-full">
                {currentStep === TOUR_STEPS.length - 1 ? "Got it!" : "Next"}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
