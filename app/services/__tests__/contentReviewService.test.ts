import { describe, it, expect, beforeEach, vi } from "vitest";
import { createSupabaseMock } from "@/app/test-utils/supabaseMock";

// Create mock before importing service
const supabaseMock = createSupabaseMock();

vi.mock("@/utils/supabase/client", () => ({
  createClient: vi.fn(() => supabaseMock.mock),
}));

import { ContentReviewService } from "../contentReviewService";

// Test fixtures
const mockUser = { id: "user-1", email: "test@example.com" };

const mockWord = {
  id: "word-1",
  english: "Hello",
  arabic: "مرحبا",
  transliteration: "marhaba",
  type: "phrase" as const,
  pack_id: "pack-1",
  user_id: null,
  notes: null,
  reviewed_at: null,
  reviewed_by: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const mockSentence = {
  id: "sentence-1",
  arabic: "مرحبا، كيف حالك؟",
  transliteration: "marhaba, kif halak?",
  english: "Hello, how are you?",
  pack_id: "pack-1",
  user_id: null,
  reviewed_at: null,
  reviewed_by: null,
  created_at: "2024-01-01T00:00:00Z",
};

describe("ContentReviewService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMock.reset();
    supabaseMock.setUser(null);
  });

  describe("getWords", () => {
    it("should fetch unreviewed words by default", async () => {
      const mockWords = [mockWord];
      const mockWordSentences = [
        { word_id: "word-1", sentences: mockSentence },
      ];

      let callCount = 0;
      supabaseMock.mock.then = vi.fn((resolve) => {
        callCount++;
        if (callCount === 1) {
          resolve({ data: mockWords, error: null });
        } else {
          resolve({ data: mockWordSentences, error: null });
        }
      });

      const result = await ContentReviewService.getWords("pack-1");

      expect(supabaseMock.mock.from).toHaveBeenCalledWith("words");
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("pack_id", "pack-1");
      expect(supabaseMock.mock.is).toHaveBeenCalledWith("reviewed_at", null);
      expect(result).toHaveLength(1);
      expect(result[0].sentences).toHaveLength(1);
    });

    it("should fetch reviewed words when filter is 'reviewed'", async () => {
      supabaseMock.setResult([], null);

      await ContentReviewService.getWords("pack-1", "reviewed");

      expect(supabaseMock.mock.not).toHaveBeenCalledWith("reviewed_at", "is", null);
    });

    it("should fetch all words when filter is 'all'", async () => {
      supabaseMock.setResult([], null);

      await ContentReviewService.getWords("pack-1", "all");

      expect(supabaseMock.mock.is).not.toHaveBeenCalled();
      expect(supabaseMock.mock.not).not.toHaveBeenCalled();
    });

    it("should return empty array when no words found", async () => {
      supabaseMock.setResult([], null);

      const result = await ContentReviewService.getWords("pack-1");

      expect(result).toEqual([]);
    });

    it("should map sentences to words correctly", async () => {
      const mockWords = [
        mockWord,
        { ...mockWord, id: "word-2", english: "Goodbye" },
      ];
      const mockWordSentences = [
        { word_id: "word-1", sentences: mockSentence },
        { word_id: "word-1", sentences: { ...mockSentence, id: "sentence-2" } },
        { word_id: "word-2", sentences: { ...mockSentence, id: "sentence-3" } },
      ];

      let callCount = 0;
      supabaseMock.mock.then = vi.fn((resolve) => {
        callCount++;
        if (callCount === 1) {
          resolve({ data: mockWords, error: null });
        } else {
          resolve({ data: mockWordSentences, error: null });
        }
      });

      const result = await ContentReviewService.getWords("pack-1", "all");

      expect(result[0].sentences).toHaveLength(2);
      expect(result[1].sentences).toHaveLength(1);
    });

    it("should handle words without sentences", async () => {
      const mockWords = [mockWord];

      let callCount = 0;
      supabaseMock.mock.then = vi.fn((resolve) => {
        callCount++;
        if (callCount === 1) {
          resolve({ data: mockWords, error: null });
        } else {
          resolve({ data: [], error: null });
        }
      });

      const result = await ContentReviewService.getWords("pack-1");

      expect(result[0].sentences).toEqual([]);
    });

    it("should throw error on words fetch failure", async () => {
      supabaseMock.setResult(null, { message: "Database error" });

      await expect(ContentReviewService.getWords("pack-1")).rejects.toEqual({
        message: "Database error",
      });
    });

    it("should throw error on sentences fetch failure", async () => {
      const mockWords = [mockWord];

      let callCount = 0;
      supabaseMock.mock.then = vi.fn((resolve) => {
        callCount++;
        if (callCount === 1) {
          resolve({ data: mockWords, error: null });
        } else {
          resolve({ data: null, error: { message: "Sentences error" } });
        }
      });

      await expect(ContentReviewService.getWords("pack-1")).rejects.toEqual({
        message: "Sentences error",
      });
    });

    it("should order words by english", async () => {
      supabaseMock.setResult([], null);

      await ContentReviewService.getWords("pack-1");

      expect(supabaseMock.mock.order).toHaveBeenCalledWith("english");
    });
  });

  describe("getPackWordCount", () => {
    it("should return total and reviewed counts", async () => {
      let callCount = 0;
      supabaseMock.mock.then = vi.fn((resolve) => {
        callCount++;
        if (callCount === 1) {
          resolve({ count: 10, error: null });
        } else {
          resolve({ count: 7, error: null });
        }
      });

      const result = await ContentReviewService.getPackWordCount("pack-1");

      expect(result).toEqual({ total: 10, reviewed: 7 });
    });

    it("should return zero when no words", async () => {
      supabaseMock.mock.then = vi.fn((resolve) => {
        resolve({ count: null, error: null });
      });

      const result = await ContentReviewService.getPackWordCount("pack-1");

      expect(result).toEqual({ total: 0, reviewed: 0 });
    });

    it("should use head: true for count queries", async () => {
      supabaseMock.mock.then = vi.fn((resolve) => {
        resolve({ count: 5, error: null });
      });

      await ContentReviewService.getPackWordCount("pack-1");

      expect(supabaseMock.mock.select).toHaveBeenCalledWith("*", {
        count: "exact",
        head: true,
      });
    });

    it("should throw error on total count failure", async () => {
      supabaseMock.mock.then = vi.fn((resolve) => {
        resolve({ count: null, error: { message: "Count error" } });
      });

      await expect(ContentReviewService.getPackWordCount("pack-1")).rejects.toEqual({
        message: "Count error",
      });
    });
  });

  describe("approveWord", () => {
    it("should mark word as reviewed with user id", async () => {
      supabaseMock.setUser(mockUser);
      supabaseMock.setResult(null, null);

      await ContentReviewService.approveWord("word-1");

      expect(supabaseMock.mock.update).toHaveBeenCalledWith({
        reviewed_at: expect.any(String),
        reviewed_by: "user-1",
      });
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("id", "word-1");
    });

    it("should throw error when not authenticated", async () => {
      supabaseMock.setUser(null);

      await expect(ContentReviewService.approveWord("word-1")).rejects.toThrow(
        "Not authenticated"
      );
    });

    it("should throw error on update failure", async () => {
      supabaseMock.setUser(mockUser);
      supabaseMock.setResult(null, { message: "Update error" });

      await expect(ContentReviewService.approveWord("word-1")).rejects.toEqual({
        message: "Update error",
      });
    });
  });

  describe("unapproveWord", () => {
    it("should clear reviewed status", async () => {
      supabaseMock.setResult(null, null);

      await ContentReviewService.unapproveWord("word-1");

      expect(supabaseMock.mock.update).toHaveBeenCalledWith({
        reviewed_at: null,
        reviewed_by: null,
      });
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("id", "word-1");
    });

    it("should throw error on update failure", async () => {
      supabaseMock.setResult(null, { message: "Update error" });

      await expect(ContentReviewService.unapproveWord("word-1")).rejects.toEqual({
        message: "Update error",
      });
    });
  });

  describe("approveSentence", () => {
    it("should mark sentence as reviewed with user id", async () => {
      supabaseMock.setUser(mockUser);
      supabaseMock.setResult(null, null);

      await ContentReviewService.approveSentence("sentence-1");

      expect(supabaseMock.mock.from).toHaveBeenCalledWith("sentences");
      expect(supabaseMock.mock.update).toHaveBeenCalledWith({
        reviewed_at: expect.any(String),
        reviewed_by: "user-1",
      });
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("id", "sentence-1");
    });

    it("should throw error when not authenticated", async () => {
      supabaseMock.setUser(null);

      await expect(ContentReviewService.approveSentence("sentence-1")).rejects.toThrow(
        "Not authenticated"
      );
    });

    it("should throw error on update failure", async () => {
      supabaseMock.setUser(mockUser);
      supabaseMock.setResult(null, { message: "Update error" });

      await expect(ContentReviewService.approveSentence("sentence-1")).rejects.toEqual({
        message: "Update error",
      });
    });
  });

  describe("unapproveSentence", () => {
    it("should clear sentence reviewed status", async () => {
      supabaseMock.setResult(null, null);

      await ContentReviewService.unapproveSentence("sentence-1");

      expect(supabaseMock.mock.from).toHaveBeenCalledWith("sentences");
      expect(supabaseMock.mock.update).toHaveBeenCalledWith({
        reviewed_at: null,
        reviewed_by: null,
      });
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("id", "sentence-1");
    });

    it("should throw error on update failure", async () => {
      supabaseMock.setResult(null, { message: "Update error" });

      await expect(ContentReviewService.unapproveSentence("sentence-1")).rejects.toEqual({
        message: "Update error",
      });
    });
  });

  describe("updateWord", () => {
    it("should update word fields", async () => {
      const updatedWord = { ...mockWord, english: "Hi" };
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: updatedWord, error: null })
      );

      const result = await ContentReviewService.updateWord("word-1", {
        english: "Hi",
      });

      expect(supabaseMock.mock.from).toHaveBeenCalledWith("words");
      expect(supabaseMock.mock.update).toHaveBeenCalledWith({ english: "Hi" });
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("id", "word-1");
      expect(result.english).toBe("Hi");
    });

    it("should update multiple fields", async () => {
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: mockWord, error: null })
      );

      await ContentReviewService.updateWord("word-1", {
        arabic: "سلام",
        transliteration: "salam",
        english: "Peace",
        type: "noun",
        notes: "Common greeting",
      });

      expect(supabaseMock.mock.update).toHaveBeenCalledWith({
        arabic: "سلام",
        transliteration: "salam",
        english: "Peace",
        type: "noun",
        notes: "Common greeting",
      });
    });

    it("should throw error on update failure", async () => {
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: null, error: { message: "Not found" } })
      );

      await expect(
        ContentReviewService.updateWord("invalid", { english: "Test" })
      ).rejects.toEqual({ message: "Not found" });
    });
  });

  describe("updateAndApproveWord", () => {
    it("should update and approve word in one operation", async () => {
      supabaseMock.setUser(mockUser);
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({
          data: { ...mockWord, english: "Hi", reviewed_at: "2024-01-01", reviewed_by: "user-1" },
          error: null,
        })
      );

      const result = await ContentReviewService.updateAndApproveWord("word-1", {
        english: "Hi",
      });

      expect(supabaseMock.mock.update).toHaveBeenCalledWith({
        english: "Hi",
        reviewed_at: expect.any(String),
        reviewed_by: "user-1",
      });
      expect(result.reviewed_by).toBe("user-1");
    });

    it("should throw error when not authenticated", async () => {
      supabaseMock.setUser(null);

      await expect(
        ContentReviewService.updateAndApproveWord("word-1", { english: "Hi" })
      ).rejects.toThrow("Not authenticated");
    });

    it("should throw error on update failure", async () => {
      supabaseMock.setUser(mockUser);
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: null, error: { message: "Update error" } })
      );

      await expect(
        ContentReviewService.updateAndApproveWord("word-1", { english: "Hi" })
      ).rejects.toEqual({ message: "Update error" });
    });
  });

  describe("updateSentence", () => {
    it("should update sentence fields", async () => {
      const updatedSentence = { ...mockSentence, english: "Updated" };
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: updatedSentence, error: null })
      );

      const result = await ContentReviewService.updateSentence("sentence-1", {
        english: "Updated",
      });

      expect(supabaseMock.mock.from).toHaveBeenCalledWith("sentences");
      expect(supabaseMock.mock.update).toHaveBeenCalledWith({ english: "Updated" });
      expect(result.english).toBe("Updated");
    });

    it("should update multiple fields", async () => {
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: mockSentence, error: null })
      );

      await ContentReviewService.updateSentence("sentence-1", {
        arabic: "سلام",
        transliteration: "salam",
        english: "Peace",
      });

      expect(supabaseMock.mock.update).toHaveBeenCalledWith({
        arabic: "سلام",
        transliteration: "salam",
        english: "Peace",
      });
    });

    it("should throw error on update failure", async () => {
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: null, error: { message: "Not found" } })
      );

      await expect(
        ContentReviewService.updateSentence("invalid", { english: "Test" })
      ).rejects.toEqual({ message: "Not found" });
    });
  });

  describe("updateAndApproveSentence", () => {
    it("should update and approve sentence in one operation", async () => {
      supabaseMock.setUser(mockUser);
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({
          data: { ...mockSentence, english: "Hi", reviewed_at: "2024-01-01", reviewed_by: "user-1" },
          error: null,
        })
      );

      const result = await ContentReviewService.updateAndApproveSentence("sentence-1", {
        english: "Hi",
      });

      expect(supabaseMock.mock.from).toHaveBeenCalledWith("sentences");
      expect(supabaseMock.mock.update).toHaveBeenCalledWith({
        english: "Hi",
        reviewed_at: expect.any(String),
        reviewed_by: "user-1",
      });
      expect(result.reviewed_by).toBe("user-1");
    });

    it("should throw error when not authenticated", async () => {
      supabaseMock.setUser(null);

      await expect(
        ContentReviewService.updateAndApproveSentence("sentence-1", { english: "Hi" })
      ).rejects.toThrow("Not authenticated");
    });

    it("should throw error on update failure", async () => {
      supabaseMock.setUser(mockUser);
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: null, error: { message: "Update error" } })
      );

      await expect(
        ContentReviewService.updateAndApproveSentence("sentence-1", { english: "Hi" })
      ).rejects.toEqual({ message: "Update error" });
    });
  });

  describe("getReviewStats", () => {
    it("should return all review stats", async () => {
      let callCount = 0;
      supabaseMock.mock.then = vi.fn((resolve) => {
        callCount++;
        switch (callCount) {
          case 1:
            resolve({ count: 100, error: null }); // totalWords
            break;
          case 2:
            resolve({ count: 75, error: null }); // reviewedWords
            break;
          case 3:
            resolve({ count: 50, error: null }); // totalSentences
            break;
          case 4:
            resolve({ count: 40, error: null }); // reviewedSentences
            break;
        }
      });

      const result = await ContentReviewService.getReviewStats("pack-1");

      expect(result).toEqual({
        totalWords: 100,
        reviewedWords: 75,
        totalSentences: 50,
        reviewedSentences: 40,
      });
    });

    it("should handle null counts as zero", async () => {
      supabaseMock.mock.then = vi.fn((resolve) => {
        resolve({ count: null, error: null });
      });

      const result = await ContentReviewService.getReviewStats("pack-1");

      expect(result).toEqual({
        totalWords: 0,
        reviewedWords: 0,
        totalSentences: 0,
        reviewedSentences: 0,
      });
    });

    it("should query both words and sentences tables", async () => {
      supabaseMock.mock.then = vi.fn((resolve) => {
        resolve({ count: 0, error: null });
      });

      await ContentReviewService.getReviewStats("pack-1");

      expect(supabaseMock.mock.from).toHaveBeenCalledWith("words");
      expect(supabaseMock.mock.from).toHaveBeenCalledWith("sentences");
    });

    it("should filter by pack_id for all queries", async () => {
      supabaseMock.mock.then = vi.fn((resolve) => {
        resolve({ count: 0, error: null });
      });

      await ContentReviewService.getReviewStats("pack-1");

      // Should be called 4 times (once per count query)
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("pack_id", "pack-1");
    });
  });
});
