import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from "vitest";
import type { Word } from "../../types/word";
import type { OfflineAction } from "../../types/offline";

// Mock dependencies before importing SyncService
vi.mock("../wordService", () => ({
  WordService: {
    deleteWord: vi.fn(),
    updateWord: vi.fn(),
    getAllWords: vi.fn(),
  },
}));

vi.mock("../spacedRepetitionService", () => ({
  SpacedRepetitionService: {
    processReview: vi.fn(),
    startLearning: vi.fn(),
  },
}));

vi.mock("../offlineStorage", () => ({
  OfflineStorage: {
    getPendingActions: vi.fn(),
    removeAction: vi.fn(),
    updateAction: vi.fn(),
    setWords: vi.fn(),
    getWords: vi.fn(),
    hasPendingActions: vi.fn(),
  },
}));

vi.mock("../offlineQueue", () => ({
  OfflineQueue: {
    incrementRetries: vi.fn((action) => ({ ...action, retries: action.retries + 1 })),
  },
}));

vi.mock("../../utils/connectivity", () => ({
  getOnlineStatus: vi.fn(),
}));

// Import after mocking
import { SyncService } from "../syncService";
import { WordService } from "../wordService";
import { SpacedRepetitionService } from "../spacedRepetitionService";
import { OfflineStorage } from "../offlineStorage";
import { OfflineQueue } from "../offlineQueue";
import { getOnlineStatus } from "../../utils/connectivity";

const createTestWord = (id: string, overrides: Partial<Word> = {}): Word => ({
  id,
  english: `English ${id}`,
  arabic: `Arabic ${id}`,
  transliteration: `trans ${id}`,
  type: "noun",
  ...overrides,
});

const createTestAction = (
  id: string,
  type: OfflineAction["type"] = "DELETE_WORD",
  payload: OfflineAction["payload"] = { id: `word-${id}` }
): OfflineAction => ({
  id,
  type,
  payload,
  timestamp: Date.now(),
  retries: 0,
});

