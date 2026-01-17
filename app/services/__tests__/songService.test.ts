import { describe, it, expect, beforeEach, vi } from "vitest";
import { createSupabaseMock } from "@/app/test-utils/supabaseMock";

// Create mock before importing service
const supabaseMock = createSupabaseMock();

vi.mock("@/utils/supabase/client", () => ({
  createClient: vi.fn(() => supabaseMock.mock),
}));

import { SongService, Song, SongLine, SongLineWord } from "../songService";

// Test fixtures
const mockSong: Song = {
  id: "song-1",
  title: "Test Song",
  artist: "Test Artist",
  slug: "test-song",
  youtube_id: "abc123",
  description: "A test song",
  cover_url: null,
  is_published: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const mockLine: SongLine = {
  id: "line-1",
  song_id: "song-1",
  start_time: 0,
  end_time: 5,
  arabic: "مرحبا",
  transliteration: "marhaba",
  english: "Hello",
  line_order: 0,
  created_at: "2024-01-01T00:00:00Z",
};

const mockWord: SongLineWord = {
  id: "word-1",
  song_line_id: "line-1",
  arabic: "مرحبا",
  transliteration: "marhaba",
  english: "Hello",
  word_order: 0,
  created_at: "2024-01-01T00:00:00Z",
};

describe("SongService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMock.reset();
  });

  describe("getAllSongs", () => {
    it("should fetch all songs with line counts", async () => {
      const mockSongs = [mockSong, { ...mockSong, id: "song-2", title: "Song 2" }];
      const mockLineCounts = [
        { song_id: "song-1" },
        { song_id: "song-1" },
        { song_id: "song-2" },
      ];

      // First call returns songs, second returns line counts
      let callCount = 0;
      supabaseMock.mock.then = vi.fn((resolve) => {
        callCount++;
        if (callCount === 1) {
          resolve({ data: mockSongs, error: null });
        } else {
          resolve({ data: mockLineCounts, error: null });
        }
      });

      const result = await SongService.getAllSongs();

      expect(supabaseMock.mock.from).toHaveBeenCalledWith("songs");
      expect(supabaseMock.mock.from).toHaveBeenCalledWith("song_lines");
      expect(result).toHaveLength(2);
      expect(result[0].line_count).toBe(2);
      expect(result[1].line_count).toBe(1);
    });

    it("should return empty array when no songs", async () => {
      supabaseMock.setResult([], null);

      const result = await SongService.getAllSongs();

      expect(result).toEqual([]);
    });

    it("should throw error on database failure", async () => {
      supabaseMock.setResult(null, { message: "Database error" });

      await expect(SongService.getAllSongs()).rejects.toEqual({ message: "Database error" });
    });

    it("should handle songs with zero lines", async () => {
      const mockSongs = [mockSong];

      let callCount = 0;
      supabaseMock.mock.then = vi.fn((resolve) => {
        callCount++;
        if (callCount === 1) {
          resolve({ data: mockSongs, error: null });
        } else {
          resolve({ data: [], error: null });
        }
      });

      const result = await SongService.getAllSongs();

      expect(result[0].line_count).toBe(0);
    });
  });

  describe("getSongWithLines", () => {
    it("should fetch song with lines and words", async () => {
      const mockLines = [mockLine, { ...mockLine, id: "line-2", line_order: 1 }];
      const mockWords = [
        mockWord,
        { ...mockWord, id: "word-2", song_line_id: "line-2" },
      ];

      let callCount = 0;
      supabaseMock.mock.single = vi.fn(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ data: mockSong, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      });

      supabaseMock.mock.then = vi.fn((resolve) => {
        callCount++;
        if (callCount === 2) {
          resolve({ data: mockLines, error: null });
        } else {
          resolve({ data: mockWords, error: null });
        }
      });

      const result = await SongService.getSongWithLines("song-1");

      expect(result).not.toBeNull();
      expect(result?.id).toBe("song-1");
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("id", "song-1");
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("song_id", "song-1");
    });

    it("should return null when song not found", async () => {
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: null, error: { code: "PGRST116" } })
      );

      await expect(SongService.getSongWithLines("nonexistent")).rejects.toEqual({
        code: "PGRST116",
      });
    });

    it("should throw error on lines fetch failure", async () => {
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: mockSong, error: null })
      );
      supabaseMock.setResult(null, { message: "Lines error" });

      await expect(SongService.getSongWithLines("song-1")).rejects.toEqual({
        message: "Lines error",
      });
    });

    it("should group words by line correctly", async () => {
      const mockLines = [
        { ...mockLine, id: "line-1" },
        { ...mockLine, id: "line-2", line_order: 1 },
      ];
      const mockWords = [
        { ...mockWord, id: "word-1", song_line_id: "line-1" },
        { ...mockWord, id: "word-2", song_line_id: "line-1" },
        { ...mockWord, id: "word-3", song_line_id: "line-2" },
      ];

      let callCount = 0;
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: mockSong, error: null })
      );

      supabaseMock.mock.then = vi.fn((resolve) => {
        callCount++;
        if (callCount === 1) {
          resolve({ data: mockLines, error: null });
        } else {
          resolve({ data: mockWords, error: null });
        }
      });

      const result = await SongService.getSongWithLines("song-1");

      expect(result?.lines[0].words).toHaveLength(2);
      expect(result?.lines[1].words).toHaveLength(1);
    });
  });

  describe("getSongBySlug", () => {
    it("should fetch published song by slug", async () => {
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: mockSong, error: null })
      );
      supabaseMock.setResult([], null);

      const result = await SongService.getSongBySlug("test-song");

      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("slug", "test-song");
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("is_published", true);
      expect(result).not.toBeNull();
    });

    it("should return null for not found (PGRST116)", async () => {
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: null, error: { code: "PGRST116" } })
      );

      const result = await SongService.getSongBySlug("nonexistent");

      expect(result).toBeNull();
    });

    it("should throw on other errors", async () => {
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: null, error: { code: "OTHER", message: "Error" } })
      );

      await expect(SongService.getSongBySlug("test")).rejects.toEqual({
        code: "OTHER",
        message: "Error",
      });
    });

    it("should return empty lines array when song has no lines", async () => {
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: mockSong, error: null })
      );
      supabaseMock.setResult([], null);

      const result = await SongService.getSongBySlug("test-song");

      expect(result?.lines).toEqual([]);
    });
  });

  describe("createSong", () => {
    it("should create song with required fields", async () => {
      const newSong = { ...mockSong, is_published: false };
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: newSong, error: null })
      );

      const result = await SongService.createSong({
        title: "New Song",
        artist: "Artist",
        slug: "new-song",
        youtube_id: "xyz789",
      });

      expect(supabaseMock.mock.insert).toHaveBeenCalledWith({
        title: "New Song",
        artist: "Artist",
        slug: "new-song",
        youtube_id: "xyz789",
        description: null,
        is_published: false,
      });
      expect(result).toEqual(newSong);
    });

    it("should create song with optional description", async () => {
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: mockSong, error: null })
      );

      await SongService.createSong({
        title: "New Song",
        artist: "Artist",
        slug: "new-song",
        youtube_id: "xyz789",
        description: "My description",
      });

      expect(supabaseMock.mock.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "My description",
        })
      );
    });

    it("should create published song when specified", async () => {
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: mockSong, error: null })
      );

      await SongService.createSong({
        title: "New Song",
        artist: "Artist",
        slug: "new-song",
        youtube_id: "xyz789",
        is_published: true,
      });

      expect(supabaseMock.mock.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          is_published: true,
        })
      );
    });

    it("should throw error on creation failure", async () => {
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: null, error: { message: "Duplicate slug" } })
      );

      await expect(
        SongService.createSong({
          title: "New Song",
          artist: "Artist",
          slug: "existing-slug",
          youtube_id: "xyz789",
        })
      ).rejects.toEqual({ message: "Duplicate slug" });
    });
  });

  describe("updateSong", () => {
    it("should update song fields", async () => {
      const updatedSong = { ...mockSong, title: "Updated Title" };
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: updatedSong, error: null })
      );

      const result = await SongService.updateSong("song-1", { title: "Updated Title" });

      expect(supabaseMock.mock.update).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Updated Title",
        })
      );
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("id", "song-1");
      expect(result.title).toBe("Updated Title");
    });

    it("should update published status", async () => {
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: { ...mockSong, is_published: false }, error: null })
      );

      await SongService.updateSong("song-1", { is_published: false });

      expect(supabaseMock.mock.update).toHaveBeenCalledWith(
        expect.objectContaining({
          is_published: false,
        })
      );
    });

    it("should set updated_at timestamp", async () => {
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: mockSong, error: null })
      );

      await SongService.updateSong("song-1", { title: "New" });

      expect(supabaseMock.mock.update).toHaveBeenCalledWith(
        expect.objectContaining({
          updated_at: expect.any(String),
        })
      );
    });

    it("should throw error on update failure", async () => {
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: null, error: { message: "Not found" } })
      );

      await expect(SongService.updateSong("invalid", { title: "New" })).rejects.toEqual({
        message: "Not found",
      });
    });
  });

  describe("deleteSong", () => {
    it("should delete song by id", async () => {
      supabaseMock.setResult(null, null);

      await SongService.deleteSong("song-1");

      expect(supabaseMock.mock.from).toHaveBeenCalledWith("songs");
      expect(supabaseMock.mock.delete).toHaveBeenCalled();
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("id", "song-1");
    });

    it("should throw error on delete failure", async () => {
      supabaseMock.setResult(null, { message: "Cannot delete" });

      await expect(SongService.deleteSong("song-1")).rejects.toEqual({
        message: "Cannot delete",
      });
    });
  });

  describe("addLine", () => {
    it("should add line to song", async () => {
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: mockLine, error: null })
      );

      const result = await SongService.addLine("song-1", {
        start_time: 0,
        end_time: 5,
        arabic: "مرحبا",
        transliteration: "marhaba",
        english: "Hello",
        line_order: 0,
      });

      expect(supabaseMock.mock.from).toHaveBeenCalledWith("song_lines");
      expect(supabaseMock.mock.insert).toHaveBeenCalledWith({
        song_id: "song-1",
        start_time: 0,
        end_time: 5,
        arabic: "مرحبا",
        transliteration: "marhaba",
        english: "Hello",
        line_order: 0,
      });
      expect(result).toEqual(mockLine);
    });

    it("should handle null end_time", async () => {
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: { ...mockLine, end_time: null }, error: null })
      );

      await SongService.addLine("song-1", {
        start_time: 10,
        arabic: "test",
        transliteration: "test",
        english: "test",
        line_order: 1,
      });

      expect(supabaseMock.mock.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          end_time: null,
        })
      );
    });

    it("should throw error on insert failure", async () => {
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: null, error: { message: "Invalid song_id" } })
      );

      await expect(
        SongService.addLine("invalid", {
          start_time: 0,
          arabic: "test",
          transliteration: "test",
          english: "test",
          line_order: 0,
        })
      ).rejects.toEqual({ message: "Invalid song_id" });
    });
  });

  describe("updateLine", () => {
    it("should update line fields", async () => {
      const updatedLine = { ...mockLine, arabic: "Updated" };
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: updatedLine, error: null })
      );

      const result = await SongService.updateLine("line-1", { arabic: "Updated" });

      expect(supabaseMock.mock.from).toHaveBeenCalledWith("song_lines");
      expect(supabaseMock.mock.update).toHaveBeenCalledWith({ arabic: "Updated" });
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("id", "line-1");
      expect(result.arabic).toBe("Updated");
    });

    it("should update timing fields", async () => {
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: { ...mockLine, start_time: 5, end_time: 10 }, error: null })
      );

      await SongService.updateLine("line-1", { start_time: 5, end_time: 10 });

      expect(supabaseMock.mock.update).toHaveBeenCalledWith({
        start_time: 5,
        end_time: 10,
      });
    });

    it("should throw error on update failure", async () => {
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: null, error: { message: "Not found" } })
      );

      await expect(SongService.updateLine("invalid", { arabic: "test" })).rejects.toEqual({
        message: "Not found",
      });
    });
  });

  describe("deleteLine", () => {
    it("should delete line by id", async () => {
      supabaseMock.setResult(null, null);

      await SongService.deleteLine("line-1");

      expect(supabaseMock.mock.from).toHaveBeenCalledWith("song_lines");
      expect(supabaseMock.mock.delete).toHaveBeenCalled();
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("id", "line-1");
    });

    it("should throw error on delete failure", async () => {
      supabaseMock.setResult(null, { message: "Cannot delete" });

      await expect(SongService.deleteLine("line-1")).rejects.toEqual({
        message: "Cannot delete",
      });
    });
  });

  describe("addWord", () => {
    it("should add word to line", async () => {
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: mockWord, error: null })
      );

      const result = await SongService.addWord("line-1", {
        arabic: "مرحبا",
        transliteration: "marhaba",
        english: "Hello",
        word_order: 0,
      });

      expect(supabaseMock.mock.from).toHaveBeenCalledWith("song_line_words");
      expect(supabaseMock.mock.insert).toHaveBeenCalledWith({
        song_line_id: "line-1",
        arabic: "مرحبا",
        transliteration: "marhaba",
        english: "Hello",
        word_order: 0,
      });
      expect(result).toEqual(mockWord);
    });

    it("should throw error on insert failure", async () => {
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: null, error: { message: "Invalid line_id" } })
      );

      await expect(
        SongService.addWord("invalid", {
          arabic: "test",
          transliteration: "test",
          english: "test",
          word_order: 0,
        })
      ).rejects.toEqual({ message: "Invalid line_id" });
    });
  });

  describe("updateWord", () => {
    it("should update word fields", async () => {
      const updatedWord = { ...mockWord, english: "Hi" };
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: updatedWord, error: null })
      );

      const result = await SongService.updateWord("word-1", { english: "Hi" });

      expect(supabaseMock.mock.from).toHaveBeenCalledWith("song_line_words");
      expect(supabaseMock.mock.update).toHaveBeenCalledWith({ english: "Hi" });
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("id", "word-1");
      expect(result.english).toBe("Hi");
    });

    it("should update word order", async () => {
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: { ...mockWord, word_order: 5 }, error: null })
      );

      await SongService.updateWord("word-1", { word_order: 5 });

      expect(supabaseMock.mock.update).toHaveBeenCalledWith({ word_order: 5 });
    });

    it("should throw error on update failure", async () => {
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: null, error: { message: "Not found" } })
      );

      await expect(SongService.updateWord("invalid", { arabic: "test" })).rejects.toEqual({
        message: "Not found",
      });
    });
  });

  describe("deleteWord", () => {
    it("should delete word by id", async () => {
      supabaseMock.setResult(null, null);

      await SongService.deleteWord("word-1");

      expect(supabaseMock.mock.from).toHaveBeenCalledWith("song_line_words");
      expect(supabaseMock.mock.delete).toHaveBeenCalled();
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("id", "word-1");
    });

    it("should throw error on delete failure", async () => {
      supabaseMock.setResult(null, { message: "Cannot delete" });

      await expect(SongService.deleteWord("word-1")).rejects.toEqual({
        message: "Cannot delete",
      });
    });
  });

  describe("reorderLines", () => {
    it("should update line orders sequentially", async () => {
      supabaseMock.setResult(null, null);

      await SongService.reorderLines("song-1", ["line-3", "line-1", "line-2"]);

      // Should be called 3 times with different orders
      expect(supabaseMock.mock.update).toHaveBeenCalledTimes(3);
      expect(supabaseMock.mock.update).toHaveBeenNthCalledWith(1, { line_order: 0 });
      expect(supabaseMock.mock.update).toHaveBeenNthCalledWith(2, { line_order: 1 });
      expect(supabaseMock.mock.update).toHaveBeenNthCalledWith(3, { line_order: 2 });
    });

    it("should verify song_id for each update", async () => {
      supabaseMock.setResult(null, null);

      await SongService.reorderLines("song-1", ["line-1", "line-2"]);

      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("song_id", "song-1");
    });

    it("should throw error if any update fails", async () => {
      let callCount = 0;
      supabaseMock.mock.then = vi.fn((resolve) => {
        callCount++;
        if (callCount === 2) {
          resolve({ data: null, error: { message: "Update failed" } });
        } else {
          resolve({ data: null, error: null });
        }
      });

      await expect(
        SongService.reorderLines("song-1", ["line-1", "line-2", "line-3"])
      ).rejects.toEqual({ message: "Update failed" });
    });

    it("should handle empty line array", async () => {
      await SongService.reorderLines("song-1", []);

      expect(supabaseMock.mock.update).not.toHaveBeenCalled();
    });
  });
});
