// app/api/generate-sentence/route.ts
import { NextResponse } from 'next/server';
import { ClaudeService } from '@/app/services/claudeService';

export async function POST(req: Request) {
  try {
    // Add request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

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
  } catch (error: any) {
    console.error('API Error:', error);

    // Handle specific error types
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timed out' },
        { status: 408 }
      );
    }

    if (error.message.includes('parse')) {
      return NextResponse.json(
        { error: 'Invalid response from AI service' },
        { status: 500 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { 
        error: 'Failed to generate sentence',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}