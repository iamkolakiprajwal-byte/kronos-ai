import { createBrowserClient } from "@supabase/ssr";

export function cleanSupabaseUrl(url?: string): string {
  if (!url) return "";
  return url
    .trim()
    .replace(/\/rest\/v1\/?$/, "")
    .replace(/\/auth\/v1\/?$/, "")
    .replace(/\/+$/, "");
}

export function isSupabaseSecretKey(key?: string): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  if (trimmed.startsWith("sb_secret_")) return true;
  try {
    const parts = trimmed.split(".");
    if (parts.length === 3) {
      let b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      while (b64.length % 4 !== 0) b64 += "=";
      const decodedJson =
        typeof atob === "function"
          ? atob(b64)
          : Buffer.from(b64, "base64").toString("utf-8");
      const payload = JSON.parse(decodedJson);
      return payload.role === "service_role";
    }
  } catch {
    // If not parseable, ignore
  }
  return false;
}

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseUrl = cleanSupabaseUrl(rawUrl);
export const supabaseAnonKey = rawKey?.trim() || "";
export const isSecretKeyMisconfigured = isSupabaseSecretKey(supabaseAnonKey);

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
