"use client";

import { AppSidebar } from "../components/AppSidebar";
import { AuthProvider } from "../providers/AuthProvider";
import { WordsProvider } from "../providers/WordsProvider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <WordsProvider>
        <AppSidebar>{children}</AppSidebar>
      </WordsProvider>
    </AuthProvider>
  );
}
