import { describe, it, expect, beforeEach, vi } from "vitest";
import { calculateDueWords, countDueWords } from "../dueWordsCalculator";
import type { Word } from "../../types/word";

// Helper to create mock words
function createMockWord(overrides: Partial<Word> = {}): Word {
  return {
    id: "test-id",
    arabic: "مرحبا",
    english: "hello",
    transliteration: "marhaba",
    type: "phrase",
    status: "learning",
    next_review_date: null,
    ...overrides,
  } as Word;
}

describe("calculateDueWords", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
  });

  describe("basic filtering", () => {
    it("should return empty array for empty input", () => {
      expect(calculateDueWords([])).toEqual([]);
    });

    it("should return empty array for non-array input", () => {
      expect(calculateDueWords(null as unknown as Word[])).toEqual([]);
      expect(calculateDueWords(undefined as unknown as Word[])).toEqual([]);
    });

    it("should exclude words with status 'new'", () => {
      const words = [createMockWord({ status: "new", next_review_date: "2024-01-14T12:00:00Z" })];
      expect(calculateDueWords(words)).toEqual([]);
    });

    it("should exclude words without next_review_date", () => {
      const words = [createMockWord({ status: "learning", next_review_date: null })];
      expect(calculateDueWords(words)).toEqual([]);
    });

    it("should exclude words with invalid dates", () => {
      const words = [createMockWord({ status: "learning", next_review_date: "invalid-date" })];
      expect(calculateDueWords(words)).toEqual([]);
    });
  });

  describe("due date filtering", () => {
    it("should include words with past review dates", () => {
      const words = [
        createMockWord({ id: "1", status: "learning", next_review_date: "2024-01-14T12:00:00Z" }),
      ];
      const result = calculateDueWords(words);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("should include words due today", () => {
      const words = [
        createMockWord({ id: "1", status: "learning", next_review_date: "2024-01-15T10:00:00Z" }),
      ];
      const result = calculateDueWords(words);
      expect(result).toHaveLength(1);
    });

    it("should exclude words with future review dates", () => {
      const words = [
        createMockWord({ id: "1", status: "learning", next_review_date: "2024-01-16T12:00:00Z" }),
      ];
      expect(calculateDueWords(words)).toEqual([]);
    });

    it("should include both learning and learned words", () => {
      const words = [
        createMockWord({ id: "1", status: "learning", next_review_date: "2024-01-14T12:00:00Z" }),
        createMockWord({ id: "2", status: "learned", next_review_date: "2024-01-13T12:00:00Z" }),
      ];
      const result = calculateDueWords(words);
      expect(result).toHaveLength(2);
    });
  });

  describe("sorting", () => {
    it("should sort by next_review_date ascending (earliest first)", () => {
      const words = [
        createMockWord({ id: "newer", status: "learning", next_review_date: "2024-01-14T12:00:00Z" }),
        createMockWord({ id: "older", status: "learning", next_review_date: "2024-01-10T12:00:00Z" }),
        createMockWord({ id: "middle", status: "learning", next_review_date: "2024-01-12T12:00:00Z" }),
      ];
      const result = calculateDueWords(words);
      expect(result.map((w) => w.id)).toEqual(["older", "middle", "newer"]);
    });
  });

  describe("limit parameter", () => {
    it("should limit results when limit is provided", () => {
      const words = [
        createMockWord({ id: "1", status: "learning", next_review_date: "2024-01-10T12:00:00Z" }),
        createMockWord({ id: "2", status: "learning", next_review_date: "2024-01-11T12:00:00Z" }),
        createMockWord({ id: "3", status: "learning", next_review_date: "2024-01-12T12:00:00Z" }),
      ];
      const result = calculateDueWords(words, 2);
      expect(result).toHaveLength(2);
      expect(result.map((w) => w.id)).toEqual(["1", "2"]);
    });

    it("should return all results when limit exceeds count", () => {
      const words = [
        createMockWord({ id: "1", status: "learning", next_review_date: "2024-01-14T12:00:00Z" }),
      ];
      const result = calculateDueWords(words, 10);
      expect(result).toHaveLength(1);
    });

    it("should return all results when limit is 0", () => {
      const words = [
        createMockWord({ id: "1", status: "learning", next_review_date: "2024-01-14T12:00:00Z" }),
        createMockWord({ id: "2", status: "learning", next_review_date: "2024-01-13T12:00:00Z" }),
      ];
      const result = calculateDueWords(words, 0);
      expect(result).toHaveLength(2);
    });
  });
});

describe("countDueWords", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
  });

  it("should return 0 for empty array", () => {
    expect(countDueWords([])).toBe(0);
  });

  it("should return count of due words", () => {
    const words = [
      createMockWord({ id: "1", status: "learning", next_review_date: "2024-01-14T12:00:00Z" }),
      createMockWord({ id: "2", status: "learning", next_review_date: "2024-01-13T12:00:00Z" }),
      createMockWord({ id: "3", status: "learning", next_review_date: "2024-01-20T12:00:00Z" }), // future
    ];
    expect(countDueWords(words)).toBe(2);
  });
});
