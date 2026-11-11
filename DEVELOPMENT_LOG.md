# Kronos AI — Development Engineering Journal

This document serves as an in-depth engineering log recording pivotal technical decisions, bug investigations, architectural refactorings, and milestone achievements during the construction and stabilization of **Kronos AI**.

---

## Session Log 1: The Core Scheduling Dilemma — LLM vs. Deterministic Solver

### Context & Problem Statement
Initial iterations explored asking generative AI models (OpenAI / Gemini) to produce a complete daily schedule directly via natural language prompts. While the model could parse human tasks well, it suffered from severe temporal flaws:
1. **Curfew Hallucinations**: Placed tasks past 23:00 despite explicit system prompts stating the user sleeps at 11:00 PM.
2. **Commitment Collisions**: Overlapped 90-minute study blocks over fixed university lectures.
3. **Floating Durations**: Left ambiguous gaps and violated mathematical time sums.

### The Architectural Pivot
We decoupled the planning pipeline into two specialized engines:
1. **Intent Extraction Layer (Probabilistic LLM)**: Responsible solely for understanding unstructured human intent (*"Two assignments, gym at 4, economics review"*), extracting task entities, estimating reasonable durations, and assigning priority tiers.
2. **Constraint-Satisfaction Engine (Deterministic TypeScript)**: A pure, mathematical interval-packing algorithm (`src/lib/scheduler/engine.ts`) that takes the candidate tasks, compares them against fixed commitments and biological bounds, and calculates non-overlapping start/end times.

### Outcome
Zero schedule collisions, guaranteed 23:00 curfew respect, and mathematical feasibility verification before any task touches user storage or calendar databases.

---

## Session Log 2: Multi-Tenant Data Isolation & Eradication of Demo Data Contamination

### Context & Problem Statement
Early development relied on hardcoded demo personas (Aria Chen, Marcus Reed, Elena Rostova) to demonstrate features. However, an audit revealed serious data pollution:
- Real authenticated users logging in for the first time were greeted with Aria Chen's Stanford timetable and pre-populated demo tasks.
- Storage keys were global (`kronos_ai_local_state_v1`), causing accounts on the same browser to overwrite each other.
- Mock authentication forms accepted arbitrary credentials and redirected directly to `/home`.

### Engineering Resolution
1. **Dynamic User Partitioning**: Replaced global storage keys with user-scoped storage keys:
   ```typescript
   export function getUserStorageKey(userId?: string): string {
     if (userId && userId.trim()) {
       return `${KRONOS_USER_STORAGE_PREFIX}_${userId.trim()}`;
     }
     return KRONOS_STORAGE_KEY;
   }
   ```
2. **Pristine Zero-Baseline Initialization**: Authored `getCleanInitialState()` in `src/lib/storage/index.ts`. Fresh signups start with strictly empty arrays (`tasks: []`, `calendarEvents: []`, `goals: []`, `habits: []`, `notifications: []`).
3. **Rigid Auth Guarding**: Updated `src/app/(auth)/login/page.tsx` and `src/middleware.ts` to enforce live Supabase Auth validation. Invalid credentials now display an explicit error alert and strictly block entry.
4. **Data Deletion Manifest**: Executed a permanent cleanup of all legacy mock records in Supabase Postgres.

---

## Session Log 3: Google Calendar Bi-Directional Synchronization & Delta Tokens

### Context & Problem Statement
Synchronizing between Kronos and Google Calendar required handling two critical realities:
1. Fetching all calendar events on every refresh is slow and exhausts Google API rate limits.
2. Users edit events on both platforms, creating potential update loops and collisions.

### Engineering Resolution
1. **Delta Sync Architecture**: Implemented RFC-3339 incremental synchronization utilizing Google Calendar's `nextSyncToken`:
   - Initial sync: Full query retrieving primary calendar events and capturing baseline `syncToken`.
   - Subsequent syncs: Targeted queries supplying `syncToken`, returning only events modified or deleted since the last sync.
2. **Configurable Background Auto-Sync**: Designed a configurable timer inside `DemoContext` supporting cadences of 15m, 30m, 1h, 6h, 12h, 1d, 1w, or manual.
3. **Visual Conflict Resolution**: Created `src/components/dashboard/sync-modal.tsx` to display conflicting event changes side-by-side, giving the user final authority to keep local or accept remote changes.

---

## Session Log 4: Mobile Ergonomics & The CSS Stacking Context Trap

### Context & Problem Statement
During mobile browser QA runs at 390px (iPhone 14), tapping the Quick Task floating button resulted in a severely clipped modal:
- The top half of the modal was visible, but the input form was trapped and could not be scrolled.
- Tapping outside failed to dismiss the modal overlay.

### Root Cause Analysis
In `src/components/layout/header.tsx`, the `<header>` element utilized Tailwind's `backdrop-blur-md` utility. In CSS specifications, applying `backdrop-filter` or `filter` creates a new **stacking context** and containing block for all descendant elements, even those styled with `position: fixed; inset: 0`. Consequently, modals rendered inside the header DOM tree were trapped inside the header's 56px height bounds!

