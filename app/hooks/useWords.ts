import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import type { Word, ProgressMap, WordProgress, ProgressState } from '../types';

export function useWords() {
  const [words, setWords] = useState<Word[]>([]);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      
      if (!user?.user) {
        throw new Error('No authenticated user');
      }

      const { data, error: dbError } = await supabase
        .from('word_progress')
        .select('word_english, status');

      if (dbError) throw dbError;

      const progressMap: ProgressMap = {};
      (data as WordProgress[]).forEach((item) => {
        progressMap[item.word_english] = item.status;
      });

      setProgress(progressMap);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (wordEnglish: string, status: ProgressState) => {
    try {
      const { user } = (await supabase.auth.getUser()).data;
      if (!user) return;

      const { error } = await supabase
        .from('word_progress')
        .upsert({
          user_id: user.id,
          word_english: wordEnglish,
          status
        });

      if (error) throw error;

      setProgress(prev => ({
        ...prev,
        [wordEnglish]: status
      }));
    } catch (err) {
      setError(err as Error);
    }
  };

  return {
    words,
    progress,
    loading,
    error,
    updateProgress
  };
}