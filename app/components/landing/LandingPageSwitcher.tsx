"use client";

import { useSearchParams } from "next/navigation";
import { NotionLandingPage } from "./NotionLandingPage";
import { BotanicalLandingPage } from "./BotanicalLandingPage";
import { BoldLandingPage } from "./BoldLandingPage";
import { Suspense } from "react";

function LandingPageContent() {
  const searchParams = useSearchParams();
  const theme = searchParams.get("theme");

  switch (theme) {
    case "botanical":
      return <BotanicalLandingPage />;
    case "bold":
      return <BoldLandingPage />;
    case "notion":
    default:
      return <NotionLandingPage />;
  }
}

export function LandingPageSwitcher() {
  return (
    <Suspense fallback={<NotionLandingPage />}>
      <LandingPageContent />
    </Suspense>
  );
}
