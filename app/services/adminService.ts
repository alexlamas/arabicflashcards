import { createClient } from "@/utils/supabase/client";
import { StarterPack, StarterPackWord, StarterPackPhrase } from "./starterPackService";

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  email_confirmed: boolean;
  word_count: number;
  phrase_count: number;
  last_review_date: string | null;
}

export interface AdminWord {
  id: string;
  user_id: string;
  user_email: string;
  arabic: string;
  english: string;
  transliteration: string | null;
  type: string | null;
  created_at: string;
}

export class AdminService {
  /**
   * Get all users with their stats
   */
  static async getAllUsers(): Promise<AdminUser[]> {
    const response = await fetch("/api/admin/users");

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch users");
    }

    return response.json();
  }

  /**
   * Get all words across all users
   */
  static async getAllWords(): Promise<AdminWord[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("words")
      .select("id, user_id, arabic, english, transliteration, type, created_at")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) throw error;

    return (data || []).map(word => ({
      ...word,
      user_email: word.user_id // Placeholder, can't easily get email
    }));
  }

  /**
   * Get all starter packs (including inactive ones)
   */
  static async getAllStarterPacks(): Promise<(StarterPack & { word_count: number; phrase_count: number })[]> {
    const supabase = createClient();

    const { data: packs, error: packsError } = await supabase
      .from("starter_packs")
      .select("*")
      .order("created_at", { ascending: false });

    if (packsError) throw packsError;

    // Get word counts
    const { data: wordCounts, error: wordCountError } = await supabase
      .from("starter_pack_words")
      .select("pack_id");

    if (wordCountError) throw wordCountError;

    // Get phrase counts
    const { data: phraseCounts, error: phraseCountError } = await supabase
      .from("starter_pack_phrases")
      .select("pack_id");

    if (phraseCountError) throw phraseCountError;

    // Count per pack
    const wordCountMap = new Map<string, number>();
    const phraseCountMap = new Map<string, number>();

    for (const w of wordCounts || []) {
      wordCountMap.set(w.pack_id, (wordCountMap.get(w.pack_id) || 0) + 1);
    }
    for (const p of phraseCounts || []) {
      phraseCountMap.set(p.pack_id, (phraseCountMap.get(p.pack_id) || 0) + 1);
    }

    return (packs || []).map(pack => ({
      ...pack,
      word_count: wordCountMap.get(pack.id) || 0,
      phrase_count: phraseCountMap.get(pack.id) || 0
    }));
  }

  /**
   * Update a starter pack
   */
  static async updateStarterPack(
    packId: string,
    updates: Partial<Pick<StarterPack, "name" | "description" | "level" | "icon" | "is_active">>
  ): Promise<StarterPack> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("starter_packs")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", packId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a starter pack
   */
  static async deleteStarterPack(packId: string): Promise<void> {
    const supabase = createClient();

    // Delete words first
    await supabase
      .from("starter_pack_words")
      .delete()
      .eq("pack_id", packId);

    // Delete phrases
    await supabase
      .from("starter_pack_phrases")
      .delete()
      .eq("pack_id", packId);

    // Delete user_starter_packs references
    await supabase
      .from("user_starter_packs")
      .delete()
      .eq("pack_id", packId);

    // Delete pack
    const { error } = await supabase
      .from("starter_packs")
      .delete()
      .eq("id", packId);

    if (error) throw error;
  }

  /**
   * Get pack contents (words and phrases)
   */
  static async getPackContents(packId: string): Promise<{
    words: StarterPackWord[];
    phrases: StarterPackPhrase[];
  }> {
    const supabase = createClient();

    const { data: words, error: wordsError } = await supabase
      .from("starter_pack_words")
      .select("*")
      .eq("pack_id", packId)
      .order("order_index");

    if (wordsError) throw wordsError;

    const { data: phrases, error: phrasesError } = await supabase
      .from("starter_pack_phrases")
      .select("*")
      .eq("pack_id", packId)
      .order("order_index");

    if (phrasesError) throw phrasesError;

    return {
      words: words || [],
      phrases: phrases || []
    };
  }

  /**
   * Update a word in a starter pack
   */
  static async updateStarterPackWord(
    wordId: string,
    updates: Partial<Pick<StarterPackWord, "arabic" | "english" | "transliteration" | "type" | "notes">>
  ): Promise<StarterPackWord> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("starter_pack_words")
      .update(updates)
      .eq("id", wordId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a word from a starter pack
   */
  static async deleteStarterPackWord(wordId: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from("starter_pack_words")
      .delete()
      .eq("id", wordId);

    if (error) throw error;
  }

  /**
   * Add a word to a starter pack
   */
  static async addStarterPackWord(
    packId: string,
    word: Omit<StarterPackWord, "id" | "pack_id" | "created_at">
  ): Promise<StarterPackWord> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("starter_pack_words")
      .insert({ ...word, pack_id: packId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update a phrase in a starter pack
   */
  static async updateStarterPackPhrase(
    phraseId: string,
    updates: Partial<Pick<StarterPackPhrase, "arabic" | "english" | "transliteration" | "notes">>
  ): Promise<StarterPackPhrase> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("starter_pack_phrases")
      .update(updates)
      .eq("id", phraseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a phrase from a starter pack
   */
  static async deleteStarterPackPhrase(phraseId: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from("starter_pack_phrases")
      .delete()
      .eq("id", phraseId);

    if (error) throw error;
  }

  /**
   * Add a phrase to a starter pack
   */
  static async addStarterPackPhrase(
    packId: string,
    phrase: Omit<StarterPackPhrase, "id" | "pack_id" | "created_at">
  ): Promise<StarterPackPhrase> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("starter_pack_phrases")
      .insert({ ...phrase, pack_id: packId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create a new starter pack
   */
  static async createStarterPack(pack: {
    name: string;
    description?: string;
    language?: string;
    level?: string;
    icon?: string;
    is_active?: boolean;
  }): Promise<StarterPack> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("starter_packs")
      .insert({
        name: pack.name,
        description: pack.description || null,
        language: pack.language || "lebanese",
        level: pack.level || "beginner",
        icon: pack.icon || null,
        is_active: pack.is_active ?? true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
