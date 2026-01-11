import { describe, it, expect, beforeEach, vi } from "vitest";
import { createSupabaseMock } from "@/app/test-utils/supabaseMock";

// Mock the createClient import
const supabaseMock = createSupabaseMock();

vi.mock("@/utils/supabase/client", () => ({
  createClient: vi.fn(() => supabaseMock.mock),
}));

// Import after mocking
import { ProfileService, AVATAR_OPTIONS } from "../profileService";

describe("ProfileService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMock.setResult(null, null);
    supabaseMock.setUser(null);
  });

  describe("AVATAR_OPTIONS", () => {
    it("should have all required avatar options", () => {
      expect(AVATAR_OPTIONS).toHaveLength(5);
      expect(AVATAR_OPTIONS.map((a) => a.id)).toEqual([
        "pomegranate",
        "tree",
        "moon",
        "cedar",
        "leaf",
      ]);
    });

    it("should have correct structure for each avatar", () => {
      AVATAR_OPTIONS.forEach((avatar) => {
        expect(avatar).toHaveProperty("id");
        expect(avatar).toHaveProperty("label");
        expect(avatar).toHaveProperty("image");
        expect(avatar.image).toMatch(/^\/avatars\/.*\.svg$/);
      });
    });
  });

  describe("getProfile", () => {
    const mockUser = { id: "user-123", email: "test@example.com" };

    const mockProfile = {
      id: "user-123",
      first_name: "John",
      avatar: "pomegranate",
      created_at: "2024-01-15T12:00:00Z",
      updated_at: "2024-01-15T12:00:00Z",
    };

    it("should return profile for authenticated user", async () => {
      supabaseMock.setUser(mockUser);
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: mockProfile, error: null })
      );

      const result = await ProfileService.getProfile();

      expect(result).toEqual(mockProfile);
      expect(supabaseMock.mock.from).toHaveBeenCalledWith("user_profiles");
      expect(supabaseMock.mock.select).toHaveBeenCalledWith("*");
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("id", mockUser.id);
    });

    it("should return null if user is not authenticated", async () => {
      supabaseMock.setUser(null);

      const result = await ProfileService.getProfile();

      expect(result).toBeNull();
      expect(supabaseMock.mock.from).not.toHaveBeenCalled();
    });

    it("should return null on database error", async () => {
      supabaseMock.setUser(mockUser);
      const dbError = { message: "Database error", code: "42P01" };
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: null, error: dbError })
      );

      const result = await ProfileService.getProfile();

      expect(result).toBeNull();
    });

    it("should return null when profile does not exist (PGRST116 error)", async () => {
      supabaseMock.setUser(mockUser);
      const notFoundError = { message: "No rows found", code: "PGRST116" };
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: null, error: notFoundError })
      );

      const result = await ProfileService.getProfile();

      // PGRST116 is specifically handled - returns null without treating as error
      expect(result).toBeNull();
    });

    it("should return profile data when it exists", async () => {
      supabaseMock.setUser(mockUser);
      const profileWithNulls = {
        id: "user-123",
        first_name: null,
        avatar: null,
        created_at: "2024-01-15T12:00:00Z",
        updated_at: "2024-01-15T12:00:00Z",
      };
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: profileWithNulls, error: null })
      );

      const result = await ProfileService.getProfile();

      expect(result).toEqual(profileWithNulls);
      expect(result?.first_name).toBeNull();
      expect(result?.avatar).toBeNull();
    });
  });

  describe("updateProfile", () => {
    const mockUser = { id: "user-123", email: "test@example.com" };

    it("should update profile with first_name", async () => {
      supabaseMock.setUser(mockUser);
      const updatedProfile = {
        id: "user-123",
        first_name: "Jane",
        avatar: null,
        created_at: "2024-01-15T12:00:00Z",
        updated_at: "2024-01-16T12:00:00Z",
      };
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: updatedProfile, error: null })
      );

      const result = await ProfileService.updateProfile({ first_name: "Jane" });

      expect(result).toEqual(updatedProfile);
      expect(supabaseMock.mock.from).toHaveBeenCalledWith("user_profiles");
      expect(supabaseMock.mock.upsert).toHaveBeenCalledWith({
        id: mockUser.id,
        first_name: "Jane",
      });
      expect(supabaseMock.mock.select).toHaveBeenCalled();
    });

    it("should update profile with avatar", async () => {
      supabaseMock.setUser(mockUser);
      const updatedProfile = {
        id: "user-123",
        first_name: "John",
        avatar: "cedar",
        created_at: "2024-01-15T12:00:00Z",
        updated_at: "2024-01-16T12:00:00Z",
      };
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: updatedProfile, error: null })
      );

      const result = await ProfileService.updateProfile({ avatar: "cedar" });

      expect(result).toEqual(updatedProfile);
      expect(supabaseMock.mock.upsert).toHaveBeenCalledWith({
        id: mockUser.id,
        avatar: "cedar",
      });
    });

    it("should update both first_name and avatar", async () => {
      supabaseMock.setUser(mockUser);
      const updatedProfile = {
        id: "user-123",
        first_name: "Alice",
        avatar: "moon",
        created_at: "2024-01-15T12:00:00Z",
        updated_at: "2024-01-16T12:00:00Z",
      };
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: updatedProfile, error: null })
      );

      const result = await ProfileService.updateProfile({
        first_name: "Alice",
        avatar: "moon",
      });

      expect(result).toEqual(updatedProfile);
      expect(supabaseMock.mock.upsert).toHaveBeenCalledWith({
        id: mockUser.id,
        first_name: "Alice",
        avatar: "moon",
      });
    });

    it("should return null if user is not authenticated", async () => {
      supabaseMock.setUser(null);

      const result = await ProfileService.updateProfile({ first_name: "Test" });

      expect(result).toBeNull();
      expect(supabaseMock.mock.from).not.toHaveBeenCalled();
    });

    it("should return null on database error", async () => {
      supabaseMock.setUser(mockUser);
      const dbError = { message: "Database error", code: "23505" };
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: null, error: dbError })
      );

      const result = await ProfileService.updateProfile({ first_name: "Test" });

      expect(result).toBeNull();
    });

    it("should create profile via upsert if it does not exist", async () => {
      supabaseMock.setUser(mockUser);
      const newProfile = {
        id: "user-123",
        first_name: "NewUser",
        avatar: "leaf",
        created_at: "2024-01-16T12:00:00Z",
        updated_at: "2024-01-16T12:00:00Z",
      };
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: newProfile, error: null })
      );

      const result = await ProfileService.updateProfile({
        first_name: "NewUser",
        avatar: "leaf",
      });

      expect(result).toEqual(newProfile);
      // Upsert is used which handles both insert and update
      expect(supabaseMock.mock.upsert).toHaveBeenCalled();
    });

    it("should handle empty update object", async () => {
      supabaseMock.setUser(mockUser);
      const existingProfile = {
        id: "user-123",
        first_name: "John",
        avatar: "tree",
        created_at: "2024-01-15T12:00:00Z",
        updated_at: "2024-01-15T12:00:00Z",
      };
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: existingProfile, error: null })
      );

      const result = await ProfileService.updateProfile({});

      expect(result).toEqual(existingProfile);
      expect(supabaseMock.mock.upsert).toHaveBeenCalledWith({
        id: mockUser.id,
      });
    });

    it("should handle constraint violation error", async () => {
      supabaseMock.setUser(mockUser);
      const constraintError = {
        message: "Unique constraint violation",
        code: "23505",
      };
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: null, error: constraintError })
      );

      const result = await ProfileService.updateProfile({ first_name: "Test" });

      expect(result).toBeNull();
    });

    it("should handle RLS policy violation", async () => {
      supabaseMock.setUser(mockUser);
      const rlsError = {
        message: "Row level security policy violation",
        code: "42501",
      };
      supabaseMock.mock.single = vi.fn(() =>
        Promise.resolve({ data: null, error: rlsError })
      );

      const result = await ProfileService.updateProfile({ avatar: "cedar" });

      expect(result).toBeNull();
    });
  });
});
