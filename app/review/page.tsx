"use client";

import { Review } from "../components/Review";
import { AuthWrapper } from "../components/AuthWrapper";

export default function ReviewPage() {
  return (
    <AuthWrapper>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Review Words</h1>
        <Review />
      </div>
    </AuthWrapper>
  );
}
