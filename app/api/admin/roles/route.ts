import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Helper to verify admin status and get admin client
async function getAdminClientIfAuthorized() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized", status: 401 };
  }

  // Check if user is admin
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .single();

  if (!roleData) {
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

// GET all user roles
export async function GET() {
  try {
    const result = await getAdminClientIfAuthorized();

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { adminClient } = result;

    const { data, error } = await adminClient
      .from("user_roles")
      .select("user_id, role");

    if (error) {
      return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
    }

    // Group roles by user_id
    const rolesByUser: Record<string, string[]> = {};
    (data || []).forEach((row: { user_id: string; role: string }) => {
      if (!rolesByUser[row.user_id]) {
        rolesByUser[row.user_id] = [];
      }
      rolesByUser[row.user_id].push(row.role);
    });

    return NextResponse.json(rolesByUser);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT to update a user's role
export async function PUT(request: NextRequest) {
  try {
    const result = await getAdminClientIfAuthorized();

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { adminClient, currentUserId } = result;
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: "Missing userId or role" }, { status: 400 });
    }

    if (!["standard", "reviewer", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Prevent changing own role
    if (userId === currentUserId) {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
    }

    // Remove existing roles for this user
    const { error: deleteError } = await adminClient
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
    }

    // Add new role (unless standard, which means no role entry)
    if (role !== "standard") {
      const { error: insertError } = await adminClient
        .from("user_roles")
        .insert([{ user_id: userId, role }]);

      if (insertError) {
        return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
