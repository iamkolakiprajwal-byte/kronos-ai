import { Habit, HabitResetTransition } from "../../src/types";

console.log("=================================================");
console.log("KRONOS HABIT RESET & DISCONTINUITY TEST SUITE");
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

// Initial habits
const initialHabits: Habit[] = [
  {
    id: "h1",
    title: "Morning Math Problem",
    category: "learning",
    frequency: "daily",
    targetDurationMinutes: 15,
    cue: "After morning coffee",
    currentStreak: 4,
    bestStreak: 12,
    completedToday: false,
    automaticityScore: 68,
    totalCompletions: 18,
    cueConsistencyScore: 85,
    recentHistory: [true, true, false, true, true, false, false],
  },
];

// Helper mimicking DemoContext addHabitTransition logic
function registerTransitionAndMaterialize(
  existingHabits: Habit[],
  existingTransitions: HabitResetTransition[],
  newTrans: Omit<HabitResetTransition, "id">
): { updatedHabits: Habit[]; updatedTransitions: HabitResetTransition[] } {
  const transitionId = `trans-${Date.now()}`;
  const transition: HabitResetTransition = {
    id: transitionId,
    ...newTrans,
  };

  const updatedTransitions = [transition, ...existingTransitions];

  let updatedHabits = [...existingHabits];
  if (transition.targetHabits && transition.targetHabits.length > 0) {
    const toAdd: Habit[] = [];
    transition.targetHabits.forEach((th, idx) => {
      const exists = updatedHabits.some(
        (h) => h.title.trim().toLowerCase() === th.habitName.trim().toLowerCase()
      );
      if (!exists) {
        toAdd.push({
          id: `h-reset-${Date.now()}-${idx}`,
          title: th.habitName,
          category: "learning",
          frequency: "daily",
          targetDurationMinutes: 20,
          cue: th.newAnchorCue,
          minimumVersion: th.minimumVersion,
          currentStreak: 0,
          bestStreak: 0,
          completedToday: false,
          automaticityScore: 25,
          totalCompletions: 0,
          cueConsistencyScore: 100,
          recentHistory: [false, false, false, false, false, false, false],
        });
      }
    });
    if (toAdd.length > 0) {
      updatedHabits = [...toAdd, ...updatedHabits];
    }
  }

  return { updatedHabits, updatedTransitions };
}

// -----------------------------------------------------------------------------
// Test 1: Transition Materialization into Active Habits
// -----------------------------------------------------------------------------
const transitionInput: Omit<HabitResetTransition, "id"> = {
  title: "Fall 2026 Semester Onset",
  category: "semester",
  startDate: "2026-11-02",
  status: "active",
  disruptedRoutines: ["Late morning awakenings", "Unstructured dorm study"],
  obsoleteCues: ["Old summer alarm", "Dorm desk setup"],
  targetHabits: [
    {
      habitName: "Morning 20m Deep Proof Solving",
      newAnchorCue: "Immediately after 8:00 AM breakfast tea",
      minimumVersion: "Read and outline 1 theorem statement",
      status: "in_progress",
    },
    {
      habitName: "Post-Lecture Anki Review",
      newAnchorCue: "Walking back from Gates Building",
      minimumVersion: "Flip 5 flashcards",
      status: "in_progress",
    },
  ],
  aiObservations: "Leveraging semester transition window.",
};

const result1 = registerTransitionAndMaterialize(initialHabits, [], transitionInput);

assert(result1.updatedTransitions.length === 1, "Transition registered in active transitions collection");
assert(result1.updatedHabits.length === 3, "Both target habits materialized into active habits (1 + 2 = 3)");

const proofHabit = result1.updatedHabits.find((h) => h.title === "Morning 20m Deep Proof Solving");
assert(Boolean(proofHabit), "Target habit exists in habit collection");
assert(proofHabit?.cue === "Immediately after 8:00 AM breakfast tea", "Target habit cue correctly anchored");
assert(proofHabit?.minimumVersion === "Read and outline 1 theorem statement", "2-minute activation version preserved");
assert(proofHabit?.automaticityScore === 25, "Initial non-punitive automaticity baseline established (25%)");

// -----------------------------------------------------------------------------
// Test 2: Duplicate Prevention
// -----------------------------------------------------------------------------
const duplicateTransitionInput: Omit<HabitResetTransition, "id"> = {
  title: "Second Semester Sync",
  category: "semester",
  startDate: "2026-11-02",
  status: "active",
  disruptedRoutines: [],
  obsoleteCues: [],
  targetHabits: [
    {
      habitName: "Morning 20m Deep Proof Solving", // Duplicate habit name
      newAnchorCue: "After breakfast",
      minimumVersion: "Read 1 theorem",
      status: "in_progress",
    },
  ],
};

const result2 = registerTransitionAndMaterialize(
  result1.updatedHabits,
  result1.updatedTransitions,
  duplicateTransitionInput
);

assert(result2.updatedTransitions.length === 2, "Second transition added to transition records");
assert(
  result2.updatedHabits.length === 3,
  "Habits collection count remains 3 — duplicate habit was not re-inserted"
);

// -----------------------------------------------------------------------------
// Test 3: Authentic Non-punitive Habit Toggling & Automaticity
// -----------------------------------------------------------------------------
function toggleHabitSimulation(habit: Habit): Habit {
  const willBeDone = !habit.completedToday;
  const currentCompletions = habit.totalCompletions ?? 0;
  const newCompletions = willBeDone
    ? currentCompletions + 1
    : Math.max(0, currentCompletions - 1);
  const newStreak = willBeDone
    ? habit.currentStreak + 1
    : Math.max(0, habit.currentStreak - 1);

  const prevHistory = habit.recentHistory || [false, false, false, false, false, false, false];
  const newHistory = [...prevHistory.slice(0, 6), willBeDone];
  const weeklyCompletions = newHistory.filter(Boolean).length;
  const adherenceRatio = weeklyCompletions / 7;
  const newAuto = Math.min(100, Math.max(10, Math.round(adherenceRatio * 75 + Math.min(25, newStreak * 2))));

  return {
    ...habit,
    completedToday: willBeDone,
    totalCompletions: newCompletions,
    currentStreak: newStreak,
    bestStreak: Math.max(habit.bestStreak, newStreak),
    automaticityScore: newAuto,
    recentHistory: newHistory,
  };
}

const toggledProof = toggleHabitSimulation(proofHabit!);
assert(toggledProof.completedToday === true, "Habit marked completed today");
assert(toggledProof.totalCompletions === 1, "Total completions count incremented to 1");
assert(toggledProof.currentStreak === 1, "Current streak incremented to 1");
assert(Boolean(toggledProof.recentHistory && toggledProof.recentHistory[6] === true), "Last slot of 7-day history marked completed");
assert(toggledProof.automaticityScore > 0, "Non-punitive automaticity score computed dynamically");

console.log("\n=================================================");
console.log(`HABIT RESET TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
console.log("=================================================\n");
