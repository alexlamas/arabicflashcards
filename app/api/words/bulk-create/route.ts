import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ClaudeService } from "@/app/services/claudeService";
import { WordType } from "@/app/types/word";

interface WordInput {
  english: string;
  arabic: string;
  transliteration: string;
  type: string;
}

interface DatabaseWord {
  id: string;
  english: string;
  arabic: string;
  transliteration: string;
  type: WordType;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface WordProgress {
  status: string;
  next_review_date: string;
}

interface CompleteWord extends DatabaseWord {
  progress?: WordProgress[];
}

export async function POST(req: Request) {
  try {
    const { words, confirmed } = await req.json();

    if (!words || !Array.isArray(words) || words.length === 0) {
      return NextResponse.json(
        { error: "Words array is required" },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    // If this is confirmed, save all words to database
    if (confirmed) {
      // Check authentication for saving
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          return NextResponse.json(
            { error: "Authentication required to save words" },
            { status: 401 }
          );
        }
      }

      const user = session?.user || (await supabase.auth.getUser()).data.user;

      if (!user) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      // Insert all words
      const wordsToInsert = words.map((word: WordInput) => ({
        english: word.english,
        arabic: word.arabic,
        transliteration: word.transliteration,
        type: word.type as WordType,
        user_id: user.id,
      }));

      const { data: wordData, error: wordError } = await supabase
        .from("words")
        .insert(wordsToInsert)
        .select();

      if (wordError) {
        return NextResponse.json(
          {
            error: "Failed to save words",
            details: wordError.message,
            hint: wordError.hint,
          },
          { status: 500 }
        );
      }

      // Create word_progress entries for all words
      const progressEntries = words.map((word: WordInput) => ({
        user_id: user.id,
        word_english: word.english,
        status: "archived",
        interval: 0,
        ease_factor: 2.5,
        review_count: 0,
        next_review_date: new Date().toISOString(),
      }));

      const { error: progressError } = await supabase
        .from("word_progress")
        .insert(progressEntries);

      if (progressError) {
        console.error("Progress insert error:", progressError);
      }

      // Fetch complete data with progress for all words
      const wordIds = wordData.map((w: DatabaseWord) => w.id);
      const { data: completeData, error: fetchError } = await supabase
        .from("words")
        .select(
          `
          *,
          progress:word_progress(
            status,
            next_review_date
          )
        `
        )
        .in("id", wordIds);

      if (fetchError) {
        console.error("Fetch error:", fetchError);
        return NextResponse.json(
          { error: "Failed to fetch saved words" },
          { status: 500 }
        );
      }

      const result = completeData.map((word: CompleteWord) => ({
        ...word,
        status: word.progress?.[0]?.status || null,
        next_review_date: word.progress?.[0]?.next_review_date || null,
      }));

      return NextResponse.json(result);
    }

    // Otherwise, generate translations for all words
    const wordsList = words.join(", ");

    console.log("Translating words:", wordsList);
    console.log("Number of words:", words.length);

    const prompt = `Translate these words to Lebanese Arabic. Words: ${wordsList}

    For each word, provide a JSON object with these fields:
    {
      "english": "the English word/phrase",
      "arabic": "the Arabic word/phrase in Arabic script",
      "transliteration": "Arabic pronunciation using English letters and numbers for Arabic sounds (e.g. 3 for ع)",
      "type": "one of: noun, verb, adjective, phrase"
    }

    Return a JSON array containing one object for each word in the same order they were provided.

    Example format:
    [
      {
        "english": "house",
        "arabic": "بيت",
        "transliteration": "bayt",
        "type": "noun"
      },
      {
        "english": "go",
        "arabic": "روح",
        "transliteration": "roo7",
        "type": "verb"
      }
    ]

    Do not provide any additional text or explanations. Only return the JSON array.`;

    let rawResponse;
    try {
      rawResponse = await ClaudeService.chatCompletion(prompt);
      console.log("Claude response received, length:", rawResponse.length);
    } catch (claudeError) {
      console.error("Claude API error:", claudeError);
      return NextResponse.json(
        {
          error: "Translation service error",
          details: claudeError instanceof Error ? claudeError.message : "Unknown error",
        },
        { status: 500 }
      );
    }

    try {
      // Try to extract JSON from response (in case there's extra text)
      const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : rawResponse;

      console.log("Extracted JSON:", jsonString.substring(0, 200) + "...");

      const translatedWords = JSON.parse(jsonString);

      if (!Array.isArray(translatedWords)) {
        console.error("Response is not an array:", translatedWords);
        throw new Error("Response is not an array");
      }

      console.log("Parsed array with", translatedWords.length, "words");

      // Validate each word has required fields
      const validatedWords = translatedWords.map((word: WordInput) => ({
        english: word.english || "",
        arabic: word.arabic || "",
        transliteration: word.transliteration || "",
        type: word.type || "noun",
      }));

      return NextResponse.json(validatedWords);
    } catch (parseError) {
      console.error("JSON Parse error:", parseError);
      console.error("Failed to parse response:", rawResponse.substring(0, 500));
      return NextResponse.json(
        {
          error: "Invalid response format from translation service",
          details: parseError instanceof Error ? parseError.message : "Failed to parse JSON",
          rawResponse: rawResponse.substring(0, 200),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in /api/words/bulk-create:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to process request", message: errorMessage },
      { status: 500 }
    );
  }
}
