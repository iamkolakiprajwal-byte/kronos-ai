# PROJECT_CONTEXT.md — AI Time Manager Central Source of Truth

> **CRITICAL DIRECTIVE**: Read this document before starting any development session. Update it whenever features, architectural decisions, or phase statuses change. This document serves as the permanent memory and single source of truth for the entire application across all sessions.

---

## 1. Project Identity & Overview

- **Product Name**: AI Time Manager ("Kronos AI")
- **Product Vision**: An intelligent, adaptive personal planning assistant engineered for students, working professionals, and individuals managing combined academic and professional responsibilities. Rather than acting as a static calendar or rigid to-do list, Kronos understands the user's daily biological routine, existing commitments, personal energy preferences, behavioral habits, and multi-horizon goals, helping them organize their time realistically and adapt dynamically when plans change.
- **Problem Statement**: Existing productivity platforms force users into either manual calendar time-blocking or static checklists. When unexpected meetings occur, morning study sessions run late, or energy slumps hit, rigid schedules collapse, leading to schedule fatigue, guilt over unfinished tasks, and abandoned habits. Users need a system that adapts flexibly, protects cognitive flow, and provides realistic, conflict-free daily structure.
- **Target Users**:
  1. *Students*: Balancing course timetables, laboratory sessions, assignment deadlines, library study blocks, exam preparation, and healthy sleep.
  2. *Working Professionals*: Protecting deep work blocks from meeting proliferation, handling standups, 1-on-1s, and sprint deliverables without burning out.
  3. *Dual-Track (Both)*: Individuals juggling evening degree programs or certifications alongside full-time or part-time professional careers.
- **Core Product Features**:
  1. *Conversational Daily Planning*: Natural language task extraction ("Today I have two assignments to complete, need to study economics for an hour, attend classes, hit the gym and learn Blender").
  2. *Deterministic Scheduling Engine*: Pure TypeScript constraint-satisfaction solver guaranteeing zero hallucinated overlaps over fixed commitments, physiological sleep boundaries, lunch buffers, and peak energy curve placement.
  3. *Strategic Goals & AI Roadmaps*: Multi-horizon goal decomposition into chronological milestone phases and daily agenda-ready actionable tasks with 1-click scheduling.
  4. *Habits & Flow Theory Focus Sessions*: Csíkszentmihályi immersion timers (20m, 25m, 45m, 50m, 90m) with post-session reflection logging (*Flow, Steady, Boredom, Anxiety*) and habit automaticity tracking without punitive streak resets.
  5. *Two-Way Calendar Synchronization*: Shared adapter architecture with active mock sync and Google Calendar API v3 implementation, real-time conflict detection, and side-by-side resolution.
  6. *Browser Voice Input*: Web Speech API integration with microphone toggle, real-time streaming transcript, and edit-before-submit verification modal.
  7. *Environmental Sustainability*: Behavioral carbon offset and tree equivalence tracker for active commutes (cycling/walking), paperless study notes, power-down hours, and plant meals.
  8. *13-Stage Guided Onboarding*: Role-based wizard with interactive timetable and recurring meetings editors, and instant 1-click evaluation presets.
- **Original Notebook-Inspired UI Concept**:
  - Alabaster warm paper background (`#faf9f6`), warm slate structural borders (`#e6e3da`), and subtle ruled divider accents (`#f0ede6`).
  - Distinctive editorial serif headings paired with clean, legible sans-serif utility text and monospace time badges.
  - Zero fluorescent alerts, high visual noise, or frantic gamification.
- **Desktop & Mobile Requirements**:
  - Desktop: Full multi-column journal layout with persistent left sidebar, prominent 7-column calendar grid, side-by-side agenda and metrics, and docked assistant.
  - Mobile & Tablet: Seamless responsiveness down to 375px width, slide-out hamburger navigation drawer or bottom navigation bar, adaptive micro-calendar grid, vertical agenda cards with min 44x44px touch targets, and expandable assistant sheet.
- **Assignment & Demo Objectives**:
  - Run completely in a high-fidelity **DEMO / ASSIGNMENT MODE** without requiring real Google account OAuth or live payment infrastructure.
  - Provide instant one-click demonstration presets for **Student (Aria Chen)**, **Professional (Marcus Reed)**, and **Dual Track (Elena Rostova)**.
- **Technology Stack**:
  - **Frontend**: Next.js 16 (App Router with Turbopack), React 19, TypeScript, Tailwind CSS v4, Lucide Icons, date-fns.
  - **Backend**: Next.js Route Handlers, TypeScript, server-side Zod input validation.
  - **Database & Auth**: Supabase PostgreSQL, Supabase Auth, Row Level Security (RLS) policies.
  - **AI Integration**: Google Gemini API via server-side Route Handlers with provider abstraction and structured JSON schemas (`responseSchema`).
  - **Scheduling**: Deterministic TypeScript constraint-satisfaction scheduling engine.
  - **Calendar**: Shared `CalendarAdapter` interface (`MockCalendarAdapter` for evaluation, `GoogleCalendarAdapter` for production).
  - **Notifications**: PWA, Service Worker, Web Push API, VAPID keys.
  - **Voice**: Browser Web Speech API with microphone control and manual text fallback.

---

## 2. Technical Architecture

