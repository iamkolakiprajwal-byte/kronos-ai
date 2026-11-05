# PROJECT_SPEC.md — AI Time Manager Specifications & Requirements

## 1. Product Overview
The **AI Time Manager** is an intelligent personal planning assistant engineered for students, working professionals, and individuals managing combined academic and professional obligations. It unifies daily scheduling, goal roadmapping, habit building, flow sessions, and calendar synchronization into a calm, notebook-inspired interface.

---

## 2. User Roles & Personas

### 2.1 The Student Persona (e.g., "Aria Chen — CS & Economics Undergrad")
- **Academic Context**: University courses, lab sessions, weekly problem sets, midterms, final exam dates.
- **Needs**: Balancing lecture timetables with study sessions, assignment deadlines, library blocks, campus commuting, and social/sleep balance.
- **Pain Point**: Overestimating available hours between classes and procrastinating on heavy multi-week projects.

### 2.2 The Professional Persona (e.g., "Marcus Reed — Senior Product Architect")
- **Work Context**: Core working hours (9 AM - 6 PM), stakeholder standups, code reviews, client workshops, cross-team deadlines.
- **Needs**: Protecting deep work blocks from meeting proliferation, handling urgent firefighting without losing daily goals.
- **Pain Point**: Context switching, fatigue, and inability to maintain personal habits (gym, reading) around unpredictable meetings.

### 2.3 The Dual Track Persona (e.g., "Elena Rostova — Working Student")
- **Context**: Part-time corporate analyst + Evening Master's degree student.
- **Needs**: Tight synchronization between office shifts, evening lectures, and weekend assignment crunch times.

---

## 3. Functional Requirements

### 3.1 Primary Workspaces & Mobile App-Like Navigation Architecture
- **Persistent Bottom Dock Navigation**: Fixed bottom navigation dock (`BottomNav`) providing instant access to the four primary destinations (`Home`, `AI`, `My Day`, `Growth`) with minimum 48px touch targets and device safe-area padding. Zero requirement to open menus for primary navigation.
- **Horizontal Swipe Navigation**: Two-way horizontal swiping (`Home` $\leftrightarrow$ `AI` $\leftrightarrow$ `My Day` $\leftrightarrow$ `Growth`) with iOS edge-back protection ($<28\text{px}$) and form element pass-through.
- **Regain-Inspired Screen Composition**:
  - **Minimal Mobile Top Header**: Clean 44px user avatar button (opens secondary profile/persona drawer), discreet sync status, notification bell, and quick action.
  - **Home (`/home`)**: Personal planner feel. Editorial date briefing, central architectural calendar with daily rhythm, horizontally browsable suggested schedule blocks with snap scrolling and pagination dots (`•••`), and docked bottom pill CTA: `Plan my day with AI`.
  - **AI (`/ai`)**: Dedicated conversational planning assistant. Translates natural language into deterministic schedule blocks. Horizontally browsable prompt chips, clean proposal cards with 1-tap `Apply Proposed Schedule to My Day`, speech dictation modal, and 100dvh mobile height adaptation with keyboard resilience.
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

### 3.3 Scheduling Engine Requirements
- Deterministic conflict checking: Fixed events (classes, client calls) cannot be moved or overlapped.
- Physiological realism: Mandatory sleep windows, meal breaks, and travel/transition buffers.
- Energy matching: Assign heavy analytical tasks to the user's reported peak focus hours.
- Clear explanatory feedback when requested workloads exceed available time.

### 3.4 Calendar Synchronisation
- Unified `CalendarAdapter` interface.
- Safe two-way sync simulation with incremental change detection, conflict prevention, and deletion handling.
- Demo mode utilizing a complete `MockCalendarAdapter` to prevent privacy breaches during review.

### 3.5 Habit & Flow Support
- Distinguishes repeated action frequency from cognitive automaticity:
  - **7-Day Completion Rate**: Empirical execution adherence over rolling 7 days.
  - **Anchor Cue Consistency**: Adherence to designated contextual triggering anchors.
  - **Self-Reported Automaticity (SRHI)**: 1–5 scale based on Verplanken & Orbell / Gardner measuring conscious deliberation vs automaticity.
- Flow focus session timer with distraction-free layout and self-reported engagement reflection (Csíkszentmihályi model).
- Compassionate recovery after broken streaks.

### 3.6 Environmental Sustainability (Optional Module)
- Opt-in eco-friendly routines (walking/cycling commute, zero-paper study, energy conservation).
- Realistic personal impact tracking without exaggerated carbon metrics.

