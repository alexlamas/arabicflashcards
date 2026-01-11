"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { useUserRoles } from "../../hooks/useUserRoles";
import { SubNav, TabConfig } from "../../components/SubNav";
import { Loader2 } from "lucide-react";

export function AdminWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, isLoading: isAuthLoading } = useAuth();
  const { isAdmin, isReviewer, isLoading: isRolesLoading } = useUserRoles();
  const canAccess = isAdmin || isReviewer;

  // Redirect non-admins/reviewers
  useEffect(() => {
    if (!isAuthLoading && !isRolesLoading) {
      if (!session || !canAccess) {
        router.push("/");
      }
    }
  }, [session, canAccess, isAuthLoading, isRolesLoading, router]);

  // Show loading while checking auth
  if (isAuthLoading || isRolesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!session || !canAccess) {
    return null;
  }

  // Determine active tab from pathname
  let activeTab = "review";
  if (pathname.includes("/packs")) activeTab = "packs";
  else if (pathname.includes("/instagram")) activeTab = "instagram";
  else if (pathname.includes("/users")) activeTab = "users";
  else if (pathname.includes("/design-system")) activeTab = "design-system";

  const tabs: TabConfig[] = [
    ...(isAdmin ? [
      { key: "users", label: "Users", href: "/admin/users" },
    ] : []),
    { key: "review", label: "Review", href: "/admin/review" },
    { key: "packs", label: "Packs", href: "/admin/packs" },
    ...(isAdmin ? [
      { key: "instagram", label: "Instagram", href: "/admin/instagram" },
      { key: "design-system", label: "Design system", href: "/admin/design-system" },
    ] : []),
  ];

  return (
    <>
      <SubNav tabs={tabs} activeTab={activeTab} />
      <div className="pt-12">
        {children}
      </div>
    </>
  );
}
