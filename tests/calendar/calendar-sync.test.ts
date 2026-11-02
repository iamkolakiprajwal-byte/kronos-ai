import { mockCalendarAdapter } from "../../src/lib/calendar/mock-adapter";

async function runCalendarTests() {
  console.log("=================================================");
  console.log("KRONOS CALENDAR ADAPTER & SYNC TEST SUITE");
  console.log("=================================================");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, message: string) {
    total++;
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
      process.exitCode = 1;
    }
  }

  // Test 1: Initial Sync returns events and sync token
  const initialSync = await mockCalendarAdapter.fetchRemoteChanges();
  assert(initialSync.added.length > 0, "Initial sync fetches remote Google Calendar events");
  assert(initialSync.newSyncToken === "sync_token_v2", "Initial sync yields new sync token");

  // Test 2: Incremental sync with existing token
  const incrementalSync = await mockCalendarAdapter.fetchRemoteChanges("sync_token_v2");
  assert(incrementalSync.newSyncToken === "sync_token_v2", "Incremental sync maintains sync token");

  // Test 3: Push event
  const pushResult = await mockCalendarAdapter.pushEvent({
    id: "local-ev-1",
    title: "Economics Study Group",
    date: "2026-11-02",
    startTime: "17:00",
    endTime: "18:00",
    category: "deep_work",
    isFixed: false,
  });
  assert(pushResult.success === true, "Local event pushed to adapter successfully");
  assert(pushResult.remoteId === "gcal_local-ev-1", "Remote ID generated with gcal prefix");

  // Test 4: Conflict generation
  const { conflict, remoteEvent } = mockCalendarAdapter.generateSimulatedConflict();
  assert(conflict.id === "sync-conflict-101", "Simulated conflict has unique ID");
  assert(conflict.source === "google_calendar", "Conflict correctly identifies Google Calendar source");
  assert(remoteEvent.isFixed === true, "Remote event is marked as fixed commitment");

  // Test 5: Conflict resolution
  const resolved = await mockCalendarAdapter.resolveConflict(conflict.id, "accept_remote");
  assert(resolved === true, "Conflict resolution returns true");

  console.log("=================================================");
  console.log(`TEST RESULTS: ${passed}/${total} PASSED`);
  console.log("=================================================");
}

runCalendarTests();
