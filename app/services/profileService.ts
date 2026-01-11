import { createClient } from "@/utils/supabase/client";

export type FluencyLevel = "beginner" | "intermediate" | "advanced";

export interface UserProfile {
  id: string;
  first_name: string | null;
  avatar: string | null;
  fluency: FluencyLevel | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export const AVATAR_OPTIONS = [
  { id: "pomegranate", label: "Pomegranate", image: "/avatars/pomegranate.svg" },
  { id: "tree", label: "Tree", image: "/avatars/tree.svg" },
  { id: "moon", label: "Moon", image: "/avatars/moon.svg" },
  { id: "cedar", label: "Cedar", image: "/avatars/cedar.svg" },
  { id: "leaf", label: "Leaf", image: "/avatars/leaf.svg" },
] as const;

export const ProfileService = {
  async getProfile(): Promise<UserProfile | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      return null;
    }

    return data;
  },

  async updateProfile(profile: {
    first_name?: string;
    avatar?: string;
    fluency?: FluencyLevel;
    onboarding_completed?: boolean;
  }): Promise<UserProfile | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Try to upsert - insert if doesn't exist, update if it does
    const { data, error } = await supabase
      .from("user_profiles")
      .upsert({
        id: user.id,
        ...profile,
      })
      .select()
      .single();

    if (error) {
      return null;
    }

    return data;
  },
};
