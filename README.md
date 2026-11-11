# Kronos AI — Intelligent Personal Planning & Adaptive Time Management Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.4.3-black.svg?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Postgres-3ecf8e.svg?style=flat-square&logo=supabase)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> **Academic Prototype Evaluation Notice**: Kronos AI is an advanced research and engineering prototype engineered for academic submission and behavioral productivity studies. The platform integrates a **deterministic constraint-satisfaction scheduling engine** with a structured AI intent architecture. In this stabilization milestone, natural language planning operates via high-fidelity deterministic simulation matching the Google Gemini API schema; live Gemini API keys activate real-time LLM inference in the upcoming phase.

---

## 📖 Executive Overview

**Kronos AI** is a calm, notebook-inspired personal time-management web application designed to eliminate planning paralysis, cognitive overload, and calendar fragmentation for **students**, **working professionals**, and **dual-track individuals** (working students).

Unlike conventional calendar apps that treat time as an inert grid, and unlike unconstrained LLM chat interfaces that hallucinate overlapping commitments and ignore biological limits, Kronos AI marries **conversational intent capture** with an **exact mathematical constraint solver**.

```
[ User Intent (Natural Language / Voice) ]
                   │
                   ▼
[ Structured Intent Parsing & Task Decomposition ]
                   │
                   ▼
[ Pure Deterministic Constraint-Satisfaction Engine ]
    ├── Wake/Sleep Boundary Enforcement (23:00 curfew)
    ├── Fixed Commitment Protection (Lectures, Meetings)
    ├── Energy Rhythm Alignment (Morning/Afternoon/Evening Peak)
    └── Transition Buffers & Focus Duration Thresholds
                   │
                   ▼
[ Verifiable, Non-Overlapping Feasible Daily Schedule ]
                   │
                   ▼
[ Bi-Directional Google Calendar Sync & Adaptive Mid-Day Rescheduling ]
```

---

## 🌟 Key Capabilities & Architectural Pillars

### 1. Dual-Engine Scheduling Architecture
- **Intent Layer**: Translates unstructured goals (*"Two problem sets, gym at 4, review economics for an hour"*) into discrete tasks with durations, categories, priorities, and energy demands.
- **Solver Layer**: Pure TypeScript interval-packing engine (`src/lib/scheduler/`) that validates temporal feasibility, never overlaps fixed commitments, respects waking hours, and flags overbooked capacities before committing changes to storage.

### 2. Multi-Tenant Data Isolation & Security
- **Production Supabase Integration**: Authentic authentication via Supabase Auth (Email/Password and Google OAuth).
- **Zero Demo Leakage**: Fresh signups initialize with a strictly empty workspace (0 fake tasks, 0 demo schedules, 0 phantom notifications).
- **Strict User Partitioning**: Browser storage keys and database records are isolated strictly by `user_id` (`kronos_ai_user_state_v1_${userId}`).
- **SSR Route Protection**: `@supabase/ssr` middleware defends all dashboard routes (`/home`, `/ai`, `/my-day`, `/growth`, `/profile`, `/onboarding`).

### 3. Google Calendar Bi-Directional Synchronization
- **RFC-3339 Delta Syncing**: Implements incremental sync tokens (`syncToken`) to efficiently pull external Google Calendar updates and push local Kronos tasks.
- **Configurable Cadence**: Automatic background sync configurable from **15 minutes**, **30 minutes**, **1 hour**, **6 hours**, **12 hours**, **1 day**, **1 week**, or **manual trigger**.
- **Conflict Management**: Detects collisions between local agenda blocks and external calendar additions, providing visual conflict alerts and resolution options.

### 4. Behavioral Science & Flow Theory
- **Csíkszentmihályi Immersion Timers**: Multi-duration focus timers (20m, 25m, 45m, 50m, 90m) mapped against perceived challenge vs. skill to identify Flow, Steady, Anxiety, or Boredom.
- **BJ Fogg Tiny Habits & 2-Minute Activations**: Decomposes daunting routines into frictionless minimum viable actions anchored to reliable daily cues.
- **Self-Reported Habit Index (SRHI)**: Automaticity tracking without punitive streak shame.

### 5. Responsive, Calm Journal Aesthetic
- **Warm Parchment Visual Identity**: Handcrafted palette with `#fbf9f5` background, `#201e1b` charcoal typography, `#b85437` terracotta accents, and `#536b54` sage indicators.
- **Mobile First Ergonomics**: Bottom sheet task modals, minimum 48px touch targets, zero horizontal overflow across 320px–1440px displays, and clean bottom navigation docks.

---

## 🚀 Quickstart & Local Setup

### System Prerequisites
- **Node.js**: `v20.x` or later (tested on Node v20.18.0)
- **npm**: `v10.x` or later
- **Modern Browser**: Chrome, Firefox, Safari, Edge

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/iamkolakiprajwal-byte/kronos-ai.git
cd kronos-ai
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:

