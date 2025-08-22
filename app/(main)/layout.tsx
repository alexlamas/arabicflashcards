"use client";

import { AppSidebar } from "../components/AppSidebar";
import { AuthProvider } from "../providers/AuthProvider";
import { WordsProvider } from "../providers/WordsProvider";
import { OfflineIndicator } from "../components/OfflineIndicator";
import { ServiceWorkerRegistration } from "../components/ServiceWorkerRegistration";
import { AuthDialog } from "../components/AuthDialog";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // Redirect to landing page if not authenticated and not already there
    if (!loading && !session && pathname !== "/") {
      router.push("/");
    }
  }, [session, loading, pathname, router]);
  
  // Show nothing while checking auth
  if (loading) {
    return null;
  }
  
  // Only show sidebar for authenticated users
  if (!session) {
    return (
      <>
        <ServiceWorkerRegistration />
        {children}
        <OfflineIndicator />
        <AuthDialog />
      </>
    );
  }
  
  return (
    <>
      <ServiceWorkerRegistration />
      <AppSidebar>{children}</AppSidebar>
      <OfflineIndicator />
    </>
  );
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <WordsProvider>
        <AuthenticatedLayout>{children}</AuthenticatedLayout>
      </WordsProvider>
    </AuthProvider>
  );
}
