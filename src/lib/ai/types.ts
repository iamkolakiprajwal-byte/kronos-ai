import { Task, Priority, UserProfile } from "@/types";

export type AIIntent =
  | "create_daily_schedule"
  | "add_task"
  | "reschedule_task"
  | "reschedule_missed"
  | "urgent_interruption"
  | "change_priority"
  | "create_habit"
  | "goal_decomposition"
  | "summarize_progress"
  | "calendar_query"
  | "general_query"
  | "clarification_needed";

export interface ExtractedTask {
  title: string;
  description?: string;
  category: Task["category"];
  priority: Priority;
  estimatedDuration: number; // minutes
  startTime?: string; // "14:00"
  endTime?: string; // "15:00"
  deadline?: string;
  isFixed: boolean;
  tag?: string;
  energyLevel?: "high" | "medium" | "low";
}

export interface ExtractedHabit {
  title: string;
  cue: string;
  category: "focus" | "learning" | "health" | "mindfulness" | "eco";
  frequency: "daily" | "weekdays" | "3x_week" | "weekly";
  minimumVersion?: string;
  targetDurationMinutes?: number;
}

export interface ExtractedGoal {
  title: string;
  category: "academic" | "career" | "skills" | "personal";
  priority: Priority;
  targetTimeline: string;
  milestones: Array<{ title: string; dueDate?: string }>;
}

export interface AIPlanResponse {
  intent: AIIntent;
  explanation: string;
  extractedTasks: ExtractedTask[];
  extractedHabit?: ExtractedHabit;
  extractedGoal?: ExtractedGoal;
  detectedPreferences?: Record<string, any>;
  requiresClarification: boolean;
  clarificationQuestion?: string;
}

export interface UserScheduleContext {
  profile: UserProfile;
  existingTasks: Task[];
  fixedCommitments: Array<{
    title: string;
    startTime: string;
    endTime: string;
    isFixed: boolean;
    date?: string;
  }>;
  currentDate: string; // "YYYY-MM-DD"
  calendarHistory?: Array<{
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    category?: string;
    isFixed: boolean;
    location?: string;
    source?: string;
  }>;
  allTasks?: Array<{
    id: string;
    title: string;
    scheduledDate: string;
    estimatedDuration: number;
    status: string;
    priority: string;
    category: string;
    startTime?: string;
    endTime?: string;
    tag?: string;
  }>;
  goals?: Array<{
    id: string;
    title: string;
    category: string;
    progress: number;
    targetDate: string;
    milestones: Array<{
      title: string;
      completed: boolean;
      dueDate?: string;
    }>;
  }>;
  habits?: Array<{
    id: string;
    title: string;
    category?: string;
    frequency: string;
    cue?: string;
    streak?: number;
    completedToday?: boolean;
  }>;
  focusSessionsSummary?: {
    totalSessions: number;
    totalFocusMinutes: number;
    recentSessions: Array<{
      taskTitle?: string;
      durationMinutes: number;
      completedAt: string;
    }>;
  };
  metrics?: {
    month?: string;
    tasksCompletedThisMonth: number;
    tasksPendingThisMonth: number;
    completionRatePercentage: number;
    totalCalendarEventsThisMonth: number;
    googleCalendarSynced: boolean;
    lastGoogleSync?: string;
  };
}
