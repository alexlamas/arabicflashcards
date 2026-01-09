"use client";

import { AuthProvider } from "../providers/AuthProvider";
import { AuthDialog } from "../components/AuthDialog";
import { Toaster } from "@/components/ui/toaster";

export default function NewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {children}
      <AuthDialog />
      <Toaster />
    </AuthProvider>
  );
}
