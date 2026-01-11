import { createClient } from "@/utils/supabase/client";

export interface Song {
  id: string;
  title: string;
  artist: string;
  slug: string;
  youtube_id: string;
  description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SongLine {
  id: string;
  song_id: string;
  start_time: number;
  end_time: number | null;
  arabic: string;
  transliteration: string;
  english: string;
  line_order: number;
  created_at: string;
  words?: SongLineWord[];
}

export interface SongLineWord {
  id: string;
  song_line_id: string;
  arabic: string;
  transliteration: string;
  english: string;
  word_order: number;
  created_at: string;
}

export interface SongWithLines extends Song {
  lines: SongLine[];
}

export class SongService {
  /**
   * Get all songs (admin view - includes unpublished)
   */
  static async getAllSongs(): Promise<(Song & { line_count: number })[]> {
    const supabase = createClient();

    const { data: songs, error } = await supabase
      .from("songs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Get line counts
    const { data: lineCounts } = await supabase
      .from("song_lines")
      .select("song_id");

    const lineCountMap = new Map<string, number>();
    for (const line of lineCounts || []) {
      lineCountMap.set(line.song_id, (lineCountMap.get(line.song_id) || 0) + 1);
    }

    return (songs || []).map(song => ({
      ...song,
      line_count: lineCountMap.get(song.id) || 0
    }));
  }

  /**
   * Get a single song with all its lines and words
   */
  static async getSongWithLines(songId: string): Promise<SongWithLines | null> {
    const supabase = createClient();

    const { data: song, error: songError } = await supabase
      .from("songs")
      .select("*")
      .eq("id", songId)
      .single();

    if (songError) throw songError;
    if (!song) return null;

    const { data: lines, error: linesError } = await supabase
      .from("song_lines")
      .select("*")
      .eq("song_id", songId)
      .order("line_order", { ascending: true });

    if (linesError) throw linesError;

    // Get words for all lines
    const lineIds = (lines || []).map(l => l.id);
    const { data: words, error: wordsError } = await supabase
      .from("song_line_words")
      .select("*")
      .in("song_line_id", lineIds)
      .order("word_order", { ascending: true });

    if (wordsError) throw wordsError;

    // Group words by line
    const wordsByLine = new Map<string, SongLineWord[]>();
    for (const word of words || []) {
      const lineWords = wordsByLine.get(word.song_line_id) || [];
      lineWords.push(word);
      wordsByLine.set(word.song_line_id, lineWords);
    }

    return {
      ...song,
      lines: (lines || []).map(line => ({
        ...line,
        words: wordsByLine.get(line.id) || []
      }))
    };
  }

  /**
   * Get a song by slug (public view - only published)
   */
  static async getSongBySlug(slug: string): Promise<SongWithLines | null> {
    const supabase = createClient();

    const { data: song, error: songError } = await supabase
      .from("songs")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (songError) {
      if (songError.code === 'PGRST116') return null; // Not found
      throw songError;
    }
    if (!song) return null;

    const { data: lines, error: linesError } = await supabase
      .from("song_lines")
      .select("*")
      .eq("song_id", song.id)
      .order("line_order", { ascending: true });

    if (linesError) throw linesError;

    // Get words for all lines
    const lineIds = (lines || []).map(l => l.id);
    if (lineIds.length === 0) {
      return { ...song, lines: [] };
    }

    const { data: words, error: wordsError } = await supabase
      .from("song_line_words")
      .select("*")
      .in("song_line_id", lineIds)
      .order("word_order", { ascending: true });

    if (wordsError) throw wordsError;

    // Group words by line
    const wordsByLine = new Map<string, SongLineWord[]>();
    for (const word of words || []) {
      const lineWords = wordsByLine.get(word.song_line_id) || [];
      lineWords.push(word);
      wordsByLine.set(word.song_line_id, lineWords);
    }

    return {
      ...song,
      lines: (lines || []).map(line => ({
        ...line,
        words: wordsByLine.get(line.id) || []
      }))
    };
  }

  /**
   * Create a new song
   */
  static async createSong(data: {
    title: string;
    artist: string;
    slug: string;
    youtube_id: string;
    description?: string;
    is_published?: boolean;
  }): Promise<Song> {
    const supabase = createClient();

    const { data: song, error } = await supabase
      .from("songs")
      .insert({
        title: data.title,
        artist: data.artist,
        slug: data.slug,
        youtube_id: data.youtube_id,
        description: data.description || null,
        is_published: data.is_published ?? false
      })
      .select()
      .single();

    if (error) throw error;
    return song;
  }

  /**
   * Update a song
   */
  static async updateSong(songId: string, data: Partial<{
    title: string;
    artist: string;
    slug: string;
    youtube_id: string;
    description: string | null;
    is_published: boolean;
  }>): Promise<Song> {
    const supabase = createClient();

    const { data: song, error } = await supabase
      .from("songs")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", songId)
      .select()
      .single();

    if (error) throw error;
    return song;
  }

  /**
   * Delete a song
   */
  static async deleteSong(songId: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from("songs")
      .delete()
      .eq("id", songId);

    if (error) throw error;
  }

  /**
   * Add a line to a song
   */
  static async addLine(songId: string, data: {
    start_time: number;
    end_time?: number;
    arabic: string;
    transliteration: string;
    english: string;
    line_order: number;
  }): Promise<SongLine> {
    const supabase = createClient();

    const { data: line, error } = await supabase
      .from("song_lines")
      .insert({
        song_id: songId,
        start_time: data.start_time,
        end_time: data.end_time || null,
        arabic: data.arabic,
        transliteration: data.transliteration,
        english: data.english,
        line_order: data.line_order
      })
      .select()
      .single();

    if (error) throw error;
    return line;
  }

  /**
   * Update a line
   */
  static async updateLine(lineId: string, data: Partial<{
    start_time: number;
    end_time: number | null;
    arabic: string;
    transliteration: string;
    english: string;
    line_order: number;
  }>): Promise<SongLine> {
    const supabase = createClient();

    const { data: line, error } = await supabase
      .from("song_lines")
      .update(data)
      .eq("id", lineId)
      .select()
      .single();

    if (error) throw error;
    return line;
  }

  /**
   * Delete a line
   */
  static async deleteLine(lineId: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from("song_lines")
      .delete()
      .eq("id", lineId);

    if (error) throw error;
  }

  /**
   * Add a word to a line
   */
  static async addWord(lineId: string, data: {
    arabic: string;
    transliteration: string;
    english: string;
    word_order: number;
  }): Promise<SongLineWord> {
    const supabase = createClient();

    const { data: word, error } = await supabase
      .from("song_line_words")
      .insert({
        song_line_id: lineId,
        arabic: data.arabic,
        transliteration: data.transliteration,
        english: data.english,
        word_order: data.word_order
      })
      .select()
      .single();

    if (error) throw error;
    return word;
  }

  /**
   * Update a word
   */
  static async updateWord(wordId: string, data: Partial<{
    arabic: string;
    transliteration: string;
    english: string;
    word_order: number;
  }>): Promise<SongLineWord> {
    const supabase = createClient();

    const { data: word, error } = await supabase
      .from("song_line_words")
      .update(data)
      .eq("id", wordId)
      .select()
      .single();

    if (error) throw error;
    return word;
  }

  /**
   * Delete a word
   */
  static async deleteWord(wordId: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from("song_line_words")
      .delete()
      .eq("id", wordId);

    if (error) throw error;
  }

  /**
   * Reorder lines in a song
   */
  static async reorderLines(songId: string, lineIds: string[]): Promise<void> {
    const supabase = createClient();

    // Update each line's order
    for (let i = 0; i < lineIds.length; i++) {
      const { error } = await supabase
        .from("song_lines")
        .update({ line_order: i })
        .eq("id", lineIds[i])
        .eq("song_id", songId);

      if (error) throw error;
    }
  }
}
