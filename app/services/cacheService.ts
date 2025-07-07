import { Word, WordProgress } from "../types/word";

const CACHE_KEYS = {
  WORDS: "arabic_flashcards_words",
  PROGRESS: "arabic_flashcards_progress",
  LAST_SYNC: "arabic_flashcards_last_sync",
  REVIEW_COUNT: "arabic_flashcards_review_count",
};

const CACHE_VERSION = "1";

export class CacheService {
  private static isLocalStorageAvailable(): boolean {
    try {
      const test = "__localStorage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  static saveWords(words: Word[]): void {
    if (!this.isLocalStorageAvailable()) return;
    
    try {
      const cacheData = {
        version: CACHE_VERSION,
        data: words,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEYS.WORDS, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Failed to cache words:", error);
    }
  }

  static getWords(): Word[] | null {
    if (!this.isLocalStorageAvailable()) return null;
    
    try {
      const cached = localStorage.getItem(CACHE_KEYS.WORDS);
      if (!cached) return null;
      
      const cacheData = JSON.parse(cached);
      if (cacheData.version !== CACHE_VERSION) {
        this.clearCache();
        return null;
      }
      
      return cacheData.data;
    } catch (error) {
      console.error("Failed to retrieve cached words:", error);
      return null;
    }
  }

  static saveProgress(progress: Record<string, WordProgress>): void {
    if (!this.isLocalStorageAvailable()) return;
    
    try {
      const cacheData = {
        version: CACHE_VERSION,
        data: progress,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEYS.PROGRESS, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Failed to cache progress:", error);
    }
  }

  static getProgress(): Record<string, WordProgress> | null {
    if (!this.isLocalStorageAvailable()) return null;
    
    try {
      const cached = localStorage.getItem(CACHE_KEYS.PROGRESS);
      if (!cached) return null;
      
      const cacheData = JSON.parse(cached);
      if (cacheData.version !== CACHE_VERSION) {
        return null;
      }
      
      return cacheData.data;
    } catch (error) {
      console.error("Failed to retrieve cached progress:", error);
      return null;
    }
  }

  static saveReviewCount(count: number): void {
    if (!this.isLocalStorageAvailable()) return;
    
    try {
      localStorage.setItem(CACHE_KEYS.REVIEW_COUNT, count.toString());
    } catch (error) {
      console.error("Failed to cache review count:", error);
    }
  }

  static getReviewCount(): number | null {
    if (!this.isLocalStorageAvailable()) return null;
    
    try {
      const cached = localStorage.getItem(CACHE_KEYS.REVIEW_COUNT);
      return cached ? parseInt(cached, 10) : null;
    } catch (error) {
      console.error("Failed to retrieve cached review count:", error);
      return null;
    }
  }

  static setLastSyncTime(): void {
    if (!this.isLocalStorageAvailable()) return;
    
    try {
      localStorage.setItem(CACHE_KEYS.LAST_SYNC, Date.now().toString());
    } catch (error) {
      console.error("Failed to set last sync time:", error);
    }
  }

  static getLastSyncTime(): number | null {
    if (!this.isLocalStorageAvailable()) return null;
    
    try {
      const time = localStorage.getItem(CACHE_KEYS.LAST_SYNC);
      return time ? parseInt(time, 10) : null;
    } catch (error) {
      console.error("Failed to get last sync time:", error);
      return null;
    }
  }

  static isCacheStale(maxAgeMinutes: number = 60): boolean {
    const lastSync = this.getLastSyncTime();
    if (!lastSync) return true;
    
    const now = Date.now();
    const ageMinutes = (now - lastSync) / (1000 * 60);
    return ageMinutes > maxAgeMinutes;
  }

  static clearCache(): void {
    if (!this.isLocalStorageAvailable()) return;
    
    try {
      Object.values(CACHE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error("Failed to clear cache:", error);
    }
  }
}