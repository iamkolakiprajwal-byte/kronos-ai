# Kronos AI — Manual Verification Checklist & Presentation Guide (A2)

This document provides a concise **Actionable Manual Verification Checklist** for items requiring human configuration, credentials, or physical testing, followed by an **Academic Presentation Guide** organizing project material for slide decks versus detailed written documentation.

---

## 1. Manual Verification Checklist

The following items cannot be verified automatically by the test runner and require specific human action, external credentials, or live user testing:

### 1.1 External Service Credentials & Configuration
- [ ] **Google Gemini API Key Provisioning**:
  - *Current Status*: `CONFIGURATION_REQUIRED`. The provider code (`src/lib/ai/gemini-provider.ts`) and API routes (`src/app/api/ai/chat/route.ts`) are 100% implemented, but `GEMINI_API_KEY` is not present in the production environment.
  - *Action Required*: Obtain an API key from [Google AI Studio](https://aistudio.google.com/) and add `GEMINI_API_KEY` to Vercel Project Settings > Environment Variables.
  - *Verification Test*: Execute `curl -s https://kronos-ai-theta.vercel.app/api/ai/chat` and verify that `configured: true` and `provider: "Google Gemini"` are returned.
- [ ] **Google Cloud OAuth Consent Screen Public Access**:
  - *Current Status*: Project is currently in Google Cloud "Testing" status with an unverified branding attempt blocking public logins without manual tester whitelist.
  - *Action Required*: Create a clean Google Cloud project without uploading an App Logo (which bypasses enterprise branding verification), configure authorized redirect URIs, and click **Publish App** to move to "In Production".
  - *Verification Test*: Attempt to log in with an arbitrary external `@gmail.com` account not listed in the test user whitelist.

### 1.2 User Testing & Empirical Validation
- [ ] **Formal User Acceptance Testing (UAT)**:
  - *Current Status*: 50 automated end-to-end user scenarios passing; zero formal human diary studies conducted to date.
  - *Action Required*: Recruit 5 students and 5 working professionals to execute daily planning for 7 consecutive days.
  - *Metrics to Collect*: Daily schedule adherence percentage, number of dynamic reschedules triggered, perceived stress reduction (Likert 1–5 scale).
- [ ] **Cross-Browser Web Speech API Physical Device Testing**:
  - *Current Status*: Chromium desktop voice dictation verified; mobile iOS Safari and Android Chrome require physical device verification.
  - *Action Required*: Open `https://kronos-ai-theta.vercel.app/ai` on an iPhone (Safari) and Android phone (Chrome), tap the microphone icon, grant browser audio permissions, and speak a task prompt.

### 1.3 Infrastructure & Stress Testing
- [ ] **Distributed Concurrency & Load Testing**:
  - *Current Status*: Single-flight mutexes verified in unit tests; no distributed HTTP stress testing conducted.
  - *Action Required*: Run a k6 or Apache Bench load test simulating 50 concurrent users requesting `/api/schedule/generate` simultaneously.

### 1.4 Academic Submission: Private Repository Evaluator Access
- [ ] **Grant Evaluator / Professor Access**:
  - *Current Status*: Repository converted to **Private** (`https://github.com/iamkolakiprajwal-byte/kronos-ai`).
  - *Action Required*: To ensure evaluators can inspect code without 404 errors, add them as collaborators (GitHub Repository > **Settings** > **Collaborators** > **Add people**) or submit a clean `.zip` archive alongside the A2 documentation.

---

## 2. Presentation Slide Deck vs. Written Report Categorization

To ensure maximum academic impact, project information should be partitioned between high-level presentation slides and exhaustive written technical documentation:

### Part A: Recommended Slide Deck Structure (10–12 Slides)

```
┌────────────────────────────────────────────────────────────────────────┐
│ SLIDE 1: Title & Executive Summary                                     │
│ • Product Name: Kronos AI (Intelligent Personal Planning Assistant)   │
│ • Target Users: Students, Working Professionals, Dual-Track Individuals│
│ • Deployed Live at: https://kronos-ai-theta.vercel.app                 │
├────────────────────────────────────────────────────────────────────────┤
│ SLIDE 2: The Problem: The Productivity Platform Paradox               │
│ • Static To-Do Lists lack temporal reality (infinite guilt lists)      │
│ • Rigid Time-Blocking collapses when unexpected delays or classes shift│
│ • Schedule Fatigue: Users abandon calendars after the first disruption │
├────────────────────────────────────────────────────────────────────────┤
│ SLIDE 3: The Kronos Solution & Four Core Workspaces                    │
│ • 1. Home: Overview journal with monthly grid and daily agenda         │
│ • 2. AI Workspace: Natural language planning and voice dictation       │
│ • 3. My Day: Execution timeline with actionable task separation        │
│ • 4. Growth: Flow theory immersion timers & habit formation            │
├────────────────────────────────────────────────────────────────────────┤
│ SLIDE 4: Architectural Innovation: Hybrid AI + Deterministic Solver   │
│ • Why pure LLMs fail at scheduling (hallucinations, curfew violations) │
│ • Decoupled Architecture: LLM extracts intent; pure TypeScript solver │
│   guarantees zero collisions, bedtime curfews, and lunch buffers       │
├────────────────────────────────────────────────────────────────────────┤
│ SLIDE 5: System Architecture & Technology Stack                        │
│ • Frontend: Next.js 16 (App Router), React 19, Tailwind CSS v4         │
│ • Backend: Next.js Serverless API routes with TypeScript               │
│ • Database & Auth: Supabase Cloud PostgreSQL (17 Tables + Strict RLS)  │
│ • Integrations: Google Calendar API v3, Google Tasks API v1, Gemini    │
├────────────────────────────────────────────────────────────────────────┤
│ SLIDE 6: Two-Way Google Calendar & Tasks Integration                   │
│ • Autonomous token refresh vault (5-minute proactive buffer)           │
│ • Inbound import of lectures, meetings, and birthday calendars         │
│ • Bidirectional Google Tasks synchronization with conflict resolution  │
├────────────────────────────────────────────────────────────────────────┤
│ SLIDE 7: Behavioral Psychology & Cognitive Flow                        │
│ • Csíkszentmihályi Immersion Timers (20m, 25m, 45m, 50m, 90m)          │
│ • Post-session state logging (Flow, Steady, Boredom, Anxiety)          │
│ • Habit formation with anchor cues & Self-Report Habit Index (SRHI)    │
│ • Psychological Fresh Start / Habit Reset without penalizing debt      │
├────────────────────────────────────────────────────────────────────────┤
│ SLIDE 8: Quality Assurance & Empirical Evidence                        │
│ • 174 automated tests across 11 suites (100% Passing)                  │
│ • Headless browser matrix across 7 viewports (320px–1440px)            │
│ • Hermetic multi-tenant data isolation and corrupted payload recovery  │
├────────────────────────────────────────────────────────────────────────┤
│ SLIDE 9: Engineering Challenges & Pivots                               │
│ • Eliminating demo data pollution (dynamic user storage partitioning)  │
│ • Resolving database upsert 42P10 constraints                          │
│ • Preserving refresh tokens during silent re-authorizations            │
├────────────────────────────────────────────────────────────────────────┤
│ SLIDE 10: Current Status, Limitations & Future Roadmap                 │
│ • Status: Deployed Functional Prototype (Live on Vercel)               │
│ • Pending: Production Gemini API key configuration, UAT diary study    │
│ • Roadmap: Offline-first IndexedDB PWA sync, Apple Calendar adapter    │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Part B: Items That Belong ONLY in the Written Report

Do NOT clutter presentation slides with the following technical artifacts; keep them strictly within `KRONOS_AI_A2_TECHNICAL_INFORMATION_REPORT.md` and annexures:

1. **Complete Database Schema DDL**:
   - Full 17-table SQL statements with foreign keys, cascading deletes, and composite constraints.
2. **Row Level Security (RLS) Policy Definitions**:
   - Exact PostgreSQL `CREATE POLICY ... USING (auth.uid() = user_id)` statements.
3. **Low-Level Mathematical Helper Functions**:
   - Pure function implementations such as `timeToMinutes`, `minutesToTime`, and interval intersection arithmetic.
4. **Zod Validation Schemas**:
   - Detailed request/response schemas for `/api/schedule/generate` and `/api/ai/chat`.
5. **Full Test Execution Logs**:
   - Verbose stdout logs for all 174 passing unit, integration, and E2E test runs.
6. **Detailed Third-Party Deprecation Logs**:
   - Next.js 16 `proxy.ts` notices and Node.js 20 runtime advisories.
7. **Environment Variable Configuration Tables**:
   - Comprehensive documentation of all local, preview, and production variable names.
