import { describe, it, expect, beforeEach, vi } from "vitest";
import { createSupabaseMock } from "@/app/test-utils/supabaseMock";

// Mock the createClient import
const supabaseMock = createSupabaseMock();

vi.mock("@/utils/supabase/client", () => ({
  createClient: vi.fn(() => supabaseMock.mock),
}));

// Import after mocking
import {
  TransliterationService,
  TransliterationRule,
  TransliterationRuleInput,
} from "../transliterationService";

describe("TransliterationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMock.setResult(null, null);
  });

  describe("getRules", () => {
    it("should fetch all transliteration rules ordered by sort_order", async () => {
      const mockRules: TransliterationRule[] = [
        {
          id: "rule-1",
          arabic: "ا",
          latin: "a",
          example_arabic: "أنا",
          example_latin: "ana",
          sort_order: 1,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "rule-2",
          arabic: "ب",
          latin: "b",
          example_arabic: "بيت",
          example_latin: "bayt",
          sort_order: 2,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ];

      supabaseMock.setResult(mockRules, null);

      const result = await TransliterationService.getRules();

      expect(supabaseMock.mock.from).toHaveBeenCalledWith(
        "transliteration_rules"
      );
      expect(supabaseMock.mock.select).toHaveBeenCalledWith("*");
      expect(supabaseMock.mock.order).toHaveBeenCalledWith("sort_order");
      expect(result).toEqual(mockRules);
    });

    it("should return empty array when no rules exist", async () => {
      supabaseMock.setResult([], null);

      const result = await TransliterationService.getRules();

      expect(result).toEqual([]);
    });

    it("should return empty array when data is null", async () => {
      supabaseMock.setResult(null, null);

      const result = await TransliterationService.getRules();

      expect(result).toEqual([]);
    });

    it("should throw on database error", async () => {
      const dbError = { message: "Database error", code: "42P01" };
      supabaseMock.setResult(null, dbError);

      await expect(TransliterationService.getRules()).rejects.toEqual(dbError);
    });
  });

  describe("getNotes", () => {
    it("should fetch transliteration notes", async () => {
      const mockNotes = { value: "Use 7 for ح and 3 for ع" };

      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: mockNotes, error: null })
      );

      const result = await TransliterationService.getNotes();

      expect(supabaseMock.mock.from).toHaveBeenCalledWith(
        "transliteration_settings"
      );
      expect(supabaseMock.mock.select).toHaveBeenCalledWith("value");
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("key", "notes");
      expect(result).toBe("Use 7 for ح and 3 for ع");
    });

    it("should return empty string when no notes exist", async () => {
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: null, error: null })
      );

      const result = await TransliterationService.getNotes();

      expect(result).toBe("");
    });

    it("should return empty string when row not found (PGRST116)", async () => {
      const notFoundError = { message: "Row not found", code: "PGRST116" };
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: null, error: notFoundError })
      );

      const result = await TransliterationService.getNotes();

      expect(result).toBe("");
    });

    it("should throw on other database errors", async () => {
      const dbError = { message: "Database error", code: "42P01" };
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: null, error: dbError })
      );

      await expect(TransliterationService.getNotes()).rejects.toEqual(dbError);
    });
  });

  describe("updateNotes", () => {
    it("should update transliteration notes", async () => {
      const newNotes = "Updated transliteration instructions";
      supabaseMock.setResult(null, null);

      await TransliterationService.updateNotes(newNotes);

      expect(supabaseMock.mock.from).toHaveBeenCalledWith(
        "transliteration_settings"
      );
      expect(supabaseMock.mock.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          key: "notes",
          value: newNotes,
          updated_at: expect.any(String),
        }),
        { onConflict: "key" }
      );
    });

    it("should throw on database error", async () => {
      const dbError = { message: "Update failed", code: "42P01" };
      supabaseMock.setResult(null, dbError);

      await expect(
        TransliterationService.updateNotes("test notes")
      ).rejects.toEqual(dbError);
    });
  });

  describe("createRule", () => {
    const mockRuleInput: TransliterationRuleInput = {
      arabic: "ج",
      latin: "j",
      example_arabic: "جميل",
      example_latin: "jameel",
    };

    it("should create a rule with auto-generated sort_order", async () => {
      const maxSortOrderData = { sort_order: 5 };
      const createdRule: TransliterationRule = {
        id: "rule-new",
        ...mockRuleInput,
        example_arabic: mockRuleInput.example_arabic!,
        example_latin: mockRuleInput.example_latin!,
        sort_order: 6,
        created_at: "2024-01-15T12:00:00Z",
        updated_at: "2024-01-15T12:00:00Z",
      };

      // First call for getting max sort_order
      let callCount = 0;
      supabaseMock.mock.single = vi.fn(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ data: maxSortOrderData, error: null });
        }
        return Promise.resolve({ data: createdRule, error: null });
      });

      const result = await TransliterationService.createRule(mockRuleInput);

      expect(supabaseMock.mock.from).toHaveBeenCalledWith(
        "transliteration_rules"
      );
      expect(supabaseMock.mock.insert).toHaveBeenCalledWith({
        ...mockRuleInput,
        sort_order: 6,
      });
      expect(result).toEqual(createdRule);
    });

    it("should create a rule with provided sort_order", async () => {
      const inputWithSortOrder: TransliterationRuleInput = {
        ...mockRuleInput,
        sort_order: 10,
      };
      const createdRule: TransliterationRule = {
        id: "rule-new",
        arabic: mockRuleInput.arabic,
        latin: mockRuleInput.latin,
        example_arabic: mockRuleInput.example_arabic!,
        example_latin: mockRuleInput.example_latin!,
        sort_order: 10,
        created_at: "2024-01-15T12:00:00Z",
        updated_at: "2024-01-15T12:00:00Z",
      };

      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: createdRule, error: null })
      );

      const result =
        await TransliterationService.createRule(inputWithSortOrder);

      expect(supabaseMock.mock.insert).toHaveBeenCalledWith({
        ...mockRuleInput,
        sort_order: 10,
      });
      expect(result.sort_order).toBe(10);
    });

    it("should handle empty table when auto-generating sort_order", async () => {
      const createdRule: TransliterationRule = {
        id: "rule-first",
        arabic: mockRuleInput.arabic,
        latin: mockRuleInput.latin,
        example_arabic: mockRuleInput.example_arabic!,
        example_latin: mockRuleInput.example_latin!,
        sort_order: 1,
        created_at: "2024-01-15T12:00:00Z",
        updated_at: "2024-01-15T12:00:00Z",
      };

      let callCount = 0;
      supabaseMock.mock.single = vi.fn(() => {
        callCount++;
        if (callCount === 1) {
          // Empty table, no max sort_order
          return Promise.resolve({ data: null, error: null });
        }
        return Promise.resolve({ data: createdRule, error: null });
      });

      const result = await TransliterationService.createRule(mockRuleInput);

      expect(supabaseMock.mock.insert).toHaveBeenCalledWith({
        ...mockRuleInput,
        sort_order: 1,
      });
      expect(result.sort_order).toBe(1);
    });

    it("should throw on database insert error", async () => {
      const dbError = { message: "Insert failed", code: "23505" };

      let callCount = 0;
      supabaseMock.mock.single = vi.fn(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ data: { sort_order: 5 }, error: null });
        }
        return Promise.resolve({ data: null, error: dbError });
      });

      await expect(
        TransliterationService.createRule(mockRuleInput)
      ).rejects.toEqual(dbError);
    });
  });

  describe("updateRule", () => {
    const ruleId = "rule-123";

    it("should update rule fields", async () => {
      const updates: Partial<TransliterationRuleInput> = {
        latin: "zh",
        example_latin: "zhoor",
      };
      const updatedRule: TransliterationRule = {
        id: ruleId,
        arabic: "ج",
        latin: "zh",
        example_arabic: "جهور",
        example_latin: "zhoor",
        sort_order: 3,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-15T12:00:00Z",
      };

      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: updatedRule, error: null })
      );

      const result = await TransliterationService.updateRule(ruleId, updates);

      expect(supabaseMock.mock.from).toHaveBeenCalledWith(
        "transliteration_rules"
      );
      expect(supabaseMock.mock.update).toHaveBeenCalledWith(
        expect.objectContaining({
          ...updates,
          updated_at: expect.any(String),
        })
      );
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("id", ruleId);
      expect(result).toEqual(updatedRule);
    });

    it("should update sort_order", async () => {
      const updates: Partial<TransliterationRuleInput> = { sort_order: 1 };
      const updatedRule: TransliterationRule = {
        id: ruleId,
        arabic: "ب",
        latin: "b",
        example_arabic: null,
        example_latin: null,
        sort_order: 1,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-15T12:00:00Z",
      };

      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: updatedRule, error: null })
      );

      const result = await TransliterationService.updateRule(ruleId, updates);

      expect(supabaseMock.mock.update).toHaveBeenCalledWith(
        expect.objectContaining({ sort_order: 1 })
      );
      expect(result.sort_order).toBe(1);
    });

    it("should throw on database error", async () => {
      const dbError = { message: "Update failed", code: "42P01" };
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: null, error: dbError })
      );

      await expect(
        TransliterationService.updateRule(ruleId, { latin: "test" })
      ).rejects.toEqual(dbError);
    });
  });

  describe("deleteRule", () => {
    const ruleId = "rule-456";

    it("should delete a rule", async () => {
      supabaseMock.setResult(null, null);

      await expect(
        TransliterationService.deleteRule(ruleId)
      ).resolves.toBeUndefined();

      expect(supabaseMock.mock.from).toHaveBeenCalledWith(
        "transliteration_rules"
      );
      expect(supabaseMock.mock.delete).toHaveBeenCalled();
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("id", ruleId);
    });

    it("should throw on database error", async () => {
      const dbError = { message: "Delete failed", code: "23503" };
      supabaseMock.setResult(null, dbError);

      await expect(TransliterationService.deleteRule(ruleId)).rejects.toEqual(
        dbError
      );
    });
  });

  describe("getTransliterationPrompt", () => {
    it("should generate prompt with rules and notes", async () => {
      const mockRules: TransliterationRule[] = [
        {
          id: "rule-1",
          arabic: "ا",
          latin: "a",
          example_arabic: null,
          example_latin: null,
          sort_order: 1,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "rule-2",
          arabic: "ب",
          latin: "b",
          example_arabic: null,
          example_latin: null,
          sort_order: 2,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "rule-3",
          arabic: "ح",
          latin: "7",
          example_arabic: null,
          example_latin: null,
          sort_order: 3,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ];
      const mockNotes = "Use natural Lebanese Arabic pronunciation.";

      // Mock getRules and getNotes calls
      let fromCallCount = 0;
      const originalThen = supabaseMock.mock.then;
      supabaseMock.mock.then = vi.fn((resolve) => {
        fromCallCount++;
        if (fromCallCount === 1) {
          // getRules call
          return resolve({ data: mockRules, error: null });
        }
        // This branch won't be hit since getNotes uses single()
        return resolve({ data: null, error: null });
      });

      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: { value: mockNotes }, error: null })
      );

      const result = await TransliterationService.getTransliterationPrompt();

      expect(result).toContain("TRANSLITERATION RULES:");
      expect(result).toContain("ا=a");
      expect(result).toContain("ب=b");
      expect(result).toContain("ح=7");
      expect(result).toContain("Use natural Lebanese Arabic pronunciation.");

      supabaseMock.mock.then = originalThen;
    });

    it("should generate prompt with rules only when no notes exist", async () => {
      const mockRules: TransliterationRule[] = [
        {
          id: "rule-1",
          arabic: "ع",
          latin: "3",
          example_arabic: null,
          example_latin: null,
          sort_order: 1,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ];

      const originalThen = supabaseMock.mock.then;
      supabaseMock.mock.then = vi.fn((resolve) => {
        return resolve({ data: mockRules, error: null });
      });

      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: null, error: null })
      );

      const result = await TransliterationService.getTransliterationPrompt();

      expect(result).toContain("ع=3");
      expect(result).toContain("TRANSLITERATION RULES:");

      supabaseMock.mock.then = originalThen;
    });

    it("should generate prompt with empty rules string when no rules exist", async () => {
      const originalThen = supabaseMock.mock.then;
      supabaseMock.mock.then = vi.fn((resolve) => {
        return resolve({ data: [], error: null });
      });

      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: { value: "Some notes" }, error: null })
      );

      const result = await TransliterationService.getTransliterationPrompt();

      expect(result).toContain("TRANSLITERATION RULES:");
      expect(result).toContain(
        "Use these specific transliterations for Arabic letters:"
      );
      expect(result).toContain("Some notes");

      supabaseMock.mock.then = originalThen;
    });

    it("should handle comma-separated rules correctly", async () => {
      const mockRules: TransliterationRule[] = [
        {
          id: "rule-1",
          arabic: "أ",
          latin: "2",
          example_arabic: null,
          example_latin: null,
          sort_order: 1,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "rule-2",
          arabic: "خ",
          latin: "kh",
          example_arabic: null,
          example_latin: null,
          sort_order: 2,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "rule-3",
          arabic: "ش",
          latin: "sh",
          example_arabic: null,
          example_latin: null,
          sort_order: 3,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ];

      const originalThen = supabaseMock.mock.then;
      supabaseMock.mock.then = vi.fn((resolve) => {
        return resolve({ data: mockRules, error: null });
      });

      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: null, error: null })
      );

      const result = await TransliterationService.getTransliterationPrompt();

      // Check that rules are comma-separated
      expect(result).toContain("أ=2, خ=kh, ش=sh");

      supabaseMock.mock.then = originalThen;
    });
  });
});
