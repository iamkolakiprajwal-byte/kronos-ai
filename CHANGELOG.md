# CHANGELOG.md — AI Time Manager

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
