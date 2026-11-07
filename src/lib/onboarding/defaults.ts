import { OnboardingFormData } from "@/types";

/**
 * Pristine, completely unpopulated baseline for new onboarding profiles.
 * Guarantees zero demo personas, zero fabricated courses/companies,
 * and zero seeded tasks or timetable slots.
 */
export const cleanOnboardingInitialData: OnboardingFormData = {
  userType: "student",
  name: "",
  email: "",
  headline: "",
  institutionOrCompany: "",
  wakeTime: "07:00",
  sleepTime: "23:00",
  availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  course: "",
  semester: "",
  subjects: [],
  timetable: [],
  jobRole: "",
  company: "",
  workStartTime: "09:00",
  workEndTime: "17:00",
  recurringMeetings: [],
  shortTermGoal: "",
  longTermGoal: "",
  existingHabits: [],
  desiredHabits: [],
  preferredFocusDuration: 45,
  preferredBreakDuration: 10,
  mostProductivePeriod: "morning",
  planningStyle: "time-blocked",
  sustainabilityOptIn: true,
  ecoActivities: [],
};
