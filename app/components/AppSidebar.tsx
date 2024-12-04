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
import { Check, List, Spinner } from "@phosphor-icons/react";
import { WordStats } from "../types/word";

interface SidebarWithProgressProps {
  stats: WordStats | null;
  progressFilter: "learning" | "learned" | "all" | null;
  setProgressFilter: (filter: "learning" | "learned" | "all" | null) => void;
}

export function AppSidebar({
  stats,
  progressFilter,
  setProgressFilter,
}: SidebarWithProgressProps) {
  return (
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
                {(stats?.learning ?? 0) > 0 && (
                  <SidebarMenuBadge className="bg-slate-700 text-white">
                    {stats?.learning}
                  </SidebarMenuBadge>
                )}
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
                {stats && <SidebarMenuBadge>{stats.learned}</SidebarMenuBadge>}
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={progressFilter === "all"}
                onClick={() =>
                  setProgressFilter(progressFilter === "all" ? null : "all")
                }
              >
                <List className="h-4 w-4" />
                <span>All words</span>
                {stats && <SidebarMenuBadge>{stats.total}</SidebarMenuBadge>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}
