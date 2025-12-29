import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = () => {
  // During build time, environment variables may not be available
  // Use placeholder values to prevent build errors (client won't actually be used during static generation)
  const url = supabaseUrl || "https://placeholder.supabase.co";
  const key = supabaseKey || "placeholder-key";

  return createBrowserClient(url, key);
};