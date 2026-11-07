# PROJECT_SPEC.md — AI Time Manager Specifications & Requirements

## 1. Product Overview
The **AI Time Manager** ("Kronos AI") is an intelligent personal planning assistant engineered for students, working professionals, and individuals managing combined academic and professional obligations. It unifies daily scheduling, goal roadmapping, habit building, flow sessions, and calendar synchronization into a calm, notebook-inspired interface.

---

## 2. Target User Types & Workflows

### 2.1 The Student
- **Academic Context**: University courses, lab sessions, weekly problem sets, midterms, final exam dates.
- **Needs**: Balancing lecture timetables with study sessions, assignment deadlines, library blocks, campus commuting, and healthy sleep balance.
- **Pain Point**: Overestimating available hours between classes and procrastinating on heavy multi-week projects.
- **Onboarding Specialization**: Collects course/degree, institution, semester, weekly class schedule, exams, assignment deadlines, and study commitments.

### 2.2 The Working Professional
- **Work Context**: Core working hours, stakeholder standups, code reviews, client workshops, cross-team deadlines.
- **Needs**: Protecting deep work blocks from meeting proliferation, handling urgent firefighting without losing daily goals.
- **Pain Point**: Context switching, fatigue, and inability to maintain personal habits (gym, reading) around unpredictable meetings.
- **Onboarding Specialization**: Collects profession/role, organization, core working hours, recurring meetings, key responsibilities, and sprint deadlines.

### 2.3 The Dual-Track Individual (Both)
- **Context**: Working professional concurrently enrolled in university courses, evening degrees, or professional certifications.
- **Needs**: Tight synchronization between office shifts, evening lectures, and weekend assignment crunch times without cognitive burnout.
- **Onboarding Specialization**: Collects both full academic timetables and professional workplace commitments.

---

## 3. Functional Requirements

### 3.1 Primary Workspaces & Navigation Architecture
- **Server-Side Route Protection**: Next.js 16 Middleware (`src/middleware.ts`) enforcing session authentication via `@supabase/ssr`. Unauthenticated access to protected workspaces (`/home`, `/ai`, `/my-day`, `/growth`, `/profile`, `/onboarding`) is redirected to `/login`.
- **Persistent Bottom Dock Navigation**: Fixed bottom navigation dock (`BottomNav`) providing instant access to the four primary destinations (`Home`, `AI`, `My Day`, `Growth`) with minimum 48px touch targets and device safe-area padding. Zero requirement to open menus for primary navigation.
- **Clean Mobile Top Header**: Clean 44px user avatar button (opens profile/settings), discreet sync status, notification bell, and quick action.
- **Home (`/home`)**: Personal planner feel. Editorial date briefing, central architectural calendar with daily rhythm, horizontally browsable suggested schedule blocks with snap scrolling and pagination dots (`•••`), and docked bottom pill CTA: `Plan my day with AI`.
- **AI (`/ai`)**: Dedicated conversational planning assistant. Translates natural language into deterministic schedule blocks. Horizontally browsable prompt chips, clean proposal cards with 1-tap `Apply Proposed Schedule to My Day`, speech dictation modal, and 100dvh mobile height adaptation with keyboard resilience. Honest connection reporting (requires `GEMINI_API_KEY`).
- **My Day (`/my-day`)**: Daily execution workspace. Features dominant **Focus Spotlight Ring** dial with live task details, duration countdown, and play button; daily progress summary pill; horizontally browsable upcoming queue; open vertical timeline; dynamic mid-day reschedule action; and docked bottom pill CTA: `Start focus session`.
- **Growth (`/growth`)**: Behavior, Flow & Development workspace with non-competing top segmented pill control:
  - **Habits Tab**: Clear/Fogg cue anchoring, 2-minute minimum activation versions, empirical 7-day completion rate, cue consistency tracking, and optional self-reported automaticity on the validated 1–5 Self-Report Habit Index (SRHI) scale. Avoids presenting unvalidated percentages as cognitive measurements. Contextual CTA: `Add new habit`.
  - **Flow Theory Tab**: Mihaly Csíkszentmihályi Challenge–Skill Check-In with 2D quadrant evaluation (*Flow Channel, Anxiety, Boredom, Apathy*), adaptive recommendations, circular persistent background focus timer across workspaces, distraction logger, and post-session reflection modal. Contextual CTA: `Start focus interval` / `Pause focus interval`.
  - **Habit Reset Tab**: Bas Verplanken & Wendy Wood Habit Discontinuity Hypothesis. Captures life transitions, catalogs obsolete cues and disrupted routines, and materializes new anchor habits directly into active habits collection. Contextual CTA: `Log life discontinuity`.
  - **Insights Tab**: Empirical analytics computed directly from focus sessions log (zero vs interrupted absorption ratings) and highest adherence & cue consistency habit metrics.

### 3.2 AI Assistant Capabilities
- Conversational schedule generation from natural language prompts.
- Dynamic rescheduling when priorities shift or morning sessions run late.
- Preference memory extraction (preferred study length, break interval, high-energy hours).
- Zod-enforced structured outputs preventing malformed actions.
- Server-side runtime validation with honest HTTP 503 fallback when `GEMINI_API_KEY` is unconfigured.

### 3.3 Scheduling Engine Requirements
- Deterministic conflict checking: Fixed events (classes, client calls) cannot be moved or overlapped.
- Physiological realism: Mandatory sleep windows, meal breaks, and travel/transition buffers.
- Energy matching: Assign heavy analytical tasks to the user's reported peak focus hours.
- Clear explanatory feedback when requested workloads exceed available time.

### 3.4 Calendar Synchronisation
- Unified `CalendarAdapter` interface with Google Calendar API v3 native support.
- Safe two-way sync with incremental change detection, conflict prevention, and deletion handling.
- Honest connection reporting: Displays configuration guidance when OAuth credentials are absent.

### 3.5 Multi-User Security & Row Level Security (RLS)
- Every user-owned table enforces strict Row Level Security (`auth.uid() = user_id`).
- Isolated user tables: `profiles`, `tasks`, `calendar_events`, `goals`, `habits`, `focus_sessions`, `onboarding_records`, `academic_details`, `professional_details`.
- Client requests only receive and manipulate authenticated user records.
