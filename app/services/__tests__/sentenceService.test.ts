import { describe, it, expect, beforeEach, vi } from "vitest";
import { Sentence } from "@/app/types/word";

// Create a mock result that can be modified between tests
const state = {
  mockResult: { data: null as unknown, error: null as unknown },
  mockUser: null as { id: string; email?: string } | null,
};

// Helper to create thenable object that always reads current state
function createThenable() {
  const obj = {
    from: vi.fn(() => createThenable()),
    select: vi.fn(() => createThenable()),
    insert: vi.fn(() => createThenable()),
    update: vi.fn(() => createThenable()),
    delete: vi.fn(() => createThenable()),
    eq: vi.fn(() => createThenable()),
    single: vi.fn(() => Promise.resolve(state.mockResult)),
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: state.mockUser }, error: null })
      ),
    },
    then: (resolve: (value: typeof state.mockResult) => void) => {
      resolve(state.mockResult);
      return Promise.resolve(state.mockResult);
    },
  };
  return obj;
}

// Create the mock with tracking
const mockFns = {
  from: vi.fn(),
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  eq: vi.fn(),
  single: vi.fn(),
  auth: {
    getUser: vi.fn(),
  },
};

// Wrap thenable to track calls
function createTrackedThenable() {
  const thenable = createThenable();

  return {
    from: (...args: unknown[]) => {
      mockFns.from(...args);
      const next = createTrackedThenable();
      return next;
    },
    select: (...args: unknown[]) => {
      mockFns.select(...args);
      const next = createTrackedThenable();
      return next;
    },
    insert: (...args: unknown[]) => {
      mockFns.insert(...args);
      const next = createTrackedThenable();
      return next;
    },
    update: (...args: unknown[]) => {
      mockFns.update(...args);
      const next = createTrackedThenable();
      return next;
    },
    delete: (...args: unknown[]) => {
      mockFns.delete(...args);
      const next = createTrackedThenable();
      return next;
    },
    eq: (...args: unknown[]) => {
      mockFns.eq(...args);
      const next = createTrackedThenable();
      return next;
    },
    single: () => {
      mockFns.single();
      return Promise.resolve(state.mockResult);
    },
    auth: {
      getUser: () => {
        mockFns.auth.getUser();
        return Promise.resolve({ data: { user: state.mockUser }, error: null });
      },
    },
    then: thenable.then,
  };
}

// Mock the createClient import
vi.mock("@/utils/supabase/client", () => ({
  createClient: vi.fn(() => createTrackedThenable()),
}));

import { SentenceService } from "../sentenceService";

// Helper functions
function setResult(data: unknown, error: unknown = null) {
  state.mockResult = { data, error };
}

function setUser(user: { id: string; email?: string } | null) {
  state.mockUser = user;
}

