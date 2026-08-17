# Project Master Plan: Hicejo (AI Career Platform)

This document serves as the strategic blueprint and technical record for **Hicejo**, the operating system for getting hired. Hicejo is designed to transition users from the "I need a job" phase to the "I got hired" phase, supporting them with advanced AI utilities throughout their entire career journey.

---

## 1. Product Vision & Problem Statement

### Product Vision
Hicejo is the ultimate AI Career Platform. We are building the **operating system for getting hired**. Rather than a static resume builder, Hicejo is an intelligent, reactive agentic ecosystem that guides candidates through discovery, optimization, preparation, tracking, and negotiation. Our goal is to level the playing field for job seekers by equipping them with enterprise-grade AI resources to navigate the modern automated recruitment landscape.

### Problem Statement
1. **The Black Box (ATS)**: Over 75% of resumes are filtered out by Applicant Tracking Systems (ATS) before a human ever reads them. Job seekers lack insight into why their applications are rejected.
2. **Generic Tailoring**: Tailoring resumes and cover letters for dozens of jobs is time-consuming. Candidates either apply with generic resumes (resulting in low response rates) or spend hours customizing each manually.
3. **Ineffective Interview Prep**: Mock interviews are expensive, generic, or passive. Candidates lack realistic, role-specific, interactive preparation.
4. **Scattered Workflows**: Job search tools are fragmented. Job seekers use spreadsheet trackers, separate resume editors, standalone cover letter generators, and distinct prep sites, leading to high cognitive overhead.

---

## 2. Technical Architecture & Setup

Hicejo is built using a modern, scalable web stack optimized for performance, SEO, and speed:

* **Core Framework**: Next.js 16.3 (using App Router and Turbopack compiler)
* **Styling**: Tailwind CSS (customized fluid typography scale from 12px to 16px with proportional relative `em` formatting, global Dark/Light theme mode).
* **Database & Auth**: Supabase (utilizing SSR cookie clients, PostgreSQL schemas, and Row-Level Security).
* **State Management**: Zustand (client-side state store featuring complete historical undo/redo push states).
* **AI Completion Engine**: Unified client routing to Google AI Studio's **Gemini 2.5 Pro** (for deep reasoning, details importing) and **Gemini 2.5 Flash** (for low-latency tasks) via an OpenAI-compatibility gateway.
* **Telemetry**: Integrated Google Analytics 4 and PostHog analytics providers with robust placeholder suppression.

---

## 3. Features Implemented Till Now

### 1. Interactive AI Resume Builder & One-Page Optimizer
* **Exact A4 Canvas**: Real-time DOM height calculation (<5ms) matching calibrated A4 dimensions (`210mm x 297mm`) without calling external APIs during typing.
* **Fit Indicator Bar**:
  * Status Pill: `✓ 1 PAGE — 94% UTILIZED`, `✓ PERFECT 1-PAGE FIT`, or `⚠ 2 LINES OVERFLOWING (6% OVERFLOW)`.
  * `🎯 Perfect 1-Page Resume` continuous auto-fit monitor toggle.
  * `✨ Fix to 1 Page` hierarchical 5-stage auto-fit solver (Spacing → Layout → Typography → AI Content Compression).
* **Resume Density Controller**: Interactive slider (`Relaxed ─────●───── Compact`) adjusting section margins, bullet spacing, and line heights within safe ATS bounds.
* **Smart Bullet Compressor Modal**: AI action (`✨ Shorten Bullet`) providing concise alternatives while strictly preserving metrics, technologies, and achievements.
* **Fit Analysis Drawer**: Detailed diagnostic metrics (Page Utilization, Readability Grade, ATS Safety, Content Density, and Candidate Bullets).
* **Exact PDF & Print Parity**: `@media print` rules synchronized with preview canvas for 1:1 single-page PDF downloads.
* **Tabbed Configuration Sidebar**: Form tabs for Contact Info, Professional Summary, Work History, Education, Projects, Skills, and Design Settings.
* **Drag-and-Drop Reordering**: Users can dynamically rearrange resume sections (e.g. moving Skills above Work History) and instantly see the output on screen.
* **Proportional Relative Scales**: Choose between Small (12px), Medium (14px), and Large (16px) font systems. Section headings, line heights, and margins scale proportionally using relative `em` styles.
* **Categorized Skills**: Add skills grouped by classification categories (e.g., Languages, Frameworks, Libraries).

