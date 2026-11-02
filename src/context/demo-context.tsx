"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  UserProfile,
  Task,
  CalendarEvent,
  Goal,
  Habit,
  NotificationItem,
  ChatMessage,
  UserRole,
  OnboardingFormData,
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
  toggleHabit: (id: string) => void;
  markNotificationRead: (id: string) => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (content: string) => void;
  isAiThinking: boolean;
  applySuggestedTasks: (suggested: Partial<Task>[]) => void;
  onboardingDraft: OnboardingFormData;
  setOnboardingDraft: React.Dispatch<React.SetStateAction<OnboardingFormData>>;
  completeOnboarding: (data: OnboardingFormData) => void;
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

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (newRole === "student") {
      setProfile(studentProfile);
      setTasks(initialStudentTasks);
      setCalendarEvents(studentCalendarEvents);
      setGoals(studentGoals);
      setHabits(studentHabits);
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

  const sendChatMessage = (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: "Just now",
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsAiThinking(true);

    setTimeout(() => {
      setIsAiThinking(false);
      const lower = userText.toLowerCase();

      let replyText = "";
      let suggestions: Partial<Task>[] | undefined;

      if (lower.includes("blender") || lower.includes("assignment") || lower.includes("gym")) {
        replyText =
          "I understand your goal! You have fixed lectures/commitments earlier today. I found optimal windows: 60m Economics Problem Set at 14:00, 50m Gym workout at 16:00, and 45m Blender modeling at 18:00. This preserves your 23:30 sleep routine.";
        suggestions = [
          {
            title: "Economics Problem Set #3",
            category: "study",
            priority: "high",
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
            title: "Blender 3D Modeling Tutorial",
            category: "personal",
            priority: "low",
            estimatedDuration: 45,
            startTime: "18:00",
            endTime: "18:45",
            tag: "Creative",
          },
        ];
      } else if (lower.includes("urgent") || lower.includes("meeting") || lower.includes("4 pm") || lower.includes("4pm")) {
        replyText =
          "I've registered an urgent 4:00 PM commitment. Since you had a personal block planned at that time, I've shifted flexible personal items back by 45 minutes to protect your study priorities without overlap.";
        suggestions = [
          {
            title: "Urgent Meeting / Sync",
            category: "work",
            priority: "urgent",
            estimatedDuration: 45,
            startTime: "16:00",
            endTime: "16:45",
            isFixed: true,
            tag: "Urgent Sync",
          },
        ];
      } else if (lower.includes("reschedule") || lower.includes("missed") || lower.includes("couldn't")) {
        replyText =
          "No problem! Unfinished tasks happen. I've re-evaluated your evening. We can shift the remaining 45-minute focus session to 19:30 after dinner, keeping your wind-down time completely intact.";
      } else {
        replyText = `Understood: "${userText}". I've verified your availability rules and daily energy curve. Would you like me to allocate a 45-minute focus block in your next open window?`;
        suggestions = [
          {
            title: userText.length > 35 ? userText.slice(0, 32) + "..." : userText,
            category: role === "student" ? "study" : "work",
            priority: "medium",
            estimatedDuration: 45,
            tag: "Quick Task",
          },
        ];
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
    }, 900);
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
        toggleHabit,
        markNotificationRead,
        chatMessages,
        sendChatMessage,
        isAiThinking,
        applySuggestedTasks,
        onboardingDraft,
        setOnboardingDraft,
        completeOnboarding,
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
