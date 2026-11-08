import assert from "node:assert";
import {
  getUserStorageKey,
  saveStoredState,
  loadStoredState,
  resetStoredStateToClean,
  getCleanInitialState,
  KRONOS_STORAGE_VERSION,
} from "../../src/lib/storage";

// Mock localStorage for Node test runner
const memoryStorage = new Map<string, string>();
(global as any).window = {
  localStorage: {
    getItem: (key: string) => memoryStorage.get(key) || null,
    setItem: (key: string, val: string) => memoryStorage.set(key, val),
    removeItem: (key: string) => memoryStorage.delete(key),
    clear: () => memoryStorage.clear(),
  },
};

console.log("=================================================");
console.log("KRONOS MULTI-USER DATA ISOLATION TEST SUITE");
console.log("=================================================");

function testStorageKeyIsolation() {
  const accountA_Id = "user-1111-aaaa";
  const accountB_Id = "user-2222-bbbb";

  const keyA = getUserStorageKey(accountA_Id);
  const keyB = getUserStorageKey(accountB_Id);
  const keyGuest = getUserStorageKey();

  assert.strictEqual(keyA, "kronos_user_state_user-1111-aaaa");
  assert.strictEqual(keyB, "kronos_user_state_user-2222-bbbb");
  assert.strictEqual(keyGuest, "kronos_ai_local_state_v1");
  assert.notStrictEqual(keyA, keyB, "Account A and Account B must have distinct storage keys");

  console.log("✓ PASS: Storage keys strictly partition by user ID");
}

function testUserDataSegregation() {
  const accountA_Id = "user-alpha";
  const accountB_Id = "user-beta";

  // Account A state with 2 tasks
  const stateA = {
    ...getCleanInitialState("student"),
    profile: {
      ...getCleanInitialState("student").profile,
      id: accountA_Id,
      name: "Alpha User",
      email: "alpha@example.com",
    },
    tasks: [
      {
        id: "task-a1",
        title: "Alpha Secret Study Session",
        category: "study" as const,
        priority: "high" as const,
        status: "todo" as const,
        estimatedDuration: 60,
        scheduledDate: "2026-11-08",
        isFixed: false,
      },
      {
        id: "task-a2",
        title: "Alpha Thesis Research",
        category: "study" as const,
        priority: "urgent" as const,
        status: "todo" as const,
        estimatedDuration: 90,
        scheduledDate: "2026-11-08",
        isFixed: false,
      },
    ],
  };

  // Account B state with 1 task
  const stateB = {
    ...getCleanInitialState("professional"),
    profile: {
      ...getCleanInitialState("professional").profile,
      id: accountB_Id,
      name: "Beta Engineer",
      email: "beta@company.org",
    },
    tasks: [
      {
        id: "task-b1",
        title: "Beta Production Deployment",
        category: "work" as const,
        priority: "urgent" as const,
        status: "todo" as const,
        estimatedDuration: 45,
        scheduledDate: "2026-11-08",
        isFixed: true,
      },
    ],
  };

  saveStoredState(stateA, accountA_Id);
  saveStoredState(stateB, accountB_Id);

  // Retrieve states
  const loadedA = loadStoredState(accountA_Id);
  const loadedB = loadStoredState(accountB_Id);

  assert(loadedA !== null);
  assert(loadedB !== null);

  // Account A verification
  assert.strictEqual(loadedA.tasks.length, 2, "Account A must see exactly its 2 tasks");
  assert.strictEqual(loadedA.tasks[0].title, "Alpha Secret Study Session");
  assert.strictEqual(loadedA.profile.name, "Alpha User");

  // Account B verification
  assert.strictEqual(loadedB.tasks.length, 1, "Account B must see exactly its 1 task");
  assert.strictEqual(loadedB.tasks[0].title, "Beta Production Deployment");
  assert.strictEqual(loadedB.profile.name, "Beta Engineer");

  // Check no cross-contamination
  const bHasATasks = loadedB.tasks.some((t) => t.title.includes("Alpha"));
  const aHasBTasks = loadedA.tasks.some((t) => t.title.includes("Beta"));
  assert.strictEqual(bHasATasks, false, "Account B must never see Account A's tasks");
  assert.strictEqual(aHasBTasks, false, "Account A must never see Account B's tasks");

  console.log("✓ PASS: Account A and Account B data completely segregated");
}

