// app/services/contentReviewService.ts
import { createClient } from "@/utils/supabase/client";
import type { Word, Sentence } from "../types/word";
import type { Pack } from "./packService";

export interface PackWithReviewStats extends Pack {
  totalWords: number;
  reviewedWords: number;
}

export interface WordWithSentences extends Word {
  sentences: Sentence[];
}

export interface ReviewStats {
  totalWords: number;
  reviewedWords: number;
  totalSentences: number;
  reviewedSentences: number;
}

export class ContentReviewService {
  /**
   * Get words for a pack with their sentences
   * @param filter - "unreviewed" | "reviewed" | "all"
   */
  static async getWords(
    packId: string,
    filter: "unreviewed" | "reviewed" | "all" = "unreviewed"
  ): Promise<WordWithSentences[]> {
    const supabase = createClient();

    // Build query based on filter
    let query = supabase.from("words").select("*").eq("pack_id", packId);

    if (filter === "unreviewed") {
      query = query.is("reviewed_at", null);
    } else if (filter === "reviewed") {
      query = query.not("reviewed_at", "is", null);
    }

    const { data: words, error: wordsError } = await query.order("english");

    if (wordsError) throw wordsError;
    if (!words || words.length === 0) return [];

    // Get sentences for these words via word_sentences join
    const wordIds = words.map((w) => w.id);
    const { data: wordSentences, error: sentencesError } = await supabase
      .from("word_sentences")
      .select(
        `
        word_id,
        sentences(*)
      `
      )
      .in("word_id", wordIds);

    if (sentencesError) throw sentencesError;

    // Map sentences to words
    const sentencesByWordId: Record<string, Sentence[]> = {};
    (wordSentences || []).forEach((ws) => {
      const sentence = ws.sentences as unknown as Sentence;
      if (!sentencesByWordId[ws.word_id]) {
        sentencesByWordId[ws.word_id] = [];
      }
      sentencesByWordId[ws.word_id].push(sentence);
    });

    return words.map((word) => ({
      ...word,
      sentences: sentencesByWordId[word.id] || [],
    }));
  }

  /**
   * Get all words for a pack (for showing total count)
   */
  static async getPackWordCount(packId: string): Promise<{ total: number; reviewed: number }> {
    const supabase = createClient();

    const { count: total, error: totalError } = await supabase
      .from("words")
      .select("*", { count: "exact", head: true })
      .eq("pack_id", packId);

    if (totalError) throw totalError;

    const { count: reviewed, error: reviewedError } = await supabase
      .from("words")
      .select("*", { count: "exact", head: true })
      .eq("pack_id", packId)
      .not("reviewed_at", "is", null);

    if (reviewedError) throw reviewedError;

    return { total: total || 0, reviewed: reviewed || 0 };
  }

  /**
   * Unapprove a word (clear reviewed status)
   */
  static async unapproveWord(wordId: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from("words")
      .update({
        reviewed_at: null,
        reviewed_by: null,
      })
      .eq("id", wordId);

    if (error) throw error;
  }

  /**
   * Approve a word (mark as reviewed)
   */
  static async approveWord(wordId: string): Promise<void> {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("words")
      .update({
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq("id", wordId);

    if (error) throw error;
  }

  /**
   * Update word fields
   */
  static async updateWord(
    wordId: string,
    updates: Partial<Pick<Word, "arabic" | "english" | "transliteration" | "type" | "notes">>
  ): Promise<Word> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("words")
      .update(updates)
      .eq("id", wordId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update and approve word in one operation
   */
  static async updateAndApproveWord(
    wordId: string,
    updates: Partial<Pick<Word, "arabic" | "english" | "transliteration" | "type" | "notes">>
  ): Promise<Word> {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("words")
      .update({
        ...updates,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq("id", wordId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Approve a sentence (mark as reviewed)
   */
  static async approveSentence(sentenceId: string): Promise<void> {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("sentences")
      .update({
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq("id", sentenceId);

    if (error) throw error;
  }

  /**
   * Update sentence fields
   */
  static async updateSentence(
    sentenceId: string,
    updates: Partial<Pick<Sentence, "arabic" | "english" | "transliteration">>
  ): Promise<Sentence> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("sentences")
      .update(updates)
      .eq("id", sentenceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update and approve sentence in one operation
   */
  static async updateAndApproveSentence(
    sentenceId: string,
    updates: Partial<Pick<Sentence, "arabic" | "english" | "transliteration">>
  ): Promise<Sentence> {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("sentences")
      .update({
        ...updates,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq("id", sentenceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get review stats for a pack
   */
  static async getReviewStats(packId: string): Promise<ReviewStats> {
    const supabase = createClient();

    // Word counts
    const { count: totalWords } = await supabase
      .from("words")
      .select("*", { count: "exact", head: true })
      .eq("pack_id", packId);

    const { count: reviewedWords } = await supabase
      .from("words")
      .select("*", { count: "exact", head: true })
      .eq("pack_id", packId)
      .not("reviewed_at", "is", null);

    // Sentence counts for this pack
    const { count: totalSentences } = await supabase
      .from("sentences")
      .select("*", { count: "exact", head: true })
      .eq("pack_id", packId);

    const { count: reviewedSentences } = await supabase
      .from("sentences")
      .select("*", { count: "exact", head: true })
      .eq("pack_id", packId)
      .not("reviewed_at", "is", null);

    return {
      totalWords: totalWords || 0,
      reviewedWords: reviewedWords || 0,
      totalSentences: totalSentences || 0,
      reviewedSentences: reviewedSentences || 0,
    };
  }
}
