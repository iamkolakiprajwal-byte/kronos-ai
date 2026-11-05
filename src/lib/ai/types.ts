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
  }>;
  currentDate: string; // "YYYY-MM-DD"
}
