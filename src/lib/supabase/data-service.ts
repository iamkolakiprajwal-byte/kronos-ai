import { createClient, isSupabaseConfigured } from "./client";
import {
  UserProfile,
  Task,
  CalendarEvent,
  Goal,
  Milestone,
  Habit,
  FocusSessionLog,
  NotificationItem,
  OnboardingFormData,
} from "@/types";

/**
 * Service layer for Supabase persistence with strict multi-user isolation.
 * Interacts directly with database tables protected by Row Level Security (RLS).
 */
export const dataService = {
  // ---------------------------------------------------------------------------
  // PROFILES & USER PREFERENCES
  // ---------------------------------------------------------------------------
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured) return null;
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*, user_preferences(*)")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) return null;

    const pref = data.user_preferences?.[0] || {};
    return {
      id: data.id,
      name: data.full_name || "Planner",
      email: data.email || "",
      avatar: data.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${data.id}&backgroundColor=e8decb`,
      role: data.role || "student",
      headline: data.headline || "",
      institutionOrCompany: data.institution_or_company || "",
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

    const profileUpdates: any = {};
    if (updates.name !== undefined) profileUpdates.full_name = updates.name;
    if (updates.role !== undefined) profileUpdates.role = updates.role;
    if (updates.headline !== undefined) profileUpdates.headline = updates.headline;
    if (updates.institutionOrCompany !== undefined) profileUpdates.institution_or_company = updates.institutionOrCompany;

    const { error: pErr } = await supabase
      .from("profiles")
      .update(profileUpdates)
      .eq("id", userId);

    if (pErr) return false;

    // Update preferences if routine params were provided
    if (
      updates.wakeTime ||
      updates.sleepTime ||
      updates.planningStyle ||
      updates.preferredFocusDuration !== undefined ||
      updates.sustainabilityOptIn !== undefined
    ) {
      const prefUpdates: any = {};
      if (updates.wakeTime) prefUpdates.wake_time = updates.wakeTime;
      if (updates.sleepTime) prefUpdates.sleep_time = updates.sleepTime;
      if (updates.planningStyle) prefUpdates.planning_style = updates.planningStyle;
      if (updates.preferredFocusDuration) prefUpdates.preferred_focus_duration = updates.preferredFocusDuration;
      if (updates.preferredBreakDuration) prefUpdates.preferred_break_duration = updates.preferredBreakDuration;
      if (updates.sustainabilityOptIn !== undefined) prefUpdates.sustainability_opt_in = updates.sustainabilityOptIn;

      await supabase
        .from("user_preferences")
        .upsert({ user_id: userId, ...prefUpdates }, { onConflict: "user_id" });
    }

    return true;
  },

  // ---------------------------------------------------------------------------
  // TASKS
  // ---------------------------------------------------------------------------
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
        sync_source: "local",
      })
      .select()
      .single();

    if (error || !data) return null;

    // If task is scheduled with time block, create corresponding calendar_events row
    if (data.start_time && data.end_time && data.scheduled_date) {
      await supabase.from("calendar_events").insert({
        user_id: userId,
        task_id: data.id,
        title: data.title,
        event_date: data.scheduled_date,
        start_time: data.start_time,
        end_time: data.end_time,
        category: data.category === "study" ? "academic" : data.category === "work" ? "meeting" : "deep_work",
        is_fixed: data.is_fixed || false,
        source: "local",
      });
    }

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
    if (updates.scheduledDate !== undefined) payload.scheduled_date = updates.scheduledDate;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.status === "completed") payload.completed_at = new Date().toISOString();

    const { error } = await supabase
      .from("tasks")
      .update(payload)
      .eq("id", taskId)
      .eq("user_id", userId);

    if (error) return false;

    // Keep linked calendar_events in sync
    if (updates.startTime || updates.endTime || updates.title || updates.scheduledDate) {
      const calPayload: any = {};
      if (updates.title) calPayload.title = updates.title;
      if (updates.startTime) calPayload.start_time = updates.startTime;
      if (updates.endTime) calPayload.end_time = updates.endTime;
      if (updates.scheduledDate) calPayload.event_date = updates.scheduledDate;

      await supabase
        .from("calendar_events")
        .update(calPayload)
        .eq("task_id", taskId)
        .eq("user_id", userId);
    }

    return true;
  },

  async deleteTask(userId: string, taskIdOrTitle: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const supabase = createClient();
    if (!supabase) return false;

    const trimmed = (taskIdOrTitle || "").trim();
    if (!trimmed) return false;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);

    try {
      if (isUuid) {
        await supabase
          .from("tasks")
          .delete()
          .eq("user_id", userId)
          .or(`id.eq.${trimmed},external_task_id.eq.${trimmed}`);
        await supabase
          .from("calendar_events")
          .delete()
          .eq("user_id", userId)
          .or(`id.eq.${trimmed},task_id.eq.${trimmed}`);
      } else {
        await supabase
          .from("tasks")
          .delete()
          .eq("user_id", userId)
          .or(`title.ilike.${trimmed},external_task_id.eq.${trimmed}`);
        await supabase
          .from("calendar_events")
          .delete()
          .eq("user_id", userId)
          .ilike("title", trimmed);
      }
      return true;
    } catch (err) {
      console.warn("[dataService.deleteTask] Notice:", err);
      return false;
    }
  },

  async batchUpdateTaskSchedule(
    userId: string,
    placements: { id: string; startTime: string; endTime: string }[]
  ): Promise<boolean> {
    if (!isSupabaseConfigured || placements.length === 0) return false;
    const supabase = createClient();
    if (!supabase) return false;

    try {
      await Promise.all(
        placements.map((p) =>
          supabase
            .from("tasks")
            .update({ start_time: p.startTime, end_time: p.endTime, updated_at: new Date().toISOString() })
            .eq("id", p.id)
            .eq("user_id", userId)
        )
      );
      return true;
    } catch {
      return false;
    }
  },

  // ---------------------------------------------------------------------------
  // CALENDAR EVENTS
  // ---------------------------------------------------------------------------
  async getCalendarEvents(userId: string, startDate?: string, endDate?: string): Promise<CalendarEvent[]> {
    if (!isSupabaseConfigured) return [];
    const supabase = createClient();
    if (!supabase) return [];

    let query = supabase.from("calendar_events").select("*").eq("user_id", userId);
    if (startDate) query = query.gte("event_date", startDate);
    if (endDate) query = query.lte("event_date", endDate);

    const { data, error } = await query.order("event_date", { ascending: true });
    if (error || !data) return [];

    return data.map((e: any) => ({
      id: e.id,
      title: e.title,
      date: e.event_date,
      startTime: e.start_time,
      endTime: e.end_time,
      category: e.category,
      isFixed: e.is_fixed,
      location: e.location,
      notes: e.source === "google" ? "Google Calendar Event" : undefined,
    }));
  },

  async createCalendarEvent(userId: string, event: Omit<CalendarEvent, "id">): Promise<CalendarEvent | null> {
    if (!isSupabaseConfigured) return null;
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("calendar_events")
      .insert({
        user_id: userId,
        title: event.title,
        event_date: event.date,
        start_time: event.startTime,
        end_time: event.endTime,
        category: event.category || "meeting",
        is_fixed: event.isFixed !== undefined ? event.isFixed : true,
        location: event.location,
        source: "local",
      })
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title,
      date: data.event_date,
      startTime: data.start_time,
      endTime: data.end_time,
      category: data.category,
      isFixed: data.is_fixed,
      location: data.location,
    };
  },

  async deleteCalendarEvent(userId: string, eventIdOrTitle: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const supabase = createClient();
    if (!supabase) return false;

    const trimmed = (eventIdOrTitle || "").trim();
    if (!trimmed) return false;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);

    try {
      if (isUuid) {
        await supabase
          .from("calendar_events")
          .delete()
          .eq("user_id", userId)
          .or(`id.eq.${trimmed},external_event_id.eq.${trimmed}`);
      } else {
        await supabase
          .from("calendar_events")
          .delete()
          .eq("user_id", userId)
          .or(`title.ilike.${trimmed},external_event_id.eq.${trimmed}`);
      }
      return true;
    } catch (err) {
      console.warn("[dataService.deleteCalendarEvent] Notice:", err);
      return false;
    }
  },

  // ---------------------------------------------------------------------------
  // GOALS & MILESTONES
  // ---------------------------------------------------------------------------
  async getGoals(userId: string): Promise<Goal[]> {
    if (!isSupabaseConfigured) return [];
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("goals")
      .select("*, goal_milestones(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error || !data) return [];

    return data.map((g: any) => ({
      id: g.id,
      title: g.title,
      description: g.description || "",
      targetDate: g.target_date,
      priority: g.priority,
      progress: g.progress,
      category: g.category,
      milestones: (g.goal_milestones || []).map((m: any) => ({
        id: m.id,
        title: m.title,
        dueDate: m.due_date,
        completed: m.completed,
      })),
    }));
  },

  async createGoal(userId: string, goal: Omit<Goal, "id" | "progress">): Promise<Goal | null> {
    if (!isSupabaseConfigured) return null;
    const supabase = createClient();
    if (!supabase) return null;

    const { data: createdGoal, error: gErr } = await supabase
      .from("goals")
      .insert({
        user_id: userId,
        title: goal.title,
        description: goal.description || "",
        target_date: goal.targetDate,
        priority: goal.priority || "medium",
        progress: 0,
        category: goal.category || "skills",
      })
      .select()
      .single();

    if (gErr || !createdGoal) return null;

    const createdMilestones: Milestone[] = [];
    if (goal.milestones && goal.milestones.length > 0) {
      for (const m of goal.milestones) {
        const { data: mData } = await supabase
          .from("goal_milestones")
          .insert({
            goal_id: createdGoal.id,
            title: m.title,
            due_date: m.dueDate,
            completed: m.completed || false,
          })
          .select()
          .single();

        if (mData) {
          createdMilestones.push({
            id: mData.id,
            title: mData.title,
            dueDate: mData.due_date,
            completed: mData.completed,
          });
        }
      }
    }

    return {
      id: createdGoal.id,
      title: createdGoal.title,
      description: createdGoal.description,
      targetDate: createdGoal.target_date,
      priority: createdGoal.priority,
      progress: createdGoal.progress,
      category: createdGoal.category,
      milestones: createdMilestones,
    };
  },

  async toggleMilestone(userId: string, goalId: string, milestoneId: string, completed: boolean): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from("goal_milestones")
      .update({ completed })
      .eq("id", milestoneId)
      .eq("goal_id", goalId);

    if (error) return false;

    // Recalculate goal progress
    const { data: milestones } = await supabase
      .from("goal_milestones")
      .select("completed")
      .eq("goal_id", goalId);

    if (milestones && milestones.length > 0) {
      const completedCount = milestones.filter((m) => m.completed).length;
      const progress = Math.round((completedCount / milestones.length) * 100);
      await supabase.from("goals").update({ progress }).eq("id", goalId).eq("user_id", userId);
    }

    return true;
  },

  async updateMilestone(userId: string, milestoneId: string, completed: boolean): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from("goal_milestones")
      .update({ completed })
      .eq("id", milestoneId);

    return !error;
  },

  // ---------------------------------------------------------------------------
  // HABITS & HABIT LOGS
  // ---------------------------------------------------------------------------
  async getHabits(userId: string): Promise<Habit[]> {
    if (!isSupabaseConfigured) return [];
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("habits")
      .select("*, habit_logs(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error || !data) return [];

    const todayStr = new Date().toISOString().split("T")[0];

    return data.map((h: any) => {
      const logs = h.habit_logs || [];
      const completedToday = logs.some((l: any) => l.log_date === todayStr && l.completed);
      return {
        id: h.id,
        title: h.title,
        frequency: h.frequency,
        cue: h.cue,
        targetDurationMinutes: h.target_duration_minutes,
        currentStreak: h.current_streak,
        bestStreak: h.best_streak,
        automaticityScore: h.automaticity_score,
        category: h.category,
        completedToday,
        totalCompletions: logs.filter((l: any) => l.completed).length,
      };
    });
  },

  async createHabit(
    userId: string,
    habit: Omit<Habit, "id" | "currentStreak" | "bestStreak" | "completedToday" | "automaticityScore">
  ): Promise<Habit | null> {
    if (!isSupabaseConfigured) return null;
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("habits")
      .insert({
        user_id: userId,
        title: habit.title,
        frequency: habit.frequency || "daily",
        cue: habit.cue || "Daily Routine",
        target_duration_minutes: habit.targetDurationMinutes || 20,
        category: habit.category || "focus",
        current_streak: 0,
        best_streak: 0,
        automaticity_score: 20,
      })
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title,
      frequency: data.frequency,
      cue: data.cue,
      targetDurationMinutes: data.target_duration_minutes,
      currentStreak: 0,
      bestStreak: 0,
      automaticityScore: 20,
      category: data.category,
      completedToday: false,
    };
  },

  async toggleHabitLog(userId: string, habitId: string, completed: boolean): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const supabase = createClient();
    if (!supabase) return false;

    const todayStr = new Date().toISOString().split("T")[0];

    const { error } = await supabase.from("habit_logs").upsert(
      {
        habit_id: habitId,
        user_id: userId,
        log_date: todayStr,
        completed,
      },
      { onConflict: "habit_id,log_date" }
    );

    if (error) return false;

    // Update streak on parent habit
    if (completed) {
      const { data: h } = await supabase.from("habits").select("current_streak, best_streak").eq("id", habitId).single();
      if (h) {
        const nextStreak = (h.current_streak || 0) + 1;
        const nextBest = Math.max(h.best_streak || 0, nextStreak);
        await supabase
          .from("habits")
          .update({ current_streak: nextStreak, best_streak: nextBest })
          .eq("id", habitId);
      }
    }

    return true;
  },

  // ---------------------------------------------------------------------------
  // FOCUS SESSIONS
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // CALENDAR CONNECTION & INTEGRATION STATUS
  // ---------------------------------------------------------------------------
  async getCalendarConnection(userId: string): Promise<any> {
    if (!isSupabaseConfigured) return null;
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("calendar_connections")
      .select("provider, sync_status, last_synced_at, external_calendar_id, google_email, google_tasks_sync_enabled, google_calendar_sync_enabled")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  },

  async disconnectCalendar(userId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from("calendar_connections")
      .update({
        sync_status: "disconnected",
        access_token: null,
        refresh_token: null,
        sync_token: null,
      })
      .eq("user_id", userId);

    return !error;
  },

  // ---------------------------------------------------------------------------
  // ONBOARDING RECORDS
  // ---------------------------------------------------------------------------
  async saveOnboarding(
    userId: string,
    currentStep: number,
    stepData: Partial<OnboardingFormData>,
    completed: boolean
  ): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase.from("onboarding_records").upsert(
      {
        user_id: userId,
        current_step: currentStep,
        step_data: stepData,
        is_completed: completed,
      },
      { onConflict: "user_id" }
    );

    if (completed) {
      await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", userId);
    }

    return !error;
  },

  async getOnboarding(userId: string): Promise<{ isCompleted: boolean; currentStep: number; stepData: any } | null> {
    if (!isSupabaseConfigured) return null;
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("onboarding_records")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return null;
    const record = data as any;
    return {
      isCompleted: Boolean(record.is_completed),
      currentStep: record.current_step || 1,
      stepData: record.step_data || {},
    };
  },

  // ---------------------------------------------------------------------------
  // COMPLETE USER WORKSPACE RESET (Targeted account reset preserving identity)
  // ---------------------------------------------------------------------------
  async resetUserWorkspace(userId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const supabase = createClient();
    if (!supabase) return false;

    try {
      await Promise.all([
        supabase.from("tasks").delete().eq("user_id", userId),
        supabase.from("calendar_events").delete().eq("user_id", userId),
        supabase.from("goals").delete().eq("user_id", userId),
        supabase.from("habits").delete().eq("user_id", userId),
        supabase.from("focus_sessions").delete().eq("user_id", userId),
        supabase.from("habit_transitions").delete().eq("user_id", userId),
        supabase.from("onboarding_records").delete().eq("user_id", userId),
        supabase.from("sync_audit_log").delete().eq("user_id", userId),
      ]);

      await supabase
        .from("profiles")
        .update({ onboarding_completed: false })
        .eq("id", userId);

      return true;
    } catch (e) {
      console.error("Failed to reset user workspace:", e);
      return false;
    }
  },
};
