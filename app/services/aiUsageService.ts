import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const FREE_MONTHLY_LIMIT = 20;

/**
 * Get the current period string (YYYY-MM format)
 */
function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Check if a user has an elevated role (admin or reviewer)
 */
async function hasUnlimitedAccess(userId: string): Promise<boolean> {
  const supabase = await createClient(cookies());

  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["admin", "reviewer"])
    .single();

  return !!data;
}

/**
 * Get current usage count for a user
 */
export async function getUsageCount(userId: string): Promise<number> {
  const supabase = await createClient(cookies());
  const period = getCurrentPeriod();

  const { data } = await supabase
    .from("ai_usage")
    .select("request_count")
    .eq("user_id", userId)
    .eq("period", period)
    .single();

  return data?.request_count ?? 0;
}

/**
 * Get usage info for a user (count and limit)
 */
export async function getUsageInfo(userId: string): Promise<{
  count: number;
  limit: number;
  unlimited: boolean;
}> {
  const unlimited = await hasUnlimitedAccess(userId);
  const count = await getUsageCount(userId);

  return {
    count,
    limit: FREE_MONTHLY_LIMIT,
    unlimited,
  };
}

/**
 * Check if a user can make an AI request
 * Returns { allowed: true } or { allowed: false, reason: string }
 */
export async function checkAIUsage(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  remaining?: number;
}> {
  // Check if user has unlimited access (admin/reviewer)
  const unlimited = await hasUnlimitedAccess(userId);
  if (unlimited) {
    return { allowed: true };
  }

  // Check current usage
  const count = await getUsageCount(userId);
  const remaining = FREE_MONTHLY_LIMIT - count;

  if (count >= FREE_MONTHLY_LIMIT) {
    return {
      allowed: false,
      reason: `Monthly AI limit reached (${FREE_MONTHLY_LIMIT} uses). Resets next month.`,
      remaining: 0,
    };
  }

  return { allowed: true, remaining };
}

/**
 * Increment usage count after a successful AI request
 */
export async function incrementUsage(userId: string): Promise<void> {
  const supabase = await createClient(cookies());
  const period = getCurrentPeriod();

  // Upsert: insert if not exists, increment if exists
  const { error } = await supabase.rpc("increment_ai_usage", {
    p_user_id: userId,
    p_period: period,
  });

  // If RPC doesn't exist, fall back to manual upsert
  if (error?.code === "42883") {
    // Function doesn't exist, do manual upsert
    const { data: existing } = await supabase
      .from("ai_usage")
      .select("id, request_count")
      .eq("user_id", userId)
      .eq("period", period)
      .single();

    if (existing) {
      await supabase
        .from("ai_usage")
        .update({
          request_count: existing.request_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("ai_usage")
        .insert({
          user_id: userId,
          period,
          request_count: 1,
        });
    }
  }
}