```bash
# Supabase Live Auth & Postgres Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Production Flag (Disables all evaluator mock bypasses)
NEXT_PUBLIC_DEMO_MODE=false

# Google Gemini AI (Optional in Prototype Mode; required for live LLM inference)
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-flash

# Google Calendar Integration (Optional for OAuth sync)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Automated Quality Assurance Suite
```bash
# Run all 10 domain test suites (148 automated unit/integration tests)
npm test

# Run Next.js production build verification
npm run build
```

### 4. Start Local Development Server
```bash
npm run dev -- -p 3001
```
Open [http://localhost:3001](http://localhost:3001) in your browser. Unauthenticated traffic is routed to `/login`.

---

## 🧭 Navigation Matrix & Workspaces

| Route | Workspace | Description |
| :--- | :--- | :--- |
| `/login` | Authentication | Secure Supabase email/password login and Google OAuth entry. |
| `/signup` | Registration | New user creation with email verification handshakes. |
| `/forgot-password` | Account Recovery | Trigger password reset dispatch email. |
| `/reset-password` | Password Reset | Token-authenticated password update form. |
| `/home` | Daily Command | Monthly interactive calendar, today's agenda, and status metrics. |
| `/onboarding` | Guided Wizard | 4-step personalized setup wizard for Student, Pro, or Dual tracks. |
| `/ai` | Planning Assistant | Conversational schedule formulation with deterministic validation. |
| `/my-day` | Daily Execution | Day execution timeline, dynamic mid-day reschedule, and task checkoffs. |
| `/growth` | Behavioral Hub | Csíkszentmihályi flow timers, habit automaticity, and carbon tracker. |
| `/profile` | User Preferences | Bedtime/waking controls, sync interval selector, and data import/export. |

---

## 🧪 Testing & Verification Summary

The project enforces zero-defect rigor across automated unit tests, integration scenarios, and live browser automation:

- **Constraint Scheduling Engine**: `13/13 Passed` (`tests/scheduler/scheduler.test.ts`)
- **Dynamic Mid-Day Rescheduler**: `12/12 Passed` (`tests/scheduler/reschedule.test.ts`)
- **Calendar Delta Sync Adapter**: `9/9 Passed` (`tests/calendar/calendar-sync.test.ts`)
- **Persistent Google Calendar Auth**: `8/8 Passed` (`tests/calendar/persistent-auth.test.ts`)
- **Carbon & Eco Calculator**: `8/8 Passed` (`tests/sustainability/eco-calculator.test.ts`)
- **Goal Decomposition Engine**: `7/7 Passed` (`tests/ai/roadmap.test.ts`)
- **Non-Punitive Habit Reset**: `8/8 Passed` (`tests/habits/habit-reset.test.ts`)
- **Csíkszentmihályi Flow Timer**: `7/7 Passed` (`tests/growth/flow-timer.test.ts`)
- **End-to-End User Scenarios**: `50/50 Passed` (`tests/e2e/e2e-scenarios.test.ts`)
- **Clean Auth & Onboarding State**: `29/29 Passed` (`tests/auth/auth-clean-state.test.ts`)
- **Multi-User Data Isolation**: `5/5 Passed` (`tests/auth/user-data-isolation.test.ts`)
- **Total Automated Test Suites**: **156/156 Passed (100%)**
- **Multi-Viewport Browser Matrix**: `64/64 Passed` (`scripts/manual-qa-suite.mjs`)
- **Turbopack Production Build**: `22/22 Routes Static/Dynamic Compiled Cleanly`

---

## 🏛️ Academic & Engineering Documentation Suite

This repository includes a comprehensive 12-document engineering suite detailing every facet of Kronos AI:

1. [`README.md`](./README.md) — Platform overview, philosophy, quickstart, and testing summary.
2. [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) — Comprehensive technical history, user tracks, and evolution.
3. [`PROJECT_SPEC.md`](./PROJECT_SPEC.md) — Formal functional specifications, user stories, and acceptance criteria.
4. [`ARCHITECTURE.md`](./ARCHITECTURE.md) — Deep architectural analysis, data flows, and state machines.
5. [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md) — Supabase PostgreSQL schema, relational entities, and RLS policies.
6. [`FEATURES_AND_STATUS.md`](./FEATURES_AND_STATUS.md) — Complete inventory of 40+ features and operational readiness.
7. [`TESTING_AND_QA.md`](./TESTING_AND_QA.md) — Test plan, coverage reports, and edge-case verification matrices.
8. [`CHANGELOG.md`](./CHANGELOG.md) — Chronological history of milestones, optimizations, and security patches.
9. [`DEVELOPMENT_LOG.md`](./DEVELOPMENT_LOG.md) — Detailed engineering journal recording technical decisions.
10. [`KNOWN_ISSUES.md`](./KNOWN_ISSUES.md) — Documented edge cases, limitations, and workarounds.
11. [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) — Production deployment instructions for Vercel & Supabase.
12. [`NEXT_PHASE_GEMINI_INTEGRATION.md`](./NEXT_PHASE_GEMINI_INTEGRATION.md) — Technical transition blueprint for Gemini API integration.
