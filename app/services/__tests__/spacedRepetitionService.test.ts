import { describe, it, expect, beforeEach, vi } from "vitest";
import { calculateNextReview } from "../spacedRepetitionService";

describe("calculateNextReview", () => {
  beforeEach(() => {
    // Mock Date to have consistent test results
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
  });

  describe("first review (reviewCount = 0)", () => {
    it("should return 1 day interval on success (rating 2)", () => {
      const result = calculateNextReview(0, 2.5, 2, 0);
      expect(result.interval).toBe(1);
    });

    it("should return 1 day interval on good success (rating 3)", () => {
      const result = calculateNextReview(0, 2.5, 3, 0);
      expect(result.interval).toBe(1);
    });
  });

  describe("second review (reviewCount = 1)", () => {
    it("should return 6 day interval on success", () => {
      const result = calculateNextReview(1, 2.5, 2, 1);
      expect(result.interval).toBe(6);
    });
  });

  describe("subsequent reviews (reviewCount >= 2)", () => {
    it("should multiply interval by updated ease factor", () => {
      const result = calculateNextReview(6, 2.5, 2, 2);
      // Rating 2: easeFactor becomes 2.6, then 6 * 2.6 = 15.6, rounded = 16
      expect(result.interval).toBe(16);
    });

    it("should use ease factor for interval calculation", () => {
      const result = calculateNextReview(10, 2.0, 3, 3);
      // Rating 3 keeps ease factor at 2.0, so 10 * 2.0 = 20
      expect(result.interval).toBe(20);
    });
  });

  describe("failed reviews", () => {
    it("should return 6 hours (0.25 days) for 'Again' (rating 0)", () => {
      const result = calculateNextReview(10, 2.5, 0, 5);
      expect(result.interval).toBe(0.25);
    });

    it("should halve interval for 'Hard' (rating 1), minimum 0.5 days", () => {
      const result = calculateNextReview(10, 2.5, 1, 5);
      expect(result.interval).toBe(5); // 10 * 0.5 = 5
    });

    it("should enforce minimum 0.5 day interval for 'Hard'", () => {
      const result = calculateNextReview(0.5, 2.5, 1, 5);
      expect(result.interval).toBe(0.5);
    });
  });

  describe("ease factor adjustments", () => {
    it("should not go below 1.3", () => {
      // Multiple failed reviews shouldn't push ease below 1.3
      const result = calculateNextReview(1, 1.3, 2, 2);
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it("should not change ease factor on failed review", () => {
      const result = calculateNextReview(10, 2.5, 0, 5);
      expect(result.easeFactor).toBe(2.5);
    });

    it("should increase ease factor on rating 2", () => {
      const result = calculateNextReview(10, 2.5, 2, 5);
      // Rating 2: easeFactor = 2.5 + 0.1 = 2.6
      expect(result.easeFactor).toBe(2.6);
    });

    it("should keep ease factor same on rating 3", () => {
      const result = calculateNextReview(10, 2.5, 3, 5);
      // Rating 3: easeFactor = 2.5 + (0.1 - 0.1) = 2.5
      expect(result.easeFactor).toBe(2.5);
    });
  });

  describe("next review date calculation", () => {
    it("should set next review date based on interval", () => {
      const result = calculateNextReview(0, 2.5, 2, 0);
      const expectedDate = new Date("2024-01-16T12:00:00Z");
      expect(result.nextReviewDate.getTime()).toBe(expectedDate.getTime());
    });

    it("should handle fractional day intervals", () => {
      const result = calculateNextReview(10, 2.5, 0, 5);
      // 0.25 days = 6 hours from now
      const expectedDate = new Date("2024-01-15T18:00:00Z");
      expect(result.nextReviewDate.getTime()).toBe(expectedDate.getTime());
    });
  });
});
