// app/services/wordService.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import type { Word } from '../types/word';
import { Tag } from './tagService';
interface TagRelation {
  tag: Tag;
}
export class WordService {
  static async getAllWords(): Promise<Word[]> {
    const { data, error } = await supabase
      .from('words')
      .select(`
        *,
        tags:word_tags(
          tag:tags(*)
        )
      `)
      .order('english');

    if (error) throw error;
    return data.map(word => ({
      ...word,
      tags: word.tags?.map((tagRelation: TagRelation) => tagRelation.tag) || []
    }));
  }

  

  static async getWordByEnglish(english: string): Promise<Word | null> {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .eq('english', english)
      .single();

    if (error) throw error;
    return data;
  }

  static async createWord(
    client: SupabaseClient, 
    word: Omit<Word, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Word> {
    const { data, error } = await client
      .from('words')
      .insert([word])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateWord(id: string, word: Partial<Word>): Promise<Word> {
    const { data, error } = await supabase
      .from('words')
      .update(word)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteWord(id: string): Promise<void> {
    const { error } = await supabase
      .from('words')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}