```
                                      +---------------------------------------------+
                                      |           Next.js 16 App Shell              |
                                      |  (/home, /plan, /goals, /habits, /profile)  |
                                      |      (/onboarding wizard, /login, /signup)  |
                                      +----------------------+----------------------+
                                                             |
                             +-------------------------------+-------------------------------+
                             |                                                               |
                             v                                                               v
+----------------------------+---------------------------+       +---------------------------+---------------------------+
|          Next.js Route Handlers (Server)               |       |               Client State & Web APIs                     |
|  - /api/ai/chat (Gemini & Mock intent parsing)         |       |  - DemoProvider State Engine                              |
|  - /api/schedule/generate (Deterministic engine)       |       |  - Web Speech API Dictation (useSpeechRecognition)        |
|  - /api/calendar/sync (Google Calendar Adapter)        |       |  - Flow Focus Timer & Post-Session Reflection Log         |
|  - /api/goals/decompose (Roadmap multi-phase planner)  |       |  - Carbon Savings & Eco Tracker Model                     |
+----------------------------+---------------------------+       +-----------------------------------------------------------+
                             |                                                               |
                             v                                                               v
              +--------------+--------------+                                 +--------------+--------------+
              |                             |                                 |                             |
              v                             v                                 v                             v
+-------------+-------------+ +-------------+-------------+     +-------------+-------------+ +-------------+-------------+
|    Gemini AI Provider     | |  Deterministic Scheduler  |     |   Google Calendar Adapter   | |  Supabase PostgreSQL RLS   |
|  - Server-side Zod JSON   | |  - Zero-overlap guarantee |     |  - Sync token state machine | |  - 16 core relational     |
|  - Structured schemas     | |  - Sleep & meal buffers   |     |  - Side-by-side conflict UI | |    migration tables       |
|  - Preference memory      | |  - Energy window match    |     |  - Simulated external shift | |  - User tenant isolation  |
+---------------------------+ +---------------------------+     +-----------------------------+ +---------------------------+
```

### 2.1 Frontend Architecture
- **Framework**: Next.js 16 App Router (`src/app`).
- **Design System**: Calm notebook-inspired visual theme (`#faf9f6` alabaster background, warm slate borders `#e6e3da`, serif headings, subtle ruled lines, zero visual clutter).
- **Persistent Shell**: Sidebar navigation (`src/components/layout/sidebar.tsx`), top header with time-based greeting, date badge, notification bell, calendar sync pill, and `+ New Task` trigger (`src/components/layout/header.tsx`).
- **Core Views**:
  - `/home`: Month calendar with scheduled activity indicators, today's agenda with lock indicators for fixed commitments, progress metrics, and docked AI assistant.
  - `/plan`: Detailed daily and weekly filterable task schedules (All, Active, Urgent, Completed).
  - `/goals`: Short and long-term milestones with AI roadmap decomposition, New Goal modal, and 1-click agenda scheduling.
  - `/habits`: Habit automaticity tracking, Csíkszentmihályi Flow timer (20m, 25m, 45m, 50m, 90m), and post-session reflection log.
  - `/profile`: Biological routine parameters, academic/work details, calendar connection mode, and interactive Environmental Sustainability dashboard.
  - `/onboarding`: 13-stage guided onboarding wizard with dynamic step routing and single-click demo presets.
  - `/login` & `/signup`: Minimalist notebook authentication screens with 1-click persona demo buttons.

### 2.2 Backend Architecture
- Next.js Route Handlers located in `src/app/api/...`.
- Strict server-side Zod validation for all client inputs and AI outputs.
- Stateless, secure server execution (API keys and service role credentials never exposed to client bundles).

### 2.3 Database Architecture (16 Relational Tables)
Progressively implemented via Supabase PostgreSQL migrations with foreign key constraints, indexes, and Row Level Security (RLS) in `supabase/migrations/20261102000000_initial_schema.sql`:
1. `profiles`: User identity, role (`student`, `professional`, `both`), avatar, headline, institution/company.
2. `user_preferences`: Waking time, sleeping target, productive window, preferred focus/break durations, planning style.
3. `availability_rules`: Weekly recurring availability windows and protected blackout periods.
4. `recurring_events`: Class timetables, recurring standups, and fixed meetings.
5. `tasks`: Actionable tasks with priority (`urgent`, `high`, `medium`, `low`), estimated duration, category, deadline, scheduled dates, and fixed status.
6. `calendar_events`: Calendar entries with start/end timestamps, category, location, and color tagging.
7. `goals`: Strategic outcomes with target completion dates, priority, and progress percentage.
8. `goal_milestones`: Discrete checkpoints nested within goals with due dates and completion states.
9. `habits`: Daily/weekly behavioral routines with target durations, anchor cues, and streaks.
10. `habit_logs`: Timestamped completion records measuring consistency and automaticity.
11. `chat_sessions`: Conversational threads between user and AI planner.
12. `chat_messages`: Structured dialogue entries including suggested tasks and action payloads.
13. `user_memory`: Extracted user habits, delayed tasks, and scheduling preferences.
14. `notification_jobs`: Scheduled reminders for upcoming lectures, meetings, and habits.
15. `calendar_connections`: OAuth tokens, external calendar IDs, and sync metadata.
16. `push_subscriptions`: Web Push endpoint registrations and VAPID public keys.