function testCleanResetIsolation() {
  const accountA_Id = "user-alpha";
  const accountB_Id = "user-beta";

  // Reset Account A
  resetStoredStateToClean("student", accountA_Id);

  const freshA = loadStoredState(accountA_Id);
  const preservedB = loadStoredState(accountB_Id);

  assert(freshA !== null);
  assert(preservedB !== null);

  assert.strictEqual(freshA.tasks.length, 0, "Account A must have 0 tasks after clean reset");
  assert.strictEqual(freshA.calendarEvents.length, 0, "Account A must have 0 events after clean reset");
  assert.strictEqual(freshA.goals.length, 0, "Account A must have 0 goals after clean reset");
  assert.strictEqual(freshA.habits.length, 0, "Account A must have 0 habits after clean reset");

  assert.strictEqual(preservedB.tasks.length, 1, "Account B's tasks must remain untouched when Account A resets");
  assert.strictEqual(preservedB.tasks[0].title, "Beta Production Deployment");

  console.log("✓ PASS: Account reset is strictly scoped and never impacts other accounts");
}

function testFreshUserExperienceBaseline() {
  const cleanStudent = getCleanInitialState("student");
  assert.strictEqual(cleanStudent.tasks.length, 0, "Clean student has zero tasks");
  assert.strictEqual(cleanStudent.calendarEvents.length, 0, "Clean student has zero calendar events");
  assert.strictEqual(cleanStudent.goals.length, 0, "Clean student has zero goals");
  assert.strictEqual(cleanStudent.habits.length, 0, "Clean student has zero habits");
  assert.strictEqual(cleanStudent.focusSessions.length, 0, "Clean student has zero focus sessions");

  // Verify no mention of demo personas
  const welcomeText = cleanStudent.chatMessages[0]?.text || "";
  assert(!welcomeText.includes("Aria"), "Clean welcome message must not mention Aria");
  assert(!welcomeText.includes("Marcus"), "Clean welcome message must not mention Marcus");
  assert(!welcomeText.includes("Stanford"), "Clean welcome message must not mention Stanford");

  console.log("✓ PASS: Fresh user experience baseline produces zero mock/demo records");
}

function testNotificationClearingPersistence() {
  const userId = "user-notify-test";

  // State with 2 notifications
  const state = {
    ...getCleanInitialState("student"),
    notifications: [
      { id: "notif-1", title: "Task Scheduled", message: "Math at 10 AM", timestamp: "Just now", read: false, type: "system" as const },
      { id: "notif-2", title: "Sync Success", message: "Google Calendar synced", timestamp: "Just now", read: false, type: "calendar" as const },
    ],
  };
  saveStoredState(state, userId);

  const loadedInitial = loadStoredState(userId);
  assert.strictEqual(loadedInitial?.notifications.length, 2, "Initially saves 2 notifications");

  // User dismisses notif-1
  const afterDismiss = {
    ...loadedInitial!,
    notifications: loadedInitial!.notifications.filter((n) => n.id !== "notif-1"),
  };
  saveStoredState(afterDismiss, userId);

  const loadedAfterDismiss = loadStoredState(userId);
  assert.strictEqual(loadedAfterDismiss?.notifications.length, 1, "Only 1 notification left after dismiss");
  assert.strictEqual(loadedAfterDismiss?.notifications[0].id, "notif-2");

  // User clears all notifications
  const afterClear = {
    ...loadedAfterDismiss!,
    notifications: [],
  };
  saveStoredState(afterClear, userId);

  // Simulate page refresh (re-load from localStorage)
  const loadedAfterRefresh = loadStoredState(userId);
  assert.strictEqual(loadedAfterRefresh?.notifications.length, 0, "Cleared notifications remain 0 after refresh");

  console.log("✓ PASS: Cleared and dismissed notifications strictly persist across page refresh");
}

testStorageKeyIsolation();
testUserDataSegregation();
testCleanResetIsolation();
testFreshUserExperienceBaseline();
testNotificationClearingPersistence();

console.log("=================================================");
console.log("USER DATA ISOLATION: ALL TESTS PASSED");
console.log("=================================================");
