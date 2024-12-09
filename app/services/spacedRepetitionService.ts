import { supabase } from "../supabase";

export class SpacedRepetitionService {
  static async startLearning(userId: string, wordEnglish: string) {
    try {
      const now = new Date().toISOString();

      // Insert/Update into word_progress table
      const { error } = await supabase.from("word_progress").upsert(
        {
          user_id: userId,
          word_english: wordEnglish,
          status: "learning",
          interval: 0,
          ease_factor: 2.5,
          review_count: 0,
          next_review_date: now,
          updated_at: now,
        },
        {
          onConflict: "user_id,word_english",
        }
      );

      console.log("Word progress updated:"); // Debug log

      if (error) throw error;
      const count = await this.getDueWordsCount(userId);
      console.log("Count:", count); // Debug log
      return {
        success: true,
        count,
      };
    } catch (error) {
      console.error("Error starting learning:", error);
      throw error;
    }
  }

  static async getDueWords(userId: string, limit: number = 20) {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("word_progress")
        .select("word_english, next_review_date")
        .eq("user_id", userId)
        .lte("next_review_date", now)
        .order("next_review_date")
        .limit(limit);

      if (error) throw error;

      if (!data?.length) return [];

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
          word_english: word.english,
        })) || []
      );
    } catch (error) {
      console.error("Error in getDueWords:", error);
      throw error;
    }
  }
  static async getDueWordsCount(userId: string): Promise<number> {
    try {
      const now = new Date().toISOString();

      const { count, error } = await supabase
        .from("word_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .lte("next_review_date", now);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error("Error getting due words count:", error);
      throw error;
    }
  }
  static async processReview(
    userId: string,
    wordEnglish: string,
    rating: number
  ) {
    try {
      const { data: currentProgress, error: fetchError } = await supabase
        .from("word_progress")
        .select("interval, ease_factor, review_count")
        .eq("user_id", userId)
        .eq("word_english", wordEnglish)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const { interval, easeFactor, nextReviewDate } = calculateNextReview(
        currentProgress?.interval || 0,
        currentProgress?.ease_factor || 2.5,
        rating,
        currentProgress?.review_count || 0
      );

      const { error: updateError } = await supabase
        .from("word_progress")
        .upsert(
          {
            user_id: userId,
            word_english: wordEnglish,
            status: rating >= 2 ? "learned" : "learning",
            interval: interval,
            ease_factor: easeFactor,
            review_count: (currentProgress?.review_count || 0) + 1,
            next_review_date: nextReviewDate.toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,word_english",
          }
        );

      if (updateError) throw updateError;

      return {
        status: rating >= 2 ? "learned" : "learning",
        nextReview: nextReviewDate,
      };
    } catch (error) {
      console.error("Error in processReview:", error);
      throw error;
    }
  }
}

function calculateNextReview(
  currentInterval: number,
  currentEaseFactor: number,
  rating: number,
  reviewCount: number
): { interval: number; easeFactor: number; nextReviewDate: Date } {
  let interval: number;
  let easeFactor = currentEaseFactor;

  // Update ease factor if it was a successful review
  if (rating >= 2) {
    const qualityFactor = rating - 2; // Convert 2,3 to 0,1 for ease calculation
    easeFactor = Math.max(
      1.3,
      currentEaseFactor + (0.1 - qualityFactor * (0.08 + qualityFactor * 0.02))
    );
  }

  // Calculate next interval
  if (rating < 2) {
    // Failed review
    if (rating === 0) {
      // "Again"
      interval = 0.25; // 6 hours
    } else {
      // "Hard"
      interval = Math.max(0.5, currentInterval * 0.5); // At least 12 hours
    }
  } else {
    // Successful review - use SuperMemo algorithm
    if (reviewCount === 0) {
      interval = 1; // First success: 1 day
    } else if (reviewCount === 1) {
      interval = 6; // Second success: 6 days
    } else {
      interval = Math.round(currentInterval * easeFactor);
    }
  }

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setTime(
    nextReviewDate.getTime() + interval * 24 * 60 * 60 * 1000
  );

  return {
    interval,
    easeFactor,
    nextReviewDate,
  };
}
