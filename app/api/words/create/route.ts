// app/api/words/create/route.ts
import { NextResponse } from "next/server";
import { ClaudeService } from "@/app/services/claudeService";
import { WordService } from "@/app/services/wordService";
import { WordType } from "@/app/types/word";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient(
      { cookies: () => cookieStore },
      {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      }
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log("User ID:", session?.user?.id);
    console.log("User email:", session?.user?.email);
    console.log("Access token:", session?.access_token?.slice(0, 10) + "...");

    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (session.user.email !== "lamanoujaim@gmail.com") {
      return NextResponse.json(
        { error: "Unauthorized email" },
        { status: 403 }
      );
    }

    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Call Claude to get translation and details
    const prompt = `Translate this word to Lebanese arabic, unless it is already given in arabic: ${text}
    
   Make sure to provide the response as a JSON object with these fields:
    {
      "english": "the English word/phrase",
      "arabic": "the Arabic word/phrase in Arabic script",
      "transliteration": "Arabic pronunciation using English letters and numbers for Arabic sounds (e.g. 3 for ع)",
      "type": "one of: noun, verb, adjective, phrase"
    }
    
    Do not provide any additional text or explanations.
    `;

    console.log("Sending prompt to Claude:", prompt);
    const rawResponse = await ClaudeService.chatCompletion(prompt);
    console.log("Raw response from Claude:", rawResponse);

    let wordData;
    try {
      wordData = JSON.parse(rawResponse);
    } catch (error: unknown) {
      console.error("Error parsing Claude response:", error);
      return NextResponse.json(
        { error: "Failed to parse Claude response", message: "Invalid JSON" },
        { status: 500 }
      );
    }
    // Save to database
    const word = await WordService.createWord(supabase, {
      english: wordData.english,
      arabic: wordData.arabic,
      transliteration: wordData.transliteration,
      type: wordData.type as WordType,
    });

    return NextResponse.json(word);
  } catch (error: unknown) {
    console.error("Error creating word:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create word", message: errorMessage },
      { status: 500 }
    );
  }
}
