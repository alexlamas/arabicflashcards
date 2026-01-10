import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { SpacedRepetitionService } from "../spacedRepetitionService";

// Create mock functions that we can control
const mockGetOnlineStatus = vi.fn(() => true);
const mockGetWords = vi.fn(() => []);

// Mock dependencies before imports
vi.mock("../../utils/connectivity", () => ({
  getOnlineStatus: () => mockGetOnlineStatus(),
}));

vi.mock("../offlineStorage", () => ({
  OfflineStorage: {
    getWords: () => mockGetWords(),
  },
}));

// Mock Supabase with controllable results
let mockSelectResult: { data: unknown; error: unknown; count?: number } = { data: null, error: null };
let mockUpsertResult: { data: unknown; error: unknown } = { data: null, error: null };
let mockMaybeSingleResult: { data: unknown; error: unknown } = { data: null, error: null };

// Create a thenable chain that resolves to the select result
function createThenableChain(): unknown {
  const chain: Record<string, unknown> = {};

  // All chainable methods return the chain
  const chainableMethods = ['from', 'select', 'eq', 'in', 'lte', 'gte', 'lt', 'order', 'limit', 'insert', 'update'];
  chainableMethods.forEach(method => {
    chain[method] = vi.fn(() => chain);
  });

  // upsert resolves to upsertResult
  chain.upsert = vi.fn(() => {
    const upsertChain = { ...chain };
    (upsertChain as unknown as PromiseLike<typeof mockUpsertResult>).then = (
      resolve: (value: typeof mockUpsertResult) => void
    ) => {
      resolve(mockUpsertResult);
      return upsertChain as unknown as PromiseLike<typeof mockUpsertResult>;
    };
    return upsertChain;
  });

  // maybeSingle returns a promise
  chain.maybeSingle = vi.fn(() => Promise.resolve(mockMaybeSingleResult));
  chain.single = vi.fn(() => Promise.resolve(mockSelectResult));

  // Make the chain itself thenable (for await on .select().eq()... chains)
  (chain as unknown as PromiseLike<typeof mockSelectResult>).then = (
    resolve: (value: typeof mockSelectResult) => void
  ) => {
    resolve(mockSelectResult);
    return chain as unknown as PromiseLike<typeof mockSelectResult>;
  };

  return chain;
}

const mockSupabase = createThenableChain();

vi.mock("@/utils/supabase/client", () => ({
  createClient: () => mockSupabase,
}));

