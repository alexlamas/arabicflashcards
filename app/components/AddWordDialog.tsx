// app/components/AddWordDialog.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Spinner } from "@phosphor-icons/react";
import { Word } from "../types/word";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../supabase";

interface AddWordDialogProps {
  onWordAdded: (word: Word) => void;
}

export function AddWordDialog({ onWordAdded }: AddWordDialogProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      setError("Not authenticated");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // First get the translation from Claude
      const response = await fetch("/api/words/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to translate word");
      }

      const wordData = await response.json();

      // Then insert directly into Supabase
      const { data, error: supabaseError } = await supabase
        .from("words")
        .insert({
          english: wordData.english,
          arabic: wordData.arabic,
          transliteration: wordData.transliteration,
          type: wordData.type,
        })
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      onWordAdded(data);
      setOpen(false);
      setText("");
    } catch (err) {
      setError("Error: " + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"} size="sm" className="gap-2">
          <Plus />
          Add Word
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Word</DialogTitle>
          <DialogDescription>
            Add a new word to your vocabulary list.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Enter word in English or Arabic..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" disabled={loading || !text.trim()}>
            {loading ? (
              <>
                <Spinner className="mr-2 h-4 w-4 animate-spin" />
                Translating...
              </>
            ) : (
              "Add Word"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
