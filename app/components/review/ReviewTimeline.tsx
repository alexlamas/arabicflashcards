import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { supabase } from "@/app/supabase";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ReviewItem {
  next_review_date: Date;
  id: string;
  isNew?: boolean;
}

export default function ReviewTimeline() {
  const { session } = useAuth();
  const [reviewData, setReviewData] = useState<ReviewItem[]>([]);
  const [newReviewId, setNewReviewId] = useState<string | null>(null);

  const fetchReviewData = useCallback(async () => {
    if (!session?.user) {
      return;
    }

    try {
      const now = new Date();
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);

      const { data, error } = await supabase
        .from("word_progress")
        .select("id, next_review_date")
        .eq("user_id", session.user.id)
        .gte("next_review_date", now.toISOString())
        .lte("next_review_date", nextWeek.toISOString())
        .order("next_review_date");

      if (error) throw error;

      const timeline = data.map((item) => ({
        id: item.id,
        next_review_date: new Date(item.next_review_date),
      }));

      setReviewData(timeline);
    } catch (error) {
      console.error("Error fetching review data:", error);
    }
  }, [session]);

  useEffect(() => {
    fetchReviewData();

    if (!session?.user) return;

    const channel = supabase
      .channel("word-progress-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "word_progress",
          filter: `user_id=eq.${session.user.id}`,
        },
        async (payload) => {
          if (payload.new && payload.eventType === "UPDATE") {
            setNewReviewId(payload.new.id);
            setTimeout(() => {
              setNewReviewId(null);
            }, 3000);
            await fetchReviewData();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, fetchReviewData]);

  if (!session?.user || reviewData.length === 0) {
    return null;
  }

  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 7);

  const timelineWidth = 100;
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
          {/* Day labels */}
          <div className="absolute bottom-[0.5px] w-full flex justify-between px-24 pb-2 z-30">
            {dayLabels.map(({ label }, i) => {
              const position = (i / 6) * 100;
              return (
                <div
                  key={i}
                  className="absolute text-xs text-muted-foreground px-1 rounded-full bg-white/80 border border-black/5 shadow-sm first:-ml-6"
                  style={{
                    left: `${position}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  {label}
                </div>
              );
            })}
          </div>

          {/* Timeline bar */}
          <div className="absolute top-1/2 w-full h-0.5 bg-gray-100 rounded" />

          {/* Review markers */}
          {reviewData.map((item) => {
            const timeSinceStart =
              item.next_review_date.getTime() - now.getTime();
            const position = (timeSinceStart / totalDuration) * timelineWidth;

            if (position >= 0 && position <= 100) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "absolute w-1 h-4 rounded-full -translate-y-1/2 top-1/2 -translate-x-1/2 transition-all duration-300 cursor-pointer hover:h-5 hover:w-2 bg-transparent",
                        newReviewId === item.id
                          ? "bg-blue-500 animate-in fade-in zoom-in"
                          : "bg-blue-500/50"
                      )}
                      style={{
                        left: `${position}%`,
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="bg-transparent">
                    <div className="text-xs text-muted-foreground px-1 rounded-full bg-white/80 border border-black/5 shadow-sm">
                      {formatTime(item.next_review_date)}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            }
            return null;
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
