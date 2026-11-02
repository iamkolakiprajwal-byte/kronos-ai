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

### 3.1 Primary Navigation
- **Home**: The central command notebook. Month calendar with scheduled activity indicators, today's time-stamped agenda, upcoming commitments, daily progress summary, quick task creation, and accessible AI chat dock.
- **Plan**: Daily and weekly schedule views, task management (add, edit, prioritize, estimate duration, tag as flexible or fixed, mark done).
- **Goals**: Short-term and long-term goals, AI roadmap decomposition into milestones and actionable weekly tasks.
- **Habits**: Daily habit tracker with cue/context recognition, streak grace periods, and flow focus timer.
- **Profile**: Personal schedule (wake/sleep times), academic/work timetable, availability rules, AI preferences, sustainability options.

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
- Distinguishes repeated actions from automatic habit formation.
- Flow focus session timer with distraction-free layout and self-reported engagement reflection.
- Compassionate recovery after broken streaks.

### 3.6 Environmental Sustainability (Optional Module)
- Opt-in eco-friendly routines (walking/cycling commute, zero-paper study, energy conservation).
- Realistic personal impact tracking without exaggerated carbon metrics.

---

## 4. Non-Functional Requirements
- **Performance**: Sub-100ms client interactions, zero unnecessary re-renders.
- **Aesthetics**: Calm, notebook-inspired visual design, readable serif/sans typography, high contrast, uncluttered layouts.
- **Security**: Server-side credential isolation, Supabase Row Level Security, no client-side API secret leakage.
- **Reliability**: Deterministic fallbacks for AI and calendar adapters ensuring 100% offline-resilient demo operation.
