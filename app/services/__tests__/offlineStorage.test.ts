import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { OfflineStorage } from "../offlineStorage";
import { OfflineQueue } from "../offlineQueue";
import type { Word } from "../../types/word";
import type { OfflineState, OfflineAction } from "../../types/offline";
import { OFFLINE_CONSTANTS } from "../../types/offline";

// Mock localStorage
const createMockLocalStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    _getStore: () => store,
  };
};

const createTestWord = (id: string, overrides: Partial<Word> = {}): Word => ({
  id,
  english: `English ${id}`,
  arabic: `Arabic ${id}`,
  transliteration: `trans ${id}`,
  type: "noun",
  ...overrides,
});

const createTestAction = (id: string, type: OfflineAction["type"] = "DELETE_WORD"): OfflineAction => ({
  id,
  type,
  payload: { id: `word-${id}` },
  timestamp: Date.now(),
  retries: 0,
});

describe("OfflineStorage", () => {
  let mockLocalStorage: ReturnType<typeof createMockLocalStorage>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));

    mockLocalStorage = createMockLocalStorage();
    vi.stubGlobal("localStorage", mockLocalStorage);

    // Reset storage state between tests
    OfflineStorage.clear();
    OfflineStorage.setUserId(null);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  describe("getState / setState", () => {
    it("should return default state when localStorage is empty", () => {
      const state = OfflineStorage.getState();

      expect(state).toEqual({
        words: [],
        lastSync: 0,
        pendingActions: [],
      });
    });

    it("should return stored state from localStorage", () => {
      const storedState: OfflineState = {
        words: [createTestWord("1")],
        lastSync: 1000,
        pendingActions: [],
      };
      mockLocalStorage.setItem(
        OFFLINE_CONSTANTS.STORAGE_KEY,
        JSON.stringify(storedState)
      );

      const state = OfflineStorage.getState();

      expect(state.words).toHaveLength(1);
      expect(state.words[0].id).toBe("1");
      expect(state.lastSync).toBe(1000);
    });

    it("should successfully save state to localStorage", () => {
      const state: OfflineState = {
        words: [createTestWord("1")],
        lastSync: Date.now(),
        pendingActions: [],
      };

      const result = OfflineStorage.setState(state);

      expect(result).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it("should return default state on parse error", () => {
      mockLocalStorage.setItem(OFFLINE_CONSTANTS.STORAGE_KEY, "invalid json");

      const state = OfflineStorage.getState();

      expect(state).toEqual({
        words: [],
        lastSync: 0,
        pendingActions: [],
      });
    });

    it("should use user-specific storage key when userId is set", () => {
      const userId = "user-123";
      OfflineStorage.setUserId(userId);

      const state: OfflineState = {
        words: [createTestWord("1")],
        lastSync: Date.now(),
        pendingActions: [],
      };
      OfflineStorage.setState(state);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        `${OFFLINE_CONSTANTS.STORAGE_KEY}_${userId}`,
        expect.any(String)
      );
    });

    it("should filter expired actions when getting state", () => {
      const recentAction = createTestAction("recent");
      const expiredAction = createTestAction("expired");
      expiredAction.timestamp = Date.now() - 8 * 24 * 60 * 60 * 1000; // 8 days ago

      const storedState: OfflineState = {
        words: [],
        lastSync: 0,
        pendingActions: [recentAction, expiredAction],
      };
      mockLocalStorage.setItem(
        OFFLINE_CONSTANTS.STORAGE_KEY,
        JSON.stringify(storedState)
      );

      const state = OfflineStorage.getState();

      expect(state.pendingActions).toHaveLength(1);
      expect(state.pendingActions[0].id).toBe("recent");
    });
  });

  describe("memory fallback when localStorage unavailable", () => {
    beforeEach(() => {
      // Simulate localStorage being unavailable
      vi.stubGlobal("localStorage", {
        getItem: () => { throw new Error("localStorage not available"); },
        setItem: () => { throw new Error("localStorage not available"); },
        removeItem: () => { throw new Error("localStorage not available"); },
        clear: () => { throw new Error("localStorage not available"); },
        length: 0,
        key: () => null,
      });
    });

    it("should use memory fallback for getState", () => {
      const state = OfflineStorage.getState();

      expect(state).toEqual({
        words: [],
        lastSync: 0,
        pendingActions: [],
      });
    });

    it("should use memory fallback for setState", () => {
      const state: OfflineState = {
        words: [createTestWord("1")],
        lastSync: Date.now(),
        pendingActions: [],
      };

      const result = OfflineStorage.setState(state);

      expect(result).toBe(false); // Returns false when using fallback

      // The state should still be retrievable via memory
      const retrieved = OfflineStorage.getState();
      expect(retrieved.words).toHaveLength(1);
    });
  });

  describe("getWords / setWords", () => {
    it("should return empty array when no words stored", () => {
      const words = OfflineStorage.getWords();

      expect(words).toEqual([]);
    });

    it("should store and retrieve words", () => {
      const testWords = [createTestWord("1"), createTestWord("2")];

      OfflineStorage.setWords(testWords);
      const words = OfflineStorage.getWords();

      expect(words).toHaveLength(2);
      expect(words[0].id).toBe("1");
      expect(words[1].id).toBe("2");
    });

    it("should update lastSync when setting words", () => {
      const testWords = [createTestWord("1")];

      OfflineStorage.setWords(testWords);
      const state = OfflineStorage.getState();

      expect(state.lastSync).toBe(Date.now());
    });

    it("should replace existing words", () => {
      OfflineStorage.setWords([createTestWord("1"), createTestWord("2")]);
      OfflineStorage.setWords([createTestWord("3")]);

      const words = OfflineStorage.getWords();

      expect(words).toHaveLength(1);
      expect(words[0].id).toBe("3");
    });
  });

  describe("updateWord", () => {
    it("should update a specific word by id", () => {
      OfflineStorage.setWords([
        createTestWord("1"),
        createTestWord("2"),
      ]);

      OfflineStorage.updateWord("1", { english: "Updated English" });

      const words = OfflineStorage.getWords();
      expect(words[0].english).toBe("Updated English");
      expect(words[1].english).toBe("English 2"); // Unchanged
    });

    it("should preserve other word properties when updating", () => {
      const originalWord = createTestWord("1", { notes: "Important note" });
      OfflineStorage.setWords([originalWord]);

      OfflineStorage.updateWord("1", { english: "Updated" });

      const words = OfflineStorage.getWords();
      expect(words[0].notes).toBe("Important note");
      expect(words[0].arabic).toBe("Arabic 1");
    });

    it("should not modify words with non-matching id", () => {
      OfflineStorage.setWords([createTestWord("1")]);

      OfflineStorage.updateWord("non-existent", { english: "Updated" });

      const words = OfflineStorage.getWords();
      expect(words[0].english).toBe("English 1");
    });

    it("should return true on successful update", () => {
      OfflineStorage.setWords([createTestWord("1")]);

      const result = OfflineStorage.updateWord("1", { english: "Updated" });

      expect(result).toBe(true);
    });
  });

  describe("deleteWord", () => {
    it("should remove word with matching id", () => {
      OfflineStorage.setWords([
        createTestWord("1"),
        createTestWord("2"),
        createTestWord("3"),
      ]);

      OfflineStorage.deleteWord("2");

      const words = OfflineStorage.getWords();
      expect(words).toHaveLength(2);
      expect(words.map(w => w.id)).toEqual(["1", "3"]);
    });

    it("should not affect words when id not found", () => {
      OfflineStorage.setWords([createTestWord("1")]);

      OfflineStorage.deleteWord("non-existent");

      const words = OfflineStorage.getWords();
      expect(words).toHaveLength(1);
    });

    it("should return true on successful deletion", () => {
      OfflineStorage.setWords([createTestWord("1")]);

      const result = OfflineStorage.deleteWord("1");

      expect(result).toBe(true);
    });
  });

  describe("getPendingActions / addAction / removeAction", () => {
    it("should return empty array when no actions", () => {
      const actions = OfflineStorage.getPendingActions();

      expect(actions).toEqual([]);
    });

    it("should add action to pending actions", () => {
      const action = OfflineQueue.createDeleteAction("word-1");

      OfflineStorage.addAction(action);

      const actions = OfflineStorage.getPendingActions();
      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe("DELETE_WORD");
    });

    it("should add multiple actions", () => {
      const action1 = OfflineQueue.createDeleteAction("word-1");
      const action2 = OfflineQueue.createUpdateAction("word-2", { english: "test" });

      OfflineStorage.addAction(action1);
      OfflineStorage.addAction(action2);

      const actions = OfflineStorage.getPendingActions();
      expect(actions).toHaveLength(2);
    });

    it("should remove action by id", () => {
      const action1 = OfflineQueue.createDeleteAction("word-1");
      const action2 = OfflineQueue.createDeleteAction("word-2");
      OfflineStorage.addAction(action1);
      OfflineStorage.addAction(action2);

      OfflineStorage.removeAction(action1.id);

      const actions = OfflineStorage.getPendingActions();
      expect(actions).toHaveLength(1);
      expect(actions[0].id).toBe(action2.id);
    });

    it("should not affect actions when removing non-existent id", () => {
      const action = OfflineQueue.createDeleteAction("word-1");
      OfflineStorage.addAction(action);

      OfflineStorage.removeAction("non-existent");

      const actions = OfflineStorage.getPendingActions();
      expect(actions).toHaveLength(1);
    });
  });

  describe("updateAction", () => {
    it("should update action with matching id", () => {
      const action = OfflineQueue.createDeleteAction("word-1");
      OfflineStorage.addAction(action);

      OfflineStorage.updateAction(action.id, (a) => ({
        ...a,
        retries: a.retries + 1,
      }));

      const actions = OfflineStorage.getPendingActions();
      expect(actions[0].retries).toBe(1);
    });

    it("should not modify actions with non-matching id", () => {
      const action = OfflineQueue.createDeleteAction("word-1");
      OfflineStorage.addAction(action);

      OfflineStorage.updateAction("non-existent", (a) => ({
        ...a,
        retries: 999,
      }));

      const actions = OfflineStorage.getPendingActions();
      expect(actions[0].retries).toBe(0);
    });
  });

  describe("utility methods", () => {
    describe("getLastSyncTime", () => {
      it("should return 0 when never synced", () => {
        expect(OfflineStorage.getLastSyncTime()).toBe(0);
      });

      it("should return lastSync from state", () => {
        OfflineStorage.setWords([createTestWord("1")]);

        expect(OfflineStorage.getLastSyncTime()).toBe(Date.now());
      });
    });

    describe("hasPendingActions", () => {
      it("should return false when no pending actions", () => {
        expect(OfflineStorage.hasPendingActions()).toBe(false);
      });

      it("should return true when there are pending actions", () => {
        const action = OfflineQueue.createDeleteAction("word-1");
        OfflineStorage.addAction(action);

        expect(OfflineStorage.hasPendingActions()).toBe(true);
      });
    });

    describe("clear", () => {
      it("should remove data from localStorage", () => {
        OfflineStorage.setWords([createTestWord("1")]);

        OfflineStorage.clear();

        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
          OFFLINE_CONSTANTS.STORAGE_KEY
        );
      });

      it("should reset state to default after clear", () => {
        OfflineStorage.setWords([createTestWord("1")]);
        OfflineStorage.addAction(OfflineQueue.createDeleteAction("word-1"));

        OfflineStorage.clear();

        const state = OfflineStorage.getState();
        expect(state.words).toEqual([]);
        expect(state.pendingActions).toEqual([]);
        expect(state.lastSync).toBe(0);
      });
    });
  });

  describe("applyLimits", () => {
    it("should filter expired actions", () => {
      const recentAction = createTestAction("recent");
      const expiredAction = createTestAction("expired");
      expiredAction.timestamp = Date.now() - 8 * 24 * 60 * 60 * 1000;

      const state: OfflineState = {
        words: [],
        lastSync: 0,
        pendingActions: [recentAction, expiredAction],
      };

      OfflineStorage.setState(state);
      const retrievedState = OfflineStorage.getState();

      expect(retrievedState.pendingActions).toHaveLength(1);
      expect(retrievedState.pendingActions[0].id).toBe("recent");
    });

    it("should limit number of actions to MAX_ACTIONS (1000)", () => {
      // Create more than 1000 actions
      const actions: OfflineAction[] = [];
      for (let i = 0; i < 1100; i++) {
        const action = createTestAction(`action-${i}`);
        action.timestamp = Date.now() - i * 1000; // Vary timestamps
        actions.push(action);
      }

      const state: OfflineState = {
        words: [],
        lastSync: 0,
        pendingActions: actions,
      };

      OfflineStorage.setState(state);
      const retrievedState = OfflineStorage.getState();

      expect(retrievedState.pendingActions.length).toBeLessThanOrEqual(1000);
    });

    it("should keep newest actions when limiting", () => {
      const oldAction = createTestAction("old");
      oldAction.timestamp = Date.now() - 100000;

      const newAction = createTestAction("new");
      newAction.timestamp = Date.now();

      // Create array with more than 1000 actions
      const actions: OfflineAction[] = [oldAction];
      for (let i = 0; i < 1000; i++) {
        const action = createTestAction(`action-${i}`);
        action.timestamp = Date.now() - 50000 + i; // Between old and new
        actions.push(action);
      }
      actions.push(newAction);

      const state: OfflineState = {
        words: [],
        lastSync: 0,
        pendingActions: actions,
      };

      OfflineStorage.setState(state);
      const retrievedState = OfflineStorage.getState();

      // The newest action should be kept
      const actionIds = retrievedState.pendingActions.map(a => a.id);
      expect(actionIds).toContain("new");
    });
  });

  describe("setUserId", () => {
    it("should use default storage key when userId is null", () => {
      OfflineStorage.setUserId(null);
      OfflineStorage.setWords([createTestWord("1")]);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        OFFLINE_CONSTANTS.STORAGE_KEY,
        expect.any(String)
      );
    });

    it("should use user-specific key when userId is set", () => {
      OfflineStorage.setUserId("user-abc");
      OfflineStorage.setWords([createTestWord("1")]);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        `${OFFLINE_CONSTANTS.STORAGE_KEY}_user-abc`,
        expect.any(String)
      );
    });

    it("should clear memory fallback when userId changes", () => {
      // Set up some state with one user
      OfflineStorage.setUserId("user-1");

      // Use memory fallback
      vi.stubGlobal("localStorage", {
        getItem: () => { throw new Error("unavailable"); },
        setItem: () => { throw new Error("unavailable"); },
        removeItem: () => { throw new Error("unavailable"); },
        clear: () => { throw new Error("unavailable"); },
        length: 0,
        key: () => null,
      });

      const state: OfflineState = {
        words: [createTestWord("1")],
        lastSync: Date.now(),
        pendingActions: [],
      };
      OfflineStorage.setState(state);

      // Change user - should reset memory fallback
      OfflineStorage.setUserId("user-2");

      const newState = OfflineStorage.getState();
      expect(newState.words).toEqual([]);
    });
  });

  describe("QuotaExceededError handling", () => {
    it("should clear old data and retry on QuotaExceededError", () => {
      let realSetItemCallCount = 0;
      const quotaError = new DOMException("Quota exceeded", "QuotaExceededError");

      vi.stubGlobal("localStorage", {
        getItem: (key: string) => {
          if (key === OFFLINE_CONSTANTS.STORAGE_KEY) {
            return JSON.stringify({
              words: [],
              lastSync: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
              pendingActions: [],
            });
          }
          return null;
        },
        setItem: vi.fn((key: string) => {
          // Allow the storage availability test to pass
          if (key === "__storage_test__") {
            return;
          }
          // Count only real storage operations
          realSetItemCallCount++;
          // First real setItem call throws QuotaExceededError
          if (realSetItemCallCount === 1) {
            throw quotaError;
          }
          // Subsequent calls succeed (after clearOldData runs)
        }),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      });

      const state: OfflineState = {
        words: [createTestWord("1")],
        lastSync: Date.now(),
        pendingActions: [],
      };

      const result = OfflineStorage.setState(state);

      // Should have retried after clearing - real setItem called multiple times
      expect(realSetItemCallCount).toBeGreaterThanOrEqual(2);
      expect(result).toBe(true);
    });

    it("should return false when retry also fails", () => {
      const quotaError = new DOMException("Quota exceeded", "QuotaExceededError");

      vi.stubGlobal("localStorage", {
        getItem: () => {
          return JSON.stringify({
            words: [],
            lastSync: Date.now(),
            pendingActions: [],
          });
        },
        setItem: vi.fn((key: string) => {
          // Allow the storage availability test to pass
          if (key === "__storage_test__") {
            return;
          }
          // All real setItem calls throw
          throw quotaError;
        }),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      });

      const state: OfflineState = {
        words: [createTestWord("1")],
        lastSync: Date.now(),
        pendingActions: [],
      };

      const result = OfflineStorage.setState(state);

      expect(result).toBe(false);
    });
  });
});
