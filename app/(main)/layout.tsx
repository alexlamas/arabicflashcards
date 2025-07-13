"use client";

import { AppSidebar } from "../components/AppSidebar";
import { AuthProvider } from "../providers/AuthProvider";
import { WordsProvider } from "../providers/WordsProvider";
import { OfflineIndicator } from "../components/OfflineIndicator";
import { ServiceWorkerRegistration } from "../components/ServiceWorkerRegistration";

function MainLayoutContent({ children }: { children: React.ReactNode }) {
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
        <MainLayoutContent>{children}</MainLayoutContent>
      </WordsProvider>
    </AuthProvider>
  );
}
