import { NextResponse } from "next/server";
import { ClaudeService } from "@/app/services/claudeService";
import { handleApiError, validateRequest } from "../utils";

type HintRequest = {
  english: string;
  arabic: string;
};

export async function POST(req: Request) {
  try {
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
    return NextResponse.json({ hint });
  } catch (error) {
    return handleApiError(error, "Failed to generate hint");
  }
}