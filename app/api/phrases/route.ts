import { NextRequest, NextResponse } from "next/server";
import { PhraseService } from "@/app/services/phraseService";

export async function GET() {
  try {
    const phrases = await PhraseService.getAllPhrases();
    return NextResponse.json(phrases);
  } catch (error) {
    console.error("Error fetching phrases:", error);
    return NextResponse.json(
      { error: "Failed to fetch phrases" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phrase, wordIds } = body;
    
    const newPhrase = await PhraseService.createPhrase(phrase, wordIds);
    return NextResponse.json(newPhrase);
  } catch (error) {
    console.error("Error creating phrase:", error);
    return NextResponse.json(
      { error: "Failed to create phrase" },
      { status: 500 }
    );
  }
}