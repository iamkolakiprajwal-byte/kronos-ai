# PROJECT_CONTEXT.md — AI Time Manager Central Source of Truth

> **CRITICAL DIRECTIVE**: Read this document before starting any development session. Update it whenever features, architectural decisions, or phase statuses change. This document preserves the ongoing context and technical memory of the project.

---

## A. Project Overview

- **Product Name**: AI Time Manager ("KRONOS AI" / "AI Time Manager")
- **Product Vision**: An intelligent, adaptive personal planning assistant that understands an individual's responsibilities, routines, preferences, habits, and long-term goals. Rather than acting as a static calendar or rigid to-do list, it helps users realistically organize their time, adapt dynamically to changes, and maintain flow without overwhelm.
- **Problem Statement**: Existing productivity tools force users into manual scheduling or rigid blocks that collapse when real life happens. Students and working professionals juggle fluctuating deadlines, classes, meetings, energy slumps, and personal goals, leading to schedule fatigue, guilt over unfinished tasks, and broken habits.
- **Target Users**:
  1. *Students*: Coursework, semester schedules, assignments, exam dates, study blocks.
  2. *Working Professionals*: Office hours, recurring meetings, deadlines, deep work focus.
  3. *Dual Academic/Professional*: Individuals managing study and work simultaneously.
- **Main Objectives**:
  1. Provide a calm, notebook-inspired digital planning surface.
  2. Deliver conversational daily planning ("Today I have two assignments, need to study economics, hit the gym...").
  3. Guarantee schedule integrity via a deterministic TypeScript scheduling engine (not hallucinated AI slots).
  4. Nurture habit formation with cue/context awareness and flow focus sessions.
  5. Enable two-way calendar synchronisation with conflict protection (Mock adapter for demo/academic mode).
  6. Support accessible voice inputs, smart notifications, and eco-friendly sustainability tracking.
- **Core Features**:
  - Prominent Monthly Calendar & Day Agenda with visual activity indicators.
  - Conversational AI Assistant for schedule creation & natural-language rescheduling.
  - Deterministic Conflict-Free Scheduling Engine with buffer/transition time & energy matching.
  - Multi-Horizon Goals & AI-guided Milestones.
  - Habit Tracking grounded in behavioral science (cues, automaticity, streak grace).
  - Flow Focus Sessions with reflective prompts.
  - Demonstrative Demo Mode for academic/assignment review (Student & Professional presets).
- **Technology Stack**:
  - **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons.
  - **Backend**: Next.js Route Handlers, TypeScript, Zod validation.
  - **Database & Auth**: Supabase PostgreSQL, Supabase Auth, Row Level Security (RLS).
  - **AI Integration**: Google Gemini API, server-side provider abstraction, structured JSON schema outputs.
  - **Scheduling**: Pure TypeScript deterministic constraint-satisfaction engine.
  - **Calendar**: Shared `CalendarAdapter` interface (`MockCalendarAdapter` for dev/demo, `GoogleCalendarAdapter` for production).
  - **Notifications**: PWA, Service Worker, Web Push API, VAPID.
  - **Voice**: Web Speech API with microphone control and text fallback.

---

## B. Architecture Documentation

```
                                  +---------------------------------------+
                                  |         Next.js App Shell             |
                                  |  (Home, Plan, Goals, Habits, Profile) |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                     +--------------------------------+--------------------------------+
                     |                                                                 |
                     v                                                                 v
+--------------------+--------------------+                   +------------------------+--------------------+
|            Next.js Route Handlers       |                   |           Client Services & State          |
|  - /api/ai/chat                         |                   |  - Demo State / Local Store                |
|  - /api/schedule/generate               |                   |  - Speech Recognition Handler              |
|  - /api/calendar/sync                   |                   |  - Calendar View Manager                   |
+--------------------+--------------------+                   +---------------------------------------------+
                     |
       +-------------+-------------+
       |                           |
       v                           v
+------+--------------+   +--------+----------------+
| Gemini AI Provider  |   | Deterministic Scheduler |
|  - Intent Parsing   |   |  - Slot Constraint Calc |
|  - Structured JSON  |   |  - Fixed Event Bounds   |
|  - Memory Extract   |   |  - Buffer & Transitions |
+---------------------+   +-------------------------+
       |                           |
       +-------------+-------------+
                     |
                     v
+--------------------+--------------------+
|        Supabase PostgreSQL & RLS        |
|  - Profiles, Preferences, Tasks         |
|  - Calendar Events, Goals, Habits       |
|  - User Memory & Sync Metadata          |
+-----------------------------------------+
```

