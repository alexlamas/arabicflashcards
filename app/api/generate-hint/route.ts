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

    const prompt = `Create a memorable mnemonic hint to help an English speaker remember the Arabic word "${arabic}" which means "${english}".

    The hint should:
    1. Make a meaningful connection between the sound or meaning of the Arabic word and something familiar to English speakers
    2. Be concise (1-2 sentences)
    3. Focus on either the sound pattern or a visual/conceptual connection
    4. Be easy to remember
    5. Be appropriate for all ages

    Provide ONLY the hint text itself with no additional formatting or explanation.`;

    const hint = await ClaudeService.chatCompletion(prompt);

    // Increment usage after successful AI call
    await incrementUsage(user.id);

    return NextResponse.json({ hint });
  } catch (error) {
    return handleApiError(error, "Failed to generate hint");
  }
}