describe("SpacedRepetitionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectResult = { data: null, error: null };
    mockUpsertResult = { data: null, error: null };
    mockMaybeSingleResult = { data: null, error: null };
    mockGetOnlineStatus.mockReturnValue(true);
    mockGetWords.mockReturnValue([]);
  });

  describe("startLearning", () => {
    it("should upsert word_progress and return success", async () => {
      mockUpsertResult = { data: null, error: null };
      mockSelectResult = { data: null, error: null, count: 5 };

      const result = await SpacedRepetitionService.startLearning("user-1", "word-1");

      expect((mockSupabase as { from: Mock }).from).toHaveBeenCalledWith("word_progress");
      expect((mockSupabase as { upsert: Mock }).upsert).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(typeof result.count).toBe("number");
    });

    it("should throw on database error", async () => {
      mockUpsertResult = { data: null, error: { message: "DB error" } };

      await expect(
        SpacedRepetitionService.startLearning("user-1", "word-1")
      ).rejects.toEqual({ message: "DB error" });
    });
  });

  describe("getDueWords", () => {
    it("should return due words from database when online", async () => {
      const mockWords = [
        { word_id: "1", next_review_date: "2024-01-15", words: { id: "1", english: "hello", arabic: "مرحبا" } },
        { word_id: "2", next_review_date: "2024-01-14", words: { id: "2", english: "goodbye", arabic: "مع السلامة" } },
      ];
      mockSelectResult = { data: mockWords, error: null };

      const result = await SpacedRepetitionService.getDueWords("user-1", 20);

      expect((mockSupabase as { from: Mock }).from).toHaveBeenCalledWith("word_progress");
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("word_id", "1");
    });

    it("should return empty array when no due words", async () => {
      mockSelectResult = { data: [], error: null };

      const result = await SpacedRepetitionService.getDueWords("user-1");

      expect(result).toEqual([]);
    });

    it("should use offline cache when offline", async () => {
      mockGetOnlineStatus.mockReturnValue(false);
      mockGetWords.mockReturnValue([]);

      const result = await SpacedRepetitionService.getDueWords("user-1");

      expect(result).toEqual([]);
    });

    it("should fallback to offline cache on error", async () => {
      mockGetOnlineStatus.mockReturnValue(true);
      mockSelectResult = { data: null, error: { message: "Network error" } };
      mockGetWords.mockReturnValue([]);

      const result = await SpacedRepetitionService.getDueWords("user-1");

      expect(result).toEqual([]);
    });
  });

  describe("getDueWordsCount", () => {
    it("should return count from database when online", async () => {
      mockSelectResult = { data: null, error: null, count: 5 };

      const result = await SpacedRepetitionService.getDueWordsCount("user-1");

      expect(result).toBe(5);
    });

    it("should return 0 when count is null", async () => {
      mockSelectResult = { data: null, error: null, count: undefined };

      const result = await SpacedRepetitionService.getDueWordsCount("user-1");

      expect(result).toBe(0);
    });

    it("should use offline cache when offline", async () => {
      mockGetOnlineStatus.mockReturnValue(false);
      mockGetWords.mockReturnValue([]);

      const result = await SpacedRepetitionService.getDueWordsCount("user-1");

      expect(result).toBe(0);
    });
  });

  describe("processReview", () => {
    it("should update progress with correct next review", async () => {
      mockMaybeSingleResult = {
        data: { interval: 1, ease_factor: 2.5, review_count: 1 },
        error: null,
      };
      mockUpsertResult = { data: null, error: null };

      const result = await SpacedRepetitionService.processReview("user-1", "word-1", 2);

      expect((mockSupabase as { from: Mock }).from).toHaveBeenCalledWith("word_progress");
      expect(result.status).toBe("learned");
      expect(result.nextReview).toBeInstanceOf(Date);
    });

    it("should set status to learning when rating < 2", async () => {
      mockMaybeSingleResult = {
        data: { interval: 1, ease_factor: 2.5, review_count: 1 },
        error: null,
      };
      mockUpsertResult = { data: null, error: null };

      const result = await SpacedRepetitionService.processReview("user-1", "word-1", 1);

      expect(result.status).toBe("learning");
    });

    it("should use default values for new word", async () => {
      mockMaybeSingleResult = {
        data: null,
        error: null,
      };
      mockUpsertResult = { data: null, error: null };

      const result = await SpacedRepetitionService.processReview("user-1", "word-1", 3);

      expect(result.status).toBe("learned");
    });

    it("should throw on fetch error", async () => {
      mockMaybeSingleResult = {
        data: null,
        error: { message: "Fetch error" },
      };

      await expect(
        SpacedRepetitionService.processReview("user-1", "word-1", 2)
      ).rejects.toEqual({ message: "Fetch error" });
    });
  });

  describe("getStreak", () => {
    it("should return 0 when no review data", async () => {
      mockSelectResult = { data: [], error: null };

      const result = await SpacedRepetitionService.getStreak("user-1");

      expect(result).toBe(0);
    });

    it("should return 0 on error", async () => {
      mockSelectResult = { data: null, error: { message: "Error" } };

      const result = await SpacedRepetitionService.getStreak("user-1");

      expect(result).toBe(0);
    });

    it("should count consecutive days starting from today", async () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);

      mockSelectResult = {
        data: [
          { updated_at: today.toISOString() },
          { updated_at: yesterday.toISOString() },
          { updated_at: twoDaysAgo.toISOString() },
        ],
        error: null,
      };

      const result = await SpacedRepetitionService.getStreak("user-1");

      expect(result).toBeGreaterThanOrEqual(1);
    });

    it("should return 0 if most recent review is not today or yesterday", async () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

      mockSelectResult = {
        data: [{ updated_at: threeDaysAgo.toISOString() }],
        error: null,
      };

      const result = await SpacedRepetitionService.getStreak("user-1");

      expect(result).toBe(0);
    });
  });

  describe("getWeeklyReviewStats", () => {
    it("should return this week and last week counts", async () => {
      // Track call count to return different results for each select call
      let selectCallCount = 0;
      ((mockSupabase as { select: Mock }).select as Mock).mockImplementation(() => {
        const result = selectCallCount === 0
          ? { data: null, error: null, count: 10 }
          : { data: null, error: null, count: 5 };
        selectCallCount++;

        const chain: Record<string, unknown> = {};
        const chainableMethods = ['eq', 'in', 'lte', 'gte', 'lt', 'order', 'limit'];
        chainableMethods.forEach(method => {
          chain[method] = vi.fn(() => chain);
        });

        (chain as unknown as PromiseLike<typeof result>).then = (
          resolve: (value: typeof result) => void
        ) => {
          resolve(result);
          return chain as unknown as PromiseLike<typeof result>;
        };
        return chain;
      });

      const result = await SpacedRepetitionService.getWeeklyReviewStats("user-1");

      expect(result).toEqual({ thisWeek: 10, lastWeek: 5 });
    });

    it("should return zeros on error", async () => {
      // Reset the select mock to use the default behavior
      ((mockSupabase as { select: Mock }).select as Mock).mockImplementation(() => {
        const chain: Record<string, unknown> = {};
        const chainableMethods = ['eq', 'in', 'lte', 'gte', 'lt', 'order', 'limit'];
        chainableMethods.forEach(method => {
          chain[method] = vi.fn(() => chain);
        });

        (chain as unknown as PromiseLike<typeof mockSelectResult>).then = (
          resolve: (value: typeof mockSelectResult) => void
        ) => {
          resolve(mockSelectResult);
          return chain as unknown as PromiseLike<typeof mockSelectResult>;
        };
        return chain;
      });

      mockSelectResult = { data: null, error: { message: "Error" } };

      const result = await SpacedRepetitionService.getWeeklyReviewStats("user-1");

      expect(result).toEqual({ thisWeek: 0, lastWeek: 0 });
    });
  });
});
