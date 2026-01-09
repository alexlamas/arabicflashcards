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
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "../contexts/AuthContext";
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
  const { session } = useAuth();
  const { setShowAuthDialog, handleLogout } = useAuth();
  const { isAdmin, isReviewer } = useUserRoles();

  const handleLoginClick = (event: Event) => {
    event.preventDefault();
    if (setShowAuthDialog) {
      setShowAuthDialog(true);
    }
  };
  return (
    <>
      <AuthDialog />

      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between h-full py-3 pl-1"
                    >
                      <div className="flex items-center gap-2">
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
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {session ? (
                      <>
                        <DropdownMenuItem disabled className="text-xs text-gray-500">
                          {session.user.email}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout}>
                          Log out
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem onSelect={handleLoginClick}>
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
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={pathname === "/my-words"}
                      onClick={() => navigate("/my-words")}
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>My Words</span>
                      <SidebarMenuBadge>{totalWords}</SidebarMenuBadge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={pathname === "/memory-game"}
                      onClick={() => navigate("/memory-game")}
                    >
                      <GameController className="h-4 w-4" />
                      <span>Memory game</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
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
      </SidebarProvider>
    </>
  );
}