### 2.4 AI Provider Architecture & Fallback Behavior
- **Provider Interface**: `AIProvider` in `src/lib/ai/provider.ts`.
- **Active Provider**: Dynamically selected by `getAIProvider()` in `src/lib/ai/index.ts`:
  - If `GEMINI_API_KEY` is present in environment: Uses `GeminiProvider` (Google Gemini 2.5 Flash with structured `responseSchema`).
  - If `GEMINI_API_KEY` is absent (Default evaluation mode): Uses `MockAIProvider` (rich context-aware offline NLP engine).
- **Conversational Intent Classification**:
  - Differentiates casual greetings (*"hello"*), identity queries (*"what are you doing"*), and agenda status checks (*"what's on my schedule"*) from actual scheduling requests.
  - Returns `intent: "general_query"` and `extractedTasks: []` (empty array) for non-task remarks, completely eliminating task hallucination.
  - Only extracts tasks when actionable verbs (*study, work, complete, gym, code, review*) or explicit durations are present.

### 2.5 Deterministic Scheduling Engine
- Pure TypeScript constraint-satisfaction solver in `src/lib/scheduler/engine.ts`.
- Rules enforced:
  1. Never overlap fixed commitments (classes, laboratory blocks, client standups).
  2. Respect biological boundaries (never schedule before wake time or past sleep target).
  3. Automatic midday meal/recharge buffer protection (12:00–14:00 window).
  4. Match cognitive difficulty to the user's peak focus window.
  5. Hard conflict detection returning explicit unfeasible warnings if workload exceeds capacity.
  6. Mid-day dynamic rescheduling honoring current time and preserving completed tasks.

### 2.6 Calendar Integration Architecture
- Shared `CalendarAdapter` interface in `src/lib/calendar/types.ts`.
- `MockCalendarAdapter`: High-fidelity state machine with simulated external modifications, sync tokens, and conflict simulation for grading/evaluation.
- `GoogleCalendarAdapter`: Production Google Calendar API v3 implementation with OAuth2 token exchange and RFC 3339 date handling. Automatically delegates to `MockCalendarAdapter` when credentials are not configured.

### 2.7 Notification & Voice Architecture
- **Notifications**: PWA manifest (`public/manifest.json`), service worker (`public/sw.js`), scheduled reminder service (`src/lib/notifications/reminder-service.ts`).
- **Voice**: Browser Web Speech API hook (`src/hooks/use-speech-recognition.ts`) with live transcript streaming, microphone pulse indicator, and edit-before-submit modal in `assistant-input.tsx`.

### 2.8 Deployment Configuration
- Vercel-ready Next.js 16 App Router configuration with Turbopack.
- Pure stateless server execution (all API keys strictly server-side).
- Client build operates 100% offline-resilient with memory fallbacks.

---

## 3. Comprehensive Feature Development Status

