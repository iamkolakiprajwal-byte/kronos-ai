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

export interface MilestoneTask {
  id: string;
  title: string;
  durationMinutes: number;
  difficulty: "high" | "medium" | "low";
  suggestedPeriod: "morning" | "afternoon" | "evening";
}

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  actionableTasks?: MilestoneTask[];
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

export interface ActiveTimerState {
  taskTitle: string;
  habitId?: string;
  totalMinutes: number;
  secondsLeft: number;
  isRunning: boolean;
  interruptionsCount: number;
  targetEndTimestamp?: number;
  perceivedChallenge: number;
  perceivedSkill: number;
  sessionGoal: string;
  completionCriteria: string;
  sessionCompleted: boolean;
}

export interface FocusSessionLog {
  id: string;
  taskTitle?: string;
  habitId?: string;
  durationMinutes: number;
  completedAt: string;
  // Flow Theory Pre-Session Check-in
  perceivedChallenge?: number; // 1 (Too easy) to 5 (Overwhelming)
  perceivedSkill?: number; // 1 (Novice) to 5 (Mastery)
  sessionGoal?: string;
  completionCriteria?: string;
  // During Session
  interruptionsCount?: number;
  // Post-Session Flow Dimensions (1-5)
  flowState: "flow" | "balanced" | "boredom" | "anxiety";
  absorptionRating?: number; // 1 to 5
  concentrationRating?: number; // 1 to 5
  perceivedControl?: number; // 1 to 5
  enjoymentRating?: number; // 1 to 5
  timeDistortion?: "faster" | "normal" | "slower";
  reflectionNotes?: string;
}

export interface SyncConflict {
  id: string;
  eventTitle: string;
  localTime: string;
  remoteTime: string;
  source: "google_calendar" | "kronos";
  description: string;
}

export type AutoSyncInterval =
  | "15m"
  | "30m"
  | "1h"
  | "6h"
  | "12h"
  | "1d"
  | "1w"
  | "manual";

export interface AutoSyncOption {
  value: AutoSyncInterval;
  label: string;
  shortLabel: string;
  description: string;
  minutes: number;
}

export const AUTO_SYNC_INTERVAL_OPTIONS: AutoSyncOption[] = [
  { value: "15m", label: "Every 15 minutes", shortLabel: "15m", description: "High frequency", minutes: 15 },
  { value: "30m", label: "Every 30 minutes (Default)", shortLabel: "30m", description: "Recommended standard", minutes: 30 },
  { value: "1h", label: "Every 1 hour", shortLabel: "1h", description: "Hourly check", minutes: 60 },
  { value: "6h", label: "Every 6 hours", shortLabel: "6h", description: "Four times daily", minutes: 360 },
  { value: "12h", label: "Every 12 hours", shortLabel: "12h", description: "Twice daily", minutes: 720 },
  { value: "1d", label: "Daily (24h)", shortLabel: "Daily", description: "Once a day", minutes: 1440 },
  { value: "1w", label: "Weekly (7d)", shortLabel: "Weekly", description: "Once a week", minutes: 10080 },
  { value: "manual", label: "Manual only", shortLabel: "Manual", description: "No background sync", minutes: -1 },
];

export interface EcoLogEntry {
  id: string;
  date: string;
  activity: "cycle_commute" | "walk_commute" | "paperless_study" | "screen_power_down" | "plant_meal";
  co2SavedGrams: number;
  minutes: number;
}

export interface Habit {
  id: string;
  title: string;
  frequency: "daily" | "weekdays" | "3x_week" | "weekly";
  cue: string; // e.g. "After morning pour-over coffee"
  context?: string; // e.g. "At study desk before opening email"
  minimumVersion?: string; // 2-minute rule version e.g. "Read 1 page"
  targetGoal?: string; // e.g. "Build steady academic reading rhythm"
  targetDurationMinutes?: number;
  currentStreak: number;
  bestStreak: number;
  completedToday: boolean;
  totalCompletions?: number;
  recentHistory?: boolean[]; // last 7 days completion
  weeklyCompletionRate?: number; // 0-100% adherence (completed days / 7)
  cueConsistencyScore?: number; // 0-100% anchor cue adherence
  selfReportedAutomaticity?: number; // Optional 1-5 Self-Report Habit Index rating (1=Deliberate effort, 5=Fully automatic)
  automaticityScore: number; // Backward-compatible alias reflecting weeklyCompletionRate
  category: "focus" | "health" | "learning" | "mindfulness" | "eco";
}

export interface HabitResetTransition {
  id: string;
  title: string; // e.g. "Transition to Fall 2026 Semester", "New Senior Role"
  category: "semester" | "career" | "relocation" | "schedule" | "health";
  startDate: string;
  status: "active" | "completed" | "planning";
  disruptedRoutines: string[];
  obsoleteCues: string[];
  targetHabits: Array<{
    habitName: string;
    newAnchorCue: string;
    minimumVersion: string;
    status: "established" | "in_progress" | "adapting";
  }>;
  aiObservations?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "task" | "calendar" | "habit" | "system" | "eco";
  read: boolean;
  createdAtMs?: number;
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

export interface TimetableEntry {
  id: string;
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  subject: string;
  startTime: string;
  endTime: string;
  locationOrLink?: string;
  isLabOrSeminar?: boolean;
}

export interface RecurringMeetingEntry {
  id: string;
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  title: string;
  startTime: string;
  endTime: string;
  priority: "high" | "medium" | "low";
}

export interface OnboardingFormData {
  userType: UserRole;
  name: string;
  email: string;
  headline: string;
  institutionOrCompany: string;
  wakeTime: string;
  sleepTime: string;
  availableDays: string[];
  // Academic
  course: string;
  semester: string;
  subjects: string[];
  timetable: TimetableEntry[];
  // Professional
  jobRole: string;
  company: string;
  workStartTime: string;
  workEndTime: string;
  recurringMeetings: RecurringMeetingEntry[];
  // Goals & Habits
  shortTermGoal: string;
  longTermGoal: string;
  existingHabits: string[];
  desiredHabits: string[];
  // Preferences
  preferredFocusDuration: number;
  preferredBreakDuration: number;
  mostProductivePeriod: "morning" | "afternoon" | "evening" | "night";
  planningStyle: "structured" | "flexible" | "time-blocked";
  // Sustainability
  sustainabilityOptIn: boolean;
  ecoActivities: string[];
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
  suggestedHabit?: {
    title: string;
    cue: string;
    category: "focus" | "learning" | "health" | "mindfulness" | "eco";
    frequency: "daily" | "weekdays" | "3x_week" | "weekly";
    minimumVersion?: string;
    targetDurationMinutes?: number;
  };
  suggestedGoal?: {
    title: string;
    category: "academic" | "career" | "skills" | "personal";
    priority: Priority;
    targetTimeline: string;
    milestones: Array<{ title: string; dueDate?: string }>;
  };
}
