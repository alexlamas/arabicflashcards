// app/services/spacedRepetitionService.ts
import { supabase } from "../supabase";

export class SpacedRepetitionService {
  static async getDueWords(userId: string, limit: number = 20) {
    console.log("Fetching due words for user:", userId);

    try {
      // First get learning words for this user
      const { data, error } = await supabase
        .from("word_progress")
        .select(
          `
          word_english,
          words:words (
            english,
            arabic,
            transliteration,
            type
          )
        `
        )
        .eq("user_id", userId)
        .eq("status", "learning")
        .limit(limit);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      // Transform the data to match the Word type
      const words =
        data?.map((item) => ({
          ...item.words,
        })) || [];

      console.log("Found words:", words);
      return words;
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
      // Simplified logic - just update the status based on rating
      const newStatus = rating >= 2 ? "learned" : "learning";

      const { error } = await supabase.from("word_progress").upsert(
        {
          user_id: userId,
          word_english: wordEnglish,
          status: newStatus,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,word_english",
        }
      );

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      return { status: newStatus };
    } catch (error) {
      console.error("Error in processReview:", error);
      throw error;
    }
  }
}
