import { Task, Priority } from "@/types";

export interface TimeSlot {
  startMinutes: number; // e.g. 540 = 09:00 AM
  endMinutes: number;   // e.g. 600 = 10:00 AM
}

export interface FixedInterval {
  id: string;
  title: string;
  startTime: string; // "09:00"
  endTime: string;   // "10:15"
  startMinutes: number;
  endMinutes: number;
  category: string;
}

export interface ScheduledTaskPlacement {
  task: Task;
  startTime: string;
  endTime: string;
  startMinutes: number;
  endMinutes: number;
}

export interface SchedulingConflict {
  taskId: string;
  taskTitle: string;
  reason: string;
  suggestedAction: string;
}

export interface ScheduleResult {
  isFeasible: boolean;
  scheduledPlacements: ScheduledTaskPlacement[];
  conflicts: SchedulingConflict[];
  totalFocusMinutes: number;
  totalAvailableMinutes: number;
  summaryExplanation: string;
}

export interface SchedulerInput {
  date: string; // "YYYY-MM-DD"
  wakeTime: string; // "07:30"
  sleepTime: string; // "23:30"
  mostProductivePeriod: "morning" | "afternoon" | "evening" | "night";
  preferredFocusDuration: number; // minutes
  preferredBreakDuration: number; // minutes
  fixedCommitments: Array<{
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    category?: string;
  }>;
  tasksToSchedule: Task[];
  currentTime?: string; // Optional for dynamic rescheduling mid-day
}