| Feature / Subsystem | Status | Exact Details |
|:---|:---|:---|
| **Notebook UI Shell & Design System** | **Implemented and tested** | `#faf9f6` paper palette, `#e6e3da` borders, serif titles, sticky header, persistent sidebar. |
| **Home Dashboard & Daily Agenda** | **Implemented and tested** | Daily chronological agenda, fixed commitment locks, duration badges, progress bar, task status toggles. |
| **Month Calendar Planner** | **Implemented and tested** | Month/year navigation, today jumper, multi-color activity indicator dots powered by `date-fns`. |
| **Quick Task Creation Modal** | **Implemented and tested** | Duration presets (25m, 45m, 60m, 90m), priority select, category tagging. |
| **13-Stage Onboarding Wizard** | **Implemented and tested** | Multi-step navigation with progress bar, dynamic routing for Student/Pro/Both, interactive timetable editor, interactive recurring meetings editor, 1-click evaluation presets (`Aria Chen`, `Marcus Reed`, `Elena Rostova`), initial schedule preview & approval pipeline. |
| **Authentication Screens (`/login`, `/signup`)** | **Implemented and tested** | Minimalist notebook auth screens with 1-click persona demo logins and demo mode toggles. |
| **Supabase PostgreSQL Schema & RLS** | **Implemented and tested** | 16 relational tables (`supabase/migrations/20261102000000_initial_schema.sql`) with foreign keys, indexes, and Row Level Security (`auth.uid() = user_id`). |
| **Live Supabase Client / Auth Sync** | **Mock implementation** | When `NEXT_PUBLIC_SUPABASE_URL` is unconfigured, seamlessly falls back to local in-memory state so evaluation never breaks. Full `@supabase/ssr` code ready for live credentials. |
| **Gemini AI Provider (`GeminiProvider`)** | **Blocked by missing credentials** | Structured JSON schema implementation via Google Gemini 2.5 Flash API ready; active when `GEMINI_API_KEY` is present. |
| **Context-Aware Offline AI (`MockAIProvider`)** | **Implemented and tested** | Active default AI engine. Understands natural language daily planning ("two assignments, study econ, gym, blender"), urgent interruptions, rescheduled sessions, schedule status inquiries, and conversational questions (with zero hallucinated tasks). |
| **Deterministic Scheduling Engine** | **Implemented and tested** | Pure TypeScript constraint-satisfaction solver (`src/lib/scheduler/engine.ts`). Enforces zero overlap over fixed commitments, sleep boundaries, lunch buffers, peak energy matching, conflict detection, and dynamic rescheduling. 13/13 unit tests passed. |
| **Strategic Goals & AI Roadmaps** | **Implemented and tested** | Multi-horizon goal decomposition (`src/lib/ai/roadmap.ts`, `/api/goals/decompose`), New Goal modal, milestone checkboxes with live progress calculation, 1-click AI breakdown, and "Schedule in Today's Agenda" insertion. 7/7 unit tests passed. |
| **Habits & Flow Theory Focus Sessions** | **Implemented and tested** | Csíkszentmihályi Flow timer (20m, 25m, 45m, 50m, 90m presets), post-session reflection modal evaluating immersion state (*Flow, Steady, Boredom, Anxiety*), habit automaticity scoring without streak shame, reflection history log. |
| **Calendar Adapter Architecture** | **Implemented and tested** | Shared `CalendarAdapter` interface, sync token state machine, event push/delete. 9/9 unit tests passed. |
| **Two-Way Calendar Sync (Mock Evaluation)** | **Mock implementation** | Interactive Google Calendar two-way sync simulation with incremental tokens, simulated remote changes, conflict detection, and side-by-side conflict resolution modal in the header. |
| **Google Calendar API v3 Live Sync** | **Blocked by missing credentials** | Production adapter architecture (`src/lib/calendar/google-adapter.ts`) implemented with OAuth2 and RFC 3339 date handling; automatically falls back to `MockCalendarAdapter` when OAuth credentials are not supplied. |
| **Browser Voice Input** | **Implemented and tested** | Browser Web Speech API hook (`useSpeechRecognition`) with microphone toggle, real-time transcription, and edit-before-submit modal in `assistant-input.tsx`. |
| **Notifications & Scheduled Reminders** | **Implemented and tested** | Service worker (`sw.js`), Web App Manifest (`manifest.json`), scheduled reminder scanner for classes and urgent tasks (`reminder-service.ts`). |
| **Environmental Sustainability Dashboard** | **Implemented and tested** | Behavioral carbon savings model (`eco-calculator.ts`), live CO₂ saved (kg), tree absorption equivalents, active commute minutes, eco score (0-100), and 1-click eco action loggers. 8/8 unit tests passed. |
| **Multi-Persona Demo Switching** | **Implemented and tested** | Instant client role switching (*Student: Aria Chen*, *Professional: Marcus Reed*, *Both: Elena Rostova*) with dynamic timetable, goals, and habits. |
| **Responsive Mobile, Tablet & Desktop Layouts** | **Implemented and tested** | Full responsive support across Desktop (>=1024px), Tablet (768px-1023px icon rail), and Mobile (320px-767px fixed bottom nav + slide drawer). Week/Month calendar toggle, mobile bottom-sheet modals, >44px touch targets. Tested across 320px, 375px, 390px, 430px, 768px, 1024px, 1366px, 1920px. |

---

## 4. Complete Project Files Inventory

