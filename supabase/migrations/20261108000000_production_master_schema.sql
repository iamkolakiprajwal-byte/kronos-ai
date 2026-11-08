-- =============================================================================
-- KRONOS AI — PRODUCTION MASTER SCHEMA MIGRATION
-- Migration Version: 20261108000000_production_master_schema.sql
-- Description: Complete 17-table schema with strict Row Level Security (RLS),
--              automated profile sync trigger, bidirectional Google Calendar
--              & Google Tasks token vault and external resource mappings.
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 0. Automated updated_at Timestamp Trigger Function
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
    preferred_name TEXT,
    avatar_url TEXT,
    phone_number TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'professional', 'both')),
    headline TEXT,
    institution_or_company TEXT,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Automatic Profile Creation Trigger on auth.users (Google Auth / Email Signup)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role, onboarding_completed)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(COALESCE(NEW.email, ''), '@', 1), 'Planner'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
        'student',
        false
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
        avatar_url = COALESCE(NULLIF(EXCLUDED.avatar_url, ''), profiles.avatar_url),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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
    is_blackout BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 4. RECURRING EVENTS TABLE (Timetable lectures & standing meetings)
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
-- 5. TASKS TABLE (With Google Tasks mapping, reminders, and sync metadata)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'study' CHECK (category IN ('study', 'work', 'personal', 'habit', 'errand', 'sustainability')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'rescheduled')),
    estimated_duration INT NOT NULL DEFAULT 45, -- in minutes
    start_time TIME,
    end_time TIME,
    scheduled_date DATE NOT NULL,
    deadline TIMESTAMPTZ,
    is_fixed BOOLEAN NOT NULL DEFAULT false,
    tag TEXT,
    energy_level TEXT DEFAULT 'high' CHECK (energy_level IN ('high', 'medium', 'low')),
    reminder_time TIMESTAMPTZ,
    external_task_id TEXT, -- Google Tasks resource ID
    sync_source TEXT NOT NULL DEFAULT 'local' CHECK (sync_source IN ('local', 'google_tasks', 'google_calendar')),
    last_synced_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 6. CALENDAR EVENTS TABLE (With task linkage & Google Calendar event ID)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    category TEXT NOT NULL DEFAULT 'meeting' CHECK (category IN ('academic', 'meeting', 'deep_work', 'focus_session', 'personal', 'habit', 'eco')),
    is_fixed BOOLEAN NOT NULL DEFAULT true,
    is_all_day BOOLEAN NOT NULL DEFAULT false,
    location TEXT,
    color TEXT DEFAULT '#6366f1',
    external_event_id TEXT, -- Google Calendar event ID
    google_recurring_event_id TEXT,
    source TEXT NOT NULL DEFAULT 'local' CHECK (source IN ('local', 'google', 'imported')),
    last_synced_at TIMESTAMPTZ,
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
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
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
    frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekdays', '3x_week', 'weekly')),
    cue TEXT NOT NULL,
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
    reflection_rating INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(habit_id, log_date)
);

-- =============================================================================
-- 11. FOCUS SESSIONS TABLE (Flow-state tracking & reflections)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.focus_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    habit_id UUID REFERENCES public.habits(id) ON DELETE SET NULL,
    duration_minutes INT NOT NULL DEFAULT 25,
    flow_state TEXT NOT NULL DEFAULT 'balanced' CHECK (flow_state IN ('flow', 'anxiety', 'boredom', 'apathy', 'balanced')),
    absorption_rating INT CHECK (absorption_rating >= 1 AND absorption_rating <= 5),
    concentration_rating INT CHECK (concentration_rating >= 1 AND concentration_rating <= 5),
    perceived_control INT CHECK (perceived_control >= 1 AND perceived_control <= 5),
    enjoyment_rating INT CHECK (enjoyment_rating >= 1 AND enjoyment_rating <= 5),
    time_distortion TEXT DEFAULT 'normal' CHECK (time_distortion IN ('faster', 'normal', 'slower')),
    reflection_notes TEXT,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 12. ONBOARDING RECORDS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.onboarding_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    current_step INT NOT NULL DEFAULT 1,
    step_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_onboarding_records_updated_at
BEFORE UPDATE ON public.onboarding_records
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 13. ACADEMIC DETAILS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.academic_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    degree_or_course TEXT NOT NULL,
    institution TEXT,
    academic_year_or_term TEXT,
    target_gpa NUMERIC(3, 2),
    enrolled_units INT DEFAULT 0,
    subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_academic_details_updated_at
BEFORE UPDATE ON public.academic_details
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 14. PROFESSIONAL DETAILS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.professional_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    profession_or_role TEXT NOT NULL,
    organization TEXT,
    work_start_time TIME DEFAULT '09:00',
    work_end_time TIME DEFAULT '17:30',
    daily_meeting_target_hours NUMERIC(3, 1) DEFAULT 2.0,
    deep_work_target_hours NUMERIC(3, 1) DEFAULT 4.0,
    work_days TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_professional_details_updated_at
BEFORE UPDATE ON public.professional_details
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 15. CALENDAR CONNECTIONS TABLE (Secure Token Vault & Sync State)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.calendar_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    provider TEXT NOT NULL DEFAULT 'google' CHECK (provider IN ('google', 'mock')),
    external_calendar_id TEXT DEFAULT 'primary',
    sync_token TEXT,
    google_tasks_sync_token TEXT,
    last_synced_at TIMESTAMPTZ,
    sync_status TEXT NOT NULL DEFAULT 'active' CHECK (sync_status IN ('active', 'paused', 'error', 'disconnected')),
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    scopes TEXT[],
    google_email TEXT,
    google_tasks_sync_enabled BOOLEAN NOT NULL DEFAULT true,
    google_calendar_sync_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_calendar_connections_updated_at
BEFORE UPDATE ON public.calendar_connections
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 16. SYNC AUDIT LOG TABLE (Conflict tracking, sync history & error diagnostics)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.sync_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('google_calendar', 'google_tasks')),
    action TEXT NOT NULL CHECK (action IN ('import', 'export', 'update', 'delete', 'conflict')),
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'conflict')),
    resource_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 17. NOTIFICATION JOBS & REMINDERS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.notification_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    trigger_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled', 'failed')),
    job_type TEXT NOT NULL CHECK (job_type IN ('task', 'calendar', 'habit', 'system', 'eco')),
    delivery_channel TEXT DEFAULT 'in_app' CHECK (delivery_channel IN ('in_app', 'push', 'google')),
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_tasks_user_date ON public.tasks (user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks (user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_ext_task_id ON public.tasks (user_id, external_task_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date ON public.calendar_events (user_id, event_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_ext_id ON public.calendar_events (user_id, external_event_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_task ON public.calendar_events (task_id);
CREATE INDEX IF NOT EXISTS idx_habits_user ON public.habits (user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON public.goals (user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user ON public.focus_sessions (user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_jobs_user ON public.notification_jobs (user_id, status, trigger_at);
CREATE INDEX IF NOT EXISTS idx_sync_audit_log_user ON public.sync_audit_log (user_id, created_at DESC);

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
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_jobs ENABLE ROW LEVEL SECURITY;

-- Helper policies enforcing that users can strictly access only their own rows
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
CREATE POLICY "Users own their focus sessions" ON public.focus_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their onboarding records" ON public.onboarding_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their academic details" ON public.academic_details FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their professional details" ON public.professional_details FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their calendar connections" ON public.calendar_connections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their sync audit logs" ON public.sync_audit_log FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their notification jobs" ON public.notification_jobs FOR ALL USING (auth.uid() = user_id);
