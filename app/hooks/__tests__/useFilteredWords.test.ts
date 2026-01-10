import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFilteredWords } from "../useFilteredWords";
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

describe("useFilteredWords", () => {
  const mockWords: Word[] = [
    createMockWord({ id: "1", english: "hello", arabic: "مرحبا", transliteration: "marhaba" }),
    createMockWord({ id: "2", english: "goodbye", arabic: "مع السلامة", transliteration: "ma'a salama" }),
    createMockWord({ id: "3", english: "thank you", arabic: "شكرا", transliteration: "shukran" }),
    createMockWord({ id: "4", english: "please", arabic: "من فضلك", transliteration: "min fadlak" }),
  ];

  describe("without search term", () => {
    it("should return all words sorted alphabetically by english", () => {
      const { result } = renderHook(() =>
        useFilteredWords({ words: mockWords, searchTerm: "" })
      );

      expect(result.current).toHaveLength(4);
      expect(result.current.map((w) => w.english)).toEqual([
        "goodbye",
        "hello",
        "please",
        "thank you",
      ]);
    });

    it("should return empty array for empty words", () => {
      const { result } = renderHook(() =>
        useFilteredWords({ words: [], searchTerm: "" })
      );

      expect(result.current).toEqual([]);
    });
  });

  describe("searching by english", () => {
    it("should filter by english word", () => {
      const { result } = renderHook(() =>
        useFilteredWords({ words: mockWords, searchTerm: "hello" })
      );

      expect(result.current).toHaveLength(1);
      expect(result.current[0].english).toBe("hello");
    });

    it("should be case insensitive", () => {
      const { result } = renderHook(() =>
        useFilteredWords({ words: mockWords, searchTerm: "HELLO" })
      );

      expect(result.current).toHaveLength(1);
      expect(result.current[0].english).toBe("hello");
    });

    it("should match partial words", () => {
      const { result } = renderHook(() =>
        useFilteredWords({ words: mockWords, searchTerm: "good" })
      );

      expect(result.current).toHaveLength(1);
      expect(result.current[0].english).toBe("goodbye");
    });
  });

  describe("searching by arabic", () => {
    it("should filter by arabic text", () => {
      const { result } = renderHook(() =>
        useFilteredWords({ words: mockWords, searchTerm: "شكرا" })
      );

      expect(result.current).toHaveLength(1);
      expect(result.current[0].english).toBe("thank you");
    });

    it("should match partial arabic", () => {
      const { result } = renderHook(() =>
        useFilteredWords({ words: mockWords, searchTerm: "مرحب" })
      );

      expect(result.current).toHaveLength(1);
      expect(result.current[0].english).toBe("hello");
    });
  });

  describe("searching by transliteration", () => {
    it("should filter by transliteration", () => {
      const { result } = renderHook(() =>
        useFilteredWords({ words: mockWords, searchTerm: "shukran" })
      );

      expect(result.current).toHaveLength(1);
      expect(result.current[0].english).toBe("thank you");
    });

    it("should be case insensitive for transliteration", () => {
      const { result } = renderHook(() =>
        useFilteredWords({ words: mockWords, searchTerm: "MARHABA" })
      );

      expect(result.current).toHaveLength(1);
      expect(result.current[0].english).toBe("hello");
    });
  });

  describe("multiple matches", () => {
    it("should return multiple matches sorted alphabetically", () => {
      const words = [
        createMockWord({ id: "1", english: "apple", transliteration: "tuffaha" }),
        createMockWord({ id: "2", english: "banana", transliteration: "mawza" }),
        createMockWord({ id: "3", english: "apricot", transliteration: "mishmish" }),
      ];

      const { result } = renderHook(() =>
        useFilteredWords({ words, searchTerm: "ap" })
      );

      expect(result.current).toHaveLength(2);
      expect(result.current.map((w) => w.english)).toEqual(["apple", "apricot"]);
    });
  });

  describe("no matches", () => {
    it("should return empty array when no matches found", () => {
      const { result } = renderHook(() =>
        useFilteredWords({ words: mockWords, searchTerm: "xyz123" })
      );

      expect(result.current).toEqual([]);
    });
  });
});