```
ai-time-manager/
├── public/
│   ├── manifest.json                       # PWA Web App Manifest
│   ├── sw.js                               # Service worker for offline caching & push alerts
│   ├── file.svg, globe.svg, next.svg, vercel.svg, window.svg
├── supabase/
│   └── migrations/
│       └── 20261102000000_initial_schema.sql # 16 relational tables with RLS and indexes
├── tests/
│   ├── scheduler/
│   │   └── scheduler.test.ts               # 13/13 passing tests for deterministic engine
│   ├── calendar/
│   │   └── calendar-sync.test.ts           # 9/9 passing tests for Google Calendar sync adapter
│   ├── sustainability/
│   │   └── eco-calculator.test.ts          # 8/8 passing tests for carbon & eco metrics
│   └── ai/
│       └── roadmap.test.ts                 # 7/7 passing tests for AI roadmap decomposition
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx              # Notebook auth login with 1-click persona demo
│   │   │   └── signup/page.tsx             # Notebook auth registration
│   │   ├── (dashboard)/
│   │   │   ├── home/page.tsx               # Main command center: Calendar, Agenda, AI dock
│   │   │   ├── plan/page.tsx               # Schedule & task management view
│   │   │   ├── goals/page.tsx              # Interactive Goals, AI Roadmap & task scheduler
│   │   │   ├── habits/page.tsx             # Habit formation & Flow Theory timer & reflection log
│   │   │   ├── profile/page.tsx            # User profile, routine settings & Eco Tracker
│   │   │   └── layout.tsx                  # Dashboard layout wrapping Sidebar and Header
│   │   ├── api/
│   │   │   ├── ai/chat/route.ts            # Server-side conversational AI Route Handler
│   │   │   ├── calendar/sync/route.ts      # Server-side Google Calendar sync Route Handler
│   │   │   ├── goals/decompose/route.ts    # Server-side AI roadmap decomposition Route Handler
│   │   │   └── schedule/generate/route.ts  # Server-side deterministic scheduler Route Handler
│   │   ├── onboarding/
│   │   │   └── page.tsx                    # Multi-step Onboarding wizard controller
│   │   ├── layout.tsx                      # Root HTML layout with DemoProvider
│   │   ├── page.tsx                        # Root redirect to /home
│   │   ├── globals.css                     # Calm notebook design tokens & custom scrollbars
│   │   └── favicon.ico
│   ├── components/
│   │   ├── layout/
│   │   │   ├── sidebar.tsx                 # Responsive sidebar (desktop 256px, tablet 80px rail, mobile drawer)
│   │   │   ├── header.tsx                  # Top bar with greeting, GCal sync pill, hamburger & conflict modal
│   │   │   └── bottom-nav.tsx              # Fixed mobile bottom navigation bar (Home, Plan, Goals, Habits, Profile)
│   │   ├── calendar/
│   │   │   └── month-calendar.tsx          # Month/year planner with color-coded activity dots
│   │   ├── dashboard/
│   │   │   ├── daily-agenda.tsx            # Chronological agenda, progress bar, fixed/flexible locks
│   │   │   └── quick-task-modal.tsx        # Quick task modal with duration presets
│   │   ├── ai-chat/
│   │   │   └── assistant-input.tsx         # AI assistant dock with Web Speech API voice dictation
│   │   └── onboarding/
│   │       ├── step-indicator.tsx          # Progress bar & single-click preset auto-fill buttons
│   │       ├── step-welcome.tsx            # Stage 1: Product introduction & philosophy
│   │       ├── step-user-type.tsx          # Stage 2: Selection of Student, Professional, or Both
│   │       ├── step-personal-info.tsx      # Stage 3: Name, email, title, institution with validation
│   │       ├── step-daily-routine.tsx      # Stage 4: Wake/sleep times, peak energy periods
│   │       ├── step-academic-info.tsx      # Stage 5: Course, semester, interactive timetable editor
│   │       ├── step-professional-info.tsx # Stage 6: Job role, working hours, recurring meetings editor
│   │       ├── step-goals.tsx              # Stage 7: Short & long-term goals
│   │       ├── step-habits.tsx             # Stage 8: Anchor habits & desired habits
│   │       ├── step-productivity-preferences.tsx # Stage 9: Focus durations, breaks, planning styles
│   │       ├── step-sustainability.tsx     # Stage 10: Environmental routines opt-in
│   │       ├── step-review-summary.tsx     # Stage 11: Review summary card with jump-to-edit links
│   │       └── step-schedule-preview.tsx   # Stage 12: Initial schedule preview & approval
│   ├── context/
│   │   └── demo-context.tsx                # Central state provider: roles, tasks, events, sync, eco
│   ├── hooks/
│   │   └── use-speech-recognition.ts       # Browser Web Speech API hook for voice commands
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── types.ts                    # AI planning, task extraction, schedule request contracts
│   │   │   ├── provider.ts                 # AIProvider interface
│   │   │   ├── gemini-provider.ts          # Structured schema Gemini 2.5 Flash implementation
│   │   │   ├── mock-provider.ts            # Context-aware offline NLP provider matching user constraints
│   │   │   ├── memory.ts                   # Structured user preferences & habits memory manager
│   │   │   ├── roadmap.ts                  # Multi-week goal decomposition into actionable daily tasks
│   │   │   └── index.ts                    # Factory dynamically returning live Gemini or Mock AI
│   │   ├── calendar/
│   │   │   ├── types.ts                    # Calendar adapter contracts, SyncResult, SyncConflict
│   │   │   ├── mock-adapter.ts             # Two-way sync state machine with simulated external edits
│   │   │   └── google-adapter.ts           # Google Calendar API v3 implementation with OAuth2 handling
│   │   ├── notifications/
│   │   │   └── reminder-service.ts         # Scheduled reminder scanner for classes and focus blocks
│   │   ├── sustainability/
│   │   │   └── eco-calculator.ts           # Carbon offset and tree equivalence calculation models
│   │   ├── scheduler/
│   │   │   ├── types.ts                    # Scheduling engine input/output types & conflict structures
│   │   │   └── engine.ts                   # Pure TypeScript deterministic constraint-satisfaction solver
│   │   ├── supabase/
│   │   │   ├── client.ts                   # Browser Supabase client with offline demo fallback
│   │   │   └── server.ts                   # Server-side Supabase client with safe demo mocks
│   │   ├── mock/
│   │   │   └── demo-data.ts                # Rich datasets for Student, Pro, Both & onboarding presets
│   │   └── utils.ts                        # Styling utilities (cn) and formatMinutes
│   └── types/
│       └── index.ts                        # TypeScript interfaces for all domain entities
├── .env.example                            # Template for Gemini, Supabase, Google Calendar, VAPID
├── CHANGELOG.md                            # Version history (0.1.0, 0.2.0, 0.3.0, 0.4.0)
├── PROJECT_SPEC.md                         # Detailed functional and non-functional requirements
├── README.md                               # Setup, architecture overview, and navigation guide
├── package.json                            # Next.js 16, React 19, Tailwind CSS v4, Lucide, date-fns, zod, supabase
└── PROJECT_CONTEXT.md                      # Permanent central source of truth
```

---

## 5. Testing Record & Verification History

