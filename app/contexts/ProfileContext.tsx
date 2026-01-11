"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ProfileService, UserProfile, FluencyLevel } from "../services/profileService";
import { useAuth } from "./AuthContext";

const PROFILE_CACHE_KEY = "cached_profile";
const LAST_USER_KEY = "last_user_id";

interface ProfileContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  firstName: string | null;
  avatar: string;
  fluency: FluencyLevel | null;
  onboardingCompleted: boolean;
  updateProfile: (profile: {
    first_name?: string;
    avatar?: string;
    fluency?: FluencyLevel;
    onboarding_completed?: boolean;
  }) => Promise<void>;
  refetchProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

function getCachedProfile(userId: string): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem(`${PROFILE_CACHE_KEY}_${userId}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // Ignore localStorage errors
  }
  return null;
}

function setCachedProfile(userId: string, profile: UserProfile) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${PROFILE_CACHE_KEY}_${userId}`, JSON.stringify(profile));
    localStorage.setItem(LAST_USER_KEY, userId);
  } catch {
    // Ignore localStorage errors
  }
}

function getLastUserProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const lastUserId = localStorage.getItem(LAST_USER_KEY);
    if (lastUserId) {
      return getCachedProfile(lastUserId);
    }
  } catch {
    // Ignore localStorage errors
  }
  return null;
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from cache on mount (client-side only)
  useEffect(() => {
    const cached = getLastUserProfile();
    if (cached) {
      setProfile(cached);
      setIsLoading(false);
    }
  }, []);

  const fetchProfile = async (showLoading = true) => {
    if (!session) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    if (showLoading) {
      setIsLoading(true);
    }
    try {
      const data = await ProfileService.getProfile();
      setProfile(data);
      if (data) {
        setCachedProfile(session.user.id, data);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!session) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    // Try to load from cache first for instant display
    const cached = getCachedProfile(session.user.id);
    if (cached) {
      setProfile(cached);
      setIsLoading(false);
      // Fetch fresh data in background (silent)
      fetchProfile(false);
    } else {
      // No cache, fetch with loading state
      fetchProfile(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const updateProfile = async (profileData: {
    first_name?: string;
    avatar?: string;
    fluency?: FluencyLevel;
    onboarding_completed?: boolean;
  }) => {
    const updated = await ProfileService.updateProfile(profileData);
    if (updated) {
      setProfile(updated);
      if (session?.user?.id) {
        setCachedProfile(session.user.id, updated);
      }
    }
  };

  const firstName = profile?.first_name || null;
  const avatar = profile?.avatar || "pomegranate";
  const fluency = profile?.fluency || null;
  const onboardingCompleted = profile?.onboarding_completed ?? false;

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoading,
        firstName,
        avatar,
        fluency,
        onboardingCompleted,
        updateProfile,
        refetchProfile: fetchProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
