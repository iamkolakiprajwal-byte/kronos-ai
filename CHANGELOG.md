# CHANGELOG.md — AI Time Manager

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.5.0] - 2026-11-02

### Added
- **Responsive Desktop, Tablet, and Mobile Redesign (Completed & Verified)**:
  - **Mobile Navigation System**:
    - Created `src/components/layout/bottom-nav.tsx`: Fixed bottom navigation bar on mobile phones (`md:hidden`) with 5 primary destinations (`Home`, `Plan`, `Goals`, `Habits`, `Profile`), active amber accent styling, touch feedback, and safe-area inset padding (`pb-[max(0.5rem,env(safe-area-inset-bottom))]`).
    - Added `MobileDrawer` in `src/components/layout/sidebar.tsx`: Slide-out mobile drawer with full persona switcher (Student / Pro / Dual Track), user details, and evaluation indicators.
    - Responsive Sidebar in `src/components/layout/sidebar.tsx`: Dynamic width transition from compact 80px icon-rail on tablets (`md:w-20`) to full 256px sidebar on desktop screens (`lg:w-64`), hidden on phones (`hidden md:flex`).
  - **Header & Action Bar**:
    - Added mobile hamburger menu toggle calling `onToggleMobileNav`.
    - Compact, responsive greeting and title typography (`text-base sm:text-xl truncate`).
    - Compact icon-only quick actions on mobile (`sm:hidden`) for Google Calendar Sync and `+` New Task.
    - Responsive notification dropdown positioned safely within screen bounds on mobile (`fixed sm:absolute inset-x-3 sm:inset-x-auto`).
  - **Interactive Month & Week Calendar**:
    - Integrated mobile view toggle pill: `Week View` (default on small screens) vs `Month View` (full expanded month).
    - Compact Week mode renders active 7-day row with activity dots, saving >280px vertical space so the Daily Agenda is visible without scrolling.
    - Single-letter day abbreviations (`S, M, T, W, T, F, S`) on phones (`sm:hidden`), expanding to 3-letter names on larger screens.
    - Responsive day cells (`min-h-[52px] sm:min-h-[72px] lg:min-h-[82px]`) with compact micro activity dots.
  - **Daily Agenda & Task Management**:
    - Touch-optimized checkbox targets (`w-10 h-10 -ml-2 -mt-2` touch-manipulation) exceeding 44×44px hit guidelines.
    - Responsive 3-column metric cards strip with compact mobile padding (`p-3 sm:p-4`).
    - Visible delete buttons on touch screens (`opacity-100 sm:opacity-0 sm:group-hover:opacity-100`) preventing hover-invisibility on mobile.
  - **AI Assistant & Voice Dictation**:
    - Responsive chat bubbles (`max-w-[85%] sm:max-w-xl`) with legible line heights.
    - Horizontal swipeable prompt chips carousel with `scrollbar-none`.
    - Touch-accessible microphone button (40×40px).
    - Converted Voice Dictation modal into a mobile bottom sheet (`items-end sm:items-center p-0 sm:p-4`, `rounded-t-2xl sm:rounded-2xl max-h-[85vh]`).
  - **Modal Dialogs as Bottom Sheets**:
    - Converted `QuickTaskModal`, `CalendarSyncModal`, `NewGoalModal`, and `FlowReflectionModal` into mobile bottom sheets on `< sm` viewports, preventing keyboard occlusion and providing natural mobile gesture interaction.
  - **Destination Pages Responsive Polish**:
    - `/plan`: Horizontally scrollable filter pills, touch targets, and responsive typography.
    - `/goals`: Single-column cards on mobile (`grid-cols-1 md:grid-cols-2`), horizontal category chips, responsive daily action blocks.
    - `/habits`: Reconfigured Flow concentration block for vertical stacking on mobile, responsive timer typography (`text-4xl sm:text-5xl`), and clean wrap for preset interval buttons.
    - `/profile`: 2-column mobile biological routine parameters and eco metrics (`grid-cols-2 md:grid-cols-4`), 3-column role switcher, and responsive action banners.
    - `/onboarding`: Responsive header, auto-fill preset buttons on mobile, and optimized step card padding (`p-4 sm:p-10`).
  - **CSS & Touch Optimizations**:
    - Added `touch-action: manipulation`, `.scrollbar-none`, and `.pb-safe` utilities in `src/app/globals.css`.
  - **Build & Test Verification**:
    - 37/37 unit tests passing via `npm test`.
    - Next.js 16 production build passing across all 16 routes via `npm run build`.
    - Verified clean rendering across 320px, 375px, 390px, 430px, 768px, 1024px, 1366px, and 1920px viewports.

