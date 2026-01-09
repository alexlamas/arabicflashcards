"use client";

import { useState } from "react";
import Image from "next/image";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarFooter,
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  GraduationCap,
  GameController,
  BookOpen,
  GearSix,
  HouseSimple,
  NotePencil,
  Swatches,
  SignOut,
  ChatCircle,
  CaretUpDown,
} from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { useWords } from "../contexts/WordsContext";
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../contexts/ProfileContext";
import { AVATAR_OPTIONS } from "../services/profileService";
import { AuthDialog } from "./AuthDialog";
import { SettingsModal } from "./SettingsModal";
import { FeedbackModal } from "./FeedbackModal";
import { useOfflineNavigation } from "../hooks/useOfflineNavigation";
import { useUserRoles } from "../hooks/useUserRoles";

interface AppSidebarProps {
  children: React.ReactNode;
}

export function AppSidebar({ children }: AppSidebarProps) {
  const pathname = usePathname();
  const { navigate } = useOfflineNavigation();
  const { reviewCount, totalWords } = useWords();
  const { session, handleLogout } = useAuth();
  const { firstName: profileFirstName, avatar } = useProfile();
  const { isAdmin, isReviewer } = useUserRoles();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const displayName = profileFirstName || session?.user?.email?.split("@")[0] || "User";
  const avatarImage = AVATAR_OPTIONS.find(a => a.id === avatar)?.image || "/avatars/pomegranate.svg";

  return (
    <>
      <AuthDialog />

      <SidebarProvider>
        <Sidebar variant="floating">
          <SidebarContent className="min-h-0">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={pathname === "/"}
                      onClick={() => navigate("/")}
                    >
                      <HouseSimple className="h-4 w-4" />
                      <span>Home</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={pathname === "/review"}
                      onClick={() => navigate("/review")}
                    >
                      <GraduationCap className="h-4 w-4" />
                      <span>Review</span>
                      {reviewCount > 0 && (
                        <SidebarMenuBadge>{reviewCount}</SidebarMenuBadge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
              
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={pathname === "/my-words"}
                      onClick={() => navigate("/my-words")}
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>My words</span>
                      <SidebarMenuBadge>{totalWords}</SidebarMenuBadge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={pathname === "/memory-game"}
                      onClick={() => navigate("/memory-game")}
                    >
                      <GameController className="h-4 w-4" />
                      <span>Memory game</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                 
                  {isReviewer && (
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={pathname === "/content-editor"}
                        onClick={() => navigate("/content-editor")}
                      >
                        <NotePencil className="h-4 w-4" />
                        <span>Content editor</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  {isAdmin && (
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={pathname === "/admin"}
                          onClick={() => navigate("/admin")}
                        >
                          <GearSix className="h-4 w-4" />
                          <span>Admin</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={pathname === "/design-system"}
                          onClick={() => navigate("/design-system")}
                        >
                          <Swatches className="h-4 w-4" />
                          <span>Design system</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="h-12">
                      <Image
                        src={avatarImage}
                        alt="Avatar"
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <span className="truncate">{displayName}</span>
                      <CaretUpDown className="ml-auto h-4 w-4 opacity-50" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    align="start"
                    className="w-[--radix-dropdown-menu-trigger-width]"
                  >
                    <DropdownMenuItem disabled className="text-xs text-gray-500">
                      {session?.user?.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                      <GearSix className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsFeedbackOpen(true)}>
                      <ChatCircle className="w-4 h-4 mr-2" />
                      Send feedback
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <SignOut className="w-4 h-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>{children}</SidebarInset>
        <SidebarTrigger />
      </SidebarProvider>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </>
  );
}