### 5.1 Automated Test Suite (`npm test`)
All 37 unit tests pass across 4 separate domain test suites:
- **Deterministic Scheduling Engine (`tests/scheduler/scheduler.test.ts`)**: 13/13 PASSED
  - Time conversion utilities (`timeToMinutes`, `minutesToTime`).
  - Feasibility under normal workload.
  - Verification that candidate tasks do not overlap fixed lectures (`ECON 201`, `CS 106B Lab`).
  - Verification that all placements conclude before 23:00 sleep target.
  - Detection and explicit reporting of overbooked schedule conflicts.
  - Mid-day dynamic rescheduling placing new tasks strictly after current time.
- **Calendar Adapter & Two-Way Sync (`tests/calendar/calendar-sync.test.ts`)**: 9/9 PASSED
  - Initial remote change fetching and sync token initialization.
  - Incremental sync token preservation.
  - Local event push and remote ID mapping.
  - Simulated conflict generation and Google Calendar source detection.
  - Conflict resolution confirmation.
- **Sustainability & Carbon Calculator (`tests/sustainability/eco-calculator.test.ts`)**: 8/8 PASSED
  - Total CO₂ saved in kg from sample entries.
  - Active commute minutes sum (cycling + walking).
  - Paperless study hours calculation.
  - Eco score computation (0-100).
  - Empty log resilience.
  - Incremental entry addition math.
- **AI Roadmap Decomposition (`tests/ai/roadmap.test.ts`)**: 7/7 PASSED
  - Academic goal decomposition into 3 chronological phases with daily action tasks.
  - Skills goal decomposition with hands-on capstone focus.
  - Career goal decomposition with high cognitive difficulty ratings.

### 5.2 Next.js Production Build (`npm run build`)
- Compiled successfully with 0 TypeScript and 0 prerender errors.
- Built all 16 static and dynamic routes in 295ms.

---

## 6. Architecture Decisions Record

1. **Deterministic vs. LLM Scheduling**:
   - *Decision*: Large Language Models are used strictly for intent extraction and natural language dialogue; the deterministic TypeScript scheduler calculates exact collision-free intervals, respecting physiological constraints.
   - *Reason*: Eliminates hallucinated time allocations, impossible time overlaps, and timezone bugs.
2. **Fail-Soft AI & Database Fallback**:
   - *Decision*: All client calls to `/api/ai/chat`, `/api/schedule/generate`, and Supabase feature automatic fallbacks to local memory state so the app never crashes when external credentials are absent.
   - *Reason*: Guarantees seamless academic evaluation and demo review without requiring live API keys.
3. **Conversational Intent Separation**:
   - *Decision*: Explicitly separate conversational queries (*"what are you doing"*, *"who are you"*, *"hello"*) from scheduling actions.
   - *Reason*: Prevents casual questions from being converted into literal tasks and placed onto the calendar.
4. **Next.js 16 Partial Prerendering & Date Hydration**:
   - *Decision*: Static prerender state uses a deterministic reference timestamp (`2026-11-02T00:00:00`) and synchronizes client timestamps in `useEffect`.
   - *Reason*: Resolves Next.js 16 Turbopack SSR build errors.
5. **Pre-Responsive Backup Preservation**:
   - *Decision*: Created a dedicated standalone archive `ai-time-manager-backup-pre-responsive.tar.gz` (175 KB) at `/Users/prajwalkolaki/.gemini/antigravity/scratch/ai-time-manager-backup-pre-responsive.tar.gz`.
   - *Reason*: Protects working functionality before initiating major viewport layout modifications.

---

## 7. Dated Development History Log

### Session 1: 2026-11-02 — Phase 1: Project Foundation & Shell
- Initialized Next.js 16 (App Router) with React 19, TypeScript, and Tailwind CSS v4.
- Created central documentation files: `PROJECT_CONTEXT.md`, `PROJECT_SPEC.md`, `CHANGELOG.md`, `README.md`, `.env.example`.
- Designed notebook-inspired application shell with persistent sidebar, sticky header, prominent monthly calendar with activity dots, daily agenda with fixed/flexible locks, quick task modal, and conversational AI assistant dock.
- Built interactive `DemoProvider` context with instant persona switching, task status toggling, and habit tracking.
- Commit: `cb17862`

### Session 2: 2026-11-02 — Phase 2: Onboarding & User Profile
- Built complete multi-step Onboarding flow in `src/app/onboarding/page.tsx` with dynamic step indicators and percentage progress bar across 13 stages.
- Implemented single-click Demo Presets for Student (`Aria Chen`), Professional (`Marcus Reed`), and Both (`Elena Rostova`).
- Interactive Timetable Editor for students and Recurring Meetings Editor for professionals.
- Integrated `completeOnboarding` in `DemoProvider` to persist user profile, load timetable commitments, and configure personalized AI assistant greetings.
- Commit: `1e05086`

### Session 3: 2026-11-02 — Sprint 1: AI & Core Functionality
- Authored full PostgreSQL migration in `supabase/migrations/20261102000000_initial_schema.sql` spanning 16 tables with Row-Level Security (`auth.uid() = user_id`) and performance indexes.
- Built Supabase client/server singletons with fail-safe demo fallbacks in `src/lib/supabase/client.ts` and `src/lib/supabase/server.ts`.
- Created notebook-styled authentication pages in `src/app/(auth)/login/page.tsx` and `src/app/(auth)/signup/page.tsx`.
- Architected AI Provider abstraction layer (`GeminiProvider`, `MockAIProvider`, `memory.ts`).
- Built server-side Route Handlers `/api/ai/chat` and `/api/schedule/generate`.
- Implemented pure TypeScript Deterministic Scheduling Engine in `src/lib/scheduler/engine.ts` with 13/13 unit tests passed.
- Commit: `606a127`

