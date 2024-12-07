import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import {
  Check,
  GraduationCap,
  GridFour,
  List,
  Spinner,
} from "@phosphor-icons/react";
import { WordStats } from "../types/word";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarWithProgressProps {
  stats: WordStats | null;
  progressFilter: "learning" | "learned" | "all" | null;
  setProgressFilter: (filter: "learning" | "learned" | "all" | null) => void;
}

export function AppSidebar({ stats }: SidebarWithProgressProps) {
  const pathname = usePathname();

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/">
                <SidebarMenuButton isActive={pathname === "/"}>
                  <GridFour className="h-4 w-4" />
                  <span>Browse all words</span>
                  {stats && <SidebarMenuBadge>{stats.total}</SidebarMenuBadge>}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/review">
                <SidebarMenuButton isActive={pathname === "/review"}>
                  <GraduationCap className="h-4 w-4" />
                  <span>Review</span>
                  <SidebarMenuBadge>5</SidebarMenuBadge>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}
