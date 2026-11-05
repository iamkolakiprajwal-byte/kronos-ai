import {
  UserProfile,
  Task,
  CalendarEvent,
  Goal,
  Habit,
  HabitResetTransition,
  NotificationItem,
  ChatMessage,
  UserRole,
  FocusSessionLog,
  EcoLogEntry,
} from "@/types";
import {
  studentProfile,
  professionalProfile,
  dualProfile,
  initialStudentTasks,
  initialProfessionalTasks,
  initialDualTasks,
  studentCalendarEvents,
  professionalCalendarEvents,
  dualCalendarEvents,
  studentGoals,
  professionalGoals,
  dualGoals,
  studentHabits,
  professionalHabits,
  dualHabits,
  studentHabitTransitions,
  professionalHabitTransitions,
  dualHabitTransitions,
  sampleNotifications,
  DEMO_REFERENCE_DATE,
} from "@/lib/mock/demo-data";
import { sampleEcoEntries } from "@/lib/sustainability/eco-calculator";

export const KRONOS_STORAGE_KEY = "kronos_ai_local_state_v1";
export const KRONOS_BACKUP_KEY = "kronos_ai_local_state_backup";
export const KRONOS_CORRUPT_BACKUP_KEY = "kronos_ai_corrupt_data_backup";
export const KRONOS_STORAGE_VERSION = 1;

export interface PersistedKronosState {
  version: number;
  role: UserRole;
  profile: UserProfile;
  tasks: Task[];
  calendarEvents: CalendarEvent[];
  goals: Goal[];
  habits: Habit[];
  habitTransitions: HabitResetTransition[];
  focusSessions: FocusSessionLog[];
  chatMessages: ChatMessage[];
  notifications: NotificationItem[];
  ecoEntries: EcoLogEntry[];
  selectedDateStr: string;
  lastSavedTimestamp: number;
}

/**
 * Safely migrates raw stored state forward into the current schema version without data loss.
 * Preserves existing user tasks, habits, reflections, and goals while populating any newly required fields.
 */
export function migrateState(raw: any): PersistedKronosState {
  const role: UserRole = raw.role === "professional" || raw.role === "both" ? raw.role : "student";
  const baseline = getInitialDemoState(role);

  // Migrate habits, ensuring separated metrics (completion rate, cue consistency, self-reported automaticity)
  const migratedHabits: Habit[] = Array.isArray(raw.habits)
    ? raw.habits.map((h: any, idx: number) => {
        const history = Array.isArray(h.recentHistory)
          ? h.recentHistory
          : [false, false, false, false, false, false, false];
        const completedDays = history.filter(Boolean).length;
        const weeklyRate = Math.round((completedDays / 7) * 100);
        return {
          id: h.id || `habit-${Date.now()}-${idx}`,
          title: h.title || "Daily Routine",
          frequency: h.frequency || "daily",
          cue: h.cue || "Anchored to daily routine",
          context: h.context,
          minimumVersion: h.minimumVersion || "Start with 2 minutes",
          targetGoal: h.targetGoal,
          targetDurationMinutes: typeof h.targetDurationMinutes === "number" ? h.targetDurationMinutes : 15,
          currentStreak: typeof h.currentStreak === "number" ? h.currentStreak : 0,
          bestStreak: typeof h.bestStreak === "number" ? h.bestStreak : 0,
          completedToday: Boolean(h.completedToday),
          totalCompletions: typeof h.totalCompletions === "number" ? h.totalCompletions : 0,
          recentHistory: history,
          weeklyCompletionRate: typeof h.weeklyCompletionRate === "number" ? h.weeklyCompletionRate : weeklyRate,
          cueConsistencyScore: typeof h.cueConsistencyScore === "number" ? h.cueConsistencyScore : 85,
          selfReportedAutomaticity:
            typeof h.selfReportedAutomaticity === "number"
              ? Math.max(1, Math.min(5, h.selfReportedAutomaticity))
              : 3,
          automaticityScore: typeof h.automaticityScore === "number" ? h.automaticityScore : weeklyRate,
          category: h.category || "learning",
        };
      })
    : baseline.habits;

  // Migrate tasks safely
  const migratedTasks: Task[] = Array.isArray(raw.tasks)
    ? raw.tasks.map((t: any, idx: number) => ({
        id: t.id || `task-${Date.now()}-${idx}`,
        title: t.title || "Scheduled Activity",
        description: t.description || "",
        category: t.category || "study",
        priority: t.priority || "medium",
        status: t.status === "completed" ? "completed" : "todo",
        estimatedDuration: typeof t.estimatedDuration === "number" ? t.estimatedDuration : 45,
        startTime: t.startTime,
        endTime: t.endTime,
        scheduledDate: t.scheduledDate || raw.selectedDateStr || DEMO_REFERENCE_DATE,
        isFixed: Boolean(t.isFixed),
        tag: t.tag,
        energyLevel: t.energyLevel || "high",
      }))
    : baseline.tasks;

  return {
    version: KRONOS_STORAGE_VERSION,
    role,
    profile:
      raw.profile && typeof raw.profile === "object"
        ? { ...baseline.profile, ...raw.profile }
        : baseline.profile,
    tasks: migratedTasks,
    calendarEvents: Array.isArray(raw.calendarEvents) ? raw.calendarEvents : baseline.calendarEvents,
    goals: Array.isArray(raw.goals) ? raw.goals : baseline.goals,
    habits: migratedHabits,
    habitTransitions: Array.isArray(raw.habitTransitions) ? raw.habitTransitions : baseline.habitTransitions,
    focusSessions: Array.isArray(raw.focusSessions) ? raw.focusSessions : baseline.focusSessions,
    chatMessages: Array.isArray(raw.chatMessages) ? raw.chatMessages : baseline.chatMessages,
    notifications: Array.isArray(raw.notifications) ? raw.notifications : baseline.notifications,
    ecoEntries: Array.isArray(raw.ecoEntries) ? raw.ecoEntries : baseline.ecoEntries,
    selectedDateStr: typeof raw.selectedDateStr === "string" ? raw.selectedDateStr : DEMO_REFERENCE_DATE,
    lastSavedTimestamp: Date.now(),
  };
}

