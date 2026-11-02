import { isSupabaseConfigured, createClient } from "../supabase/client";

export interface UserMemoryItem {
  key: string;
  value: any;
  confidence: number;
  updatedAt: string;
}

// In-memory fallback for offline assignment demo mode
const inMemoryStore: Record<string, UserMemoryItem> = {
  preferred_study_duration: {
    key: "preferred_study_duration",
    value: 50,
    confidence: 0.95,
    updatedAt: new Date().toISOString(),
  },
  preferred_break_duration: {
    key: "preferred_break_duration",
    value: 10,
    confidence: 0.9,
    updatedAt: new Date().toISOString(),
  },
  most_productive_time: {
    key: "most_productive_time",
    value: "morning",
    confidence: 0.85,
    updatedAt: new Date().toISOString(),
  },
};

export async function getUserMemory(userId?: string): Promise<UserMemoryItem[]> {
  if (isSupabaseConfigured && userId) {
    const supabase = createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("user_memory")
        .select("memory_key, memory_value, confidence_score, updated_at")
        .eq("user_id", userId);

      if (!error && data) {
        return data.map((d: any) => ({
          key: d.memory_key,
          value: d.memory_value,
          confidence: Number(d.confidence_score),
          updatedAt: d.updated_at,
        }));
      }
    }
  }

  return Object.values(inMemoryStore);
}

export async function saveUserMemory(
  key: string,
  value: any,
  confidence: number = 1.0,
  userId?: string
): Promise<void> {
  inMemoryStore[key] = {
    key,
    value,
    confidence,
    updatedAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured && userId) {
    const supabase = createClient();
    if (supabase) {
      await supabase.from("user_memory").upsert(
        {
          user_id: userId,
          memory_key: key,
          memory_value: value,
          confidence_score: confidence,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id, memory_key" }
      );
    }
  }
}
