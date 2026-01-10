import { createClient } from "@/utils/supabase/client";
import { Sentence, SentenceInput } from "../types/word";

export class SentenceService {
  /**
   * Get all sentences linked to a word
   */
  static async getSentencesForWord(wordId: string): Promise<Sentence[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("word_sentences")
      .select(`
        sentence:sentences(*)
      `)
      .eq("word_id", wordId);

    if (error) {
      return [];
    }

    return (data || [])
      .map((row) => row.sentence as unknown as Sentence)
      .filter(Boolean);
  }

  /**
   * Get all words linked to a sentence
   */
  static async getWordsForSentence(sentenceId: string): Promise<string[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("word_sentences")
      .select("word_id")
      .eq("sentence_id", sentenceId);

    if (error) {
      return [];
    }

    return (data || []).map((row) => row.word_id);
  }

  /**
   * Create a new sentence and link it to a word
   */
  static async createSentence(
    sentence: SentenceInput,
    wordId: string,
    userId?: string
  ): Promise<Sentence | null> {
    const supabase = createClient();

    // Get user if not provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    }

    // Insert sentence
    const { data: sentenceData, error: sentenceError } = await supabase
      .from("sentences")
      .insert({
        arabic: sentence.arabic || "",
        transliteration: sentence.transliteration,
        english: sentence.english,
        user_id: userId,
      })
      .select()
      .single();

    if (sentenceError) {
      return null;
    }

    // Link to word
    const { error: linkError } = await supabase
      .from("word_sentences")
      .insert({
        word_id: wordId,
        sentence_id: sentenceData.id,
      });

    if (linkError) {
      // Delete the orphaned sentence
      await supabase.from("sentences").delete().eq("id", sentenceData.id);
      return null;
    }

    return sentenceData;
  }

  /**
   * Update a sentence
   */
  static async updateSentence(
    sentenceId: string,
    updates: Partial<SentenceInput>
  ): Promise<Sentence | null> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("sentences")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sentenceId)
      .select()
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  /**
   * Delete a sentence (also removes links)
   */
  static async deleteSentence(sentenceId: string): Promise<boolean> {
    const supabase = createClient();

    // Links will be deleted automatically via CASCADE
    const { error } = await supabase
      .from("sentences")
      .delete()
      .eq("id", sentenceId);

    if (error) {
      return false;
    }

    return true;
  }

  /**
   * Link an existing sentence to a word
   */
  static async linkSentenceToWord(
    sentenceId: string,
    wordId: string
  ): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
      .from("word_sentences")
      .insert({
        word_id: wordId,
        sentence_id: sentenceId,
      });

    if (error) {
      return false;
    }

    return true;
  }

  /**
   * Unlink a sentence from a word
   */
  static async unlinkSentenceFromWord(
    sentenceId: string,
    wordId: string
  ): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
      .from("word_sentences")
      .delete()
      .eq("word_id", wordId)
      .eq("sentence_id", sentenceId);

    if (error) {
      return false;
    }

    return true;
  }
}
