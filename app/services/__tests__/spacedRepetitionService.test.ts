import { describe, it, expect, beforeEach, vi } from "vitest";
import { calculateNextReview } from "../spacedRepetitionService";

describe("calculateNextReview", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
  });

  describe("first review (reviewCount = 0)", () => {
    it("should return 1 day for Remembered", () => {
      const result = calculateNextReview(0, 2.5, 2, 0);
      expect(result.interval).toBe(1);
    });

    it("should return ~1.3 days for Easy (1 day * 1.3 bonus)", () => {
      const result = calculateNextReview(0, 2.5, 3, 0);
      expect(result.interval).toBe(1); // round(1 * 1.3) = 1
    });
  });

  describe("second review (reviewCount = 1)", () => {
    it("should return 3 days for Remembered", () => {
      const result = calculateNextReview(1, 2.5, 2, 1);
      expect(result.interval).toBe(3);
    });

    it("should return 4 days for Easy (3 days * 1.3 bonus)", () => {
      const result = calculateNextReview(1, 2.5, 3, 1);
      expect(result.interval).toBe(4); // round(3 * 1.3) = 4
    });
  });

  describe("subsequent reviews (reviewCount >= 2)", () => {
    it("should multiply interval by ease factor for Remembered", () => {
      const result = calculateNextReview(3, 2.5, 2, 2);
      // 3 * 2.5 = 7.5, rounded = 8
      expect(result.interval).toBe(8);
    });

    it("should give bonus multiplier for Easy", () => {
      const result = calculateNextReview(3, 2.5, 3, 2);
      // 3 * 2.65 (increased EF) = 7.95, rounded = 8, then * 1.3 = 10.4, rounded = 10
      expect(result.interval).toBe(10);
    });
  });

  describe("failed reviews", () => {
    it("should return ~10 minutes for Forgot", () => {
      const result = calculateNextReview(10, 2.5, 0, 5);
      expect(result.interval).toBeCloseTo(1 / 144, 3); // ~10 minutes
    });

    it("should return at least 1 hour for Struggled", () => {
      const result = calculateNextReview(10, 2.5, 1, 5);
      // 10 * 0.25 = 2.5 days, but minimum is 1 hour
      expect(result.interval).toBe(2.5);
    });

    it("should enforce minimum 1 hour for Struggled on short intervals", () => {
      const result = calculateNextReview(0.1, 2.5, 1, 5);
      // 0.1 * 0.25 = 0.025 days, but minimum is 1/24 = 0.0417 days (1 hour)
      expect(result.interval).toBeCloseTo(1 / 24, 3);
    });
  });

  describe("ease factor adjustments", () => {
    it("should decrease ease factor on Forgot", () => {
      const result = calculateNextReview(10, 2.5, 0, 5);
      expect(result.easeFactor).toBe(2.3); // 2.5 - 0.2
    });

    it("should decrease ease factor on Struggled", () => {
      const result = calculateNextReview(10, 2.5, 1, 5);
      expect(result.easeFactor).toBe(2.35); // 2.5 - 0.15
    });

    it("should keep ease factor same on Remembered", () => {
      const result = calculateNextReview(10, 2.5, 2, 5);
      expect(result.easeFactor).toBe(2.5);
    });

    it("should increase ease factor on Easy", () => {
      const result = calculateNextReview(10, 2.5, 3, 5);
      expect(result.easeFactor).toBe(2.65); // 2.5 + 0.15
    });

    it("should not go below 1.3", () => {
      const result = calculateNextReview(10, 1.3, 0, 5);
      expect(result.easeFactor).toBe(1.3);
    });
  });

  describe("next review date calculation", () => {
    it("should set correct date for 1 day interval", () => {
      const result = calculateNextReview(0, 2.5, 2, 0);
      const expectedDate = new Date("2024-01-16T12:00:00Z");
      expect(result.nextReviewDate.getTime()).toBe(expectedDate.getTime());
    });

    it("should set correct date for 10 minute interval", () => {
      const result = calculateNextReview(10, 2.5, 0, 5);
      // 10 minutes from now
      const expectedDate = new Date("2024-01-15T12:10:00Z");
      expect(result.nextReviewDate.getTime()).toBe(expectedDate.getTime());
    });
  });

  describe("real-world learning scenarios", () => {
    it("should simulate learning a new easy word", () => {
      // Day 1: First time seeing word, get it right easily
      let result = calculateNextReview(0, 2.5, 3, 0);
      expect(result.interval).toBe(1); // See tomorrow
      expect(result.easeFactor).toBe(2.65);

      // Day 2: Still easy
      result = calculateNextReview(result.interval, result.easeFactor, 3, 1);
      expect(result.interval).toBe(4); // See in 4 days
      expect(result.easeFactor).toBe(2.8);

      // Day 6: Still easy - 4 * 2.95 = 11.8 → 12, * 1.3 = 15.6 → 16
      result = calculateNextReview(result.interval, result.easeFactor, 3, 2);
      expect(result.interval).toBe(16); // See in ~2 weeks
      expect(result.easeFactor).toBeCloseTo(2.95, 2);
    });

    it("should simulate learning a difficult word", () => {
      // Day 1: First time, got it right
      let result = calculateNextReview(0, 2.5, 2, 0);
      expect(result.interval).toBe(1); // See tomorrow

      // Day 2: Struggled - interval becomes 1 * 0.25 = 0.25 days (6 hours)
      result = calculateNextReview(result.interval, result.easeFactor, 1, 1);
      expect(result.easeFactor).toBe(2.35); // EF decreased
      expect(result.interval).toBe(0.25); // See in 6 hours

      // Same day: Forgot completely - see in 10 minutes
      result = calculateNextReview(result.interval, result.easeFactor, 0, 1);
      expect(result.easeFactor).toBe(2.15); // EF decreased more
      expect(result.interval).toBeCloseTo(1 / 144, 3); // See in 10 min
    });
  });
});
