import { supabase } from '../supabase';
import type { WordProgress, ProgressState } from '../types';

export class SupabaseService {
  static async updateWordProgress(
    wordEnglish: string, 
    status: ProgressState
  ): Promise<void> {
    const { user } = (await supabase.auth.getUser()).data;
    if (!user) throw new Error('No authenticated user');

    const { error } = await supabase
      .from('word_progress')
      .upsert({
        user_id: user.id,
        word_english: wordEnglish,
        status
      });

    if (error) throw error;
  }

  static async getWordProgress(): Promise<WordProgress[]> {
    const { data, error } = await supabase
      .from('word_progress')
      .select('word_english, status');

    if (error) throw error;
    return data as WordProgress[];
  }
}