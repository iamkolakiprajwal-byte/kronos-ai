"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  UserProfile,
  Task,
  CalendarEvent,
  Goal,
  Milestone,
  Habit,
  HabitResetTransition,
  NotificationItem,
  ChatMessage,
  UserRole,
  OnboardingFormData,
  SyncConflict,
  FocusSessionLog,
  EcoLogEntry,
  ActiveTimerState,
  AutoSyncInterval,
} from "@/types";
import { CalendarSyncStatus } from "@/lib/calendar/types";
import { sampleEcoEntries, ECO_ACTIVITY_FACTORS } from "@/lib/sustainability/eco-calculator";
import { useAuth } from "./auth-context";
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
import { cleanOnboardingInitialData } from "@/lib/onboarding/defaults";
import {
  loadStoredState,
  saveStoredState,
  resetStoredStateToDemo,
  resetStoredStateToClean,
  clearStoredState,
  getCleanInitialState,
  exportStateAsJSON,
  importStateFromJSON,
  restorePreMigrationBackup,
  KRONOS_STORAGE_VERSION,
} from "@/lib/storage";
import { dataService } from "@/lib/supabase/data-service";

interface DemoContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  profile: UserProfile;
  tasks: Task[];
  calendarEvents: CalendarEvent[];
  goals: Goal[];
  habits: Habit[];
  notifications: NotificationItem[];
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  referenceDate: string;
  toggleTaskStatus: (id: string) => void;
  addTask: (task: Omit<Task, "id">) => void;
  deleteTask: (id: string) => void;
  updateTaskSchedule: (placements: { id: string; startTime: string; endTime: string }[]) => void;
  toggleHabit: (id: string) => void;
  addHabit: (habit: Omit<Habit, "id" | "currentStreak" | "bestStreak" | "completedToday" | "automaticityScore">) => void;
  setHabitSelfReportedAutomaticity: (habitId: string, score: number) => void;
  markNotificationRead: (id: string) => void;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (content: string) => void;
  isAiThinking: boolean;
  applySuggestedTasks: (suggested: Partial<Task>[]) => void;
  applySuggestedHabit: (suggested: NonNullable<ChatMessage["suggestedHabit"]>) => void;
  applySuggestedGoal: (suggested: NonNullable<ChatMessage["suggestedGoal"]>) => void;
  isHydrated: boolean;
  isQuickTaskOpen: boolean;
  openQuickTask: () => void;
  closeQuickTask: () => void;
  resetDemoData: (targetRole?: UserRole) => void;
  exportData: () => string;
  importData: (jsonStr: string) => boolean;
  restoreBackup: () => boolean;
  onboardingDraft: OnboardingFormData;
  setOnboardingDraft: React.Dispatch<React.SetStateAction<OnboardingFormData>>;
  completeOnboarding: (data: OnboardingFormData) => void;

  // Persistent Focus Session Timer
  timerState: ActiveTimerState;
  startFocusTimer: (config?: {
    totalMinutes?: number;
    taskTitle?: string;
    habitId?: string;
    perceivedChallenge?: number;
    perceivedSkill?: number;
    sessionGoal?: string;
    completionCriteria?: string;
  }) => void;
  pauseFocusTimer: () => void;
  resumeFocusTimer: () => void;
  resetFocusTimer: (mins?: number) => void;
  logTimerInterruption: () => void;
  finishTimerEarly: () => void;
  completeTimerSession: (reflection: {
    flowState: FocusSessionLog["flowState"];
    absorptionRating?: number;
    concentrationRating?: number;
    perceivedControl?: number;
    enjoymentRating?: number;
    timeDistortion?: "faster" | "normal" | "slower";
    reflectionNotes?: string;
  }) => void;
  dismissTimerCompletion: () => void;
  updateTimerChallengeSkill: (
    challenge: number,
    skill: number,
    goal?: string,
    criteria?: string,
    taskTitle?: string,
    habitId?: string
  ) => void;

  // Sprint 2: Productivity & Integrations
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  addGoal: (goal: Omit<Goal, "id" | "progress">) => void;
  updateGoalRoadmap: (goalId: string, milestones: Milestone[]) => void;
  addMilestoneTaskToAgenda: (task: Omit<Task, "id">) => void;

  focusSessions: FocusSessionLog[];
  logFocusSession: (
    habitId: string | null,
    durationMinutes: number,
    flowState: FocusSessionLog["flowState"],
    reflectionNotes?: string
  ) => void;
  logDetailedFocusSession: (session: Omit<FocusSessionLog, "id" | "completedAt">) => void;
  updateHabitAutomaticity: (habitId: string, delta: number) => void;

  // Growth Workspace: Habit Discontinuity (Habit Reset)
  habitTransitions: HabitResetTransition[];
  addHabitTransition: (transition: Omit<HabitResetTransition, "id">) => void;

  syncStatus: CalendarSyncStatus;
  lastSyncTime: string | null;
  lastSyncTimestampMs: number | null;
  autoSyncInterval: AutoSyncInterval;
  setAutoSyncInterval: (interval: AutoSyncInterval) => void;
  syncConflicts: SyncConflict[];
  triggerCalendarSync: (forceFull?: boolean, isBackground?: boolean) => Promise<any>;
  simulateExternalCalendarConflict: () => Promise<void>;
  resolveSyncConflict: (conflictId: string, resolution: "keep_local" | "accept_remote") => Promise<void>;

  ecoEntries: EcoLogEntry[];
  logEcoActivity: (activity: EcoLogEntry["activity"], minutes: number) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

const NOTIFS_STORAGE_KEY = "kronos_notifications_v1";
const NOTIFS_CLEARED_KEY = "kronos_notifications_cleared_at_v1";
const NOTIFS_DISMISSED_KEY = "kronos_notifications_dismissed_v1";

function getNotifsKey(userId?: string): string {
  return userId ? `kronos_notifs_${userId}` : NOTIFS_STORAGE_KEY;
}

function getClearedAtKey(userId?: string): string {
  return userId ? `kronos_notifs_cleared_${userId}` : NOTIFS_CLEARED_KEY;
}

function getDismissedKey(userId?: string): string {
  return userId ? `kronos_notifs_dismissed_${userId}` : NOTIFS_DISMISSED_KEY;
}

