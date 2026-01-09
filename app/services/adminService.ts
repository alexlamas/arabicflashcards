import { createClient } from "@/utils/supabase/client";
import { Pack, PackWord } from "./packService";

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  email_confirmed: boolean;
  word_count: number;
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
      .not("user_id", "is", null) // Only custom words, not pack words
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) throw error;

    return (data || []).map(word => ({
      ...word,
      user_email: word.user_id // Placeholder, can't easily get email
    }));
  }

  /**
   * Get all packs (including inactive ones)
   */
  static async getAllStarterPacks(): Promise<(Pack & { word_count: number })[]> {
    const supabase = createClient();

    const { data: packs, error: packsError } = await supabase
      .from("packs")
      .select("*")
      .order("created_at", { ascending: false });

    if (packsError) throw packsError;

    // Get word counts per pack
    const { data: wordCounts, error: wordCountError } = await supabase
      .from("words")
      .select("pack_id")
      .not("pack_id", "is", null);

    if (wordCountError) throw wordCountError;

    // Count per pack
    const wordCountMap = new Map<string, number>();
    for (const w of wordCounts || []) {
      if (w.pack_id) {
        wordCountMap.set(w.pack_id, (wordCountMap.get(w.pack_id) || 0) + 1);
      }
    }

    return (packs || []).map(pack => ({
      ...pack,
      word_count: wordCountMap.get(pack.id) || 0
    }));
  }

  /**
   * Update a pack
   */
  static async updateStarterPack(
    packId: string,
    updates: Partial<Pick<Pack, "name" | "description" | "level" | "icon" | "is_active">>
  ): Promise<Pack> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("packs")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", packId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a pack
   */
  static async deleteStarterPack(packId: string): Promise<void> {
    const supabase = createClient();

    // Get word IDs for this pack
    const { data: packWords } = await supabase
      .from("words")
      .select("id")
      .eq("pack_id", packId);

    const wordIds = (packWords || []).map(w => w.id);

    // Delete word progress for pack words
    if (wordIds.length > 0) {
      await supabase
        .from("word_progress")
        .delete()
        .in("word_id", wordIds);
    }

    // Delete pack words
    await supabase
      .from("words")
      .delete()
      .eq("pack_id", packId);

    // Delete pack
    const { error } = await supabase
      .from("packs")
      .delete()
      .eq("id", packId);

    if (error) throw error;
  }

  /**
   * Get pack contents (words)
   */
  static async getPackContents(packId: string): Promise<{
    words: PackWord[];
  }> {
    const supabase = createClient();

    const { data: words, error: wordsError } = await supabase
      .from("words")
      .select("*")
      .eq("pack_id", packId)
      .order("english");

    if (wordsError) throw wordsError;

    return {
      words: words || []
    };
  }

  /**
   * Update a pack word
   */
  static async updateStarterPackWord(
    wordId: string,
    updates: Partial<Pick<PackWord, "arabic" | "english" | "transliteration" | "type" | "notes">>
  ): Promise<PackWord> {
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
   * Delete a pack word
   */
  static async deleteStarterPackWord(wordId: string): Promise<void> {
    const supabase = createClient();

    // Delete word progress
    await supabase
      .from("word_progress")
      .delete()
      .eq("word_id", wordId);

    // Delete word
    const { error } = await supabase
      .from("words")
      .delete()
      .eq("id", wordId);

    if (error) throw error;
  }

  /**
   * Add a word to a pack
   */
  static async addStarterPackWord(
    packId: string,
    word: Omit<PackWord, "id" | "pack_id" | "created_at">
  ): Promise<PackWord> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("words")
      .insert({
        ...word,
        pack_id: packId,
        user_id: null
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create a new pack
   */
  static async createStarterPack(pack: {
    name: string;
    description?: string;
    language?: string;
    level?: string;
    icon?: string;
    is_active?: boolean;
  }): Promise<Pack> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("packs")
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
