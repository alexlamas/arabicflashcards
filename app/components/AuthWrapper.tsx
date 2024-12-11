"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Session } from "@supabase/supabase-js";
import { FilterContext } from "../contexts/FilterContext";
import { WordStats } from "../types/word";
import { AuthContext } from "../contexts/AuthContext";
import { AppSidebar } from "./AppSidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [progressFilter, setProgressFilter] = useState<
    "learning" | "learned" | "all" | null
  >(null);

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

  const stats: WordStats | null = null;
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
    <AuthContext.Provider value={{ session, isLoading, refreshSession }}>
      <FilterContext.Provider value={{ progressFilter, setProgressFilter }}>
        <div className="animate-in fade-in duration-500">
          <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Log in</DialogTitle>
                <DialogDescription>
                  Create an account or log in to save your progress and track
                  your learning journey.
                </DialogDescription>
              </DialogHeader>
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={[]}
                theme="light"
              />
            </DialogContent>
          </Dialog>
          <AppSidebar
            stats={stats}
            handleLogout={handleLogout}
            setShowAuthDialog={setShowAuthDialog}
          >
            {children}
          </AppSidebar>
        </div>
      </FilterContext.Provider>
    </AuthContext.Provider>
  );
}
