// app/services/wordService.ts
import { supabase } from "../supabase";
import type { Word } from "../types/word";
import { Tag } from "./tagService";
interface TagRelation {
  tag: Tag;
}

export class WordService {
  static async getAllWords(): Promise<Word[]> {
    const { data, error } = await supabase
      .from("words")
      .select(
        `
        *,
        tags:word_tags(
          tag:tags(*)
        ),
        progress:word_progress(
          status,
          next_review_date
        )
      `
      )
      .order("english");

    if (error) throw error;
    return data.map((word) => ({
      ...word,
      tags: word.tags?.map((tagRelation: TagRelation) => tagRelation.tag) || [],
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
    // First, let's clean up the word object to only include updatable fields
    const updatePayload = {
      english: word.english,
      arabic: word.arabic,
      transliteration: word.transliteration,
      type: word.type,
    };

    console.log("Update payload:", updatePayload); // Debug log

    const { data, error } = await supabase
      .from("words")
      .update(updatePayload) // Use cleaned payload instead of full word object
      .eq("id", id)
      .select(
        `
        *,
        tags:word_tags(
          tag:tags(*)
        ),
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
      tags: data.tags?.map((tagRelation: TagRelation) => tagRelation.tag) || [],
      status: data.progress?.[0]?.status || null,
      next_review_date: data.progress?.[0]?.next_review_date || null,
    };
  }

  static async deleteWord(id: string): Promise<void> {
    const { error } = await supabase.from("words").delete().eq("id", id);

    if (error) throw error;
  }
}
