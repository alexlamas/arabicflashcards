import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ClaudeService } from "@/app/services/claudeService";
import { WordType } from "@/app/types/word";

export async function POST(req: Request) {
  try {
    const supabase = await createRouteHandlerClient({ cookies });
    const { text, confirmed, word } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // If this is a confirmed word save with edited details
    if (confirmed && word) {
      // Get the current user to create the word with learning status
      const { data: { user } } = await supabase.auth.getUser();
      
      // First insert the word
      const wordToInsert: Record<string, string> = {
        english: word.english,
        arabic: word.arabic,
        transliteration: word.transliteration,
        type: word.type as WordType,
      };
      
      const { data: wordData, error: wordError } = await supabase
        .from("words")
        .insert([wordToInsert])
        .select()
        .single();
      
      if (wordError) {
        console.error("Word insert error:", wordError);
        throw wordError;
      }

      // Then create word_progress entry to mark it as learning by default
      if (user) {
        const { error: progressError } = await supabase
          .from("word_progress")
          .insert([
            {
              user_id: user.id,
              word_english: word.english,
              status: "archived",
              interval: 0,
              ease_factor: 2.5,
              review_count: 0,
              next_review_date: new Date().toISOString(),
            },
          ]);
        
        if (progressError) {
          console.error("Progress insert error:", progressError);
        }
      }

      // Fetch the complete data with progress
      const { data, error } = await supabase
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
        .eq('id', wordData.id)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error: "Failed to save word to database" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ...data,
        status: data.progress?.[0]?.status || null,
        next_review_date: data.progress?.[0]?.next_review_date || null,
      });
    }

    // Otherwise generate a new translation
    const prompt = `Translate this word to Lebanese arabic, unless it is already given in arabic: ${text}
    
    Make sure to provide the response as a JSON object with these fields:
    {
      "english": "the English word/phrase",
      "arabic": "the Arabic word/phrase in Arabic script",
      "transliteration": "Arabic pronunciation using English letters and numbers for Arabic sounds (e.g. 3 for ع)",
      "type": "one of: noun, verb, adjective, phrase"
    }
    
    Do not provide any additional text or explanations.`;

    const rawResponse = await ClaudeService.chatCompletion(prompt);

    try {
      const wordData = JSON.parse(rawResponse);
      const response: Record<string, string> = {
        english: wordData.english,
        arabic: wordData.arabic,
        transliteration: wordData.transliteration,
        type: wordData.type as WordType,
      };
      
      return NextResponse.json(response);
    } catch (parseError) {
      console.error("JSON Parse error:", parseError);
      console.error("Failed to parse response:", rawResponse);
      return NextResponse.json(
        {
          error: "Invalid response format from translation service",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in /api/words/create:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to process request", message: errorMessage },
      { status: 500 }
    );
  }
}
