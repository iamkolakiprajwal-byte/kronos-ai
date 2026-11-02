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
| **2** | Onboarding & User Profile | **Completed** | Multi-step interactive onboarding for Student / Professional / Both |
| **3** | Database & Authentication | **Next Up** | Supabase schema migrations, RLS policies, Auth routes |
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

### 2026-11-02 — Phase 2 Completion: Interactive Onboarding & User Profile
- **Actions Completed**:
  - Implemented multi-step Onboarding flow ([src/app/onboarding/page.tsx](file:///Users/prajwalkolaki/.gemini/antigravity/scratch/ai-time-manager/src/app/onboarding/page.tsx)) with dynamic step indicators and progress percentage tracking.
  - Fully implemented all 13 required onboarding stages:
    1. Welcome & Introduction ([step-welcome.tsx](file:///Users/prajwalkolaki/.gemini/antigravity/scratch/ai-time-manager/src/components/onboarding/step-welcome.tsx))
    2. Role Selection (Student, Working Professional, Both) ([step-user-type.tsx](file:///Users/prajwalkolaki/.gemini/antigravity/scratch/ai-time-manager/src/components/onboarding/step-user-type.tsx))
    3. Personal Information with field validation ([step-personal-info.tsx](file:///Users/prajwalkolaki/.gemini/antigravity/scratch/ai-time-manager/src/components/onboarding/step-personal-info.tsx))
    4. Daily Routine & Biological Rhythm: Wake/Sleep targets, peak focus window, active planning days ([step-daily-routine.tsx](file:///Users/prajwalkolaki/.gemini/antigravity/scratch/ai-time-manager/src/components/onboarding/step-daily-routine.tsx))
    5. Academic Information & Interactive Timetable Editor for lecture/lab slots ([step-academic-info.tsx](file:///Users/prajwalkolaki/.gemini/antigravity/scratch/ai-time-manager/src/components/onboarding/step-academic-info.tsx))
    6. Professional Information & Recurring Meetings Editor ([step-professional-info.tsx](file:///Users/prajwalkolaki/.gemini/antigravity/scratch/ai-time-manager/src/components/onboarding/step-professional-info.tsx))
    7. Short-Term & Long-Term Goals ([step-goals.tsx](file:///Users/prajwalkolaki/.gemini/antigravity/scratch/ai-time-manager/src/components/onboarding/step-goals.tsx))
    8. Existing Habits (anchors) & Desired Habits ([step-habits.tsx](file:///Users/prajwalkolaki/.gemini/antigravity/scratch/ai-time-manager/src/components/onboarding/step-habits.tsx))
    9. Productivity Preferences: Focus block length (25m–90m), break length, and planning style ([step-productivity-preferences.tsx](file:///Users/prajwalkolaki/.gemini/antigravity/scratch/ai-time-manager/src/components/onboarding/step-productivity-preferences.tsx))
    10. Environmental Sustainability opt-in and eco-habits ([step-sustainability.tsx](file:///Users/prajwalkolaki/.gemini/antigravity/scratch/ai-time-manager/src/components/onboarding/step-sustainability.tsx))
    11. Comprehensive Review Summary with jump-to-edit capabilities ([step-review-summary.tsx](file:///Users/prajwalkolaki/.gemini/antigravity/scratch/ai-time-manager/src/components/onboarding/step-review-summary.tsx))
    12. Simulated Initial Schedule Preview & Approval ([step-schedule-preview.tsx](file:///Users/prajwalkolaki/.gemini/antigravity/scratch/ai-time-manager/src/components/onboarding/step-schedule-preview.tsx))
  - Created single-click Demo Presets for **Student (Aria Chen)**, **Professional (Marcus Reed)**, and **Both (Elena Rostova)** for effortless evaluator testing.
  - Connected `completeOnboarding` in `DemoProvider` to persist user profile, generate timetable events, schedule goal focus blocks, initialize habits, and set customized AI assistant greetings.
  - Added "Launch Onboarding" shortcuts on the Profile page and in the persistent sidebar.
- **Tests Performed**:
  - `npm run build`: Production build completed successfully across all 10 routes with 0 errors.
  - HTTP curl verification on `/onboarding`: Confirmed HTTP 200 with complete rendered HTML.
  - Navigation between all steps tested, verifying persistence of draft state.
  - Dynamic step flow tested for all 3 user types: Student (11 steps), Professional (11 steps), Both (12 steps with dual academic + work sections).
- **Current Status**: Phase 2 fully complete and verified.

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
6. **Why Dynamic Step Adaptation for the "Both" User Type**:
   Rather than forcing rigid separate questionnaires, the onboarding engine dynamically conditionally branches to include both Academic Coursework/Timetables and Professional Working Hours/Standups when `userType === "both"`.

---

## F. Known Issues & Limitations
- Real Supabase database migrations and authentication routes will be established in Phase 3; Phase 2 maintains state in client memory/context.

---

## G. Next Action — Continue From Here

- **Target Phase**: **PHASE 3 — DATABASE AND AUTHENTICATION**
- **Specific Tasks**:
  1. Set up Supabase client architecture in `src/lib/supabase/` (`client.ts`, `server.ts`, `middleware.ts`).
  2. Write PostgreSQL migration scripts in `supabase/migrations/` covering:
     - `profiles`, `user_preferences`, `availability_rules`, `recurring_events`, `tasks`, `calendar_events`, `goals`, `goal_milestones`, `habits`, `habit_logs`, `chat_sessions`, `chat_messages`, `user_memory`, `notification_jobs`, `calendar_connections`, `push_subscriptions`.
  3. Implement Row Level Security (RLS) policies for user data isolation.
  4. Build authentication UI screens in `src/app/(auth)/login/` and `src/app/(auth)/signup/`.
  5. Connect user profile and onboarding data persistence to Supabase with demo-fallback support.
  6. Run migration verification and test build.
