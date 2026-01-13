import { vi } from "vitest";

/**
 * Mock for PostHog analytics
 * Use with: vi.mock("posthog-js", () => ({ default: posthogMock }))
 */
export const posthogMock = {
  init: vi.fn(),
  identify: vi.fn(),
  capture: vi.fn(),
  reset: vi.fn(),
  opt_out_capturing: vi.fn(),
  opt_in_capturing: vi.fn(),
  has_opted_out_capturing: vi.fn(() => false),
  has_opted_in_capturing: vi.fn(() => true),
  get_distinct_id: vi.fn(() => "test-distinct-id"),
  register: vi.fn(),
  unregister: vi.fn(),
  get_property: vi.fn(),
  people: {
    set: vi.fn(),
    set_once: vi.fn(),
    unset: vi.fn(),
    increment: vi.fn(),
    append: vi.fn(),
    union: vi.fn(),
    remove: vi.fn(),
  },
  featureFlags: {
    getFlags: vi.fn(() => []),
    isFeatureEnabled: vi.fn(() => false),
    reloadFeatureFlags: vi.fn(),
    onFeatureFlags: vi.fn(),
  },
  getFeatureFlag: vi.fn(() => undefined),
  isFeatureEnabled: vi.fn(() => false),
  onFeatureFlags: vi.fn(),
  reloadFeatureFlags: vi.fn(),
};

/**
 * Create a fresh PostHog mock with optional overrides
 */
export function createPostHogMock(overrides?: Partial<typeof posthogMock>) {
  return {
    ...posthogMock,
    ...overrides,
  };
}

/**
 * Reset all PostHog mock functions
 */
export function resetPostHogMock() {
  Object.values(posthogMock).forEach((value) => {
    if (typeof value === "function" && "mockReset" in value) {
      (value as ReturnType<typeof vi.fn>).mockReset();
    }
    if (typeof value === "object" && value !== null) {
      Object.values(value).forEach((nested) => {
        if (typeof nested === "function" && "mockReset" in nested) {
          (nested as ReturnType<typeof vi.fn>).mockReset();
        }
      });
    }
  });
}

/**
 * Module mock for vi.mock("posthog-js")
 */
export const posthogModuleMock = {
  default: posthogMock,
  PostHog: vi.fn(() => posthogMock),
};
