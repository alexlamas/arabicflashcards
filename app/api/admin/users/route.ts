import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // First check if the requesting user is an admin
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleData?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create admin client with service role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const adminClient = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Fetch all users from auth.users
    const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers();

    if (authError) {
      console.error("Error fetching auth users:", authError);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    // Get word counts per user (custom words only)
    const { data: words } = await adminClient
      .from("words")
      .select("user_id")
      .not("user_id", "is", null);

    const { data: progress } = await adminClient
      .from("word_progress")
      .select("user_id, last_review_date")
      .order("last_review_date", { ascending: false });

    // Count words per user
    const wordCounts = new Map<string, number>();
    const lastReviewDates = new Map<string, string>();

    for (const word of words || []) {
      if (word.user_id) {
        wordCounts.set(word.user_id, (wordCounts.get(word.user_id) || 0) + 1);
      }
    }

    for (const p of progress || []) {
      if (p.last_review_date && !lastReviewDates.has(p.user_id)) {
        lastReviewDates.set(p.user_id, p.last_review_date);
      }
    }

    // Map auth users to admin user format
    const users = authUsers.users.map((authUser) => ({
      id: authUser.id,
      email: authUser.email || "No email",
      created_at: authUser.created_at,
      email_confirmed: !!authUser.email_confirmed_at,
      word_count: wordCounts.get(authUser.id) || 0,
      last_review_date: lastReviewDates.get(authUser.id) || null,
    }));

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error in /api/admin/users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
