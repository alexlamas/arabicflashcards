import type { Word } from "../types/word";

const isValidDate = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

export function calculateDueWords(words: Word[], limit?: number, packId?: string): Word[] {
  if (!Array.isArray(words)) {
    console.warn("calculateDueWords: words is not an array");
    return [];
  }

  const now = new Date();

  let dueWords = words.filter(word => {
    // Skip words without any progress data
    if (!word.status || word.status === "new" || !word.next_review_date) {
      return false;
    }

    // Validate the review date
    if (!isValidDate(word.next_review_date)) {
      console.warn(`Invalid review date for word: ${word.english}`);
      return false;
    }

    // Include any word (learning or learned) that has a review date in the past
    try {
      const reviewDate = new Date(word.next_review_date);
      return reviewDate <= now;
    } catch (error) {
      console.error(`Error parsing date for word ${word.english}:`, error);
      return false;
    }
  });

  // Apply pack filter if specified
  if (packId === "my-words") {
    dueWords = dueWords.filter(word => !word.pack_id);
  } else if (packId) {
    dueWords = dueWords.filter(word => word.pack_id === packId);
  }

  // Sort by next_review_date (earliest first)
  dueWords.sort((a, b) => {
    // We already validated these dates in the filter
    const dateA = new Date(a.next_review_date!).getTime();
    const dateB = new Date(b.next_review_date!).getTime();
    return dateA - dateB;
  });

  return limit && limit > 0 ? dueWords.slice(0, limit) : dueWords;
}

export function countDueWords(words: Word[], packId?: string): number {
  return calculateDueWords(words, undefined, packId).length;
}