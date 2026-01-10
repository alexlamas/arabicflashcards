import { describe, it, expect, beforeEach, vi } from "vitest";
import { formatTimeUntilReview } from "../formatReviewTime";

describe("formatTimeUntilReview", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
  });

  describe("invalid inputs", () => {
    it("should return null for undefined", () => {
      expect(formatTimeUntilReview(undefined)).toBeNull();
    });

    it("should return null for null", () => {
      expect(formatTimeUntilReview(null)).toBeNull();
    });

    it("should return null for invalid date string", () => {
      expect(formatTimeUntilReview("not-a-date")).toBeNull();
    });

    it("should return null for empty string", () => {
      expect(formatTimeUntilReview("")).toBeNull();
    });
  });

  describe("past dates", () => {
    it("should return 'Yesterday' for 1 day ago", () => {
      expect(formatTimeUntilReview("2024-01-14T12:00:00Z")).toBe("Yesterday");
    });

    it("should return 'X days ago' for 2-6 days ago", () => {
      expect(formatTimeUntilReview("2024-01-13T12:00:00Z")).toBe("2 days ago");
      expect(formatTimeUntilReview("2024-01-10T12:00:00Z")).toBe("5 days ago");
    });

    it("should return '1 week ago' for 7-13 days ago", () => {
      expect(formatTimeUntilReview("2024-01-08T12:00:00Z")).toBe("1 week ago");
    });

    it("should return 'X weeks ago' for 14-29 days ago", () => {
      expect(formatTimeUntilReview("2024-01-01T12:00:00Z")).toBe("2 weeks ago");
    });

    it("should return '1 month ago' for 30-59 days ago", () => {
      expect(formatTimeUntilReview("2023-12-16T12:00:00Z")).toBe("1 month ago");
    });

    it("should return 'X months ago' for 60-364 days ago", () => {
      expect(formatTimeUntilReview("2023-11-15T12:00:00Z")).toBe("2 months ago");
    });

    it("should return '1 year ago' for 365-729 days ago", () => {
      expect(formatTimeUntilReview("2023-01-15T12:00:00Z")).toBe("1 year ago");
    });

    it("should return 'X years ago' for 730+ days ago", () => {
      expect(formatTimeUntilReview("2022-01-15T12:00:00Z")).toBe("2 years ago");
    });
  });

  describe("today", () => {
    it("should return 'Today' for same day", () => {
      expect(formatTimeUntilReview("2024-01-15T10:00:00Z")).toBe("Today");
      expect(formatTimeUntilReview("2024-01-15T14:00:00Z")).toBe("Today");
    });
  });

  describe("future dates", () => {
    it("should return 'Tomorrow' for 1 day ahead", () => {
      expect(formatTimeUntilReview("2024-01-16T12:00:00Z")).toBe("Tomorrow");
    });

    it("should return 'X days' for 2-6 days ahead", () => {
      expect(formatTimeUntilReview("2024-01-17T12:00:00Z")).toBe("2 days");
      expect(formatTimeUntilReview("2024-01-20T12:00:00Z")).toBe("5 days");
    });

    it("should return 'Next week' for 7-13 days ahead", () => {
      expect(formatTimeUntilReview("2024-01-22T12:00:00Z")).toBe("Next week");
    });

    it("should return 'X weeks' for 14-29 days ahead", () => {
      expect(formatTimeUntilReview("2024-01-29T12:00:00Z")).toBe("2 weeks");
      expect(formatTimeUntilReview("2024-02-05T12:00:00Z")).toBe("3 weeks");
    });

    it("should return 'Next month' for 30-59 days ahead", () => {
      expect(formatTimeUntilReview("2024-02-14T12:00:00Z")).toBe("Next month");
    });

    it("should return 'X months' for 60-364 days ahead", () => {
      expect(formatTimeUntilReview("2024-03-15T12:00:00Z")).toBe("2 months");
      expect(formatTimeUntilReview("2024-06-15T12:00:00Z")).toBe("5 months");
    });

    it("should return 'Next year' for 365-729 days ahead", () => {
      expect(formatTimeUntilReview("2025-01-15T12:00:00Z")).toBe("Next year");
    });

    it("should return 'X years' for 730+ days ahead", () => {
      expect(formatTimeUntilReview("2026-01-15T12:00:00Z")).toBe("2 years");
    });
  });
});
