"use client";

import { useContext, useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Session } from "@supabase/supabase-js";
import { FilterContext } from "../contexts/FilterContext";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import { WordStats } from "../types/word";
import { AuthContext } from "../contexts/AuthContext";
import { AppSidebar } from "./AppSidebar";

export const useAuth = () => useContext(AuthContext);

interface AuthWrapperProps {
  children: React.ReactNode;
  stats?: WordStats;
}

export function AuthWrapper({ children, stats }: AuthWrapperProps) {
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

          <SidebarProvider>
            <Sidebar>
              <SidebarHeader>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-between h-full"
                        >
                          <div>
                            <div className="text-lg font-semibold text-left">
                              Learn Lebanese
                            </div>
                            <div className="text-slate-500">
                              {session?.user?.email ? (
                                session.user.email
                              ) : (
                                <span>Log in to track progress</span>
                              )}
                            </div>
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        {session ? (
                          <DropdownMenuItem onClick={handleLogout}>
                            Log out
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onSelect={() => setShowAuthDialog(true)}
                          >
                            Log in
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarHeader>

              <AppSidebar
                stats={stats ?? null}
                progressFilter={progressFilter}
                setProgressFilter={setProgressFilter}
              />
              <SidebarRail />
            </Sidebar>
            <SidebarInset>{children}</SidebarInset>
          </SidebarProvider>
        </div>
      </FilterContext.Provider>
    </AuthContext.Provider>
  );
}
