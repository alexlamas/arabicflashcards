import { calculateMemoryStability, calculateSuccessRate, getStabilityLevel } from './memoryStability';

describe('Memory Stability Calculations', () => {
  describe('calculateMemoryStability', () => {
    it('should return 0 for brand new words', () => {
      expect(calculateMemoryStability({ interval: 0, successRate: 0, reviewCount: 0 })).toBe(0);
    });

    it('should handle edge cases gracefully', () => {
      // Negative values should be clamped to 0
      expect(calculateMemoryStability({ interval: -10, successRate: -1 })).toBe(0);
      
      // Very high values should be clamped to 100
      expect(calculateMemoryStability({ interval: 1000, successRate: 2, reviewCount: 100 })).toBe(100);
    });

    it('should progressively increase with interval', () => {
      const day1 = calculateMemoryStability({ interval: 1 });
      const day7 = calculateMemoryStability({ interval: 7 });
      const day30 = calculateMemoryStability({ interval: 30 });
      
      expect(day7).toBeGreaterThan(day1);
      expect(day30).toBeGreaterThan(day7);
    });

    it('should factor in success rate', () => {
      const lowSuccess = calculateMemoryStability({ interval: 7, successRate: 0.2 });
      const highSuccess = calculateMemoryStability({ interval: 7, successRate: 0.9 });
      
      expect(highSuccess).toBeGreaterThan(lowSuccess);
    });
  });

  describe('calculateSuccessRate', () => {
    it('should return correct rate for first review', () => {
      expect(calculateSuccessRate(null, 0, true)).toBe(1);
      expect(calculateSuccessRate(null, 0, false)).toBe(0);
    });

    it('should calculate rolling average correctly', () => {
      // If current rate is 0.8 after 4 reviews, and we succeed the 5th
      // New rate should be (0.8 * 4 + 1) / 5 = 0.84
      expect(calculateSuccessRate(0.8, 4, true)).toBeCloseTo(0.84);
      
      // If we fail instead
      // New rate should be (0.8 * 4 + 0) / 5 = 0.64
      expect(calculateSuccessRate(0.8, 4, false)).toBeCloseTo(0.64);
    });

    it('should handle edge cases', () => {
      expect(calculateSuccessRate(undefined, 0, true)).toBe(1);
      expect(calculateSuccessRate(1.5, 10, true)).toBe(1); // Clamp to max
      expect(calculateSuccessRate(-0.5, 10, false)).toBeGreaterThanOrEqual(0); // Clamp to min
    });
  });

  describe('getStabilityLevel', () => {
    it('should return correct levels for different scores', () => {
      expect(getStabilityLevel(10).level).toBe('just_started');
      expect(getStabilityLevel(30).level).toBe('building');
      expect(getStabilityLevel(50).level).toBe('developing');
      expect(getStabilityLevel(70).level).toBe('strong');
      expect(getStabilityLevel(90).level).toBe('mastered');
    });
  });
});