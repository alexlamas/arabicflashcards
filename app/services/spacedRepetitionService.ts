import { supabase } from "../supabase";

// app/services/spacedRepetitionService.ts
export class SpacedRepetitionService {
  static async getDueWords(userId: string, limit: number = 20) {
    try {
      const { data, error } = await supabase
        .from("word_progress")
        .select("word_english")
        .eq("user_id", userId)
        .eq("status", "learning")
        .limit(limit);

      if (error) throw error;

      if (!data?.length) return [];

      // Then get the word details in a separate query
      const { data: words, error: wordsError } = await supabase
        .from("words")
        .select("id, english, arabic, transliteration, type")
        .in(
          "english",
          data.map((p) => p.word_english)
        );

      if (wordsError) throw wordsError;

      return (
        words?.map((word) => ({
          ...word,
          word_english: word.english, // ensure this field exists for the later lookup
        })) || []
      );
    } catch (error) {
      console.error("Error in getDueWords:", error);
      throw error;
    }
  }
  static async processReview(
    userId: string,
    wordEnglish: string,
    rating: number
  ) {
    try {
      // Get current progress data
      const { data: currentProgress, error: fetchError } = await supabase
        .from("word_progress")
        .select("interval, ease_factor, review_count")
        .eq("user_id", userId)
        .eq("word_english", wordEnglish)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const newInterval = calculateNewInterval(
        currentProgress?.interval || null,
        rating
      );
      const newEaseFactor = calculateNewEaseFactor(
        currentProgress?.ease_factor || null,
        rating
      );
      const nextReviewDate = calculateNextReviewDate(newInterval);

      const { error: updateError } = await supabase
        .from("word_progress")
        .upsert(
          {
            user_id: userId,
            word_english: wordEnglish,
            status: rating >= 2 ? "learned" : "learning",
            interval: newInterval,
            ease_factor: newEaseFactor,
            review_count: (currentProgress?.review_count || 0) + 1,
            next_review_date: nextReviewDate,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,word_english", // Specify which columns determine uniqueness
          }
        )
        .select()
        .single();

      if (updateError) throw updateError;

      return { status: rating >= 2 ? "learned" : "learning" };
    } catch (error) {
      console.error("Error in processReview:", error);
      throw error;
    }
  }
}

// Helper functions for spaced repetition algorithm
function calculateNewInterval(
  currentInterval: number | null,
  rating: number
): number {
  if (!currentInterval || currentInterval < 1) {
    // First review or failed review
    return rating >= 2 ? 1 : 0;
  }

  // Success - increase interval
  if (rating >= 2) {
    return Math.round(currentInterval * (1 + (rating - 2) * 0.5));
  }

  // Failed - reset interval
  return 0;
}

function calculateNewEaseFactor(
  currentEaseFactor: number | null,
  rating: number
): number {
  const defaultEaseFactor = 2.5;
  if (!currentEaseFactor) {
    return defaultEaseFactor;
  }

  // Adjust ease factor based on rating
  const adjustment = 0.15 * (rating - 2);
  const newEaseFactor = currentEaseFactor + adjustment;

  // Keep ease factor within reasonable bounds
  return Math.max(1.3, Math.min(2.5, newEaseFactor));
}

function calculateNextReviewDate(interval: number): Date {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  return nextDate;
}
