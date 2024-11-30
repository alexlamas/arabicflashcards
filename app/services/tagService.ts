import { supabase } from '../supabase';

export interface Tag {
  id: string;
  name: string;
}

export class TagService {
  static async getTags(userId: string): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('id, name')
      .eq('user_id', userId)
      .order('name');

    if (error) throw error;
    return data;
  }

  static async createTag(userId: string, name: string): Promise<Tag> {
    const { data, error } = await supabase
      .from('tags')
      .insert([{ name, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async addTagToWord(userId: string, wordId: string, tagId: string): Promise<void> {
    const { error } = await supabase
      .from('word_tags')
      .insert([{ word_id: wordId, tag_id: tagId, user_id: userId }]);

    if (error) throw error;
  }

  static async removeTagFromWord(userId: string, wordId: string, tagId: string): Promise<void> {
    const { error } = await supabase
      .from('word_tags')
      .delete()
      .match({ word_id: wordId, tag_id: tagId, user_id: userId });

    if (error) throw error;
  }
}