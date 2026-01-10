import { createClient } from "@/utils/supabase/client";

export interface TransliterationRule {
  id: string;
  arabic: string;
  latin: string;
  example_arabic: string | null;
  example_latin: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TransliterationRuleInput {
  arabic: string;
  latin: string;
  example_arabic?: string | null;
  example_latin?: string | null;
  sort_order?: number;
}

export class TransliterationService {
  /**
   * Get all transliteration rules ordered by sort_order
   */
  static async getRules(): Promise<TransliterationRule[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("transliteration_rules")
      .select("*")
      .order("sort_order");

    if (error) throw error;
    return data || [];
  }

  /**
   * Get the transliteration notes/instructions
   */
  static async getNotes(): Promise<string> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("transliteration_settings")
      .select("value")
      .eq("key", "notes")
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data?.value || "";
  }

  /**
   * Update the transliteration notes
   */
  static async updateNotes(notes: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from("transliteration_settings")
      .upsert({ key: "notes", value: notes, updated_at: new Date().toISOString() }, { onConflict: "key" });

    if (error) throw error;
  }

  /**
   * Create a new rule
   */
  static async createRule(input: TransliterationRuleInput): Promise<TransliterationRule> {
    const supabase = createClient();

    // Get max sort_order if not provided
    let sortOrder = input.sort_order;
    if (sortOrder === undefined) {
      const { data: maxData } = await supabase
        .from("transliteration_rules")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .single();
      sortOrder = (maxData?.sort_order || 0) + 1;
    }

    const { data, error } = await supabase
      .from("transliteration_rules")
      .insert({ ...input, sort_order: sortOrder })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update an existing rule
   */
  static async updateRule(id: string, input: Partial<TransliterationRuleInput>): Promise<TransliterationRule> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("transliteration_rules")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a rule
   */
  static async deleteRule(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from("transliteration_rules")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  /**
   * Generate the transliteration prompt for Claude
   */
  static async getTransliterationPrompt(): Promise<string> {
    const [rules, notes] = await Promise.all([
      this.getRules(),
      this.getNotes(),
    ]);

    const rulesStr = rules
      .map((r) => `${r.arabic}=${r.latin}`)
      .join(", ");

    return `
TRANSLITERATION RULES:
Use these specific transliterations for Arabic letters: ${rulesStr}

${notes}
`.trim();
  }
}
