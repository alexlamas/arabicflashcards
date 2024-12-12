"use client";

import { Header } from "@/app/components/Header";
import { Review } from "../../components/Review";

export default function ReviewPage() {
  return (
    <div className="container ">
      <Header variant="review" />
      <Review />
    </div>
  );
}
