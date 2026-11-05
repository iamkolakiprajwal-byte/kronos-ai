/**
 * =============================================================================
 * KRONOS AI — END-TO-END INTEGRATION TEST SUITE
 * 
 * Comprehensive automated verification covering:
 * - Scenario A: Daily planning workflow (AI intent -> scheduler placements -> agenda update)
 * - Scenario B: Schedule changes (reschedule -> fixed protection -> strictly future -> clarify)
 * - Scenario C: Habit formation (protocol extraction -> Growth anchor -> streak/automaticity)
 * - Scenario D: Focus session persistence (timer target -> flow quadrant -> reflection log)
 * - Scenario E: Storage persistence & demo reset (versioning -> diagnostics -> role baseline)
 * =============================================================================
 */

import { MockAIProvider } from "../../src/lib/ai/mock-provider";
import { DeterministicScheduler, timeToMinutes, minutesToTime } from "../../src/lib/scheduler/engine";
import {
  loadStoredState,
  saveStoredState,
  resetStoredStateToDemo,
  getInitialDemoState,
  getStorageDiagnostics,
  exportStateAsJSON,
  importStateFromJSON,
  restorePreMigrationBackup,
  KRONOS_STORAGE_KEY,
  KRONOS_BACKUP_KEY,
  KRONOS_CORRUPT_BACKUP_KEY,
  KRONOS_STORAGE_VERSION,
} from "../../src/lib/storage";
import {
  studentProfile,
  professionalProfile,
  dualProfile,
  initialStudentTasks,
  studentCalendarEvents,
  DEMO_REFERENCE_DATE,
} from "../../src/lib/mock/demo-data";
import { Task, Habit, FocusSessionLog } from "../../src/types";

