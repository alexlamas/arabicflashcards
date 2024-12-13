"use client";

import { AuthProvider } from "../providers/AuthProvider";
import { WordsProvider } from "../providers/WordsProvider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <WordsProvider>{children}</WordsProvider>
    </AuthProvider>
  );
}
