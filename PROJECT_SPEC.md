# Kronos AI — Functional Specifications & System Requirements (PROJECT_SPEC.md)

## 1. Product Overview & Purpose
**Kronos AI** is an intelligent personal planning platform engineered for students, working professionals, and individuals managing combined academic and professional responsibilities (Dual-Track). It unifies natural language planning, deterministic constraint-satisfaction scheduling, behavioral habit anchoring, flow focus sessions, and Google Calendar synchronization into a calm, notebook-inspired interface.

---

## 2. Target User Personas & Workflows

### 2.1 The Academic Student
- **Operational Reality**: University lectures, laboratory sections, problem sets, midterm/final exams, campus commutes.
- **Cognitive Challenges**: Overestimating free time between classes; procrastination on multi-week assignments; sleep deprivation during exam crunches.
- **Specialized Workflow**:
  - Collects course enrollments, class timetables, and assignment deadlines during onboarding.
  - Generates study blocks fitted between recurring lectures without overlaps.
  - Enforces a 23:00 sleep curfew to prevent burnout.

### 2.2 The Working Professional
- **Operational Reality**: Core working hours, stakeholder syncs, sprint planning, client presentations, asynchronous tasks.
- **Cognitive Challenges**: Fragmented calendar blocks, meeting creep, high context-switching fatigue, erosion of personal health habits.
- **Specialized Workflow**:
  - Ingests core working hours and recurring stakeholder meetings.
  - Carves out and defends 90-minute uninterrupted deep focus blocks during peak focus periods.
  - Dynamically reschedules afternoon tasks when emergency meetings preempt scheduled slots.

### 2.3 The Dual-Track Individual (Working Student)
- **Operational Reality**: Daytime professional responsibilities combined with evening coursework, weekend assignments, and professional certifications.
- **Cognitive Challenges**: Acute cognitive overload, conflicting priorities between employer deadlines and academic submissions.
- **Specialized Workflow**:
  - Interlocks workplace commitments and university timetables into a unified calendar surface.
  - Identifies transition windows and weekend recovery study sessions.

---

## 3. Detailed Functional Requirements

### 3.1 Authentication & Multi-Tenant Isolation
- **Live Supabase Auth**: Mandatory email/password authentication with bcrypt hashing and OAuth 2.0 PKCE flow for Google Identity.
- **SSR Route Middleware**: Next.js server-side interceptor (`src/middleware.ts`) inspecting `@supabase/ssr` cookies. Unauthenticated requests to private routes (`/home`, `/ai`, `/my-day`, `/growth`, `/profile`, `/onboarding`) are redirected to `/login?redirectTo=...`.
- **Zero Mock Fallbacks in Production**: When `NEXT_PUBLIC_DEMO_MODE=false`, all mock credentials and bypasses are strictly disabled. Invalid credentials produce explicit error alerts.
- **Tenant Data Segregation**: Every user's local storage key is strictly partitioned by their authenticated `userId` (`kronos_ai_user_state_v1_{userId}`). Supabase PostgreSQL tables enforce Row Level Security (`auth.uid() = user_id`).

### 3.2 Dynamic Guided Onboarding
- **Role Selection Branching**: Immediate branch selection between Student, Professional, or Dual.
- **Circadian Rhythms & Focus Parameters**:
  - Waking target (default `07:00`).
  - Sleep curfew (default `23:00`).
  - Peak focus window (Morning, Afternoon, Evening, Night).
  - Focus session duration ($20$, $25$, $45$, $50$, or $90$ minutes).
  - Transition break duration ($5$ to $15$ minutes).
- **Draft Persistence**: Unfinished onboarding drafts persist in browser storage and can be resumed seamlessly.
- **Clean State Handshake**: Completing onboarding creates a verified user profile and initializes a clean, unpopulated schedule.

### 3.3 Home Workspace & Command Center (`/home`)
- **Interactive Calendar Surface**: 7-column monthly calendar grid with:
  - Current day highlight with dark circle and green "TODAY" pill.
  - Category dots (Class/Lecture, Deep Work, Habit/Eco).
  - Navigation controls (`Today`, `< >` arrows, `Week View / Full Month` toggle).
