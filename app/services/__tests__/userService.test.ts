import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { createSupabaseMock } from "@/app/test-utils/supabaseMock";

// Mock the createClient import
const supabaseMock = createSupabaseMock();

vi.mock("@/utils/supabase/client", () => ({
  createClient: vi.fn(() => supabaseMock.mock),
}));

// Import after mocking
import { UserService, UserRole } from "../userService";

describe("UserService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMock.setResult(null, null);
    supabaseMock.setUser(null);
    // Clear cache before each test
    UserService.clearCache();
  });

  afterEach(() => {
    // Clear cache after each test to ensure clean state
    UserService.clearCache();
  });

  describe("getUserRoles", () => {
    const mockUserId = "user-123";
    const mockRoles: UserRole[] = [
      {
        id: "role-1",
        user_id: mockUserId,
        role: "user",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "role-2",
        user_id: mockUserId,
        role: "admin",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ];

    it("should fetch roles for provided userId", async () => {
      supabaseMock.setResult(mockRoles, null);

      const result = await UserService.getUserRoles(mockUserId);

      expect(supabaseMock.mock.from).toHaveBeenCalledWith("user_roles");
      expect(supabaseMock.mock.select).toHaveBeenCalledWith("*");
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("user_id", mockUserId);
      expect(result).toEqual(mockRoles);
    });

    it("should fetch roles for current user when userId not provided", async () => {
      const currentUser = { id: "current-user-id", email: "test@example.com" };
      supabaseMock.setUser(currentUser);
      supabaseMock.setResult(mockRoles, null);

      const result = await UserService.getUserRoles();

      expect(supabaseMock.mock.auth.getUser).toHaveBeenCalled();
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("user_id", currentUser.id);
      expect(result).toEqual(mockRoles);
    });

    it("should return empty array when no user is authenticated and no userId provided", async () => {
      supabaseMock.setUser(null);

      const result = await UserService.getUserRoles();

      expect(result).toEqual([]);
    });

    it("should return empty array on database error", async () => {
      const dbError = { message: "Database error", code: "42P01" };
      supabaseMock.setResult(null, dbError);

      const result = await UserService.getUserRoles(mockUserId);

      expect(result).toEqual([]);
    });

    it("should return empty array when data is null", async () => {
      supabaseMock.setResult(null, null);

      const result = await UserService.getUserRoles(mockUserId);

      expect(result).toEqual([]);
    });

    it("should cache roles and return cached data on subsequent calls", async () => {
      supabaseMock.setResult(mockRoles, null);

      // First call - should fetch from database
      const result1 = await UserService.getUserRoles(mockUserId);
      expect(result1).toEqual(mockRoles);

      // Clear mock call count
      vi.clearAllMocks();

      // Second call - should use cache
      const result2 = await UserService.getUserRoles(mockUserId);
      expect(result2).toEqual(mockRoles);
      // Should not call database again
      expect(supabaseMock.mock.from).not.toHaveBeenCalled();
    });

    it("should refresh cache after timeout", async () => {
      supabaseMock.setResult(mockRoles, null);

      // First call
      await UserService.getUserRoles(mockUserId);

      // Mock Date.now to simulate time passing beyond cache timeout
      const originalDateNow = Date.now;
      const futureTime = Date.now() + 6 * 60 * 1000; // 6 minutes later
      vi.spyOn(Date, "now").mockReturnValue(futureTime);

      vi.clearAllMocks();

      // Second call after timeout - should fetch from database again
      await UserService.getUserRoles(mockUserId);
      expect(supabaseMock.mock.from).toHaveBeenCalledWith("user_roles");

      // Restore Date.now
      Date.now = originalDateNow;
    });
  });

  describe("isAdmin", () => {
    const mockUserId = "user-123";

    it("should return true when user has admin role", async () => {
      const adminRoles: UserRole[] = [
        {
          id: "role-1",
          user_id: mockUserId,
          role: "admin",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ];
      supabaseMock.setResult(adminRoles, null);

      const result = await UserService.isAdmin(mockUserId);

      expect(result).toBe(true);
    });

    it("should return false when user does not have admin role", async () => {
      const userRoles: UserRole[] = [
        {
          id: "role-1",
          user_id: mockUserId,
          role: "user",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ];
      supabaseMock.setResult(userRoles, null);

      const result = await UserService.isAdmin(mockUserId);

      expect(result).toBe(false);
    });

    it("should return false when user has no roles", async () => {
      supabaseMock.setResult([], null);

      const result = await UserService.isAdmin(mockUserId);

      expect(result).toBe(false);
    });

    it("should return true when user has admin among multiple roles", async () => {
      const mixedRoles: UserRole[] = [
        {
          id: "role-1",
          user_id: mockUserId,
          role: "user",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "role-2",
          user_id: mockUserId,
          role: "admin",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ];
      supabaseMock.setResult(mixedRoles, null);

      const result = await UserService.isAdmin(mockUserId);

      expect(result).toBe(true);
    });
  });

  describe("hasRole", () => {
    const mockUserId = "user-123";

    it("should return true when user has the specified role", async () => {
      const reviewerRoles: UserRole[] = [
        {
          id: "role-1",
          user_id: mockUserId,
          role: "reviewer",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ];
      supabaseMock.setResult(reviewerRoles, null);

      const result = await UserService.hasRole("reviewer", mockUserId);

      expect(result).toBe(true);
    });

    it("should return false when user does not have the specified role", async () => {
      const userRoles: UserRole[] = [
        {
          id: "role-1",
          user_id: mockUserId,
          role: "user",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ];
      supabaseMock.setResult(userRoles, null);

      const result = await UserService.hasRole("admin", mockUserId);

      expect(result).toBe(false);
    });

    it("should return false when user has no roles", async () => {
      supabaseMock.setResult([], null);

      const result = await UserService.hasRole("user", mockUserId);

      expect(result).toBe(false);
    });

    it("should check for user role correctly", async () => {
      const userRoles: UserRole[] = [
        {
          id: "role-1",
          user_id: mockUserId,
          role: "user",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ];
      supabaseMock.setResult(userRoles, null);

      const result = await UserService.hasRole("user", mockUserId);

      expect(result).toBe(true);
    });
  });

  describe("clearCache", () => {
    const mockUserId = "user-123";
    const mockRoles: UserRole[] = [
      {
        id: "role-1",
        user_id: mockUserId,
        role: "user",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ];

    it("should clear cache for specific user", async () => {
      supabaseMock.setResult(mockRoles, null);

      // First call - cache the result
      await UserService.getUserRoles(mockUserId);

      vi.clearAllMocks();

      // Clear cache for this user
      UserService.clearCache(mockUserId);

      // Next call should fetch from database again
      await UserService.getUserRoles(mockUserId);
      expect(supabaseMock.mock.from).toHaveBeenCalledWith("user_roles");
    });

    it("should clear cache for all users when no userId provided", async () => {
      const anotherUserId = "user-456";
      supabaseMock.setResult(mockRoles, null);

      // Cache data for multiple users
      await UserService.getUserRoles(mockUserId);
      await UserService.getUserRoles(anotherUserId);

      vi.clearAllMocks();

      // Clear all cache
      UserService.clearCache();

      // Both should fetch from database again
      await UserService.getUserRoles(mockUserId);
      expect(supabaseMock.mock.from).toHaveBeenCalledWith("user_roles");

      vi.clearAllMocks();

      await UserService.getUserRoles(anotherUserId);
      expect(supabaseMock.mock.from).toHaveBeenCalledWith("user_roles");
    });
  });

  describe("assignRole", () => {
    const mockUserId = "user-123";

    it("should assign a role to user", async () => {
      supabaseMock.setResult(null, null);

      await UserService.assignRole(mockUserId, "admin");

      expect(supabaseMock.mock.from).toHaveBeenCalledWith("user_roles");
      expect(supabaseMock.mock.insert).toHaveBeenCalledWith([
        { user_id: mockUserId, role: "admin" },
      ]);
    });

    it("should throw on database error", async () => {
      const dbError = { message: "Insert failed", code: "23505" };
      supabaseMock.setResult(null, dbError);

      await expect(UserService.assignRole(mockUserId, "admin")).rejects.toEqual(
        dbError
      );
    });

    it("should clear cache after assigning role", async () => {
      const mockRoles: UserRole[] = [
        {
          id: "role-1",
          user_id: mockUserId,
          role: "user",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ];
      supabaseMock.setResult(mockRoles, null);

      // Cache the roles first
      await UserService.getUserRoles(mockUserId);

      vi.clearAllMocks();
      supabaseMock.setResult(null, null);

      // Assign new role
      await UserService.assignRole(mockUserId, "admin");

      vi.clearAllMocks();
      supabaseMock.setResult(mockRoles, null);

      // Next getUserRoles should fetch from database (cache was cleared)
      await UserService.getUserRoles(mockUserId);
      expect(supabaseMock.mock.from).toHaveBeenCalledWith("user_roles");
    });

    it("should assign reviewer role", async () => {
      supabaseMock.setResult(null, null);

      await UserService.assignRole(mockUserId, "reviewer");

      expect(supabaseMock.mock.insert).toHaveBeenCalledWith([
        { user_id: mockUserId, role: "reviewer" },
      ]);
    });

    it("should assign user role", async () => {
      supabaseMock.setResult(null, null);

      await UserService.assignRole(mockUserId, "user");

      expect(supabaseMock.mock.insert).toHaveBeenCalledWith([
        { user_id: mockUserId, role: "user" },
      ]);
    });
  });

  describe("removeRole", () => {
    const mockUserId = "user-123";

    it("should remove a role from user", async () => {
      supabaseMock.setResult(null, null);

      await UserService.removeRole(mockUserId, "admin");

      expect(supabaseMock.mock.from).toHaveBeenCalledWith("user_roles");
      expect(supabaseMock.mock.delete).toHaveBeenCalled();
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("user_id", mockUserId);
      expect(supabaseMock.mock.eq).toHaveBeenCalledWith("role", "admin");
    });

    it("should throw on database error", async () => {
      const dbError = { message: "Delete failed", code: "23503" };
      supabaseMock.setResult(null, dbError);

      await expect(
        UserService.removeRole(mockUserId, "admin")
      ).rejects.toEqual(dbError);
    });

    it("should clear cache after removing role", async () => {
      const mockRoles: UserRole[] = [
        {
          id: "role-1",
          user_id: mockUserId,
          role: "admin",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ];
      supabaseMock.setResult(mockRoles, null);

      // Cache the roles first
      await UserService.getUserRoles(mockUserId);

      vi.clearAllMocks();
      supabaseMock.setResult(null, null);

      // Remove role
      await UserService.removeRole(mockUserId, "admin");

      vi.clearAllMocks();
      supabaseMock.setResult([], null);

      // Next getUserRoles should fetch from database (cache was cleared)
      await UserService.getUserRoles(mockUserId);
      expect(supabaseMock.mock.from).toHaveBeenCalledWith("user_roles");
    });
  });

  describe("getAllUserRoles", () => {
    it("should fetch and group all user roles", async () => {
      const allRoles = [
        { user_id: "user-1", role: "admin" },
        { user_id: "user-1", role: "reviewer" },
        { user_id: "user-2", role: "user" },
        { user_id: "user-3", role: "admin" },
      ];
      supabaseMock.setResult(allRoles, null);

      const result = await UserService.getAllUserRoles();

      expect(supabaseMock.mock.from).toHaveBeenCalledWith("user_roles");
      expect(supabaseMock.mock.select).toHaveBeenCalledWith("user_id, role");
      expect(result).toEqual({
        "user-1": ["admin", "reviewer"],
        "user-2": ["user"],
        "user-3": ["admin"],
      });
    });

    it("should return empty object on database error", async () => {
      const dbError = { message: "Database error", code: "42P01" };
      supabaseMock.setResult(null, dbError);

      const result = await UserService.getAllUserRoles();

      expect(result).toEqual({});
    });

    it("should return empty object when no roles exist", async () => {
      supabaseMock.setResult([], null);

      const result = await UserService.getAllUserRoles();

      expect(result).toEqual({});
    });

    it("should return empty object when data is null", async () => {
      supabaseMock.setResult(null, null);

      const result = await UserService.getAllUserRoles();

      expect(result).toEqual({});
    });

    it("should handle single user with single role", async () => {
      const singleRole = [{ user_id: "user-1", role: "user" }];
      supabaseMock.setResult(singleRole, null);

      const result = await UserService.getAllUserRoles();

      expect(result).toEqual({
        "user-1": ["user"],
      });
    });
  });
});
