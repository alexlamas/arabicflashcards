import type { Word } from "./word";

export type OfflineActionType = "DELETE_WORD" | "UPDATE_WORD" | "UPDATE_PROGRESS" | "START_LEARNING";

export interface DeleteWordPayload {
  id: string;
}

export interface UpdateWordPayload {
  id: string;
  updates: Partial<Word>;
}

export interface UpdateProgressPayload {
  userId: string;
  wordId: string;
  rating: number;
}

export interface StartLearningPayload {
  userId: string;
  wordId: string;
}

export type OfflineActionPayload = 
  | DeleteWordPayload 
  | UpdateWordPayload 
  | UpdateProgressPayload 
  | StartLearningPayload;

export interface OfflineAction {
  id: string;
  type: OfflineActionType;
  payload: OfflineActionPayload;
  timestamp: number;
  retries: number;
}

export interface OfflineState {
  words: Word[];
  lastSync: number;
  pendingActions: OfflineAction[];
}

export const OFFLINE_CONSTANTS = {
  STORAGE_KEY: "arabicflashcards_offline",
  MAX_RETRIES: 3,
  SYNC_CHECK_INTERVAL: 5000,
} as const;