### Engineering Resolution
1. Refactored `src/components/layout/header.tsx` to close the `</header>` tag prior to modal rendering, placing modal overlays directly in the top-level React fragment.
2. Redesigned both the Quick Task Modal and Calendar Sync Modal as native bottom sheets on mobile devices (`rounded-t-3xl sm:rounded-2xl`) with touch drag handles and safe-area padding.

---

## Session Log 5: Notification Reload Persistence Bug

### Context & Problem Statement
Users reported that dismissing system alerts or calendar notifications cleared them from the UI, but upon refreshing the browser page, all cleared notifications reappeared.

### Root Cause Analysis
In `DemoContext`, notification dismissal handlers (`dismissNotification`, `clearAllNotifications`) updated the React state in memory, but failed to write the updated notification list to the user's partitioned local storage key.

### Engineering Resolution
1. Wrapped all notification state mutators with immediate persistence calls:
   ```typescript
   const clearAllNotifications = () => {
     setNotifications([]);
     persistStateDirectly((prev) => ({ ...prev, notifications: [] }));
   };
   ```
2. Authored automated regression tests in `tests/auth/user-data-isolation.test.ts` (Check 5) verifying that cleared notifications survive a hard page refresh.

---

## Session Log 6: Academic Transparency & Prototype Evolution

### Context & Problem Statement
During initial prototype evaluation, the application interface made use of transitional status badges ("Prototype AI Mode • Gemini Integration Pending") and setup briefing cards. However, once the foundational deterministic architecture stabilized, these disclaimers became visual clutter that degraded user focus.

### Engineering Resolution
Streamlined the Planning Assistant interface by removing prototype disclaimers and focusing purely on the constraint-satisfaction engine and upcoming direct API integration hooks.

---

## Session Log 7: Permanent Google Calendar Authorization Architecture

### Context & Problem Statement
Users experienced repeated Google Calendar authorization prompts across normal page refreshes, browser restarts, and token expirations. Connecting once did not persist reliably, creating friction.

### Root Cause Investigation
1. **Missing Server Credentials in Environment**: `refreshGoogleTokens` failed silently because `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` resided only within the Supabase OAuth dashboard, not in server-side `.env.local`.
2. **Forced Consent Prompts**: `connectGoogleCalendar` passed `prompt: "consent select_account"` on every single invocation, forcing Google to display the full permissions grant screen repeatedly.
3. **Refresh Token Loss on Silent Re-auth**: Google only issues a `refresh_token` when explicit consent is provided. On subsequent logins without consent, Google omits the refresh token. The callback route previously overwrote `refresh_token: null`, causing token loss.
4. **Cookie Override Masking DB Tokens**: Stale short-lived cookie tokens were passed as overrides into `performBidirectionalSync`, preventing the sync engine from inspecting the database expiry timestamp or triggering auto-refresh.
5. **False Error Transitions**: Temporary network errors or Google 5xx outages immediately marked `sync_status = "error"`, permanently breaking auto-sync.

### Engineering Resolution
1. **Refresh Token Preservation**: In `/auth/callback`, the server checks existing `calendar_connections` and retains `existing.refresh_token` if Google's payload omits it.
2. **Single-Flight Concurrency Mutex**: Built `inFlightRefreshes` and `inFlightSyncs` in-memory lock maps to deduplicate simultaneous token renewal and sync calls.
3. **Proactive & Reactive Expiration Handling**: Implemented `isTokenExpired` with a 5-minute renewal buffer, paired with `attemptWithTokenRetry` which catches 401 errors, renews the access token, saves it to Supabase, and transparently retries the API request.
4. **Resilient Status Management**: Only true `invalid_grant` errors (user revoked access in Google settings) transition `sync_status` to `"error"`. Transient outages keep status `"active"`.
5. **Client Cache Hydration**: Cached active connection status in `localStorage` (`kronos_cached_sync_status`) to prevent the initial "offline" badge flash during page load.

---

## Session Log 8: AI Workspace Interface Polish & Clean Constraint Planning

### Context & Problem Statement
The Planning Assistant workspace (`/ai`) retained prototype banners ("Prototype AI Mode", "Gemini AI Setup Required") and connection status badges that broke layout cleanliness and cluttered the user interface.

### Engineering Resolution
1. **Removed UI Artifacts**: Purged the header badge and technical upcoming briefing banner from `src/app/(dashboard)/ai/page.tsx`.
2. **Cohesive Planning Guidance**: Replaced technical banners with a clean, elegant "Adaptive Constraint-Based Planning" card outlining how Kronos fits tasks around user commitments and energy rhythms.
3. **Preserved Complete Interaction Pipeline**: Maintained the natural language chat input, speech-to-text dictation modal with mic wave animations, task proposal cards with "Apply to My Day" confirmation buttons, and quick navigation handshakes.
4. **Responsive Verification**: Verified clean vertical scrolling, zero horizontal overflow, and touch-friendly button targets across 7 device viewports.