/**
 * Generates the clean, pristine demo baseline for a specified role.
 */
export function getInitialDemoState(role: UserRole = "student"): PersistedKronosState {
  const isStudent = role === "student";
  const isPro = role === "professional";

  const welcomeMessage: ChatMessage = {
    id: `msg-welcome-${role}`,
    sender: "assistant",
    text: isStudent
      ? "Good morning, Aria! I have your Stanford timetable and deadlines ready. What would you like to accomplish today?"
      : isPro
      ? "Good morning, Marcus! Morning standup is scheduled at 9:30 AM. What are your key focus outcomes for today?"
      : "Good morning, Elena! Both your Synthetix engineering blocks and UC Berkeley coursework are aligned. Ready to plan your day?",
    timestamp: "Just now",
  };

  const initialFocusSessions: FocusSessionLog[] = [
    {
      id: "flog-1",
      habitId: "h1",
      durationMinutes: 50,
      completedAt: "2026-11-01 16:30",
      flowState: "flow",
      reflectionNotes: "Deep immersion while reviewing Stanford CS problem set. Zero phone interruptions.",
      absorptionRating: 5,
      concentrationRating: 5,
      perceivedControl: 4,
      enjoymentRating: 5,
      timeDistortion: "faster",
    },
    {
      id: "flog-2",
      durationMinutes: 25,
      completedAt: "2026-11-02 09:45",
      flowState: "balanced",
      reflectionNotes: "Clean progress on weekly planning and email inbox zero.",
      absorptionRating: 4,
      concentrationRating: 4,
      perceivedControl: 4,
      enjoymentRating: 4,
      timeDistortion: "normal",
    },
  ];

  return {
    version: KRONOS_STORAGE_VERSION,
    role,
    profile: isStudent ? studentProfile : isPro ? professionalProfile : dualProfile,
    tasks: isStudent ? initialStudentTasks : isPro ? initialProfessionalTasks : initialDualTasks,
    calendarEvents: isStudent ? studentCalendarEvents : isPro ? professionalCalendarEvents : dualCalendarEvents,
    goals: isStudent ? studentGoals : isPro ? professionalGoals : dualGoals,
    habits: isStudent ? studentHabits : isPro ? professionalHabits : dualHabits,
    habitTransitions: isStudent
      ? studentHabitTransitions
      : isPro
      ? professionalHabitTransitions
      : dualHabitTransitions,
    focusSessions: initialFocusSessions,
    chatMessages: [welcomeMessage],
    notifications: sampleNotifications,
    ecoEntries: sampleEcoEntries,
    selectedDateStr: DEMO_REFERENCE_DATE,
    lastSavedTimestamp: Date.now(),
  };
}

/**
 * Loads the persisted state from localStorage safely.
 * Safeguards user data: version mismatches and structural additions are automatically
 * migrated forward and safely backed up to KRONOS_BACKUP_KEY rather than destroyed.
 */
