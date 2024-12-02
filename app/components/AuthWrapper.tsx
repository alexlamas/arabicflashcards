"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { supabase } from "../supabase";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ArabicKeyboard from "./ArabicKeyboard";

type AuthContextType = {
  session: Session | null;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true,
  refreshSession: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
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
    // Initial session fetch
    refreshSession().then(() => setIsLoading(false));

    // Listen for auth changes
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

      // Clear session state first
      setSession(null);

      // Clear local storage
      window.localStorage.removeItem("sb-token");
      window.localStorage.clear(); // Clear all Supabase-related items

      // Attempt sign out
      await supabase.auth.signOut();

      // Force page refresh in development to clear all state
      if (process.env.NODE_ENV === "development") {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error during sign out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const authButton = session ? (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={isLoading}
    >
      Log out
    </Button>
  ) : (
    <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          Log in to track progress
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log in to track your progress</DialogTitle>
          <DialogDescription>
            Create an account or log in to save your progress and track your
            learning journey.
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
  );

  return (
    <AuthContext.Provider value={{ session, isLoading, refreshSession }}>
      <div className="animate-in fade-in duration-500">
        <header className="p-4 bg-white shadow-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-semibold">Lebanese Arabic</h1>
            <div className="inline-flex gap-2">
              <ArabicKeyboard />
              {authButton}
            </div>
          </div>
        </header>
        {children}
      </div>
    </AuthContext.Provider>
  );
}
