import { createBrowserClient } from "@supabase/ssr";

export function cleanSupabaseUrl(url?: string): string {
  if (!url) return "";
  return url
    .trim()
    .replace(/\/rest\/v1\/?$/, "")
    .replace(/\/auth\/v1\/?$/, "")
    .replace(/\/+$/, "");
}

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseUrl = cleanSupabaseUrl(rawUrl);
export const supabaseAnonKey = rawKey?.trim() || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "https://your-project.supabase.co" &&
    supabaseAnonKey !== "your-supabase-anon-key"
);

export function createClient() {
  if (!isSupabaseConfigured) {
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
