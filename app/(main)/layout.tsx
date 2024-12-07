"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarRail,
} from "@/components/ui/sidebar";
import { AppSidebar } from "../components/AppSidebar";
import { AuthWrapper } from "../components/AuthWrapper";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthWrapper>
      <SidebarProvider>
        <Sidebar>
          <AppSidebar stats={null} />
          <SidebarRail />
        </Sidebar>
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </AuthWrapper>
  );
}