function getStoredClearedAt(userId?: string): number {
  if (typeof window === "undefined" || !window.localStorage) return 0;
  try {
    const val = localStorage.getItem(getClearedAtKey(userId)) || localStorage.getItem(NOTIFS_CLEARED_KEY);
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

function getStoredDismissedIds(userId?: string): Set<string> {
  if (typeof window === "undefined" || !window.localStorage) return new Set();
  try {
    const userVal = userId ? localStorage.getItem(getDismissedKey(userId)) : null;
    const guestVal = localStorage.getItem(NOTIFS_DISMISSED_KEY);
    const userArr = userVal ? JSON.parse(userVal) : [];
    const guestArr = guestVal ? JSON.parse(guestVal) : [];
    return new Set([...userArr, ...guestArr]);
  } catch {
    return new Set();
  }
}

function filterValidNotifications(items: NotificationItem[], userId?: string): NotificationItem[] {
  if (!Array.isArray(items)) return [];
  const clearedAt = getStoredClearedAt(userId);
  const dismissedSet = getStoredDismissedIds(userId);

  return items.filter((n) => {
    if (!n || !n.id) return false;
    if (dismissedSet.has(n.id)) return false;
    const itemTime = n.createdAtMs || (n.id.startsWith("notif-") ? parseInt(n.id.replace(/\D/g, ""), 10) || 0 : 0);
    if (clearedAt > 0 && itemTime > 0 && itemTime <= clearedAt) return false;
    return true;
  });
}

const AUTO_SYNC_STORAGE_KEY = "kronos_auto_sync_interval_v1";
const LAST_SYNC_TS_KEY = "kronos_last_sync_timestamp_v1";

function getAutoSyncKey(userId?: string): string {
  return userId ? `kronos_auto_sync_${userId}` : AUTO_SYNC_STORAGE_KEY;
}

function getLastSyncTsKey(userId?: string): string {
  return userId ? `kronos_last_sync_ts_${userId}` : LAST_SYNC_TS_KEY;
}

export const AUTO_SYNC_MS_MAP: Record<AutoSyncInterval, number> = {
  "15m": 15 * 60 * 1000,
  "30m": 30 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "12h": 12 * 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
  "1w": 7 * 24 * 60 * 60 * 1000,
  "manual": Infinity,
};

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("student");
  const [profile, setProfile] = useState<UserProfile>({
    id: "user-default",
    name: "Planner",
    email: "user@example.com",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Kronos&backgroundColor=e8decb",
    role: "student",
    headline: "Daily Planner",
    institutionOrCompany: "My Workspace",
    wakeTime: "07:00",
    sleepTime: "23:00",
    mostProductivePeriod: "morning",
    preferredFocusDuration: 45,
    preferredBreakDuration: 10,
    planningStyle: "time-blocked",
    sustainabilityOptIn: true,
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date("2026-11-08T00:00:00"));
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isQuickTaskOpen, setIsQuickTaskOpen] = useState(false);
  const openQuickTask = () => setIsQuickTaskOpen(true);
  const closeQuickTask = () => setIsQuickTaskOpen(false);
  const [referenceDate, setReferenceDate] = useState<string>("2026-11-08");

  useEffect(() => {
    setSelectedDate(new Date());
    setReferenceDate(new Date().toISOString().split("T")[0]);
  }, []);
  const { user: authUser, isLoading: isAuthLoading } = useAuth();

  // Synchronize authenticated user profile (Google / GitHub / Email) from AuthContext
  useEffect(() => {
    if (authUser) {
      setProfile((prev) => ({
        ...prev,
        name: authUser.name || prev.name,
        email: authUser.email || prev.email,
        avatar: authUser.avatar || prev.avatar,
      }));
    }
  }, [authUser]);

  const initialWelcomeMessage: ChatMessage = {
    id: "msg-welcome",
    sender: "assistant",
    text: "Welcome to Kronos AI! I am your personal intelligent planning assistant. Tell me what you would like to accomplish today, or tap the floating + button in the bottom right to schedule your first task!",
    timestamp: "Just now",
  };

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([initialWelcomeMessage]);
  const [onboardingDraft, setOnboardingDraft] = useState<OnboardingFormData>(cleanOnboardingInitialData);

  // Sprint 2: Productivity & Integrations State
  const [focusSessions, setFocusSessions] = useState<FocusSessionLog[]>([]);

  const [syncStatus, setSyncStatus] = useState<CalendarSyncStatus>("offline");
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [lastSyncTimestampMs, setLastSyncTimestampMs] = useState<number | null>(() => {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const stored = localStorage.getItem(LAST_SYNC_TS_KEY);
    return stored ? Number(stored) : null;
  });
  const [autoSyncInterval, setAutoSyncIntervalState] = useState<AutoSyncInterval>(() => {
    if (typeof window === "undefined" || !window.localStorage) return "30m";
    return (localStorage.getItem(AUTO_SYNC_STORAGE_KEY) as AutoSyncInterval) || "30m";
  });
  const [syncConflicts, setSyncConflicts] = useState<SyncConflict[]>([]);
  const [ecoEntries, setEcoEntries] = useState<EcoLogEntry[]>([]);
  const [habitTransitions, setHabitTransitions] = useState<HabitResetTransition[]>([]);

  // Persistent Active Focus Timer State (Survives workspace transitions)
  const [timerState, setTimerState] = useState<ActiveTimerState>({
    taskTitle: "",
    habitId: undefined,
    totalMinutes: 25,
    secondsLeft: 25 * 60,
    isRunning: false,
    interruptionsCount: 0,
    targetEndTimestamp: undefined,
    perceivedChallenge: 3,
    perceivedSkill: 3,
    sessionGoal: "",
    completionCriteria: "",
    sessionCompleted: false,
  });

  // Strict User Data Isolation: Hydrate application state for authenticated user or clean baseline
  useEffect(() => {
    // Wait until Supabase authentication resolves before determining workspace isolation
    if (isAuthLoading) return;

    let isCurrent = true;

    async function hydrateUserWorkspace() {
      if (!authUser?.id) {
        // Guest or logged out: initialize clean baseline
        const stored = loadStoredState();
        if (stored && isCurrent) {
          setRoleState(stored.role);
          setProfile(stored.profile);
          setTasks(stored.tasks);
          setCalendarEvents(stored.calendarEvents);
          setGoals(stored.goals);
          setHabits(stored.habits);
          setHabitTransitions(stored.habitTransitions || []);
          setFocusSessions(stored.focusSessions || []);
          if (Array.isArray(stored.chatMessages) && stored.chatMessages.length) setChatMessages(stored.chatMessages);
          
          let candidateNotifs: NotificationItem[] = [];
          try {
            const raw = localStorage.getItem(NOTIFS_STORAGE_KEY);
            if (raw) candidateNotifs = JSON.parse(raw);
            else if (Array.isArray(stored.notifications)) candidateNotifs = stored.notifications;
          } catch {}
          setNotifications(filterValidNotifications(candidateNotifs));

          if (stored.ecoEntries?.length) setEcoEntries(stored.ecoEntries);
        } else if (isCurrent) {
          setTasks([]);
          setCalendarEvents([]);
          setGoals([]);
          setHabits([]);
          setFocusSessions([]);
          setHabitTransitions([]);
          setNotifications([]);
        }
        if (isCurrent) {
          setSelectedDate(new Date());
          setIsHydrated(true);
        }
        return;
      }

      // Authenticated User: Load exclusively from remote Supabase tables protected by RLS
      try {
        const [
          remoteProfile,
          remoteTasks,
          remoteEvents,
          remoteGoals,
          remoteHabits,
          remoteFocus,
          conn,
        ] = await Promise.all([
          dataService.getProfile(authUser.id),
          dataService.getTasks(authUser.id),
          dataService.getCalendarEvents(authUser.id),
          dataService.getGoals(authUser.id),
          dataService.getHabits(authUser.id),
          dataService.getFocusSessions(authUser.id),
          dataService.getCalendarConnection(authUser.id),
        ]);

        if (!isCurrent) return;

        if (remoteProfile) {
          setProfile((prev) => ({
            ...prev,
            ...remoteProfile,
            name: authUser.name || remoteProfile.name,
            email: authUser.email || remoteProfile.email,
            avatar: authUser.avatar || remoteProfile.avatar,
          }));
          setRoleState(remoteProfile.role);
        } else {
          setProfile((prev) => ({
            ...prev,
            id: authUser.id,
            name: authUser.name || prev.name,
            email: authUser.email || prev.email,
            avatar: authUser.avatar || prev.avatar,
          }));
        }

        // Set remote records (fresh users get genuine empty arrays: 0 tasks, 0 events, 0 goals, 0 habits)
        setTasks(remoteTasks);
        setCalendarEvents(remoteEvents);
        setGoals(remoteGoals);
        setHabits(remoteHabits);
        setFocusSessions(remoteFocus);

        // Hydrate client-side UI state (notifications, chat messages, eco entries) from user-partitioned local state
        const stored = loadStoredState(authUser.id);
        let candidateNotifs: NotificationItem[] = [];
        try {
          const raw = localStorage.getItem(getNotifsKey(authUser.id)) || localStorage.getItem(NOTIFS_STORAGE_KEY);
          if (raw) candidateNotifs = JSON.parse(raw);
          else if (stored && Array.isArray(stored.notifications)) candidateNotifs = stored.notifications;
        } catch {}
        setNotifications(filterValidNotifications(candidateNotifs, authUser.id));

        if (stored && isCurrent) {
          if (Array.isArray(stored.chatMessages) && stored.chatMessages.length > 0) {
            setChatMessages(stored.chatMessages);
          }
          if (Array.isArray(stored.ecoEntries)) {
            setEcoEntries(stored.ecoEntries);
          }
        }

        if (typeof window !== "undefined") {
          const userAutoSync = (localStorage.getItem(getAutoSyncKey(authUser.id)) ||
            localStorage.getItem(AUTO_SYNC_STORAGE_KEY) ||
            "30m") as AutoSyncInterval;
          setAutoSyncIntervalState(userAutoSync);

          const savedTs = localStorage.getItem(getLastSyncTsKey(authUser.id));
          if (savedTs) {
            setLastSyncTimestampMs(Number(savedTs));
          } else if (conn?.last_synced_at) {
            setLastSyncTimestampMs(new Date(conn.last_synced_at).getTime());
          }
        }

        if (conn && (conn.sync_status === "active" || conn.sync_status === "synced")) {
          setSyncStatus("synced");
          if (conn.last_synced_at) {
            setLastSyncTime(new Date(conn.last_synced_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
            setLastSyncTimestampMs(new Date(conn.last_synced_at).getTime());
          }
        } else if (conn && conn.sync_status === "error") {
          setSyncStatus("error");
          if (conn.last_synced_at) {
            setLastSyncTime(new Date(conn.last_synced_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
          }
        } else {
          setSyncStatus("offline");
          setLastSyncTime(null);
        }
      } catch (err) {
        console.warn("[Kronos] Supabase fetch fallback to user-partitioned local storage:", err);
        const stored = loadStoredState(authUser.id);
        if (stored && isCurrent) {
          setRoleState(stored.role);
          setProfile(stored.profile);
          setTasks(stored.tasks);
          setCalendarEvents(stored.calendarEvents);
          setGoals(stored.goals);
          setHabits(stored.habits);
          setHabitTransitions(stored.habitTransitions || []);
          setFocusSessions(stored.focusSessions || []);
          let candidateNotifs: NotificationItem[] = [];
          try {
            const raw = localStorage.getItem(getNotifsKey(authUser.id)) || localStorage.getItem(NOTIFS_STORAGE_KEY);
            if (raw) candidateNotifs = JSON.parse(raw);
            else if (Array.isArray(stored.notifications)) candidateNotifs = stored.notifications;
          } catch {}
          setNotifications(filterValidNotifications(candidateNotifs, authUser.id));

          if (Array.isArray(stored.chatMessages) && stored.chatMessages.length > 0) {
            setChatMessages(stored.chatMessages);
          }
        } else if (isCurrent) {
          setTasks([]);
          setCalendarEvents([]);
          setGoals([]);
          setHabits([]);
          setFocusSessions([]);
          setHabitTransitions([]);
          setNotifications([]);
        }
      } finally {
        if (isCurrent) {
          setSelectedDate(new Date());
          setIsHydrated(true);
        }
      }
    }

    hydrateUserWorkspace();

    return () => {
      isCurrent = false;
    };
  }, [authUser?.id, isAuthLoading]);

  // Persist state changes to user-partitioned localStorage whenever core data changes
  useEffect(() => {
    if (!isHydrated) return;
    saveStoredState(
      {
        version: KRONOS_STORAGE_VERSION,
        role,
        profile,
        tasks,
        calendarEvents,
        goals,
        habits,
        habitTransitions,
        focusSessions,
        chatMessages,
        notifications,
        ecoEntries,
        selectedDateStr: format(selectedDate, "yyyy-MM-dd"),
        lastSavedTimestamp: Date.now(),
      },
      authUser?.id
    );
  }, [
    isHydrated,
    authUser?.id,
    role,
    profile,
    tasks,
    calendarEvents,
    goals,
    habits,
    habitTransitions,
    focusSessions,
    chatMessages,
    notifications,
    ecoEntries,
    selectedDate,
  ]);

  // Accurate timestamp-based interval runner
  useEffect(() => {
    if (!timerState.isRunning || !timerState.targetEndTimestamp) return;

    const syncRemaining = () => {
      const remainingMs = timerState.targetEndTimestamp! - Date.now();
      const remainingSecs = Math.max(0, Math.ceil(remainingMs / 1000));
      if (remainingSecs <= 0) {
        setTimerState((prev) => ({
          ...prev,
          secondsLeft: 0,
          isRunning: false,
          sessionCompleted: true,
          targetEndTimestamp: undefined,
        }));
      } else {
        setTimerState((prev) => {
          if (prev.secondsLeft !== remainingSecs) {
            return { ...prev, secondsLeft: remainingSecs };
          }
          return prev;
        });
      }
    };

    syncRemaining();
    const interval = setInterval(syncRemaining, 500);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        syncRemaining();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
    };
  }, [timerState.isRunning, timerState.targetEndTimestamp]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    setProfile((prev) => ({
      ...prev,
      role: newRole,
    }));
  };

  const completeOnboarding = (data: OnboardingFormData) => {
    setRoleState(data.userType);

    const todayStr = new Date().toISOString().split("T")[0];

    const customizedProfile: UserProfile = {
      id: `user-${Date.now()}`,
      name: data.name || "Explorer",
      email: data.email || "user@example.com",
      avatar:
        data.userType === "student"
          ? studentProfile.avatar
          : data.userType === "professional"
          ? professionalProfile.avatar
          : dualProfile.avatar,
      role: data.userType,
      headline:
        data.headline ||
        (data.userType === "student"
          ? `${data.course || "Student"} at ${data.institutionOrCompany || "University"}`
          : data.userType === "professional"
          ? `${data.jobRole || "Professional"} at ${data.company || "Company"}`
          : `${data.jobRole || "Professional"} & Graduate Student`),
      institutionOrCompany:
        data.institutionOrCompany ||
        (data.userType === "professional" ? data.company : "Academic / Enterprise"),
      wakeTime: data.wakeTime || "07:00",
      sleepTime: data.sleepTime || "23:00",
      mostProductivePeriod: data.mostProductivePeriod || "morning",
      preferredFocusDuration: data.preferredFocusDuration || 45,
      preferredBreakDuration: data.preferredBreakDuration || 10,
      planningStyle: data.planningStyle || "time-blocked",
      sustainabilityOptIn: data.sustainabilityOptIn,
    };

    setProfile(customizedProfile);

    // Build calendar events from timetable and recurring meetings
    const generatedEvents: CalendarEvent[] = [];

    data.timetable.forEach((tt, idx) => {
      generatedEvents.push({
        id: `cal-tt-${idx}`,
        title: tt.subject,
        date: todayStr,
        startTime: tt.startTime,
        endTime: tt.endTime,
        category: "academic",
        isFixed: true,
        location: tt.locationOrLink,
        color: "#6366f1",
      });
    });

    data.recurringMeetings.forEach((rm, idx) => {
      generatedEvents.push({
        id: `cal-rm-${idx}`,
        title: rm.title,
        date: todayStr,
        startTime: rm.startTime,
        endTime: rm.endTime,
        category: "meeting",
        isFixed: true,
        location: "Virtual Room",
        color: "#0ea5e9",
      });
    });

    if (generatedEvents.length > 0) {
      setCalendarEvents(generatedEvents);
    }

    // Build initial tasks
    const generatedTasks: Task[] = [];
    if (data.shortTermGoal) {
      generatedTasks.push({
        id: `task-onb-1`,
        title: `Deep Work: ${data.shortTermGoal.slice(0, 42)}`,
        description: "Milestone focus block created during onboarding setup.",
        category: data.userType === "student" ? "study" : "work",
        priority: "high",
        status: "todo",
        estimatedDuration: data.preferredFocusDuration,
        startTime: "14:00",
        endTime: "15:00",
        scheduledDate: todayStr,
        isFixed: false,
        tag: "Core Focus",
        energyLevel: "high",
      });
    }

    data.timetable.slice(0, 2).forEach((tt, i) => {
      generatedTasks.push({
        id: `task-onb-class-${i}`,
        title: `Attend: ${tt.subject}`,
        description: `Scheduled commitment in ${tt.locationOrLink || "Room"}.`,
        category: "study",
        priority: "high",
        status: "todo",
        estimatedDuration: 75,
        startTime: tt.startTime,
        endTime: tt.endTime,
        scheduledDate: todayStr,
        isFixed: true,
        tag: "Timetable",
        energyLevel: "high",
      });
    });

    data.recurringMeetings.slice(0, 2).forEach((rm, i) => {
      generatedTasks.push({
        id: `task-onb-rm-${i}`,
        title: rm.title,
        description: "Recurring sync commitment.",
        category: "work",
        priority: rm.priority === "high" ? "high" : "medium",
        status: "todo",
        estimatedDuration: 45,
        startTime: rm.startTime,
        endTime: rm.endTime,
        scheduledDate: todayStr,
        isFixed: true,
        tag: "Meeting",
        energyLevel: "medium",
      });
    });

    if (generatedTasks.length > 0) {
      setTasks(generatedTasks);
    }

    // Build goals
    const newGoals: Goal[] = [];
    if (data.shortTermGoal) {
      newGoals.push({
        id: `goal-custom-1`,
        title: data.shortTermGoal,
        description: "Active priority goal initialized in onboarding.",
        targetDate: "2026-12-15",
        priority: "urgent",
        progress: 15,
        category: data.userType === "student" ? "academic" : "career",
        milestones: [
          { id: "m-c1", title: "Establish weekly baseline & setup", dueDate: "2026-11-10", completed: true },
          { id: "m-c2", title: "Complete primary deliverable sprint", dueDate: "2026-11-28", completed: false },
        ],
      });
    }
    if (data.longTermGoal) {
      newGoals.push({
        id: `goal-custom-2`,
        title: data.longTermGoal,
        description: "Strategic horizon goal initialized in onboarding.",
        targetDate: "2027-02-28",
        priority: "high",
        progress: 10,
        category: "skills",
        milestones: [
          { id: "m-c3", title: "Foundational phase & research", dueDate: "2026-12-05", completed: false },
          { id: "m-c4", title: "Review & prototype demonstration", dueDate: "2027-01-20", completed: false },
        ],
      });
    }
    if (newGoals.length > 0) {
      setGoals(newGoals);
    }

    // Build habits
    const newHabits: Habit[] = [];
    data.desiredHabits.forEach((dh, idx) => {
      newHabits.push({
        id: `habit-onb-${idx}`,
        title: dh,
        frequency: "daily",
        cue: `Anchored to morning routine (${data.wakeTime})`,
        targetDurationMinutes: 25,
        currentStreak: 1,
        bestStreak: 1,
        completedToday: false,
        automaticityScore: 40,
        category: "focus",
      });
    });
    if (newHabits.length > 0) {
      setHabits(newHabits);
    }

    // Welcome message in assistant
    setChatMessages([
      {
        id: `msg-welcome-onboarded`,
        sender: "assistant",
        text: `Welcome aboard, ${data.name}! I have configured your personalized planning surface with your ${data.wakeTime} wake-up target, ${data.preferredFocusDuration}-minute focus sessions, and active commitments. Tell me whenever your plans shift or what you'd like to achieve today!`,
        timestamp: "Just now",
      },
    ]);

    // Notification
    addNotificationSafe({
      id: `notif-onb-${Date.now()}`,
      title: "Personalized Schedule Activated",
      message: `Welcome, ${data.name}! Your routines, timetable, and focus preferences have been successfully loaded.`,
      timestamp: "Just now",
      type: "system",
      read: false,
    });

    // Persist onboarding setup directly to authenticated user's database tables
    if (authUser?.id) {
      dataService.saveOnboarding(authUser.id, 10, data, true).catch((e) =>
        console.warn("Onboarding record persist warning:", e)
      );
      dataService.updateProfile(authUser.id, customizedProfile).catch((e) =>
        console.warn("Profile persist warning:", e)
      );
      generatedTasks.forEach((t) => dataService.createTask(authUser.id, t));
      generatedEvents.forEach((e) => dataService.createCalendarEvent(authUser.id, e));
      newGoals.forEach((g) => dataService.createGoal(authUser.id, g));
      newHabits.forEach((h) => dataService.createHabit(authUser.id, h));
    }
  };

  const toggleTaskStatus = (id: string) => {
    let nextStatus: Task["status"] = "todo";
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          nextStatus = t.status === "completed" ? "todo" : "completed";
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );

    if (authUser?.id) {
      dataService
        .updateTask(authUser.id, id, { status: nextStatus })
        .catch((err) => console.warn("Failed to persist task status to Supabase:", err));
    }
  };

  const addTask = (newTask: Omit<Task, "id">) => {
    const created: Task = {
      ...newTask,
      id: `task-custom-${Date.now()}`,
    };
    setTasks((prev) => [created, ...prev]);

    if (authUser?.id) {
      dataService
        .createTask(authUser.id, created)
        .then((saved) => {
          if (saved?.id && saved.id !== created.id) {
            setTasks((prev) => prev.map((t) => (t.id === created.id ? { ...t, id: saved.id } : t)));
          }
          // Immediately push to Google Calendar & Google Tasks if integration is live
          if (syncStatus === "synced") {
            triggerCalendarSync().catch((err) => console.warn("[Auto-Sync Task] Notice:", err));
          }
        })
        .catch((err) => console.warn("Failed to persist task to Supabase:", err));
    }
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));

    if (authUser?.id) {
      dataService
        .deleteTask(authUser.id, id)
        .catch((err) => console.warn("Failed to delete task from Supabase:", err));
    }
  };

  const updateTaskSchedule = (placements: { id: string; startTime: string; endTime: string }[]) => {
    const map = new Map(placements.map((p) => [p.id, p]));
    setTasks((prev) =>
      prev.map((t) => {
        const match = map.get(t.id);
        if (match) {
          return { ...t, startTime: match.startTime, endTime: match.endTime };
        }
        return t;
      })
    );

    if (authUser?.id) {
      dataService
        .batchUpdateTaskSchedule(authUser.id, placements)
        .catch((err: any) => console.warn("Failed to persist schedule to Supabase:", err));
    }
  };

  const toggleHabit = (id: string) => {
    let nextCompleted = false;
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          nextCompleted = !h.completedToday;
          const updatedHistory = [
            nextCompleted,
            ...(h.recentHistory?.slice(1) || [false, false, false, false, false, false]),
          ];
          const completedDays = updatedHistory.filter(Boolean).length;
          const weeklyRate = Math.round((completedDays / updatedHistory.length) * 100);

          return {
            ...h,
            completedToday: nextCompleted,
            currentStreak: nextCompleted ? h.currentStreak + 1 : Math.max(0, h.currentStreak - 1),
            totalCompletions: nextCompleted
              ? (h.totalCompletions || 0) + 1
              : Math.max(0, (h.totalCompletions || 1) - 1),
            recentHistory: updatedHistory,
            // Separate empirical completion rate from cue consistency & self-report
            weeklyCompletionRate: weeklyRate,
            automaticityScore: weeklyRate,
          };
        }
        return h;
      })
    );

    if (authUser?.id) {
      dataService
        .toggleHabitLog(authUser.id, id, nextCompleted)
        .catch((err) => console.warn("Failed to persist habit log to Supabase:", err));
    }
  };

  const setHabitSelfReportedAutomaticity = (habitId: string, score: number) => {
    const clamped = Math.max(1, Math.min(5, Math.round(score)));
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId ? { ...h, selfReportedAutomaticity: clamped } : h
      )
    );
  };

  const addNotificationSafe = useCallback(
    (item: Omit<NotificationItem, "createdAtMs"> & { createdAtMs?: number }) => {
      const now = Date.now();
      const withTimestamp: NotificationItem = {
        ...item,
        createdAtMs: item.createdAtMs || now,
      };

      const clearedAt = Math.max(getStoredClearedAt(authUser?.id), getStoredClearedAt());
      if (clearedAt > 0 && (withTimestamp.createdAtMs || 0) <= clearedAt) {
        return;
      }

      const dismissedSet = getStoredDismissedIds(authUser?.id);
      if (dismissedSet.has(withTimestamp.id)) {
        return;
      }

      setNotifications((prev) => {
        const next = [withTimestamp, ...prev.filter((n) => n.id !== withTimestamp.id)];
        try {
          localStorage.setItem(getNotifsKey(authUser?.id), JSON.stringify(next));
          const stored = loadStoredState(authUser?.id);
          if (stored) {
            saveStoredState({ ...stored, notifications: next }, authUser?.id);
          }
        } catch {}
        return next;
      });
    },
    [authUser?.id]
  );

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      try {
        localStorage.setItem(getNotifsKey(authUser?.id), JSON.stringify(updated));
        const stored = loadStoredState(authUser?.id);
        if (stored) {
          saveStoredState({ ...stored, notifications: updated }, authUser?.id);
        }
      } catch {}
      return updated;
    });
  };

  const dismissNotification = (id: string) => {
    try {
      const currentDismissed = getStoredDismissedIds(authUser?.id);
      currentDismissed.add(id);
      const arr = Array.from(currentDismissed);
      if (authUser?.id) {
        localStorage.setItem(getDismissedKey(authUser.id), JSON.stringify(arr));
      }
      localStorage.setItem(NOTIFS_DISMISSED_KEY, JSON.stringify(arr));

      setNotifications((prev) => {
        const next = prev.filter((n) => n.id !== id);
        try {
          localStorage.setItem(getNotifsKey(authUser?.id), JSON.stringify(next));
          const stored = loadStoredState(authUser?.id);
          if (stored) {
            saveStoredState({ ...stored, notifications: next }, authUser?.id);
          }
        } catch {}
        return next;
      });
    } catch (e) {
      console.warn("Failed to persist notification dismiss:", e);
    }
  };

  const clearNotifications = () => {
    const now = Date.now();
    try {
      localStorage.setItem(getNotifsKey(authUser?.id), "[]");
      localStorage.setItem(NOTIFS_STORAGE_KEY, "[]");
      localStorage.setItem(getClearedAtKey(authUser?.id), String(now));
      localStorage.setItem(NOTIFS_CLEARED_KEY, String(now));

      const stored = loadStoredState(authUser?.id);
      if (stored) {
        saveStoredState({ ...stored, notifications: [] }, authUser?.id);
      }
    } catch (e) {
      console.warn("Failed to clear notifications in storage:", e);
    }
    setNotifications([]);
  };

  const applySuggestedTasks = (suggested: Partial<Task>[]) => {
    const targetDateStr = format(selectedDate, "yyyy-MM-dd");
    let updatedCount = 0;
    let addedCount = 0;

    setTasks((prev) => {
      let currentList = [...prev];

      suggested.forEach((st, i) => {
        // Check if an existing task matches this suggestion (by id or normalized title)
        const matchIndex = currentList.findIndex((t) => {
          if (st.id && t.id === st.id) return true;
          if (t.scheduledDate === targetDateStr && st.title) {
            const cleanT = t.title.toLowerCase().trim();
            const cleanSt = st.title.toLowerCase().trim();
            return cleanT === cleanSt || cleanT.includes(cleanSt) || cleanSt.includes(cleanT);
          }
          return false;
        });

        if (matchIndex >= 0) {
          // Update the existing task (reschedule or priority update)
          const existing = currentList[matchIndex];
          currentList[matchIndex] = {
            ...existing,
            startTime: st.startTime || existing.startTime,
            endTime: st.endTime || existing.endTime,
            priority: st.priority || existing.priority,
            energyLevel: st.energyLevel || existing.energyLevel,
            category: st.category || existing.category,
            tag: st.tag || existing.tag,
          };
          updatedCount++;
        } else {
          // Add as new scheduled task
          currentList = [
            {
              id: st.id || `task-ai-${Date.now()}-${i}`,
              title: st.title || "Planned Activity",
              description: st.description || "Added via AI daily planner",
              category: st.category || "study",
              priority: st.priority || "medium",
              status: "todo",
              estimatedDuration: st.estimatedDuration || 45,
              startTime: st.startTime,
              endTime: st.endTime,
              scheduledDate: targetDateStr,
              isFixed: false,
              tag: st.tag || "AI Scheduled",
              energyLevel: st.energyLevel || "high",
            },
            ...currentList,
          ];
          addedCount++;
        }
      });

      return currentList;
    });

    const summaryParts: string[] = [];
    if (addedCount > 0) summaryParts.push(`added ${addedCount} activities`);
    if (updatedCount > 0) summaryParts.push(`updated ${updatedCount} existing tasks`);

    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-ack-${Date.now()}`,
        sender: "assistant",
        text: `✓ Successfully ${summaryParts.join(" and ")} for ${targetDateStr}. Your agenda is synchronized!`,
        timestamp: "Just now",
      },
    ]);
  };

  const applySuggestedHabit = (suggested: NonNullable<ChatMessage["suggestedHabit"]>) => {
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      title: suggested.title,
      cue: suggested.cue,
      frequency: suggested.frequency || "daily",
      category: suggested.category || "focus",
      minimumVersion: suggested.minimumVersion || "Start with 2 minutes",
      targetDurationMinutes: suggested.targetDurationMinutes || 15,
      currentStreak: 0,
      bestStreak: 0,
      completedToday: false,
      weeklyCompletionRate: 0,
      cueConsistencyScore: 100,
      selfReportedAutomaticity: 1,
      automaticityScore: 0,
      totalCompletions: 0,
      recentHistory: [false, false, false, false, false, false, false],
    };

    setHabits((prev) => [newHabit, ...prev]);

    addNotificationSafe({
      id: `notif-habit-${Date.now()}`,
      title: "New Habit Anchored",
      message: `Habit "${newHabit.title}" anchored to cue: "${newHabit.cue}".`,
      timestamp: "Just now",
      type: "habit",
      read: false,
    });

    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-ack-h-${Date.now()}`,
        sender: "assistant",
        text: `✓ Habit "${newHabit.title}" has been anchored to your Growth workspace with cue: "${newHabit.cue}".`,
        timestamp: "Just now",
      },
    ]);
  };

  const applySuggestedGoal = (suggested: NonNullable<ChatMessage["suggestedGoal"]>) => {
    const targetDate = format(new Date(Date.now() + 60 * 24 * 3600 * 1000), "yyyy-MM-dd");
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      title: suggested.title,
      description: `Structured milestone roadmap planned for ${suggested.targetTimeline}`,
      category: (suggested.category === "personal" ? "wellness" : suggested.category) || "academic",
      priority: suggested.priority || "high",
      targetDate,
      progress: 0,
      milestones: suggested.milestones.map((m, idx) => ({
        id: `m-ai-${Date.now()}-${idx}`,
        title: m.title,
        dueDate: m.dueDate || format(new Date(Date.now() + (idx + 1) * 14 * 24 * 3600 * 1000), "yyyy-MM-dd"),
        completed: false,
      })),
    };

    setGoals((prev) => [newGoal, ...prev]);

    addNotificationSafe({
      id: `notif-goal-${Date.now()}`,
      title: "Roadmap Goal Integrated",
      message: `Goal "${newGoal.title}" created with ${newGoal.milestones.length} milestones.`,
      timestamp: "Just now",
      type: "system",
      read: false,
    });

    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-ack-g-${Date.now()}`,
        sender: "assistant",
        text: `✓ Goal "${newGoal.title}" and its ${newGoal.milestones.length} milestones have been integrated into your Roadmap!`,
        timestamp: "Just now",
      },
    ]);
  };

  const resetDemoData = (targetRole?: UserRole) => {
    const roleToReset = targetRole || role;
    if (authUser?.id) {
      // Authenticated user reset: wipe user's workspace to clean empty baseline
      dataService.resetUserWorkspace(authUser.id).catch((err) =>
        console.warn("Failed to reset remote workspace:", err)
      );
      const clean = resetStoredStateToClean(roleToReset, authUser.id);
      setRoleState(clean.role);
      setProfile(clean.profile);
      setTasks([]);
      setCalendarEvents([]);
      setGoals([]);
      setHabits([]);
      setHabitTransitions([]);
      setFocusSessions([]);
      setNotifications([]);
      setEcoEntries([]);
      setSelectedDate(new Date());
      return;
    }
    const fresh = resetStoredStateToDemo(roleToReset);
    setRoleState(fresh.role);
    setProfile(fresh.profile);
    setTasks(fresh.tasks);
    setCalendarEvents(fresh.calendarEvents);
    setGoals(fresh.goals);
    setHabits(fresh.habits);
    setHabitTransitions(fresh.habitTransitions);
    setFocusSessions(fresh.focusSessions);
    setChatMessages(fresh.chatMessages);
    setNotifications(fresh.notifications);
    setEcoEntries(fresh.ecoEntries);
    setSelectedDate(new Date(`${fresh.selectedDateStr}T00:00:00`));
  };

  const exportData = () => {
    return exportStateAsJSON({
      version: KRONOS_STORAGE_VERSION,
      role,
      profile,
      tasks,
      calendarEvents,
      goals,
      habits,
      habitTransitions,
      focusSessions,
      chatMessages,
      notifications,
      ecoEntries,
      selectedDateStr: format(selectedDate, "yyyy-MM-dd"),
      lastSavedTimestamp: Date.now(),
    });
  };

  const importData = (jsonStr: string) => {
    const validated = importStateFromJSON(jsonStr);
    if (!validated) return false;
    setRoleState(validated.role);
    setProfile(validated.profile);
    setTasks(validated.tasks);
    setCalendarEvents(validated.calendarEvents);
    setGoals(validated.goals);
    setHabits(validated.habits);
    setHabitTransitions(validated.habitTransitions || []);
    setFocusSessions(validated.focusSessions || []);
    setChatMessages(validated.chatMessages || []);
    setNotifications(validated.notifications || []);
    setEcoEntries(validated.ecoEntries || []);
    setSelectedDate(new Date(`${validated.selectedDateStr}T00:00:00`));
    return true;
  };

  const restoreBackup = () => {
    const restored = restorePreMigrationBackup();
    if (!restored) return false;
    setRoleState(restored.role);
    setProfile(restored.profile);
    setTasks(restored.tasks);
    setCalendarEvents(restored.calendarEvents);
    setGoals(restored.goals);
    setHabits(restored.habits);
    setHabitTransitions(restored.habitTransitions || []);
    setFocusSessions(restored.focusSessions || []);
    setChatMessages(restored.chatMessages || []);
    setNotifications(restored.notifications || []);
    setEcoEntries(restored.ecoEntries || []);
    setSelectedDate(new Date(`${restored.selectedDateStr}T00:00:00`));
    return true;
  };

  const sendChatMessage = async (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: "Just now",
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsAiThinking(true);

    try {
      const activeDateStr = format(selectedDate, "yyyy-MM-dd");

      // Prepare context for AI Route Handler using active date commitments
      const fixedCommitments = calendarEvents
        .filter((e) => e.isFixed || e.date === activeDateStr)
        .map((e) => ({
          title: e.title,
          startTime: e.startTime,
          endTime: e.endTime,
          isFixed: true,
        }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userText,
          context: {
            profile,
            existingTasks: tasks.filter((t) => t.scheduledDate === activeDateStr),
            fixedCommitments,
            currentDate: activeDateStr,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const plan = data.plan;

        // If tasks were extracted, run deterministic constraint solver
        let verifiedTasks = plan.extractedTasks;
        if (verifiedTasks && verifiedTasks.length > 0) {
          try {
            const schedRes = await fetch("/api/schedule/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                date: activeDateStr,
                wakeTime: profile.wakeTime,
                sleepTime: profile.sleepTime,
                mostProductivePeriod: profile.mostProductivePeriod,
                preferredFocusDuration: profile.preferredFocusDuration,
                preferredBreakDuration: profile.preferredBreakDuration,
                fixedCommitments: calendarEvents
                  .filter((c) => c.date === activeDateStr || c.isFixed)
                  .map((c) => ({
                    id: c.id,
                    title: c.title,
                    startTime: c.startTime,
                    endTime: c.endTime,
                  })),
                tasksToSchedule: verifiedTasks.map((vt: any, idx: number) => ({
                  id: `candidate-${idx}`,
                  title: vt.title,
                  category: vt.category,
                  priority: vt.priority,
                  estimatedDuration: vt.estimatedDuration,
                  isFixed: vt.isFixed,
                  energyLevel: vt.energyLevel || "high",
                })),
              }),
            });

            if (schedRes.ok) {
              const schedData = await schedRes.json();
              if (schedData.result?.scheduledPlacements?.length > 0) {
                // Update verified task start and end times from deterministic scheduler
                verifiedTasks = schedData.result.scheduledPlacements.map((p: any) => ({
                  ...p.task,
                  startTime: p.startTime,
                  endTime: p.endTime,
                }));
              }
            }
          } catch (schedErr) {
            console.warn("Deterministic scheduler client notice:", schedErr);
          }
        }

        setIsAiThinking(false);
        setChatMessages((prev) => [
          ...prev,
          {
            id: `msg-ai-${Date.now()}`,
            sender: "assistant",
            text: plan.explanation,
            timestamp: "Just now",
            suggestedTasks: verifiedTasks && verifiedTasks.length > 0 ? verifiedTasks : undefined,
            suggestedHabit: plan.suggestedHabit,
            suggestedGoal: plan.suggestedGoal,
            actions: plan.clarificationOptions?.map((opt: string) => ({
              label: opt,
              payload: opt,
            })),
          },
        ]);
        return;
      }
    } catch (err) {
      console.warn("AI API request fallback to local simulation:", err);
    }

    // Fallback simulation if route call fails or during static build
    setIsAiThinking(false);
    const lower = userText.toLowerCase().trim();
    let replyText = "";
    let suggestions: Partial<Task>[] | undefined;
    let habitSuggestion: ChatMessage["suggestedHabit"] | undefined;
    let goalSuggestion: ChatMessage["suggestedGoal"] | undefined;
    let fallbackActions: ChatMessage["actions"] | undefined;

    const isQuestionOrGreeting =
      lower.includes("what are you doing") ||
      lower.includes("who are you") ||
      lower.includes("what can you do") ||
      lower.includes("hello") ||
      lower.includes("hi") ||
      lower.includes("hey") ||
      lower.includes("how are you");

    if (lower.includes("create habit") || lower.includes("build habit") || lower.includes("habit of")) {
      replyText = "Here is a behavioral habit protocol anchored to your routine using BJ Fogg Tiny Habits and the 2-Minute Rule:";
      habitSuggestion = {
        title: "Daily Focused Reading",
        cue: "After morning coffee and sitting at desk",
        category: "learning",
        frequency: "daily",
        minimumVersion: "Read 2 pages minimum before opening email",
        targetDurationMinutes: 15,
      };
    } else if (lower.includes("goal") || lower.includes("roadmap") || lower.includes("break down")) {
      replyText = "Here is a structured milestone decomposition roadmap for your objective:";
      goalSuggestion = {
        title: userText.replace(/^(create goal|break down goal|plan goal)\s+/i, "") || "Key Project Horizon",
        category: "academic",
        priority: "high",
        targetTimeline: "Next 60 Days",
        milestones: [
          { title: "Phase 1: Research, scoping & baseline setup" },
          { title: "Phase 2: Core development & prototype execution" },
          { title: "Phase 3: Verification, testing & demonstration" },
        ],
      };
    } else if (isQuestionOrGreeting) {
      replyText =
        "I'm Kronos AI, your personal planning assistant! I help you organize tasks around your classes, meetings, and energy rhythms. Tell me what you'd like to accomplish today (e.g., '2 assignments, gym at 4, study economics') and I'll schedule them for you!";
      suggestions = undefined;
    } else if (lower.includes("blender") || lower.includes("assignment") || lower.includes("gym") || lower.includes("economics")) {
      replyText =
        "I understand your goal! You have fixed commitments earlier today. I found optimal windows: 60m Economics Problem Set at 14:00, 50m Gym workout at 16:00, and 45m Blender modeling at 18:00. This preserves your sleep routine.";
      suggestions = [
        {
          title: "Complete Economics Problem Set #3",
          category: "study",
          priority: "urgent",
          estimatedDuration: 60,
          startTime: "14:00",
          endTime: "15:00",
          tag: "ECON 201",
        },
        {
          title: "Conditioning & Gym Session",
          category: "personal",
          priority: "medium",
          estimatedDuration: 50,
          startTime: "16:00",
          endTime: "16:50",
          tag: "Wellness",
        },
        {
          title: "Blender 3D Modeling Practice",
          category: "personal",
          priority: "low",
          estimatedDuration: 45,
          startTime: "18:00",
          endTime: "18:45",
          tag: "Creative",
        },
      ];
    } else if (
      lower.includes("study") ||
      lower.includes("work") ||
      lower.includes("read") ||
      lower.includes("write") ||
      lower.includes("code") ||
      lower.includes("meeting") ||
      lower.includes("clean") ||
      lower.includes("exercise")
    ) {
      const cleanTitle = userText.replace(/^(i need to|i want to|please schedule|can you schedule)\s+/i, "");
      replyText = `Understood: "${cleanTitle}". I've scheduled a focus block aligned with your open windows and energy rhythm.`;
      suggestions = [
        {
          title: cleanTitle.length > 35 ? cleanTitle.slice(0, 32) + "..." : cleanTitle,
          category: role === "student" ? "study" : "work",
          priority: "medium",
          estimatedDuration: profile.preferredFocusDuration || 45,
          tag: "Focus Block",
        },
      ];
    } else {
      replyText = `I'm here to help plan your schedule. I didn't detect any specific tasks in your message. Tell me what you'd like to work on today (e.g., "Study for 1 hour" or "Prepare presentation") and I'll fit it in!`;
      suggestions = undefined;
    }

    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-ai-${Date.now()}`,
        sender: "assistant",
        text: replyText,
        timestamp: "Just now",
        suggestedTasks: suggestions,
        suggestedHabit: habitSuggestion,
        suggestedGoal: goalSuggestion,
        actions: fallbackActions,
      },
    ]);
  };

  // Sprint 2 Handlers
  const toggleMilestone = (goalId: string, milestoneId: string) => {
    let nextCompleted = false;
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const updatedMilestones = g.milestones.map((m) => {
          if (m.id === milestoneId) {
            nextCompleted = !m.completed;
            return { ...m, completed: nextCompleted };
          }
          return m;
        });
        const completedCount = updatedMilestones.filter((m) => m.completed).length;
        const progress = Math.round((completedCount / updatedMilestones.length) * 100);
        return {
          ...g,
          milestones: updatedMilestones,
          progress,
        };
      })
    );

    if (authUser?.id) {
      dataService
        .updateMilestone(authUser.id, milestoneId, nextCompleted)
        .catch((err: any) => console.warn("Failed to persist milestone update to Supabase:", err));
    }
  };

  const addGoal = (newGoal: Omit<Goal, "id" | "progress">) => {
    const goal: Goal = {
      ...newGoal,
      id: `goal-${Date.now()}`,
      progress: 0,
    };
    setGoals((prev) => [goal, ...prev]);

    if (authUser?.id) {
      dataService
        .createGoal(authUser.id, goal)
        .then((saved) => {
          if (saved?.id && saved.id !== goal.id) {
            setGoals((prev) => prev.map((g) => (g.id === goal.id ? { ...g, id: saved.id } : g)));
          }
        })
        .catch((err) => console.warn("Failed to persist goal to Supabase:", err));
    }

    addNotificationSafe({
      id: `notif-goal-${Date.now()}`,
      title: "New Strategic Goal Added",
      message: `Goal "${goal.title}" created with target ${goal.targetDate}.`,
      timestamp: "Just now",
      type: "system",
      read: false,
    });
  };

  const updateGoalRoadmap = (goalId: string, milestones: Milestone[]) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const completedCount = milestones.filter((m) => m.completed).length;
        const progress = Math.round((completedCount / milestones.length) * 100);
        return {
          ...g,
          milestones,
          progress,
        };
      })
    );
  };

  const addMilestoneTaskToAgenda = (task: Omit<Task, "id">) => {
    const created: Task = {
      ...task,
      id: `task-ms-${Date.now()}`,
    };
    setTasks((prev) => [created, ...prev]);

    if (authUser?.id) {
      dataService
        .createTask(authUser.id, created)
        .then((saved) => {
          if (saved?.id && saved.id !== created.id) {
            setTasks((prev) => prev.map((t) => (t.id === created.id ? { ...t, id: saved.id } : t)));
          }
        })
        .catch((err) => console.warn("Failed to persist milestone task to Supabase:", err));
    }

    addNotificationSafe({
      id: `notif-task-${Date.now()}`,
      title: "Milestone Task Scheduled",
      message: `"${task.title}" has been placed into today's agenda.`,
      timestamp: "Just now",
      type: "task",
      read: false,
    });
  };

  const logFocusSession = (
    habitId: string | null,
    durationMinutes: number,
    flowState: FocusSessionLog["flowState"],
    reflectionNotes?: string
  ) => {
    logDetailedFocusSession({
      habitId: habitId || undefined,
      durationMinutes,
      flowState,
      reflectionNotes,
    });
  };

  const logDetailedFocusSession = (session: Omit<FocusSessionLog, "id" | "completedAt">) => {
    const newSession: FocusSessionLog = {
      ...session,
      id: `flog-${Date.now()}`,
      completedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setFocusSessions((prev) => [newSession, ...prev]);

    if (authUser?.id) {
      dataService
        .logFocusSession(authUser.id, newSession)
        .catch((err) => console.warn("Failed to persist focus session to Supabase:", err));
    }

    if (session.habitId) {
      setHabits((prev) =>
        prev.map((h) => {
          if (h.id === session.habitId) {
            return {
              ...h,
              currentStreak: h.currentStreak + 1,
              automaticityScore: Math.min(100, h.automaticityScore + 5),
              completedToday: true,
              recentHistory: [true, ...(h.recentHistory?.slice(0, 6) || [])],
            };
          }
          return h;
        })
      );
    }

    addNotificationSafe({
      id: `notif-focus-${Date.now()}`,
      title: "Flow Session Logged",
      message: `Completed ${session.durationMinutes}m focus block (${session.flowState.toUpperCase()} state).`,
      timestamp: "Just now",
      type: "habit",
      read: false,
    });
  };

  const addHabit = (newHabit: Omit<Habit, "id" | "currentStreak" | "bestStreak" | "completedToday" | "automaticityScore">) => {
    const created: Habit = {
      ...newHabit,
      id: `habit-${Date.now()}`,
      currentStreak: 0,
      bestStreak: 0,
      completedToday: false,
      weeklyCompletionRate: 0,
      cueConsistencyScore: 100,
      selfReportedAutomaticity: 1,
      automaticityScore: 0,
      recentHistory: [false, false, false, false, false, false, false],
    };
    setHabits((prev) => [created, ...prev]);

    if (authUser?.id) {
      dataService
        .createHabit(authUser.id, created)
        .then((saved) => {
          if (saved?.id && saved.id !== created.id) {
            setHabits((prev) => prev.map((h) => (h.id === created.id ? { ...h, id: saved.id } : h)));
          }
        })
        .catch((err) => console.warn("Failed to persist habit to Supabase:", err));
    }
  };

  const addHabitTransition = (newTransition: Omit<HabitResetTransition, "id">) => {
    const created: HabitResetTransition = {
      ...newTransition,
      id: `trans-${Date.now()}`,
    };
    setHabitTransitions((prev) => [created, ...prev]);

    // Materialize target habits directly into the core habits collection
    if (newTransition.targetHabits && newTransition.targetHabits.length > 0) {
      setHabits((prevHabits) => {
        const toAdd: Habit[] = [];
        newTransition.targetHabits.forEach((th, idx) => {
          const exists = prevHabits.some(
            (h) => h.title.trim().toLowerCase() === th.habitName.trim().toLowerCase()
          );
          if (!exists) {
            toAdd.push({
              id: `habit-trans-${Date.now()}-${idx}`,
              title: th.habitName,
              cue: th.newAnchorCue,
              minimumVersion: th.minimumVersion,
              context: `Transition: ${newTransition.title}`,
              category: "learning",
              frequency: "daily",
              targetDurationMinutes: 20,
              currentStreak: 0,
              bestStreak: 0,
              completedToday: false,
              weeklyCompletionRate: 0,
              cueConsistencyScore: 100,
              selfReportedAutomaticity: 1,
              automaticityScore: 25,
              totalCompletions: 0,
              recentHistory: [false, false, false, false, false, false, false],
            });
          }
        });
        return toAdd.length > 0 ? [...toAdd, ...prevHabits] : prevHabits;
      });
    }
  };

  // Persistent Timer Methods
  const startFocusTimer = (config?: {
    totalMinutes?: number;
    taskTitle?: string;
    habitId?: string;
    perceivedChallenge?: number;
    perceivedSkill?: number;
    sessionGoal?: string;
    completionCriteria?: string;
  }) => {
    setTimerState((prev) => {
      const mins = config?.totalMinutes ?? prev.totalMinutes;
      const secs = mins * 60;
      return {
        ...prev,
        taskTitle: config?.taskTitle ?? prev.taskTitle,
        habitId: config?.habitId !== undefined ? config.habitId : prev.habitId,
        totalMinutes: mins,
        secondsLeft: secs,
        isRunning: true,
        interruptionsCount: 0,
        targetEndTimestamp: Date.now() + secs * 1000,
        perceivedChallenge: config?.perceivedChallenge ?? prev.perceivedChallenge,
        perceivedSkill: config?.perceivedSkill ?? prev.perceivedSkill,
        sessionGoal: config?.sessionGoal ?? prev.sessionGoal,
        completionCriteria: config?.completionCriteria ?? prev.completionCriteria,
        sessionCompleted: false,
      };
    });
  };

  const pauseFocusTimer = () => {
    setTimerState((prev) => {
      if (!prev.isRunning) return prev;
      const remaining = prev.targetEndTimestamp
        ? Math.max(0, Math.ceil((prev.targetEndTimestamp - Date.now()) / 1000))
        : prev.secondsLeft;
      return {
        ...prev,
        isRunning: false,
        secondsLeft: remaining,
        targetEndTimestamp: undefined,
      };
    });
  };

  const resumeFocusTimer = () => {
    setTimerState((prev) => {
      if (prev.isRunning || prev.secondsLeft <= 0) return prev;
      return {
        ...prev,
        isRunning: true,
        targetEndTimestamp: Date.now() + prev.secondsLeft * 1000,
      };
    });
  };

  const resetFocusTimer = (mins?: number) => {
    setTimerState((prev) => {
      const m = mins ?? prev.totalMinutes;
      return {
        ...prev,
        totalMinutes: m,
        secondsLeft: m * 60,
        isRunning: false,
        interruptionsCount: 0,
        targetEndTimestamp: undefined,
        sessionCompleted: false,
      };
    });
  };

  const logTimerInterruption = () => {
    setTimerState((prev) => ({
      ...prev,
      interruptionsCount: prev.interruptionsCount + 1,
    }));
  };

  const finishTimerEarly = () => {
    setTimerState((prev) => {
      const remaining = prev.targetEndTimestamp
        ? Math.max(0, Math.ceil((prev.targetEndTimestamp - Date.now()) / 1000))
        : prev.secondsLeft;
      return {
        ...prev,
        isRunning: false,
        secondsLeft: remaining,
        targetEndTimestamp: undefined,
        sessionCompleted: true,
      };
    });
  };

  const completeTimerSession = (reflection: {
    flowState: FocusSessionLog["flowState"];
    absorptionRating?: number;
    concentrationRating?: number;
    perceivedControl?: number;
    enjoymentRating?: number;
    timeDistortion?: "faster" | "normal" | "slower";
    reflectionNotes?: string;
  }) => {
    const elapsedSecs = Math.max(
      60,
      timerState.totalMinutes * 60 - timerState.secondsLeft
    );
    const duration = Math.max(1, Math.round(elapsedSecs / 60));

    logDetailedFocusSession({
      taskTitle: timerState.taskTitle || undefined,
      habitId: timerState.habitId || undefined,
      durationMinutes: duration,
      perceivedChallenge: timerState.perceivedChallenge,
      perceivedSkill: timerState.perceivedSkill,
      sessionGoal: timerState.sessionGoal || undefined,
      completionCriteria: timerState.completionCriteria || undefined,
      interruptionsCount: timerState.interruptionsCount,
      flowState: reflection.flowState,
      absorptionRating: reflection.absorptionRating,
      concentrationRating: reflection.concentrationRating,
      perceivedControl: reflection.perceivedControl,
      enjoymentRating: reflection.enjoymentRating,
      timeDistortion: reflection.timeDistortion,
      reflectionNotes: reflection.reflectionNotes?.trim() || undefined,
    });

    setTimerState((prev) => ({
      ...prev,
      secondsLeft: prev.totalMinutes * 60,
      isRunning: false,
      interruptionsCount: 0,
      targetEndTimestamp: undefined,
      sessionCompleted: false,
    }));
  };

  const dismissTimerCompletion = () => {
    setTimerState((prev) => ({
      ...prev,
      secondsLeft: prev.totalMinutes * 60,
      isRunning: false,
      targetEndTimestamp: undefined,
      sessionCompleted: false,
    }));
  };

  const updateTimerChallengeSkill = (
    challenge: number,
    skill: number,
    goal?: string,
    criteria?: string,
    taskTitle?: string,
    habitId?: string
  ) => {
    setTimerState((prev) => ({
      ...prev,
      perceivedChallenge: challenge,
      perceivedSkill: skill,
      sessionGoal: goal !== undefined ? goal : prev.sessionGoal,
      completionCriteria: criteria !== undefined ? criteria : prev.completionCriteria,
      taskTitle: taskTitle !== undefined ? taskTitle : prev.taskTitle,
      habitId: habitId !== undefined ? habitId : prev.habitId,
    }));
  };

  const updateHabitAutomaticity = (habitId: string, delta: number) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          return {
            ...h,
            automaticityScore: Math.max(0, Math.min(100, h.automaticityScore + delta)),
          };
        }
        return h;
      })
    );
  };

  const setAutoSyncInterval = useCallback((newInterval: AutoSyncInterval) => {
    setAutoSyncIntervalState(newInterval);
    if (typeof window !== "undefined") {
      localStorage.setItem(getAutoSyncKey(authUser?.id), newInterval);
      localStorage.setItem(AUTO_SYNC_STORAGE_KEY, newInterval);
    }
  }, [authUser?.id]);

  const triggerCalendarSync = useCallback(async (forceFull: boolean = false, isBackground: boolean = false) => {
    setSyncStatus("syncing");
    try {
      const storedToken =
        typeof window !== "undefined"
          ? localStorage.getItem("kronos_google_provider_token")
          : null;

      const res = await fetch("/api/calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: forceFull ? "reset_and_sync" : "sync",
          accessToken: storedToken || undefined,
          useMock: false,
        }),
        signal: AbortSignal.timeout(25000),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSyncStatus("synced");
        const nowMs = Date.now();
        setLastSyncTimestampMs(nowMs);
        setLastSyncTime(new Date(nowMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        if (typeof window !== "undefined") {
          localStorage.setItem(getLastSyncTsKey(authUser?.id), String(nowMs));
          localStorage.setItem(LAST_SYNC_TS_KEY, String(nowMs));
        }

        // Incorporate real events & tasks fetched from Google into active state
        if (authUser?.id) {
          const [remoteEvents, remoteTasks] = await Promise.all([
            dataService.getCalendarEvents(authUser.id),
            dataService.getTasks(authUser.id),
          ]);
          setCalendarEvents(remoteEvents);
          setTasks(remoteTasks);
        } else if (data.result?.added && Array.isArray(data.result.added) && data.result.added.length > 0) {
          setCalendarEvents((prev) => {
            const existingIds = new Set(prev.map((e) => e.id));
            const newOnes = data.result.added.filter((e: CalendarEvent) => !existingIds.has(e.id));
            return [...prev, ...newOnes];
          });
        }

        const eventsCount = data.calendarEventsImported ?? data.result?.added?.length ?? 0;
        const tasksCount = data.googleTasksImported ?? 0;
        const pushedCount = data.localTasksPushed ?? 0;

        // Background automatic sync runs silently to protect user focus; manual or reset sync surfaces drawer card
        if (!isBackground && (eventsCount > 0 || tasksCount > 0 || pushedCount > 0 || forceFull)) {
          addNotificationSafe({
            id: `notif-sync-${Date.now()}`,
            title: forceFull ? "Google Integration Reset & Re-synced" : "Google Calendar & Tasks Synchronized",
            message: `Synchronized ${eventsCount} calendar events (including birthdays & custom calendars), ${tasksCount} Google tasks, and pushed ${pushedCount} Kronos activities to Google.`,
            timestamp: "Just now",
            type: "calendar",
            read: false,
          });
        }
        return { success: true, count: eventsCount, tasksCount, pushedCount };
      } else {
        const isNotConnected =
          data.error?.toLowerCase().includes("no active") ||
          data.error?.toLowerCase().includes("not connected");
        setSyncStatus(isNotConnected ? "offline" : "error");

        // Only add notification to the drawer if the user explicitly requested a sync
        if (forceFull) {
          addNotificationSafe({
            id: `notif-sync-err-${Date.now()}`,
            title: "Calendar Sync Notice",
            message: data.error || "Google Calendar synchronization failed.",
            timestamp: "Just now",
            type: "calendar",
            read: false,
          });
        }
        return { success: false, error: data.error };
      }
    } catch (err: any) {
      console.warn("[triggerCalendarSync] Error during sync:", err);
      const isTimeout = err.name === "TimeoutError" || err.message?.includes("aborted");
      setSyncStatus("error");
      if (forceFull) {
        addNotificationSafe({
          id: `notif-sync-err-${Date.now()}`,
          title: "Calendar Sync Notice",
          message: isTimeout
            ? "Calendar synchronization timed out after 25 seconds. Please try again or click Reset & Re-sync."
            : err.message || "Google Calendar synchronization failed.",
          timestamp: "Just now",
          type: "calendar",
          read: false,
        });
      }
      return { success: false, error: err.message };
    }
  }, [authUser?.id, addNotificationSafe]);

  // Continuous Background Auto-Sync Engine
  // Periodically evaluates elapsed time against configured interval (15m to 1w)
  useEffect(() => {
    if (isAuthLoading) return;
    if (autoSyncInterval === "manual") return;

    const intervalMs = AUTO_SYNC_MS_MAP[autoSyncInterval];
    if (!intervalMs || intervalMs === Infinity) return;

    const checkAndTriggerAutoSync = async () => {
      // Skip if currently syncing
      if (syncStatus === "syncing") return;

      // Skip if in persistent error/reauth state
      if (syncStatus === "error") return;

      // Verify connection exists
      const hasAuth = !!authUser?.id;
      const hasToken =
        typeof window !== "undefined" &&
        !!localStorage.getItem("kronos_google_provider_token");
      if (!hasAuth && !hasToken) return;

      const now = Date.now();
      const lastMs = lastSyncTimestampMs || 0;
      const elapsed = now - lastMs;

      if (elapsed >= intervalMs) {
        console.log(`[Auto-Sync] Cadence '${autoSyncInterval}' elapsed (${Math.round(elapsed / 1000)}s >= ${intervalMs / 1000}s). Running silent sync...`);
        try {
          await triggerCalendarSync(false, true);
        } catch (err) {
          console.warn("[Auto-Sync] Background sync notice:", err);
        }
      }
    };

    // Initial delayed tick (3 seconds after mount)
    const initialTimer = setTimeout(() => {
      checkAndTriggerAutoSync();
    }, 3000);

    // Periodic evaluation timer (checks every 30 seconds)
    const periodicTimer = setInterval(() => {
      checkAndTriggerAutoSync();
    }, 30000);

    // Tab visibility & network reconnection triggers
    const handleVisibilityOrOnline = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible" && navigator.onLine) {
        checkAndTriggerAutoSync();
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityOrOnline);
    }
    if (typeof window !== "undefined") {
      window.addEventListener("online", handleVisibilityOrOnline);
    }

    return () => {
      clearTimeout(initialTimer);
      clearInterval(periodicTimer);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityOrOnline);
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleVisibilityOrOnline);
      }
    };
  }, [
    isAuthLoading,
    autoSyncInterval,
    syncStatus,
    authUser?.id,
    lastSyncTimestampMs,
    triggerCalendarSync,
  ]);

  const simulateExternalCalendarConflict = async () => {
    try {
      const res = await fetch("/api/calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "simulate_conflict", useMock: true }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.conflict) {
          setSyncConflicts((prev) => [data.conflict, ...prev.filter((c) => c.id !== data.conflict.id)]);
          setSyncStatus("conflict");
          addNotificationSafe({
            id: `notif-conflict-${Date.now()}`,
            title: "External Calendar Conflict Detected",
            message: data.conflict.description,
            timestamp: "Just now",
            type: "calendar",
            read: false,
          });
        }
      }
    } catch (err) {
      console.warn("Failed to simulate external conflict:", err);
    }
  };

  const resolveSyncConflict = async (conflictId: string, resolution: "keep_local" | "accept_remote") => {
    try {
      await fetch("/api/calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resolve", conflictId, resolution, useMock: true }),
      });

      if (resolution === "accept_remote") {
        // Shift flexible study task to accommodate meeting
        setTasks((prev) =>
          prev.map((t) => {
            if (t.startTime === "14:00" && !t.isFixed) {
              return { ...t, startTime: "15:30", endTime: "16:45" };
            }
            return t;
          })
        );
      }

      setSyncConflicts((prev) => prev.filter((c) => c.id !== conflictId));
      setSyncStatus("synced");
      addNotificationSafe({
        id: `notif-resolved-${Date.now()}`,
        title: "Calendar Conflict Resolved",
        message:
          resolution === "keep_local"
            ? "Preserved local focus block; remote invitation flagged as tentative."
            : "Applied remote meeting and shifted study block to 15:30.",
        timestamp: "Just now",
        type: "calendar",
        read: false,
      });
    } catch (err) {
      console.warn("Failed to resolve conflict:", err);
    }
  };

  const logEcoActivity = (activity: EcoLogEntry["activity"], minutes: number) => {
    const factor = ECO_ACTIVITY_FACTORS[activity];
    const co2SavedGrams = (factor?.co2PerUnit || 20) * minutes;
    const newEntry: EcoLogEntry = {
      id: `eco-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      activity,
      minutes,
      co2SavedGrams,
    };

    setEcoEntries((prev) => [newEntry, ...prev]);
    addNotificationSafe({
      id: `notif-eco-${Date.now()}`,
      title: "Eco Impact Recorded 🌱",
      message: `Logged ${minutes}m of ${factor?.name || activity}. Saved ~${co2SavedGrams}g CO2!`,
      timestamp: "Just now",
      type: "eco",
      read: false,
    });
  };

  return (
    <DemoContext.Provider
      value={{
        role,
        setRole,
        profile,
        tasks,
        calendarEvents,
        goals,
        habits,
        notifications,
        selectedDate,
        setSelectedDate,
        referenceDate,
        toggleTaskStatus,
        addTask,
        deleteTask,
        updateTaskSchedule,
        toggleHabit,
        addHabit,
        setHabitSelfReportedAutomaticity,
        markNotificationRead,
        dismissNotification,
        clearNotifications,
        chatMessages,
        sendChatMessage,
        isAiThinking,
        applySuggestedTasks,
        applySuggestedHabit,
        applySuggestedGoal,
        isHydrated,
        isQuickTaskOpen,
        openQuickTask,
        closeQuickTask,
        resetDemoData,
        exportData,
        importData,
        restoreBackup,
        onboardingDraft,
        setOnboardingDraft,
        completeOnboarding,
        toggleMilestone,
        addGoal,
        updateGoalRoadmap,
        addMilestoneTaskToAgenda,
        focusSessions,
        logFocusSession,
        logDetailedFocusSession,
        updateHabitAutomaticity,
        habitTransitions,
        addHabitTransition,
        timerState,
        startFocusTimer,
        pauseFocusTimer,
        resumeFocusTimer,
        resetFocusTimer,
        logTimerInterruption,
        finishTimerEarly,
        completeTimerSession,
        dismissTimerCompletion,
        updateTimerChallengeSkill,
        syncStatus,
        lastSyncTime,
        lastSyncTimestampMs,
        autoSyncInterval,
        setAutoSyncInterval,
        syncConflicts,
        triggerCalendarSync,
        simulateExternalCalendarConflict,
        resolveSyncConflict,
        ecoEntries,
        logEcoActivity,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemo must be used within a DemoProvider");
  }
  return context;
}
