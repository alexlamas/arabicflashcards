import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { ClaudeService } from "@/app/services/claudeService";
import { checkAIUsage, incrementUsage } from "@/app/services/aiUsageService";
import { handleApiError, validateRequest } from "../utils";

type HintRequest = {
  english: string;
  arabic: string;
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient(cookies());

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check AI usage limits
    const usageCheck = await checkAIUsage(user.id);
    if (!usageCheck.allowed) {
      return NextResponse.json(
        { error: usageCheck.reason, limitReached: true },
        { status: 429 }
      );
    }

    const data = await req.json();

    if (!validateRequest<HintRequest>(data, ["english", "arabic"])) {
      return NextResponse.json(
        { error: "Both English and Arabic words are required" },
        { status: 400 }
      );
    }

    const { english, arabic } = data;

    const prompt = `Give a short hint to help someone recall the Lebanese Arabic word "${arabic}" (which means "${english}").

The hint must NOT give away the answer. Choose the most helpful approach:
- First letter + syllable count (always include both)
- If there's a related Arabic root or word family, mention it
- If there's a sound pattern that's memorable (rhymes with something, sounds like an English word), mention it

Keep it to 1-2 short sentences. Do NOT include the English translation or reveal the meaning.

Examples of good hints:
- "Starts with م (meem), 2 syllables"
- "Begins with ش (shin), 3 syllables — shares a root with 'shams' (sun)"
- "Starts with ك (kaf), 2 syllables — sounds a bit like 'cable'"

Provide ONLY the hint text.`;

    const hint = await ClaudeService.chatCompletion(prompt);

    // Increment usage after successful AI call
    await incrementUsage(user.id);

    return NextResponse.json({ hint });
  } catch (error) {
    return handleApiError(error, "Failed to generate hint");
  }
}
