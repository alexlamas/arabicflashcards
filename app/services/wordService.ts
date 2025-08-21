// app/services/wordService.ts
import { createClient } from "@/utils/supabase/client";
import type { Word } from "../types/word";

export class WordService {
  static async getAllWords(): Promise<Word[]> {
    const supabase = createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("words")
      .select(
        `
        *,
        progress:word_progress(
          status,
          next_review_date
        )
      `
      )
      .eq("user_id", user.id)
      .order("english");

    if (error) throw error;
    return data.map((word) => ({
      ...word,
      status: word.progress?.[0]?.status || null,
      next_review_date: word.progress?.[0]?.next_review_date || null,
    }));
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
    word: Omit<Word, "id" | "created_at" | "updated_at" | "user_id">
  ): Promise<Word> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("words")
      .insert([{ ...word, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateWord(id: string, word: Partial<Word>): Promise<Word> {
    // Build update payload, filtering out undefined values
    const updatePayload: Partial<Word> = {};
    
    if (word.english !== undefined) updatePayload.english = word.english;
    if (word.arabic !== undefined) updatePayload.arabic = word.arabic;
    if (word.transliteration !== undefined) updatePayload.transliteration = word.transliteration;
    if (word.type !== undefined) updatePayload.type = word.type;
    if (word.notes !== undefined) updatePayload.notes = word.notes;
    if (word.example_sentences !== undefined) updatePayload.example_sentences = word.example_sentences;

    // If there's nothing to update, just fetch the current word
    if (Object.keys(updatePayload).length === 0) {
      const { data: currentWord, error: fetchError } = await supabase
        .from("words")
        .select(
          `
          *,
          progress:word_progress(
            status,
            next_review_date
          )
        `
        )
        .eq("id", id)
        .single();
      
      if (fetchError) {
        throw fetchError;
      }
      
      if (!currentWord) {
        throw new Error(`Word with id ${id} not found`);
      }
      
      return {
        ...currentWord,
        status: currentWord.progress?.[0]?.status || null,
        next_review_date: currentWord.progress?.[0]?.next_review_date || null,
      };
    }

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
      );

    if (error) {
      throw error;
    }

    // Handle the case where no rows were updated (word doesn't exist)
    if (!data || data.length === 0) {
      throw new Error(`Word with id ${id} not found`);
    }

    const updatedWord = data[0];
    return {
      ...updatedWord,
      status: updatedWord.progress?.[0]?.status || null,
      next_review_date: updatedWord.progress?.[0]?.next_review_date || null,
    };
  }

  static async deleteWord(id: string): Promise<void> {
    const { error } = await supabase.from("words").delete().eq("id", id);

    if (error) throw error;
  }
}