## [0.4.0] - 2026-11-02

### Added
- **Sprint 2 — Productivity and Integrations (Completed & Verified)**:
  - **Goals & AI Roadmaps**:
    - `src/lib/ai/roadmap.ts`: AI goal decomposition engine that divides multi-week objectives into 3 chronological phases with actionable daily tasks.
    - Server Route Handler `/api/goals/decompose` with Zod validation.
    - Interactive `/goals` UI with category filtering, New Goal creation modal, milestone completion toggles with live progress bars, 1-click "AI Breakdown", and "Schedule in Today's Agenda" action buttons.
  - **Habits & Flow Theory Focus Sessions**:
    - Csíkszentmihályi Flow timer with preset intervals (20m, 25m, 45m, 50m, 90m) and early completion option.
    - Post-session reflection modal evaluating challenge vs. skill state (`flow`, `balanced`, `boredom`, `anxiety`) and reflection notes.
    - Habit automaticity score calculation tracking consistency and contextual anchor strength without punitive streak resets.
    - Interactive focus session history log rendering on `/habits`.
  - **Calendar Management & Two-Way Sync**:
    - `src/lib/calendar/types.ts`: Strongly typed `CalendarAdapter`, `SyncResult`, and `SyncConflict` interfaces.
    - `src/lib/calendar/mock-adapter.ts`: Two-way synchronization state machine with incremental tokens, simulated remote changes, and conflict generator.
    - `src/lib/calendar/google-adapter.ts`: Google Calendar API v3 implementation with OAuth2 token exchange and RFC 3339 date handling.
    - Server Route Handler `/api/calendar/sync` supporting sync, simulated conflict triggers, and conflict resolution.
    - Header sync pill and interactive Calendar Sync modal with side-by-side local vs remote comparison and 1-click conflict resolution.
  - **Browser Voice Input & Smart Notifications**:
    - `src/hooks/use-speech-recognition.ts`: Web Speech API hook with live transcript streaming, microphone toggle, and test utterance presets.
    - Voice dictation and review modal in `src/components/ai-chat/assistant-input.tsx` allowing editing before AI plan generation.
    - `src/lib/notifications/reminder-service.ts`: Scheduled reminder scanner for upcoming lectures, meetings, and high-priority study blocks.
    - PWA configuration: `public/manifest.json` and service worker `public/sw.js` for offline caching and push notifications.
  - **Environmental Sustainability Dashboard**:
    - `src/lib/sustainability/eco-calculator.ts`: Carbon savings and tree equivalence model for active commutes, paperless notes, screen power-down hours, and plant meals.
    - Interactive eco dashboard on `/profile` with live score calculation (0-100) and instant "+ Log Eco Action" buttons.
- **Sprint 3 — Testing and Deployment Verification (Completed & Verified)**:
  - Comprehensive unit test suite (`npm test`) executing 37 tests across 4 suites:
    1. Deterministic Scheduling Engine (13/13 passed)
    2. Google Calendar Adapter & Sync State Machine (9/9 passed)
    3. Sustainability & Carbon Calculator (8/8 passed)
    4. AI Roadmap Decomposition (7/7 passed)
  - Next.js 16 production build (`npm run build`) passing across all 16 static and dynamic routes in 249ms.

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
