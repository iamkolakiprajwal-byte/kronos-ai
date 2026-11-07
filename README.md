# AI Time Manager ("Kronos AI") — Intelligent Personal Planning Platform

An intelligent, calm, notebook-inspired personal time-management web application engineered for students, working professionals, and dual-track individuals. Combining natural language conversational planning with a deterministic scheduling engine, flow focus sessions, voice dictation, sustainability routines, and real-time multi-user synchronization.

---

## 🌟 Highlights & Philosophy

- **Intelligent Daily Orchestration**: Understands daily biological routines, waking hours, peak focus periods, academic deadlines, and fixed meetings.
- **Conversational Planning**: Tell the AI what you need to achieve today (*"Two assignments to complete, study economics for an hour, gym session, learn Blender"*), and watch it propose a balanced schedule without hallucinating overlaps.
- **Deterministic Scheduling Engine**: AI translates intent into tasks; a pure TypeScript constraint-satisfaction scheduling engine verifies feasibility, respects sleep boundaries, protects lunch buffers, and matches energy curves.
- **Multi-User Security & Isolation**: Fully isolated multi-tenant architecture powered by Supabase with Row Level Security (RLS) policies enforcing strict `auth.uid() = user_id` ownership across all tables.
- **Robust Authentication & SSR Protection**: Built with `@supabase/ssr` middleware protecting private routes (`/home`, `/ai`, `/my-day`, `/growth`, `/profile`, `/onboarding`) and managing sessions, email verification, password reset, and OAuth callbacks.
- **Google Calendar API v3**: Native calendar synchronization architecture supporting bi-directional event imports, conflict detection, and schedule sync.
- **Flow Theory Focus Sessions**: Mihaly Csíkszentmihályi immersion timers (20m, 25m, 45m, 50m, 90m) with post-session reflection logging (*Flow, Steady, Boredom, Anxiety*) and habit automaticity tracking without streak shame.
- **Browser Voice Input**: Web Speech API integration with microphone toggle, live transcript streaming, and edit-before-submit modal.
- **Environmental Sustainability**: Carbon offset and tree equivalence tracker for active cycling/walking commutes, paperless study notes, and power-down hours.
- **Calm Notebook Aesthetic**: Designed to feel like a high-grade digital planning journal (`#faf9f6` paper background, warm slate borders `#e6e3da`, serif typography).

---

## 🚀 Quickstart

### Prerequisites
- Node.js 20.x or later
- npm 10.x or later
- Supabase project (for Authentication & Database)
- Google Gemini API Key (for real-time AI planning)

### Environment Setup
Create a `.env.local` file in the project root with your credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Google Gemini AI (Required for live AI planning)
GEMINI_API_KEY=your-gemini-api-key-here

# Google OAuth & Calendar (Optional - for Google Calendar sync)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app # or http://localhost:3000
```

### Installation & Execution
```bash
# Clone or navigate to the project directory
cd ai-time-manager

# Install dependencies
npm install

# Run all automated test suites (130 unit tests across 8 domains)
npm test

# Run Next.js production build check
npm run build

# Start local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) (or configured port) in your browser. Unauthenticated visitors are automatically directed to `/login`.

---

## 🧭 Application Routes

### Public & Authentication Routes
- `/login`: Secure email/password & Google OAuth authentication.
- `/signup`: New user registration with email verification.
- `/forgot-password`: Password reset dispatch via Supabase Auth.
- `/reset-password`: Token-verified password renewal interface.
- `/auth/callback`: Server-side OAuth exchange and session persistence handler.

### Protected Application Workspaces (Protected via `middleware.ts`)
- `/home`: Primary daily command center — Monthly Calendar, Today's Agenda, lock badges for fixed commitments, progress metrics, GCal sync pill, and conversational AI Assistant dock.
- `/onboarding`: Dynamic multi-step guided onboarding wizard tailoring questions based on user type (Student, Professional, or Dual Track), persisting directly to Supabase.
- `/ai`: Conversational planning workspace with voice dictation, structured task extraction, and dynamic schedule proposals.
- `/my-day`: Daily execution workspace featuring the Focus Spotlight Ring, real-time task queue, and mid-day schedule adjustment.
- `/growth`: Behavioral development hub featuring Habits with cue anchoring, Flow check-in timers, and life transition logs.
- `/profile`: Routine parameters, academic/work details, Google Calendar adapter status, and interactive Environmental Sustainability dashboard.

### Server API Endpoints
- `POST /api/ai/chat`: Zod-validated conversational planning and task extraction endpoint with server-side Gemini validation (honest 503 response when unconfigured).
- `GET /api/ai/chat`: Live configuration health check verifying `GEMINI_API_KEY` status.
- `POST /api/schedule/generate`: Pure TypeScript deterministic constraint-satisfaction schedule calculator.
- `POST /api/calendar/sync`: Two-way calendar synchronization and conflict resolution endpoint.
- `GET /api/calendar/sync`: Live Google Calendar API integration status check.
- `POST /api/goals/decompose`: Multi-horizon goal decomposition endpoint generating milestone phases and actionable daily study blocks.

---

## 🗄️ Database Schema & Migrations

Database migrations are located in `supabase/migrations/`:
- `20261102000000_initial_schema.sql`: Core schema with 16 relational tables and base RLS policies.
- `20261105000000_production_evolution.sql`: Production schema enhancements:
  - Added `onboarding_completed`, `timezone`, and `preferred_name` to `public.profiles`.
  - Added `public.focus_sessions` table with RLS (`auth.uid() = user_id`).
  - Added `public.onboarding_records` table with multi-step draft saving and RLS.
  - Added `public.academic_details` and `public.professional_details` tables with RLS.

To apply migrations to your Supabase project:
```bash
npx supabase db push
```
Or paste the migration SQL directly into the Supabase SQL Editor.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack) + React 19
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS v4 + Lucide Icons
- **AI Engine**: Google Gemini API (`GeminiProvider`) with strict runtime error handling
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS) & `@supabase/ssr` middleware
- **Scheduling**: Deterministic constraint solver enforcing collision-free allocations
- **Calendar**: Shared interface supporting native `GoogleCalendarAdapter`
- **Voice**: Browser Web Speech API (`useSpeechRecognition`)
- **PWA**: Web App Manifest (`manifest.json`) and Service Worker (`sw.js`)

---

## 🧪 Automated Test Suite

Run the full suite using:
```bash
npm test
```
All 130 tests pass cleanly across 8 suites:
- `tests/scheduler/scheduler.test.ts`: Collision prevention, sleep boundaries, lunch buffers, unfeasible workload warnings, mid-day rescheduling.
- `tests/calendar/calendar-sync.test.ts`: Incremental sync tokens, push/delete events, remote conflicts, conflict resolution.
- `tests/sustainability/eco-calculator.test.ts`: Carbon savings in kg, tree equivalents, active commute minutes, empty log resilience.
- `tests/ai/gemini-provider.test.ts`: Conversational extraction, error boundaries, preference memory extraction.
- `tests/goals/decomposition.test.ts`: Horizon breakdown into multi-week milestones and daily actionable agenda blocks.
- `tests/habits/srhi.test.ts`: Automaticity scoring, consistency ratings, cue adherence.
- `tests/auth/auth-service.test.ts`: Registration, session handling, password recovery, route guards.
