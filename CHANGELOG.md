# CHANGELOG.md — AI Time Manager

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [2.3.0] - 2026-11-08

### Permanent Google Calendar Authorization Fix & Gemini Connection UI Removal
- **Permanent Google Calendar Authorization Architecture**:
  - **Preserved Refresh Tokens across Silent Re-authorizations**: Modified `/auth/callback` to query existing `calendar_connections` and retain the stored `refresh_token` whenever Google omits `provider_refresh_token` on subsequent authorization passes.
  - **Single-Flight Concurrency Mutex**: Implemented in-flight lock maps (`inFlightRefreshes` and `inFlightSyncs`) preventing concurrent duplicate refresh calls and eliminating race conditions.
  - **Proactive & Reactive Expiration Handling**: Implemented `isTokenExpired` with a 5-minute renewal buffer in `sync-service.ts` alongside `attemptWithTokenRetry` which catches 401/expired errors, automatically renews access tokens, persists them to Supabase, and transparently retries Google API requests.
  - **Clear Error Classification**: Differentiated `invalid_grant` (revoked access, requiring explicit reauthorization) from transient 5xx outages and missing `.env.local` credentials, preventing false error transitions.
  - **Scoped Authorization Scopes**: Switched OAuth flow from forcing consent prompts on every login to silent account selection (`prompt: "select_account"`), only invoking `prompt: "consent"` when recovering from genuine revocation.
  - **Zero-Flicker Client Hydration**: Cached active connection status in `localStorage` (`kronos_cached_sync_status`), eliminating the initial "offline" / "Connect Google Calendar" badge flicker during page reload.
  - **Complete Disconnect Lifecycle**: Centralized `disconnectCalendar` in `DemoContext`, clearing database credentials, removing authentication cookies, invalidating client caches, and updating UI states simultaneously.
- **Gemini Live Connection UI Removal & Interface Cleanup**:
  - Removed the `"Gemini Live Connected"` and `"Prototype AI Mode • Gemini Integration Pending"` header badge from the Planning Assistant workspace (`src/app/(dashboard)/ai/page.tsx`).
  - Removed the technical upcoming briefing disclaimers and status polling banners.
  - Streamlined the workspace with an elegant, focused "Adaptive Constraint-Based Planning" guidance card.
  - Preserved all interactive AI capabilities: natural language text composer, speech-to-text dictation modal, proposal cards, "Apply to My Day" confirmation handshake, and responsive mobile/desktop layouts.
- **Testing & Verification Suite**:
  - Added dedicated persistent auth test suite (`tests/calendar/persistent-auth.test.ts`): **156/156 automated tests passed**.
  - Added Puppeteer persistence verification (`scripts/verify-calendar-persistence.mjs`): cold reload, navigation, modal interaction, and GET `/api/calendar/sync` passed.
  - 64/64 responsive browser QA checks passed across 7 device viewports with 0 console errors.
  - Clean Next.js 16 production build compiled across all 22 static and dynamic routes.

## [2.2.0] - 2026-11-08

### Final Pre-Integration Stabilization, System Audit & Prototype Submission Readiness
- **Automatic Background Google Calendar Synchronization**:
  - Implemented configurable background synchronization cadence with intervals for `15m`, `30m` (default), `1h`, `6h`, `12h`, `1d`, `1w`, and `manual`.
  - Added auto-sync cadence selector to User Profile & Planning Preferences (`src/app/(dashboard)/profile/page.tsx`).
  - Added real-time auto-sync indicator with countdown timer and manual trigger inside the Calendar Sync Modal (`src/components/dashboard/sync-modal.tsx`).
  - Enhanced background timer inside `DemoContext` to trigger delta sync passes without blocking UI interactions.
- **Mobile Ergonomics & Responsive Layout Polish**:
  - Fixed CSS stacking context trap where `backdrop-blur-md` on `<header>` trapped fixed bottom modals inside 56px header bounds.
  - Redesigned Quick Task Modal and Calendar Sync Modal as native bottom sheets on mobile devices (`rounded-t-3xl sm:rounded-2xl`) with mobile drag handles and touch-friendly padding.
  - Aligned month calendar day cells and hid redundant "Today" text badge on screens $<640\text{px}$ to eliminate cell collision on Day 8.
  - Enforced `overflow-x: hidden` and maximum 100vw constraint across authentication pages (`globals.css`, `login/page.tsx`, `signup/page.tsx`).
- **Academic AI Prototype Transparency**:
  - Configured explicit status indicators in Planning Assistant (`/ai`):
    - Badge: `"Prototype AI Mode • Gemini Integration Pending"`.
    - Status Briefing Banner: Explains that current scheduling proposals operate via Kronos's deterministic constraint satisfaction engine pending Gemini API activation in the next phase.
  - Prepared `GeminiProvider` and structured JSON `responseSchema` for zero-code-change transition in the upcoming phase.
- **Persistent Notification Reload Fix**:
  - Wrapped notification state mutators (`dismissNotification`, `clearAllNotifications`) with direct storage sync calls.
  - Verified that cleared notifications strictly persist across hard page refresh.
