import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Use vi.hoisted to create mocks before vi.mock calls
const { mockGetDueWords, mockProcessReview, mockGetSentencesForWord, mockPostHog } = vi.hoisted(() => {
  return {
    mockGetDueWords: vi.fn(),
    mockProcessReview: vi.fn(),
    mockGetSentencesForWord: vi.fn(),
    mockPostHog: {
      capture: vi.fn(),
    },
  };
});

vi.mock("../../../services/spacedRepetitionService", () => ({
  SpacedRepetitionService: {
    getDueWords: mockGetDueWords,
    processReview: mockProcessReview,
  },
}));

vi.mock("../../../services/sentenceService", () => ({
  SentenceService: {
    getSentencesForWord: mockGetSentencesForWord,
  },
}));

vi.mock("../../../contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    session: { user: { id: "user-1", email: "test@example.com" } },
  })),
}));

vi.mock("../../../contexts/WordsContext", () => ({
  useWords: vi.fn(() => ({
    fetchReviewCount: vi.fn(),
  })),
}));

vi.mock("../../../hooks/useOfflineSync", () => ({
  useOfflineSync: vi.fn(() => ({
    handleOfflineAction: vi.fn((onlineAction) => onlineAction()),
  })),
  offlineHelpers: {
    updateProgress: vi.fn(),
  },
}));

