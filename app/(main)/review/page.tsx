"use client";

import { Header } from "@/app/components/Header";
import { Review } from "../../components/review/Review";

export default function ReviewPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-start justify-center mt-[10vh]">
        <Review />
      </div>
    </div>
  );
}
