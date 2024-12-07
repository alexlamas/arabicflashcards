"use client";

import { Review } from "../components/Review";
import { AuthWrapper } from "../components/AuthWrapper";

export default function ReviewPage() {
  return (
    <AuthWrapper>
      <div className="container mx-auto py-8">
        <Review />
      </div>
    </AuthWrapper>
  );
}