### 2. Multi-Format Document Parser
* **Upload Extractor API**: A server route (`/api/parse-file`) utilizing `pdf-parse` (for PDF files) and `mammoth` (for DOCX Word files) to parse text entirely using code, avoiding AI costs for raw extraction.
* **AI Schema Mapper**: Takes the parsed raw text and maps it into a structured builder-compliant JSON schema using Gemini.
* **Universal Upload Inputs**: Available in the Builder Import modal and across all optimizer dashboards, letting users paste raw text or upload `.pdf`, `.docx`, or `.txt` files.

### 3. ATS Resume Checker
* **Contextual Audit**: Compares your resume against a target job description, scoring overall match percentage, readability metrics, and layout structures.
* **General ATS Audit**: If the target job posting is left blank, the scanner automatically shifts to audit general resume formatting (clichés, metric quantifications, formatting consistency).
* **Keyword Matching**: Visual indicator lists displaying matched keywords (green) and missing keywords (red).

### 4. Resume Roast Room
* **Terminal CLI Simulator**: Animated command line console interface showing mock audit compilation logs in developer-style themes.
* **Roast & Remedy Cards**: Split cards containing sarcastic critiques (The Roast) paired with direct instructions on how to rewrite them (The Remedy).

### 5. Resume Tailor
* **AI Rewrites**: Automatically rephrases professional summaries and work experience achievements to match target job descriptions.
* **Comparison Diff Cards**: Shows original bullet points side-by-side with the tailored suggestions for review before applying.

### 6. Cover Letter Generator
* **Tailored Compilations**: Creates structured business-standard cover letters matching your resume details to a job posting.
* **Export Actions**: Quick triggers to print to PDF or copy the generated letter to the clipboard.

### 7. Google OAuth & Email Sign-In
* **Dual Auth Providers**: Supports signups/logins via email/password or Google OAuth credentials.
* **Auth Callback Route**: Server-side routing at `/auth/callback` to securely manage token exchanges and session cookie headers.

---

## 4. Upcoming Features & Roadmap

### Phase 10: AI Voice Interview Copilot
* **Interactive Mocking**: Real-time audio/voice mock interviews where the AI acts as a technical or behavioral interviewer.
* **Custom Scenarios**: Mocking interview styles for specific target companies (e.g., Google coding, Stripe system design, Amazon leadership principles).
* **Feedback Engine**: Evaluates responses for confidence, keyword integration, and structure, giving a full feedback scorecard.

### Phase 11: Kanban Job Tracker Board
* **Visual Pipeline**: Columns representing stages (Applied, Interviewing, Offer Received, Rejected, Archived).
* **Auto-reminders**: Email reminders for interview prep, application follow-ups, and negotiation windows.

### Phase 12: LinkedIn Profile Optimizer
* **Profile Grader**: Checks LinkedIn profile exports against target job roles.
* **Headline & About Wizard**: Suggests SEO-friendly headline revisions to maximize search appearances on LinkedIn Recruiter.

---

## 5. Deployment & Launch Strategy

* **Local Sandbox Mode**: Enabled by default when database keys are missing. Loads mockup database values from `mock-db.json` so developers can test all features without configuration.
* **Production Build Checklist**:
  1. Add Supabase project credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) to `.env.local`.
  2. Set up Google Client ID and Secret values in Supabase Google Provider settings.
  3. Add `GEMINI_API_KEY` to connect all features to Google AI Studio.
  4. Ensure your redirect URLs in Supabase are updated to point to the production server.
