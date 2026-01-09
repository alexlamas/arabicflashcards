"use client";

import { useState, useEffect } from "react";
import { Review } from "../../components/review/Review";
import { useWords } from "../../contexts/WordsContext";

export default function ReviewPage() {
  const { reviewCount } = useWords();
  const [initialCount, setInitialCount] = useState<number | null>(null);

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
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center w-full max-w-2xl px-4">
        {/* Min-height reserves space for card + controls so progress bar doesn't shift */}
        <div className="min-h-[400px] md:min-h-[340px] w-full">
          <Review />
        </div>

        {/* Progress bar below review */}
        {total > 0 && (
          <div className="w-48">
            <div className="bg-white border border-gray-200 rounded-full p-1 shadow-sm">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <div className="text-center mt-1.5">
              <span className="text-xs text-gray-500">
                {completed}/{total}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
