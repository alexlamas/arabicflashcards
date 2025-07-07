import { supabase } from "../supabase";
import { calculateSuccessRate } from "../utils/memoryStability";

export class SpacedRepetitionService {
  private static calculateNextReview(
    currentInterval: number,
    currentEaseFactor: number,
    rating: number,
    reviewCount: number
  ): { interval: number; easeFactor: number; nextReviewDate: Date } {
    let interval: number;
    let easeFactor = currentEaseFactor;
    const MIN_INTERVAL = {
      AGAIN: 0.25, // 6 hours
      HARD: 0.5, // 12 hours
      GOOD: 1, // 1 day
      EASY: 4, // 4 days
    };

    // Update ease factor based on performance (SuperMemo algorithm)
    if (rating < 2) {
      // Failed review - decrease ease factor
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      interval =
        rating === 0
          ? MIN_INTERVAL.AGAIN
          : Math.max(MIN_INTERVAL.HARD, currentInterval * 0.5);
    } else {
      // Successful review - adjust ease factor
      const easeChange = rating === 3 ? 0.15 : 0; // Increase for "Easy", maintain for "Good"
      easeFactor = Math.min(2.5, Math.max(1.3, easeFactor + easeChange));

      if (reviewCount === 0) {
        interval = rating === 3 ? MIN_INTERVAL.EASY : MIN_INTERVAL.GOOD;
      } else if (reviewCount === 1) {
        interval = rating === 3 ? 8 : 6;
      } else {
        interval = Math.round(
          currentInterval * easeFactor * (rating === 3 ? 1.3 : 1)
        );
      }
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
          success_rate: 0,
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

  private static calculateInitialSuccessRate(
    easeFactor: number,
    reviewCount: number,
    currentSuccessRate?: number
  ): number {
    // If we already have a success rate tracked, use it
    if (currentSuccessRate !== undefined && currentSuccessRate !== null) {
      return currentSuccessRate;
    }
    
    // For new words or missing data, start at 0
    if (reviewCount === 0) return 0;

    // Legacy fallback: estimate based on ease factor if no success rate exists
    // This is only for backward compatibility with existing data
    const rate = Math.min(Math.max((easeFactor - 1.3) / 1.2, 0), 1);
    return Math.round(rate * 100) / 100;
  }

  static async getProgressForWords(userId: string, wordIds: string[]) {
    const { data, error } = await supabase
      .from("word_progress")
      .select(
        `
        word_english,
        status,
        next_review_date,
        ease_factor,
        interval,
        review_count,
        success_rate
      `
      )
      .eq("user_id", userId)
      .in("word_english", wordIds);

    if (error) throw error;

    // Calculate success rates for words that don't have one
    const progressWithRates = data?.map((progress) => {
      if (
        progress.success_rate === null ||
        progress.success_rate === undefined
      ) {
        return {
          ...progress,
          success_rate: this.calculateInitialSuccessRate(
            progress.ease_factor,
            progress.review_count,
            progress.success_rate
          ),
        };
      }
      return progress;
    });

    // Update any words that didn't have a success rate
    const updates = progressWithRates
      ?.filter(
        (p) =>
          p.success_rate !==
          data.find((d) => d.word_english === p.word_english)?.success_rate
      )
      .map((p) => ({
        user_id: userId,
        word_english: p.word_english,
        success_rate: p.success_rate,
      }));

    if (updates && updates.length > 0) {
      console.log("Updating success rates for", updates.length, "words");
      const { error: updateError } = await supabase
        .from("word_progress")
        .upsert(updates, {
          onConflict: "user_id,word_english",
        });
      if (updateError)
        console.error("Error updating success rates:", updateError);
    }

    return progressWithRates || [];
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
    // Validate inputs
    if (!userId || !wordEnglish) {
      throw new Error("Missing required parameters: userId and wordEnglish");
    }
    if (rating < 0 || rating > 3) {
      throw new Error("Rating must be between 0 and 3");
    }
    try {
      console.log("Fetching current progress for:", wordEnglish);
      const { data: currentProgress, error: fetchError } = await supabase
        .from("word_progress")
        .select("interval, ease_factor, review_count, success_rate")
        .eq("user_id", userId)
        .eq("word_english", wordEnglish)
        .maybeSingle();

      console.log("Current progress:", currentProgress);

      if (fetchError) throw fetchError;

      // Calculate new success rate based on actual performance
      const isSuccess = rating >= 2;
      const currentReviewCount = currentProgress?.review_count || 0;
      const newSuccessRate = calculateSuccessRate(
        currentProgress?.success_rate,
        currentReviewCount,
        isSuccess
      );

      const { interval, easeFactor, nextReviewDate } = this.calculateNextReview(
        currentProgress?.interval || 0,
        currentProgress?.ease_factor || 2.5,
        rating,
        currentProgress?.review_count || 0
      );

      const updateData = {
        user_id: userId,
        word_english: wordEnglish,
        status: rating >= 2 ? "learned" : "learning",
        interval: interval,
        ease_factor: easeFactor,
        review_count: currentReviewCount + 1,
        success_rate: newSuccessRate,
        next_review_date: nextReviewDate.toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log("Updating progress with:", updateData);

      const { error: updateError } = await supabase
        .from("word_progress")
        .upsert(updateData, {
          onConflict: "user_id,word_english",
        });

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
