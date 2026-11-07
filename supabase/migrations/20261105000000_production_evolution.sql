-- =============================================================================
-- KRONOS AI — SUPABASE PRODUCTION EVOLUTION MIGRATION
-- Migration Version: 20261105000000_production_evolution.sql
-- Description: Evolves database schema for production multi-user isolation,
--              focus sessions, onboarding persistence, and academic/pro models.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. EXTEND PROFILES TABLE
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS preferred_name TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- -----------------------------------------------------------------------------
-- 2. ONBOARDING RECORDS TABLE (Multi-step draft saving & resume)
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 3. FOCUS SESSIONS TABLE (Flow-state tracking & reflections)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.focus_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    habit_id UUID REFERENCES public.habits(id) ON DELETE SET NULL,
    duration_minutes INT NOT NULL DEFAULT 25,
    flow_state TEXT NOT NULL CHECK (flow_state IN ('flow', 'anxiety', 'boredom', 'apathy', 'balanced')) DEFAULT 'balanced',
    absorption_rating INT CHECK (absorption_rating >= 1 AND absorption_rating <= 5),
    concentration_rating INT CHECK (concentration_rating >= 1 AND concentration_rating <= 5),
    perceived_control INT CHECK (perceived_control >= 1 AND perceived_control <= 5),
    enjoyment_rating INT CHECK (enjoyment_rating >= 1 AND enjoyment_rating <= 5),
    time_distortion TEXT CHECK (time_distortion IN ('faster', 'normal', 'slower')) DEFAULT 'normal',
    reflection_notes TEXT,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. ACADEMIC DETAILS TABLE (Courses, exams & p-sets)
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 5. PROFESSIONAL DETAILS TABLE (Work schedule & sprint allocation)
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 6. INDEXES FOR PERFORMANCE
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_completed ON public.focus_sessions (user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_onboarding_records_user ON public.onboarding_records (user_id);
CREATE INDEX IF NOT EXISTS idx_academic_details_user ON public.academic_details (user_id);
CREATE INDEX IF NOT EXISTS idx_professional_details_user ON public.professional_details (user_id);

-- -----------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
ALTER TABLE public.onboarding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their onboarding records" 
ON public.onboarding_records FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their focus sessions" 
ON public.focus_sessions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their academic details" 
ON public.academic_details FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their professional details" 
ON public.professional_details FOR ALL USING (auth.uid() = user_id);
