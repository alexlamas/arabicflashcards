import { createClient } from "@/utils/supabase/client";

export interface StarterPack {
  id: string;
  name: string;
  description: string | null;
  language: string;
  level: string | null;
  icon: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StarterPackWord {
  id: string;
  pack_id: string;
  arabic: string;
  english: string;
  transliteration: string | null;
  type: string | null;
  notes: string | null;
  example_sentences: unknown | null;
  order_index: number;
  created_at: string;
}

export interface StarterPackPhrase {
  id: string;
  pack_id: string;
  arabic: string;
  english: string;
  transliteration: string | null;
  notes: string | null;
  linked_word_indices: number[] | null;
  order_index: number;
  created_at: string;
}

export class StarterPackService {
  /**
   * Get all available starter packs
   */
  static async getAvailablePacks(): Promise<StarterPack[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("starter_packs")
      .select("*")
      .eq("is_active", true)
      .order("level", { ascending: true })
      .order("name");

    if (error) throw error;
    return data || [];
  }

  /**
   * Get a specific starter pack with its words and phrases
   */
  static async getPackContents(packId: string): Promise<{
    pack: StarterPack;
    words: StarterPackWord[];
    phrases: StarterPackPhrase[];
  }> {
    const supabase = createClient();
    // Get pack details
    const { data: pack, error: packError } = await supabase
      .from("starter_packs")
      .select("*")
      .eq("id", packId)
      .single();

    if (packError) throw packError;
    if (!pack) throw new Error("Starter pack not found");

    // Get pack words
    const { data: words, error: wordsError } = await supabase
      .from("starter_pack_words")
      .select("*")
      .eq("pack_id", packId)
      .order("order_index");

    if (wordsError) throw wordsError;

    // Get pack phrases
    const { data: phrases, error: phrasesError } = await supabase
      .from("starter_pack_phrases")
      .select("*")
      .eq("pack_id", packId)
      .order("order_index");

    if (phrasesError) throw phrasesError;

    return {
      pack,
      words: words || [],
      phrases: phrases || []
    };
  }

  /**
   * Check which packs a user has already imported
   */
  static async getUserImportedPacks(userId?: string): Promise<string[]> {
    const supabase = createClient();
    // Get current user if not provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      userId = user.id;
    }

    const { data, error } = await supabase
      .from("user_starter_packs")
      .select("pack_id")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user imported packs:", error);
      return [];
    }

    return data?.map(d => d.pack_id) || [];
  }

  /**
   * Import a starter pack for a user
   */
  static async importPack(packId: string): Promise<{
    wordsImported: number;
    phrasesImported: number;
  }> {
    const supabase = createClient();
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Check if already imported
    const importedPacks = await this.getUserImportedPacks(user.id);
    if (importedPacks.includes(packId)) {
      throw new Error("Pack already imported");
    }

    // Get pack contents
    const { words, phrases } = await this.getPackContents(packId);

    // Map to keep track of old to new word IDs for phrase linking
    const wordIdMap = new Map<number, string>();

    // Import words
    let wordsImported = 0;
    for (const packWord of words) {
      const { data: newWord, error: wordError } = await supabase
        .from("words")
        .insert([{
          user_id: user.id,
          arabic: packWord.arabic,
          english: packWord.english,
          transliteration: packWord.transliteration,
          type: packWord.type,
          notes: packWord.notes,
          example_sentences: packWord.example_sentences
        }])
        .select()
        .single();

      if (wordError) {
        console.error("Error importing word:", wordError);
        continue;
      }

      if (newWord) {
        wordIdMap.set(packWord.order_index, newWord.id);
        wordsImported++;
      }
    }

    // Import phrases
    let phrasesImported = 0;
    for (const packPhrase of phrases) {
      const { data: newPhrase, error: phraseError } = await supabase
        .from("phrases")
        .insert([{
          user_id: user.id,
          arabic: packPhrase.arabic,
          english: packPhrase.english,
          transliteration: packPhrase.transliteration,
          notes: packPhrase.notes
        }])
        .select()
        .single();

      if (phraseError) {
        console.error("Error importing phrase:", phraseError);
        continue;
      }

      if (newPhrase) {
        phrasesImported++;

        // Link to words if specified
        if (packPhrase.linked_word_indices && packPhrase.linked_word_indices.length > 0) {
          const wordLinks = packPhrase.linked_word_indices
            .map(index => wordIdMap.get(index))
            .filter(id => id !== undefined);

          if (wordLinks.length > 0) {
            const links = wordLinks.map(wordId => ({
              phrase_id: newPhrase.id,
              word_id: wordId
            }));

            await supabase
              .from("word_phrases")
              .insert(links);
          }
        }
      }
    }

    // Mark pack as imported
    await supabase
      .from("user_starter_packs")
      .insert([{
        user_id: user.id,
        pack_id: packId
      }]);

    return {
      wordsImported,
      phrasesImported
    };
  }

  /**
   * Create a new starter pack (admin only)
   */
  static async createPack(pack: Omit<StarterPack, "id" | "created_at" | "updated_at">): Promise<StarterPack> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("starter_packs")
      .insert([pack])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Add words to a starter pack (admin only)
   */
  static async addWordsToPack(
    packId: string,
    words: Omit<StarterPackWord, "id" | "pack_id" | "created_at">[]
  ): Promise<StarterPackWord[]> {
    const supabase = createClient();
    const wordsWithPackId = words.map(w => ({ ...w, pack_id: packId }));
    
    const { data, error } = await supabase
      .from("starter_pack_words")
      .insert(wordsWithPackId)
      .select();

    if (error) throw error;
    return data || [];
  }

  /**
   * Add phrases to a starter pack (admin only)
   */
  static async addPhrasesToPack(
    packId: string,
    phrases: Omit<StarterPackPhrase, "id" | "pack_id" | "created_at">[]
  ): Promise<StarterPackPhrase[]> {
    const supabase = createClient();
    const phrasesWithPackId = phrases.map(p => ({ ...p, pack_id: packId }));
    
    const { data, error } = await supabase
      .from("starter_pack_phrases")
      .insert(phrasesWithPackId)
      .select();

    if (error) throw error;
    return data || [];
  }
}