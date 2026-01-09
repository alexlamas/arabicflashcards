import Image from "next/image";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarHeader,
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  GraduationCap,
  GameController,
  BookOpen,
  GearSix,
  HouseSimple,
  NotePencil,
  Swatches,
} from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { useWords } from "../contexts/WordsContext";
import { AuthDialog } from "./AuthDialog";
import { useOfflineNavigation } from "../hooks/useOfflineNavigation";
import { useUserRoles } from "../hooks/useUserRoles";

interface AppSidebarProps {
  children: React.ReactNode;
}

export function AppSidebar({ children }: AppSidebarProps) {
  const pathname = usePathname();
  const { navigate } = useOfflineNavigation();
  const {
    reviewCount,
    totalWords,
  } = useWords();
  const { isAdmin, isReviewer } = useUserRoles();
  return (
    <>
      <AuthDialog />

      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 py-3 pl-1 hover:opacity-80 transition-opacity"
            >
              <Image
                src="/logo.svg"
                alt="Yalla Flash"
                width={26}
                height={26}
                className="rounded mb-2"
              />
              <span className="font-pphatton font-bold text-lg">
                Yalla Flash
              </span>
            </button>
          </SidebarHeader>

          <SidebarContent>
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
        </Sidebar>
        <SidebarInset>{children}</SidebarInset>
        <SidebarTrigger />
      </SidebarProvider>
    </>
  );
}
