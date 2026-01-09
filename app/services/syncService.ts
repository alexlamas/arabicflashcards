import { WordService } from "./wordService";
import { SpacedRepetitionService } from "./spacedRepetitionService";
import { OfflineStorage } from "./offlineStorage";
import { OfflineQueue } from "./offlineQueue";
import type { Word } from "../types/word";
import type { 
  OfflineAction,
  DeleteWordPayload,
  UpdateWordPayload,
  UpdateProgressPayload,
  StartLearningPayload 
} from "../types/offline";
import { getOnlineStatus } from "../utils/connectivity";

interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: Error[];
}

export class SyncService {
  private static syncInProgress = false;
  private static listeners: ((syncing: boolean) => void)[] = [];

  static addSyncListener(listener: (syncing: boolean) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notifyListeners(syncing: boolean): void {
    this.listeners.forEach((listener) => {
      try {
        listener(syncing);
      } catch (error) {
        console.error("Error in sync listener:", error);
      }
    });
  }

  private static async syncAction(action: OfflineAction): Promise<void> {
    // Type guard to ensure payload matches action type
    switch (action.type) {
      case "DELETE_WORD": {
        if (!this.isDeleteWordPayload(action.payload)) {
          throw new Error("Invalid DELETE_WORD payload");
        }
        await WordService.deleteWord(action.payload.id);
        break;
      }
      
      case "UPDATE_WORD": {
        if (!this.isUpdateWordPayload(action.payload)) {
          throw new Error("Invalid UPDATE_WORD payload");
        }
        try {
          await WordService.updateWord(action.payload.id, action.payload.updates);
        } catch (error) {
          // If word doesn't exist, skip the update instead of failing
          if (error instanceof Error && error.message.includes("not found")) {
            console.warn(`Word ${action.payload.id} not found, skipping update`);
          } else {
            throw error;
          }
        }
        break;
      }
      
      case "UPDATE_PROGRESS": {
        if (!this.isUpdateProgressPayload(action.payload)) {
          throw new Error("Invalid UPDATE_PROGRESS payload");
        }
        await SpacedRepetitionService.processReview(
          action.payload.userId,
          action.payload.wordId,
          action.payload.rating
        );
        break;
      }

      case "START_LEARNING": {
        if (!this.isStartLearningPayload(action.payload)) {
          throw new Error("Invalid START_LEARNING payload");
        }
        await SpacedRepetitionService.startLearning(
          action.payload.userId,
          action.payload.wordId
        );
        break;
      }
      
      default:
        const exhaustiveCheck: never = action.type;
        throw new Error(`Unknown action type: ${exhaustiveCheck}`);
    }
  }

  // Type guards for payload validation
  private static isDeleteWordPayload(payload: unknown): payload is DeleteWordPayload {
    return typeof payload === "object" && payload !== null && "id" in payload;
  }

  private static isUpdateWordPayload(payload: unknown): payload is UpdateWordPayload {
    return typeof payload === "object" && payload !== null && "id" in payload && "updates" in payload;
  }

  private static isUpdateProgressPayload(payload: unknown): payload is UpdateProgressPayload {
    return typeof payload === "object" && payload !== null &&
      "userId" in payload && "wordId" in payload && "rating" in payload;
  }

  private static isStartLearningPayload(payload: unknown): payload is StartLearningPayload {
    return typeof payload === "object" && payload !== null &&
      "userId" in payload && "wordId" in payload;
  }

  static async syncPendingActions(): Promise<SyncResult> {
    if (this.syncInProgress) {
      return {
        success: false,
        syncedCount: 0,
        failedCount: 0,
        errors: [new Error("Sync already in progress")],
      };
    }
    
    if (!getOnlineStatus()) {
      return {
        success: false,
        syncedCount: 0,
        failedCount: 0,
        errors: [new Error("No internet connection")],
      };
    }
    
    this.syncInProgress = true;
    this.notifyListeners(true);
    
    const result: SyncResult = {
      success: true,
      syncedCount: 0,
      failedCount: 0,
      errors: [],
    };
    
    try {
      const actions = OfflineStorage.getPendingActions();
      
      for (const action of actions) {
        try {
          await this.syncAction(action);
          OfflineStorage.removeAction(action.id);
          result.syncedCount++;
        } catch (error) {
          console.error(`Failed to sync action ${action.type}:`, error);
          OfflineStorage.updateAction(action.id, OfflineQueue.incrementRetries);
          result.failedCount++;
          result.errors.push(error instanceof Error ? error : new Error(String(error)));
        }
      }
      
      // Refresh data after sync
      try {
        const freshWords = await WordService.getAllWords();
        OfflineStorage.setWords(freshWords);
      } catch (error) {
        console.error("Failed to refresh words after sync:", error);
        result.errors.push(error instanceof Error ? error : new Error("Failed to refresh data"));
      }
      
      result.success = result.failedCount === 0;
      return result;
    } catch (error) {
      console.error("Sync failed:", error);
      return {
        success: false,
        syncedCount: result.syncedCount,
        failedCount: result.failedCount,
        errors: [...result.errors, error instanceof Error ? error : new Error(String(error))],
      };
    } finally {
      this.syncInProgress = false;
      this.notifyListeners(false);
    }
  }

  static async loadInitialData(): Promise<Word[]> {
    try {
      if (getOnlineStatus()) {
        const words = await WordService.getAllWords();
        OfflineStorage.setWords(words);
        return words;
      }
    } catch (error) {
      console.error("Failed to load data from server:", error);
    }
    
    // Fallback to offline data
    const offlineWords = OfflineStorage.getWords();
    if (offlineWords.length > 0) {
      console.log("Using offline data");
      return offlineWords;
    }
    
    throw new Error("No data available");
  }

  static isOnline(): boolean {
    return getOnlineStatus();
  }

  static isSyncing(): boolean {
    return this.syncInProgress;
  }

  static setupConnectivityListeners(): () => void {
    const handleOnline = async () => {
      console.log("Connection restored, syncing...");
      if (OfflineStorage.hasPendingActions()) {
        const result = await this.syncPendingActions();
        console.log(`Sync completed: ${result.syncedCount} synced, ${result.failedCount} failed`);
      }
    };

    const handleOffline = () => {
      console.log("Connection lost, working offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }
}