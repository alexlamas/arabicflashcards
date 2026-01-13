import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { AuthProvider } from "../AuthProvider";
import { useAuth } from "../../contexts/AuthContext";

// Use vi.hoisted to create mocks before vi.mock calls
const { supabaseMock, mockPostHog, mockSubscription, getAuthChangeCallback, setAuthChangeCallback } = vi.hoisted(() => {
  let authChangeCallback: ((event: string, session: unknown) => void) | null = null;

  const mockSubscription = {
    unsubscribe: vi.fn(),
  };

  const mockPostHog = {
    identify: vi.fn(),
    capture: vi.fn(),
  };

  const chainableMock = {
    auth: {
      getSession: vi.fn(() =>
        Promise.resolve({ data: { session: null }, error: null })
      ),
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      onAuthStateChange: vi.fn((callback: (event: string, session: unknown) => void) => {
        authChangeCallback = callback;
        return { data: { subscription: mockSubscription } };
      }),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
    },
  };

  return {
    supabaseMock: {
      mock: chainableMock,
    },
    mockPostHog,
    mockSubscription,
    getAuthChangeCallback: () => authChangeCallback,
    setAuthChangeCallback: (cb: typeof authChangeCallback) => { authChangeCallback = cb; },
  };
});

vi.mock("@/utils/supabase/client", () => ({
  createClient: vi.fn(() => supabaseMock.mock),
}));

vi.mock("posthog-js", () => ({
  default: mockPostHog,
}));

// Test component to access auth context
function TestConsumer() {
  const { session, isLoading, showAuthDialog, setShowAuthDialog, handleLogout } =
    useAuth();
  return (
    <div>
      <div data-testid="loading">{isLoading ? "loading" : "ready"}</div>
      <div data-testid="session">{session ? "authenticated" : "anonymous"}</div>
      <div data-testid="dialog">{showAuthDialog ? "open" : "closed"}</div>
      <button onClick={() => setShowAuthDialog(true)}>Open Dialog</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAuthChangeCallback(null);

    // Reset auth mock implementations
    supabaseMock.mock.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    supabaseMock.mock.auth.signOut.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("should render children", async () => {
      render(
        <AuthProvider>
          <div data-testid="child">Hello</div>
        </AuthProvider>
      );

      expect(screen.getByTestId("child")).toHaveTextContent("Hello");
    });

    it("should start with loading state", async () => {
      // Don't resolve getSession immediately
      supabaseMock.mock.auth.getSession.mockImplementation(
        () => new Promise(() => {})
      );

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      expect(screen.getByTestId("loading")).toHaveTextContent("loading");
    });

    it("should finish loading after getSession resolves", async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("ready");
      });
    });

    it("should set up auth state change listener", async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(supabaseMock.mock.auth.onAuthStateChange).toHaveBeenCalled();
      });
    });

    it("should clean up subscription on unmount", async () => {
      const { unmount } = render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("ready");
      });

      unmount();

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });
  });

  describe("session management", () => {
    it("should initialize with no session", async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("session")).toHaveTextContent("anonymous");
      });
    });

    it("should initialize with existing session", async () => {
      const mockSession = {
        user: { id: "user-1", email: "test@example.com" },
        access_token: "token",
      };

      supabaseMock.mock.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("session")).toHaveTextContent("authenticated");
      });
    });

    it("should update session on auth state change", async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("session")).toHaveTextContent("anonymous");
      });

      // Simulate sign in via auth state change
      const mockSession = {
        user: { id: "user-1", email: "test@example.com" },
        access_token: "token",
      };

      const authCallback = getAuthChangeCallback();
      act(() => {
        authCallback?.("SIGNED_IN", mockSession);
      });

      await waitFor(() => {
        expect(screen.getByTestId("session")).toHaveTextContent("authenticated");
      });
    });
  });

  describe("PostHog integration", () => {
    it("should identify user on SIGNED_IN event", async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("ready");
      });

      const mockSession = {
        user: { id: "user-123", email: "test@example.com" },
        access_token: "token",
      };

      const authCallback = getAuthChangeCallback();
      act(() => {
        authCallback?.("SIGNED_IN", mockSession);
      });

      await waitFor(() => {
        expect(mockPostHog.identify).toHaveBeenCalledWith("user-123", {
          email: "test@example.com",
        });
      });
    });

    it("should capture signup_completed event on SIGNED_IN", async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("ready");
      });

      const mockSession = {
        user: { id: "user-123", email: "test@example.com" },
        access_token: "token",
      };

      const authCallback = getAuthChangeCallback();
      act(() => {
        authCallback?.("SIGNED_IN", mockSession);
      });

      await waitFor(() => {
        expect(mockPostHog.capture).toHaveBeenCalledWith("signup_completed");
      });
    });

    it("should not call PostHog on other auth events", async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("ready");
      });

      const authCallback = getAuthChangeCallback();
      act(() => {
        authCallback?.("SIGNED_OUT", null);
      });

      expect(mockPostHog.identify).not.toHaveBeenCalled();
      expect(mockPostHog.capture).not.toHaveBeenCalled();
    });
  });

  describe("auth dialog", () => {
    it("should start with dialog closed", async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("dialog")).toHaveTextContent("closed");
      });
    });

    it("should allow opening dialog via setShowAuthDialog", async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("ready");
      });

      act(() => {
        screen.getByText("Open Dialog").click();
      });

      expect(screen.getByTestId("dialog")).toHaveTextContent("open");
    });

    it("should close dialog on auth state change", async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("ready");
      });

      // Open dialog
      act(() => {
        screen.getByText("Open Dialog").click();
      });

      expect(screen.getByTestId("dialog")).toHaveTextContent("open");

      // Simulate auth state change (sign in)
      const mockSession = {
        user: { id: "user-1", email: "test@example.com" },
        access_token: "token",
      };

      const authCallback = getAuthChangeCallback();
      act(() => {
        authCallback?.("SIGNED_IN", mockSession);
      });

      await waitFor(() => {
        expect(screen.getByTestId("dialog")).toHaveTextContent("closed");
      });
    });
  });

  describe("logout", () => {
    it("should call signOut on logout", async () => {
      const mockSession = {
        user: { id: "user-1", email: "test@example.com" },
        access_token: "token",
      };

      supabaseMock.mock.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("session")).toHaveTextContent("authenticated");
      });

      await act(async () => {
        screen.getByText("Logout").click();
      });

      expect(supabaseMock.mock.auth.signOut).toHaveBeenCalled();
    });

    it("should clear session on logout", async () => {
      const mockSession = {
        user: { id: "user-1", email: "test@example.com" },
        access_token: "token",
      };

      supabaseMock.mock.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("session")).toHaveTextContent("authenticated");
      });

      await act(async () => {
        screen.getByText("Logout").click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("session")).toHaveTextContent("anonymous");
      });
    });

    it("should handle logout errors gracefully", async () => {
      supabaseMock.mock.auth.signOut.mockRejectedValue(new Error("Network error"));

      const mockSession = {
        user: { id: "user-1", email: "test@example.com" },
        access_token: "token",
      };

      supabaseMock.mock.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("session")).toHaveTextContent("authenticated");
      });

      // Should not throw
      await act(async () => {
        screen.getByText("Logout").click();
      });

      // Should finish loading even on error
      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("ready");
      });
    });
  });
});