- **Daily Agenda Stream**: Chronological view of today's time-blocked items with start/end timestamps, priority tags, and category indicators.
- **Quick Action Bar**: Floating `+` action button and header actions (`+ New Task`, `Connect Google Calendar`, `AI Assistant`, `Open My Day`).

### 3.4 Conversational AI Planning Assistant (`/ai`)
- **Dual-Engine Architecture**: Separates LLM natural language understanding from deterministic constraint solving.
- **Input Methods**: Text input field with role-based prompt chips and browser Web Speech API voice dictation.
- **Deterministic Scheduling Engine**:
  - Ingests proposed tasks, bedtime curfew, and fixed commitments.
  - Solves for non-overlapping feasible placements.
  - Flags capacity overload or curfew breaches with explicit error alerts.
- **Transparent Prototype Mode**: UI badge clearly indicates `"Prototype AI Mode • Gemini Integration Pending"` when operating without live Gemini keys, ensuring absolute academic research integrity.
- **User Consent Handshake**: "Apply Proposed Schedule to My Day" commits candidate placements only upon explicit user confirmation.

### 3.5 My Day Daily Execution Workspace (`/my-day`)
- **Focus Spotlight Ring**: Prominent circular progress indicator displaying percentage of daily focus completed.
- **Dynamic Mid-Day Rescheduler**: "Reorganise Remaining Day" recalculates schedule from current timestamp forward, pushing remaining flexible tasks around emergency interruptions while protecting bedtime.
- **Task Management**: One-tap checkoff, subtask progression, and filtering by `All`, `Active`, `Fixed`, or `Completed`.

### 3.6 Google Calendar Bi-Directional Delta Synchronization
- **Incremental Sync Tokens**: Uses Google Calendar API v3 `nextSyncToken` to download only modified/deleted events.
- **Configurable Auto-Sync Cadence**: Background timer triggers sync at user-selected interval:
  - `15m`, `30m` (default), `1h`, `6h`, `12h`, `1d`, `1w`, or `manual`.
- **Conflict Management**: Identifies local vs. remote collisions and renders a side-by-side comparison modal allowing the user to select the source of truth.

### 3.7 Behavioral Growth & Flow Immersion Hub (`/growth`)
- **Csíkszentmihályi Flow Timer**: Focus timers ($20\text{m}$ to $90\text{m}$) tracking focus immersion, interruptions, and post-session reflection.
- **Quadratic Challenge-Skill Mapping**: Plots subjective ratings ($1$ to $5$) onto a 2D matrix identifying Flow, Anxiety, Boredom, or Steady.
- **BJ Fogg Tiny Habits & 2-Minute Activations**: Decomposes habits into starter actions anchored to daily contextual cues.
- **Self-Reported Habit Index (SRHI)**: Automaticity tracking on validated scales without punitive streak resets.

### 3.8 Environmental Sustainability & Eco Tracker
- **Active Commute Tracking**: Logs walking and cycling commutes, calculating $CO_2$ avoided ($0.21\text{ kg/km}$).
- **Digital Notes Savings**: Tracks paperless study hours ($0.05\text{ kg CO}_2\text{/hr}$).
- **Composite Green Score**: Aggregates sustainable choices into an index ($0$ to $100$) with seedling equivalence.

---

## 4. Non-Functional & Technical Requirements

### 4.1 Performance & Responsiveness
- **Initial Load Time**: $<1.5\text{s}$ First Contentful Paint (FCP) on broadband.
- **Scheduling Calculation**: $<50\text{ms}$ deterministic solve time for a 24-hour window.
- **Zero Horizontal Overflow**: Validated across $320\text{px}$, $375\text{px}$, $390\text{px}$, $430\text{px}$, $768\text{px}$, $1024\text{px}$, and $1440\text{px}$.
- **Touch Target Accessibility**: Minimum $44 \times 44\text{px}$ touch targets across all mobile buttons and navigation items.

### 4.2 Data Integrity & Fault Tolerance
- **Corrupted JSON Recovery**: Automatic isolation of malformed storage payloads to backup keys without UI crashes.
- **Lossless Schema Migration**: Backward-compatible state migrations preserving custom user tasks.
- **Notification Persistence**: Dismissals and clearances persist across browser reloads.
