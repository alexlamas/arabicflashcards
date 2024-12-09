import { ArrowCounterClockwise } from "@phosphor-icons/react";
import React, { useState, useEffect } from "react";

const NextReviewBadge = ({ nextReviewDate }: { nextReviewDate: string }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const review = new Date(nextReviewDate);
      const diff = review.getTime() - now.getTime();

      if (diff < 0) {
        return "Up for review";
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours < 24) {
        return `Due in ${hours}h`;
      }

      const days = Math.floor(hours / 24);
      return `Due in ${days}d`;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [nextReviewDate]);

  return (
    <div className="inline-flex items-center text-xs font-medium">
      {timeLeft}
    </div>
  );
};

export default NextReviewBadge;
