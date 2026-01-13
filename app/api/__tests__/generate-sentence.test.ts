import { describe, it, expect, beforeEach, vi } from "vitest";

// Use vi.hoisted to create mocks before vi.mock calls
const { mockCheckAIUsage, mockIncrementUsage, mockGenerateSentence, supabaseMock } = vi.hoisted(() => {
  const mockResult: { data: unknown; error: unknown } = { data: null, error: null };

  const chainableMock = {
    from: vi.fn(() => chainableMock),
    select: vi.fn(() => chainableMock),
    eq: vi.fn(() => chainableMock),
    single: vi.fn(() => Promise.resolve(mockResult)),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    },
  };

  return {
    mockCheckAIUsage: vi.fn(),
    mockIncrementUsage: vi.fn(),
    mockGenerateSentence: vi.fn(),
    supabaseMock: {
      mock: chainableMock,
      setUser: (user: { id: string; email?: string } | null) => {
        chainableMock.auth.getUser.mockResolvedValue({
          data: { user },
          error: null,
        });
      },
    },
  };
});

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({})),
}));

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(supabaseMock.mock)),
}));

vi.mock("@/app/services/aiUsageService", () => ({
  checkAIUsage: mockCheckAIUsage,
  incrementUsage: mockIncrementUsage,
}));

vi.mock("@/app/services/claudeService", () => ({
  ClaudeService: {
    generateSentence: mockGenerateSentence,
  },
}));

// Import route handler after mocks are set up
import { POST } from "../generate-sentence/route";

// Test fixtures
const mockUser = { id: "user-1", email: "test@example.com" };

const mockSentence = {
  arabic: "أنا أحب القهوة",
  transliteration: "ana uhibb al-qahwa",
  english: "I love coffee",
};

function createRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/generate-sentence", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/generate-sentence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMock.setUser(null);
    mockCheckAIUsage.mockResolvedValue({ allowed: true, remaining: 10 });
    mockIncrementUsage.mockResolvedValue(undefined);
    mockGenerateSentence.mockResolvedValue(mockSentence);
  });

  describe("authentication", () => {
    it("should return 401 when not authenticated", async () => {
      supabaseMock.setUser(null);

      const req = createRequest({ word: "coffee" });
      const response = await POST(req);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Authentication required");
    });

    it("should proceed when authenticated", async () => {
      supabaseMock.setUser(mockUser);

      const req = createRequest({ word: "coffee" });
      const response = await POST(req);

      expect(response.status).toBe(200);
    });
  });

  describe("AI usage limits", () => {
    it("should return 429 when AI usage limit reached", async () => {
      supabaseMock.setUser(mockUser);
      mockCheckAIUsage.mockResolvedValue({
        allowed: false,
        reason: "Monthly AI limit reached (20 uses). Resets next month.",
      });

      const req = createRequest({ word: "coffee" });
      const response = await POST(req);

      expect(response.status).toBe(429);
      const data = await response.json();
      expect(data.error).toBe("Monthly AI limit reached (20 uses). Resets next month.");
      expect(data.limitReached).toBe(true);
    });

    it("should check AI usage with correct user ID", async () => {
      supabaseMock.setUser(mockUser);

      const req = createRequest({ word: "coffee" });
      await POST(req);

      expect(mockCheckAIUsage).toHaveBeenCalledWith("user-1");
    });

    it("should increment usage after successful generation", async () => {
      supabaseMock.setUser(mockUser);

      const req = createRequest({ word: "coffee" });
      await POST(req);

      expect(mockIncrementUsage).toHaveBeenCalledWith("user-1");
    });

    it("should not increment usage when generation fails", async () => {
      supabaseMock.setUser(mockUser);
      mockGenerateSentence.mockRejectedValue(new Error("AI error"));

      const req = createRequest({ word: "coffee" });
      await POST(req);

      expect(mockIncrementUsage).not.toHaveBeenCalled();
    });
  });

  describe("request validation", () => {
    it("should return 400 when word is missing", async () => {
      supabaseMock.setUser(mockUser);

      const req = createRequest({});
      const response = await POST(req);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Word is required");
    });

    it("should return 400 when word is null", async () => {
      supabaseMock.setUser(mockUser);

      const req = createRequest({ word: null });
      const response = await POST(req);

      expect(response.status).toBe(400);
    });

    it("should accept request with only word", async () => {
      supabaseMock.setUser(mockUser);

      const req = createRequest({ word: "hello" });
      const response = await POST(req);

      expect(response.status).toBe(200);
    });
  });

  describe("successful generation", () => {
    it("should return generated sentence", async () => {
      supabaseMock.setUser(mockUser);

      const req = createRequest({ word: "coffee" });
      const response = await POST(req);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockSentence);
    });

    it("should pass word to ClaudeService", async () => {
      supabaseMock.setUser(mockUser);

      const req = createRequest({ word: "coffee" });
      await POST(req);

      expect(mockGenerateSentence).toHaveBeenCalledWith(
        "coffee",
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it("should pass optional parameters to ClaudeService", async () => {
      supabaseMock.setUser(mockUser);

      const req = createRequest({
        word: "coffee",
        english: "coffee (drink)",
        type: "noun",
        notes: "Lebanese dialect",
        existingData: {
          arabic: "قهوة",
          transliteration: "ahwe",
          english: "coffee",
        },
      });
      await POST(req);

      expect(mockGenerateSentence).toHaveBeenCalledWith(
        "coffee",
        "coffee (drink)",
        "noun",
        "Lebanese dialect",
        {
          arabic: "قهوة",
          transliteration: "ahwe",
          english: "coffee",
        }
      );
    });
  });

  describe("error handling", () => {
    it("should return 500 on Claude service error", async () => {
      supabaseMock.setUser(mockUser);
      mockGenerateSentence.mockRejectedValue(new Error("Claude API error"));

      const req = createRequest({ word: "coffee" });
      const response = await POST(req);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe("Failed to generate sentence");
    });

    it("should return 408 on timeout (AbortError)", async () => {
      supabaseMock.setUser(mockUser);
      const abortError = new Error("Request aborted");
      abortError.name = "AbortError";
      mockGenerateSentence.mockRejectedValue(abortError);

      const req = createRequest({ word: "coffee" });
      const response = await POST(req);

      expect(response.status).toBe(408);
      const data = await response.json();
      expect(data.error).toBe("Request timed out");
    });

    it("should return 500 on parse error", async () => {
      supabaseMock.setUser(mockUser);
      mockGenerateSentence.mockRejectedValue(new Error("Failed to parse JSON response"));

      const req = createRequest({ word: "coffee" });
      const response = await POST(req);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe("Invalid response from AI service");
    });

    it("should handle non-Error throws", async () => {
      supabaseMock.setUser(mockUser);
      mockGenerateSentence.mockRejectedValue("string error");

      const req = createRequest({ word: "coffee" });
      const response = await POST(req);

      expect(response.status).toBe(500);
    });
  });
});
