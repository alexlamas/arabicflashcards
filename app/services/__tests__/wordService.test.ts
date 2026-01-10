import { describe, it, expect, beforeEach, vi } from "vitest";
import { createSupabaseMock } from "@/app/test-utils/supabaseMock";

// Mock the createClient import
const supabaseMock = createSupabaseMock();

vi.mock("@/utils/supabase/client", () => ({
  createClient: vi.fn(() => supabaseMock.mock),
}));

// Import after mocking
import { WordService } from "../wordService";

describe("WordService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMock.setResult(null, null);
    supabaseMock.setUser(null);
  });

  describe("createWord", () => {
    const mockWordInput = {
      english: "hello",
      arabic: "مرحبا",
      transliteration: "marhaba",
      type: "noun" as const,
    };

    const mockUser = { id: "user-123", email: "test@example.com" };

    it("should create a word with user_id", async () => {
      supabaseMock.setUser(mockUser);

      const createdWord = {
        id: "word-456",
        ...mockWordInput,
        user_id: mockUser.id,
        created_at: "2024-01-15T12:00:00Z",
      };

      // Override single to return the created word
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: createdWord, error: null })
      );

      const result = await WordService.createWord(mockWordInput);

      expect(result).toEqual(createdWord);
      expect(supabaseMock.mock.from).toHaveBeenCalledWith("words");
      expect(supabaseMock.mock.insert).toHaveBeenCalledWith([
        { ...mockWordInput, user_id: mockUser.id },
      ]);
      expect(supabaseMock.mock.select).toHaveBeenCalled();
    });

    it("should throw if not authenticated", async () => {
      supabaseMock.setUser(null);

      await expect(WordService.createWord(mockWordInput)).rejects.toThrow(
        "Not authenticated"
      );
    });

    it("should throw if database insert fails", async () => {
      supabaseMock.setUser(mockUser);

      const dbError = { message: "Database error", code: "23505" };
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: null, error: dbError })
      );

      await expect(WordService.createWord(mockWordInput)).rejects.toEqual(
        dbError
      );
    });
  });

  describe("updateWord", () => {
    const wordId = "word-123";

    it("should update word fields", async () => {
      const updates = { english: "goodbye", arabic: "مع السلامة" };
      const updatedWord = {
        id: wordId,
        english: "goodbye",
        arabic: "مع السلامة",
        transliteration: "ma'a salama",
        type: "phrase",
        user_id: "user-123",
        progress: [{ status: "learning", next_review_date: null }],
      };

      // Mock the update chain to return data array
      supabaseMock.setResult([updatedWord], null);

      const result = await WordService.updateWord(wordId, updates);

      expect(result.english).toBe("goodbye");
      expect(result.arabic).toBe("مع السلامة");
      expect(result.status).toBe("learning");
      expect(supabaseMock.mock.from).toHaveBeenCalledWith("words");
      expect(supabaseMock.mock.update).toHaveBeenCalledWith(updates);
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("id", wordId);
    });

    it("should throw if word not found", async () => {
      const updates = { english: "test" };

      // Return empty array (no matching word)
      supabaseMock.setResult([], null);

      await expect(WordService.updateWord(wordId, updates)).rejects.toThrow(
        `Word with id ${wordId} not found`
      );
    });

    it("should throw if update returns null data", async () => {
      const updates = { english: "test" };

      supabaseMock.setResult(null, null);

      await expect(WordService.updateWord(wordId, updates)).rejects.toThrow(
        `Word with id ${wordId} not found`
      );
    });

    it("should throw if database update fails", async () => {
      const updates = { english: "test" };
      const dbError = { message: "Update failed", code: "42P01" };

      supabaseMock.setResult(null, dbError);

      await expect(WordService.updateWord(wordId, updates)).rejects.toEqual(
        dbError
      );
    });

    it("should fetch current word when no updates provided", async () => {
      const existingWord = {
        id: wordId,
        english: "hello",
        arabic: "مرحبا",
        transliteration: "marhaba",
        type: "noun",
        user_id: "user-123",
        progress: [{ status: "new", next_review_date: null }],
      };

      // When no updates, it fetches the word with single()
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: existingWord, error: null })
      );

      const result = await WordService.updateWord(wordId, {});

      expect(result.id).toBe(wordId);
      expect(result.english).toBe("hello");
      expect(result.status).toBe("new");
      expect(supabaseMock.mock.update).not.toHaveBeenCalled();
    });

    it("should throw when fetching non-existent word with empty updates", async () => {
      const fetchError = { message: "Not found", code: "PGRST116" };
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: null, error: fetchError })
      );

      await expect(WordService.updateWord(wordId, {})).rejects.toEqual(
        fetchError
      );
    });

    it("should handle word with no progress data", async () => {
      const updates = { notes: "test note" };
      const updatedWord = {
        id: wordId,
        english: "hello",
        arabic: "مرحبا",
        transliteration: "marhaba",
        type: "noun",
        notes: "test note",
        user_id: "user-123",
        progress: [],
      };

      supabaseMock.setResult([updatedWord], null);

      const result = await WordService.updateWord(wordId, updates);

      expect(result.notes).toBe("test note");
      expect(result.status).toBeNull();
      expect(result.next_review_date).toBeNull();
    });
  });

  describe("deleteWord", () => {
    const wordId = "word-789";

    it("should delete a word", async () => {
      supabaseMock.setResult(null, null);

      await expect(WordService.deleteWord(wordId)).resolves.toBeUndefined();

      expect(supabaseMock.mock.from).toHaveBeenCalledWith("words");
      expect(supabaseMock.mock.delete).toHaveBeenCalled();
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("id", wordId);
    });

    it("should throw if database delete fails", async () => {
      const dbError = { message: "Foreign key violation", code: "23503" };
      supabaseMock.setResult(null, dbError);

      await expect(WordService.deleteWord(wordId)).rejects.toEqual(dbError);
    });

    it("should not throw when deleting non-existent word", async () => {
      // Supabase delete doesn't throw for non-existent rows
      supabaseMock.setResult(null, null);

      await expect(WordService.deleteWord("non-existent-id")).resolves.toBeUndefined();
    });
  });
});