### 1. Frontend Architecture
- Built with Next.js App Router (`src/app`).
- Layout includes persistent top header (quick profile switch, notifications, date display) and responsive navigation (Home, Plan, Goals, Habits, Profile).
- Aesthetics: Notebook-inspired, calm stone/neutral hues, clear typography, generous spacing, zero visual clutter.
- Components organized cleanly: `src/components/{layout, calendar, dashboard, tasks, ai-chat, goals, habits, ui}`.

### 2. Backend Architecture
- Next.js Route Handlers in `src/app/api/...`.
- Strict validation with Zod schemas for all client inputs and AI outputs.
- Stateless, secure server execution (API keys never exposed to the client).

### 3. Database Architecture
- Supabase PostgreSQL schema with 16 core tables:
  `profiles`, `user_preferences`, `availability_rules`, `recurring_events`, `tasks`, `calendar_events`, `goals`, `goal_milestones`, `habits`, `habit_logs`, `chat_sessions`, `chat_messages`, `user_memory`, `notification_jobs`, `calendar_connections`, `push_subscriptions`.
- Comprehensive Row Level Security (RLS) guaranteeing tenant isolation.

### 4. AI Architecture
- Provider abstraction: `src/lib/ai/provider.ts` defining `AIProvider` interface.
- Gemini implementation: `src/lib/ai/gemini-provider.ts` utilizing structured output formats (`responseSchema`).
- User memory: Structured key-value preference extraction stored in database table `user_memory` (preferred study duration, break lengths, productive hours, frequently delayed tasks).

### 5. Scheduling Architecture
- Pure TypeScript deterministic scheduling engine (`src/lib/scheduler/`).
- Step-by-step pipeline:
  1. Retrieve fixed commitments (classes, meetings, sleep).
  2. Calculate feasible open windows between wake and sleep times.
  3. Factor transition buffers and lunch/dinner breaks.
  4. Score and place tasks based on priority, deadline proximity, and preferred focus intervals.
  5. Return proposed schedule with explicit conflict explanations if time is overbooked.

### 6. Calendar Integration Architecture
- Shared interface `CalendarAdapter` (`src/lib/calendar/types.ts`).
- `MockCalendarAdapter`: Generates realistic mock events, simulates two-way edits, deletions, and sync tokens for assignment/demo mode.
- `GoogleCalendarAdapter`: Production-ready structure implementing Google Calendar API v3 with incremental sync tokens.

### 7. Notification & Voice Architecture
- Notifications: PWA manifest, service worker (`public/sw.js`), Web Push API mock processor.
- Voice: Browser Web Speech API hook (`src/hooks/use-speech-recognition.ts`) with visual recording state and edit-before-submit modal.

---

## C. Development Phases

| Phase | Description | Status | Target Deliverable |
|-------|-------------|--------|---------------------|
| **1** | Project Foundation & UI Design | **Completed** | Polished App Shell, Notebook Home Screen, Calendar, Agenda, AI Chat Box, Mock Data |
| **2** | Onboarding & User Profile | **Next Up** | Multi-step interactive onboarding for Student / Professional |
| **3** | Database & Authentication | Not Started | Supabase schema migrations, RLS policies, Auth routes |
| **4** | AI Assistant & Conversation | Not Started | Gemini integration, structured intent parsing, conversational UI |
| **5** | Deterministic Scheduling Engine | Not Started | Constraint satisfaction engine, conflict detector, dynamic rescheduling |
| **6** | Goals & Habit Management | Not Started | Milestone generator, flow focus sessions, habit reflection tracker |
| **7** | Calendar Two-Way Sync | Not Started | Mock Calendar Adapter, sync state machine, Google Calendar adapter stub |
| **8** | Notifications & Voice Input | Not Started | Service worker, Web Push mock engine, Web Speech recognition hook |
| **9** | Environmental Sustainability | Not Started | Green routines, eco-goals, commute & energy mindfulness logs |
| **10** | Testing & Optimization | Not Started | Scheduler test suite, sync verification, UI audit, mobile check |
| **11** | Deployment & Documentation | Not Started | Vercel deployment guide, final README, screenshots, demo runbook |

---

## D. Development Progress Log