vi.mock("../../../hooks/useAIUsage", () => ({
  useAIUsage: vi.fn(() => ({
    refresh: vi.fn(),
  })),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

vi.mock("posthog-js", () => ({
  default: mockPostHog,
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock the WordDetailModal
vi.mock("../../WordDetailModal", () => ({
  WordDetailModal: vi.fn(() => null),
}));

// Mock the BoostReview component
vi.mock("../BoostReview", () => ({
  default: vi.fn(() => <div data-testid="boost-review">Boost Review</div>),
}));

import { Review } from "../Review";

// Test fixtures
const mockWord = {
  id: "word-1",
  english: "Hello",
  arabic: "مرحبا",
  transliteration: "marhaba",
  type: "phrase" as const,
  pack_id: null,
  user_id: "user-1",
  notes: "Common greeting",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const mockSentence = {
  id: "sentence-1",
  arabic: "مرحبا، كيف حالك؟",
  transliteration: "marhaba, kif halak?",
  english: "Hello, how are you?",
  pack_id: null,
  user_id: "user-1",
  created_at: "2024-01-01T00:00:00Z",
};

describe("Review", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockGetDueWords.mockResolvedValue([mockWord]);
    mockProcessReview.mockResolvedValue({
      nextReview: new Date("2024-01-02T00:00:00Z"),
    });
    mockGetSentencesForWord.mockResolvedValue([mockSentence]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("loading state", () => {
    it("should load and display a word", async () => {
      render(<Review />);

      await waitFor(() => {
        expect(screen.getByText("Hello")).toBeInTheDocument();
      });
    });

    it("should call getDueWords with correct parameters", async () => {
      render(<Review />);

      await waitFor(() => {
        expect(mockGetDueWords).toHaveBeenCalledWith("user-1", 1);
      });
    });

    it("should show BoostReview when no words due", async () => {
      mockGetDueWords.mockResolvedValue([]);

      render(<Review />);

      await waitFor(() => {
        expect(screen.getByTestId("boost-review")).toBeInTheDocument();
      });
    });
  });

  describe("card flip", () => {
    it("should show English on front of card", async () => {
      render(<Review />);

      await waitFor(() => {
        expect(screen.getByText("Hello")).toBeInTheDocument();
      });
    });

    it("should flip card on click to show Arabic", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<Review />);

      await waitFor(() => {
        expect(screen.getByText("Hello")).toBeInTheDocument();
      });

      // Click to flip
      const card = screen.getByText("Hello").closest(".cursor-pointer");
      if (card) {
        await user.click(card);
      }

      await waitFor(() => {
        expect(screen.getByText("مرحبا")).toBeInTheDocument();
        expect(screen.getByText("marhaba")).toBeInTheDocument();
      });
    });
  });

  describe("rating buttons", () => {
    it("should show rating buttons when card is flipped", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<Review />);

      await waitFor(() => {
        expect(screen.getByText("Hello")).toBeInTheDocument();
      });

      // Flip card
      const card = screen.getByText("Hello").closest(".cursor-pointer");
      if (card) {
        await user.click(card);
      }

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /forgot/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /struggled/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /remembered/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /perfect/i })).toBeInTheDocument();
      });
    });

    it("should call processReview with rating 0 for Forgot", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<Review />);

      await waitFor(() => {
        expect(screen.getByText("Hello")).toBeInTheDocument();
      });

      // Flip card
      const card = screen.getByText("Hello").closest(".cursor-pointer");
      if (card) {
        await user.click(card);
      }

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /forgot/i })).toBeInTheDocument();
      });

      // Click Forgot
      await user.click(screen.getByRole("button", { name: /forgot/i }));

      expect(mockProcessReview).toHaveBeenCalledWith("user-1", "word-1", 0);
    });

    it("should call processReview with rating 3 for Perfect", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<Review />);

      await waitFor(() => {
        expect(screen.getByText("Hello")).toBeInTheDocument();
      });

      // Flip card
      const card = screen.getByText("Hello").closest(".cursor-pointer");
      if (card) {
        await user.click(card);
      }

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /perfect/i })).toBeInTheDocument();
      });

      // Click Perfect
      await user.click(screen.getByRole("button", { name: /perfect/i }));

      expect(mockProcessReview).toHaveBeenCalledWith("user-1", "word-1", 3);
    });

    it("should capture PostHog event on rating", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<Review />);

      await waitFor(() => {
        expect(screen.getByText("Hello")).toBeInTheDocument();
      });

      // Flip card
      const card = screen.getByText("Hello").closest(".cursor-pointer");
      if (card) {
        await user.click(card);
      }

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /remembered/i })).toBeInTheDocument();
      });

      // Click Remembered
      await user.click(screen.getByRole("button", { name: /remembered/i }));

      expect(mockPostHog.capture).toHaveBeenCalledWith("word_reviewed", { rating: 2 });
    });
  });

  describe("hint functionality", () => {
    it("should show Get a hint button on front of card", async () => {
      render(<Review />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /get a hint/i })).toBeInTheDocument();
      });
    });

    it("should show Notes button when word has notes", async () => {
      render(<Review />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /notes/i })).toBeInTheDocument();
      });
    });

    it("should not show Notes button when word has no notes", async () => {
      mockGetDueWords.mockResolvedValue([{ ...mockWord, notes: null }]);

      render(<Review />);

      await waitFor(() => {
        expect(screen.getByText("Hello")).toBeInTheDocument();
      });

      expect(screen.queryByRole("button", { name: /notes/i })).not.toBeInTheDocument();
    });
  });

  describe("sentences", () => {
    it("should fetch sentences when word is loaded", async () => {
      render(<Review />);

      await waitFor(() => {
        expect(mockGetSentencesForWord).toHaveBeenCalledWith("word-1");
      });
    });

    it("should display sentence after flipping card", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<Review />);

      await waitFor(() => {
        expect(screen.getByText("Hello")).toBeInTheDocument();
      });

      // Flip card
      const card = screen.getByText("Hello").closest(".cursor-pointer");
      if (card) {
        await user.click(card);
      }

      await waitFor(() => {
        expect(screen.getByText("مرحبا، كيف حالك؟")).toBeInTheDocument();
        expect(screen.getByText("Hello, how are you?")).toBeInTheDocument();
      });
    });
  });

  describe("error handling", () => {
    it("should show error message when loading fails", async () => {
      mockGetDueWords.mockRejectedValue(new Error("Network error"));

      render(<Review />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load words/i)).toBeInTheDocument();
      });
    });

    it("should show Try again button on error", async () => {
      mockGetDueWords.mockRejectedValue(new Error("Network error"));

      render(<Review />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
      });
    });

    it("should retry loading when Try again is clicked", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockGetDueWords.mockRejectedValueOnce(new Error("Network error"));
      mockGetDueWords.mockResolvedValueOnce([mockWord]);

      render(<Review />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /try again/i }));

      await waitFor(() => {
        expect(mockGetDueWords).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("word modal", () => {
    it("should have Open button when card is flipped", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<Review />);

      await waitFor(() => {
        expect(screen.getByText("Hello")).toBeInTheDocument();
      });

      // Flip card
      const card = screen.getByText("Hello").closest(".cursor-pointer");
      if (card) {
        await user.click(card);
      }

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /open/i })).toBeInTheDocument();
      });
    });
  });
});
