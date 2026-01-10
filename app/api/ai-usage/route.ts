import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { getUsageInfo } from "@/app/services/aiUsageService";

export async function GET() {
  try {
    const supabase = await createClient(cookies());

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const usageInfo = await getUsageInfo(user.id);

    return NextResponse.json(usageInfo);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to get usage info", message },
      { status: 500 }
    );
  }
}
