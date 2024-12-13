"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Session } from "@supabase/supabase-js";

import { AuthContext } from "../contexts/AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setShowAuthDialog(false);
    });

    return () => subscription.unsubscribe();
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
    } catch (error) {
      console.error("Error during sign out:", error);
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
