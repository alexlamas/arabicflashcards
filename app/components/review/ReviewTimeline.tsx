import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { createClient } from "@/utils/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RealtimeChannel } from "@supabase/supabase-js";

interface ReviewItem {
  id: string;
  word_english: string;
  next_review_date: Date;
}

export default function ReviewTimeline() {
  const { session } = useAuth();
  const [reviewData, setReviewData] = useState<ReviewItem[]>([]);

  const fetchReviewData = useCallback(async () => {
    if (!session?.user) return;

    try {
      const supabase = createClient();
      const now = new Date();
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);

      // First fetch current reviews (due now or overdue)
      const { data: currentReviews, error: currentError } = await supabase
        .from("word_progress")
        .select("id, next_review_date, word_english")
        .eq("user_id", session.user.id)
        .in("status", ["learning", "learned"])
        .lte("next_review_date", now.toISOString())
        .order("next_review_date", { ascending: false });

      if (currentError) throw currentError;

      // Then fetch upcoming reviews
      const { data: upcomingReviews, error: upcomingError } = await supabase
        .from("word_progress")
        .select("id, next_review_date, word_english")
        .eq("user_id", session.user.id)
        .in("status", ["learning", "learned"])
        .gt("next_review_date", now.toISOString())
        .lte("next_review_date", nextWeek.toISOString())
        .order("next_review_date");

      if (upcomingError) throw upcomingError;

      const timeline = [
        ...(currentReviews || []),
        ...(upcomingReviews || []),
      ].map((item) => ({
        id: item.id,
        word_english: item.word_english,
        next_review_date: new Date(item.next_review_date),
      }));

      setReviewData(timeline);
    } catch (error) {
      console.error("Error fetching review data:", error);
    }
  }, [session]);

  useEffect(() => {
    fetchReviewData();

    // Listen for word progress updates
    const handleWordProgressUpdate = () => {
      fetchReviewData();
    };

    window.addEventListener("wordProgressUpdated", handleWordProgressUpdate);

    // Subscribe to realtime updates as backup
    let channel: RealtimeChannel;
    if (session?.user) {
      const supabase = createClient();
      channel = supabase
        .channel("word_progress_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "word_progress",
            filter: `user_id=eq.${session.user.id}`,
          },
          () => {
            fetchReviewData();
          }
        )
        .subscribe();
    }

    return () => {
      window.removeEventListener(
        "wordProgressUpdated",
        handleWordProgressUpdate
      );
      if (channel) {
        const supabase = createClient();
        supabase.removeChannel(channel);
      }
    };
  }, [fetchReviewData, session]);

  if (!session?.user || reviewData.length === 0) return null;

  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 7);

  const totalDuration = endDate.getTime() - now.getTime();

  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    return {
      date,
      label:
        i === 0
          ? "Now"
          : date.toLocaleDateString(undefined, { weekday: "short" }),
    };
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="inline-flex gap-4 items-center w-full">
        <div className="relative w-full mr-8 ml-12">
          <div className="absolute bottom-[0.5px] w-full flex justify-between px-24 pb-2 z-30">
            {dayLabels.map(({ label }, i) => (
              <div
                key={i}
                className="absolute text-xs text-muted-foreground px-1 rounded-full bg-white/80 border border-black/5 shadow-sm first:-ml-6"
                style={{
                  left: `${(i / 6) * 100}%`,
                  transform: "translateX(-50%)",
                }}
              >
                {label}
              </div>
            ))}
          </div>

          <div className="absolute top-1/2 w-full h-0.5 bg-gray-100 rounded" />

          {reviewData.map((item) => {
            const timeSinceStart =
              item.next_review_date.getTime() - now.getTime();
            const position = Math.max(
              0,
              (timeSinceStart / totalDuration) * 100
            );

            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <div
                    className={`absolute w-1 h-4 rounded-full -translate-y-1/2 top-1/2 -translate-x-1/2 cursor-pointer transition-all hover:h-5 hover:w-2 ${
                      position === 0 ? "bg-blue-600/70" : "bg-blue-500/50"
                    }`}
                    style={{
                      left: `${position}%`,
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent className="bg-transparent">
                  <div className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-white/80 border border-black/5 shadow-sm">
                    {item.word_english} - {formatTime(item.next_review_date)}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
