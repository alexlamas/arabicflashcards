import { createClient } from "@/utils/supabase/client";

// Review status type (kept for backwards compatibility, not currently used in schema)
export type ReviewStatus = 'needs_review' | 'approved';

/**
 * Convert a pack name to a URL-friendly slug
 */
export function slugifyPackName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export interface Pack {
  id: string;
  name: string;
  description: string | null;
  language: string;
  level: string | null;
  icon: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PackWord {
  id: string;
  pack_id: string;
  arabic: string;
  english: string;
  transliteration: string | null;
  type: string | null;
  notes: string | null;
  created_at: string;
}

export class PackService {
  /**
   * Get all available packs
   */
  static async getAvailablePacks(): Promise<Pack[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("packs")
      .select("*")
      .eq("is_active", true)
      .order("level", { ascending: true })
      .order("name");

    if (error) throw error;
    return data || [];
  }

  /**
   * Get word counts for all packs
   */
  static async getPackWordCounts(): Promise<Record<string, number>> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("words")
      .select("pack_id")
      .not("pack_id", "is", null);

    if (error) throw error;

    const counts: Record<string, number> = {};
    (data || []).forEach(row => {
      if (row.pack_id) {
        counts[row.pack_id] = (counts[row.pack_id] || 0) + 1;
      }
    });

    return counts;
  }

  /**
   * Get a specific pack with its words
   */
  static async getPackContents(packId: string): Promise<{
    pack: Pack;
    words: PackWord[];
  }> {
    const supabase = createClient();

    // Get pack details
    const { data: pack, error: packError } = await supabase
      .from("packs")
      .select("*")
      .eq("id", packId)
      .single();

    if (packError) throw packError;
    if (!pack) throw new Error("Pack not found");

    // Get pack words (includes type='phrase')
    const { data: words, error: wordsError } = await supabase
      .from("words")
      .select("*")
      .eq("pack_id", packId)
      .order("english");

    if (wordsError) throw wordsError;

    return {
      pack,
      words: words || []
    };
  }

  /**
   * Get a pack by its URL slug
   */
  static async getPackBySlug(slug: string): Promise<{
    pack: Pack;
    words: PackWord[];
  } | null> {
    const supabase = createClient();

    // Get all active packs
    const { data: packs, error } = await supabase
      .from("packs")
      .select("*")
      .eq("is_active", true);

    if (error) throw error;

    // Find the pack whose slugified name matches
    const pack = (packs || []).find(p => slugifyPackName(p.name) === slug);
    if (!pack) return null;

    // Get pack words
    const { data: words, error: wordsError } = await supabase
      .from("words")
      .select("*")
      .eq("pack_id", pack.id)
      .order("english");

    if (wordsError) throw wordsError;

    return {
      pack,
      words: words || []
    };
  }

  /**
   * Check which packs a user has started learning (has progress on pack words)
   */
  static async getUserStartedPacks(userId?: string): Promise<string[]> {
    const supabase = createClient();

    // Get current user if not provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      userId = user.id;
    }

    // Get pack IDs for words the user has progress on
    const { data, error } = await supabase
      .from("word_progress")
      .select(`
        word_id,
        words!inner(pack_id)
      `)
      .eq("user_id", userId)
      .not("words.pack_id", "is", null);

    if (error) {
      console.error("Error fetching user started packs:", error);
      return [];
    }

    // Get unique pack IDs
    const packIds = new Set<string>();
    (data || []).forEach(row => {
      const words = row.words as unknown as { pack_id: string } | null;
      if (words?.pack_id) {
        packIds.add(words.pack_id);
      }
    });

    return Array.from(packIds);
  }

  /**
   * Start learning a pack - creates word_progress entries for all pack words
   */
  static async startPack(packId: string): Promise<{
    wordsStarted: number;
  }> {
    const supabase = createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Get pack words
    const { words } = await this.getPackContents(packId);
    const now = new Date().toISOString();

    // Create word_progress entries for each word
    let wordsStarted = 0;
    for (const word of words) {
      const { error } = await supabase
        .from("word_progress")
        .upsert({
          user_id: user.id,
          word_id: word.id,
          status: "learning",
          interval: 0,
          ease_factor: 2.5,
          review_count: 0,
          next_review_date: now,
        }, {
          onConflict: "user_id,word_id",
          ignoreDuplicates: true
        });

      if (!error) {
        wordsStarted++;
      }
    }

    return { wordsStarted };
  }

  /**
   * Stop learning a pack - removes word_progress entries for pack words
   */
  static async stopPack(packId: string): Promise<void> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Get word IDs from this pack
    const { data: packWords } = await supabase
      .from("words")
      .select("id")
      .eq("pack_id", packId);

    if (!packWords || packWords.length === 0) return;

    const wordIds = packWords.map(w => w.id);

    // Delete word progress for these words
    const { error } = await supabase
      .from("word_progress")
      .delete()
      .eq("user_id", user.id)
      .in("word_id", wordIds);

    if (error) throw error;
  }

  /**
   * Get user's progress on a specific pack
   */
  static async getPackProgress(packId: string, userId?: string): Promise<{
    total: number;
    learning: number;
    learned: number;
  }> {
    const supabase = createClient();

    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { total: 0, learning: 0, learned: 0 };
      userId = user.id;
    }

    // Get pack word count
    const { count: total } = await supabase
      .from("words")
      .select("*", { count: "exact", head: true })
      .eq("pack_id", packId);

    // Get user's progress on pack words
    const { data: progress } = await supabase
      .from("word_progress")
      .select(`
        status,
        words!inner(pack_id)
      `)
      .eq("user_id", userId)
      .eq("words.pack_id", packId);

    const learning = (progress || []).filter(p => p.status === "learning").length;
    const learned = (progress || []).filter(p => p.status === "learned").length;

    return {
      total: total || 0,
      learning,
      learned
    };
  }

  /**
   * Create a new pack (admin only)
   */
  static async createPack(pack: Omit<Pack, "id" | "created_at" | "updated_at">): Promise<Pack> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("packs")
      .insert([pack])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Add words to a pack (admin only)
   */
  static async addWordsToPack(
    packId: string,
    words: Array<{
      arabic: string;
      english: string;
      transliteration?: string;
      type?: string;
      notes?: string;
    }>
  ): Promise<PackWord[]> {
    const supabase = createClient();
    const wordsWithPackId = words.map(w => ({
      ...w,
      pack_id: packId,
      user_id: null
    }));

    const { data, error } = await supabase
      .from("words")
      .insert(wordsWithPackId)
      .select();

    if (error) throw error;
    return data || [];
  }
}

// Backwards compatibility aliases
export class StarterPackService extends PackService {
  // Alias old method names to new ones
  static getUserImportedPacks = PackService.getUserStartedPacks;
  static importPack = PackService.startPack;
  static uninstallPack = PackService.stopPack;
}

export type { Pack as StarterPack, PackWord as StarterPackWord };
