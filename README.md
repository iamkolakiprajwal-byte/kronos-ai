# AI Time Manager — Intelligent Personal Planning & Productivity Platform

An intelligent, calm, notebook-inspired personal time-management web application engineered for students and working professionals. Combining natural language conversational planning with a deterministic scheduling engine, flow focus sessions, and two-way calendar synchronisation.

---

## 🌟 Highlights & Philosophy

- **Not Just Another To-Do List**: Understands daily routines, waking hours, peak focus periods, academic deadlines, and fixed meetings.
- **Conversational Planning**: Tell the AI what you need to achieve today ("Two assignments to complete, study economics for an hour, gym session"), and watch it propose a balanced schedule.
- **Deterministic Scheduling Engine**: AI translates intent into tasks; a rigorous TypeScript scheduling engine verifies feasibility, respects sleep and commitments, and handles buffers.
- **Calm Notebook Aesthetic**: Designed to feel like a high-grade digital planning journal rather than a cluttered analytics dashboard.
- **Assignment / Demo Mode**: Built-in realistic demonstration presets (Student & Professional) with mock calendar sync and instant offline testability.

---

## 🚀 Quickstart

### Prerequisites
- Node.js 20.x or later
- npm 10.x or later

### Installation
```bash
# Clone or navigate to the project directory
cd ai-time-manager

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧭 Navigation Structure

- `/home`: Primary daily command center — Month Calendar, Today's Agenda, Activity Feed, AI Chat Input.
- `/onboarding`: 13-stage guided onboarding wizard with interactive timetable/meetings editors and instant preset loaders.
- `/plan`: Detailed daily & weekly schedules, task priority breakdown, time blocking.
- `/goals`: Short and long-term milestones with AI-generated breakdown.
- `/habits`: Behavioral habit tracking, automaticity indicators, and flow focus sessions.
- `/profile`: Routine parameters, academic/work timetables, and AI preferences.

---

## 👥 Interactive Demonstration Presets

The application features three built-in demonstration presets that can be switched in real time from the sidebar or auto-filled inside the Onboarding wizard:
1. **Student (`Aria Chen`)**: Undergrad at Stanford University; semester lecture schedule, assignments, and exam review.
2. **Professional (`Marcus Reed`)**: Principal Systems Architect; standups, architecture review RFCs, code reviews, and deep work blocks.
3. **Dual Track (`Elena Rostova`)**: Working student balancing evening Master's coursework at UC Berkeley with part-time software engineering at Synthetix AI.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS v4 + Lucide Icons
- **AI Engine**: Google Gemini API (Server-side Route Handlers with Zod validation)
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS)
- **Scheduling**: Pure TypeScript deterministic constraint solver
- **Calendar**: Shared interface supporting `MockCalendarAdapter` and `GoogleCalendarAdapter`

---

## 📖 Development Context & Memory

All architecture decisions, progress logs, known issues, and next steps are strictly maintained in [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md). Please consult it before extending or testing features.
