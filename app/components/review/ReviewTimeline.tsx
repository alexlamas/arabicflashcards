import React, { useState, useEffect, useCallback, useMemo } from "react";
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

      // Fetch ALL reviews to calculate 90th percentile
      const { data: allReviews, error } = await supabase
        .from("word_progress")
        .select("id, next_review_date, word_english")
        .eq("user_id", session.user.id)
        .in("status", ["learning", "learned"])
        .not("next_review_date", "is", null)
        .order("next_review_date");

      if (error) throw error;

      const timeline = (allReviews || []).map((item) => ({
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

  // Calculate 90th percentile end date and generate labels
  const { endDate, timeLabels, filteredData } = useMemo(() => {
    if (reviewData.length === 0) {
      return { endDate: new Date(), timeLabels: [], filteredData: [] };
    }

    const now = new Date();
    const sortedDates = [...reviewData].sort(
      (a, b) => a.next_review_date.getTime() - b.next_review_date.getTime()
    );

    // Find 90th percentile
    const percentileIndex = Math.floor(sortedDates.length * 0.9);
    const percentileDate = sortedDates[Math.min(percentileIndex, sortedDates.length - 1)].next_review_date;

    // Ensure at least 1 day range
    const minEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const endDate = percentileDate > minEnd ? percentileDate : minEnd;

    const totalMs = endDate.getTime() - now.getTime();
    const totalDays = totalMs / (24 * 60 * 60 * 1000);

    // Generate smart labels based on range
    const labels: { date: Date; label: string; position: number }[] = [];
    const maxLabels = 7;

    if (totalDays <= 7) {
      // Daily labels
      const step = Math.max(1, Math.ceil(totalDays / maxLabels));
      for (let i = 0; i <= totalDays && labels.length < maxLabels; i += step) {
        const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
        const label = i === 0 ? "Now" : date.toLocaleDateString(undefined, { weekday: "short" });
        labels.push({ date, label, position: (i / totalDays) * 100 });
      }
    } else if (totalDays <= 60) {
      // Weekly labels
      const weeks = Math.ceil(totalDays / 7);
      const step = Math.max(1, Math.ceil(weeks / maxLabels));
      for (let i = 0; i <= weeks && labels.length < maxLabels; i += step) {
        const date = new Date(now.getTime() + i * 7 * 24 * 60 * 60 * 1000);
        const label = i === 0 ? "Now" : `${i}w`;
        labels.push({ date, label, position: Math.min((i * 7 / totalDays) * 100, 100) });
      }
    } else {
      // Monthly labels
      const months = Math.ceil(totalDays / 30);
      const step = Math.max(1, Math.ceil(months / maxLabels));
      for (let i = 0; i <= months && labels.length < maxLabels; i += step) {
        const date = new Date(now.getTime() + i * 30 * 24 * 60 * 60 * 1000);
        const label = i === 0 ? "Now" : `${i}mo`;
        labels.push({ date, label, position: Math.min((i * 30 / totalDays) * 100, 100) });
      }
    }

    // Filter data to only include items within range
    const filtered = reviewData.filter(
      item => item.next_review_date <= endDate
    );

    return { endDate, timeLabels: labels, filteredData: filtered };
  }, [reviewData]);

  if (!session?.user || reviewData.length === 0) return null;

  const now = new Date();
  const totalDuration = endDate.getTime() - now.getTime();

  const formatTime = (date: Date) => {
    const diffMs = date.getTime() - now.getTime();
    const diffDays = diffMs / (24 * 60 * 60 * 1000);

    if (diffDays < 1) {
      return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    } else if (diffDays < 7) {
      return date.toLocaleDateString(undefined, { weekday: "short", hour: "numeric" });
    } else if (diffDays < 30) {
      return `${Math.round(diffDays / 7)}w`;
    } else {
      return `${Math.round(diffDays / 30)}mo`;
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="inline-flex gap-4 items-center w-full">
        <div className="relative w-full mr-8 ml-12">
          <div className="absolute bottom-[0.5px] w-full flex justify-between px-24 pb-2 z-30">
            {timeLabels.map(({ label, position }, i) => (
              <div
                key={i}
                className="absolute text-xs text-muted-foreground px-1 rounded-full bg-white/80 border border-black/5 shadow-sm"
                style={{
                  left: `${position}%`,
                  transform: "translateX(-50%)",
                }}
              >
                {label}
              </div>
            ))}
          </div>

          <div className="absolute top-1/2 w-full h-0.5 bg-gray-100 rounded" />

          {filteredData.map((item) => {
            const timeSinceStart =
              item.next_review_date.getTime() - now.getTime();
            const position = Math.max(
              0,
              Math.min((timeSinceStart / totalDuration) * 100, 100)
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
