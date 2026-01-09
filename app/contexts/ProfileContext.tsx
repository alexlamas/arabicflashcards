"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ProfileService, UserProfile } from "../services/profileService";
import { useAuth } from "./AuthContext";

interface ProfileContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  firstName: string | null;
  updateProfile: (profile: { first_name?: string; last_name?: string }) => Promise<void>;
  refetchProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    if (!session) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await ProfileService.getProfile();
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [session]);

  const updateProfile = async (profileData: { first_name?: string; last_name?: string }) => {
    const updated = await ProfileService.updateProfile(profileData);
    if (updated) {
      setProfile(updated);
    }
  };

  const firstName = profile?.first_name || null;

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoading,
        firstName,
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
