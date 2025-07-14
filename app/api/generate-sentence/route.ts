import { NextResponse } from 'next/server';
import { ClaudeService } from '@/app/services/claudeService';
import { handleApiError, validateRequest } from '../utils';

type SentenceRequest = {
  word: string;
};

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!validateRequest<SentenceRequest>(data, ['word'])) {
      return NextResponse.json(
        { error: 'Word is required' },
        { status: 400 }
      );
    }

    const { word } = data;
    const sentence = await ClaudeService.generateSentence(word);
    return NextResponse.json(sentence);
  } catch (error) {
    return handleApiError(error, 'Failed to generate sentence');
  }
}