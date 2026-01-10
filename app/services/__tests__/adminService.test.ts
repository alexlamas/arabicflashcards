import { describe, it, expect, beforeEach, vi } from "vitest";
import { createSupabaseMock } from "@/app/test-utils/supabaseMock";

// Mock the createClient import
const supabaseMock = createSupabaseMock();

vi.mock("@/utils/supabase/client", () => ({
  createClient: vi.fn(() => supabaseMock.mock),
}));

// Import after mocking
import { AdminService } from "../adminService";

describe("AdminService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMock.setResult(null, null);
    // Reset fetch mock
    global.fetch = vi.fn();
  });

  describe("getAllUsers", () => {
    it("should fetch users from API", async () => {
      const mockUsers = [
        {
          id: "user-1",
          email: "user1@example.com",
          created_at: "2024-01-01T00:00:00Z",
          email_confirmed: true,
          word_count: 10,
          last_review_date: "2024-01-15T12:00:00Z",
        },
        {
          id: "user-2",
          email: "user2@example.com",
          created_at: "2024-01-02T00:00:00Z",
          email_confirmed: false,
          word_count: 5,
          last_review_date: null,
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUsers),
      });

      const result = await AdminService.getAllUsers();

      expect(fetch).toHaveBeenCalledWith("/api/admin/users");
      expect(result).toEqual(mockUsers);
    });

    it("should throw error when API returns non-ok response", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: "Unauthorized" }),
      });

      await expect(AdminService.getAllUsers()).rejects.toThrow("Unauthorized");
    });

    it("should throw default error when API error has no message", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({}),
      });

      await expect(AdminService.getAllUsers()).rejects.toThrow(
        "Failed to fetch users"
      );
    });
  });

  describe("getAllWords", () => {
    it("should fetch all custom words", async () => {
      const mockWords = [
        {
          id: "word-1",
          user_id: "user-123",
          arabic: "مرحبا",
          english: "hello",
          transliteration: "marhaba",
          type: "phrase",
          created_at: "2024-01-15T12:00:00Z",
        },
      ];

      supabaseMock.setResult(mockWords, null);

      const result = await AdminService.getAllWords();

      expect(supabaseMock.mock.from).toHaveBeenCalledWith("words");
      expect(supabaseMock.mock.select).toHaveBeenCalledWith(
        "id, user_id, arabic, english, transliteration, type, created_at"
      );
      expect(supabaseMock.mock.not).toHaveBeenCalledWith("user_id", "is", null);
      expect(supabaseMock.mock.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(supabaseMock.mock.limit).toHaveBeenCalledWith(500);
      expect(result).toHaveLength(1);
      expect(result[0].user_email).toBe("user-123");
    });

    it("should return empty array when no words exist", async () => {
      supabaseMock.setResult([], null);

      const result = await AdminService.getAllWords();

      expect(result).toEqual([]);
    });

    it("should handle null data", async () => {
      supabaseMock.setResult(null, null);

      const result = await AdminService.getAllWords();

      expect(result).toEqual([]);
    });

    it("should throw on database error", async () => {
      const dbError = { message: "Database error", code: "42P01" };
      supabaseMock.setResult(null, dbError);

      await expect(AdminService.getAllWords()).rejects.toEqual(dbError);
    });
  });

  describe("getAllStarterPacks", () => {
    it("should fetch all packs with word counts", async () => {
      const mockPacks = [
        {
          id: "pack-1",
          name: "Greetings",
          description: "Basic greetings",
          language: "lebanese",
          level: "beginner",
          is_active: true,
          created_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "pack-2",
          name: "Food",
          description: "Food vocabulary",
          language: "lebanese",
          level: "intermediate",
          is_active: false,
          created_at: "2024-01-02T00:00:00Z",
        },
      ];

      const mockWordCounts = [
        { pack_id: "pack-1" },
        { pack_id: "pack-1" },
        { pack_id: "pack-1" },
        { pack_id: "pack-2" },
      ];

      // First call returns packs, second call returns word counts
      let callCount = 0;
      const originalThen = supabaseMock.mock.then;
      supabaseMock.mock.then = vi.fn((resolve) => {
        callCount++;
        if (callCount === 1) {
          return resolve({ data: mockPacks, error: null });
        }
        return resolve({ data: mockWordCounts, error: null });
      });

      const result = await AdminService.getAllStarterPacks();

      expect(supabaseMock.mock.from).toHaveBeenCalledWith("packs");
      expect(supabaseMock.mock.from).toHaveBeenCalledWith("words");
      expect(result).toHaveLength(2);
      expect(result[0].word_count).toBe(3);
      expect(result[1].word_count).toBe(1);

      // Restore
      supabaseMock.mock.then = originalThen;
    });

    it("should handle packs with no words", async () => {
      const mockPacks = [{ id: "pack-1", name: "Empty Pack" }];

      let callCount = 0;
      const originalThen = supabaseMock.mock.then;
      supabaseMock.mock.then = vi.fn((resolve) => {
        callCount++;
        if (callCount === 1) {
          return resolve({ data: mockPacks, error: null });
        }
        return resolve({ data: [], error: null });
      });

      const result = await AdminService.getAllStarterPacks();

      expect(result[0].word_count).toBe(0);

      supabaseMock.mock.then = originalThen;
    });

    it("should throw on packs fetch error", async () => {
      const dbError = { message: "Packs error", code: "42P01" };
      supabaseMock.setResult(null, dbError);

      await expect(AdminService.getAllStarterPacks()).rejects.toEqual(dbError);
    });
  });

  describe("updateStarterPack", () => {
    it("should update pack with provided fields", async () => {
      const packId = "pack-123";
      const updates = { name: "Updated Name", is_active: false };
      const updatedPack = {
        id: packId,
        name: "Updated Name",
        description: "desc",
        is_active: false,
        updated_at: expect.any(String),
      };

      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: updatedPack, error: null })
      );

      const result = await AdminService.updateStarterPack(packId, updates);

      expect(supabaseMock.mock.from).toHaveBeenCalledWith("packs");
      expect(supabaseMock.mock.update).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Updated Name",
          is_active: false,
          updated_at: expect.any(String),
        })
      );
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("id", packId);
      expect(result).toEqual(updatedPack);
    });

    it("should throw on database error", async () => {
      const dbError = { message: "Update failed", code: "42P01" };
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: null, error: dbError })
      );

      await expect(
        AdminService.updateStarterPack("pack-123", { name: "Test" })
      ).rejects.toEqual(dbError);
    });
  });

  describe("deleteStarterPack", () => {
    it("should delete pack and associated data", async () => {
      const packId = "pack-123";
      const mockPackWords = [{ id: "word-1" }, { id: "word-2" }];

      // First call for getting pack words
      let callCount = 0;
      const originalThen = supabaseMock.mock.then;
      supabaseMock.mock.then = vi.fn((resolve) => {
        callCount++;
        if (callCount === 1) {
          return resolve({ data: mockPackWords, error: null });
        }
        return resolve({ data: null, error: null });
      });

      await AdminService.deleteStarterPack(packId);

      // Check word progress deletion
      expect(supabaseMock.mock.from).toHaveBeenCalledWith("word_progress");
      expect(supabaseMock.mock.delete).toHaveBeenCalled();
      expect(supabaseMock.mock.in).toHaveBeenCalledWith("word_id", [
        "word-1",
        "word-2",
      ]);

      // Check pack words deletion
      expect(supabaseMock.mock.from).toHaveBeenCalledWith("words");

      // Check pack deletion
      expect(supabaseMock.mock.from).toHaveBeenCalledWith("packs");

      supabaseMock.mock.then = originalThen;
    });

    it("should handle pack with no words", async () => {
      const packId = "pack-123";

      let callCount = 0;
      const originalThen = supabaseMock.mock.then;
      supabaseMock.mock.then = vi.fn((resolve) => {
        callCount++;
        if (callCount === 1) {
          return resolve({ data: [], error: null });
        }
        return resolve({ data: null, error: null });
      });

      await AdminService.deleteStarterPack(packId);

      // Should not call in() with empty array
      expect(supabaseMock.mock.in).not.toHaveBeenCalled();

      supabaseMock.mock.then = originalThen;
    });

    it("should throw on pack deletion error", async () => {
      const dbError = { message: "Delete failed", code: "23503" };

      let callCount = 0;
      const originalThen = supabaseMock.mock.then;
      supabaseMock.mock.then = vi.fn((resolve) => {
        callCount++;
        if (callCount === 1) {
          return resolve({ data: [], error: null });
        }
        if (callCount === 2) {
          return resolve({ data: null, error: null });
        }
        return resolve({ data: null, error: dbError });
      });

      await expect(AdminService.deleteStarterPack("pack-123")).rejects.toEqual(
        dbError
      );

      supabaseMock.mock.then = originalThen;
    });
  });

  describe("getPackContents", () => {
    it("should fetch words for a pack", async () => {
      const packId = "pack-123";
      const mockWords = [
        { id: "word-1", arabic: "مرحبا", english: "hello", pack_id: packId },
        { id: "word-2", arabic: "شكرا", english: "thank you", pack_id: packId },
      ];

      supabaseMock.setResult(mockWords, null);

      const result = await AdminService.getPackContents(packId);

      expect(supabaseMock.mock.from).toHaveBeenCalledWith("words");
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("pack_id", packId);
      expect(supabaseMock.mock.order).toHaveBeenCalledWith("english");
      expect(result.words).toEqual(mockWords);
    });

    it("should return empty array for pack with no words", async () => {
      supabaseMock.setResult([], null);

      const result = await AdminService.getPackContents("empty-pack");

      expect(result.words).toEqual([]);
    });

    it("should throw on database error", async () => {
      const dbError = { message: "Fetch failed", code: "42P01" };
      supabaseMock.setResult(null, dbError);

      await expect(AdminService.getPackContents("pack-123")).rejects.toEqual(
        dbError
      );
    });
  });

  describe("updateStarterPackWord", () => {
    it("should update word with provided fields", async () => {
      const wordId = "word-123";
      const updates = { arabic: "مرحبا جديد", english: "new hello" };
      const updatedWord = {
        id: wordId,
        ...updates,
        transliteration: "marhaba jadid",
        pack_id: "pack-1",
      };

      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: updatedWord, error: null })
      );

      const result = await AdminService.updateStarterPackWord(wordId, updates);

      expect(supabaseMock.mock.from).toHaveBeenCalledWith("words");
      expect(supabaseMock.mock.update).toHaveBeenCalledWith(updates);
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("id", wordId);
      expect(result).toEqual(updatedWord);
    });

    it("should throw on database error", async () => {
      const dbError = { message: "Update failed", code: "42P01" };
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: null, error: dbError })
      );

      await expect(
        AdminService.updateStarterPackWord("word-123", { english: "test" })
      ).rejects.toEqual(dbError);
    });
  });

  describe("deleteStarterPackWord", () => {
    it("should delete word and its progress", async () => {
      const wordId = "word-123";
      supabaseMock.setResult(null, null);

      await AdminService.deleteStarterPackWord(wordId);

      // Check word_progress deletion
      expect(supabaseMock.mock.from).toHaveBeenCalledWith("word_progress");
      expect(supabaseMock.mock.delete).toHaveBeenCalled();
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("word_id", wordId);

      // Check word deletion
      expect(supabaseMock.mock.from).toHaveBeenCalledWith("words");
    });

    it("should throw on word deletion error", async () => {
      const dbError = { message: "Delete failed", code: "23503" };

      let callCount = 0;
      const originalThen = supabaseMock.mock.then;
      supabaseMock.mock.then = vi.fn((resolve) => {
        callCount++;
        if (callCount === 1) {
          return resolve({ data: null, error: null });
        }
        return resolve({ data: null, error: dbError });
      });

      await expect(
        AdminService.deleteStarterPackWord("word-123")
      ).rejects.toEqual(dbError);

      supabaseMock.mock.then = originalThen;
    });
  });

  describe("addStarterPackWord", () => {
    it("should add word to pack", async () => {
      const packId = "pack-123";
      const wordInput = {
        arabic: "مرحبا",
        english: "hello",
        transliteration: "marhaba",
        type: "phrase" as const,
        notes: null,
      };
      const createdWord = {
        id: "word-new",
        ...wordInput,
        pack_id: packId,
        user_id: null,
        created_at: "2024-01-15T12:00:00Z",
      };

      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: createdWord, error: null })
      );

      const result = await AdminService.addStarterPackWord(packId, wordInput);

      expect(supabaseMock.mock.from).toHaveBeenCalledWith("words");
      expect(supabaseMock.mock.insert).toHaveBeenCalledWith({
        ...wordInput,
        pack_id: packId,
        user_id: null,
      });
      expect(result).toEqual(createdWord);
    });

    it("should throw on database error", async () => {
      const dbError = { message: "Insert failed", code: "23505" };
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: null, error: dbError })
      );

      await expect(
        AdminService.addStarterPackWord("pack-123", {
          arabic: "test",
          english: "test",
          transliteration: null,
          type: null,
          notes: null,
        })
      ).rejects.toEqual(dbError);
    });
  });

  describe("createStarterPack", () => {
    it("should create pack with all fields", async () => {
      const packInput = {
        name: "New Pack",
        description: "A new vocabulary pack",
        language: "lebanese",
        level: "beginner",
        icon: "book",
        is_active: true,
      };
      const createdPack = {
        id: "pack-new",
        ...packInput,
        created_at: "2024-01-15T12:00:00Z",
      };

      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: createdPack, error: null })
      );

      const result = await AdminService.createStarterPack(packInput);

      expect(supabaseMock.mock.from).toHaveBeenCalledWith("packs");
      expect(supabaseMock.mock.insert).toHaveBeenCalledWith({
        name: "New Pack",
        description: "A new vocabulary pack",
        language: "lebanese",
        level: "beginner",
        icon: "book",
        is_active: true,
      });
      expect(result).toEqual(createdPack);
    });

    it("should use default values for optional fields", async () => {
      const packInput = { name: "Minimal Pack" };
      const createdPack = {
        id: "pack-new",
        name: "Minimal Pack",
        description: null,
        language: "lebanese",
        level: "beginner",
        icon: null,
        is_active: true,
      };

      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: createdPack, error: null })
      );

      await AdminService.createStarterPack(packInput);

      expect(supabaseMock.mock.insert).toHaveBeenCalledWith({
        name: "Minimal Pack",
        description: null,
        language: "lebanese",
        level: "beginner",
        icon: null,
        is_active: true,
      });
    });

    it("should respect is_active false", async () => {
      const packInput = { name: "Inactive Pack", is_active: false };

      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: { id: "pack-new", ...packInput }, error: null })
      );

      await AdminService.createStarterPack(packInput);

      expect(supabaseMock.mock.insert).toHaveBeenCalledWith(
        expect.objectContaining({ is_active: false })
      );
    });

    it("should throw on database error", async () => {
      const dbError = { message: "Insert failed", code: "23505" };
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: null, error: dbError })
      );

      await expect(
        AdminService.createStarterPack({ name: "Test Pack" })
      ).rejects.toEqual(dbError);
    });
  });
});
