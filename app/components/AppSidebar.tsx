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
} from "@/components/ui/sidebar";
import { GraduationCap, GridFour } from "@phosphor-icons/react";
import { usePathname, useRouter } from "next/navigation";
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

interface AppSidebarProps {
  children: React.ReactNode;
}

export function AppSidebar({ children }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { reviewCount } = useWords();
  const { session } = useAuth();
  const { totalWords } = useWords();
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
                      onClick={() => router.push("/")}
                    >
                      <GridFour className="h-4 w-4" />
                      <span>Browse all words</span>
                      <SidebarMenuBadge>{totalWords}</SidebarMenuBadge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={pathname === "/review"}
                      onClick={() => router.push("/review")}
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
