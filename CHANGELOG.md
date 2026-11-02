# CHANGELOG.md — AI Time Manager

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.3.0] - 2026-11-02

### Added
- **Sprint 1 — AI and Core Functionality (Completed & Verified)**:
  - **Database Migration**: Comprehensive Supabase PostgreSQL schema in `supabase/migrations/20261102000000_initial_schema.sql` covering 16 tables: `profiles`, `user_preferences`, `availability_rules`, `recurring_events`, `tasks`, `calendar_events`, `goals`, `goal_milestones`, `habits`, `habit_logs`, `chat_sessions`, `chat_messages`, `user_memory`, `notification_jobs`, `calendar_connections`, `push_subscriptions` with indexes and RLS policies.
  - **Supabase Clients**: Browser client (`src/lib/supabase/client.ts`) and server client (`src/lib/supabase/server.ts`) with graceful offline demo-mode fallbacks.
  - **Authentication Screens**: Minimalist, notebook-styled `/login` and `/signup` pages with instant 1-click demo login buttons for Student and Professional personas.
  - **AI Provider Abstraction**:
    - `src/lib/ai/provider.ts`: Typed interface `AIProvider` defining `planDailySchedule`, `parseTasksFromText`, `handleGeneralQuery`.
    - `src/lib/ai/gemini-provider.ts`: Production Google Gemini API integration utilizing structured JSON schemas (`responseSchema`).
    - `src/lib/ai/mock-provider.ts`: Context-aware offline NLP provider matching user timetable, routines, and task lists without requiring API keys.
    - `src/lib/ai/index.ts`: Provider factory dynamically selecting between Gemini and Mock AI.
    - `src/lib/ai/memory.ts`: User preference memory store with Supabase sync and offline cache.
  - **Server-Side API Routes**:
    - `/api/ai/chat`: Zod-validated conversational planning and task extraction endpoint.
    - `/api/schedule/generate`: Zod-validated deterministic schedule generation and conflict solver endpoint.
  - **Deterministic Scheduling Engine**:
    - `src/lib/scheduler/engine.ts`: Pure TypeScript constraint-satisfaction solver enforcing zero overlap with fixed commitments, sleep/wake compliance, meal buffers, energy curve matching, conflict detection, and dynamic mid-day rescheduling.
    - Comprehensive unit test suite in `tests/scheduler/scheduler.test.ts` with 13/13 passing tests.
  - **State Integration**: `DemoProvider` connected to invoke server-side `/api/ai/chat` and `/api/schedule/generate` endpoints.

## [0.2.0] - 2026-11-02

### Added
- **Phase 2 Implementation (Completed & Verified)**:
  - Guided, interactive multi-step Onboarding flow (`/onboarding`) with progress indicator bar, back/continue controls, and step breadcrumbs.
  - Full support for all 3 target user types: **Student**, **Working Professional**, and **Both (Dual Track)** with dynamic step routing.
  - Interactive Timetable Editor for students to manage lecture/lab slots with day of week, times, and venue links.
  - Recurring Meetings & Standups Editor for professionals to protect core working hours and meeting buffers.
  - Daily biological rhythm setup (wake time, sleep boundary, and peak focus periods: Morning, Afternoon, Evening, Night).
  - Multi-horizon goal definition (short-term outcomes and strategic capabilities) and habit anchor configuration.
  - Focus session customization (25m Pomodoro, 50m standard, 90m ultradian) and break duration preferences.
  - Optional environmental sustainability routines (active cycling/walking commute, paperless notes, power mindfulness).
  - Summary review screen with jump-to-edit shortcuts.
  - Deterministic initial schedule preview and approval pipeline activating the user's customized planner.
  - Single-click evaluation presets for **Student (Aria Chen)**, **Professional (Marcus Reed)**, and **Both (Elena Rostova)**.
  - Re-run onboarding buttons on the Profile page and in the persistent sidebar.

## [0.1.0] - 2026-11-02

### Added
- **Project Scaffolding**: Initialized Next.js 16 (App Router) with React 19, TypeScript, and Tailwind CSS v4.
- **Foundational Dependencies**: Added `lucide-react`, `clsx`, `tailwind-merge`, and `date-fns`.
- **Core Documentation**:
  - `PROJECT_CONTEXT.md`: Permanent central source of truth, development log, and technical decisions.
  - `PROJECT_SPEC.md`: Detailed functional and non-functional specifications.
  - `README.md`: Quickstart, architecture overview, and assignment demonstration guide.
  - `.env.example`: Secure environment variable template.
- **Phase 1 Implementation (Completed & Verified)**:
  - Responsive Application Shell with notebook-inspired aesthetics and calm paper palette.
  - Persistent Sidebar with instant Active Persona switcher (Student: Aria Chen vs. Professional: Marcus Reed).
  - Sticky Top Header with time-based greetings, date display, smart notification drawer with unread badge, and quick action buttons.
  - Prominent Monthly Calendar positioned at the top of Home, with month/year navigation, "Today" jumper, and color-coded activity markers for fixed classes/meetings, deep study, and eco habits.
  - Today's Agenda timeline with task completion toggles, focus minute tally, lock badges for fixed commitments, and priority categorization.
  - Quick Task Modal for adding tasks with estimated duration presets (25m, 45m, 60m, 90m), categories, and fixed tags.
  - Conversational AI Assistant dock with natural language planning, prompt suggestions, and one-click "Apply Proposed Schedule" action.
  - Fully navigable and styled pages for `/plan`, `/goals`, `/habits`, and `/profile`.
  - Next.js 16 build passing with 100% clean static page prerendering across all routes.
