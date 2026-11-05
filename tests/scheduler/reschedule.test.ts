import { DeterministicScheduler, timeToMinutes } from "../../src/lib/scheduler/engine";
import { Task } from "../../src/types";

console.log("=================================================");
console.log("KRONOS DYNAMIC MID-DAY RESCHEDULING TEST SUITE");
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

// Fixed events throughout the day
const fixedCommitments = [
  { id: "c1", title: "ECON 201 Lecture", startTime: "11:00", endTime: "12:15", category: "academic" },
  { id: "c2", title: "Team Sync", startTime: "16:00", endTime: "16:45", category: "meeting" },
];

const pendingTasks: Task[] = [
  {
    id: "t1",
    title: "Economics Problem Set",
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
    title: "Review Research Notes",
    category: "study",
    priority: "medium",
    status: "todo",
    estimatedDuration: 45,
    scheduledDate: "2026-11-02",
    isFixed: false,
    energyLevel: "medium",
  },
  {
    id: "t3",
    title: "Evening Gym Session",
    category: "personal",
    priority: "low",
    status: "todo",
    estimatedDuration: 45,
    scheduledDate: "2026-11-02",
    isFixed: false,
    energyLevel: "medium",
  },
];

// -----------------------------------------------------------------------------
// Test 1: Mid-Morning Reschedule at 10:00 AM
// -----------------------------------------------------------------------------
const morningRes = DeterministicScheduler.scheduleDay({
  date: "2026-11-02",
  wakeTime: "07:30",
  sleepTime: "23:00",
  mostProductivePeriod: "morning",
  preferredFocusDuration: 45,
  preferredBreakDuration: 15,
  fixedCommitments,
  tasksToSchedule: pendingTasks,
  currentTime: "10:00",
});

assert(morningRes.isFeasible, "10:00 AM reschedule is feasible");
assert(
  morningRes.scheduledPlacements.every((p) => timeToMinutes(p.startTime) >= timeToMinutes("10:00")),
  "All 10:00 AM rescheduled tasks start strictly at or after 10:00 AM"
);
assert(
  morningRes.scheduledPlacements.every(
    (p) =>
      !(
        timeToMinutes(p.startTime) < timeToMinutes("12:15") &&
        timeToMinutes(p.endTime) > timeToMinutes("11:00")
      )
  ),
  "10:00 AM reschedule does not overlap with ECON 201 Lecture (11:00–12:15)"
);

// -----------------------------------------------------------------------------
// Test 2: Mid-Afternoon Reschedule at 15:00 (3:00 PM)
// -----------------------------------------------------------------------------
const afternoonRes = DeterministicScheduler.scheduleDay({
  date: "2026-11-02",
  wakeTime: "07:30",
  sleepTime: "23:00",
  mostProductivePeriod: "afternoon",
  preferredFocusDuration: 45,
  preferredBreakDuration: 15,
  fixedCommitments,
  tasksToSchedule: pendingTasks,
  currentTime: "15:00",
});

assert(afternoonRes.isFeasible, "15:00 (3:00 PM) reschedule is feasible");
assert(
  afternoonRes.scheduledPlacements.every((p) => timeToMinutes(p.startTime) >= timeToMinutes("15:00")),
  "All 15:00 rescheduled tasks start strictly at or after 15:00"
);
assert(
  afternoonRes.scheduledPlacements.every(
    (p) =>
      !(
        timeToMinutes(p.startTime) < timeToMinutes("16:45") &&
        timeToMinutes(p.endTime) > timeToMinutes("16:00")
      )
  ),
  "15:00 reschedule strictly protects afternoon Team Sync (16:00–16:45)"
);

// -----------------------------------------------------------------------------
// Test 3: Evening Reschedule at 19:00 (7:00 PM)
// -----------------------------------------------------------------------------
const eveningRes = DeterministicScheduler.scheduleDay({
  date: "2026-11-02",
  wakeTime: "07:30",
  sleepTime: "23:00",
  mostProductivePeriod: "evening",
  preferredFocusDuration: 45,
  preferredBreakDuration: 15,
  fixedCommitments,
  tasksToSchedule: [pendingTasks[0], pendingTasks[1]], // 105 mins total
  currentTime: "19:00",
});

assert(eveningRes.isFeasible, "19:00 reschedule with manageable workload is feasible");
assert(
  eveningRes.scheduledPlacements.every((p) => timeToMinutes(p.startTime) >= timeToMinutes("19:00")),
  "All evening tasks placed strictly after 19:00"
);
assert(
  eveningRes.scheduledPlacements.every((p) => timeToMinutes(p.endTime) <= timeToMinutes("23:00")),
  "All evening tasks conclude prior to 23:00 sleep threshold"
);

// -----------------------------------------------------------------------------
// Test 4: Overbooked Evening Reschedule -> Explicit Conflict Reporting
// -----------------------------------------------------------------------------
const overbookedEveningTasks: Task[] = [
  {
    id: "ob1",
    title: "Heavy Thesis Drafting",
    category: "study",
    priority: "urgent",
    status: "todo",
    estimatedDuration: 180,
    scheduledDate: "2026-11-02",
    isFixed: false,
    energyLevel: "high",
  },
  {
    id: "ob2",
    title: "Problem Set Revision",
    category: "study",
    priority: "high",
    status: "todo",
    estimatedDuration: 120,
    scheduledDate: "2026-11-02",
    isFixed: false,
    energyLevel: "high",
  },
];

const overbookedRes = DeterministicScheduler.scheduleDay({
  date: "2026-11-02",
  wakeTime: "07:30",
  sleepTime: "23:00",
  mostProductivePeriod: "evening",
  preferredFocusDuration: 60,
  preferredBreakDuration: 15,
  fixedCommitments,
  tasksToSchedule: overbookedEveningTasks,
  currentTime: "20:00",
});

assert(!overbookedRes.isFeasible, "Overbooked evening reschedule correctly flagged unfeasible");
assert(
  overbookedRes.conflicts.length > 0,
  "Explicit conflict reported for tasks exceeding remaining evening capacity"
);
assert(
  overbookedRes.scheduledPlacements.every((p) => timeToMinutes(p.endTime) <= timeToMinutes("23:00")),
  "Placed tasks never exceed bedtime (23:00)"
);

console.log("\n=================================================");
console.log(`RESCHEDULER TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
console.log("=================================================\n");
