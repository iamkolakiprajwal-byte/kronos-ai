export type UserRole = "student" | "professional" | "both";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  headline: string;
  institutionOrCompany: string;
  wakeTime: string; // e.g. "07:00"
  sleepTime: string; // e.g. "23:00"
  mostProductivePeriod: "morning" | "afternoon" | "evening" | "night";
  preferredFocusDuration: number; // minutes, e.g. 45
  preferredBreakDuration: number; // minutes, e.g. 10
  planningStyle: "structured" | "flexible" | "time-blocked";
  sustainabilityOptIn: boolean;
}

export type Priority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "completed" | "rescheduled";

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: "study" | "work" | "personal" | "habit" | "errand" | "sustainability";
  priority: Priority;
  status: TaskStatus;
  estimatedDuration: number; // in minutes
  startTime?: string; // "09:30"
  endTime?: string; // "11:00"
  scheduledDate: string; // "YYYY-MM-DD"
  deadline?: string; // "YYYY-MM-DD HH:mm"
  isFixed: boolean; // cannot be moved by scheduler
  tag?: string; // e.g. "ECON 201" or "Sprint 42"
  energyLevel?: "high" | "medium" | "low";
}

export type EventCategory =
  | "academic"
  | "meeting"
  | "deep_work"
  | "focus_session"
  | "personal"
  | "habit"
  | "eco";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "10:00"
  endTime: string; // "11:30"
  category: EventCategory;
  isFixed: boolean;
  location?: string;
  color?: string;
  notes?: string;
}

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  priority: Priority;
  progress: number; // 0 to 100
  category: "academic" | "career" | "wellness" | "skills" | "sustainability";
  milestones: Milestone[];
}

export interface Habit {
  id: string;
  title: string;
  frequency: "daily" | "weekdays" | "3x_week" | "weekly";
  cue: string; // e.g. "After morning pour-over coffee"
  targetDurationMinutes?: number;
  currentStreak: number;
  bestStreak: number;
  completedToday: boolean;
  automaticityScore: number; // 0-100 based on consistency & subjective ease
  category: "focus" | "health" | "learning" | "mindfulness" | "eco";
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "task" | "calendar" | "habit" | "system" | "eco";
  read: boolean;
}

export interface DailySummary {
  date: string;
  tasksTotal: number;
  tasksCompleted: number;
  deepWorkMinutesPlanned: number;
  deepWorkMinutesCompleted: number;
  habitsCompleted: number;
  habitsTotal: number;
  energyForecast: "High" | "Moderate" | "Exhaustion Alert";
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  actions?: Array<{
    label: string;
    payload: string;
  }>;
  suggestedTasks?: Partial<Task>[];
}
