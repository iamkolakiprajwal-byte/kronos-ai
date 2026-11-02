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

### 3.7 Onboarding Experience Flow
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

---

## 4. Non-Functional Requirements
- **Performance**: Sub-100ms client interactions, zero unnecessary re-renders.
- **Aesthetics**: Calm, notebook-inspired visual design (`#faf9f6` paper background, `#e6e3da` warm slate borders, serif headings, ruled accents).
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
