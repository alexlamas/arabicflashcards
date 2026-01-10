import type { Word } from "../types/word";
import type { OfflineState, OfflineAction } from "../types/offline";
import { OFFLINE_CONSTANTS } from "../types/offline";
import { OfflineQueue } from "./offlineQueue";

const DEFAULT_STATE: OfflineState = {
  words: [],
  lastSync: 0,
  pendingActions: [],
};

const STORAGE_LIMITS = {
  MAX_ACTIONS: 1000,
  MAX_ACTION_AGE_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
  MAX_WORDS: 10000,
  CLEANUP_THRESHOLD: 0.9, // Cleanup when 90% full
};

export class OfflineStorage {
  private static memoryFallback: OfflineState = { ...DEFAULT_STATE };
  private static currentUserId: string | null = null;
  
  private static isStorageAvailable(): boolean {
    try {
      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  static setUserId(userId: string | null) {
    this.currentUserId = userId;
    // Clear memory fallback when user changes
    this.memoryFallback = { ...DEFAULT_STATE };
  }

  private static getStorageKey(): string {
    // Use user-specific key if user is logged in
    if (this.currentUserId) {
      return `${OFFLINE_CONSTANTS.STORAGE_KEY}_${this.currentUserId}`;
    }
    return OFFLINE_CONSTANTS.STORAGE_KEY;
  }

  static getState(): OfflineState {
    if (!this.isStorageAvailable()) {
      return { ...this.memoryFallback };
    }

    try {
      const stored = localStorage.getItem(this.getStorageKey());
      if (!stored) {
        return { ...DEFAULT_STATE };
      }
      
      const state = JSON.parse(stored) as OfflineState;
      // Clean up expired actions on read
      state.pendingActions = OfflineQueue.filterValidActions(state.pendingActions);
      return state;
    } catch {
      return { ...DEFAULT_STATE };
    }
  }

  static setState(state: OfflineState): boolean {
    if (!this.isStorageAvailable()) {
      this.memoryFallback = state;
      return false;
    }

    // Apply limits before saving
    const limitedState = this.applyLimits(state);

    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(limitedState));
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clearOldData();
        // Try again with cleared data
        try {
          localStorage.setItem(this.getStorageKey(), JSON.stringify(limitedState));
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  }

  static updateState(updater: (state: OfflineState) => OfflineState): boolean {
    const currentState = this.getState();
    const newState = updater(currentState);
    return this.setState(newState);
  }

  // Word management
  static setWords(words: Word[]): boolean {
    return this.updateState(state => ({
      ...state,
      words,
      lastSync: Date.now(),
    }));
  }

  static getWords(): Word[] {
    return this.getState().words;
  }

  static updateWord(id: string, updates: Partial<Word>): boolean {
    return this.updateState(state => ({
      ...state,
      words: state.words.map(w => 
        w.id === id ? { ...w, ...updates } : w
      ),
    }));
  }

  static deleteWord(id: string): boolean {
    return this.updateState(state => ({
      ...state,
      words: state.words.filter(w => w.id !== id),
    }));
  }

  // Action queue management
  static addAction(action: OfflineAction): boolean {
    return this.updateState(state => ({
      ...state,
      pendingActions: [...state.pendingActions, action],
    }));
  }

  static getPendingActions(): OfflineAction[] {
    return this.getState().pendingActions;
  }

  static removeAction(actionId: string): boolean {
    return this.updateState(state => ({
      ...state,
      pendingActions: state.pendingActions.filter(a => a.id !== actionId),
    }));
  }

  static updateAction(actionId: string, updater: (action: OfflineAction) => OfflineAction): boolean {
    return this.updateState(state => ({
      ...state,
      pendingActions: state.pendingActions.map(a => 
        a.id === actionId ? updater(a) : a
      ),
    }));
  }

  // Utility methods
  static getLastSyncTime(): number {
    return this.getState().lastSync;
  }

  static hasPendingActions(): boolean {
    return this.getPendingActions().length > 0;
  }

  static clear(): void {
    if (this.isStorageAvailable()) {
      localStorage.removeItem(OFFLINE_CONSTANTS.STORAGE_KEY);
    }
    this.memoryFallback = { ...DEFAULT_STATE };
  }

  private static applyLimits(state: OfflineState): OfflineState {
    const limited = { ...state };
    
    // Filter expired actions
    limited.pendingActions = OfflineQueue.filterValidActions(limited.pendingActions);
    
    // Limit number of actions
    if (limited.pendingActions.length > STORAGE_LIMITS.MAX_ACTIONS) {
      // Keep newest actions
      limited.pendingActions = limited.pendingActions
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, STORAGE_LIMITS.MAX_ACTIONS);
    }
    
    // Limit number of words
    if (limited.words.length > STORAGE_LIMITS.MAX_WORDS) {
      // Word limit exceeded - keep words but note for monitoring
    }
    
    return limited;
  }

  private static clearOldData(): void {
    const state = this.getState();
    
    // Remove oldest actions (keep 10% of limit)
    const keepCount = Math.floor(STORAGE_LIMITS.MAX_ACTIONS * 0.1);
    state.pendingActions = state.pendingActions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, keepCount);
    
    // Clear old sync data if needed
    const oneWeekAgo = Date.now() - STORAGE_LIMITS.MAX_ACTION_AGE_MS;
    if (state.lastSync < oneWeekAgo) {
      state.words = [];
      state.lastSync = 0;
    }
    
    this.setState(state);
  }
}