### 3.7 Local Storage Persistence & Data Protection
- Zero external database costs: All application entities persist locally in browser `localStorage`.
- Schema versioning (`KRONOS_STORAGE_VERSION = 1`).
- Forward migration (`migrateState`) preserving existing user tasks, habits, and focus logs when schema structures evolve.
- Pre-migration safety backup (`KRONOS_BACKUP_KEY`) and corrupt data fallback (`KRONOS_CORRUPT_BACKUP_KEY`).
- One-click backup restoration (`restorePreMigrationBackup`).
- Full JSON export and import for portable evaluation.

### 3.8 Zero-Cost Demo Environment Integrity
- Transparent UI labeling across all screens:
  - Header: `Demo GCal: Synced` (MockCalendarAdapter simulated v3 API; zero Google OAuth credentials needed).
  - AI Assistant: `Offline Demo Intelligence (MockAIProvider)` running pure TypeScript deterministic constraint solving.
  - Profile: Explicit integration architecture cards identifying demo adapters and zero-cost local operation.

### 3.9 Onboarding Experience Flow
- **Stage 1 (Welcome)**: Introduction to adaptive, realistic time management philosophy.
- **Stage 2 (User Type)**: Choice of Student, Working Professional, or Both (Dual Track).
- **Stage 3 (Personal Info)**: Full name, email address, headline/title, and institution or enterprise.
- **Stage 4 (Daily Rhythm)**: Wake-up target, sleep boundary (protected no-work zone), active planning days, and peak mental focus windows (Morning, Afternoon, Evening, Night).
- **Stage 5 (Academic Information)**: For Students & Dual-Track: degree/course, semester, subjects, and interactive class timetable editor with fixed event flags.
- **Stage 6 (Professional Information)**: For Professionals & Dual-Track: job role, company, core work hours, and interactive recurring meetings editor.
- **Stage 7 (Goals)**: Short-term outcome and strategic horizon capability.
- **Stage 8 (Habit Formation)**: Current routine anchors and desired habits paired with behavioral context cues.
- **Stage 9 (Productivity Preferences)**: Focus session duration presets (25m, 45m, 50m, 60m, 90m), rest buffer intervals, and planning layout styles.
- **Stage 10 (Sustainability)**: Optional eco-routine tracking (commute, paperless notes, power mindfulness).
- **Stage 11 (Review & Summary)**: Complete summary review cards with direct jump-to-edit navigation.
- **Stage 12 (Schedule Preview & Approval)**: Initial deterministic schedule simulation displaying fixed commitments, study/deep work blocks, lunch buffers, and sleep boundaries, with approval directly activating the planner.
- **Quick Evaluation Presets**: Single-click auto-fill buttons for Student (Aria Chen), Professional (Marcus Reed), and Both (Elena Rostova).

### 3.8 Browser Voice Input & Web Speech API Dictation
- Native browser speech-to-text integration via `useSpeechRecognition` hook.
- Dedicated microphone trigger in the conversational AI assistant dock.
- Real-time transcript streaming with microphone recording pulse animation.
- Edit-before-submit modal: users review, correct, or select preset test utterances before triggering schedule calculation.
- Offline and unsupported browser fallback with sample test utterances.

### 3.9 Notifications & Progressive Web App (PWA)
- Web App Manifest (`manifest.json`) configuring standalone display, icons, and theme color.
- Service Worker (`sw.js`) supporting static asset caching, push event listeners, and window focusing on notification clicks.
- Scheduled Reminder Service (`reminder-service.ts`) scanning for upcoming lectures/meetings (15m reminder) and high-priority study blocks.

### 3.10 Database & Multi-Tenant Authentication Architecture
- Supabase PostgreSQL schema with 16 relational tables and foreign keys.
- Row Level Security (RLS) policies enforcing multi-tenant isolation (`auth.uid() = user_id`) on all tables.
- Notebook-styled `/login` and `/signup` views with 1-click persona demo logins.
- Fail-safe browser and server Supabase clients with memory fallback when credentials are not supplied.

### 3.11 Sustainability & Carbon Offset Modeling
- Behavioral carbon savings model (`eco-calculator.ts`):
  - Active cycling commute: 25g CO₂ saved per minute (~750g per 30m trip).
  - Walking commute: 20g CO₂ saved per minute (~400g per 20m trip).
  - Paperless digital notes / study: 15g CO₂ saved per hour.
  - Screen power-down hour: 30g CO₂ saved per hour.
  - Plant-based fuel meal: 1200g CO₂ saved per meal.
