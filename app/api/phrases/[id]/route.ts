import { NextRequest, NextResponse } from "next/server";
import { PhraseService } from "@/app/services/phraseService";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const phrase = await PhraseService.getPhraseById(params.id);
    if (!phrase) {
      return NextResponse.json(
        { error: "Phrase not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(phrase);
  } catch (error) {
    console.error("Error fetching phrase:", error);
    return NextResponse.json(
      { error: "Failed to fetch phrase" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const updatedPhrase = await PhraseService.updatePhrase(params.id, body);
    return NextResponse.json(updatedPhrase);
  } catch (error) {
    console.error("Error updating phrase:", error);
    return NextResponse.json(
      { error: "Failed to update phrase" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    await PhraseService.deletePhrase(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting phrase:", error);
    return NextResponse.json(
      { error: "Failed to delete phrase" },
      { status: 500 }
    );
  }
}