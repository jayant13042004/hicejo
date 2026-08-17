# Master Task Checklist: Hicejo

This is the central execution manifest tracking progress across all phases of Hicejo. 

---

## Milestone 1: Project Scaffolding & Setup (Phase 1)
Goal: Configure NextJS, Tailwind, Supabase integrations, base component themes, and verify system integration.

| Task ID | Task Description | Priority | Status | Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| M1-T1 | Initialize Next.js project with Tailwind CSS & TypeScript | P0 | [ ] Todo | None |
| M1-T2 | Setup Supabase CLI & schema migrations | P0 | [ ] Todo | None |
| M1-T3 | Configure Tailwind theme & CSS variables (Dark/Light mode) | P1 | [ ] Todo | M1-T1 |
| M1-T4 | Setup shadcn/ui framework component library | P1 | [ ] Todo | M1-T3 |
| M1-T5 | Configure NextJS Middleware & Supabase Auth Client | P0 | [ ] Todo | M1-T2 |
| M1-T6 | Create responsive Landing Page layout | P2 | [ ] Todo | M1-T4 |
| M1-T7 | Build responsive Dashboard shell with Sidebar & Top navigation | P1 | [ ] Todo | M1-T5 |
| M1-T8 | Verify NextJS server endpoints & Supabase user session links | P0 | [ ] Todo | M1-T5 |

---

## Milestone 2: AI Resume Builder (Phase 2)
Goal: Rich, interactive resume builder linked with Supabase storage and PDF downloads.

| Task ID | Task Description | Priority | Status | Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| M2-T1 | Design JSON resume schema and TypeScript interfaces | P0 | [ ] Todo | M1-T1 |
| M2-T2 | Implement interactive Resume Builder form layout | P1 | [ ] Todo | M1-T7 |
| M2-T3 | Create Zustand Resume store with history tracking (undo/redo) | P1 | [ ] Todo | M1-T4 |
| M2-T4 | Integrate auto-save and debounce database sync | P1 | [ ] Todo | M2-T2 |
| M2-T5 | Implement PDF generation engine (react-pdf or html2pdf) | P0 | [ ] Todo | M2-T2 |
| M2-T6 | Add OpenAI Bullet Points enhancer & action verb generator | P1 | [ ] Todo | M2-T3 |

---

## Milestone 3: ATS Resume Checker & Tailor (Phase 3 & 4)
Goal: Evaluate resume compatibility and tailor content directly against job descriptions.

| Task ID | Task Description | Priority | Status | Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| M3-T1 | Build target job description parser interface | P1 | [ ] Todo | M1-T7 |
| M3-T2 | Create ATS compatibility API score checker (OpenAI connection) | P0 | [ ] Todo | M2-T6 |
| M3-T3 | Design score visualization dashboard (radial/bar graphs) | P2 | [ ] Todo | M3-T2 |
| M3-T4 | Create Resume Tailoring endpoint adapting experience bullet points | P0 | [ ] Todo | M3-T2 |
| M3-T5 | Add highlighted keyword gaps panel (Missing skills indicators) | P1 | [ ] Todo | M3-T3 |

---

## Milestone 4: Cover Letter Generator & Resume Roast (Phase 5 & 6)
Goal: Generate cover letters matching job metrics and run "Resume Roasts" for critiques.

| Task ID | Task Description | Priority | Status | Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| M4-T1 | Build Resume Roast UI panel with clean terminal/roasting cards | P2 | [ ] Todo | M1-T7 |
| M4-T2 | Create Roast API endpoint (sarcastic but highly action-oriented) | P2 | [ ] Todo | M3-T2 |
| M4-T3 | Implement Cover Letter generation interface | P1 | [ ] Todo | M1-T7 |
| M4-T4 | Create Cover Letter generation backend schema & API | P1 | [ ] Todo | M4-T3 |
| M4-T5 | Add one-click export cover letter text to clipboard / PDF | P2 | [ ] Todo | M4-T4 |

---

## Milestone 5: Profile & Saved Documents Management (Phase 7)
Goal: Core settings pages, historical record uploads, and database cleanups.

| Task ID | Task Description | Priority | Status | Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| M5-T1 | Create User Profile setting form (target job/industry/salary) | P1 | [ ] Todo | M1-T5 |
| M5-T2 | Build Saved Resumes and PDF history gallery | P1 | [ ] Todo | M2-T4 |
| M5-T3 | Integrate Supabase storage bucket connection for custom avatars | P2 | [ ] Todo | M5-T1 |
| M5-T4 | Add account deletion and GDPR data cleanup procedures | P2 | [ ] Todo | M5-T1 |

---

## Milestone 6: SEO, Performance & Deployment (Phase 8 & 9)
Goal: Edge deployments, search optimizations, loading audits, and analytics tags.

| Task ID | Task Description | Priority | Status | Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| M6-T1 | Implement Google Analytics & PostHog user tracking snippets | P1 | [ ] Todo | M1-T6 |
| M6-T2 | Setup dynamic dynamic SEO title/description tags on subpages | P1 | [ ] Todo | None |
| M6-T3 | Audit accessibility tags (WAI-ARIA contrast checks) | P2 | [ ] Todo | M1-T4 |
| M6-T4 | Deploy platform instance to Vercel and check Edge routes | P0 | [ ] Todo | None |
| M6-T5 | Performance audits (Lighthouse / Core Web Vitals optimizations) | P1 | [ ] Todo | M6-T4 |
