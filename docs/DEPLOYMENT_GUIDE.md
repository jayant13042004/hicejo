# Production Deployment Guide: Hicejo

This guide details the step-by-step procedures required to deploy and configure Hicejo in production environments using **Vercel** (frontend hosting & edge API routes) and **Supabase** (PostgreSQL database, Auth, and Storage).

---

## 1. Supabase Setup

### Step 1.1: Create a New Supabase Project
1. Log in to the [Supabase Dashboard](https://supabase.com).
2. Click **New Project** and select your organization.
3. Choose a project name (e.g., `hicejo`), enter a secure database password, and select your preferred hosting region.

### Step 1.2: Initialize Database Schemas (SQL Editor)
Open the **SQL Editor** in your Supabase dashboard and run the following queries to create the necessary tables, triggers, and relations:

```sql
-- 1. Create Profiles Table (Linked to Supabase Auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    target_role TEXT,
    target_industry TEXT,
    target_salary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Resumes Table
CREATE TABLE public.resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Untitled Resume' NOT NULL,
    content JSONB DEFAULT '{}'::jsonb NOT NULL,
    ats_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create ATS Scans / Audits Table
CREATE TABLE public.ats_scans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    score INTEGER NOT NULL,
    feedback JSONB NOT NULL,
    job_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Cover Letters Table
CREATE TABLE public.cover_letters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    job_title TEXT NOT NULL,
    company TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ats_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;
```

### Step 1.3: Configure RLS Security Policies
Run the following SQL to ensure users can only access their own documents:

```sql
-- Profiles RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Resumes RLS Policies
CREATE POLICY "Users can manage own resumes" ON public.resumes
    FOR ALL USING (auth.uid() = user_id);

-- ATS Scans RLS Policies
CREATE POLICY "Users can view own scans" ON public.ats_scans
    FOR ALL USING (auth.uid() = user_id);

-- Cover Letters RLS Policies
CREATE POLICY "Users can manage own cover letters" ON public.cover_letters
    FOR ALL USING (auth.uid() = user_id);
```

### Step 1.3: Automatic Profile Creation Trigger
To automatically create a profile record when a new user signs up via Supabase Auth, run this trigger:

```sql
-- Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, target_role, target_industry, target_salary)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    '',
    '',
    ''
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 2. OpenAI Setup

1. Sign up at [OpenAI Platform](https://platform.openai.com).
2. Navigate to **API Keys** and generate a new secret key (e.g., `sk-proj-...`).
3. Set up usage limits to prevent unexpected costs during launch traffic.

---

## 3. Vercel Frontend Deployment

### Step 3.1: Connect Repository
1. Log in to Vercel and click **Add New Project**.
2. Connect your GitHub/GitLab account and select the `hicejo` repository.

### Step 3.2: Configure Environment Variables
In the **Environment Variables** section, add the following variables:

| Variable Name | Value Description |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Project Anon/Client Key |
| `OPENAI_API_KEY` | Your OpenAI API Key |
| `NEXT_PUBLIC_SITE_URL` | Your production URL (e.g. `https://hicejo.com`) |
| `NEXT_PUBLIC_GA_ID` | (Optional) Google Analytics GA4 tracking ID |
| `NEXT_PUBLIC_POSTHOG_KEY` | (Optional) PostHog client API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | (Optional) `https://us.i.posthog.com` |

### Step 3.3: Deploy
Click **Deploy**. Vercel will build the Next.js application, optimize assets, and deploy edge routes.

---

## 4. Supabase Redirect Configs

To ensure auth redirects work properly:
1. Navigate to **Authentication** -> **URL Configuration** in Supabase.
2. In the **Site URL** input, enter your production Vercel site URL (e.g., `https://hicejo.com`).
3. Add `https://hicejo.com/auth/callback` to the redirect whitelist.
