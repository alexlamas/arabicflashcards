import { supabase } from "../supabase";
import type { Phrase } from "../types/phrase";

export class PhraseService {
  static async getAllPhrases(): Promise<Phrase[]> {
    const { data, error } = await supabase
      .from("phrases")
      .select(`
        *,
        word_phrases!inner(
          word_id,
          words!inner(
            id,
            english,
            arabic
          )
        )
      `)
      .order("english");

    if (error) throw error;
    
    interface PhraseWithRelations extends Phrase {
      word_phrases?: Array<{
        word_id: string;
        words: {
          id: string;
          english: string;
          arabic: string;
        };
      }>;
    }
    
    return (data as PhraseWithRelations[]).map((phrase) => ({
      ...phrase,
      linked_words: phrase.word_phrases?.map((wp) => wp.words) || []
    }));
  }

  static async getPhraseById(id: string): Promise<Phrase | null> {
    const { data, error } = await supabase
      .from("phrases")
      .select(`
        *,
        word_phrases!inner(
          word_id,
          words!inner(
            id,
            english,
            arabic
          )
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    
    if (!data) return null;
    
    interface PhraseWithRelations extends Phrase {
      word_phrases?: Array<{
        word_id: string;
        words: {
          id: string;
          english: string;
          arabic: string;
        };
      }>;
    }
    
    return {
      ...(data as PhraseWithRelations),
      linked_words: (data as PhraseWithRelations).word_phrases?.map((wp) => wp.words) || []
    };
  }

  static async getPhrasesForWord(wordId: string): Promise<Phrase[]> {
    const { data, error } = await supabase
      .from("phrases")
      .select(`
        *,
        word_phrases!inner(word_id)
      `)
      .eq("word_phrases.word_id", wordId)
      .order("english");

    if (error) throw error;
    return data || [];
  }

  static async createPhrase(
    phrase: Omit<Phrase, "id" | "created_at" | "updated_at">,
    wordIds?: string[]
  ): Promise<Phrase> {
    // Start a transaction
    const { data: phraseData, error: phraseError } = await supabase
      .from("phrases")
      .insert([{
        arabic: phrase.arabic,
        transliteration: phrase.transliteration,
        english: phrase.english,
        notes: phrase.notes
      }])
      .select()
      .single();

    if (phraseError) throw phraseError;

    // Link to words if provided
    if (wordIds && wordIds.length > 0) {
      const links = wordIds.map(wordId => ({
        word_id: wordId,
        phrase_id: phraseData.id
      }));

      const { error: linkError } = await supabase
        .from("word_phrases")
        .insert(links);

      if (linkError) throw linkError;
    }

    return phraseData;
  }

  static async updatePhrase(
    id: string, 
    phrase: Partial<Phrase>
  ): Promise<Phrase> {
    const updatePayload: Partial<Phrase> = {};
    
    if (phrase.english !== undefined) updatePayload.english = phrase.english;
    if (phrase.arabic !== undefined) updatePayload.arabic = phrase.arabic;
    if (phrase.transliteration !== undefined) updatePayload.transliteration = phrase.transliteration;
    if (phrase.notes !== undefined) updatePayload.notes = phrase.notes;

    const { data, error } = await supabase
      .from("phrases")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deletePhrase(id: string): Promise<void> {
    const { error } = await supabase
      .from("phrases")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  static async linkPhraseToWord(phraseId: string, wordId: string): Promise<void> {
    const { error } = await supabase
      .from("word_phrases")
      .insert([{ phrase_id: phraseId, word_id: wordId }]);

    if (error) throw error;
  }

  static async unlinkPhraseFromWord(phraseId: string, wordId: string): Promise<void> {
    const { error } = await supabase
      .from("word_phrases")
      .delete()
      .eq("phrase_id", phraseId)
      .eq("word_id", wordId);

    if (error) throw error;
  }
}