describe("SentenceService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.mockResult = { data: null, error: null };
    state.mockUser = null;
  });

  describe("getSentencesForWord", () => {
    it("should return sentences for a word", async () => {
      const mockSentences: Sentence[] = [
        {
          id: "sentence-1",
          arabic: "مرحبا",
          transliteration: "marhaba",
          english: "Hello",
        },
        {
          id: "sentence-2",
          arabic: "كيف حالك",
          transliteration: "kif halak",
          english: "How are you",
        },
      ];

      setResult(mockSentences.map((s) => ({ sentence: s })));

      const result = await SentenceService.getSentencesForWord("word-123");

      expect(result).toEqual(mockSentences);
      expect(mockFns.from).toHaveBeenCalledWith("word_sentences");
      expect(mockFns.eq).toHaveBeenCalledWith("word_id", "word-123");
    });

    it("should return empty array on error", async () => {
      setResult(null, { message: "Database error" });

      const result = await SentenceService.getSentencesForWord("word-123");

      expect(result).toEqual([]);
    });

    it("should return empty array when no data", async () => {
      setResult(null);

      const result = await SentenceService.getSentencesForWord("word-123");

      expect(result).toEqual([]);
    });

    it("should filter out null sentences", async () => {
      setResult([
        {
          sentence: {
            id: "s1",
            arabic: "أ",
            transliteration: "a",
            english: "a",
          },
        },
        { sentence: null },
        {
          sentence: {
            id: "s2",
            arabic: "ب",
            transliteration: "b",
            english: "b",
          },
        },
      ]);

      const result = await SentenceService.getSentencesForWord("word-123");

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("s1");
      expect(result[1].id).toBe("s2");
    });
  });

  describe("getWordsForSentence", () => {
    it("should return word IDs linked to a sentence", async () => {
      setResult([
        { word_id: "word-1" },
        { word_id: "word-2" },
        { word_id: "word-3" },
      ]);

      const result = await SentenceService.getWordsForSentence("sentence-123");

      expect(result).toEqual(["word-1", "word-2", "word-3"]);
      expect(mockFns.from).toHaveBeenCalledWith("word_sentences");
      expect(mockFns.eq).toHaveBeenCalledWith("sentence_id", "sentence-123");
    });

    it("should return empty array on error", async () => {
      setResult(null, { message: "Database error" });

      const result = await SentenceService.getWordsForSentence("sentence-123");

      expect(result).toEqual([]);
    });

    it("should return empty array when no linked words", async () => {
      setResult([]);

      const result = await SentenceService.getWordsForSentence("sentence-123");

      expect(result).toEqual([]);
    });
  });

  describe("createSentence", () => {
    it("should create a sentence and link it to a word", async () => {
      const newSentence: Sentence = {
        id: "new-sentence-id",
        arabic: "مرحبا",
        transliteration: "marhaba",
        english: "Hello",
        user_id: "user-123",
      };

      setResult(newSentence);

      const result = await SentenceService.createSentence(
        { arabic: "مرحبا", transliteration: "marhaba", english: "Hello" },
        "word-123",
        "user-123"
      );

      expect(result).toEqual(newSentence);
      expect(mockFns.from).toHaveBeenCalledWith("sentences");
      expect(mockFns.insert).toHaveBeenCalled();
    });

    it("should get user from auth if userId not provided", async () => {
      const newSentence: Sentence = {
        id: "new-sentence-id",
        arabic: "مرحبا",
        transliteration: "marhaba",
        english: "Hello",
        user_id: "auth-user-id",
      };

      setUser({ id: "auth-user-id", email: "test@example.com" });
      setResult(newSentence);

      const result = await SentenceService.createSentence(
        { transliteration: "marhaba", english: "Hello" },
        "word-123"
      );

      expect(result).toEqual(newSentence);
      expect(mockFns.auth.getUser).toHaveBeenCalled();
    });

    it("should return null if sentence insert fails", async () => {
      setResult(null, { message: "Insert failed" });

      const result = await SentenceService.createSentence(
        { transliteration: "marhaba", english: "Hello" },
        "word-123",
        "user-123"
      );

      expect(result).toBeNull();
    });

    it("should handle empty arabic field", async () => {
      const newSentence: Sentence = {
        id: "new-sentence-id",
        arabic: "",
        transliteration: "marhaba",
        english: "Hello",
        user_id: "user-123",
      };

      setResult(newSentence);

      const result = await SentenceService.createSentence(
        { transliteration: "marhaba", english: "Hello" },
        "word-123",
        "user-123"
      );

      expect(result).toEqual(newSentence);
    });
  });

  describe("updateSentence", () => {
    it("should update a sentence", async () => {
      const updatedSentence: Sentence = {
        id: "sentence-123",
        arabic: "مرحبا",
        transliteration: "marhaba updated",
        english: "Hello updated",
      };

      setResult(updatedSentence);

      const result = await SentenceService.updateSentence("sentence-123", {
        transliteration: "marhaba updated",
        english: "Hello updated",
      });

      expect(result).toEqual(updatedSentence);
      expect(mockFns.from).toHaveBeenCalledWith("sentences");
      expect(mockFns.update).toHaveBeenCalled();
      expect(mockFns.eq).toHaveBeenCalledWith("id", "sentence-123");
    });

    it("should return null on update error", async () => {
      setResult(null, { message: "Update failed" });

      const result = await SentenceService.updateSentence("sentence-123", {
        english: "Updated",
      });

      expect(result).toBeNull();
    });
  });

  describe("deleteSentence", () => {
    it("should delete a sentence successfully", async () => {
      setResult(null);

      const result = await SentenceService.deleteSentence("sentence-123");

      expect(result).toBe(true);
      expect(mockFns.from).toHaveBeenCalledWith("sentences");
      expect(mockFns.delete).toHaveBeenCalled();
      expect(mockFns.eq).toHaveBeenCalledWith("id", "sentence-123");
    });

    it("should return false on delete error", async () => {
      setResult(null, { message: "Delete failed" });

      const result = await SentenceService.deleteSentence("sentence-123");

      expect(result).toBe(false);
    });
  });

  describe("linkSentenceToWord", () => {
    it("should link a sentence to a word", async () => {
      setResult(null);

      const result = await SentenceService.linkSentenceToWord(
        "sentence-123",
        "word-456"
      );

      expect(result).toBe(true);
      expect(mockFns.from).toHaveBeenCalledWith("word_sentences");
      expect(mockFns.insert).toHaveBeenCalled();
    });

    it("should return false on link error", async () => {
      setResult(null, { message: "Link failed" });

      const result = await SentenceService.linkSentenceToWord(
        "sentence-123",
        "word-456"
      );

      expect(result).toBe(false);
    });
  });

  describe("unlinkSentenceFromWord", () => {
    it("should unlink a sentence from a word", async () => {
      setResult(null);

      const result = await SentenceService.unlinkSentenceFromWord(
        "sentence-123",
        "word-456"
      );

      expect(result).toBe(true);
      expect(mockFns.from).toHaveBeenCalledWith("word_sentences");
      expect(mockFns.delete).toHaveBeenCalled();
      expect(mockFns.eq).toHaveBeenCalledWith("word_id", "word-456");
      expect(mockFns.eq).toHaveBeenCalledWith("sentence_id", "sentence-123");
    });

    it("should return false on unlink error", async () => {
      setResult(null, { message: "Unlink failed" });

      const result = await SentenceService.unlinkSentenceFromWord(
        "sentence-123",
        "word-456"
      );

      expect(result).toBe(false);
    });
  });
});
