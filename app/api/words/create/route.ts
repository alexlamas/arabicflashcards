// app/api/words/create/route.ts
import { NextResponse } from 'next/server';
import { ClaudeService } from '@/app/services/claudeService';
import { WordService } from '@/app/services/wordService';
import { WordType } from '@/app/types/word';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Call Claude to get translation and details
    const prompt =
   `Translate this word to Lebanese arabic, unless it is already given in arabic: ${text}
    
   Make sure to provide the response as a JSON object with these fields:
    {
      "english": "the English word/phrase",
      "arabic": "the Arabic word/phrase in Arabic script",
      "transliteration": "Arabic pronunciation using English letters and numbers for Arabic sounds (e.g. 3 for ع)",
      "type": "one of: noun, verb, adjective, phrase"
    }
    
    Do not provide any additional text or explanations.
    `;

    console.log('Sending prompt to Claude:', prompt);
    const rawResponse = await ClaudeService.chatCompletion(prompt);
    console.log('Raw response from Claude:', rawResponse);


  
    let wordData;
    try {
      wordData = JSON.parse(rawResponse);
      console.log('Parsed word data:', wordData);
    } catch (parseError) {
      console.error('JSON Parse error:', parseError);
      console.error('Failed to parse response:', rawResponse);
      return NextResponse.json({
        error: 'Invalid response format',
        rawResponse: rawResponse
      }, { status: 500 });
    }


    // Save to database
    const word = await WordService.createWord({
      english: wordData.english,
      arabic: wordData.arabic, 
      transliteration: wordData.transliteration,
      type: wordData.type as WordType
    });

    return NextResponse.json(word);
  } catch (error: unknown) {
    console.error('Error creating word:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create word', message: errorMessage },
      { status: 500 }
    );
  }
}