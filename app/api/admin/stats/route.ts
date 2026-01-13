import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or reviewer
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleData?.role !== "admin" && roleData?.role !== "reviewer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const adminClient = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Calculate week boundaries
    const now = new Date();
    const startOfThisWeek = new Date(now);
    const dayOfWeek = now.getUTCDay();
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfThisWeek.setUTCDate(now.getUTCDate() - daysSinceMonday);
    startOfThisWeek.setUTCHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setUTCDate(startOfLastWeek.getUTCDate() - 7);

    const endOfLastWeek = new Date(startOfThisWeek);

    // Get all users
    const { data: authUsers } = await adminClient.auth.admin.listUsers();
    const totalUsers = authUsers?.users?.length || 0;

    // Count signups this week
    const signupsThisWeek = authUsers?.users?.filter(u =>
      new Date(u.created_at) >= startOfThisWeek
    ).length || 0;

    // Count signups last week
    const signupsLastWeek = authUsers?.users?.filter(u => {
      const created = new Date(u.created_at);
      return created >= startOfLastWeek && created < endOfLastWeek;
    }).length || 0;

    // Get WAU - users who reviewed this week
    const { data: wauData } = await adminClient
      .from("word_progress")
      .select("user_id")
      .gte("updated_at", startOfThisWeek.toISOString());

    const wauUsers = new Set(wauData?.map(w => w.user_id) || []);
    const wau = wauUsers.size;

    // Get WAU last week for comparison
    const { data: wauLastWeekData } = await adminClient
      .from("word_progress")
      .select("user_id")
      .gte("updated_at", startOfLastWeek.toISOString())
      .lt("updated_at", endOfLastWeek.toISOString());

    const wauLastWeekUsers = new Set(wauLastWeekData?.map(w => w.user_id) || []);
    const wauChange = wauLastWeekUsers.size;

    // Get reviews this week (sum of review_count increases would be complex, so count updated rows)
    const { count: reviewsThisWeek } = await adminClient
      .from("word_progress")
      .select("*", { count: "exact", head: true })
      .gte("updated_at", startOfThisWeek.toISOString());

    // Get reviews last week
    const { count: reviewsLastWeek } = await adminClient
      .from("word_progress")
      .select("*", { count: "exact", head: true })
      .gte("updated_at", startOfLastWeek.toISOString())
      .lt("updated_at", endOfLastWeek.toISOString());

    // Get total reviews (using RPC function)
    const { data: totalReviewsData } = await adminClient.rpc('get_user_review_stats');
    const totalReviews = totalReviewsData?.reduce((sum: number, r: { total_reviews: number }) => sum + (r.total_reviews || 0), 0) || 0;

    // Get custom words added this week
    const { count: customWordsThisWeek } = await adminClient
      .from("words")
      .select("*", { count: "exact", head: true })
      .not("user_id", "is", null)
      .gte("created_at", startOfThisWeek.toISOString());

    // Get custom words added last week
    const { count: customWordsLastWeek } = await adminClient
      .from("words")
      .select("*", { count: "exact", head: true })
      .not("user_id", "is", null)
      .gte("created_at", startOfLastWeek.toISOString())
      .lt("created_at", endOfLastWeek.toISOString());

    // Get total custom words
    const { count: totalCustomWords } = await adminClient
      .from("words")
      .select("*", { count: "exact", head: true })
      .not("user_id", "is", null);

    return NextResponse.json({
      wau,
      wauChange,
      signupsThisWeek,
      signupsLastWeek,
      reviewsThisWeek: reviewsThisWeek || 0,
      reviewsLastWeek: reviewsLastWeek || 0,
      customWordsThisWeek: customWordsThisWeek || 0,
      customWordsLastWeek: customWordsLastWeek || 0,
      totalUsers,
      totalReviews,
      totalCustomWords: totalCustomWords || 0,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
