import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  const { data, error } = await supabase
    .from("words")
    .select(
      `
      *,
      progress:word_progress(
        status,
        next_review_date
      )
    `
    )
    .eq("id", params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const word = {
    ...data,
    status: data.progress?.[0]?.status || null,
    next_review_date: data.progress?.[0]?.next_review_date || null,
  };

  return NextResponse.json(word);
}