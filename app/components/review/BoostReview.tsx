import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CircleNotch, Rocket } from "@phosphor-icons/react";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "../../supabase";

interface BoostReviewProps {
  userId: string;
  onBoostComplete: (wordIds: string[]) => void;
}

export default function BoostReview({
  userId,
  onBoostComplete,
}: BoostReviewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBoost = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: words } = await supabase
        .from("word_progress")
        .select("id, word_english")
        .eq("user_id", userId)
        .eq("status", "learning")
        .gt("next_review_date", new Date().toISOString())
        .limit(5);

      if (!words || words.length === 0) {
        setError(
          "No words available to boost. Try adding more words to your learning list."
        );
        return;
      }

      const wordIds = words.map((w) => w.id);

      // Update UI optimistically first
      onBoostComplete(wordIds);

      // Then perform the actual update
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
