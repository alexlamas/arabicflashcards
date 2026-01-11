"use client";

import { useState, useEffect } from "react";
import Joyride, { CallBackProps, STATUS, TooltipRenderProps } from "react-joyride";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const TOUR_STEPS = [
  {
    target: '[data-tour="my-words"]',
    title: "My Words",
    content: "Your personal vocabulary library. Add custom words and track your progress.",
    disableBeacon: true,
    placement: "bottom" as const,
  },
  {
    target: '[data-tour="play"]',
    title: "Play",
    content: "Fun memory games to reinforce what you've learned. Great for a quick practice!",
    disableBeacon: true,
    placement: "bottom" as const,
  },
  {
    target: '[data-tour="review"]',
    title: "Review",
    content: "Practice words with spaced repetition. Complete daily reviews to build lasting memory.",
    disableBeacon: true,
    placement: "bottom" as const,
  },
];

const TOUR_SHOWN_KEY = "app_tour_shown";
const SHOW_TOUR_KEY = "show_app_tour";

function CustomTooltip({
  index,
  step,
  tooltipProps,
  primaryProps,
  skipProps,
  isLastStep,
}: TooltipRenderProps) {
  return (
    <div {...tooltipProps} className="w-72">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-4 relative">
        {/* Close button */}
        <button
          {...skipProps}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>

        <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
        <p className="text-sm text-gray-500 mb-4">{step.content}</p>

        <div className="flex items-center justify-between">
          {/* Step indicator */}
          <div className="flex gap-1">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  i === index ? "bg-emerald-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          {/* Next button */}
          <Button {...primaryProps} size="sm" className="rounded-full">
            {isLastStep ? "Got it!" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AppTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const shouldShow = localStorage.getItem(SHOW_TOUR_KEY) === "true";
    const alreadyShown = localStorage.getItem(TOUR_SHOWN_KEY) === "true";

    if (shouldShow && !alreadyShown) {
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem(TOUR_SHOWN_KEY, "true");
      localStorage.removeItem(SHOW_TOUR_KEY);
    }
  };

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={run}
      continuous
      callback={handleCallback}
      tooltipComponent={CustomTooltip}
      floaterProps={{
        hideArrow: true,
        styles: {
          floater: {
            filter: "none",
          },
        },
      }}
      disableScrolling
      styles={{
        options: {
          zIndex: 1000,
          overlayColor: "rgba(0, 0, 0, 0.3)",
        },
        spotlight: {
          borderRadius: 9999,
          boxShadow: "0 0 0 3px rgba(255, 255, 255, 0.9), 0 0 0 9999px rgba(0, 0, 0, 0.3)",
        },
      }}
      spotlightPadding={4}
    />
  );
}