describe("SyncService", () => {
  // Store original static state
  let originalListeners: ((syncing: boolean) => void)[];
  let originalSyncInProgress: boolean;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));

    // Reset SyncService static state by accessing private members
    // @ts-expect-error - accessing private static property for testing
    originalListeners = [...SyncService.listeners];
    // @ts-expect-error - accessing private static property for testing
    originalSyncInProgress = SyncService.syncInProgress;

    // Reset to clean state
    // @ts-expect-error - accessing private static property for testing
    SyncService.listeners = [];
    // @ts-expect-error - accessing private static property for testing
    SyncService.syncInProgress = false;

    // Default mocks
    (getOnlineStatus as Mock).mockReturnValue(true);
    (OfflineStorage.getPendingActions as Mock).mockReturnValue([]);
    (OfflineStorage.getWords as Mock).mockReturnValue([]);
    (OfflineStorage.hasPendingActions as Mock).mockReturnValue(false);
    (WordService.getAllWords as Mock).mockResolvedValue([]);
  });

  afterEach(() => {
    // Restore original state
    // @ts-expect-error - accessing private static property for testing
    SyncService.listeners = originalListeners;
    // @ts-expect-error - accessing private static property for testing
    SyncService.syncInProgress = originalSyncInProgress;

    vi.useRealTimers();
  });

  describe("syncPendingActions", () => {
    describe("precondition checks", () => {
      it("should return early if sync already in progress", async () => {
        // @ts-expect-error - accessing private static property for testing
        SyncService.syncInProgress = true;

        const result = await SyncService.syncPendingActions();

        expect(result.success).toBe(false);
        expect(result.errors[0].message).toBe("Sync already in progress");
        expect(OfflineStorage.getPendingActions).not.toHaveBeenCalled();
      });

      it("should return early if offline", async () => {
        (getOnlineStatus as Mock).mockReturnValue(false);

        const result = await SyncService.syncPendingActions();

        expect(result.success).toBe(false);
        expect(result.errors[0].message).toBe("No internet connection");
        expect(OfflineStorage.getPendingActions).not.toHaveBeenCalled();
      });

      it("should return success with zero counts if no pending actions", async () => {
        (OfflineStorage.getPendingActions as Mock).mockReturnValue([]);

        const result = await SyncService.syncPendingActions();

        expect(result.success).toBe(true);
        expect(result.syncedCount).toBe(0);
        expect(result.failedCount).toBe(0);
        expect(result.errors).toHaveLength(0);
      });
    });

    describe("DELETE_WORD action", () => {
      it("should sync DELETE_WORD action successfully", async () => {
        const deleteAction = createTestAction("action-1", "DELETE_WORD", { id: "word-123" });
        (OfflineStorage.getPendingActions as Mock).mockReturnValue([deleteAction]);
        (WordService.deleteWord as Mock).mockResolvedValue(undefined);

        const result = await SyncService.syncPendingActions();

        expect(WordService.deleteWord).toHaveBeenCalledWith("word-123");
        expect(OfflineStorage.removeAction).toHaveBeenCalledWith("action-1");
        expect(result.syncedCount).toBe(1);
        expect(result.success).toBe(true);
      });

      it("should handle DELETE_WORD failure and increment retries", async () => {
        const deleteAction = createTestAction("action-1", "DELETE_WORD", { id: "word-123" });
        (OfflineStorage.getPendingActions as Mock).mockReturnValue([deleteAction]);
        (WordService.deleteWord as Mock).mockRejectedValue(new Error("Network error"));

        const result = await SyncService.syncPendingActions();

        expect(OfflineStorage.updateAction).toHaveBeenCalledWith("action-1", expect.any(Function));
        expect(result.failedCount).toBe(1);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].message).toBe("Network error");
        expect(result.success).toBe(false);
      });

      it("should throw for invalid DELETE_WORD payload", async () => {
        const invalidAction = createTestAction("action-1", "DELETE_WORD", {} as unknown as { id: string });
        (OfflineStorage.getPendingActions as Mock).mockReturnValue([invalidAction]);

        const result = await SyncService.syncPendingActions();

        expect(result.failedCount).toBe(1);
        expect(result.errors[0].message).toBe("Invalid DELETE_WORD payload");
      });
    });

    describe("UPDATE_WORD action", () => {
      it("should sync UPDATE_WORD action successfully", async () => {
        const updateAction = createTestAction("action-1", "UPDATE_WORD", {
          id: "word-123",
          updates: { english: "updated" },
        });
        (OfflineStorage.getPendingActions as Mock).mockReturnValue([updateAction]);
        (WordService.updateWord as Mock).mockResolvedValue({ id: "word-123", english: "updated" });

        const result = await SyncService.syncPendingActions();

        expect(WordService.updateWord).toHaveBeenCalledWith("word-123", { english: "updated" });
        expect(OfflineStorage.removeAction).toHaveBeenCalledWith("action-1");
        expect(result.syncedCount).toBe(1);
        expect(result.success).toBe(true);
      });

      it("should skip UPDATE_WORD when word not found", async () => {
        const updateAction = createTestAction("action-1", "UPDATE_WORD", {
          id: "word-123",
          updates: { english: "updated" },
        });
        (OfflineStorage.getPendingActions as Mock).mockReturnValue([updateAction]);
        (WordService.updateWord as Mock).mockRejectedValue(new Error("Word with id word-123 not found"));

        const result = await SyncService.syncPendingActions();

        // Should be marked as synced (skipped) not failed
        expect(OfflineStorage.removeAction).toHaveBeenCalledWith("action-1");
        expect(result.syncedCount).toBe(1);
        expect(result.success).toBe(true);
      });

      it("should handle UPDATE_WORD failure for other errors", async () => {
        const updateAction = createTestAction("action-1", "UPDATE_WORD", {
          id: "word-123",
          updates: { english: "updated" },
        });
        (OfflineStorage.getPendingActions as Mock).mockReturnValue([updateAction]);
        (WordService.updateWord as Mock).mockRejectedValue(new Error("Database connection failed"));

        const result = await SyncService.syncPendingActions();

        expect(OfflineStorage.updateAction).toHaveBeenCalled();
        expect(result.failedCount).toBe(1);
        expect(result.success).toBe(false);
      });

      it("should throw for invalid UPDATE_WORD payload", async () => {
        const invalidAction = createTestAction("action-1", "UPDATE_WORD", { id: "word-123" } as unknown as { id: string; updates: Record<string, unknown> });
        (OfflineStorage.getPendingActions as Mock).mockReturnValue([invalidAction]);

        const result = await SyncService.syncPendingActions();

        expect(result.failedCount).toBe(1);
        expect(result.errors[0].message).toBe("Invalid UPDATE_WORD payload");
      });
    });

    describe("UPDATE_PROGRESS action", () => {
      it("should sync UPDATE_PROGRESS action successfully", async () => {
        const progressAction = createTestAction("action-1", "UPDATE_PROGRESS", {
          userId: "user-1",
          wordId: "word-1",
          rating: 3,
        });
        (OfflineStorage.getPendingActions as Mock).mockReturnValue([progressAction]);
        (SpacedRepetitionService.processReview as Mock).mockResolvedValue(undefined);

        const result = await SyncService.syncPendingActions();

        expect(SpacedRepetitionService.processReview).toHaveBeenCalledWith("user-1", "word-1", 3);
        expect(OfflineStorage.removeAction).toHaveBeenCalledWith("action-1");
        expect(result.syncedCount).toBe(1);
        expect(result.success).toBe(true);
      });

      it("should throw for invalid UPDATE_PROGRESS payload", async () => {
        const invalidAction = createTestAction("action-1", "UPDATE_PROGRESS", {
          userId: "user-1",
          wordId: "word-1",
          // missing rating
        } as unknown as { userId: string; wordId: string; rating: number });
        (OfflineStorage.getPendingActions as Mock).mockReturnValue([invalidAction]);

        const result = await SyncService.syncPendingActions();

        expect(result.failedCount).toBe(1);
        expect(result.errors[0].message).toBe("Invalid UPDATE_PROGRESS payload");
      });
    });

    describe("START_LEARNING action", () => {
      it("should sync START_LEARNING action successfully", async () => {
        const startAction = createTestAction("action-1", "START_LEARNING", {
          userId: "user-1",
          wordId: "word-1",
        });
        (OfflineStorage.getPendingActions as Mock).mockReturnValue([startAction]);
        (SpacedRepetitionService.startLearning as Mock).mockResolvedValue(undefined);

        const result = await SyncService.syncPendingActions();

        expect(SpacedRepetitionService.startLearning).toHaveBeenCalledWith("user-1", "word-1");
        expect(OfflineStorage.removeAction).toHaveBeenCalledWith("action-1");
        expect(result.syncedCount).toBe(1);
        expect(result.success).toBe(true);
      });

      it("should throw for invalid START_LEARNING payload", async () => {
        const invalidAction = createTestAction("action-1", "START_LEARNING", {
          userId: "user-1",
          // missing wordId
        } as unknown as { userId: string; wordId: string });
        (OfflineStorage.getPendingActions as Mock).mockReturnValue([invalidAction]);

        const result = await SyncService.syncPendingActions();

        expect(result.failedCount).toBe(1);
        expect(result.errors[0].message).toBe("Invalid START_LEARNING payload");
      });
    });

    describe("multiple actions", () => {
      it("should process multiple actions in sequence", async () => {
        const actions = [
          createTestAction("action-1", "DELETE_WORD", { id: "word-1" }),
          createTestAction("action-2", "UPDATE_WORD", { id: "word-2", updates: { english: "test" } }),
          createTestAction("action-3", "UPDATE_PROGRESS", { userId: "user-1", wordId: "word-3", rating: 4 }),
        ];
        (OfflineStorage.getPendingActions as Mock).mockReturnValue(actions);
        (WordService.deleteWord as Mock).mockResolvedValue(undefined);
        (WordService.updateWord as Mock).mockResolvedValue({ id: "word-2" });
        (SpacedRepetitionService.processReview as Mock).mockResolvedValue(undefined);

        const result = await SyncService.syncPendingActions();

        expect(result.syncedCount).toBe(3);
        expect(result.failedCount).toBe(0);
        expect(result.success).toBe(true);
        expect(OfflineStorage.removeAction).toHaveBeenCalledTimes(3);
      });

      it("should continue processing after individual action failure", async () => {
        const actions = [
          createTestAction("action-1", "DELETE_WORD", { id: "word-1" }),
          createTestAction("action-2", "DELETE_WORD", { id: "word-2" }),
          createTestAction("action-3", "DELETE_WORD", { id: "word-3" }),
        ];
        (OfflineStorage.getPendingActions as Mock).mockReturnValue(actions);
        (WordService.deleteWord as Mock)
          .mockResolvedValueOnce(undefined)
          .mockRejectedValueOnce(new Error("Network error"))
          .mockResolvedValueOnce(undefined);

        const result = await SyncService.syncPendingActions();

        expect(result.syncedCount).toBe(2);
        expect(result.failedCount).toBe(1);
        expect(result.success).toBe(false);
        expect(OfflineStorage.removeAction).toHaveBeenCalledTimes(2);
        expect(OfflineStorage.updateAction).toHaveBeenCalledTimes(1);
      });
    });

    describe("data refresh after sync", () => {
      it("should refresh words from server after successful sync", async () => {
        const deleteAction = createTestAction("action-1", "DELETE_WORD", { id: "word-123" });
        const freshWords = [createTestWord("word-1"), createTestWord("word-2")];
        (OfflineStorage.getPendingActions as Mock).mockReturnValue([deleteAction]);
        (WordService.deleteWord as Mock).mockResolvedValue(undefined);
        (WordService.getAllWords as Mock).mockResolvedValue(freshWords);

        await SyncService.syncPendingActions();

        expect(WordService.getAllWords).toHaveBeenCalled();
        expect(OfflineStorage.setWords).toHaveBeenCalledWith(freshWords);
      });

      it("should add error but not fail sync if refresh fails", async () => {
        const deleteAction = createTestAction("action-1", "DELETE_WORD", { id: "word-123" });
        (OfflineStorage.getPendingActions as Mock).mockReturnValue([deleteAction]);
        (WordService.deleteWord as Mock).mockResolvedValue(undefined);
        (WordService.getAllWords as Mock).mockRejectedValue(new Error("Refresh failed"));

        const result = await SyncService.syncPendingActions();

        expect(result.syncedCount).toBe(1);
        expect(result.success).toBe(true);
        expect(result.errors).toHaveLength(1);
        // Error message is preserved from the original error
        expect(result.errors[0].message).toBe("Refresh failed");
      });

      it("should use fallback message when refresh fails with non-Error", async () => {
        const deleteAction = createTestAction("action-1", "DELETE_WORD", { id: "word-123" });
        (OfflineStorage.getPendingActions as Mock).mockReturnValue([deleteAction]);
        (WordService.deleteWord as Mock).mockResolvedValue(undefined);
        (WordService.getAllWords as Mock).mockRejectedValue("String error");

        const result = await SyncService.syncPendingActions();

        expect(result.syncedCount).toBe(1);
        expect(result.success).toBe(true);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].message).toBe("Failed to refresh data");
      });
    });

    describe("sync state management", () => {
      it("should set syncInProgress during sync", async () => {
        const deleteAction = createTestAction("action-1", "DELETE_WORD", { id: "word-123" });
        (OfflineStorage.getPendingActions as Mock).mockReturnValue([deleteAction]);

        let syncDuringSyncCall = false;
        (WordService.deleteWord as Mock).mockImplementation(async () => {
          syncDuringSyncCall = SyncService.isSyncing();
        });

        await SyncService.syncPendingActions();

        expect(syncDuringSyncCall).toBe(true);
        expect(SyncService.isSyncing()).toBe(false);
      });

      it("should reset syncInProgress after sync completes", async () => {
        const deleteAction = createTestAction("action-1", "DELETE_WORD", { id: "word-123" });
        (OfflineStorage.getPendingActions as Mock).mockReturnValue([deleteAction]);
        (WordService.deleteWord as Mock).mockResolvedValue(undefined);

        await SyncService.syncPendingActions();

        expect(SyncService.isSyncing()).toBe(false);
      });

      it("should reset syncInProgress even if sync throws", async () => {
        (OfflineStorage.getPendingActions as Mock).mockImplementation(() => {
          throw new Error("Unexpected error");
        });

        // Force it past the empty check
        let callCount = 0;
        (OfflineStorage.getPendingActions as Mock).mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            return [createTestAction("action-1", "DELETE_WORD", { id: "word-123" })];
          }
          throw new Error("Unexpected error");
        });

        await SyncService.syncPendingActions();

        expect(SyncService.isSyncing()).toBe(false);
      });
    });
  });

  describe("listener management", () => {
    it("should notify listeners when sync starts and ends", async () => {
      const listener = vi.fn();
      SyncService.addSyncListener(listener);

      const deleteAction = createTestAction("action-1", "DELETE_WORD", { id: "word-123" });
      (OfflineStorage.getPendingActions as Mock).mockReturnValue([deleteAction]);
      (WordService.deleteWord as Mock).mockResolvedValue(undefined);

      await SyncService.syncPendingActions();

      expect(listener).toHaveBeenCalledWith(true); // Started
      expect(listener).toHaveBeenCalledWith(false); // Ended
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it("should remove listener when unsubscribe is called", async () => {
      const listener = vi.fn();
      const unsubscribe = SyncService.addSyncListener(listener);

      unsubscribe();

      const deleteAction = createTestAction("action-1", "DELETE_WORD", { id: "word-123" });
      (OfflineStorage.getPendingActions as Mock).mockReturnValue([deleteAction]);
      (WordService.deleteWord as Mock).mockResolvedValue(undefined);

      await SyncService.syncPendingActions();

      expect(listener).not.toHaveBeenCalled();
    });

    it("should continue notifying other listeners if one throws", async () => {
      const throwingListener = vi.fn(() => {
        throw new Error("Listener error");
      });
      const normalListener = vi.fn();

      SyncService.addSyncListener(throwingListener);
      SyncService.addSyncListener(normalListener);

      const deleteAction = createTestAction("action-1", "DELETE_WORD", { id: "word-123" });
      (OfflineStorage.getPendingActions as Mock).mockReturnValue([deleteAction]);
      (WordService.deleteWord as Mock).mockResolvedValue(undefined);

      await SyncService.syncPendingActions();

      expect(normalListener).toHaveBeenCalledWith(true);
      expect(normalListener).toHaveBeenCalledWith(false);
    });

    it("should not notify listeners when no actions to sync", async () => {
      const listener = vi.fn();
      SyncService.addSyncListener(listener);

      (OfflineStorage.getPendingActions as Mock).mockReturnValue([]);

      await SyncService.syncPendingActions();

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("loadInitialData", () => {
    it("should load words from server when online", async () => {
      const serverWords = [createTestWord("1"), createTestWord("2")];
      (getOnlineStatus as Mock).mockReturnValue(true);
      (WordService.getAllWords as Mock).mockResolvedValue(serverWords);

      const result = await SyncService.loadInitialData();

      expect(result).toEqual(serverWords);
      expect(OfflineStorage.setWords).toHaveBeenCalledWith(serverWords);
    });

    it("should fall back to offline data when server fails", async () => {
      const offlineWords = [createTestWord("offline-1")];
      (getOnlineStatus as Mock).mockReturnValue(true);
      (WordService.getAllWords as Mock).mockRejectedValue(new Error("Server error"));
      (OfflineStorage.getWords as Mock).mockReturnValue(offlineWords);

      const result = await SyncService.loadInitialData();

      expect(result).toEqual(offlineWords);
    });

    it("should fall back to offline data when offline", async () => {
      const offlineWords = [createTestWord("offline-1")];
      (getOnlineStatus as Mock).mockReturnValue(false);
      (OfflineStorage.getWords as Mock).mockReturnValue(offlineWords);

      const result = await SyncService.loadInitialData();

      expect(result).toEqual(offlineWords);
      expect(WordService.getAllWords).not.toHaveBeenCalled();
    });

    it("should throw when no data available", async () => {
      (getOnlineStatus as Mock).mockReturnValue(false);
      (OfflineStorage.getWords as Mock).mockReturnValue([]);

      await expect(SyncService.loadInitialData()).rejects.toThrow("No data available");
    });

    it("should throw when online fails and no offline data", async () => {
      (getOnlineStatus as Mock).mockReturnValue(true);
      (WordService.getAllWords as Mock).mockRejectedValue(new Error("Server error"));
      (OfflineStorage.getWords as Mock).mockReturnValue([]);

      await expect(SyncService.loadInitialData()).rejects.toThrow("No data available");
    });
  });

  describe("isOnline", () => {
    it("should return true when online", () => {
      (getOnlineStatus as Mock).mockReturnValue(true);

      expect(SyncService.isOnline()).toBe(true);
    });

    it("should return false when offline", () => {
      (getOnlineStatus as Mock).mockReturnValue(false);

      expect(SyncService.isOnline()).toBe(false);
    });
  });

  describe("isSyncing", () => {
    it("should return false when not syncing", () => {
      expect(SyncService.isSyncing()).toBe(false);
    });

    it("should return true when sync in progress", () => {
      // @ts-expect-error - accessing private static property for testing
      SyncService.syncInProgress = true;

      expect(SyncService.isSyncing()).toBe(true);
    });
  });

  describe("setupConnectivityListeners", () => {
    let addEventListenerSpy: Mock;
    let removeEventListenerSpy: Mock;

    beforeEach(() => {
      addEventListenerSpy = vi.fn();
      removeEventListenerSpy = vi.fn();
      vi.stubGlobal("window", {
        addEventListener: addEventListenerSpy,
        removeEventListener: removeEventListenerSpy,
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("should add online and offline event listeners", () => {
      SyncService.setupConnectivityListeners();

      expect(addEventListenerSpy).toHaveBeenCalledWith("online", expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith("offline", expect.any(Function));
    });

    it("should remove listeners on cleanup", () => {
      const cleanup = SyncService.setupConnectivityListeners();

      cleanup();

      expect(removeEventListenerSpy).toHaveBeenCalledWith("online", expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith("offline", expect.any(Function));
    });

    it("should trigger sync when coming online with pending actions", async () => {
      const pendingAction = createTestAction("action-1", "DELETE_WORD", { id: "word-123" });
      (OfflineStorage.hasPendingActions as Mock).mockReturnValue(true);
      (OfflineStorage.getPendingActions as Mock).mockReturnValue([pendingAction]);
      (WordService.deleteWord as Mock).mockResolvedValue(undefined);

      SyncService.setupConnectivityListeners();

      // Get the online handler and call it
      const onlineHandler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "online"
      )?.[1];

      expect(onlineHandler).toBeDefined();

      // Simulate coming online
      await onlineHandler();

      expect(OfflineStorage.hasPendingActions).toHaveBeenCalled();
      expect(WordService.deleteWord).toHaveBeenCalledWith("word-123");
    });

    it("should not trigger sync when coming online without pending actions", async () => {
      (OfflineStorage.hasPendingActions as Mock).mockReturnValue(false);

      SyncService.setupConnectivityListeners();

      const onlineHandler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "online"
      )?.[1];

      await onlineHandler();

      expect(OfflineStorage.getPendingActions).not.toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("should handle non-Error objects in catch blocks", async () => {
      const deleteAction = createTestAction("action-1", "DELETE_WORD", { id: "word-123" });
      (OfflineStorage.getPendingActions as Mock).mockReturnValue([deleteAction]);
      (WordService.deleteWord as Mock).mockRejectedValue("String error");

      const result = await SyncService.syncPendingActions();

      expect(result.failedCount).toBe(1);
      expect(result.errors[0].message).toBe("String error");
    });

    it("should handle null payload", async () => {
      const invalidAction = {
        id: "action-1",
        type: "DELETE_WORD" as const,
        payload: null as unknown as { id: string },
        timestamp: Date.now(),
        retries: 0,
      };
      (OfflineStorage.getPendingActions as Mock).mockReturnValue([invalidAction]);

      const result = await SyncService.syncPendingActions();

      expect(result.failedCount).toBe(1);
      expect(result.errors[0].message).toBe("Invalid DELETE_WORD payload");
    });

    it("should use OfflineQueue.incrementRetries for failed actions", async () => {
      const deleteAction = createTestAction("action-1", "DELETE_WORD", { id: "word-123" });
      (OfflineStorage.getPendingActions as Mock).mockReturnValue([deleteAction]);
      (WordService.deleteWord as Mock).mockRejectedValue(new Error("Failed"));

      await SyncService.syncPendingActions();

      expect(OfflineStorage.updateAction).toHaveBeenCalledWith(
        "action-1",
        OfflineQueue.incrementRetries
      );
    });
  });
});
