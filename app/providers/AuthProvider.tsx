"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { Session } from "@supabase/supabase-js";
import posthog from "posthog-js";

import { AuthContext } from "../contexts/AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  // Create supabase client once
  const supabase = useMemo(() => createClient(), []);

  const refreshSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setSession(session);
  };

  useEffect(() => {
    refreshSession().then(() => setIsLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setShowAuthDialog(false);

      // Track signup/signin in PostHog
      if (event === "SIGNED_IN" && session?.user) {
        posthog.identify(session.user.id, {
          email: session.user.email,
        });
        posthog.capture("signup_completed");
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      setSession(null);
      window.localStorage.removeItem("sb-token");
      window.localStorage.clear();
      await supabase.auth.signOut();

      if (process.env.NODE_ENV === "development") {
        window.location.reload();
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        refreshSession,
        showAuthDialog,
        setShowAuthDialog,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
