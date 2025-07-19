import { NextResponse } from 'next/server';
import { ClaudeService } from '@/app/services/claudeService';
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
    const data = await req.json();

    if (!validateRequest<SentenceRequest>(data, ['word'])) {
      return NextResponse.json(
        { error: 'Word is required' },
        { status: 400 }
      );
    }

    const { word, english, type, notes, existingData } = data;
    
    const sentence = await ClaudeService.generateSentence(word, english, type, notes, existingData);
    
    return NextResponse.json(sentence);
  } catch (error) {
    console.error('Error in generate-sentence API:', error);
    return handleApiError(error, 'Failed to generate sentence');
  }
}