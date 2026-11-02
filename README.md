# AI Time Manager ("Kronos AI") — Intelligent Personal Planning Platform

An intelligent, calm, notebook-inspired personal time-management web application engineered for students, working professionals, and dual-track individuals. Combining natural language conversational planning with a deterministic scheduling engine, flow focus sessions, voice dictation, sustainability routines, and two-way calendar synchronisation.

---

## 🌟 Highlights & Philosophy

- **Not Just Another To-Do List**: Understands daily biological routines, waking hours, peak focus periods, academic deadlines, and fixed meetings.
- **Conversational Planning**: Tell the AI what you need to achieve today (*"Two assignments to complete, study economics for an hour, gym session, learn Blender"*), and watch it propose a balanced schedule without hallucinating overlaps.
- **Deterministic Scheduling Engine**: AI translates intent into tasks; a pure TypeScript constraint-satisfaction scheduling engine verifies feasibility, respects sleep boundaries, protects lunch buffers, and matches energy curves.
- **Interactive Two-Way Calendar Sync**: Google Calendar API v3 adapter architecture and an evaluation mock adapter with real-time conflict detection and side-by-side resolution.
- **Flow Theory Focus Sessions**: Csíkszentmihályi immersion timers (20m, 25m, 45m, 50m, 90m) with post-session reflection logging (*Flow, Steady, Boredom, Anxiety*) and habit automaticity tracking without streak shame.
- **Browser Voice Input**: Web Speech API integration with microphone toggle, live transcript streaming, and edit-before-submit modal.
- **Environmental Sustainability**: Carbon offset and tree equivalence tracker for active cycling/walking commutes, paperless study notes, and power-down hours.
- **Calm Notebook Aesthetic**: Designed to feel like a high-grade digital planning journal (`#faf9f6` paper background, warm slate borders `#e6e3da`, serif typography).
- **Assignment / Evaluation Mode**: Complete offline evaluation mode requiring 0 paid API keys or OAuth setups, featuring single-click persona presets for **Aria Chen (Student)**, **Marcus Reed (Professional)**, and **Elena Rostova (Dual Track)**.

---

## 🚀 Quickstart

### Prerequisites
- Node.js 20.x or later
- npm 10.x or later

### Installation & Execution
```bash
# Clone or navigate to the project directory
cd ai-time-manager

# Install dependencies
npm install

# Run all automated test suites (37 unit tests across 4 domains)
npm test

# Run Next.js production build check
npm run build

# Start local development server (target: http://localhost:3001)
npm run dev
```

Visit [http://localhost:3001](http://localhost:3001) in your browser.

---

## 🧭 Application Routes

### Frontend Views
- `/home`: Primary daily command center — Monthly Calendar, Today's Agenda, lock badges for fixed commitments, progress metrics, GCal sync pill, and conversational AI Assistant dock.
- `/onboarding`: 13-stage guided onboarding wizard with interactive timetable & recurring meetings editors and 1-click preset auto-fillers.
- `/plan`: Filterable daily and weekly schedules (All, Active, Urgent, Completed).
- `/goals`: Strategic horizons, interactive New Goal modal, and 1-click **AI Breakdown** into multi-week milestones and daily agenda blocks.
- `/habits`: Habit automaticity scoring, Csíkszentmihályi Flow timer, and persistent post-session reflection history log.
- `/profile`: Routine parameters, academic/work details, Google Calendar adapter status, and interactive Environmental Sustainability dashboard.
- `/login`: Minimalist notebook authentication page with instant demo persona logins.
- `/signup`: Registration page with demo mode toggles.

### Server API Endpoints
- `POST /api/ai/chat`: Zod-validated conversational planning and task extraction endpoint with memory extraction.
- `POST /api/schedule/generate`: Pure TypeScript deterministic constraint-satisfaction schedule calculator.
- `POST /api/calendar/sync`: Two-way calendar synchronization and conflict resolution endpoint.
- `POST /api/goals/decompose`: Multi-horizon goal decomposition endpoint generating milestone phases and actionable daily study blocks.

---

## 👥 Interactive Demonstration Presets

Switch between personas with 1 click from the sidebar or auto-fill during onboarding:
1. **Student (`Aria Chen`)**: Undergrad at Stanford University; semester lecture schedule, assignments, and exam review.
2. **Professional (`Marcus Reed`)**: Principal Systems Architect; standups, architecture review RFCs, code reviews, and deep work blocks.
3. **Dual Track (`Elena Rostova`)**: Working student balancing evening Master's coursework at UC Berkeley with part-time software engineering at Synthetix AI.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack) + React 19
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS v4 + Lucide Icons
- **AI Engine**: Google Gemini API (`GeminiProvider`) + context-aware offline NLP (`MockAIProvider`)
- **Database & Auth**: Supabase PostgreSQL with 16 relational tables and Row Level Security (RLS)
- **Scheduling**: Deterministic constraint solver enforcing collision-free allocations
- **Calendar**: Shared interface supporting `MockCalendarAdapter` and `GoogleCalendarAdapter`
- **Voice**: Browser Web Speech API (`useSpeechRecognition`)
- **PWA**: Web App Manifest (`manifest.json`) and Service Worker (`sw.js`)

---

## 🧪 Automated Test Suite

Run the full suite using:
```bash
npm test
```
- `tests/scheduler/scheduler.test.ts`: 13/13 passing tests (collision prevention, sleep boundaries, lunch buffers, unfeasible workload warnings, mid-day rescheduling).
- `tests/calendar/calendar-sync.test.ts`: 9/9 passing tests (initial sync, incremental sync tokens, push/delete events, simulated remote conflicts, conflict resolution).
- `tests/sustainability/eco-calculator.test.ts`: 8/8 passing tests (carbon savings in kg, tree equivalents, active commute minutes, empty log resilience).
- `tests/ai/roadmap.test.ts`: 7/7 passing tests (academic, skills, and career goal decomposition into chronological phases and daily actionable tasks).

---

## 📖 Development Context & Memory

All architecture decisions, progress logs, known issues, and next steps are strictly maintained in [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md). Please consult it before extending or testing features.