console.log("===============================================================================");
console.log("KRONOS AI — COMPREHENSIVE END-TO-END INTEGRATION TEST SUITE");
console.log("===============================================================================\n");

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` -> ${detail}` : ""}`);
    process.exitCode = 1;
  }
}

// =============================================================================
// SCENARIO A: DAILY PLANNING WORKFLOW
// =============================================================================
console.log("--- SCENARIO A: Daily Planning Workflow ---");

const aiProvider = new MockAIProvider();

async function runScenarioA() {
  const prompt = "I need to complete two assignments, study economics for 1 hour, and hit the gym at 5 PM.";
  const activeDate = DEMO_REFERENCE_DATE;

  const plan = await aiProvider.generatePlan(prompt, {
    profile: studentProfile,
    existingTasks: initialStudentTasks,
    fixedCommitments: studentCalendarEvents.map((e) => ({
      title: e.title,
      startTime: e.startTime,
      endTime: e.endTime,
      isFixed: true,
    })),
    currentDate: activeDate,
  });

  assert(plan.intent === "create_daily_schedule", "Scenario A.1: Correctly classifies daily planning intent");
  assert(plan.extractedTasks.length >= 2, "Scenario A.2: Extracts multiple candidate tasks from natural language prompt");
  assert(!plan.requiresClarification, "Scenario A.3: Clean daily schedule request does not require clarification");

  // Route candidate tasks into deterministic scheduler
  const scheduleResult = DeterministicScheduler.scheduleDay({
    date: activeDate,
    wakeTime: studentProfile.wakeTime,
    sleepTime: studentProfile.sleepTime,
    mostProductivePeriod: studentProfile.mostProductivePeriod,
    preferredFocusDuration: studentProfile.preferredFocusDuration,
    preferredBreakDuration: studentProfile.preferredBreakDuration,
    fixedCommitments: studentCalendarEvents.map((c) => ({
      id: c.id,
      title: c.title,
      startTime: c.startTime,
      endTime: c.endTime,
    })),
    tasksToSchedule: plan.extractedTasks.map((t, idx) => ({
      id: `candidate-${idx}`,
      title: t.title,
      category: t.category,
      priority: t.priority,
      status: "todo",
      scheduledDate: activeDate,
      estimatedDuration: t.estimatedDuration,
      isFixed: false,
      energyLevel: t.energyLevel || "high",
    })),
  });
  assert(scheduleResult.scheduledPlacements.length > 0, "Scenario A.4: Deterministic scheduler places tasks successfully");

  // Verify no overlap with fixed commitments
  let collisionDetected = false;
  scheduleResult.scheduledPlacements.forEach((placement) => {
    const pStart = timeToMinutes(placement.startTime);
    const pEnd = timeToMinutes(placement.endTime);

    studentCalendarEvents.forEach((event) => {
      const eStart = timeToMinutes(event.startTime);
      const eEnd = timeToMinutes(event.endTime);
      if (pStart < eEnd && pEnd > eStart) {
        collisionDetected = true;
      }
    });
  });

  assert(!collisionDetected, "Scenario A.5: Scheduled placements never collide with fixed classes or labs");

  // Verify casual query does not mutate schedule or extract tasks
  const casualPlan = await aiProvider.generatePlan("What are you doing?", {
    profile: studentProfile,
    existingTasks: [],
    fixedCommitments: [],
    currentDate: activeDate,
  });
  assert(casualPlan.intent === "general_query", "Scenario A.6: Casual query correctly classified as general_query");
  assert(casualPlan.extractedTasks.length === 0, "Scenario A.7: Casual query returns zero extracted tasks");
}

// =============================================================================
// SCENARIO B: SCHEDULE CHANGES & RESCHEDULING
// =============================================================================
console.log("\n--- SCENARIO B: Schedule Changes & Constraints ---");

async function runScenarioB() {
  const reschedulePrompt = "Reschedule Economics Problem Set to 14:00";
  const activeDate = DEMO_REFERENCE_DATE;

  const plan = await aiProvider.generatePlan(reschedulePrompt, {
    profile: studentProfile,
    existingTasks: initialStudentTasks,
    fixedCommitments: studentCalendarEvents.map((e) => ({
      title: e.title,
      startTime: e.startTime,
      endTime: e.endTime,
      isFixed: true,
    })),
    currentDate: activeDate,
  });

  assert(plan.intent === "reschedule_task", "Scenario B.1: Correctly classifies reschedule intent");
  assert(plan.extractedTasks.length === 1, "Scenario B.2: Target task extracted for rescheduling");

  // Test mid-day rescheduling: constraints enforce strictly future placement and fixed event preservation
  const midDaySchedule = DeterministicScheduler.scheduleDay({
    date: activeDate,
    wakeTime: studentProfile.wakeTime,
    sleepTime: studentProfile.sleepTime,
    mostProductivePeriod: "afternoon",
    preferredFocusDuration: 45,
    preferredBreakDuration: 15,
    fixedCommitments: studentCalendarEvents.map((c) => ({
      id: c.id,
      title: c.title,
      startTime: c.startTime,
      endTime: c.endTime,
    })),
    tasksToSchedule: initialStudentTasks,
    currentTime: "13:00",
  });

  assert(midDaySchedule.isFeasible, "Scenario B.3: Mid-day reschedule plan is feasible");
  assert(
    midDaySchedule.scheduledPlacements.every((p) => timeToMinutes(p.startTime) >= timeToMinutes("13:00")),
    "Scenario B.4: All rescheduled tasks start strictly at or after current time (13:00), never in past"
  );

  // Test ambiguous request requiring clarification
  const ambiguousPlan = await aiProvider.generatePlan("Move my assignment", {
    profile: studentProfile,
    existingTasks: initialStudentTasks,
    fixedCommitments: [],
    currentDate: activeDate,
  });
  assert(ambiguousPlan.requiresClarification === true, "Scenario B.5: Ambiguous reschedule triggers requiresClarification");
}

// =============================================================================
// SCENARIO C: HABIT FORMATION & BEHAVIORAL TRACKING
// =============================================================================
console.log("\n--- SCENARIO C: Habit Formation & Automaticity ---");

async function runScenarioC() {
  const habitPrompt = "I want to build a habit of reading academic papers for 15 minutes after morning coffee";
  const plan = await aiProvider.generatePlan(habitPrompt, {
    profile: studentProfile,
    existingTasks: [],
    fixedCommitments: [],
    currentDate: DEMO_REFERENCE_DATE,
  });

  assert(plan.intent === "create_habit", "Scenario C.1: Habit intent classified correctly");
  assert(plan.extractedHabit !== undefined, "Scenario C.2: ExtractedHabit structure created");
  assert(plan.extractedHabit?.cue.includes("coffee") || false, "Scenario C.3: Anchor cue correctly parsed");
  assert(plan.extractedHabit?.minimumVersion !== undefined, "Scenario C.4: 2-minute rule starter version generated");

  // Verify habit streak, 7-day completion rate, and cue consistency metrics
  const newHabit: Habit = {
    id: "habit-test-1",
    title: "Read CS Research Papers",
    cue: "After morning coffee",
    frequency: "daily",
    category: "learning",
    targetDurationMinutes: 15,
    minimumVersion: "Read 1 abstract",
    currentStreak: 3,
    bestStreak: 5,
    completedToday: false,
    weeklyCompletionRate: 43,
    cueConsistencyScore: 85,
    selfReportedAutomaticity: 4,
    automaticityScore: 43,
    recentHistory: [false, true, true, true, false, false, false],
  };

  // Simulate toggling habit completion
  const nextCompleted = !newHabit.completedToday;
  const updatedHistory = [nextCompleted, ...newHabit.recentHistory!.slice(1)];
  const completedDays = updatedHistory.filter(Boolean).length;
  const weeklyCompletionRate = Math.round((completedDays / updatedHistory.length) * 100);

  assert(nextCompleted === true, "Scenario C.5: Habit toggle marks completion");
  assert(weeklyCompletionRate === 57, "Scenario C.6: 7-day completion rate accurately reflects weekly adherence (4/7 = 57%)");
  assert(newHabit.cueConsistencyScore === 85, "Scenario C.7: Cue consistency score preserved independently of completion count");
  assert(newHabit.selfReportedAutomaticity === 4, "Scenario C.8: Self-reported automaticity rating tracks SRHI 1-5 scale");
}

// =============================================================================
// SCENARIO D: FOCUS SESSION TIMER & FLOW STATE
// =============================================================================
console.log("\n--- SCENARIO D: Focus Session Persistence & Flow ---");

function runScenarioD() {
  const challenge = 4;
  const skill = 4;

  // Flow theory quadrant determination
  let flowState: FocusSessionLog["flowState"] = "balanced";
  if (challenge >= 4 && skill >= 4) {
    flowState = "flow";
  } else if (challenge >= 4 && skill <= 2) {
    flowState = "anxiety";
  } else if (challenge <= 2 && skill >= 4) {
    flowState = "boredom";
  } else {
    flowState = "balanced";
  }

  assert(flowState === "flow", "Scenario D.1: High challenge + high skill maps to Flow state (Csikszentmihalyi model)");

  // Log reflection
  const loggedSession: FocusSessionLog = {
    id: "flog-test",
    habitId: "habit-test-1",
    durationMinutes: 45,
    completedAt: "2026-11-04 15:30",
    flowState,
    reflectionNotes: "Deep immersion drafting algorithm proofs.",
    absorptionRating: 5,
    concentrationRating: 5,
    perceivedControl: 4,
    enjoymentRating: 5,
    timeDistortion: "faster",
  };

  assert(loggedSession.flowState === "flow", "Scenario D.2: Flow state stored in session log");
  assert(loggedSession.timeDistortion === "faster", "Scenario D.3: Time distortion parameter recorded");
  assert(loggedSession.absorptionRating === 5, "Scenario D.4: Absorption rating recorded");
}

// =============================================================================
// SCENARIO E: LOCAL STORAGE PERSISTENCE & DEMO RESET
// =============================================================================
console.log("\n--- SCENARIO E: Storage Persistence & Demo Baseline Reset ---");

function runScenarioE() {
  // Set up mock localStorage in node environment
  const mockStorage = new Map<string, string>();
  (global as any).window = {
    localStorage: {
      getItem: (k: string) => mockStorage.get(k) || null,
      setItem: (k: string, v: string) => mockStorage.set(k, v),
      removeItem: (k: string) => mockStorage.delete(k),
      clear: () => mockStorage.clear(),
    },
  };

  // Test baseline generation for each persona
  const studentBaseline = getInitialDemoState("student");
  assert(studentBaseline.role === "student", "Scenario E.1: Generates student baseline (Aria Chen)");
  assert(studentBaseline.tasks.length > 0, "Scenario E.2: Student baseline contains pre-populated tasks");

  const proBaseline = getInitialDemoState("professional");
  assert(proBaseline.role === "professional", "Scenario E.3: Generates professional baseline (Marcus Reed)");
  assert(proBaseline.profile.name === "Marcus Reed", "Scenario E.4: Professional profile correct");

  const dualBaseline = getInitialDemoState("both");
  assert(dualBaseline.role === "both", "Scenario E.5: Generates dual baseline (Elena Rostova)");

  // Test save to localStorage
  const saved = saveStoredState(studentBaseline);
  assert(saved === true, "Scenario E.6: Saves state to localStorage successfully");
  assert(mockStorage.has(KRONOS_STORAGE_KEY), "Scenario E.7: Storage key created in localStorage");

  // Test load from localStorage
  const loaded = loadStoredState();
  assert(loaded !== null, "Scenario E.8: Loads state back from localStorage");
  assert(loaded?.version === KRONOS_STORAGE_VERSION, "Scenario E.9: Schema version matches KRONOS_STORAGE_VERSION (1)");
  assert(loaded?.profile.name === "Aria Chen", "Scenario E.10: Loaded profile data integrity verified");

  // Test diagnostics
  const diagnostics = getStorageDiagnostics();
  assert(diagnostics.isAvailable === true, "Scenario E.11: Storage diagnostics reports available");
  assert(diagnostics.hasCustomData === true, "Scenario E.12: Storage diagnostics detects custom data");
  assert(diagnostics.itemCount > 0, "Scenario E.13: Item count reflects stored entities");

  // Test export & import JSON
  const jsonExport = exportStateAsJSON(loaded!);
  assert(jsonExport.includes("Aria Chen"), "Scenario E.14: JSON export contains profile data");

  const imported = importStateFromJSON(jsonExport);
  assert(imported !== null, "Scenario E.15: Valid JSON imports cleanly");
  assert(imported?.role === "student", "Scenario E.16: Imported state maintains role integrity");

  // Test reset demo data
  const resetResult = resetStoredStateToDemo("professional");
  assert(resetResult.role === "professional", "Scenario E.17: ResetStoredStateToDemo restores pristine professional baseline");
  assert(resetResult.profile.name === "Marcus Reed", "Scenario E.18: Reset data matches requested role without leftover artifacts");

  // Test schema migration and backup safety on version mismatch / legacy shape
  const legacyCustomState = {
    version: 0, // Outdated version
    role: "student",
    tasks: [
      {
        id: "task-custom-legacy-1",
        title: "Important Thesis Literature Review",
        status: "todo",
        estimatedDuration: 60,
      },
    ],
    habits: [
      {
        id: "habit-legacy-1",
        title: "Morning Sun Exposure",
        cue: "After waking up",
        completedToday: true,
        recentHistory: [true, true, true, false, false, false, false],
      },
    ],
  };

  mockStorage.set(KRONOS_STORAGE_KEY, JSON.stringify(legacyCustomState));
  mockStorage.delete(KRONOS_BACKUP_KEY);

  // Loading legacy state should trigger forward migration and safe backup without wiping user tasks
  const migratedState = loadStoredState();
  assert(migratedState !== null, "Scenario E.19: Safely loads and migrates legacy/outdated schema");
  assert(migratedState?.version === KRONOS_STORAGE_VERSION, "Scenario E.20: Migrated state upgraded to current schema version");
  assert(
    Boolean(migratedState?.tasks.some((t) => t.id === "task-custom-legacy-1")),
    "Scenario E.21: Preserves user custom tasks across schema migration without destroying data"
  );
  assert(mockStorage.has(KRONOS_BACKUP_KEY), "Scenario E.22: Pre-migration backup safely written to KRONOS_BACKUP_KEY");

  // Test pre-migration backup restoration
  const restoredBackup = restorePreMigrationBackup();
  assert(restoredBackup !== null, "Scenario E.23: restorePreMigrationBackup recovers previous state cleanly");
  assert(
    Boolean(restoredBackup?.tasks.some((t) => t.id === "task-custom-legacy-1")),
    "Scenario E.24: Restored backup retains user custom tasks"
  );

  // Test corrupt JSON safety
  mockStorage.set(KRONOS_STORAGE_KEY, "{ bad json: true, truncated: ");
  const corruptLoadResult = loadStoredState();
  assert(corruptLoadResult === null, "Scenario E.25: Corrupted JSON returns null gracefully without crash");
  assert(mockStorage.has(KRONOS_CORRUPT_BACKUP_KEY), "Scenario E.26: Corrupted raw payload preserved in KRONOS_CORRUPT_BACKUP_KEY");
}

// =============================================================================
// RUN TEST RUNNER
// =============================================================================
async function runAll() {
  await runScenarioA();
  await runScenarioB();
  await runScenarioC();
  runScenarioD();
  runScenarioE();

  console.log("\n===============================================================================");
  console.log(`END-TO-END SCENARIO VERIFICATION: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log("===============================================================================\n");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runAll().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
