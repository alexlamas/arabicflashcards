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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import { WordStats } from "../types/word";
import { AuthContext } from "../contexts/AuthContext";

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
                          className="w-full justify-between"
                        >
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
                          <ChevronsUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[300px]">
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
                  <SidebarGroupLabel>View</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={progressFilter === "learning"}
                          onClick={() =>
                            setProgressFilter(
                              progressFilter === "learning" ? null : "learning"
                            )
                          }
                        >
                          <Spinner className="h-4 w-4" />
                          <span>Learning</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={progressFilter === "learned"}
                          onClick={() =>
                            setProgressFilter(
                              progressFilter === "learned" ? null : "learned"
                            )
                          }
                        >
                          <Check className="h-4 w-4" />
                          <span>Learned</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={progressFilter === "all"}
                          onClick={() =>
                            setProgressFilter(
                              progressFilter === "all" ? null : "all"
                            )
                          }
                        >
                          <List className="h-4 w-4" />
                          <span>All words</span>
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
                        <div className="h-2 w-full bg-gray-200 rounded-full mb-4 overflow-hidden">
                          <div className="h-full flex">
                            <div
                              style={{
                                width: `${
                                  (stats.learned / stats.total) * 100
                                }%`,
                              }}
                              className="bg-emerald-500 transition-all duration-300"
                            />
                            <div
                              style={{
                                width: `${
                                  (stats.learning / stats.total) * 100
                                }%`,
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
                              <div className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span>Learned:</span>
                            </div>
                            <span className="font-medium">{stats.learned}</span>
                          </div>

                          <div className="flex justify-between items-center text-amber-600">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-amber-500" />
                              <span>Learning:</span>
                            </div>
                            <span className="font-medium">
                              {stats.learning}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-gray-600">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-gray-400" />
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
              <SidebarRail />
            </Sidebar>
            <SidebarInset>{children}</SidebarInset>
          </SidebarProvider>
        </div>
      </FilterContext.Provider>
    </AuthContext.Provider>
  );
}
