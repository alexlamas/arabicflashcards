import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CircleNotch, Rocket } from "@phosphor-icons/react";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";

interface BoostReviewProps {
  userId: string;
  loadNextWord: () => void;
  packId?: string;
}

export default function BoostReview({
  userId,
  loadNextWord,
  packId,
}: BoostReviewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBoost = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Build query for words not yet due
      let query = supabase
        .from("word_progress")
        .select(`
          id,
          word_id,
          words!inner(pack_id)
        `)
        .eq("user_id", userId)
        .gt("next_review_date", new Date().toISOString())
        .order("next_review_date", { nullsFirst: true })
        .limit(packId ? 20 : 5);

      // Apply pack filter
      if (packId === "my-words") {
        query = query.is("words.pack_id", null);
      } else if (packId) {
        query = query.eq("words.pack_id", packId);
      }

      const { data: progressWords } = await query;

      if (!progressWords || progressWords.length === 0) {
        setError(
          packId
            ? "No words available to boost in this pack."
            : "No words available to boost. Try adding more words to your learning list."
        );
        return;
      }

      // Limit to 5 words
      const wordsToBoost = progressWords.slice(0, 5);
      const wordIds = wordsToBoost.map((w) => w.id);

      // Perform the actual update
      const now = new Date().toISOString();
      await Promise.all(
        wordIds.map((id) =>
          supabase
            .from("word_progress")
            .update({ next_review_date: now })
            .eq("id", id)
        )
      );
    } catch (err) {
      console.error("Error boosting reviews:", err);
      setError("Failed to boost reviews. Please try again.");
    } finally {
      setIsLoading(false);
      loadNextWord();
      window.dispatchEvent(new CustomEvent("wordProgressUpdated"));
    }
  };

  return (
    <div className="max-w-md mx-auto m-4">
      <CardHeader className="text-center">
        <CardTitle>You&apos;re up to date!</CardTitle>
        <CardDescription>
          If you want more to review, use the boost button to add five more
          words to the front of the queue.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <Button
          variant="outline"
          onClick={handleBoost}
          disabled={isLoading}
          className="gap-2 relative group"
        >
          {isLoading ? (
            <CircleNotch className="h-4 w-4 animate-spin" />
          ) : (
            <Rocket className="h-4 w-4 transition-transform group-hover:translate-y-[-2px]" />
          )}
          {isLoading ? "Boosting..." : "Boost words"}
        </Button>
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      </CardContent>
    </div>
  );
}
