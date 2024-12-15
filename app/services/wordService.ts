// app/services/wordService.ts
import { supabase } from "../supabase";
import type { Word } from "../types/word";

export class WordService {
  static async getAllWords(): Promise<Word[]> {
    const { data, error } = await supabase
      .from("words")
      .select("*")
      .order("english");

    if (error) throw error;
    return data;
  }

  static async getWordByEnglish(english: string): Promise<Word | null> {
    const { data, error } = await supabase
      .from("words")
      .select("*")
      .eq("english", english)
      .single();

    if (error) throw error;
    return data;
  }

  static async createWord(
    word: Omit<Word, "id" | "created_at" | "updated_at">
  ): Promise<Word> {
    const { data, error } = await supabase
      .from("words")
      .insert([word])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateWord(id: string, word: Partial<Word>): Promise<Word> {
    const updatePayload = {
      english: word.english,
      arabic: word.arabic,
      transliteration: word.transliteration,
      type: word.type,
    };

    console.log("Update payload:", updatePayload);

    const { data, error } = await supabase
      .from("words")
      .update(updatePayload)
      .eq("id", id)
      .select(
        `
        *,
        progress:word_progress(
          status,
          next_review_date
        )
      `
      )
      .single();

    if (error) {
      console.error("Error updating word:", error);
      throw error;
    }

    return {
      ...data,
      status: data.progress?.[0]?.status || null,
      next_review_date: data.progress?.[0]?.next_review_date || null,
    };
  }

  static async deleteWord(id: string): Promise<void> {
    const { error } = await supabase.from("words").delete().eq("id", id);

    if (error) throw error;
  }
}
