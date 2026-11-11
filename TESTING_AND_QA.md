# Kronos AI — Testing & Quality Assurance Documentation

This document describes the testing philosophy, automated test architecture, manual QA methodologies, edge-case validation suites, and verification metrics for **Kronos AI**.

---

## 1. Quality Assurance Philosophy & Rigor

Kronos AI adheres to a **zero-regression, deterministic-first** testing strategy. Because time-management systems govern critical real-world commitments (classes, stakeholder meetings, sleep boundaries), algorithmic calculations cannot rely on probabilistic LLM output alone. Every scheduling decision, sync transformation, and data migration must be deterministically verifiable.

### QA Execution Matrix:
1. **Unit & Mathematical Verification**: Rigorous pure-function tests verifying time conversions, slot collision detection, and feasibility scoring.
2. **Dynamic Rescheduling Integration**: Tests simulating real-world interruptions at 10:00 AM, 3:00 PM, and 7:00 PM.
3. **Multi-Tenant Data Isolation**: Verifies that user accounts remain hermetically sealed with zero state pollution.
4. **End-to-End Scenario Simulation**: 50 comprehensive user stories verifying onboarding, migrations, corrupted payload recovery, and goal decompositions.
5. **Headless Browser Matrix**: Automated Puppeteer runs testing 7 screen viewports (320px–1440px) for layout stability, touch target compliance, and zero horizontal overflow.

---

## 2. Test Execution Commands

```bash
# Execute entire test suite (156 tests across 11 suites)
npm test

# Run individual test suites
npx tsx tests/scheduler/scheduler.test.ts
npx tsx tests/scheduler/reschedule.test.ts
npx tsx tests/calendar/calendar-sync.test.ts
npx tsx tests/calendar/persistent-auth.test.ts
npx tsx tests/sustainability/eco-calculator.test.ts
npx tsx tests/ai/roadmap.test.ts
npx tsx tests/habits/habit-reset.test.ts
npx tsx tests/growth/flow-timer.test.ts
npx tsx tests/e2e/e2e-scenarios.test.ts
npx tsx tests/auth/auth-clean-state.test.ts
npx tsx tests/auth/user-data-isolation.test.ts

# Execute full browser QA verification across all 7 viewports
node scripts/manual-qa-suite.mjs

# Execute persistent Google Calendar authorization verification
node scripts/verify-calendar-persistence.mjs

# Execute clean auth & onboarding Puppeteer verification
node scripts/verify-clean-auth-onboarding.js

# Execute production build compilation check
npm run build
```

---

## 3. Automated Test Suite Inventory

### 3.1 Deterministic Constraint Scheduler (`tests/scheduler/scheduler.test.ts`)
- **Total Tests**: `13/13 Passed`
- **Key Checks**:
  - `timeToMinutes` and `minutesToTime` precision conversions ($09:00 = 540\text{m}$, $14:30 = 870\text{m}$).
  - Schedule feasibility under normal workload.
  - Candidate tasks placed without overlapping fixed lecture slots (ECON 201 09:00–10:15, CS 106B 11:00–12:30).
  - Strict curfew enforcement: all placements conclude before 23:00 bedtime.
  - Overbooked workload correctly flags `isFeasible = false` with explicit conflict reports.
  - Mid-day rescheduling shifts flexible items past sudden emergency meetings.

### 3.2 Dynamic Mid-Day Rescheduler (`tests/scheduler/reschedule.test.ts`)
- **Total Tests**: `12/12 Passed`
- **Key Checks**:
  - Rescheduling at 10:00 AM places tasks strictly at or after 10:00 AM.
  - Protects fixed 11:00 AM lecture during morning recalculations.
  - Rescheduling at 3:00 PM (15:00) strictly protects 4:00 PM Team Sync.
  - Evening reschedule at 7:00 PM fits manageable study blocks before 23:00 curfew.
  - Flags impossible evening workloads exceeding remaining available hours.

### 3.3 Google Calendar Delta Sync Adapter (`tests/calendar/calendar-sync.test.ts`)
- **Total Tests**: `9/9 Passed`
- **Key Checks**:
  - Initial sync pulls remote events and establishes a baseline `nextSyncToken`.
  - Incremental sync preserves the delta sync token across successive runs.
  - Local task creation pushes correctly formatted RFC-3339 event objects.
  - Generates distinct `gcal_` remote identifiers.
  - Simulates external conflict when a remote event overlaps a local time block.
  - Verified non-destructive conflict handling.

### 3.4 Persistent Google Calendar Authorization (`tests/calendar/persistent-auth.test.ts`)
- **Total Tests**: `8/8 Passed`
- **Key Checks**:
  - `isTokenExpired` accurately checks expiration timestamps and 5-minute proactive buffer.
  - `refreshGoogleTokens` returns `config_missing` without corrupting tokens when environment credentials are not present.
  - Differentiates `invalid_grant` (revoked permissions) from transient 5xx Google outages.
  - Single-flight concurrency lock deduplicates simultaneous refresh requests across the application.
  - `performBidirectionalSync` single-flight mutex joins in-flight requests to eliminate race collisions.
  - Explicit disconnect nullifies stored credentials and transitions status to `disconnected`.
  - Silent re-auth merges existing refresh tokens when Google omits them on subsequent login.
  - Client localStorage sync cache preserves `"synced"` state across page reloads without offline flicker.

