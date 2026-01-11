import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { isClientSide, getOnlineStatus, isBrowser } from "../connectivity";

describe("connectivity", () => {
  const originalWindow = global.window;
  const originalNavigator = global.navigator;

  afterEach(() => {
    // Restore original globals
    global.window = originalWindow;
    global.navigator = originalNavigator;
    vi.restoreAllMocks();
  });

  describe("isClientSide", () => {
    it("should return true when window is defined", () => {
      // jsdom provides window by default
      expect(isClientSide()).toBe(true);
    });

    it("should return false when window is undefined", () => {
      // @ts-expect-error - intentionally setting window to undefined for testing
      delete global.window;
      expect(isClientSide()).toBe(false);
    });
  });

  describe("getOnlineStatus", () => {
    it("should return true when navigator.onLine is true", () => {
      Object.defineProperty(navigator, "onLine", {
        value: true,
        configurable: true,
      });
      expect(getOnlineStatus()).toBe(true);
    });

    it("should return false when navigator.onLine is false", () => {
      Object.defineProperty(navigator, "onLine", {
        value: false,
        configurable: true,
      });
      expect(getOnlineStatus()).toBe(false);
    });

    it("should return true (default) during SSR when window is undefined", () => {
      // @ts-expect-error - intentionally setting window to undefined for testing
      delete global.window;
      expect(getOnlineStatus()).toBe(true);
    });
  });

  describe("isBrowser", () => {
    it("should return true when both window and navigator are defined", () => {
      // jsdom provides both by default
      expect(isBrowser()).toBe(true);
    });

    it("should return false when window is undefined", () => {
      // @ts-expect-error - intentionally setting window to undefined for testing
      delete global.window;
      expect(isBrowser()).toBe(false);
    });

    it("should return false when navigator is undefined", () => {
      // @ts-expect-error - intentionally setting navigator to undefined for testing
      delete global.navigator;
      expect(isBrowser()).toBe(false);
    });
  });

  describe("online/offline event handling", () => {
    it("should detect when browser goes offline via navigator.onLine", () => {
      // Start online
      Object.defineProperty(navigator, "onLine", {
        value: true,
        configurable: true,
        writable: true,
      });
      expect(getOnlineStatus()).toBe(true);

      // Simulate going offline
      Object.defineProperty(navigator, "onLine", {
        value: false,
        configurable: true,
        writable: true,
      });
      expect(getOnlineStatus()).toBe(false);
    });

    it("should detect when browser comes back online via navigator.onLine", () => {
      // Start offline
      Object.defineProperty(navigator, "onLine", {
        value: false,
        configurable: true,
        writable: true,
      });
      expect(getOnlineStatus()).toBe(false);

      // Simulate coming back online
      Object.defineProperty(navigator, "onLine", {
        value: true,
        configurable: true,
        writable: true,
      });
      expect(getOnlineStatus()).toBe(true);
    });

    it("should allow subscribing to online/offline events", () => {
      const onlineHandler = vi.fn();
      const offlineHandler = vi.fn();

      window.addEventListener("online", onlineHandler);
      window.addEventListener("offline", offlineHandler);

      // Simulate offline event
      window.dispatchEvent(new Event("offline"));
      expect(offlineHandler).toHaveBeenCalledTimes(1);
      expect(onlineHandler).not.toHaveBeenCalled();

      // Simulate online event
      window.dispatchEvent(new Event("online"));
      expect(onlineHandler).toHaveBeenCalledTimes(1);
      expect(offlineHandler).toHaveBeenCalledTimes(1);

      // Cleanup
      window.removeEventListener("online", onlineHandler);
      window.removeEventListener("offline", offlineHandler);
    });
  });
});
