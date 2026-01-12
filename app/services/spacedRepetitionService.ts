import { createClient } from "@/utils/supabase/client";
import { getOnlineStatus } from "../utils/connectivity";
import { OfflineStorage } from "./offlineStorage";
import { calculateDueWords, countDueWords } from "../utils/dueWordsCalculator";
import type { Word } from "../types/word";

export class SpacedRepetitionService {
  static async startLearning(userId: string, wordId: string) {
    const supabase = createClient();
    try {
      const now = new Date().toISOString();

      // Insert/Update into word_progress table
      const { error } = await supabase.from("word_progress").upsert(
        {
          user_id: userId,
          word_id: wordId,
          status: "learning",
          interval: 0,
          ease_factor: 2.5,
          review_count: 0,
          next_review_date: now,
          updated_at: now,
        },
        {
          onConflict: "user_id,word_id",
        }
      );

      if (error) throw error;
      const count = await this.getDueWordsCount(userId);
      return {
        success: true,
        count,
      };
    } catch (error) {
      throw error;
    }
  }

  static async getDueWords(userId: string, limit: number = 20) {
    // If offline, use cached words
    if (!getOnlineStatus()) {
      const cachedWords = OfflineStorage.getWords();
      const dueWords = calculateDueWords(cachedWords, limit);
      return dueWords;
    }

    const supabase = createClient();
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("word_progress")
        .select(`
          word_id,
          next_review_date,
          words!inner (
            id,
            english,
            arabic,
            transliteration,
            type,
            notes,
            pack_id
          )
        `)
        .eq("user_id", userId)
        .in("status", ["learning", "learned"])
        .lte("next_review_date", now)
        .order("next_review_date")
        .limit(limit);

      if (error) throw error;

      if (!data?.length) return [];

      // Flatten the response
      return data.map((item) => {
        const word = item.words as unknown as Word;
        return {
          ...word,
          word_id: item.word_id,
        };
      });
    } catch {
      // Fallback to offline data on error
      const cachedWords = OfflineStorage.getWords();
      const dueWords = calculateDueWords(cachedWords, limit);
      return dueWords;
    }
  }

  static async getDueWordsCount(userId: string): Promise<number> {
    // If offline, use cached words
    if (!getOnlineStatus()) {
      const cachedWords = OfflineStorage.getWords();
      return countDueWords(cachedWords);
    }

    const supabase = createClient();
    try {
      const now = new Date().toISOString();

      const { count, error } = await supabase
        .from("word_progress")
        .select("word_id", { count: "exact", head: true })
        .eq("user_id", userId)
        .in("status", ["learning", "learned"])
        .lte("next_review_date", now);

      if (error) throw error;
      return count || 0;
    } catch {
      // Fallback to offline data on error
      const cachedWords = OfflineStorage.getWords();
      return countDueWords(cachedWords);
    }
  }

  static async processReview(
    userId: string,
    wordId: string,
    rating: number
  ) {
    const supabase = createClient();
    try {
      const { data: currentProgress, error: fetchError } = await supabase
        .from("word_progress")
        .select("interval, ease_factor, review_count")
        .eq("user_id", userId)
        .eq("word_id", wordId)
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
            word_id: wordId,
            status: rating >= 2 ? "learned" : "learning",
            interval: interval,
            ease_factor: easeFactor,
            review_count: (currentProgress?.review_count || 0) + 1,
            next_review_date: nextReviewDate.toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,word_id",
          }
        );

      if (updateError) throw updateError;

      return {
        status: rating >= 2 ? "learned" : "learning",
        nextReview: nextReviewDate,
      };
    } catch (error) {
      throw error;
    }
  }

  static async getStreak(userId: string): Promise<number> {
    const supabase = createClient();

    try {
      // Get all review dates for the user, grouped by day
      const { data, error } = await supabase
        .from("word_progress")
        .select("updated_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      if (!data?.length) return 0;

      // Get unique days (in user's local timezone approximation using UTC dates)
      const reviewDays = new Set<string>();
      data.forEach(row => {
        const date = new Date(row.updated_at);
        const dayKey = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
        reviewDays.add(dayKey);
      });

      // Convert to sorted array of dates
      const sortedDays = Array.from(reviewDays)
        .map(key => {
          const [year, month, day] = key.split("-").map(Number);
          return new Date(Date.UTC(year, month, day));
        })
        .sort((a, b) => b.getTime() - a.getTime());

      // Count consecutive days starting from today or yesterday
      const today = new Date();
      const todayKey = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
      const yesterdayKey = todayKey - 24 * 60 * 60 * 1000;

      let streak = 0;
      let expectedDay = sortedDays[0]?.getTime();

      // Start counting only if most recent review is today or yesterday
      if (expectedDay !== todayKey && expectedDay !== yesterdayKey) {
        return 0;
      }

      for (const day of sortedDays) {
        if (day.getTime() === expectedDay) {
          streak++;
          expectedDay -= 24 * 60 * 60 * 1000; // Previous day
        } else if (day.getTime() < expectedDay) {
          // Gap in streak
          break;
        }
      }

      return streak;
    } catch {
      return 0;
    }
  }

  static async getWeeklyReviewStats(userId: string): Promise<{ thisWeek: number; lastWeek: number }> {
    const supabase = createClient();
    const now = new Date();

    // Get start of current calendar week (Monday at 00:00 UTC)
    const startOfThisWeek = new Date(now);
    const dayOfWeek = now.getUTCDay();
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 6 days ago, Monday = 0
    startOfThisWeek.setUTCDate(now.getUTCDate() - daysSinceMonday);
    startOfThisWeek.setUTCHours(0, 0, 0, 0);

    // Get start of last week (Monday at 00:00 UTC)
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setUTCDate(startOfLastWeek.getUTCDate() - 7);

    // Calculate equivalent point in last week (same elapsed time since Monday)
    const elapsedThisWeek = now.getTime() - startOfThisWeek.getTime();
    const equivalentPointLastWeek = new Date(startOfLastWeek.getTime() + elapsedThisWeek);

    try {
      // Get reviews from this week (Monday to now)
      const { count: thisWeekCount, error: thisWeekError } = await supabase
        .from("word_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("updated_at", startOfThisWeek.toISOString());

      if (thisWeekError) throw thisWeekError;

      // Get reviews from same period last week (last Monday to equivalent point)
      const { count: lastWeekCount, error: lastWeekError } = await supabase
        .from("word_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("updated_at", startOfLastWeek.toISOString())
        .lt("updated_at", equivalentPointLastWeek.toISOString());

      if (lastWeekError) throw lastWeekError;

      return {
        thisWeek: thisWeekCount || 0,
        lastWeek: lastWeekCount || 0,
      };
    } catch {
      return { thisWeek: 0, lastWeek: 0 };
    }
  }
}

export function calculateNextReview(
  currentInterval: number,
  currentEaseFactor: number,
  rating: number,
  reviewCount: number
): { interval: number; easeFactor: number; nextReviewDate: Date } {
  let interval: number;
  let easeFactor = currentEaseFactor;

  // Adjust ease factor based on rating
  // Rating 0 (Forgot): decrease EF significantly - card is hard
  // Rating 1 (Struggled): decrease EF slightly - card is challenging
  // Rating 2 (Remembered): keep EF the same - card is at right difficulty
  // Rating 3 (Easy): increase EF - card is easy, can wait longer
  if (rating === 0) {
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else if (rating === 1) {
    easeFactor = Math.max(1.3, easeFactor - 0.15);
  } else if (rating === 3) {
    easeFactor = easeFactor + 0.15;
  }
  // Rating 2: ease factor stays the same

  // Calculate next interval
  if (rating < 2) {
    // Failed review - reset to short interval
    if (rating === 0) {
      // "Forgot" - see again in 10 minutes
      interval = 1 / 144; // ~10 minutes (0.007 days)
    } else {
      // "Struggled" - see again in 1 hour minimum
      interval = Math.max(1 / 24, currentInterval * 0.25); // At least 1 hour
    }
  } else {
    // Successful review - use SM-2 intervals
    if (reviewCount === 0 || currentInterval < 1) {
      // First success OR recovering from a fail: 1 day
      interval = 1;
    } else if (reviewCount === 1 || currentInterval < 6) {
      // Second success: 6 days (SM-2 standard)
      interval = 6;
    } else {
      // Subsequent: multiply by ease factor
      interval = Math.round(currentInterval * easeFactor);
      // Ensure minimum progression (at least 20% increase)
      interval = Math.max(interval, Math.round(currentInterval * 1.2));
    }

    // Bonus for "Easy" - 1.3x the calculated interval
    if (rating === 3) {
      interval = Math.round(interval * 1.3);
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
