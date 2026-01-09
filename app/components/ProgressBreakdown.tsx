"use client";

import { useMemo } from "react";
import { Word } from "../types/word";

interface ProgressBreakdownProps {
  words: Word[];
}

export function ProgressBreakdown({ words }: ProgressBreakdownProps) {
  const { learned, learning, newWords, total } = useMemo(() => {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneMonth = 30 * oneDay;
    const oneDayFromNow = new Date(now.getTime() + oneDay);
    const oneMonthFromNow = new Date(now.getTime() + oneMonth);

    let learned = 0;
    let learning = 0;
    let newWords = 0;

    words.forEach((word) => {
      // Only count words with progress (status is learning or learned)
      if (!word.status || word.status === "new") {
        return;
      }

      if (!word.next_review_date) {
        newWords++;
        return;
      }

      const reviewDate = new Date(word.next_review_date);

      if (reviewDate > oneMonthFromNow) {
        learned++;
      } else if (reviewDate > oneDayFromNow) {
        learning++;
      } else {
        newWords++;
      }
    });

    return {
      learned,
      learning,
      newWords,
      total: learned + learning + newWords,
    };
  }, [words]);

  if (total === 0) {
    return null;
  }

  const learnedPercent = (learned / total) * 100;
  const learningPercent = (learning / total) * 100;
  const newPercent = (newWords / total) * 100;

  return (
    <div className="bg-white border rounded-xl p-5">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-900">Your progress</h3>
        <span className="text-sm text-gray-500">
          {learned} of {total} words learned
        </span>
      </div>

      {/* Segmented bar */}
      <div className="w-full h-3 rounded-full overflow-hidden flex bg-gray-100">
        {learnedPercent > 0 && (
          <div
            className="bg-green-500 h-full transition-all duration-500"
            style={{ width: `${learnedPercent}%` }}
          />
        )}
        {learningPercent > 0 && (
          <div
            className="bg-amber-400 h-full transition-all duration-500"
            style={{ width: `${learningPercent}%` }}
          />
        )}
        {newPercent > 0 && (
          <div
            className="bg-gray-300 h-full transition-all duration-500"
            style={{ width: `${newPercent}%` }}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-sm text-gray-600">Learned</span>
          <span className="text-sm font-medium text-gray-900">{learned}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="text-sm text-gray-600">Learning</span>
          <span className="text-sm font-medium text-gray-900">{learning}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
          <span className="text-sm text-gray-600">New</span>
          <span className="text-sm font-medium text-gray-900">{newWords}</span>
        </div>
      </div>
    </div>
  );
}