### Session 4: 2026-11-02 — Sprint 2 & 3: Productivity, Integrations, Testing & Build Verification
- Built AI goal decomposition engine in `src/lib/ai/roadmap.ts` and `/api/goals/decompose`.
- Overhauled `src/app/(dashboard)/goals/page.tsx` with category filters, New Goal modal, milestone checkboxes, live progress recalculation, and 1-click agenda scheduling.
- Transformed `src/app/(dashboard)/habits/page.tsx` into a Flow workstation with interval timers (20m–90m presets), post-session reflection modal, and automaticity index tracking.
- Created `MockCalendarAdapter` and `GoogleCalendarAdapter` with Route Handler `/api/calendar/sync`.
- Added Calendar Sync status pill in `header.tsx` with interactive side-by-side conflict resolution modal and simulated GCal shift.
- Created Web Speech API hook (`useSpeechRecognition`) and voice dictation modal in `assistant-input.tsx`.
- Built PWA manifest (`manifest.json`), service worker (`sw.js`), and scheduled reminder service (`reminder-service.ts`).
- Built carbon offset and tree equivalence model (`eco-calculator.ts`) and interactive Eco Dashboard on `profile/page.tsx`.
- Formulated test suites in `tests/`: 37/37 passed across 4 suites via `npm test`. Next.js production build passing across 16 routes in 249ms.
- Commit: `053cc00`

### Session 5: 2026-11-02 — Conversational Intent Bug Fix & Context Preservation
- **Problem**: When user asked *"what are you doing"*, the assistant treated the question as a literal task title and scheduled it as a 45-minute focus block at 08:00 AM.
- **Fix**: Upgraded `MockAIProvider` and `GeminiProvider` with conversational intent classification. Queries regarding identity, capabilities, greetings, or schedule status return `intent: "general_query"` and `extractedTasks: []`, preventing task hallucination. Non-task remarks receive clarification guidance.
- Commit: `e07d5ec`
- Created project backup archive at `/Users/prajwalkolaki/.gemini/antigravity/scratch/ai-time-manager-backup-pre-responsive.tar.gz`.
- Updated `.gitignore` to allow `.env.example`.

---

## 8. RESPONSIVE REDESIGN — NEXT MILESTONE

> **NOTICE**: Do not start code implementation until explicitly instructed by the user. This section documents the design requirements, problems, target breakpoints, and adaptation plan.

### 8.1 Current Desktop Layout
- Persistent left sidebar (`width: 240px`) containing logo, navigation links, and persona switcher.
- Sticky top header (`height: ~60px`) containing personalized greeting, date badge, sync pill, notification bell, and `+ New Task` trigger button.
- Main layout container (`max-w-7xl mx-auto px-6 py-6`).
- `/home`: Top 7-column month calendar with navigation; bottom two-column split with Today's Agenda (left) and Metrics/AI Assistant (right).
- `/goals`, `/habits`, `/plan`, `/profile`: 2-column or 4-column card grids.

### 8.2 Known Mobile & Tablet Problems
1. **Sidebar Navigation**: On screens `< 768px`, the sidebar is hidden (`hidden md:flex`), but there is currently no mobile slide-out drawer or bottom navigation bar, leaving mobile users without primary navigation controls.
2. **Month Calendar Grid**: The 7-column grid squishes day cells on viewports `< 640px`. Day numbers overlap with activity dots, causing visual clutter.
3. **Sticky Header Overflow**: On narrow mobile viewports (e.g. 375px), greeting, subtitle, calendar sync pill, notification bell, and `+ New Task` button crowd the top row, causing line wraps and ugly vertical height shifts.
4. **Docked AI Assistant Occlusion**: On mobile screens, the assistant input dock at the bottom of the Home view consumes substantial vertical viewport height, occluding agenda items and requiring excessive scrolling.
5. **Modal Ergonomics**: Dialogs (`QuickTaskModal`, `SyncModal`, `NewGoalModal`, `VoiceModal`) use fixed desktop-centered card layouts rather than mobile-friendly bottom sheets.
6. **Touch Targets**: Several action buttons (preset buttons, habit toggles, milestone checkboxes) have hit areas smaller than the recommended 44×44px touch target standard.

### 8.3 Original Notebook-Inspired Design Requirements to Preserve
- Calm, warm alabaster paper background (`#faf9f6`).
- Warm slate borders (`#e6e3da`) and ruled line accents (`#f0ede6`).
- Editorial serif headings paired with crisp, legible sans-serif utility text and monospace time badges.
- Smooth transitions without jarring animations or fluorescent visual noise.

### 8.4 Required Responsive Layouts Across Breakpoints

