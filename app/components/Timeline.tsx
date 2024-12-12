import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/app/contexts/AuthContext";
import { supabase } from "@/app/supabase";

interface ReviewItem {
  next_review_date: string;
  word_count: number;
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
        now.setHours(0, 0, 0, 0); // Start of today

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

        // Group reviews by date and count them
        const groupedData = data.reduce((acc: Record<string, number>, item) => {
          // Parse the date and format it as YYYY-MM-DD to use as key
          const date = new Date(item.next_review_date);
          const dateKey = date.toISOString().split("T")[0];
          acc[dateKey] = (acc[dateKey] || 0) + 1;
          return acc;
        }, {});

        // Create an array of the next 7 days
        const timeline: ReviewItem[] = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(now);
          date.setDate(date.getDate() + i);
          const dateKey = date.toISOString().split("T")[0];

          timeline.push({
            next_review_date: dateKey,
            word_count: groupedData[dateKey] || 0,
          });
        }

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
      <div className="h-24 flex items-center justify-center">Loading...</div>
    );
  }

  if (!session?.user) {
    return null;
  }

  if (reviewData.length === 0) {
    return null;
  }

  const maxCount = Math.max(...reviewData.map((d) => d.word_count));
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium mb-4">Upcoming Reviews</h3>
      <div className="flex gap-2 h-24">
        {reviewData.map((item, index) => {
          const height =
            item.word_count > 0 ? (item.word_count / maxCount) * 100 : 0;
          const date = new Date(item.next_review_date);
          const isToday = new Date().toDateString() === date.toDateString();

          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="flex-1 w-full flex items-end">
                <div
                  className={`w-full rounded-t transition-all duration-200 ${
                    height > 0 ? "bg-blue-100" : "bg-gray-50"
                  }`}
                  style={{ height: `${Math.max(height, 10)}%` }}
                >
                  {item.word_count > 0 && (
                    <div className="text-xs text-center font-medium text-blue-600 py-1">
                      {item.word_count}
                    </div>
                  )}
                </div>
              </div>
              <div
                className={`text-xs mt-2 ${
                  isToday
                    ? "font-medium text-blue-600"
                    : "text-muted-foreground"
                }`}
              >
                {days[date.getDay()]}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