### 2026-11-02 — Phase 1 Completion & System Verification
- **Actions Completed**:
  - Initialized Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 in `/Users/prajwalkolaki/.gemini/antigravity/scratch/ai-time-manager`.
  - Installed `lucide-react`, `clsx`, `tailwind-merge`, and `date-fns`.
  - Created central architectural documentation (`PROJECT_CONTEXT.md`, `PROJECT_SPEC.md`, `CHANGELOG.md`, `README.md`, `.env.example`).
  - Implemented domain TypeScript schemas (`src/types/index.ts`) for Users, Tasks, Calendar Events, Goals, Habits, Notifications, and Chat.
  - Implemented comprehensive mock demo datasets (`src/lib/mock/demo-data.ts`) with realistic Student ("Aria Chen") and Professional ("Marcus Reed") profiles.
  - Built interactive Demo Context provider (`src/context/demo-context.tsx`) with instant persona switching, task status toggling, habit tracking, and context-aware simulated AI responses.
  - Designed notebook-inspired application shell:
    - Persistent sidebar (`src/components/layout/sidebar.tsx`) with instant persona switcher and clear navigation.
    - Top header (`src/components/layout/header.tsx`) with time-based greetings, notification drawer with unread count, and "+ New Task" trigger.
    - Prominent monthly calendar (`src/components/calendar/month-calendar.tsx`) with month/year navigation, today highlight, and category activity dots.
    - Today's daily agenda (`src/components/dashboard/daily-agenda.tsx`) with progress tracking, focus duration calculations, lock badges for fixed commitments, and task completion.
    - Quick task modal (`src/components/dashboard/quick-task-modal.tsx`) supporting priority, estimated duration, category, and fixed commitment flags.
    - AI Assistant dock (`src/components/ai-chat/assistant-input.tsx`) featuring natural language planning, prompt suggestions, and one-click "Apply Proposed Schedule" action.
    - Assembled cohesive Home screen (`src/app/(dashboard)/home/page.tsx`) and fully-styled destination pages (`/plan`, `/goals`, `/habits`, `/profile`).
- **Bugs Encountered & Resolved**:
  - *Next.js 16 Prerender Unstable Date Error*: Turbopack flagged `new Date()` within client component state initialization during static prerender of `/_not-found`. Fixed by decoupling module-level timestamps with a deterministic reference date (`2026-11-02`) and synchronizing client timestamps inside `useEffect` post-mount.
- **Tests Performed**:
  - `npm run build`: Production build completed successfully across all 7 routes with 0 errors.
  - `npm run dev`: Dev server running at `http://localhost:3001`.
  - HTTP curl verifications on `/home`, `/plan`, `/goals`, `/habits`, and `/profile`: All responded with HTTP 200 and complete rendered HTML.
- **Current Application Status**: Stable, verified Phase 1 frontend prototype ready for Phase 2 onboarding integration.

---

## E. Technical Decisions

1. **Why Next.js App Router with TypeScript**:
   Enables seamless server-side validation (Route Handlers), native streaming, zero-config API security for AI secrets, and unified full-stack TypeScript types across UI and scheduler.
2. **Why Deterministic Scheduling Engine instead of pure LLM**:
   LLMs hallucinate time intervals, overlap events, and fail arithmetic constraints on dates/durations. The LLM translates user intent into structured tasks; the deterministic TypeScript engine calculates exact, conflict-free, physically feasible time slots.
3. **Why Mock Calendar Adapter in Initial Development**:
   Prevents accidental writes or privacy leaks to personal Google Calendars during development and academic evaluation, while preserving identical interfaces for seamless production swap.
4. **Why Calm Notebook-Inspired Design**:
   High-stress individuals (students facing exams, busy professionals) suffer from cognitive overload when presented with dense analytic dashboards. A notebook aesthetic (subtle borders, serene typography, clear hierarchy) reduces scheduling anxiety.
5. **Why Stable Reference Date for Prerender**:
   Next.js 16 Partial Prerendering strictly forbids non-deterministic calls like `new Date()` in client components during SSR build. Using a reference date with client `useEffect` rehydration guarantees build reproducibility and hydration safety.

---

## F. Known Issues & Limitations
- Real Google Calendar OAuth and Supabase credentials will be integrated in subsequent phases (Phases 3 and 7); Phase 1 leverages the active `MockCalendarAdapter` sandbox.

---

## G. Next Action — Continue From Here

- **Target Phase**: **PHASE 2 — ONBOARDING & USER PROFILE**
- **Specific Tasks**:
  1. Build multi-step Onboarding wizard (`src/app/onboarding/page.tsx`):
     - Screen 1: Welcome & Value Proposition.
     - Screen 2: User Role Selection (Student, Professional, Both).
     - Screen 3: Biological Routine & Availability (Wake/sleep times, peak focus hours, focus & break intervals).
     - Screen 4: Academic or Professional Commitments (Timetable, recurring standups, coursework/deliverables).
     - Screen 5: Core Goals & Desired Habits.
     - Screen 6: Sustainability Routine Preferences (Eco-commute, digital notes).
     - Screen 7: AI Analysis & Initial Schedule Preview (Allowing user approval).
  2. Implement state transition from Onboarding directly into `/home` with user's customized schedule.
  3. Verify with build and browser testing.
