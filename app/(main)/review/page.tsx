"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/app/components/Header";
import { Review } from "../../components/review/Review";

function ReviewContent() {
  const searchParams = useSearchParams();
  const packId = searchParams.get("pack") || undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <Header variant="review" />
      <div className="flex-1 flex items-start justify-center mt-[10vh]">
        <Review packId={packId} />
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <Header variant="review" />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    }>
      <ReviewContent />
    </Suspense>
  );
}
