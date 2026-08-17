# Master Task Checklist: Hicejo

This is the central execution manifest tracking progress across all phases of Hicejo.

---

## Milestone 1: Project Scaffolding & Setup (Phase 1)
Goal: Configure NextJS, Tailwind, Supabase integrations, base component themes, and verify system integration.

| Task ID | Task Description | Priority | Status | Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| M1-T1 | Initialize Next.js project with Tailwind CSS & TypeScript | P0 | [x] Completed | None |
| M1-T2 | Setup Supabase CLI & schema migrations | P0 | [x] Completed | None |
| M1-T3 | Configure Tailwind theme & CSS variables (Dark/Light mode) | P1 | [x] Completed | M1-T1 |
| M1-T4 | Setup shadcn/ui framework component library | P1 | [x] Completed | M1-T3 |
| M1-T5 | Configure NextJS Middleware & Supabase Auth Client | P0 | [x] Completed | M1-T2 |
| M1-T6 | Create responsive Landing Page layout | P2 | [x] Completed | M1-T4 |
| M1-T7 | Build responsive Dashboard shell with Sidebar & Top navigation | P1 | [x] Completed | M1-T5 |
| M1-T8 | Verify NextJS server endpoints & Supabase user session links | P0 | [x] Completed | M1-T5 |

---

## Milestone 2: AI Resume Builder (Phase 2)
Goal: Rich, interactive resume builder linked with Supabase storage and PDF downloads.

| Task ID | Task Description | Priority | Status | Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| M2-T1 | Design JSON resume schema and TypeScript interfaces | P0 | [x] Completed | M1-T1 |
| M2-T2 | Implement interactive Resume Builder form layout | P1 | [x] Completed | M1-T7 |
| M2-T3 | Create Zustand Resume store with history tracking (undo/redo) | P1 | [x] Completed | M1-T4 |
| M2-T4 | Integrate auto-save and debounce database sync | P1 | [x] Completed | M2-T2 |
| M2-T5 | Implement PDF generation engine (watermark-free printing) | P0 | [x] Completed | M2-T2 |
| M2-T6 | Add AI Bullet Points enhancer & action verb generator | P1 | [x] Completed | M2-T3 |

---

## Milestone 3: ATS Resume Checker & Tailor (Phase 3 & 4)
Goal: Evaluate resume compatibility and tailor content directly against job descriptions.

| Task ID | Task Description | Priority | Status | Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| M3-T1 | Build target job description parser interface | P1 | [x] Completed | M1-T7 |
| M3-T2 | Create ATS compatibility API score checker (Gemini connection) | P0 | [x] Completed | M2-T6 |
| M3-T3 | Design score visualization dashboard (radial/bar graphs) | P2 | [x] Completed | M3-T2 |
| M3-T4 | Create Resume Tailoring endpoint adapting experience bullet points | P0 | [x] Completed | M3-T2 |
| M3-T5 | Add highlighted keyword gaps panel (Missing skills indicators) | P1 | [x] Completed | M3-T3 |

---

## Milestone 4: Cover Letter Generator & Resume Roast (Phase 5 & 6)
Goal: Generate cover letters matching job metrics and run "Resume Roasts" for critiques.

| Task ID | Task Description | Priority | Status | Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| M4-T1 | Build Resume Roast UI panel with clean terminal/roasting cards | P2 | [x] Completed | M1-T7 |
| M4-T2 | Create Roast API endpoint (sarcastic but highly action-oriented) | P2 | [x] Completed | M3-T2 |
| M4-T3 | Implement Cover Letter generation interface | P1 | [x] Completed | M1-T7 |
| M4-T4 | Create Cover Letter generation backend schema & API | P1 | [x] Completed | M4-T3 |
| M4-T5 | Add one-click export cover letter text to clipboard / PDF | P2 | [x] Completed | M4-T4 |

---

## Milestone 5: Profile & Saved Documents Management (Phase 7)
Goal: Core settings pages, historical record uploads, and database cleanups.

| Task ID | Task Description | Priority | Status | Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| M5-T1 | Create User Profile setting form (target job/industry/salary) | P1 | [x] Completed | M1-T5 |
| M5-T2 | Build Saved Resumes and PDF history gallery | P1 | [x] Completed | M2-T4 |
| M5-T3 | Integrate user data exports and profile backups (GDPR) | P2 | [x] Completed | M5-T1 |
| M5-T4 | Add account deletion and database cleanup procedures | P2 | [x] Completed | M5-T1 |

