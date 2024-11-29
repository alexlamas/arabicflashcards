import { supabase } from '../supabase';
import type { ProgressState, WordProgress } from '../types/word';
import type { Session } from '@supabase/supabase-js';

export class WordService {
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

  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }
}

export class AuthService {
  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static onAuthStateChange(callback: (session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  }
}