"use client";

import { useState, useEffect } from "react";
import { Review } from "../../components/review/Review";
import { useWords } from "../../contexts/WordsContext";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default function ReviewPage() {
  const { reviewCount } = useWords();
  const [initialCount, setInitialCount] = useState<number | null>(null);

  // Track Google Ads conversion on page load
  useEffect(() => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "conversion", {
        send_to: "AW-17868033888/KnAFCNWos-cbEOCekshC",
      });
    }
  }, []);

  // Capture initial count on first load
  useEffect(() => {
    if (initialCount === null && reviewCount > 0) {
      setInitialCount(reviewCount);
    }
  }, [reviewCount, initialCount]);

  const total = initialCount || reviewCount || 1;
  const completed = total - reviewCount;
  const progressPercent = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="pt-16 pb-16">
      <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4">
        {/* Progress bar at top */}
        {total > 0 && (
          <div className="w-full mb-8 flex items-center gap-3 pl-2 pr-1">
            <div className="flex-1 bg-white border border-gray-200 rounded-full p-1 shadow-sm">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: progressPercent > 0 ? `${progressPercent}%` : '12px' }}
                />
              </div>
            </div>
            <span className="text-xs text-gray-500 tabular-nums">
              {completed}/{total}
            </span>
          </div>
        )}

        <Review />
      </div>
    </div>
  );
}
