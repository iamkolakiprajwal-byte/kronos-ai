import { createClient, isSupabaseConfigured } from "./client";
import {
  UserProfile,
  Task,
  CalendarEvent,
  Goal,
  Habit,
  FocusSessionLog,
  OnboardingFormData,
} from "@/types";

/**
 * Service layer for Supabase persistence with multi-user isolation.
 * Automatically checks configuration and interacts with tables protected by RLS.
 */

export const dataService = {
  // Profiles
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured) return null;
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*, user_preferences(*)")
      .eq("id", userId)
      .single();

    if (error || !data) return null;

    const pref = data.user_preferences?.[0] || {};
    return {
      id: data.id,
      name: data.full_name || "Planner",
      email: data.email || "",
      avatar: data.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${data.id}&backgroundColor=e8decb`,
      role: data.role || "student",
      headline: data.headline || "Personal Time Workspace",
      institutionOrCompany: data.institution_or_company || "My Workspace",
      wakeTime: pref.wake_time || "07:30",
      sleepTime: pref.sleep_time || "23:30",
      mostProductivePeriod: pref.most_productive_period || "morning",
      preferredFocusDuration: pref.preferred_focus_duration || 45,
      preferredBreakDuration: pref.preferred_break_duration || 10,
      planningStyle: pref.planning_style || "time-blocked",
      sustainabilityOptIn: pref.sustainability_opt_in ?? true,
    };
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: updates.name,
        role: updates.role,
        headline: updates.headline,
        institution_or_company: updates.institutionOrCompany,
      })
      .eq("id", userId);

    return !error;
  },

  // Tasks
  async getTasks(userId: string, date?: string): Promise<Task[]> {
    if (!isSupabaseConfigured) return [];
    const supabase = createClient();
    if (!supabase) return [];

    let query = supabase.from("tasks").select("*").eq("user_id", userId);
    if (date) {
      query = query.eq("scheduled_date", date);
    }

    const { data, error } = await query.order("created_at", { ascending: true });
    if (error || !data) return [];

    return data.map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description || "",
      category: t.category,
      priority: t.priority,
      status: t.status,
      estimatedDuration: t.estimated_duration,
      startTime: t.start_time,
      endTime: t.end_time,
      scheduledDate: t.scheduled_date,
      deadline: t.deadline,
      isFixed: t.is_fixed,
      tag: t.tag,
      energyLevel: t.energy_level,
    }));
  },

  async createTask(userId: string, task: Omit<Task, "id">): Promise<Task | null> {
    if (!isSupabaseConfigured) return null;
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: userId,
        title: task.title,
        description: task.description || "",
        category: task.category,
        priority: task.priority,
        status: task.status || "todo",
        estimated_duration: task.estimatedDuration || 45,
        start_time: task.startTime,
        end_time: task.endTime,
        scheduled_date: task.scheduledDate,
        is_fixed: task.isFixed || false,
        tag: task.tag,
        energy_level: task.energyLevel || "high",
      })
      .select()
      .single();

    if (error || !data) return null;
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status: data.status,
      estimatedDuration: data.estimated_duration,
      startTime: data.start_time,
      endTime: data.end_time,
      scheduledDate: data.scheduled_date,
      isFixed: data.is_fixed,
      tag: data.tag,
      energyLevel: data.energy_level,
    };
  },

  async updateTask(userId: string, taskId: string, updates: Partial<Task>): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const supabase = createClient();
    if (!supabase) return false;

    const payload: any = {};
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.startTime !== undefined) payload.start_time = updates.startTime;
    if (updates.endTime !== undefined) payload.end_time = updates.endTime;
    if (updates.title !== undefined) payload.title = updates.title;

    const { error } = await supabase
      .from("tasks")
      .update(payload)
      .eq("id", taskId)
      .eq("user_id", userId);

    return !error;
  },

  async deleteTask(userId: string, taskId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)
      .eq("user_id", userId);

    return !error;
  },

  // Focus Sessions
  async getFocusSessions(userId: string): Promise<FocusSessionLog[]> {
    if (!isSupabaseConfigured) return [];
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("focus_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });

    if (error || !data) return [];

    return data.map((s: any) => ({
      id: s.id,
      habitId: s.habit_id,
      durationMinutes: s.duration_minutes,
      completedAt: s.completed_at,
      flowState: s.flow_state,
      absorptionRating: s.absorption_rating,
      concentrationRating: s.concentration_rating,
      perceivedControl: s.perceived_control,
      enjoymentRating: s.enjoyment_rating,
      timeDistortion: s.time_distortion,
      reflectionNotes: s.reflection_notes,
    }));
  },

  async logFocusSession(userId: string, session: Omit<FocusSessionLog, "id">): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase.from("focus_sessions").insert({
      user_id: userId,
      habit_id: session.habitId,
      duration_minutes: session.durationMinutes,
      flow_state: session.flowState,
      absorption_rating: session.absorptionRating,
      concentration_rating: session.concentrationRating,
      perceived_control: session.perceivedControl,
      enjoyment_rating: session.enjoymentRating,
      time_distortion: session.timeDistortion,
      reflection_notes: session.reflectionNotes,
      completed_at: session.completedAt || new Date().toISOString(),
    });

    return !error;
  },

  // Onboarding Record
  async saveOnboarding(userId: string, currentStep: number, stepData: Partial<OnboardingFormData>, completed: boolean): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from("onboarding_records")
      .upsert({
        user_id: userId,
        current_step: currentStep,
        step_data: stepData,
        is_completed: completed,
      }, { onConflict: "user_id" });

    if (completed) {
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", userId);
    }

    return !error;
  },
};
