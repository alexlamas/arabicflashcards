"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Cards, Lightning, PlayIcon } from "@phosphor-icons/react";
import { useWords } from "@/app/contexts/WordsContext";

export default function PlayPage() {
  const { words } = useWords();
  const learningWords = words.filter((word) => word.status === "learning");

  const memoryPairs = Math.min(6, learningWords.length);
  const speedMatchQuestions = Math.min(10, learningWords.length);

  return (
    <div className="pt-8 px-6 md:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Memory Game Card */}
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Cards className="w-8 h-8 text-blue-600" weight="duotone" />
            </div>

            <h2 className="text-2xl font-bold mb-3 text-heading">Memory</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Match Arabic words with their English translations by flipping cards.
            </p>

            {learningWords.length >= 2 ? (
              <>
                <div className="inline-flex items-center gap-2 bg-white border rounded-full px-4 py-2 text-sm mb-6">
                  <span className="font-medium">{memoryPairs} pairs</span>
                  <span className="text-muted-foreground">from {learningWords.length} words</span>
                </div>

                <div>
                  <Button
                    size="lg"
                    asChild
                    className="bg-blue-600 hover:bg-blue-500 rounded-full gap-2 px-8"
                  >
                    <Link href="/play/memory">
                      <PlayIcon weight="fill" className="w-5 h-5" />
                      Start game
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Need at least 2 learning words to play.
              </p>
            )}
          </div>

          {/* Speed Match Game Card */}
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lightning className="w-8 h-8 text-emerald-600" weight="fill" />
            </div>

            <h2 className="text-2xl font-bold mb-3 text-heading">Speed Match</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Race against the clock to match words to their translations.
            </p>

            {learningWords.length >= 4 ? (
              <>
                <div className="inline-flex items-center gap-2 bg-white border rounded-full px-4 py-2 text-sm mb-6">
                  <span className="font-medium">{speedMatchQuestions} questions</span>
                  <span className="text-muted-foreground">from {learningWords.length} words</span>
                </div>

                <div>
                  <Button
                    size="lg"
                    asChild
                    className="bg-emerald-600 hover:bg-emerald-500 rounded-full gap-2 px-8"
                  >
                    <Link href="/play/speed-match">
                      <PlayIcon weight="fill" className="w-5 h-5" />
                      Start game
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Need at least 4 learning words to play.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
