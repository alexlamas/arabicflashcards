import { describe, it, expect, beforeEach, vi } from "vitest";
import { getCurrentPeriod } from "../aiUsageService";

describe("aiUsageService", () => {
  describe("getCurrentPeriod", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it("should return YYYY-MM format", () => {
      vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
      expect(getCurrentPeriod()).toBe("2024-01");
    });

    it("should pad single-digit months with zero", () => {
      vi.setSystemTime(new Date("2024-03-15T12:00:00Z"));
      expect(getCurrentPeriod()).toBe("2024-03");

      vi.setSystemTime(new Date("2024-09-15T12:00:00Z"));
      expect(getCurrentPeriod()).toBe("2024-09");
    });

    it("should not pad double-digit months", () => {
      vi.setSystemTime(new Date("2024-10-15T12:00:00Z"));
      expect(getCurrentPeriod()).toBe("2024-10");

      vi.setSystemTime(new Date("2024-12-15T12:00:00Z"));
      expect(getCurrentPeriod()).toBe("2024-12");
    });

    it("should handle year boundaries", () => {
      vi.setSystemTime(new Date("2023-12-31T23:59:59Z"));
      expect(getCurrentPeriod()).toBe("2023-12");

      vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
      expect(getCurrentPeriod()).toBe("2024-01");
    });
  });
});