| Viewport Range | Breakpoint Name | Layout & Navigation Strategy |
|:---|:---|:---|
| **375px – 639px** | **Mobile** | Single-column vertical layout. Top header with hamburger button triggering a slide-out drawer (or persistent bottom tab bar). Adaptive micro-grid month calendar with single-letter headers (M, T, W, T, F, S, S). Compact AI assistant bar with expandable sheet. Bottom-sheet modals. |
| **640px – 767px** | **Large Mobile** | Single-column layout with 2-column metric cards. Touch-friendly agenda cards. Expandable modals. |
| **768px – 1023px** | **Tablet** | Collapsible sidebar icon rail (64px width) with tooltip labels. 7-column calendar with compact cells. Stacked 2-column grid for goals and habits. |
| **1024px – 1279px** | **Small Laptop** | Full 240px sidebar. Side-by-side agenda and activity metrics. |
| **1280px+** | **Desktop / Widescreen** | Full 240px sidebar, expanded 7-column calendar, prominent AI assistant dock, 2-column goal cards. |

### 8.5 Specific Component Adaptations

1. **`src/components/layout/sidebar.tsx`**:
   - Add mobile slide-out drawer state triggered by header hamburger button.
   - Smooth slide-in transition from left with backdrop blur.
   - Option for fixed bottom navigation bar with icons for Home, Plan, Goals, Habits, Profile.
2. **`src/components/layout/header.tsx`**:
   - Add working hamburger menu toggle button visible on `< md`.
   - On mobile, display compact greeting and icon-only sync badge.
   - Convert `+ New Task` to a floating action button (FAB) or compact icon button on small screens.
3. **`src/components/calendar/month-calendar.tsx`**:
   - Implement responsive day cell sizing.
   - On mobile, use single-letter day headers (M, T, W, T, F, S, S) and maximum 3 micro indicator dots.
   - Add optional compact week-view toggle for mobile.
4. **`src/components/dashboard/daily-agenda.tsx`**:
   - Ensure task cards wrap cleanly at 375px width.
   - Enforce minimum 44×44px touch targets on completion checkboxes.
   - Wrap lock badges and priority tags gracefully.
5. **`src/components/ai-chat/assistant-input.tsx`**:
   - On mobile, collapse into a compact bottom bar (input + mic + send) that expands upward into a full-height sheet when focused or tapped.
6. **Modals (`quick-task-modal.tsx`, `header.tsx` Sync Modal, `goals/page.tsx` New Goal Modal)**:
   - On mobile viewports, anchor to bottom of screen (`bottom-0 rounded-t-2xl`) with backdrop blur and drag handle.
7. **`src/components/onboarding/step-indicator.tsx`**:
   - Replace long horizontal text step list on mobile with a compact step counter ("Step 4 of 12") and clean progress bar.
   - Wrap preset auto-fill buttons into a responsive horizontal scroll list.

### 8.6 Viewport Testing Matrix & Verification
- `320px` (Ultra-compact / iPhone SE 1st Gen): Verified zero horizontal scroll, compact week view, safe touch targets.
- `375px × 667px` (iPhone SE): Verified bottom nav, touch targets >44px, bottom-sheet modals.
- `390px × 844px` (iPhone 14): Verified full responsiveness, voice modal sheet, agenda card layout.
- `428px / 430px × 926px` (iPhone 14/15 Pro Max): Verified fluid typography, bottom padding safe-area.
- `768px × 1024px` (iPad Mini / Portrait Tablet): Verified 80px sidebar icon-rail, 3-column metric cards, responsive month grid.
- `1024px × 768px` (Tablet Landscape): Verified full 256px sidebar, month calendar, side-by-side agenda and upcoming cards.
- `1440px / 1920px` (Desktop / Ultra-wide): Verified persistent journal view with max-w-7xl centering and high density planner feel.

---

## 9. Current Project Status & Development Summary

- **Current Status**: **RESPONSIVE DESKTOP, TABLET & MOBILE REDESIGN COMPLETED & VERIFIED**
  - Complete responsive redesign executed while maintaining 100% of existing functionality and calming notebook aesthetic (`#faf9f6` paper palette, `#e6e3da` borders).
  - Mobile bottom navigation bar (`BottomNav`) and slide-out persona drawer (`MobileDrawer`).
  - Tablet compact icon-rail (`md:w-20`) transitioning smoothly to desktop sidebar (`lg:w-64`).
  - Adaptive Month Calendar with mobile `Week | Month` view toggle and micro dot indicators.
  - Touch-friendly 44×44px hit targets on agenda task completions.
  - Responsive bottom-sheet modals (`QuickTaskModal`, `CalendarSyncModal`, `VoiceModal`, `NewGoalModal`, `FlowReflectionModal`).
  - Automated test suite: 37/37 tests passed (`npm test`).
  - Production build: Passing cleanly across all 16 static/dynamic routes in Turbopack (`npm run build`).
  - Live dev server active on `http://localhost:3001`.
- **Pre-Responsive Backup**:
  - Preserved at `/Users/prajwalkolaki/.gemini/antigravity/scratch/ai-time-manager-backup-pre-responsive.tar.gz`.
- **Verification Commands**:
  - `npm test`: Runs all 37 tests (13 scheduler, 9 calendar sync, 8 eco calculator, 7 AI roadmap).
  - `npm run build`: Next.js 16 production compilation (16 routes).
  - `npm run dev`: Dev server on port 3001.
