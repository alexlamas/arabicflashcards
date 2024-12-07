// app/hooks/useReviewCount.ts
import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../contexts/AuthContext";
import { SpacedRepetitionService } from "../services/spacedRepetitionService";

// app/hooks/useReviewCount.ts
export function useReviewCount() {
  const { session } = useAuth();
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCount() {
      if (!session?.user) {
        setCount(0);
        setLoading(false);
        return;
      }

      try {
        const count = await SpacedRepetitionService.getDueWordsCount(
          session.user.id
        );
        setCount(count);
      } catch (error) {
        console.error("Error fetching due words count:", error);
        setCount(0);
      } finally {
        setLoading(false);
      }
    }

    fetchCount();

    const handleWordProgressUpdate = (e: CustomEvent) => {
      setCount(e.detail.count);
    };

    window.addEventListener(
      "wordProgressUpdated",
      handleWordProgressUpdate as EventListener
    );

    const channel = supabase
      .channel("review-count-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "word_progress",
          filter: `user_id=eq.${session?.user?.id}`,
        },
        (payload) => {
          fetchCount();
        }
      )
      .subscribe((status) => {});

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  return { count, loading };
}
