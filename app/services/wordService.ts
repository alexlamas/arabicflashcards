// app/services/wordService.ts
import { createClient } from "@/utils/supabase/client";
import type { Word } from "../types/word";

export class WordService {
  static async getAllWords(): Promise<Word[]> {
    const supabase = createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Fetch user's custom words (user_id = current user)
    const { data: customWords, error: customError } = await supabase
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

    if (customError) throw customError;

    // Fetch pack words that user has progress on (via word_progress join)
    const { data: progressWords, error: progressError } = await supabase
      .from("word_progress")
      .select(
        `
        status,
        next_review_date,
        words!inner(
          id,
          english,
          arabic,
          transliteration,
          type,
          notes,
          pack_id,
          user_id,
          created_at
        )
      `
      )
      .eq("user_id", user.id)
      .not("words.pack_id", "is", null);

    if (progressError) throw progressError;

    // Transform pack words with progress
    const packWordsWithProgress = (progressWords || []).map((item) => {
      const word = item.words as unknown as Word;
      return {
        ...word,
        status: item.status || null,
        next_review_date: item.next_review_date || null,
      };
    });

    // Combine custom words and pack words
    const allWords = [
      ...(customWords || []).map((word) => ({
        ...word,
        status: word.progress?.[0]?.status || null,
        next_review_date: word.progress?.[0]?.next_review_date || null,
      })),
      ...packWordsWithProgress,
    ];

    // Sort by english
    allWords.sort((a, b) => a.english.localeCompare(b.english));

    return allWords;
  }

  static async getWordByEnglish(english: string): Promise<Word | null> {
    const supabase = createClient();
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
    const supabase = createClient();
    
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
    const supabase = createClient();
    
    // Build update payload, filtering out undefined values
    const updatePayload: Partial<Word> = {};
    
    if (word.english !== undefined) updatePayload.english = word.english;
    if (word.arabic !== undefined) updatePayload.arabic = word.arabic;
    if (word.transliteration !== undefined) updatePayload.transliteration = word.transliteration;
    if (word.type !== undefined) updatePayload.type = word.type;
    if (word.notes !== undefined) updatePayload.notes = word.notes;

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
    const supabase = createClient();
    const { error } = await supabase.from("words").delete().eq("id", id);

    if (error) throw error;
  }
}
