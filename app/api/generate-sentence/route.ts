// app/api/generate-sentence/route.ts
import { NextResponse } from 'next/server';
import { ClaudeService } from '@/app/services/claudeService';

// Define a type for potential errors
type ApiError = Error & {
  name?: string;
  status?: number;
  message: string;
};

export async function POST(req: Request) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const { word } = await req.json();

      if (!word) {
        return NextResponse.json(
          { error: 'Word is required' },
          { status: 400 }
        );
      }

      const sentence = await ClaudeService.generateSentence(word);
      clearTimeout(timeoutId);
      
      return NextResponse.json(sentence);
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error: unknown) { // Type as unknown first
    // Type guard for our ApiError type
    const apiError = error as ApiError;
    console.error('API Error:', apiError);

    // Handle specific error types
    if (apiError.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timed out' },
        { status: 408 }
      );
    }

    if (apiError.message.includes('parse')) {
      return NextResponse.json(
        { error: 'Invalid response from AI service' },
        { status: 500 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { 
        error: 'Failed to generate sentence',
        details: process.env.NODE_ENV === 'development' ? apiError.message : undefined
      },
      { status: 500 }
    );
  }
}