### 3.5 Sustainability & Carbon Offset Calculator (`tests/sustainability/eco-calculator.test.ts`)
- **Total Tests**: `8/8 Passed`
- **Key Checks**:
  - Computes exact carbon offset: $10\text{ km active commute} \times 0.21\text{ kg} = 2.10\text{ kg CO}_2$.
  - Computes paperless notes savings: $5\text{ hours} \times 0.05\text{ kg} = 0.25\text{ kg CO}_2$.
  - Converts cumulative $CO_2$ savings into equivalent tree seedling absorption days.
  - Validates zero-baseline handling without NaN errors.

### 3.6 Goal Roadmap Decomposer (`tests/ai/roadmap.test.ts`)
- **Total Tests**: `7/7 Passed`
- **Key Checks**:
  - Decomposes high-level target (*"Publish Research Paper"*) into 3 phased milestones.
  - Assigns chronological due dates respecting user target timelines.
  - Generates actionable study blocks ready for calendar injection.
  - Verifies milestone toggle and progress percentage calculation ($0\%$ to $100\%$).

### 3.6 Non-Punitive Habit Discontinuity (`tests/habits/habit-reset.test.ts`)
- **Total Tests**: `8/8 Passed`
- **Key Checks**:
  - Validates cue-anchored habit definition using BJ Fogg Tiny Habits.
  - Calculates Self-Reported Habit Index (SRHI) score independently of streak length.
  - Allows intentional life transition pauses without resetting cognitive automaticity.
  - Verifies 2-minute starter versions shrink friction.

### 3.7 Csíkszentmihályi Flow Timer (`tests/growth/flow-timer.test.ts`)
- **Total Tests**: `7/7 Passed`
- **Key Checks**:
  - Timer state transitions: `idle` → `running` → `paused` → `completed`.
  - Interruption logging increments counter without terminating session.
  - Correctly maps high challenge + high skill to **Flow**.
  - Correctly maps high challenge + low skill to **Anxiety**.
  - Correctly maps low challenge + high skill to **Boredom**.

### 3.8 End-to-End Scenarios (`tests/e2e/e2e-scenarios.test.ts`)
- **Total Tests**: `50/50 Passed`
- **Key Checks**:
  - Scenarios E.1–E.5: Student, Professional, and Dual onboarding workflows.
  - Scenarios E.6–E.12: Task creation, priority sorting, subtask completion.
  - Scenarios E.13–E.18: Emergency calendar interruptions and auto-reschedule.
  - Scenarios E.19–E.24: Backward-compatible schema evolution and pre-migration backups.
  - Scenarios E.25–E.26: Corrupted JSON recovery preserving raw payload into backup keys.

### 3.9 Clean Auth & Onboarding State (`tests/auth/auth-clean-state.test.ts`)
- **Total Tests**: `29/29 Passed`
- **Key Checks**:
  - Empty baseline verification for initial name, email, headline, institution, and courses.
  - Clean state contains exactly 0 tasks, 0 calendar events, 0 goals, 0 habits, 0 notifications.
  - Welcome messages are generic and do not reference demo personas (Aria, Marcus, Elena).
  - Service role JWT detection prevents accidental secret key leaks to client bundles.

### 3.10 Multi-User Data Isolation (`tests/auth/user-data-isolation.test.ts`)
- **Total Tests**: `5/5 Passed`
- **Key Checks**:
  - Storage keys strictly partitioned by user ID (`kronos_ai_user_state_v1_{userId}`).
  - Account A and Account B data completely segregated in local storage.
  - Account reset is strictly scoped and never impacts other accounts.
  - Cleared/dismissed notifications strictly persist across page refresh.

---

## 4. Multi-Viewport Browser QA Matrix

The automated browser QA runner (`scripts/manual-qa-suite.mjs`) verifies visual fidelity across 7 standard display sizes:

| Viewport Name | Resolution | Category | Horizontal Overflow | Touch Target ( $\ge 44\text{px}$ ) | Bottom Dock Alignment |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **iPhone SE (1st gen)** | $320 \times 600$ | Small Mobile | `0px (PASS)` | `PASS` | `PASS` |
| **iPhone SE (2nd gen)** | $375 \times 667$ | Standard Mobile | `0px (PASS)` | `PASS` | `PASS` |
| **iPhone 13 / 14 / 15** | $390 \times 844$ | Modern Mobile | `0px (PASS)` | `PASS` | `PASS` |
| **iPhone 16 Pro Max** | $430 \times 932$ | Large Mobile | `0px (PASS)` | `PASS` | `PASS` |
| **iPad Mini** | $768 \times 1024$| Tablet Portrait | `0px (PASS)` | `PASS` | `PASS` |
| **iPad Pro / Laptop** | $1024 \times 768$ | Tablet Landscape| `0px (PASS)` | `PASS` | `PASS` |
| **MacBook Widescreen** | $1440 \times 900$ | Desktop Display | `0px (PASS)` | `PASS` | `PASS` |

**Total Browser QA Checks**: `64/64 Passed (0 Defects Identified)`.

---

## 5. Edge Case & Resilience Verifications

1. **Corrupted LocalStorage Payload**:
   - When malformed JSON is present in storage, `loadStoredState()` traps the syntax exception, copies the raw data to `kronos_corrupt_backup_{timestamp}`, and returns a clean baseline without crashing the UI.
2. **Schema Version Evolution**:
   - If stored data version is older than `KRONOS_STORAGE_VERSION` ($1.1$), Kronos archives a pre-migration snapshot to `kronos_pre_migration_backup` and applies lossless schema upgrades.
3. **Invalid Auth Attempts**:
   - Entering unregistered or incorrect credentials displays an explicit error message and strictly prevents navigation to private workspaces.
4. **Google Calendar Token Expiry**:
   - If an expired OAuth token is detected, Kronos transitions sync status to `needs_reauth`, flags a warning notification, and offers a one-click reconnection flow.
