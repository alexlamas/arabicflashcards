import { describe, it, expect, beforeEach, vi } from "vitest";
import { createSupabaseMock } from "@/app/test-utils/supabaseMock";

// Create the mock outside vi.mock - it will be hoisted but the reference is stable
const supabaseMock = createSupabaseMock();

// Mock the createClient import
vi.mock("@/utils/supabase/client", () => ({
  createClient: vi.fn(() => supabaseMock.mock),
}));

import { PackService, slugifyPackName } from "../packService";

describe("packService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("slugifyPackName", () => {
    it("should convert to lowercase", () => {
      expect(slugifyPackName("Hello World")).toBe("hello-world");
    });

    it("should replace spaces with hyphens", () => {
      expect(slugifyPackName("basic greetings")).toBe("basic-greetings");
    });

    it("should replace multiple spaces with single hyphen", () => {
      expect(slugifyPackName("hello   world")).toBe("hello-world");
    });

    it("should remove special characters", () => {
      expect(slugifyPackName("greetings & phrases!")).toBe("greetings-phrases");
    });

    it("should remove leading and trailing hyphens", () => {
      expect(slugifyPackName("---hello---")).toBe("hello");
      expect(slugifyPackName("  hello  ")).toBe("hello");
    });

    it("should handle numbers", () => {
      expect(slugifyPackName("Level 1 Words")).toBe("level-1-words");
    });

    it("should handle arabic text by removing it", () => {
      expect(slugifyPackName("Greetings مرحبا")).toBe("greetings");
    });

    it("should return empty string for only special characters", () => {
      expect(slugifyPackName("!@#$%^&*()")).toBe("");
    });
  });

  describe("getAvailablePacks", () => {
    it("should return active packs ordered by level and name", async () => {
      const mockPacks = [
        {
          id: "pack-1",
          name: "Basic Greetings",
          description: "Common greetings",
          language: "lebanese-arabic",
          level: "beginner",
          icon: null,
          image_url: null,
          is_active: true,
          created_at: "2024-01-01",
          updated_at: "2024-01-01",
        },
        {
          id: "pack-2",
          name: "Numbers",
          description: "Numbers 1-10",
          language: "lebanese-arabic",
          level: "beginner",
          icon: null,
          image_url: null,
          is_active: true,
          created_at: "2024-01-01",
          updated_at: "2024-01-01",
        },
      ];

      supabaseMock.setResult(mockPacks);

      const packs = await PackService.getAvailablePacks();

      expect(packs).toEqual(mockPacks);
      expect(supabaseMock.mock.from).toHaveBeenCalledWith("packs");
      expect(supabaseMock.mock.select).toHaveBeenCalledWith("*");
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("is_active", true);
    });

    it("should return empty array when no packs", async () => {
      supabaseMock.setResult(null);

      const packs = await PackService.getAvailablePacks();

      expect(packs).toEqual([]);
    });

    it("should throw error on database error", async () => {
      supabaseMock.setResult(null, { message: "Database error" });

      await expect(PackService.getAvailablePacks()).rejects.toEqual({
        message: "Database error",
      });
    });
  });

  describe("getPackWordCounts", () => {
    it("should count words per pack", async () => {
      const mockWords = [
        { pack_id: "pack-1" },
        { pack_id: "pack-1" },
        { pack_id: "pack-1" },
        { pack_id: "pack-2" },
        { pack_id: "pack-2" },
      ];

      supabaseMock.setResult(mockWords);

      const counts = await PackService.getPackWordCounts();

      expect(counts).toEqual({
        "pack-1": 3,
        "pack-2": 2,
      });
    });

    it("should return empty object when no pack words", async () => {
      supabaseMock.setResult([]);

      const counts = await PackService.getPackWordCounts();

      expect(counts).toEqual({});
    });

    it("should handle null data response", async () => {
      supabaseMock.setResult(null);

      const counts = await PackService.getPackWordCounts();

      expect(counts).toEqual({});
    });

    it("should skip null pack_id entries", async () => {
      const mockWords = [
        { pack_id: "pack-1" },
        { pack_id: null },
        { pack_id: "pack-1" },
      ];

      supabaseMock.setResult(mockWords);

      const counts = await PackService.getPackWordCounts();

      expect(counts).toEqual({
        "pack-1": 2,
      });
    });
  });

  describe("searchPackWords", () => {
    it("should return empty array for short queries", async () => {
      const results = await PackService.searchPackWords("a");
      expect(results).toEqual([]);
    });

    it("should return empty array for empty query", async () => {
      const results = await PackService.searchPackWords("");
      expect(results).toEqual([]);
    });

    it("should search pack words by query", async () => {
      const mockWords = [
        {
          id: "word-1",
          pack_id: "pack-1",
          arabic: "مرحبا",
          english: "hello",
          transliteration: "marhaba",
          type: "phrase",
          notes: null,
          created_at: "2024-01-01",
        },
      ];

      supabaseMock.setResult(mockWords);

      const results = await PackService.searchPackWords("hello");

      expect(results).toEqual(mockWords);
      expect(supabaseMock.mock.from).toHaveBeenCalledWith("words");
      expect(supabaseMock.mock.limit).toHaveBeenCalledWith(5);
    });

    it("should respect custom limit parameter", async () => {
      supabaseMock.setResult([]);

      await PackService.searchPackWords("hello", 10);

      expect(supabaseMock.mock.limit).toHaveBeenCalledWith(10);
    });
  });
});
