import { createClient } from "@/utils/supabase/client";

export interface UserRole {
  id: string;
  user_id: string;
  role: 'user' | 'admin' | 'moderator' | 'reviewer';
  created_at: string;
  updated_at: string;
}

export class UserService {
  private static rolesCache: Map<string, UserRole[]> = new Map();
  private static cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private static lastFetch: Map<string, number> = new Map();

  static async getUserRoles(userId?: string): Promise<UserRole[]> {
    const supabase = createClient();
    
    // Get current user if not provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      userId = user.id;
    }

    // Check cache
    const cached = this.rolesCache.get(userId);
    const lastFetchTime = this.lastFetch.get(userId) || 0;
    if (cached && Date.now() - lastFetchTime < this.cacheTimeout) {
      return cached;
    }

    // Fetch from database
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user roles:", error);
      return [];
    }

    // Update cache
    const roles = data || [];
    this.rolesCache.set(userId, roles);
    this.lastFetch.set(userId, Date.now());

    return roles;
  }

  static async isAdmin(userId?: string): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roles.some(r => r.role === 'admin');
  }

  static async isModerator(userId?: string): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roles.some(r => r.role === 'moderator' || r.role === 'admin');
  }

  static async hasRole(role: 'user' | 'admin' | 'moderator', userId?: string): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roles.some(r => r.role === role);
  }

  static clearCache(userId?: string) {
    if (userId) {
      this.rolesCache.delete(userId);
      this.lastFetch.delete(userId);
    } else {
      this.rolesCache.clear();
      this.lastFetch.clear();
    }
  }

  static async assignRole(userId: string, role: 'user' | 'admin' | 'moderator'): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from("user_roles")
      .insert([{ user_id: userId, role }]);

    if (error) throw error;
    this.clearCache(userId);
  }

  static async removeRole(userId: string, role: 'user' | 'admin' | 'moderator'): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", role);

    if (error) throw error;
    this.clearCache(userId);
  }
}