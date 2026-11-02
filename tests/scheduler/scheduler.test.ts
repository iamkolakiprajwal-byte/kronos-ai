import { DeterministicScheduler, timeToMinutes, minutesToTime } from "../../src/lib/scheduler/engine";
import { Task } from "../../src/types";

console.log("=================================================");
console.log("KRONOS DETERMINISTIC SCHEDULING ENGINE TEST SUITE");
console.log("=================================================\n");

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    console.log(`✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`✗ FAIL: ${testName}`);
    process.exitCode = 1;
  }
}

// -----------------------------------------------------------------------------
// Test 1: Time Conversion Helpers
// -----------------------------------------------------------------------------
assert(timeToMinutes("09:00") === 540, "timeToMinutes converts 09:00 to 540");
assert(timeToMinutes("14:30") === 870, "timeToMinutes converts 14:30 to 870");
assert(minutesToTime(540) === "09:00", "minutesToTime converts 540 to 09:00");
assert(minutesToTime(870) === "14:30", "minutesToTime converts 870 to 14:30");

// -----------------------------------------------------------------------------
// Test 2: Fixed Commitment Protection (Never Overlap)
// -----------------------------------------------------------------------------
const fixedCommitments = [
  { id: "c1", title: "ECON 201 Lecture", startTime: "09:00", endTime: "10:15", category: "academic" },
  { id: "c2", title: "CS 106B Lab", startTime: "11:00", endTime: "12:30", category: "academic" },
];

const candidateTasks: Task[] = [
  {
    id: "t1",
    title: "Economics Problem Set #3",
    category: "study",
    priority: "urgent",
    status: "todo",
    estimatedDuration: 60,
    scheduledDate: "2026-11-02",
    isFixed: false,
    energyLevel: "high",
  },
  {
    id: "t2",
    title: "Gym Workout",
    category: "personal",
    priority: "medium",
    status: "todo",
    estimatedDuration: 50,
    scheduledDate: "2026-11-02",
    isFixed: false,
    energyLevel: "medium",
  },
];

const schedResult = DeterministicScheduler.scheduleDay({
  date: "2026-11-02",
  wakeTime: "07:30",
  sleepTime: "23:00",
  mostProductivePeriod: "morning",
  preferredFocusDuration: 50,
  preferredBreakDuration: 10,
  fixedCommitments,
  tasksToSchedule: candidateTasks,
});

assert(schedResult.isFeasible, "Schedule is feasible under normal workload");
assert(schedResult.scheduledPlacements.length === 2, "Both candidate tasks placed");

// Verify no candidate task overlaps with 09:00-10:15 or 11:00-12:30
const hasOverlapWithC1 = schedResult.scheduledPlacements.some((p) => {
  return p.startMinutes < 615 && p.endMinutes > 540;
});
assert(!hasOverlapWithC1, "No task overlaps with ECON 201 Lecture (09:00–10:15)");

const hasOverlapWithC2 = schedResult.scheduledPlacements.some((p) => {
  return p.startMinutes < 750 && p.endMinutes > 660;
});
assert(!hasOverlapWithC2, "No task overlaps with CS 106B Lab (11:00–12:30)");

// -----------------------------------------------------------------------------
// Test 3: Sleep Boundary Protection
// -----------------------------------------------------------------------------
const allBeforeSleep = schedResult.scheduledPlacements.every(
  (p) => p.endMinutes <= timeToMinutes("23:00")
);
assert(allBeforeSleep, "All placements conclude before 23:00 sleep target");

// -----------------------------------------------------------------------------
// Test 4: Conflict Detection on Overbooked Workload
// -----------------------------------------------------------------------------
const heavyTasks: Task[] = [
  {
    id: "h1",
    title: "Massive 8-hour Study Marathon",
    category: "study",
    priority: "high",
    status: "todo",
    estimatedDuration: 480, // 8 hours
    scheduledDate: "2026-11-02",
    isFixed: false,
  },
  {
    id: "h2",
    title: "Secondary 6-hour Project Sprint",
    category: "work",
    priority: "high",
    status: "todo",
    estimatedDuration: 360, // 6 hours
    scheduledDate: "2026-11-02",
    isFixed: false,
  },
];

const overbookedResult = DeterministicScheduler.scheduleDay({
  date: "2026-11-02",
  wakeTime: "09:00",
  sleepTime: "18:00", // Only 9 hours total available
  mostProductivePeriod: "morning",
  preferredFocusDuration: 60,
  preferredBreakDuration: 15,
  fixedCommitments,
  tasksToSchedule: heavyTasks,
});

assert(!overbookedResult.isFeasible, "Overbooked schedule correctly marked unfeasible");
assert(overbookedResult.conflicts.length > 0, "Conflicts explicitly reported for tasks that cannot fit");

// -----------------------------------------------------------------------------
// Test 5: Dynamic Rescheduling Mid-Day
// -----------------------------------------------------------------------------
const rescheduled = DeterministicScheduler.rescheduleRemainingDay(
  {
    date: "2026-11-02",
    wakeTime: "07:30",
    sleepTime: "23:00",
    mostProductivePeriod: "morning",
    preferredFocusDuration: 50,
    preferredBreakDuration: 10,
    fixedCommitments,
    tasksToSchedule: candidateTasks,
    currentTime: "15:00", // Rescheduling from 3 PM onwards
  },
  {
    title: "Emergency Incident Review",
    duration: 60,
    startTime: "16:00",
  }
);

assert(
  rescheduled.scheduledPlacements.every((p) => p.startMinutes >= 15 * 60 || p.task.isFixed),
  "Rescheduled tasks are placed strictly after current time (15:00)"
);
const hasEmergency = rescheduled.scheduledPlacements.some((p) => p.startMinutes >= 17 * 60);
assert(hasEmergency, "Flexible tasks shifted past emergency 16:00 meeting");

console.log(`\n=================================================`);
console.log(`TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
console.log(`=================================================`);
