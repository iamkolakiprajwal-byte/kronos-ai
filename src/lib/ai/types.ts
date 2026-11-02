import { Task, Priority, UserProfile } from "@/types";

export type AIIntent =
  | "create_daily_schedule"
  | "add_task"
  | "reschedule_missed"
  | "urgent_interruption"
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

export interface AIPlanResponse {
  intent: AIIntent;
  explanation: string;
  extractedTasks: ExtractedTask[];
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
