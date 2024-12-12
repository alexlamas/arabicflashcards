"use client";

import { Header } from "@/app/components/Header";
import { Review } from "../../components/Review";
import ReviewTimeline from "@/app/components/Timeline";

export default function ReviewPage() {
  return (
    <div className="container ">
      <Header />
      <ReviewTimeline />

      <Review />
    </div>
  );
}
