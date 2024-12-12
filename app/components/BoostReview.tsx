import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CircleNotch, Rocket } from "@phosphor-icons/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "../supabase";

interface BoostReviewProps {
  userId: string;
  onBoostComplete: () => void;
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
      // Get 5 words that are in "learning" status but not yet due
      const { data: words } = await supabase
        .from("word_progress")
        .select("word_english")
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

      // Update the next_review_date to now for these words
      const now = new Date().toISOString();
      await Promise.all(
        words.map(({ word_english }) =>
          supabase
            .from("word_progress")
            .update({ next_review_date: now })
            .eq("user_id", userId)
            .eq("word_english", word_english)
        )
      );

      onBoostComplete();
    } catch (err) {
      console.error("Error boosting reviews:", err);
      setError("Failed to boost reviews. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle>All caught up!</CardTitle>
        <CardDescription>
          Want to review more words? Use the boost button to make some words
          available for review right now.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <Button onClick={handleBoost} disabled={isLoading} className="gap-2">
          {isLoading ? (
            <CircleNotch className="h-4 w-4 animate-spin" />
          ) : (
            <Rocket className="h-4 w-4" />
          )}
          Boost Reviews
        </Button>
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      </CardContent>
    </Card>
  );
}
