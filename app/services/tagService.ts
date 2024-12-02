import { supabase } from '../supabase';

export interface Tag {
  id: string;
  name: string;
}

export class TagService {
  static async getTags() {  // Remove userId parameter
    const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');
        
    if (error) throw error;
    return data;
}

  static async deleteTag(userId: string, tagId: string): Promise<void> {
    // First delete all word_tag relationships
    const { error: relationError } = await supabase
      .from('word_tags')
      .delete()
      .match({ tag_id: tagId, user_id: userId });

    if (relationError) throw relationError;

    // Then delete the tag itself
    const { error } = await supabase
      .from('tags')
      .delete()
      .match({ id: tagId, user_id: userId });

    if (error) throw error;
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