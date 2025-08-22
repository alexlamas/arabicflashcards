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
  GridFour,
  Archive,
  GameController,
  BabyIcon,
  ShieldChevronIcon,
  RocketLaunchIcon,
  ChatCircleText,
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

interface AppSidebarProps {
  children: React.ReactNode;
}

export function AppSidebar({ children }: AppSidebarProps) {
  const pathname = usePathname();
  const { navigate } = useOfflineNavigation();
  const {
    reviewCount,
    totalWords,
    weekCount,
    monthCount,
    learnedCount,
    archiveCount,
  } = useWords();
  const { session } = useAuth();
  const { setShowAuthDialog, handleLogout } = useAuth();

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
                      <GridFour className="h-4 w-4" />
                      <span>All words</span>
                      <SidebarMenuBadge>{totalWords}</SidebarMenuBadge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={pathname === "/this-week"}
                      onClick={() => navigate("/this-week")}
                    >
                      <BabyIcon className="h-4 w-4" />
                      <span>This week</span>
                      <SidebarMenuBadge>{weekCount}</SidebarMenuBadge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={pathname === "/this-month"}
                      onClick={() => navigate("/this-month")}
                    >
                      <ShieldChevronIcon className="h-4 w-4" />
                      <span>This month</span>
                      <SidebarMenuBadge>{monthCount}</SidebarMenuBadge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={pathname === "/learned"}
                      onClick={() => navigate("/learned")}
                    >
                      <RocketLaunchIcon className="h-4 w-4" />
                      <span>Learned</span>
                      <SidebarMenuBadge>{learnedCount}</SidebarMenuBadge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={pathname === "/archive"}
                      onClick={() => navigate("/archive")}
                    >
                      <Archive className="h-4 w-4" />
                      <span>Not Started</span>
                      <SidebarMenuBadge>{archiveCount}</SidebarMenuBadge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={pathname === "/phrases"}
                      onClick={() => navigate("/phrases")}
                    >
                      <ChatCircleText className="h-4 w-4" />
                      <span>Phrases</span>
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
                      <span>Memory Game</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={pathname === "/review"}
                      onClick={() => navigate("/review")}
                    >
                      <GraduationCap className="h-4 w-4" />
                      <span>Review</span>
                      <SidebarMenuBadge>{reviewCount}</SidebarMenuBadge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
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
