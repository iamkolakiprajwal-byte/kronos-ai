import { ActiveTimerState, FocusSessionLog } from "../../src/types";

console.log("=================================================");
console.log("KRONOS PERSISTENT FLOW TIMER & REFLECTION TEST SUITE");
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
// Test 1: Timestamp-Based Countdown Calculation (Tab & Route Independence)
// -----------------------------------------------------------------------------
const startTime = 1700000000000; // Base epoch
const totalMinutes = 25;
const totalSeconds = totalMinutes * 60; // 1500s
const targetEndTimestamp = startTime + totalSeconds * 1000;

// Helper to simulate time sync given a current timestamp
function computeRemainingSeconds(targetEpoch: number, currentEpoch: number): number {
  const remainingMs = targetEpoch - currentEpoch;
  return Math.max(0, Math.ceil(remainingMs / 1000));
}

// After 0 seconds
assert(
  computeRemainingSeconds(targetEndTimestamp, startTime) === 1500,
  "Remaining seconds at start is exactly 1500s (25 minutes)"
);

// After 5 minutes (300 seconds)
const fiveMinutesLater = startTime + 300 * 1000;
assert(
  computeRemainingSeconds(targetEndTimestamp, fiveMinutesLater) === 1200,
  "Remaining seconds after 5 minutes background elapsed is 1200s (20 minutes)"
);

// After 24 minutes and 30 seconds
const almostDone = startTime + (24 * 60 + 30) * 1000;
assert(
  computeRemainingSeconds(targetEndTimestamp, almostDone) === 30,
  "Remaining seconds after 24m 30s elapsed is 30s"
);

// After 26 minutes (timer expired)
const expired = startTime + 26 * 60 * 1000;
assert(
  computeRemainingSeconds(targetEndTimestamp, expired) === 0,
  "Timer clamps to 0s upon expiration without negative overflow"
);

// -----------------------------------------------------------------------------
// Test 2: Pause and Resume Mechanics with Exact Seconds Preservation
// -----------------------------------------------------------------------------
let timerState: ActiveTimerState = {
  taskTitle: "Economics Problem Set #3",
  habitId: "h1",
  totalMinutes: 25,
  secondsLeft: 1500,
  isRunning: true,
  interruptionsCount: 0,
  targetEndTimestamp: startTime + 1500 * 1000,
  perceivedChallenge: 4,
  perceivedSkill: 3,
  sessionGoal: "Solve questions 1 through 4",
  completionCriteria: "Clear written explanations and step 3 proofs",
  sessionCompleted: false,
};

// Pause after 10 minutes (600s)
const pauseTime = startTime + 600 * 1000;
const remainingAtPause = computeRemainingSeconds(timerState.targetEndTimestamp!, pauseTime);

timerState = {
  ...timerState,
  isRunning: false,
  secondsLeft: remainingAtPause,
  targetEndTimestamp: undefined,
};

assert(!timerState.isRunning, "Timer state successfully paused");
assert(timerState.secondsLeft === 900, "Exact 900 seconds (15 minutes) preserved upon pause");
assert(timerState.targetEndTimestamp === undefined, "Target end timestamp cleared while paused");

// Log an interruption while paused
timerState = {
  ...timerState,
  interruptionsCount: timerState.interruptionsCount + 1,
};
assert(timerState.interruptionsCount === 1, "Interruption logged accurately (count = 1)");

// Resume 30 minutes later at a new epoch
const resumeTime = pauseTime + 30 * 60 * 1000;
timerState = {
  ...timerState,
  isRunning: true,
  targetEndTimestamp: resumeTime + timerState.secondsLeft * 1000,
};

assert(timerState.isRunning, "Timer resumed at new epoch");
assert(
  timerState.targetEndTimestamp === resumeTime + 900 * 1000,
  "New target timestamp anchored to remaining 900 seconds"
);

// -----------------------------------------------------------------------------
// Test 3: Early Finish & Session Log Reflection Creation
// -----------------------------------------------------------------------------
// User finishes early after 10 more minutes of work (leaving 300s left)
const finishEarlyEpoch = resumeTime + 600 * 1000;
const remainingAtFinish = computeRemainingSeconds(timerState.targetEndTimestamp!, finishEarlyEpoch);

timerState = {
  ...timerState,
  isRunning: false,
  secondsLeft: remainingAtFinish,
  targetEndTimestamp: undefined,
  sessionCompleted: true,
};

assert(timerState.sessionCompleted, "Session marked completed upon early finish trigger");
assert(timerState.secondsLeft === 300, "300 seconds (5m) remaining at finish");

// Calculate elapsed minutes: totalMinutes * 60 - secondsLeft = 1500 - 300 = 1200s = 20m
const elapsedSecs = Math.max(60, timerState.totalMinutes * 60 - timerState.secondsLeft);
const durationMinutes = Math.max(1, Math.round(elapsedSecs / 60));

assert(durationMinutes === 20, "Elapsed focus duration accurately computed as 20 minutes");

// Form session log
const sessionLog: FocusSessionLog = {
  id: "flog-test-1",
  taskTitle: timerState.taskTitle,
  habitId: timerState.habitId,
  durationMinutes,
  completedAt: "2026-11-02 11:20",
  perceivedChallenge: timerState.perceivedChallenge,
  perceivedSkill: timerState.perceivedSkill,
  sessionGoal: timerState.sessionGoal,
  completionCriteria: timerState.completionCriteria,
  interruptionsCount: timerState.interruptionsCount,
  flowState: "flow",
  absorptionRating: 5,
  concentrationRating: 4,
  perceivedControl: 4,
  enjoymentRating: 5,
  timeDistortion: "faster",
  reflectionNotes: "Deep immersion after switching phone to airplane mode.",
};

assert(sessionLog.durationMinutes === 20, "Logged duration matches actual elapsed 20m");
assert(sessionLog.interruptionsCount === 1, "Logged session preserves the 1 logged interruption");
assert(sessionLog.flowState === "flow", "Flow state recorded");
assert(sessionLog.timeDistortion === "faster", "Time distortion recorded as faster");

// Timer resets cleanly
timerState = {
  ...timerState,
  secondsLeft: timerState.totalMinutes * 60,
  isRunning: false,
  interruptionsCount: 0,
  targetEndTimestamp: undefined,
  sessionCompleted: false,
};

assert(timerState.secondsLeft === 1500, "Timer resets back to full 25 minutes");
assert(timerState.interruptionsCount === 0, "Interruption counter resets to 0");
assert(!timerState.sessionCompleted, "sessionCompleted flag reset for next session");

console.log("\n=================================================");
console.log(`FLOW TIMER TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
console.log("=================================================\n");
