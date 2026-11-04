"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
} from "@/types";
import { CalendarSyncStatus } from "@/lib/calendar/types";
import { sampleEcoEntries, ECO_ACTIVITY_FACTORS } from "@/lib/sustainability/eco-calculator";
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
  studentOnboardingPreset,
} from "@/lib/mock/demo-data";

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
  toggleTaskStatus: (id: string) => void;
  addTask: (task: Omit<Task, "id">) => void;
  deleteTask: (id: string) => void;
  updateTaskSchedule: (placements: { id: string; startTime: string; endTime: string }[]) => void;
  toggleHabit: (id: string) => void;
  addHabit: (habit: Omit<Habit, "id" | "currentStreak" | "bestStreak" | "completedToday" | "automaticityScore">) => void;
  markNotificationRead: (id: string) => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (content: string) => void;
  isAiThinking: boolean;
  applySuggestedTasks: (suggested: Partial<Task>[]) => void;
  onboardingDraft: OnboardingFormData;
  setOnboardingDraft: React.Dispatch<React.SetStateAction<OnboardingFormData>>;
  completeOnboarding: (data: OnboardingFormData) => void;

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
  syncConflicts: SyncConflict[];
  triggerCalendarSync: () => Promise<void>;
  simulateExternalCalendarConflict: () => Promise<void>;
  resolveSyncConflict: (conflictId: string, resolution: "keep_local" | "accept_remote") => Promise<void>;

  ecoEntries: EcoLogEntry[];
  logEcoActivity: (activity: EcoLogEntry["activity"], minutes: number) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("student");
  const [profile, setProfile] = useState<UserProfile>(studentProfile);
  const [tasks, setTasks] = useState<Task[]>(initialStudentTasks);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(studentCalendarEvents);
  const [goals, setGoals] = useState<Goal[]>(studentGoals);
  const [habits, setHabits] = useState<Habit[]>(studentHabits);
  const [notifications, setNotifications] = useState<NotificationItem[]>(sampleNotifications);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date("2026-11-02T00:00:00"));
  const [isAiThinking, setIsAiThinking] = useState(false);

  useEffect(() => {
    // Sync to current client date on mount
    setSelectedDate(new Date());
  }, []);

  const initialWelcomeMessage: ChatMessage = {
    id: "msg-welcome",
    sender: "assistant",
    text: "Good morning, Aria! I'm ready to organize your day. What would you like to accomplish today? You can mention classes, study goals, workouts, or personal tasks.",
    timestamp: "Just now",
  };

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([initialWelcomeMessage]);

  const [onboardingDraft, setOnboardingDraft] = useState<OnboardingFormData>(studentOnboardingPreset);

  // Sprint 2: Productivity & Integrations State
  const [focusSessions, setFocusSessions] = useState<FocusSessionLog[]>([
    {
      id: "flog-1",
      habitId: "h1",
      durationMinutes: 50,
      completedAt: "2026-11-01 16:30",
      flowState: "flow",
      reflectionNotes: "Deep immersion while reviewing Stanford CS problem set. Zero phone interruptions.",
    },
    {
      id: "flog-2",
      durationMinutes: 25,
      completedAt: "2026-11-02 09:45",
      flowState: "balanced",
      reflectionNotes: "Clean progress on weekly planning and email inbox zero.",
    },
  ]);

  const [syncStatus, setSyncStatus] = useState<CalendarSyncStatus>("synced");
  const [lastSyncTime, setLastSyncTime] = useState<string | null>("Just now");
  const [syncConflicts, setSyncConflicts] = useState<SyncConflict[]>([]);
  const [ecoEntries, setEcoEntries] = useState<EcoLogEntry[]>(sampleEcoEntries);
  const [habitTransitions, setHabitTransitions] = useState<HabitResetTransition[]>(studentHabitTransitions);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (newRole === "student") {
      setProfile(studentProfile);
      setTasks(initialStudentTasks);
      setCalendarEvents(studentCalendarEvents);
      setGoals(studentGoals);
      setHabits(studentHabits);
      setHabitTransitions(studentHabitTransitions);
      setChatMessages([
        {
          id: "msg-welcome-student",
          sender: "assistant",
          text: "Good morning, Aria! I have your Stanford timetable and deadlines ready. What would you like to accomplish today?",
          timestamp: "Just now",
        },
      ]);
    } else if (newRole === "professional") {
      setProfile(professionalProfile);
      setTasks(initialProfessionalTasks);
      setCalendarEvents(professionalCalendarEvents);
      setGoals(professionalGoals);
      setHabits(professionalHabits);
      setHabitTransitions(professionalHabitTransitions);
      setChatMessages([
        {
          id: "msg-welcome-pro",
          sender: "assistant",
          text: "Good morning, Marcus! Morning standup is scheduled at 9:30 AM. What are your key focus outcomes for today?",
          timestamp: "Just now",
        },
      ]);
    } else {
      setProfile(dualProfile);
      setTasks(initialDualTasks);
      setCalendarEvents(dualCalendarEvents);
      setGoals(dualGoals);
      setHabits(dualHabits);
      setHabitTransitions(dualHabitTransitions);
      setChatMessages([
        {
          id: "msg-welcome-dual",
          sender: "assistant",
          text: "Good morning, Elena! Both your Synthetix engineering blocks and UC Berkeley coursework are aligned. Ready to plan your day?",
          timestamp: "Just now",
        },
      ]);
    }
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
    setNotifications((prev) => [
      {
        id: `notif-onb-${Date.now()}`,
        title: "Personalized Schedule Activated",
        message: `Welcome, ${data.name}! Your routines, timetable, and focus preferences have been successfully loaded.`,
        timestamp: "Just now",
        type: "system",
        read: false,
      },
      ...prev,
    ]);
  };

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === "completed" ? "todo" : "completed";
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const addTask = (newTask: Omit<Task, "id">) => {
    const created: Task = {
      ...newTask,
      id: `task-custom-${Date.now()}`,
    };
    setTasks((prev) => [created, ...prev]);
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
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
  };

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const nextCompleted = !h.completedToday;
          return {
            ...h,
            completedToday: nextCompleted,
            currentStreak: nextCompleted ? h.currentStreak + 1 : Math.max(0, h.currentStreak - 1),
            automaticityScore: nextCompleted
              ? Math.min(100, h.automaticityScore + 2)
              : Math.max(0, h.automaticityScore - 1),
          };
        }
        return h;
      })
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const applySuggestedTasks = (suggested: Partial<Task>[]) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const newItems: Task[] = suggested.map((st, i) => ({
      id: `task-ai-${Date.now()}-${i}`,
      title: st.title || "Planned Activity",
      description: st.description || "Added via AI daily planner",
      category: st.category || "study",
      priority: st.priority || "medium",
      status: "todo",
      estimatedDuration: st.estimatedDuration || 45,
      startTime: st.startTime,
      endTime: st.endTime,
      scheduledDate: todayStr,
      isFixed: false,
      tag: st.tag || "AI Scheduled",
      energyLevel: st.energyLevel || "high",
    }));

    setTasks((prev) => [...newItems, ...prev]);

    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-ack-${Date.now()}`,
        sender: "assistant",
        text: `✓ Successfully added ${newItems.length} activities to your daily agenda. Your open focus windows have been updated!`,
        timestamp: "Just now",
      },
    ]);
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
      const todayStr = new Date().toISOString().split("T")[0];

      // Prepare context for AI Route Handler
      const fixedCommitments = calendarEvents
        .filter((e) => e.isFixed)
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
            existingTasks: tasks,
            fixedCommitments,
            currentDate: todayStr,
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
                date: todayStr,
                wakeTime: profile.wakeTime,
                sleepTime: profile.sleepTime,
                mostProductivePeriod: profile.mostProductivePeriod,
                preferredFocusDuration: profile.preferredFocusDuration,
                preferredBreakDuration: profile.preferredBreakDuration,
                fixedCommitments: calendarEvents.map((c) => ({
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

    const isQuestionOrGreeting =
      lower.includes("what are you doing") ||
      lower.includes("who are you") ||
      lower.includes("what can you do") ||
      lower.includes("hello") ||
      lower.includes("hi") ||
      lower.includes("hey") ||
      lower.includes("how are you");

    if (isQuestionOrGreeting) {
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
      },
    ]);
  };

  // Sprint 2 Handlers
  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const updatedMilestones = g.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        const completedCount = updatedMilestones.filter((m) => m.completed).length;
        const progress = Math.round((completedCount / updatedMilestones.length) * 100);
        return {
          ...g,
          milestones: updatedMilestones,
          progress,
        };
      })
    );
  };

  const addGoal = (newGoal: Omit<Goal, "id" | "progress">) => {
    const goal: Goal = {
      ...newGoal,
      id: `goal-${Date.now()}`,
      progress: 0,
    };
    setGoals((prev) => [goal, ...prev]);
    setNotifications((prev) => [
      {
        id: `notif-goal-${Date.now()}`,
        title: "New Strategic Goal Added",
        message: `Goal "${goal.title}" created with target ${goal.targetDate}.`,
        timestamp: "Just now",
        type: "system",
        read: false,
      },
      ...prev,
    ]);
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
    setNotifications((prev) => [
      {
        id: `notif-task-${Date.now()}`,
        title: "Milestone Task Scheduled",
        message: `"${task.title}" has been placed into today's agenda.`,
        timestamp: "Just now",
        type: "task",
        read: false,
      },
      ...prev,
    ]);
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

    setNotifications((prev) => [
      {
        id: `notif-focus-${Date.now()}`,
        title: "Flow Session Logged",
        message: `Completed ${session.durationMinutes}m focus block (${session.flowState.toUpperCase()} state).`,
        timestamp: "Just now",
        type: "habit",
        read: false,
      },
      ...prev,
    ]);
  };

  const addHabit = (newHabit: Omit<Habit, "id" | "currentStreak" | "bestStreak" | "completedToday" | "automaticityScore">) => {
    const created: Habit = {
      ...newHabit,
      id: `habit-${Date.now()}`,
      currentStreak: 0,
      bestStreak: 0,
      completedToday: false,
      automaticityScore: 30,
      recentHistory: [false, false, false, false, false, false, false],
    };
    setHabits((prev) => [created, ...prev]);
  };

  const addHabitTransition = (newTransition: Omit<HabitResetTransition, "id">) => {
    const created: HabitResetTransition = {
      ...newTransition,
      id: `trans-${Date.now()}`,
    };
    setHabitTransitions((prev) => [created, ...prev]);
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

  const triggerCalendarSync = async () => {
    setSyncStatus("syncing");
    try {
      const res = await fetch("/api/calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync", useMock: true }),
      });
      if (res.ok) {
        const data = await res.json();
        setSyncStatus("synced");
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        setNotifications((prev) => [
          {
            id: `notif-sync-${Date.now()}`,
            title: "Calendar Synchronized",
            message: `Synchronized with Google Calendar adapter (${data.result?.added?.length || 0} events verified).`,
            timestamp: "Just now",
            type: "calendar",
            read: false,
          },
          ...prev,
        ]);
      } else {
        setSyncStatus("synced");
      }
    } catch {
      setSyncStatus("synced");
    }
  };

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
          setNotifications((prev) => [
            {
              id: `notif-conflict-${Date.now()}`,
              title: "External Calendar Conflict Detected",
              message: data.conflict.description,
              timestamp: "Just now",
              type: "calendar",
              read: false,
            },
            ...prev,
          ]);
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
      setNotifications((prev) => [
        {
          id: `notif-resolved-${Date.now()}`,
          title: "Calendar Conflict Resolved",
          message:
            resolution === "keep_local"
              ? "Preserved local focus block; remote invitation flagged as tentative."
              : "Applied remote meeting and shifted study block to 15:30.",
          timestamp: "Just now",
          type: "calendar",
          read: false,
        },
        ...prev,
      ]);
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
    setNotifications((prev) => [
      {
        id: `notif-eco-${Date.now()}`,
        title: "Eco Impact Recorded 🌱",
        message: `Logged ${minutes}m of ${factor?.name || activity}. Saved ~${co2SavedGrams}g CO2!`,
        timestamp: "Just now",
        type: "eco",
        read: false,
      },
      ...prev,
    ]);
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
        toggleTaskStatus,
        addTask,
        deleteTask,
        updateTaskSchedule,
        toggleHabit,
        addHabit,
        markNotificationRead,
        chatMessages,
        sendChatMessage,
        isAiThinking,
        applySuggestedTasks,
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
        syncStatus,
        lastSyncTime,
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
