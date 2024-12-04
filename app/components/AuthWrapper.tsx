"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { supabase } from "../supabase";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Session } from "@supabase/supabase-js";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Check, List, Spinner } from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { ChevronsUpDown } from "lucide-react";
import { WordStats } from "../types/word";

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
  stats?: WordStats;
}

export function AuthWrapper({ children, stats }: AuthWrapperProps) {
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

  const login = (
    <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log in</DialogTitle>
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
        {login}
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton className="h-16">
                        <div>
                          <div className="text-lg font-semibold">
                            Learn Lebanese
                          </div>
                          {session?.user?.email ? (
                            session.user.email
                          ) : (
                            <span className="text-slate-500 text-sm">
                              Log in to track progress
                            </span>
                          )}
                        </div>

                        <ChevronsUpDown className="ml-auto" />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="top"
                      className="w-[--radix-popper-anchor-width]"
                    >
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
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Application</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Spinner /> Learning
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Check /> Learned
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <List /> All words
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              {session && stats && (
                <SidebarGroup>
                  <SidebarGroupLabel>Progress</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <div className="px-3 py-2">
                      {/* Progress Bar */}
                      <div className="h-2 w-full bg-gray-200 rounded-full mb-4 overflow-hidden">
                        <div className="h-full flex">
                          <div
                            style={{
                              width: `${(stats.learned / stats.total) * 100}%`,
                            }}
                            className="bg-emerald-500 transition-all duration-300"
                          />
                          <div
                            style={{
                              width: `${(stats.learning / stats.total) * 100}%`,
                            }}
                            className="bg-amber-500 transition-all duration-300"
                          />
                          <div
                            style={{
                              width: `${(stats.new / stats.total) * 100}%`,
                            }}
                            className="bg-gray-300 transition-all duration-300"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center text-emerald-600">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span>Learned:</span>
                          </div>
                          <span className="font-medium">{stats.learned}</span>
                        </div>

                        <div className="flex justify-between items-center text-amber-600">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                            <span>Learning:</span>
                          </div>
                          <span className="font-medium">{stats.learning}</span>
                        </div>

                        <div className="flex justify-between items-center text-gray-600">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                            <span>Not started:</span>
                          </div>
                          <span className="font-medium">{stats.new}</span>
                        </div>

                        <div className="flex justify-between pt-2 border-t">
                          <span>Total:</span>
                          <span className="font-medium">{stats.total}</span>
                        </div>
                      </div>
                    </div>
                  </SidebarGroupContent>
                </SidebarGroup>
              )}
            </SidebarContent>
            <SidebarRail></SidebarRail>
          </Sidebar>
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </div>
    </AuthContext.Provider>
  );
}
