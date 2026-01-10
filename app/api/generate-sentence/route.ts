import { NextResponse } from 'next/server';
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { ClaudeService } from '@/app/services/claudeService';
import { checkAIUsage, incrementUsage } from '@/app/services/aiUsageService';
import { handleApiError, validateRequest } from '../utils';

type SentenceRequest = {
  word: string;
  english?: string;
  type?: string;
  notes?: string;
  existingData?: {
    arabic?: string;
    transliteration?: string;
    english?: string;
  };
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient(cookies());

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
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

    if (!validateRequest<SentenceRequest>(data, ['word'])) {
      return NextResponse.json(
        { error: 'Word is required' },
        { status: 400 }
      );
    }

    const { word, english, type, notes, existingData } = data;

    const sentence = await ClaudeService.generateSentence(word, english, type, notes, existingData);

    // Increment usage after successful AI call
    await incrementUsage(user.id);

    return NextResponse.json(sentence);
  } catch (error) {
    return handleApiError(error, 'Failed to generate sentence');
  }
}
