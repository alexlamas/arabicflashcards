import type { Word } from "../types/word";

const isValidDate = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

export function calculateDueWords(words: Word[], limit?: number): Word[] {
  if (!Array.isArray(words)) {
    return [];
  }

  const now = new Date();

  const dueWords = words.filter(word => {
    // Skip words without any progress data
    if (!word.status || word.status === "new" || !word.next_review_date) {
      return false;
    }

    // Validate the review date
    if (!isValidDate(word.next_review_date)) {
      return false;
    }

    // Include any word (learning or learned) that has a review date in the past
    try {
      const reviewDate = new Date(word.next_review_date);
      return reviewDate <= now;
    } catch {
      return false;
    }
  });

  // Sort by next_review_date (earliest first)
  dueWords.sort((a, b) => {
    const dateA = new Date(a.next_review_date!).getTime();
    const dateB = new Date(b.next_review_date!).getTime();
    return dateA - dateB;
  });

  return limit && limit > 0 ? dueWords.slice(0, limit) : dueWords;
}

export function countDueWords(words: Word[]): number {
  return calculateDueWords(words).length;
}