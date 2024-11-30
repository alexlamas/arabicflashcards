// app/services/progressService.ts
import { supabase } from '../supabase';
import type { ProgressState, WordProgress } from '../types/word';

export class ProgressService {
  static async getProgress(): Promise<WordProgress[]> {
    const { data, error } = await supabase
      .from('word_progress')
      .select('word_english, status');

    if (error) throw error;
    return data as WordProgress[];
  }

  static async updateProgress(
    userId: string,
    wordEnglish: string,
    status: ProgressState
  ): Promise<void> {
    const { error } = await supabase
      .from('word_progress')
      .upsert({
        user_id: userId,
        word_english: wordEnglish,
        status
      });

    if (error) throw error;
  }
}