export function loadStoredState(): PersistedKronosState | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(KRONOS_STORAGE_KEY);
    if (!raw) return null;

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (parseErr) {
      console.error("Corrupted JSON in Kronos storage. Preserving raw data in safety backup key:", parseErr);
      try {
        window.localStorage.setItem(KRONOS_CORRUPT_BACKUP_KEY, raw);
      } catch {}
      return null;
    }

    if (!parsed || typeof parsed !== "object") {
      try {
        window.localStorage.setItem(KRONOS_CORRUPT_BACKUP_KEY, raw);
      } catch {}
      return null;
    }

    // Version mismatch or structural evolution: perform safe migration instead of destroying data
    if (
      parsed.version !== KRONOS_STORAGE_VERSION ||
      !Array.isArray(parsed.tasks) ||
      !Array.isArray(parsed.habits) ||
      !parsed.profile
    ) {
      console.info("Kronos schema evolution detected. Preserving pre-migration backup and migrating data forward.");
      try {
        window.localStorage.setItem(KRONOS_BACKUP_KEY, raw);
      } catch (backupErr) {
        console.warn("Unable to write pre-migration backup:", backupErr);
      }
      const migrated = migrateState(parsed);
      saveStoredState(migrated);
      return migrated;
    }

    return parsed as PersistedKronosState;
  } catch (err) {
    console.error("Failed to read Kronos state from localStorage:", err);
    return null;
  }
}

/**
 * Saves the given state to localStorage safely.
 */
export function saveStoredState(state: PersistedKronosState): boolean {
  if (typeof window === "undefined" || !window.localStorage) {
    return false;
  }

  try {
    const serialized = JSON.stringify({
      ...state,
      version: KRONOS_STORAGE_VERSION,
      lastSavedTimestamp: Date.now(),
    });
    window.localStorage.setItem(KRONOS_STORAGE_KEY, serialized);
    return true;
  } catch (err) {
    console.warn("Failed to persist Kronos state to localStorage (quota or privacy mode):", err);
    return false;
  }
}

/**
 * Clears local storage and resets state to pristine demo baseline for the specified role.
 */
export function resetStoredStateToDemo(role: UserRole = "student"): PersistedKronosState {
  const fresh = getInitialDemoState(role);
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.removeItem(KRONOS_STORAGE_KEY);
      saveStoredState(fresh);
    } catch (err) {
      console.warn("Failed to reset localStorage:", err);
    }
  }
  return fresh;
}

/**
 * Returns human-readable diagnostics about the stored state.
 */
export function getStorageDiagnostics() {
  if (typeof window === "undefined" || !window.localStorage) {
    return { isAvailable: false, totalBytes: 0, lastSaved: null, itemCount: 0, hasCustomData: false, hasBackup: false };
  }

  try {
    const raw = window.localStorage.getItem(KRONOS_STORAGE_KEY);
    const backupRaw = window.localStorage.getItem(KRONOS_BACKUP_KEY);
    const corruptRaw = window.localStorage.getItem(KRONOS_CORRUPT_BACKUP_KEY);
    const hasBackup = Boolean(backupRaw || corruptRaw);

    if (!raw) {
      return { isAvailable: true, totalBytes: 0, lastSaved: null, itemCount: 0, hasCustomData: false, hasBackup };
    }

    const parsed = JSON.parse(raw) as PersistedKronosState;
    const totalBytes = new Blob([raw]).size;
    const itemCount =
      (parsed.tasks?.length || 0) +
      (parsed.habits?.length || 0) +
      (parsed.calendarEvents?.length || 0) +
      (parsed.focusSessions?.length || 0);

    return {
      isAvailable: true,
      totalBytes,
      lastSaved: parsed.lastSavedTimestamp ? new Date(parsed.lastSavedTimestamp).toLocaleTimeString() : null,
      itemCount,
      hasCustomData: true,
      hasBackup,
      role: parsed.role,
    };
  } catch {
    return { isAvailable: true, totalBytes: 0, lastSaved: null, itemCount: 0, hasCustomData: false, hasBackup: false };
  }
}

/**
 * Restores state from the pre-migration backup key if available.
 */
export function restorePreMigrationBackup(): PersistedKronosState | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(KRONOS_BACKUP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const restored = migrateState(parsed);
    saveStoredState(restored);
    return restored;
  } catch (err) {
    console.error("Failed to restore pre-migration backup:", err);
    return null;
  }
}

/**
 * Exports the complete application state as a JSON string for backup / demonstration.
 */
export function exportStateAsJSON(state: PersistedKronosState): string {
  return JSON.stringify(state, null, 2);
}

/**
 * Imports and validates state from an external JSON string.
 */
export function importStateFromJSON(jsonStr: string): PersistedKronosState | null {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.tasks)) {
      throw new Error("Invalid backup structure");
    }
    const validated: PersistedKronosState = {
      ...parsed,
      version: KRONOS_STORAGE_VERSION,
      lastSavedTimestamp: Date.now(),
    };
    saveStoredState(validated);
    return validated;
  } catch (err) {
    console.error("Failed to import Kronos state JSON:", err);
    return null;
  }
}