---

## Milestone 6: SEO, Performance & Analytics (Phase 8 & 9)
Goal: Edge deployments, search optimizations, loading audits, and analytics tags.

| Task ID | Task Description | Priority | Status | Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| M6-T1 | Implement Google Analytics & PostHog user tracking snippets | P1 | [x] Completed | M1-T6 |
| M6-T2 | Setup dynamic SEO title/description tags on subpages | P1 | [x] Completed | None |
| M6-T3 | Audit accessibility tags (WAI-ARIA contrast checks) | P2 | [x] Completed | M1-T4 |
| M6-T4 | Deploy platform instance to Vercel and check Edge routes | P0 | [x] Completed | None |
| M6-T5 | Performance audits (Lighthouse / Core Web Vitals optimizations) | P1 | [x] Completed | M6-T4 |

---

## Milestone 7: Document Text Extraction & Import (New Feature)
Goal: Support PDF, Word (.docx), and TXT file uploads to extract and import data into the platform.

| Task ID | Task Description | Priority | Status | Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| M7-T1 | Create programmatic `/api/parse-file` endpoint (pdf-parse/mammoth) | P0 | [x] Completed | None |
| M7-T2 | Add server components external packaging rules in Next config | P1 | [x] Completed | M7-T1 |
| M7-T3 | Integrate `.txt, .pdf, .docx` upload triggers in Resume Builder | P0 | [x] Completed | M2-T2, M7-T1 |
| M7-T4 | Add universal upload inputs to Checker, Roast, Tailor, and Cover Letter | P1 | [x] Completed | M7-T1 |
| M7-T5 | Build AI structured parser schemas using Gemini Pro | P0 | [x] Completed | M7-T3 |

---

## Milestone 8: Google OAuth & Authentication (New Feature)
Goal: Integrate Google and Email providers in Supabase and Next.js.

| Task ID | Task Description | Priority | Status | Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| M8-T1 | Create OAuth callback router `/auth/callback` for code exchanges | P0 | [x] Completed | M1-T5 |
| M8-T2 | Add "Sign in with Google" buttons with brand icons to Login | P1 | [x] Completed | M1-T7 |
| M8-T3 | Add "Sign in with Google" buttons to Registration page | P1 | [x] Completed | M1-T7 |
| M8-T4 | Setup Google provider keys and redirect whitelists in Supabase | P0 | [x] Completed | M8-T1 |

---

## Milestone 9: One-Page Resume Optimizer (New Signature Feature)
Goal: Automatically fit resumes onto one perfect A4 page without sacrificing readability or content impact.

| Task ID | Task Description | Priority | Status | Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| M9-T1 | Exact A4 canvas container with real-time DOM height calculation (<5ms) | P0 | [x] Completed | None |
| M9-T2 | Fit Indicator Bar (`✓ 1 PAGE — 94% UTILIZED`, `⚠ 2 LINES OVERFLOWING`) | P0 | [x] Completed | M9-T1 |
| M9-T3 | Perfect 1-Page Mode continuous monitoring and automatic layout adjusting | P0 | [x] Completed | M9-T2 |
| M9-T4 | Hierarchical 5-stage auto-fit solver (Spacing → Layout → Typography → AI) | P0 | [x] Completed | M9-T1 |
| M9-T5 | Interactive Resume Density Control slider (Relaxed to Ultra-Compact) | P0 | [x] Completed | M9-T4 |
| M9-T6 | Smart Bullet Compressor Modal (`/api/ai/compress-bullet`) with metric protection | P0 | [x] Completed | M9-T4 |
| M9-T7 | Fit Analysis Drawer with diagnostic scores and candidate bullet audit | P1 | [x] Completed | M9-T2 |
| M9-T8 | Synchronized `@media print` rules for 1:1 on-screen to PDF download parity | P0 | [x] Completed | M9-T1 |

---

## Milestone 10: Upcoming Roadmap Milestones
Goal: Future integrations for post-launch career scaling.

| Task ID | Task Description | Priority | Status | Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| M10-T1 | Phase 10: Implement AI Voice Interview Copilot with audio comments | P1 | [ ] Todo | None |
| M10-T2 | Phase 11: Build Kanban board job application tracker dashboard | P1 | [ ] Todo | None |
| M10-T3 | Phase 12: Add LinkedIn Profile Headline & Summary Optimizer | P2 | [ ] Todo | None |