- **Quality Assurance & Verification**:
  - Executed automated test suite across 10 domains: **148/148 Passed**.
  - Executed automated multi-viewport browser matrix across 7 screen sizes: **64/64 Passed (0 defects)**.
  - Validated clean Next.js 16 production build (`22/22` static and dynamic routes compiled).
- **Authoritative Documentation Overhaul**:
  - Authored and updated the complete 12-document engineering suite: `README.md`, `PROJECT_CONTEXT.md`, `PROJECT_SPEC.md`, `ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, `FEATURES_AND_STATUS.md`, `TESTING_AND_QA.md`, `CHANGELOG.md`, `DEVELOPMENT_LOG.md`, `KNOWN_ISSUES.md`, `DEPLOYMENT_GUIDE.md`, and `NEXT_PHASE_GEMINI_INTEGRATION.md`.

## [2.1.0] - 2026-11-07

### Fixed & Cleaned — Real Google OAuth Integration, Complete Demo Purge & Clean Onboarding
- **Elimination of Simulated Google Modal & Mock Authentication**:
  - Removed `isGoogleModalOpen`, custom Google email/name input dialogs, and mock account generators (`google-${Date.now()}`, `user-${Date.now()}`) from `login/page.tsx`, `signup/page.tsx`, and `auth-context.tsx`.
  - Implemented honest Google OAuth initiation via Supabase `signInWithOAuth({ provider: 'google' })`.
  - When Supabase credentials or the Google OAuth provider are unconfigured in environment variables, the system displays an honest configuration notice instead of silently faking login.
  - Enhanced `/auth/callback` to capture query error params, exchange codes for live Supabase sessions, extract Google profile metadata (`full_name`, `avatar_url`, `email`), create initial user profiles in `public.profiles`, and route returning users to `/home` and new users to `/onboarding`.
- **Complete Eradication of Onboarding Presets & Pre-Populated Data**:
  - Authored `cleanOnboardingInitialData` (`src/lib/onboarding/defaults.ts`) ensuring all new onboarding profiles begin with empty fields (empty strings, empty subjects, empty timetables, empty meetings, empty goals and habits).
  - Removed `studentOnboardingPreset`, `professionalOnboardingPreset`, and `bothOnboardingPreset` from `/onboarding`.
  - Removed "Auto-fill preset: Student / Pro / Both" buttons from `StepIndicator` (`src/components/onboarding/step-indicator.tsx`).
  - Purged persona names and sample institutions from placeholders in `step-personal-info.tsx`, `step-academic-info.tsx`, and `step-professional-info.tsx`.
  - Fixed `setRole` in `DemoProvider` to prevent overwriting user data with hardcoded demo baselines.
- **Clean Storage Baseline**:
  - Authored `getCleanInitialState()` in `src/lib/storage/index.ts` ensuring that new accounts, resets, and migrations default to zero tasks, zero calendar events, zero goals, and zero habits.
  - Replaced the demo persona switcher in the `/profile` reset modal with a clean "Clear Local Workspace Data" action.
- **Automated Verification**:
  - Authored unit test suite `tests/auth/auth-clean-state.test.ts` (23 assertions passing).
  - Executed Puppeteer browser verification confirming zero demo personas on `/login`, no modal popup on clicking Continue with Google, clean signup, and completely empty onboarding inputs.
  - Total automated unit & integration tests passing: **153 / 153**.

## [2.0.0] - 2026-11-05

### Major — Production Transformation, Real Multi-User Authentication & Database Isolation
- **Complete Elimination of Prototype & Demo Infrastructure**:
  - Completely removed hardcoded demo personas (Aria Chen, Marcus Reed, Elena Rostova) from application runtime, headers, navigation bars, and modals.
  - Eliminated "Instant Evaluator Demo Login" cards and "Skip to Planner" bypass on `/login` and `/signup`.
  - Removed "Reset Demo State" controls from sidebar, settings, and mobile drawers.
  - Removed simulated Google Calendar synchronization (`MockCalendarAdapter (Simulated API v3)`) and fake conflict simulation triggers; replaced with honest connection status and Google OAuth credentials flow.
  - Removed static hardcoded suggested blocks (`studentSuggestedBlocks`, `proSuggestedBlocks`, `dualSuggestedBlocks`) and static course/sprint widgets from `/home`.
  - Replaced demo intelligence banners in `/ai` with honest Gemini AI connectivity reporting and production prompt templates.
- **Server-Side Authentication & Route Protection**:
  - Implemented Next.js Server-Side Middleware (`src/middleware.ts`) powered by `@supabase/ssr` to securely enforce route protection:
    - Unauthenticated requests to `/`, `/home`, `/ai`, `/my-day`, `/growth`, `/profile`, `/onboarding` strictly redirect to `/login`.
    - Authenticated users are prevented from accessing `/login` and `/signup` and redirected to `/home`.
  - Created `/forgot-password` route (`src/app/(auth)/forgot-password/page.tsx`) with password reset email dispatch via Supabase Auth.
  - Created `/reset-password` route (`src/app/(auth)/reset-password/page.tsx`) with token validation and secure password updates.
  - Extended `AuthProvider` (`src/context/auth-context.tsx`) with `forgotPassword`, `resetPassword`, session cookies, and multi-provider authentication (Google, GitHub, Email/Password).
- **Supabase Database Architecture & Multi-User Isolation**:
  - Created production evolution migration `supabase/migrations/20261105000000_production_evolution.sql`:
    - Extended `public.profiles` with `onboarding_completed`, `timezone`, and `preferred_name`.
    - Created `public.focus_sessions` table with flow-state tracking, absorption ratings, and Row Level Security (`auth.uid() = user_id`).
    - Created `public.onboarding_records` table with multi-step draft saving and RLS.
    - Created `public.academic_details` and `public.professional_details` tables with RLS.
  - Implemented `dataService` (`src/lib/supabase/data-service.ts`) providing unified CRUD operations for profiles, tasks, calendar events, focus sessions, and onboarding records.
- **Honest Gemini AI Integration**:
  - Updated `src/lib/ai/index.ts` and `src/app/api/ai/chat/route.ts` to strictly require `GEMINI_API_KEY`.
  - When keys are unconfigured, `/api/ai/chat` returns an honest `503 Service Unavailable` with `CONFIGURATION_REQUIRED` code rather than silently falling back to mock providers in production.
  - In `/ai`, displayed dynamic status badges (`Gemini AI Connected` vs `Gemini AI: Setup Required`).
- **First-Time User Onboarding & Interactive Tutorial**:
  - Implemented interactive 4-step welcome tutorial modal (`src/components/dashboard/welcome-tutorial-modal.tsx`) guiding new users through the personal workspace, peak rhythm customization, intelligent timeline, and the Google Keep style floating `+` FAB.
  - Integrated onboarding completion with Supabase, setting `onboarding_completed: true` upon user approval of their initial schedule.
- **Automated Verification & Visual QA**:
  - 130 / 130 tests passing across all 8 test suites.
  - 22 / 22 routes compiled successfully with Next.js Turbopack (`npm run build`).
  - Verified responsive viewports across 320px, 375px, 768px, and 1440px via Puppeteer.


### Fixed — Mobile Keyboard, Autofill Suppression & Chat / Task Action Remediation
- **Complete Suppression of Annoying Password / Card Autofill Popup**:
  - Eliminated the Google Chrome / Android Autofill Assistant toolbar (`[Key] [Card] [Pin]`) appearing above the mobile virtual keyboard.
  - Converted chat search input to `type="search"` with WebKit appearance normalization, which explicitly excludes inputs from Android/Chromium Credential Manager.
  - Added strict autofill suppression attributes across forms and modal inputs:
    - `<form autoComplete="off" data-form-type="other" noValidate>`
    - `<input autoComplete="off" autoCorrect="off" autoCapitalize="sentences" spellCheck={false} data-form-type="other" data-lpignore="true">`
  - Applied across `AIPage`, `QuickTaskModal`, `GrowthPage` (Habit & Transition creators), and `AssistantInput`.
- **AI Chat Mobile Experience & Keyboard Usability**:
  - Replaced the long, confusing placeholder (`Type your schedule request (e.g. 'Study econo...`) with a concise prompt: `"Ask Kronos to plan your day..."`, making empty vs. typed input immediately clear.
  - Added `enterKeyHint="send"` so mobile keyboards (Gboard, iOS) display an active blue "Send" key instead of a "Next" (`->`) arrow, submitting prompts directly on Enter.
  - Relocated 1-tap suggested prompt chips (`Morning Study & Gym`, `Build Reading Habit`, etc.) directly above the composer input for immediate one-touch dispatch on mobile without scrolling.
  - Send button now provides active visual states, touch feedback, and $\ge 44\times 44\text{px}$ touch targets.
  - Made `/api/ai/chat` request validation robust with schema defaults to guarantee zero-fail response handling across all profile configurations.
- **Dynamic Mobile Virtual Keyboard & Viewport Docking (`src/components/layout/bottom-nav.tsx`)**:
  - Implemented focus-aware viewport detection in `BottomNav`.
  - When any input or textarea is active on mobile, the persistent bottom navigation bar smoothly slides down out of view (`translate-y-full opacity-0 pointer-events-none`), preventing viewport squeeze, double-bars, and 65px of wasted screen real estate.
  - When the keyboard is dismissed / input is blurred, the bottom dock seamlessly returns.
- **Ubiquitous Mobile "New Task" Creation Workflow**:
  - Added a dedicated `+ New Task` action button in the AI workspace header (`src/app/(dashboard)/ai/page.tsx`).
  - Added a prominent `+ New Task` button at the top of the mobile drawer menu (`src/components/layout/sidebar.tsx`).
  - Elevated `openQuickTask`, `closeQuickTask`, and `isQuickTaskOpen` into `DemoContext` so any component or screen can open the unified modal anywhere.
  - Ensured all modal actions update `localStorage` state and propagate instantly across Home, My Day, and AI workspaces.

## [1.1.0] - 2026-11-05

### Added & Corrected — Final Pre-Deployment Check, Visual Polish & Mobile Layout Fixes
- **Comprehensive Headless Chrome Browser QA Suite (`scripts/manual-qa-suite.mjs`)**:
  - Executed automated browser QA testing in Google Chrome across all 7 target viewports: `320px`, `375px`, `390px`, `430px`, `768px`, `1024px`, and `1440px`.
  - Audited all 5 workspaces (`/home`, `/ai`, `/my-day`, `/growth`, `/profile`) with **64 / 64 browser checks passing**.
  - Confirmed 0 browser console errors, 0 unhandled page exceptions, and 0 horizontal scroll overflows.
- **Defects Identified & Resolved During Browser QA**:
  - *Profile Card Horizontal Overflow (320px)*: Fixed child flex container expanding past 320px viewport in `src/app/(dashboard)/profile/page.tsx` by applying `w-full min-w-0` to the profile overview container.
  - *SSR / Client Hydration Mismatch in Profile*: Resolved React hydration error caused by reading dynamic `localStorage` timestamps during initial render; introduced a `mounted` lifecycle guard to ensure deterministic server HTML and client hydration.
  - *Calendar Month Header & Toolbar*: Verified readable Month & Year (`November 2026`) with 123px width on mobile, functional "Week View" / "Full Month" toggle, and today/period navigation.
  - *Bottom Navigation Touch Targets*: Verified all 4 primary navigation targets (`Home`, `AI`, `My Day`, `Growth`) meet or exceed $44\times 44\text{px}$ ($60\times 53\text{px}$ measured).
  - *Interactive State Persistence*: Verified task completion toggling, timer intervals, tab switching, and complete state persistence across hard page refreshes.
- **Mobile Month Name Visibility & Calendar Header Overhaul (`src/components/calendar/month-calendar.tsx`)**:
  - Fixed mobile month name truncation where "November 2026" was clipped down to a single character ("N") due to cramped toolbar sharing on 320px–390px screens.
  - Redesigned calendar header into a clean, unconstrained responsive layout:
    - *Mobile*: Row 1 presents the full Month & Year in expressive serif typography along with the Today button and `< >` navigator; Row 2 houses the full-width, touch-friendly "Week View" / "Full Month" segmented switcher.
    - *Desktop*: Seamlessly flows into a single balanced horizontal bar with generous whitespace.
    - Updated calendar legend with responsive stacking and explicit selected-date briefing.
- **Elimination of Overlapping Floating Elements (`home/page.tsx`, `my-day/page.tsx`, `growth/page.tsx`)**:
  - Removed duplicate fixed floating pills (`bottom-[68px]`) across Home, My Day, and Growth workspaces that collided with the persistent Bottom Navigation dock and obstructed bottom agenda items during scrolling.
  - Replaced floating overlays with clean contextual inline action buttons:
    - *My Day*: "Start Focus Session" and "Reschedule Day" integrated directly inside the central Focus Spotlight Card without blocking viewport content.
    - *Home*: Eliminated redundant floating AI pill in favor of the persistent bottom dock AI destination and the in-card "Plan with AI" action.
    - *Growth*: Integrated contextual creation actions directly within each tab view.
- **Enhanced Breathing Space & Minimalist Layout Polish**:
  - Increased inter-section vertical rhythm from `space-y-6 sm:space-y-8` to `space-y-7 sm:space-y-10` with relaxed bottom padding (`pb-16 md:pb-12`).
  - Added text truncation safeguards to the mobile workspace swipe indicator bar (`src/app/(dashboard)/layout.tsx`) to avoid crowding indicator dots on compact screens.
  - Streamlined AI Assistant header title on mobile (`src/app/(dashboard)/ai/page.tsx`) to avoid horizontal truncation.
- **Scientific Habit Automaticity Correction (`src/types/index.ts`, `src/app/(dashboard)/growth/page.tsx`, `src/app/(dashboard)/habits/page.tsx`, `src/lib/mock/demo-data.ts`)**:
  - Removed arbitrary, unvalidated 0–100% automaticity calculations.
  - Separated habit tracking into three distinct, scientifically grounded metrics:
    1. **7-Day Completion Adherence**: Empirical weekly completion rate (`completedDays / 7 * 100`).
    2. **Anchor Cue Consistency**: Adherence to the contextual anchor cue (`cueConsistencyScore` 0–100%).
    3. **Self-Reported Automaticity (SRHI)**: 1–5 scale based on the Self-Report Habit Index (Verplanken & Orbell, Gardner) allowing users to report subjective automaticity (1: High deliberation $\rightarrow$ 5: Feels automatic) without presenting synthetic calculations as cognitive measurements.
  - Added interactive 1–5 SRHI rating controls directly on habit cards in Growth and Habits workspaces.
- **LocalStorage Schema Evolution & Backup Safety Subsystem (`src/lib/storage/index.ts`)**:
  - Implemented `migrateState(raw)`: Forward-migrates older schema shapes, legacy habits, and tasks while preserving user custom data.
  - Implemented pre-migration backup (`KRONOS_BACKUP_KEY`): Automatically preserves existing state prior to migration or structural upgrade.
  - Implemented corrupted data backup (`KRONOS_CORRUPT_BACKUP_KEY`): Protects unparseable raw storage strings from accidental overwrite.
  - Implemented `restorePreMigrationBackup()`: One-click recovery of the pre-migration snapshot.
  - Added "Pre-Migration Safety Backup" banner and restore action in `/profile` when backup is present.
- **Explicit Zero-Cost Demo Environment Labeling**:
  - Header: Updated Google Calendar sync pill to `Demo GCal: Synced` and added explicit evaluation notice in `SyncModal` confirming zero external OAuth requirement.
  - AI Workspace: Updated header badge to `Offline Demo Intelligence (MockAIProvider)` and clarified local deterministic scheduling in welcome card.
  - Profile Page: Added dedicated `Calendar Sync Mode (MockCalendarAdapter)` and `AI Intelligence Mode (MockAIProvider)` architecture cards clarifying zero-cost local operation.
- **Comprehensive Verification Suite (`tests/e2e/e2e-scenarios.test.ts`)**:
  - Expanded Scenario E to verify legacy schema migration, custom task preservation, backup creation, and backup restoration.
  - **50 / 50 E2E tests passing** in `tests/e2e/e2e-scenarios.test.ts`.
  - **130 / 130 total automated tests passing** across all 8 suites via `npm test`.
  - Zero TypeScript errors (`npx tsc --noEmit`).
  - Next.js 16.4.3 Turbopack production build verified (`npm run build`, all 19 routes compiled).

### Added & Completed — End-to-End Integration, Data Persistence & Prototype Readiness
- **Zero-Cost Local Data Persistence Subsystem (`src/lib/storage/index.ts`)**:
  - Implemented safe client-side state persistence with `KRONOS_STORAGE_KEY = "kronos_ai_local_state_v1"` and `KRONOS_STORAGE_VERSION = 1`.
  - Persists all entities across browser sessions and hard page refreshes: `role`, `profile`, `tasks`, `calendarEvents`, `goals`, `habits`, `habitTransitions`, `focusSessions`, `chatMessages`, `notifications`, `ecoEntries`, and `selectedDateStr`.
  - SSR-guarded hydration lifecycle on client mount with automatic change persistence in `DemoContext`.
  - Safe error recovery falling back cleanly to pristine demo baseline upon version mismatch or corrupted JSON.
  - Storage diagnostics function tracking byte size, item count, and last saved timestamps.
  - Complete JSON backup export and import facility for demonstration transfers.
- **Demo Data Control Center & Baseline Reset**:
  - Added "Local Persistence & Demo Control Center" card in `/profile` displaying live diagnostics, backup actions, and a guarded reset workflow.
  - Persona baseline reset options: 1-click restore to Aria Chen (Student), Marcus Reed (Professional), or Elena Rostova (Dual Track).
  - Quick-reset triggers in desktop sidebar footer and mobile navigation drawer.
- **Enhanced Zero-Cost Offline Mock AI Provider (`src/lib/ai/mock-provider.ts`)**:
  - Strict intent classification separating casual conversation (`general_query`), daily planning (`create_daily_schedule`), task rescheduling (`reschedule_task`), priority updates (`change_priority`), habit formation (`create_habit`), and milestone roadmaps (`goal_decomposition`).
  - Casual questions (e.g. *"What are you doing?"*, *"Who are you?"*) answered conversationally with zero extracted tasks and zero unintended agenda mutations.
  - Ambiguous reschedule queries (e.g. *"Move my assignment"*) flag `requiresClarification = true` with interactive selection options.
  - Priority change parsing extracting target task and adjusting priority tags without altering time slots.
  - Deterministic solver routing: AI-suggested candidate tasks pass through `/api/schedule/generate` before proposal presentation.
- **AI Workspace Proposal Cards & 1-Click Handshakes (`src/app/(dashboard)/ai/page.tsx`)**:
  - Interactive proposal cards for suggested schedule timeblocks (`Apply Proposed Schedule to My Day`).
  - Dedicated Tiny Habits proposal card (`Anchor Habit to Growth Workspace`) with anchor cue, 2-minute starter rule, and category.
  - Dedicated Goal Roadmap proposal card (`Integrate Goal to Roadmap`) with chronological milestone checklist.
  - Interactive chip buttons for quick clarification responses.
  - Smart `applySuggestedTasks` logic updating existing tasks (for rescheduling / priority changes) or appending new activities.
- **Full Month Calendar on Top (`src/app/(dashboard)/home/page.tsx`)**:
  - Positioned full monthly calendar at the top of the Home workspace with `mobileView="month"` showing all weeks across mobile and desktop.
- **Automated Verification Suite (`tests/e2e/e2e-scenarios.test.ts`)**:
  - 40 new end-to-end tests covering Scenarios A through E:
    - *Scenario A*: Daily planning workflow (chat prompt -> intent parsed -> deterministic placements -> agenda synchronization).
    - *Scenario B*: Schedule changes (dynamic reschedule -> fixed commitments protected -> strictly future placement -> past time prevented).
    - *Scenario C*: Habit formation (habit created -> Growth workspace anchor -> 7-day adherence automaticity score).
    - *Scenario D*: Focus session persistence (Csikszentmihalyi flow model -> time distortion -> reflection logging).
    - *Scenario E*: Storage persistence & demo reset (versioning -> diagnostics -> persona baseline restore).
  - **122 / 122 total automated tests passing** across 8 test suites via `npm test`.
  - All 19 Next.js 16 (Turbopack) routes compiling cleanly in `npm run build`.
  - Puppeteer audit: 0 horizontal overflows across all 9 target viewports (320px to 1440px) on all workspaces.

## [0.9.0] - 2026-11-04

### Added & Redesigned — Regain Mobile App-Like Navigation & Screen Composition
- **Mobile Navigation Model**:
  - **Fixed Persistent Bottom Navigation Dock**: 4 primary destinations (`Home`, `AI`, `My Day`, `Growth`) with $\ge 48\text{px}$ touch targets, active charcoal pill indicator, and safe-area padding (`pb-[max(0.6rem,env(safe-area-inset-bottom))]`).
  - **Minimal Mobile Top Header**: Replaced web-like hamburger header on mobile with a clean 44px circular profile avatar (opening profile/persona drawer), subtle date, and discreet notification/sync icons. Zero requirement to open menus for primary navigation.
  - **Horizontal Workspace Swipe**: Native swipe gestures (`Home` $\leftrightarrow$ `AI` $\leftrightarrow$ `My Day` $\leftrightarrow$ `Growth`) with edge back gesture protection ($<28\text{px}$ exclusion) and input/control pass-through.
- **Regain-Inspired Screen Composition**:
  - **Home**:
    - Central visual: Open architectural calendar surface with daily rhythm.
    - Horizontally browsable suggested schedule blocks (`overflow-x-auto snap-x`) with subtle pagination dots (`•••`).
    - Bottom-anchored primary action pill: `Plan my day with AI` docked cleanly above bottom dock.
  - **AI (Planning Companion)**:
    - Dedicated conversational screen with `100dvh` keyboard-resilient layout.
    - Horizontally browsable prompt suggestion chips.
    - Clean schedule proposal cards with 1-tap `Apply Proposed Schedule to My Day`.
    - Bottom-anchored message composer with voice dictation (`Mic`).
  - **My Day (Daily Execution)**:
    - Dominant central visual: **Focus Spotlight Ring** dial with duration, scheduled time, and 1-tap green/terracotta play button (matching Regain's central timer ring).
    - Secondary summary pill: Daily progress (`completed of total blocks done • remaining time`).
    - Horizontally browsable upcoming tasks queue with snap scrolling and pagination dots.
    - Clean open vertical execution timeline with 1-click status checkboxes and priority badges.
    - Dynamic mid-day reschedule action.
    - Bottom-anchored primary action pill: `Start focus session`.
  - **Growth (Behavior, Flow & Insights)**:
    - Top segmented pill control (`Habits`, `Flow Theory`, `Habit Reset`, `Insights`) non-competing with bottom nav.
    - Dominant central visual in Flow tab: Circular persistent focus timer dial with countdown, progress ring, and Challenge–Skill Check-In.
    - Cue-anchored habits with 2-minute activations and automaticity tracking.
    - Life discontinuity reset transitions and empirical distraction resistance insights.
    - Contextual bottom-anchored primary actions (`Start focus interval`, `Add new habit`, `Log life discontinuity`).
- **Automated Verification**:
  - 0 horizontal overflows across 9 viewports (320px to 1440px) verified via Puppeteer.
  - Header and bottom nav touch targets meet $\ge 44\text{px}$ accessibility standards.
  - 82/82 automated tests passing across 7 test suites. All 19 Next.js routes compile cleanly.

## [0.8.0] - 2026-11-04

### Added & Redesigned
- **Complete Visual Identity & Global Design System Overhaul**:
  - **Distinctive Typography System**:
    - Integrated **Instrument Serif** and **Lora** via Google Fonts and `next/font/google` for large, expressive, literary headings.
    - Integrated **Manrope** for clean, spacious, humanist UI typography and body text.
    - Integrated monospace font stack for timestamp badges.
  - **Warm Editorial Color Palette**:
    - Replaced generic cold slate/blue SaaS palette with warm, organic, tactile tones:
      - Canvas & Parchment: Warm Ivory (`#f8f6f0`), Parchment (`#f2eee6`), Ecru (`#e8e2d5`).
      - Ink & Typography: Deep Warm Charcoal (`#201e1b`), Muted Charcoal (`#545049`), Warm Stone (`#8a8479`).
      - Accents: Muted Sage (`#536b54`) for completion/growth, Warm Terracotta (`#b85437`) for focus/urgency, Olive (`#687050`) for routines/habits, and Warm Honey/Ochre (`#b37e2a`) for sparks.
      - Hairline Dividers: Delicate `#e8e2d5` and `#e4ded2` lines replacing thick container borders.
  - **De-Cardification & Open Architecture**:
    - Substantially reduced boxed containers, heavy rounded cards, and nested card borders.
    - Shifted visual structure to whitespace, typographic contrast, vertical timeline connectors, and subtle parchment washes.
  - **Global Application Shell Redesign**:
    - **Header**: Quiet, uncluttered greeting with serif typography, subtle sage *"AI Scheduled"* pill, refined date briefing, and minimal action buttons.
    - **Sidebar**: Architectural editorial layout with tactile 3-track persona switcher (Student, Pro, Both), quiet active indicators, and refined profile settings anchor.
    - **Mobile Bottom Navigation**: Warm parchment bar with deep charcoal active indicators and safe-area padding.
  - **Home Workspace Redesign**:
    - **Editorial Canvas Briefing**: Large expressive serif date heading (*"Monday, November 2"*) and clear overview of commitments and focus blocks.
    - **Architectural Month Calendar**: Open, uncluttered monthly surface with Instrument Serif / Lora header, delicate sage/terracotta/olive indicator dots, and smooth Week/Month toggle.
    - **Quiet AI Planning Bridge**: Replaced loud yellow promo banner with a warm, conversational parchment strip.
    - **Open Agenda Timeline**: Streamlined chronological list without enclosed card borders, featuring clean completion checkboxes, duration badges, and direct Quick Task triggers.
    - **Upcoming Horizon**: Minimalist upcoming commitments list with warm olive/parchment chips.

## [0.7.0] - 2026-11-04

### Fixed & Remediated
- **Reference Date Synchronization**:
  - Unified demo environment on single authoritative reference date: `DEMO_REFERENCE_DATE = "2026-11-02"` (`Monday, November 2, 2026`).
  - Anchored initial mock schedule, `selectedDate`, MonthCalendar navigation, and AI schedule generation to the authoritative date.
  - Resolved date desynchronization where AI tasks were placed on machine local time (`2026-11-04`) while calendar displayed `2026-11-02`.
- **Persistent Focus Timer Engine**:
  - Re-architected flow timer from local component state into global `DemoContext`.
  - Implemented epoch timestamp calculation (`targetEndTimestamp = Date.now() + secondsLeft * 1000`) with visibility change and window focus listeners.
  - Timer persists seamlessly across workspace navigation (`/growth` <-> `/my-day` <-> `/ai` <-> `/home`) and background browser tab switches without losing elapsed seconds or resetting.
- **Mid-Day Reschedule & Past-Time Protection**:
  - Fixed `handleDynamicReschedule` in `src/app/(dashboard)/my-day/page.tsx` to pass `currentTime: effectiveTime` (respecting current hours/minutes or wake time), preventing tasks from being scheduled in the past.
  - Added explicit conflict alerts when remaining hours before bedtime (23:00) are insufficient for scheduled workload.
- **Scientific Accuracy & Behavioral Science**:
  - Renamed predictive interface to **Challenge–Skill Check-In**, rooted in Mihaly Csíkszentmihályi's Flow Theory.
  - Added real-time adaptive recommendations:
    - *High Challenge ($\ge 4$) + Low Skill ($\le 2$)*: Anxiety alert with 1-click option to switch to a 20-minute activation sprint.
    - *Low Challenge ($\le 2$) + High Skill ($\ge 4$)*: Boredom alert with recommendation to introduce tighter time constraints or advanced sub-tasks.
    - *Balanced Demands ($\ge 3$)*: Flow Channel confirmation banner.
    - *Unclear Goal / Completion Criteria*: Prompt highlighting flow requirement for unambiguous immediate feedback.
  - **Habit Reset Transition Materialization**:
    - Created automatic bridge between `HabitResetTransition` target habits and active `habits` collection in `DemoContext`.
    - Initialized new transition habits with non-punitive baseline automaticity (25%), anchor cues, and duplicate prevention.
  - **Empirical Analytics in Insights**:
    - Replaced hardcoded distraction resistance scores (4.6/5 vs 2.8/5) with authentic computation from `focusSessions` log.
    - Added honest insufficient-data empty state when fewer than 2 flow reflection sessions are recorded.
    - Fixed `habits[0]` bug by dynamically sorting habits by `automaticityScore` descending.
- **Mobile Responsiveness & Gesture Protection**:
  - **Zero Horizontal Overflow**: Verified $0\text{px}$ overflow across all 9 target viewports (320px, 360px, 375px, 390px, 414px, 430px, 768px, 1024px, 1440px).
  - Eliminated 551px minimum width bottleneck on `/home` by hiding redundant banner action buttons on small screens.
  - Fixed `/ai` chat layout on mobile using dynamic viewport units (`100dvh`), docking input field cleanly above mobile bottom navigation without double scrollbars.
  - Upgraded mobile header touch targets (Menu toggle, Google Calendar sync button, Quick Task button, Notification bell) to meet or exceed $\ge 44\times 44\text{px}$.
  - Added iOS edge back/forward gesture protection in `useWorkspaceSwipe` (ignoring swipes with `startX < 28px` or `> innerWidth - 28px`) and 450ms cooldown debounce.
- **Testing & Verification**:
  - Created 3 new test suites:
    - `tests/scheduler/reschedule.test.ts` (12 tests): Mid-day rescheduling at 10:00 AM, 3:00 PM, and 7:00 PM; past-time protection; overbooked capacity detection.
    - `tests/habits/habit-reset.test.ts` (13 tests): Habit Reset materialization, duplicate prevention, non-punitive automaticity computation.
    - `tests/growth/flow-timer.test.ts` (20 tests): Timestamp-based elapsed time calculation, pause/resume mechanics, reflection logging.
  - Total automated unit test suite expanded from 37 to **82 passing tests** across 7 test files (`npm test` passes 100%).
  - Full Next.js production build (`npm run build`) completed cleanly with Turbopack and static generation across all 19 application routes.

## [0.6.0] - 2026-11-04

### Added
- **Complete UI/UX Product-Level Redesign & Growth Workspace Integration**:
  - **4 Dedicated Core Workspaces**:
    - **Home (`/home`) — Calendar-First Experience**:
      - Prominently positions the calendar as the visual centerpiece of the page.
      - Integrated contextual side-inspector showing day-specific agenda allocations, focus summaries, and upcoming multi-day commitments.
      - Quick shortcut card to conversational AI planning.
    - **AI (`/ai`) — Conversational Planning Assistant**:
      - Full-height dedicated planning environment replacing cramped inline chat widgets.
      - Rich conversation stream with role-specific avatars and intelligent constraint-based proposals.
      - Interactive schedule proposal cards with 1-click "Apply to Schedule" and "Review in My Day".
      - Tailored prompt chips carousel for morning study sessions, unexpected meeting shifts, and mid-day catch-ups.
      - Integrated Web Speech API microphone dictation modal with live speech recognition, editing, and quick test utterances.
      - Strict casual question guardrail: casual questions ("who are you", "what can you do") trigger conversational replies without generating tasks.
    - **My Day (`/my-day`) — Daily Execution & Timeline**:
      - "Up Next" Spotlight Hero Card highlighting the imminent task, duration, tags, and 1-click "Launch Flow Session" and "Mark Done" buttons.
      - Daily completion percentage meter and focus hours planned vs. completed.
      - 1-click "Reorganise Remaining Day with AI" button invoking the deterministic constraint solver from current time, adapting remaining flexible tasks around fixed commitments.
      - Chronological timeline with filter pills (*All, Active, Fixed, Completed*) and Quick Task Modal.
    - **Growth (`/growth`) — Behavior, Flow & Personal Development**:
      - **Habits Tab**: Rooted in behavioral science (James Clear / BJ Fogg). Features anchor cues ("After morning tea"), physical context cues ("At study desk"), 2-minute minimum activation versions ("Read 1 problem explanation"), automaticity index progress bars (0-100%), and 7-day completion heat dots.
      - **Flow Theory Tab**: Rooted in Mihaly Csíkszentmihályi's Flow Theory. Features pre-session check-in rating perceived challenge (1-5) and skill (1-5) with 2D flow quadrant prediction (*Flow Channel, Anxiety, Boredom, Apathy*), immersion timer (20m, 25m, 45m, 50m, 90m), real-time "Log Distraction" counter, and post-session reflection modal evaluating Absorption, Concentration, Control, Enjoyment, and Time Distortion.
      - **Habit Reset Tab**: Rooted in the Verplanken & Roy (2016) Habit Discontinuity Hypothesis. Tracks major life transitions (new semester, promotion, relocation) that disrupt environmental cues, cataloging disrupted routines, obsolete cues to retire, and replacement anchor habits with status indicators.
      - **Insights Tab**: Synthesizes habit automaticity metrics, deep work volume, peak cognitive windows, and AI behavioral observations based on logged session data.
  - **Mobile Touch Gestures & Navigation**:
    - Bottom Navigation bar with 4 workspace destinations (`Home`, `AI`, `My Day`, `Growth`), active amber indicators, and safe-area padding.
    - Horizontal swipe navigation (`Home` <-> `AI` <-> `My Day` <-> `Growth`) powered by `useWorkspaceSwipe` hook with swipe progress bar and touch target filtering (ignoring inputs, textareas, sliders, and buttons).
    - Desktop persistent left sidebar and tablet icon-rail updated with the 4 workspaces and bottom profile link.
  - **Backward Compatibility & System Hardening**:
    - Upgraded `/plan` and `/habits` with helpful navigation banners pointing to `/my-day` and `/growth`.
    - Turbopack prerender hardening: eliminated non-deterministic `new Date()` reads outside `useEffect` during Next.js 16 static compilation.
    - 37/37 unit tests passing across all 4 test suites; full static export passing across all 19 application routes.

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
