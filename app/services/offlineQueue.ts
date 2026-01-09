import type { 
  OfflineAction,
  DeleteWordPayload,
  UpdateWordPayload,
  UpdateProgressPayload,
  StartLearningPayload
} from "../types/offline";
import { OFFLINE_CONSTANTS } from "../types/offline";

export class OfflineQueue {
  private static generateActionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static createDeleteAction(wordId: string): OfflineAction {
    return {
      id: this.generateActionId(),
      type: "DELETE_WORD",
      payload: { id: wordId } as DeleteWordPayload,
      timestamp: Date.now(),
      retries: 0,
    };
  }

  static createUpdateAction(wordId: string, updates: Record<string, unknown>): OfflineAction {
    return {
      id: this.generateActionId(),
      type: "UPDATE_WORD",
      payload: { id: wordId, updates } as UpdateWordPayload,
      timestamp: Date.now(),
      retries: 0,
    };
  }

  static createProgressAction(userId: string, wordId: string, rating: number): OfflineAction {
    return {
      id: this.generateActionId(),
      type: "UPDATE_PROGRESS",
      payload: { userId, wordId, rating } as UpdateProgressPayload,
      timestamp: Date.now(),
      retries: 0,
    };
  }

  static createStartLearningAction(userId: string, wordId: string): OfflineAction {
    return {
      id: this.generateActionId(),
      type: "START_LEARNING",
      payload: { userId, wordId } as StartLearningPayload,
      timestamp: Date.now(),
      retries: 0,
    };
  }

  static canRetry(action: OfflineAction): boolean {
    return action.retries < OFFLINE_CONSTANTS.MAX_RETRIES;
  }

  static incrementRetries(action: OfflineAction): OfflineAction {
    return {
      ...action,
      retries: action.retries + 1,
    };
  }

  static isExpired(action: OfflineAction, maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): boolean {
    return Date.now() - action.timestamp > maxAgeMs;
  }

  static filterValidActions(actions: OfflineAction[]): OfflineAction[] {
    return actions.filter(action => !this.isExpired(action));
  }
}