- Real-time metrics: Total CO₂ saved in kg, tree absorption equivalence (1 tree = 2000g CO₂ benchmark), and Eco Score (0-100).
- Interactive 1-click logging directly on the Profile page.

### 3.12 Zero-Cost Local Persistence & Prototype Architecture
- **Browser LocalStorage Subsystem (`src/lib/storage/index.ts`)**:
  - Zero-cost architecture requiring no paid Supabase or live cloud databases for assignment evaluation.
  - Schema versioned (`KRONOS_STORAGE_VERSION = 1`) with key `kronos_ai_local_state_v1`.
  - Persists all entities across browser sessions: `role`, `profile`, `tasks`, `calendarEvents`, `goals`, `habits`, `habitTransitions`, `focusSessions`, `chatMessages`, `notifications`, `ecoEntries`, and `selectedDateStr`.
  - SSR-safe hydration lifecycle and automatic reactive change persistence in `DemoContext`.
  - Diagnostics tracking byte size, entity counts, and last saved timestamps.
  - Full JSON backup export and import facility.
- **Demo Data Control Center & Baseline Reset**:
  - Dedicated "Local Persistence & Demo Control Center" card in `/profile` with live diagnostics and guarded reset modal.
  - 1-click restore to pristine demo baselines for **Student (Aria Chen)**, **Professional (Marcus Reed)**, or **Dual Track (Elena Rostova)**.
  - Quick-reset triggers in desktop sidebar footer and mobile navigation drawer.
- **Offline Mock AI Provider with Deterministic Solver Routing**:
  - Strict intent classification separating casual conversation (`general_query`), daily planning (`create_daily_schedule`), task rescheduling (`reschedule_task`), priority updates (`change_priority`), habit formation (`create_habit`), and milestone roadmaps (`goal_decomposition`).
  - Casual questions answered conversationally without unintended schedule mutations.
  - Candidate tasks routed through deterministic constraint solver before proposal presentation.
  - Dedicated 1-click proposal cards for tasks, habits, and goals.

---

## 4. Non-Functional Requirements
- **Performance**: Sub-100ms client interactions, zero unnecessary re-renders.
- **Visual Identity & Aesthetics**: Calm, warm, sophisticated editorial aesthetic inspired by Regain and timeless print journals:
  - **Typography**: Instrument Serif & Lora for expressive headings, Manrope for humanist body/interface text, JetBrains Mono for timestamps.
  - **Palette**: Warm Ivory (`#f8f6f0`), Parchment (`#f2eee6`), Deep Warm Charcoal (`#201e1b`), Muted Sage (`#536b54`), Warm Terracotta (`#b85437`), Olive (`#687050`), and Ochre (`#b37e2a`).
  - **Surface Architecture**: Open canvas with hairline dividers (`#e8e2d5`), generous whitespace, and zero card-soup or nested container clutter.
- **Security**: Server-side credential isolation, Supabase Row Level Security, no client-side API secret leakage.
- **Reliability**: Deterministic fallbacks for AI and calendar adapters ensuring 100% offline-resilient demo operation.

### 4.2 Responsive Redesign Requirements
- **Target Breakpoints**:
  - Mobile Small: 375px (iPhone SE / standard compact smartphone)
  - Mobile Large: 428px (iPhone Pro Max / modern flagships)
  - Tablet: 768px (iPad Mini / Portrait tablets)
  - Tablet Landscape / Small Laptop: 1024px
  - Desktop: 1280px+ (MacBook, widescreen desktop monitors)
- **Navigation Adaptation**:
  - Desktop: Persistent left sidebar (240px) with persona switcher and navigation links.
  - Mobile & Tablet: Slide-out hamburger navigation drawer or bottom navigation bar with easy thumb reach; sidebar collapses cleanly.
- **Calendar Adaptation**:
  - Desktop: Full 7-column month grid with multiple indicator dots and day details.
  - Mobile: Compact weekly swipe view or adaptive 7-column month grid with reduced font sizes and micro dots to prevent horizontal scrolling or squished boxes.
- **Daily Agenda & Schedule Adaptation**:
  - Timeline cards must stack vertically without content clipping on small screens (minimum 375px width).
  - Fixed lock badges, priority chips, and action buttons must wrap gracefully.
- **Conversational AI Assistant Dock**:
  - Desktop: Prominent docked card at the bottom of the home screen.
  - Mobile: Accessible compact bar with expandable sheet / drawer so it does not permanently occlude agenda items on smaller viewports.
- **Touch Ergonomics**: Minimum 44x44px touch targets for buttons, toggles, and modal dismiss actions.
