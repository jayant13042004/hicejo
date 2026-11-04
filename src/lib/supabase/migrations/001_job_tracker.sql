-- ============================================================
-- Migration: 001_job_tracker.sql
-- Purpose: Add job application tracker, referral contacts,
--          and role_family/is_master columns to resumes.
-- Strategy: Fully additive — no drops, no truncates.
-- Run this once in your Supabase SQL editor.
-- ============================================================

-- 1. Applications tracker table
CREATE TABLE IF NOT EXISTS public.applications (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company              TEXT NOT NULL DEFAULT '',
  job_title            TEXT NOT NULL DEFAULT '',
  job_id               TEXT,
  job_url              TEXT,
  role_family          TEXT,
  location             TEXT,
  date_discovered      TIMESTAMPTZ DEFAULT NOW(),
  date_applied         TIMESTAMPTZ,
  fit_score            INTEGER,
  priority             TEXT CHECK (priority IN ('tier_a', 'tier_b', 'tier_c', 'skip')),
  verdict              TEXT CHECK (verdict IN ('priority_apply', 'apply', 'apply_with_caution', 'skip')),
  source               TEXT DEFAULT 'portal',
  master_resume_id     UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  tailored_resume_id   UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  status               TEXT DEFAULT 'saved' CHECK (status IN (
    'saved', 'analyzed', 'ready_to_apply', 'applied', 'referral_requested',
    'referral_received', 'interview', 'offer', 'rejected', 'withdrawn'
  )),
  notes                TEXT,
  follow_up_date       TIMESTAMPTZ,
  job_description      TEXT,
  jd_analysis          JSONB,
  compensation         TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Referral contacts table
CREATE TABLE IF NOT EXISTS public.referral_contacts (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id       UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  user_id              UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  linkedin_url         TEXT,
  job_title            TEXT,
  company              TEXT,
  department           TEXT,
  relationship         TEXT DEFAULT 'unknown',
  connection_message   TEXT,
  referral_message     TEXT,
  forwardable_blurb    TEXT,
  outreach_status      TEXT DEFAULT 'pending' CHECK (outreach_status IN (
    'pending', 'connection_sent', 'connected', 'message_sent', 'replied', 'referred', 'declined'
  )),
  notes                TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add role_family and is_master columns to resumes, and fact_bank to profiles (additive only)
ALTER TABLE public.resumes  ADD COLUMN IF NOT EXISTS role_family TEXT;
ALTER TABLE public.resumes  ADD COLUMN IF NOT EXISTS is_master   BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fact_bank   JSONB;

-- 4. Enable Row Level Security on new tables
ALTER TABLE public.applications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_contacts ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies: users can only access their own rows
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'applications' AND policyname = 'applications_owner'
  ) THEN
    CREATE POLICY applications_owner ON public.applications
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'referral_contacts' AND policyname = 'referral_contacts_owner'
  ) THEN
    CREATE POLICY referral_contacts_owner ON public.referral_contacts
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 6. Auto-update updated_at triggers
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS applications_updated_at      ON public.applications;
DROP TRIGGER IF EXISTS referral_contacts_updated_at ON public.referral_contacts;

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER referral_contacts_updated_at
  BEFORE UPDATE ON public.referral_contacts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
