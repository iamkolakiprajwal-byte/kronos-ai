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

export interface FocusSessionLog {
  id: string;
  habitId?: string;
  durationMinutes: number;
  completedAt: string;
  flowState: "flow" | "balanced" | "boredom" | "anxiety";
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
}
