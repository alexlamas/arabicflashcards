import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function getAdminClient(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized", status: 401 };
  }

  // Check if user is admin
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (roleData?.role !== "admin") {
    return { error: "Forbidden", status: 403 };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return { error: "Server configuration error", status: 500 };
  }

  const adminClient = createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return { adminClient, currentUserId: user.id };
}

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    const result = await getAdminClient(supabase);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { adminClient } = result;

    // Fetch all users from auth.users
    const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers();

    if (authError) {
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
      .select("user_id, updated_at, review_count")
      .order("updated_at", { ascending: false });

    // Count words per user and sum review counts
    const wordCounts = new Map<string, number>();
    const lastReviewDates = new Map<string, string>();
    const reviewCounts = new Map<string, number>();

    for (const word of words || []) {
      if (word.user_id) {
        wordCounts.set(word.user_id, (wordCounts.get(word.user_id) || 0) + 1);
      }
    }

    for (const p of progress || []) {
      if (p.updated_at && !lastReviewDates.has(p.user_id)) {
        lastReviewDates.set(p.user_id, p.updated_at);
      }
      // Sum up review counts
      if (p.review_count) {
        reviewCounts.set(p.user_id, (reviewCounts.get(p.user_id) || 0) + p.review_count);
      }
    }

    // Get AI usage per user
    const { data: aiUsage } = await adminClient
      .from("ai_usage")
      .select("user_id, request_count");

    const aiUsageCounts = new Map<string, number>();
    for (const usage of aiUsage || []) {
      if (usage.user_id) {
        aiUsageCounts.set(usage.user_id, (aiUsageCounts.get(usage.user_id) || 0) + (usage.request_count || 0));
      }
    }

    // Map auth users to admin user format
    const users = authUsers.users.map((authUser) => ({
      id: authUser.id,
      email: authUser.email || "No email",
      created_at: authUser.created_at,
      email_confirmed: !!authUser.email_confirmed_at,
      word_count: wordCounts.get(authUser.id) || 0,
      review_count: reviewCounts.get(authUser.id) || 0,
      ai_credits_used: aiUsageCounts.get(authUser.id) || 0,
      last_review_date: lastReviewDates.get(authUser.id) || null,
      last_sign_in_at: authUser.last_sign_in_at || null,
    }));

    return NextResponse.json(users);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    const result = await getAdminClient(supabase);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { adminClient } = result;

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Create the user
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the email
    });

    if (createError) {
      return NextResponse.json(
        { error: createError.message || "Failed to create user" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.user.id,
        email: newUser.user.email
      }
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    const result = await getAdminClient(supabase);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { adminClient } = result;

    const { userId, action } = await req.json();

    if (!userId || !action) {
      return NextResponse.json({ error: "User ID and action required" }, { status: 400 });
    }

    if (action === "reset_onboarding") {
      const { error } = await adminClient
        .from("user_profiles")
        .update({ onboarding_completed: false })
        .eq("id", userId);

      if (error) {
        return NextResponse.json(
          { error: "Failed to reset onboarding" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    const result = await getAdminClient(supabase);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { adminClient, currentUserId } = result;

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Prevent self-deletion
    if (userId === currentUserId) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
    }

    // Delete user's data first
    // 1. Delete word progress
    await adminClient
      .from("word_progress")
      .delete()
      .eq("user_id", userId);

    // 2. Delete user's custom words
    await adminClient
      .from("words")
      .delete()
      .eq("user_id", userId);

    // 3. Delete user profile
    await adminClient
      .from("user_profiles")
      .delete()
      .eq("id", userId);

    // 4. Delete user roles
    await adminClient
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    // 5. Delete AI usage
    await adminClient
      .from("ai_usage")
      .delete()
      .eq("user_id", userId);

    // 6. Finally delete the auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      return NextResponse.json(
        { error: "Failed to delete user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
