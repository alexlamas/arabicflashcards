import { describe, it, expect, beforeEach, vi } from "vitest";
import { OfflineQueue } from "../offlineQueue";

describe("OfflineQueue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
  });

  describe("createDeleteAction", () => {
    it("should create a delete action with correct structure", () => {
      const action = OfflineQueue.createDeleteAction("word-123");

      expect(action.type).toBe("DELETE_WORD");
      expect(action.payload).toEqual({ id: "word-123" });
      expect(action.timestamp).toBe(Date.now());
      expect(action.retries).toBe(0);
      expect(action.id).toBeDefined();
    });

    it("should generate unique IDs", () => {
      const action1 = OfflineQueue.createDeleteAction("word-1");
      const action2 = OfflineQueue.createDeleteAction("word-2");

      expect(action1.id).not.toBe(action2.id);
    });
  });

  describe("createUpdateAction", () => {
    it("should create an update action with word ID and updates", () => {
      const updates = { english: "hello", arabic: "مرحبا" };
      const action = OfflineQueue.createUpdateAction("word-123", updates);

      expect(action.type).toBe("UPDATE_WORD");
      expect(action.payload).toEqual({ id: "word-123", updates });
      expect(action.retries).toBe(0);
    });
  });

  describe("createProgressAction", () => {
    it("should create a progress action with user, word, and rating", () => {
      const action = OfflineQueue.createProgressAction("user-1", "word-1", 3);

      expect(action.type).toBe("UPDATE_PROGRESS");
      expect(action.payload).toEqual({
        userId: "user-1",
        wordId: "word-1",
        rating: 3,
      });
    });
  });

  describe("createStartLearningAction", () => {
    it("should create a start learning action", () => {
      const action = OfflineQueue.createStartLearningAction("user-1", "word-1");

      expect(action.type).toBe("START_LEARNING");
      expect(action.payload).toEqual({
        userId: "user-1",
        wordId: "word-1",
      });
    });
  });

  describe("canRetry", () => {
    it("should return true when retries < MAX_RETRIES (3)", () => {
      const action = OfflineQueue.createDeleteAction("word-1");
      action.retries = 0;
      expect(OfflineQueue.canRetry(action)).toBe(true);

      action.retries = 2;
      expect(OfflineQueue.canRetry(action)).toBe(true);
    });

    it("should return false when retries >= MAX_RETRIES (3)", () => {
      const action = OfflineQueue.createDeleteAction("word-1");
      action.retries = 3;
      expect(OfflineQueue.canRetry(action)).toBe(false);

      action.retries = 5;
      expect(OfflineQueue.canRetry(action)).toBe(false);
    });
  });

  describe("incrementRetries", () => {
    it("should return new action with incremented retries", () => {
      const action = OfflineQueue.createDeleteAction("word-1");
      const incremented = OfflineQueue.incrementRetries(action);

      expect(incremented.retries).toBe(1);
      expect(action.retries).toBe(0); // Original unchanged
    });

    it("should preserve other properties", () => {
      const action = OfflineQueue.createDeleteAction("word-1");
      const incremented = OfflineQueue.incrementRetries(action);

      expect(incremented.id).toBe(action.id);
      expect(incremented.type).toBe(action.type);
      expect(incremented.payload).toEqual(action.payload);
      expect(incremented.timestamp).toBe(action.timestamp);
    });
  });

  describe("isExpired", () => {
    it("should return false for recent actions", () => {
      const action = OfflineQueue.createDeleteAction("word-1");
      expect(OfflineQueue.isExpired(action)).toBe(false);
    });

    it("should return true for actions older than 7 days", () => {
      const action = OfflineQueue.createDeleteAction("word-1");
      action.timestamp = Date.now() - 8 * 24 * 60 * 60 * 1000; // 8 days ago

      expect(OfflineQueue.isExpired(action)).toBe(true);
    });

    it("should respect custom maxAge parameter", () => {
      const action = OfflineQueue.createDeleteAction("word-1");
      action.timestamp = Date.now() - 2 * 60 * 60 * 1000; // 2 hours ago

      expect(OfflineQueue.isExpired(action, 1 * 60 * 60 * 1000)).toBe(true); // 1 hour max
      expect(OfflineQueue.isExpired(action, 3 * 60 * 60 * 1000)).toBe(false); // 3 hour max
    });
  });

  describe("filterValidActions", () => {
    it("should remove expired actions", () => {
      const recent = OfflineQueue.createDeleteAction("word-1");
      const expired = OfflineQueue.createDeleteAction("word-2");
      expired.timestamp = Date.now() - 8 * 24 * 60 * 60 * 1000;

      const result = OfflineQueue.filterValidActions([recent, expired]);

      expect(result).toHaveLength(1);
      expect(result[0].payload).toEqual({ id: "word-1" });
    });

    it("should return empty array when all expired", () => {
      const expired1 = OfflineQueue.createDeleteAction("word-1");
      expired1.timestamp = Date.now() - 8 * 24 * 60 * 60 * 1000;

      const expired2 = OfflineQueue.createDeleteAction("word-2");
      expired2.timestamp = Date.now() - 10 * 24 * 60 * 60 * 1000;

      const result = OfflineQueue.filterValidActions([expired1, expired2]);

      expect(result).toHaveLength(0);
    });

    it("should return all when none expired", () => {
      const action1 = OfflineQueue.createDeleteAction("word-1");
      const action2 = OfflineQueue.createDeleteAction("word-2");

      const result = OfflineQueue.filterValidActions([action1, action2]);

      expect(result).toHaveLength(2);
    });
  });
});
