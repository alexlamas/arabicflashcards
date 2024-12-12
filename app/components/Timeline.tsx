import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { supabase } from "@/app/supabase";

interface ReviewItem {
  next_review_date: Date;
}

export default function ReviewTimeline() {
  const { session } = useAuth();
  const [reviewData, setReviewData] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviewData() {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      try {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + 7);

        const { data, error } = await supabase
          .from("word_progress")
          .select("next_review_date")
          .eq("user_id", session.user.id)
          .gte("next_review_date", now.toISOString())
          .lte("next_review_date", nextWeek.toISOString())
          .order("next_review_date");

        if (error) throw error;

        const timeline = data.map((item) => ({
          next_review_date: new Date(item.next_review_date),
        }));

        setReviewData(timeline);
      } catch (error) {
        console.error("Error fetching review data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchReviewData();
  }, [session]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">Loading...</div>
    );
  }

  if (!session?.user || reviewData.length === 0) {
    return null;
  }

  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);

  const timelineWidth = 100; // percentage width
  const totalDuration = endDate.getTime() - startDate.getTime();

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayMarkers = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return date;
  });

  return (
    <div className="inline-flex gap-4 items-center w-full">
      <div className="relative w-full mx-8">
        {/* Day labels */}
        <div className="absolute bottom-0 w-full flex justify-between px-24 pb-2 z-30 ">
          {dayMarkers.map((date, i) => {
            const isToday = date.toDateString() === new Date().toDateString();
            const position = (i / 6) * 100;
            return (
              <div
                key={i}
                className={`absolute text-xs text-muted-foreground px-1 rounded-full bg-white/80 border border-black/5 shadow-sm`}
                style={{ left: `${position}%`, transform: "translateX(-50%)" }}
              >
                {isToday ? "Today" : days[date.getDay()]}
              </div>
            );
          })}
        </div>

        {/* Timeline bar */}
        <div className="absolute top-1/2 w-full h-0.5 bg-gray-100 rounded" />

        {/* Review markers */}
        {reviewData.map((item, index) => {
          const timeSinceStart =
            item.next_review_date.getTime() - startDate.getTime();
          const position = (timeSinceStart / totalDuration) * timelineWidth;

          return (
            <div
              key={index}
              className="absolute w-0.5 h-4 bg-blue-500/50 rounded-full -translate-y-1/2"
              style={{
                left: `${position}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
