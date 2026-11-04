-- ============================================================
-- Migration: 002_delete_user_account.sql
-- Purpose: Allow authenticated users to permanently self-delete
--          their account, auth record, and all associated data.
-- Run this once in your Supabase SQL Editor.
-- ============================================================

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Obtain authenticated user ID safely
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Purge referral contacts and job applications
  DELETE FROM public.referral_contacts WHERE user_id = v_user_id;
  DELETE FROM public.applications WHERE user_id = v_user_id;

  -- 2. Purge resumes, cover letters, and ATS scans
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ats_scans') THEN
    DELETE FROM public.ats_scans WHERE user_id = v_user_id;
  END IF;

  DELETE FROM public.cover_letters WHERE user_id = v_user_id;
  DELETE FROM public.resumes WHERE user_id = v_user_id;

  -- 3. Purge profile record
  DELETE FROM public.profiles WHERE id = v_user_id;

  -- 4. Purge authentication record from auth.users (cascades sessions/tokens)
  DELETE FROM auth.users WHERE id = v_user_id;
END;
$$;

-- Allow authenticated users to execute their self-delete
REVOKE EXECUTE ON FUNCTION public.delete_user_account() FROM public;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
