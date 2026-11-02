-- =============================================================================
-- KRONOS AI — SUPABASE POSTGRESQL INITIAL SCHEMA MIGRATION
-- Migration Version: 20261102000000_initial_schema.sql
-- Description: Complete 16-table domain schema with Row Level Security (RLS)
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- Automated updated_at Timestamp Trigger Function
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 1. PROFILES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('student', 'professional', 'both')),
    headline TEXT,
    institution_or_company TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 2. USER PREFERENCES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    wake_time TIME NOT NULL DEFAULT '07:30',
    sleep_time TIME NOT NULL DEFAULT '23:30',
    most_productive_period TEXT NOT NULL CHECK (most_productive_period IN ('morning', 'afternoon', 'evening', 'night')) DEFAULT 'morning',
    preferred_focus_duration INT NOT NULL DEFAULT 45, -- in minutes
    preferred_break_duration INT NOT NULL DEFAULT 10, -- in minutes
    planning_style TEXT NOT NULL CHECK (planning_style IN ('structured', 'flexible', 'time-blocked')) DEFAULT 'time-blocked',
    sustainability_opt_in BOOLEAN NOT NULL DEFAULT true,
    available_days TEXT[] NOT NULL DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 3. AVAILABILITY RULES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.availability_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_blackout BOOLEAN NOT NULL DEFAULT false, -- e.g. no-work or lunch blocks
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 4. RECURRING EVENTS TABLE (Timetable lectures & standing team meetings)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.recurring_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('academic', 'meeting', 'deep_work', 'personal', 'habit', 'eco')),
    is_fixed BOOLEAN NOT NULL DEFAULT true,
    location_or_link TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 5. TASKS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('study', 'work', 'personal', 'habit', 'errand', 'sustainability')),
    priority TEXT NOT NULL CHECK (priority IN ('urgent', 'high', 'medium', 'low')) DEFAULT 'medium',
    status TEXT NOT NULL CHECK (status IN ('todo', 'in_progress', 'completed', 'rescheduled')) DEFAULT 'todo',
    estimated_duration INT NOT NULL DEFAULT 45, -- in minutes
    start_time TIME,
    end_time TIME,
    scheduled_date DATE NOT NULL,
    deadline TIMESTAMPTZ,
    is_fixed BOOLEAN NOT NULL DEFAULT false,
    tag TEXT,
    energy_level TEXT CHECK (energy_level IN ('high', 'medium', 'low')) DEFAULT 'high',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 6. CALENDAR EVENTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('academic', 'meeting', 'deep_work', 'focus_session', 'personal', 'habit', 'eco')),
    is_fixed BOOLEAN NOT NULL DEFAULT true,
    location TEXT,
    color TEXT DEFAULT '#6366f1',
    external_event_id TEXT, -- Google Calendar ID mapping
    source TEXT NOT NULL DEFAULT 'local' CHECK (source IN ('local', 'google', 'imported')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON public.calendar_events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 7. GOALS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_date DATE NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('urgent', 'high', 'medium', 'low')) DEFAULT 'medium',
    progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    category TEXT NOT NULL CHECK (category IN ('academic', 'career', 'wellness', 'skills', 'sustainability')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_goals_updated_at
BEFORE UPDATE ON public.goals
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 8. GOAL MILESTONES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.goal_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    due_date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 9. HABITS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekdays', '3x_week', 'weekly')) DEFAULT 'daily',
    cue TEXT NOT NULL, -- Anchor context cue
    target_duration_minutes INT,
    current_streak INT NOT NULL DEFAULT 0,
    best_streak INT NOT NULL DEFAULT 0,
    automaticity_score INT NOT NULL DEFAULT 20 CHECK (automaticity_score >= 0 AND automaticity_score <= 100),
    category TEXT NOT NULL CHECK (category IN ('focus', 'health', 'learning', 'mindfulness', 'eco')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_habits_updated_at
BEFORE UPDATE ON public.habits
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 10. HABIT LOGS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.habit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT true,
    reflection_rating INT, -- optional flow or subjective ease 1-5
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(habit_id, log_date)
);

-- =============================================================================
-- 11. CHAT SESSIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_title TEXT NOT NULL DEFAULT 'Planning Session',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 12. CHAT MESSAGES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
    content TEXT NOT NULL,
    suggested_tasks JSONB, -- Structured JSON array of extracted tasks
    action_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 13. USER MEMORY TABLE (Structured cognitive & schedule preferences)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    memory_key TEXT NOT NULL, -- e.g. 'preferred_study_duration', 'frequently_postponed'
    memory_value JSONB NOT NULL,
    confidence_score NUMERIC(3,2) DEFAULT 1.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, memory_key)
);

-- =============================================================================
-- 14. NOTIFICATION JOBS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.notification_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    trigger_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'cancelled', 'failed')) DEFAULT 'pending',
    job_type TEXT NOT NULL CHECK (job_type IN ('task', 'calendar', 'habit', 'system', 'eco')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 15. CALENDAR CONNECTIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.calendar_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    provider TEXT NOT NULL DEFAULT 'google' CHECK (provider IN ('google', 'mock')),
    external_calendar_id TEXT,
    sync_token TEXT,
    last_synced_at TIMESTAMPTZ,
    sync_status TEXT NOT NULL DEFAULT 'active' CHECK (sync_status IN ('active', 'paused', 'error')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 16. PUSH SUBSCRIPTIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_tasks_user_date ON public.tasks (user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks (user_id, status);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date ON public.calendar_events (user_id, event_date);
CREATE INDEX IF NOT EXISTS idx_habits_user ON public.habits (user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON public.goals (user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages (session_id);
CREATE INDEX IF NOT EXISTS idx_notification_jobs_pending ON public.notification_jobs (status, trigger_at);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Helper macro for standard user_id ownership check
CREATE POLICY "Users own their profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users own their preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their availability rules" ON public.availability_rules FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their recurring events" ON public.recurring_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their calendar events" ON public.calendar_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their goals" ON public.goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their goal milestones" ON public.goal_milestones FOR ALL USING (
    EXISTS (SELECT 1 FROM public.goals WHERE goals.id = goal_milestones.goal_id AND goals.user_id = auth.uid())
);
CREATE POLICY "Users own their habits" ON public.habits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their habit logs" ON public.habit_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their chat sessions" ON public.chat_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their chat messages" ON public.chat_messages FOR ALL USING (
    EXISTS (SELECT 1 FROM public.chat_sessions WHERE chat_sessions.id = chat_messages.session_id AND chat_sessions.user_id = auth.uid())
);
CREATE POLICY "Users own their memory" ON public.user_memory FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their notification jobs" ON public.notification_jobs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their calendar connections" ON public.calendar_connections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their push subscriptions" ON public.push_subscriptions FOR ALL USING (auth.uid() = user_id);
