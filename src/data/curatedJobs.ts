import { JobListing } from "@/types/jobs";

export const CURATED_JOB_LISTINGS: JobListing[] = [
  // ==========================================
  // HYBRID + ENTRY-LEVEL (Matches user test!)
  // ==========================================
  {
    id: "job-bloomberg-hybrid-entry",
    title: "Junior Software Engineer, Financial Analytics",
    company: "Bloomberg",
    companyLogo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://bloomberg.com",
    location: "New York, NY (Hybrid)",
    workplaceType: "hybrid",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 115000,
    maxSalary: 145000,
    currency: "USD",
    salaryPeriod: "yearly",
    description: `Bloomberg engineers build mission-critical financial applications powering global finance. We are looking for entry-level software engineers to join our core analytics group.

Key Responsibilities:
- Build high-performance terminal UI components and financial data pipelines.
- Collaborate with senior mentors to write maintainable TypeScript, C++, and Python code.
- Write unit tests and participate in design and code reviews.

Qualifications:
- Bachelor's degree in Computer Science or equivalent practical experience (0-2 years).
- Solid knowledge of JavaScript/TypeScript, Python, or C++.
- Eagerness to learn financial systems, distributed systems, and real-time streaming architectures.`,
    requiredSkills: ["TypeScript", "JavaScript", "Python", "C++", "SQL", "Git"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=Junior+Software+Engineer+Bloomberg",
    applyUrl: "https://www.linkedin.com/jobs/search/?keywords=Junior+Software+Engineer+Bloomberg",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    isFeatured: true
  },
  {
    id: "job-capitalone-hybrid-entry",
    title: "Associate Full Stack Developer (Technology Early Career)",
    company: "Capital One",
    companyLogo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://capitalone.com",
    location: "McLean, VA / Richmond, VA (Hybrid)",
    workplaceType: "hybrid",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 105000,
    maxSalary: 130000,
    currency: "USD",
    salaryPeriod: "yearly",
    description: `Join Capital One's Technology Development Program. As an Associate Full Stack Developer, you will work on consumer banking products used by over 100 million customers.

What You'll Do:
- Develop modern web applications with React, Node.js, and AWS serverless services.
- Participate in Agile sprints, pair programming, and architectural workshops.
- Implement automated testing and CI/CD pipelines.

Basic Qualifications:
- 0-2 years of software development experience or recent boot camp / university graduate.
- Proficiency in HTML/CSS, modern JavaScript/TypeScript, and RESTful APIs.`,
    requiredSkills: ["React", "JavaScript", "Node.js", "AWS", "REST APIs", "Git"],
    source: "indeed",
    sourceUrl: "https://www.indeed.com/viewjob?jk=capitalone-associate-dev",
    applyUrl: "https://www.capitalonecareers.com",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  },
  {
    id: "job-monzo-hybrid-entry",
    title: "Junior Frontend Engineer (Design Systems)",
    company: "Monzo",
    companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://monzo.com",
    location: "London, UK (Hybrid)",
    workplaceType: "hybrid",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 65000,
    maxSalary: 85000,
    currency: "USD",
    salaryPeriod: "yearly",
    description: `Monzo is building the bank of the future. Our Design Systems team is hiring a Junior Frontend Engineer to build accessible, reusable React UI components.

What You'll Work On:
- Build accessible component primitives in React and Tailwind CSS.
- Write comprehensive documentation, component stories (Storybook), and visual regression tests.
- Work closely with product designers to ship delightful micro-interactions.

Requirements:
- Strong foundations in React, TypeScript, and modern CSS.
- Understanding of web accessibility (WCAG) and responsive web design.`,
    requiredSkills: ["React", "TypeScript", "Tailwind CSS", "Storybook", "HTML/CSS", "Figma"],
    source: "wellfound",
    sourceUrl: "https://wellfound.com/jobs/monzo-junior-frontend",
    applyUrl: "https://monzo.com/careers",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString()
  },

  // ==========================================
  // REMOTE + ENTRY-LEVEL
  // ==========================================
  {
    id: "job-partner-apex-entry",
    title: "Junior to Mid-Level React Developer (Fast-Track Partner)",
    company: "Apex Tech Labs",
    companyLogo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://example.com/apex",
    location: "Remote (Global)",
    workplaceType: "remote",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 85000,
    maxSalary: 115000,
    currency: "USD",
    salaryPeriod: "yearly",
    description: `Apex Tech Labs has partnered directly with Hicejo to hire pre-screened frontend talent. Applications submitted through Hicejo bypass initial recruiter screening and go straight to technical hiring managers!

Responsibilities:
- Build and maintain responsive customer-facing web applications using React and Tailwind CSS.
- Translate Figma designs into pixel-perfect, accessible components.
- Participate in daily standups, code reviews, and pair programming sessions.

Requirements:
- 1-3 years of practical experience with JavaScript, React, and CSS/Tailwind.
- Familiarity with Git version control and modern build tools (Vite, Next.js).
- Strong eagerness to learn, take feedback, and iterate rapidly.`,
    requiredSkills: ["React", "JavaScript", "HTML/CSS", "Tailwind CSS", "Git", "Figma"],
    source: "direct",
    sourceUrl: "#",
    applyUrl: "#direct-apply",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    isFeatured: true,
    isDirectPartner: true,
    commissionModel: "placement_fee",
    commissionAmount: 1000,
    employerContactEmail: "hiring@apextechlabs.demo"
  },
  {
    id: "job-gitlab-remote-entry",
    title: "Junior Full Stack Engineer, Growth",
    company: "GitLab",
    companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://gitlab.com",
    location: "Remote (Worldwide)",
    workplaceType: "remote",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 95000,
    maxSalary: 125000,
    currency: "USD",
    salaryPeriod: "yearly",
    description: `GitLab is an all-remote pioneer. Our Growth team experiments with onboarding funnels, user activation, and conversion workflows.

You Will:
- Run A/B growth experiments across the GitLab product application.
- Write full-stack code using Ruby on Rails and Vue.js / React.
- Analyze telemetry metrics and iterate based on user behavioral data.

Requirements:
- 0-2 years of software engineering experience.
- Familiarity with modern web frameworks (Ruby on Rails, React, Vue, or Node.js).
- Self-motivated and comfortable working in an asynchronous, remote-first environment.`,
    requiredSkills: ["Vue.js", "React", "Ruby on Rails", "PostgreSQL", "Git", "A/B Testing"],
    source: "wellfound",
    sourceUrl: "https://wellfound.com/jobs/gitlab-junior-growth",
    applyUrl: "https://about.gitlab.com/jobs",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString()
  },

  // ==========================================
  // MID-LEVEL (Hybrid & Remote)
  // ==========================================
  {
    id: "job-datadog-mid-hybrid",
    title: "Software Engineer, Cloud Integrations",
    company: "Datadog",
    companyLogo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://datadoghq.com",
    location: "New York, NY / Boston, MA (Hybrid)",
    workplaceType: "hybrid",
    jobType: "full-time",
    experienceLevel: "mid",
    minSalary: 145000,
    maxSalary: 185000,
    currency: "USD",
    salaryPeriod: "yearly",
    description: `Datadog is the monitoring and observability platform for cloud applications. We bring together metrics, traces, and logs from servers and containers.

Your Impact:
- Build resilient data collectors and ingestion pipelines handling telemetry data.
- Implement automated connectors for AWS, GCP, and Kubernetes ecosystems.
- Write robust unit and integration tests.

Candidate Profile:
- 2-4 years experience with Go, Python, or TypeScript in cloud environments.
- Solid understanding of Docker, Linux internals, and networking.`,
    requiredSkills: ["Go", "Python", "Docker", "Kubernetes", "AWS", "Linux", "CI/CD"],
    source: "indeed",
    sourceUrl: "https://www.indeed.com/viewjob?jk=datadog-cloud-integrations",
    applyUrl: "https://datadoghq.com/careers",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: "job-figma-mid-hybrid",
    title: "Frontend Software Engineer, Collaboration Surfaces",
    company: "Figma",
    companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://figma.com",
    location: "San Francisco, CA / New York, NY (Hybrid)",
    workplaceType: "hybrid",
    jobType: "full-time",
    experienceLevel: "mid",
    minSalary: 155000,
    maxSalary: 195000,
    currency: "USD",
    salaryPeriod: "yearly",
    description: `Figma is the collaborative interface design platform where teams create together in real time.

What You Will Work On:
- Developing performant editing and prototyping tools inside Figma's collaborative canvas.
- Optimizing WebAssembly and WebGL rendering pipelines for 60fps responsiveness.
- Writing reliable TypeScript and React components for toolbars and collaboration cursors.

Requirements:
- 3+ years in frontend software engineering.
- Deep knowledge of modern browser APIs and DOM performance.
- Strong proficiency in TypeScript, React, and data structure fundamentals.`,
    requiredSkills: ["TypeScript", "React", "WebGL", "WebAssembly", "Canvas", "Performance Optimization"],
    source: "indeed",
    sourceUrl: "https://www.indeed.com/viewjob?jk=figma-frontend-engineer",
    applyUrl: "https://figma.com/careers",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString()
  },
  {
    id: "job-resend-mid-remote",
    title: "Full Stack Engineer, Developer Tools",
    company: "Resend",
    companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://resend.com",
    location: "Remote (Global)",
    workplaceType: "remote",
    jobType: "full-time",
    experienceLevel: "mid",
    minSalary: 135000,
    maxSalary: 175000,
    currency: "USD",
    salaryPeriod: "yearly",
    description: `Resend is the email platform built for developers. We are building the next generation of email infrastructure with React Email, webhooks, and real-time deliverability insights.

What You'll Do:
- Build developer-facing dashboard features using Next.js App Router, Tailwind CSS, and Server Actions.
- Optimize high-throughput transactional email delivery endpoints.
- Maintain and expand open-source packages in React Email.

Requirements:
- 2-5 years experience building with Next.js, React, Node.js, and TypeScript.
- Strong product taste and passion for developer tools.`,
    requiredSkills: ["Next.js", "React", "TypeScript", "Node.js", "Tailwind CSS", "REST APIs"],
    source: "wellfound",
    sourceUrl: "https://wellfound.com/jobs/resend-full-stack",
    applyUrl: "https://resend.com/careers",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
    isFeatured: true
  },

  // ==========================================
  // SENIOR & LEAD (Hybrid & Remote)
  // ==========================================
  {
    id: "job-stripe-senior-hybrid",
    title: "Senior Full Stack Engineer, Developer Platform",
    company: "Stripe",
    companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://stripe.com",
    location: "San Francisco, CA / Seattle, WA (Hybrid)",
    workplaceType: "hybrid",
    jobType: "full-time",
    experienceLevel: "senior",
    minSalary: 185000,
    maxSalary: 235000,
    currency: "USD",
    salaryPeriod: "yearly",
    description: `Stripe builds economic infrastructure for the internet. As a Senior Full Stack Engineer on our Developer Platform team, you will design the developer tools, SDKs, and APIs that millions of developers use daily.

Key Responsibilities:
- Architect high-performance, developer-facing surfaces using React, TypeScript, and distributed backend services.
- Optimize web performance, reliability, and security across global edge networks.
- Mentor engineers, drive design reviews, and establish engineering standards.

Requirements:
- 5+ years of production experience shipping high-scale web applications.
- Deep expertise in TypeScript, React, Node.js, and modern CSS architectures.
- Experience with distributed databases (PostgreSQL, Redis) and REST/GraphQL API design.`,
    requiredSkills: ["TypeScript", "React", "Node.js", "PostgreSQL", "REST APIs", "GraphQL", "Distributed Systems"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=Senior+Full+Stack+Engineer+Developer+Platform+Stripe",
    applyUrl: "https://www.linkedin.com/jobs/search/?keywords=Senior+Full+Stack+Engineer+Developer+Platform+Stripe",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    isFeatured: true
  },
  {
    id: "job-supabase-lead-remote",
    title: "Staff Frontend Architect",
    company: "Supabase",
    companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://supabase.com",
    location: "Remote (Global)",
    workplaceType: "remote",
    jobType: "full-time",
    experienceLevel: "lead",
    minSalary: 190000,
    maxSalary: 250000,
    currency: "USD",
    salaryPeriod: "yearly",
    description: `Supabase is an open source Firebase alternative. We provide a full backend platform including PostgreSQL, Authentication, Realtime, Storage, and AI vectors.

What You Will Do:
- Lead the architecture and performance of the open-source Supabase Studio dashboard.
- Champion best practices in Next.js, React Server Components, Tailwind CSS, and state management.
- Build complex data visualizers and SQL editors handling millions of records in-browser.

Requirements:
- 7+ years building enterprise or open-source frontend architectures.
- Mastery of Next.js App Router, React 19, TypeScript, and PostgreSQL.`,
    requiredSkills: ["Next.js", "React", "TypeScript", "Tailwind CSS", "PostgreSQL", "SQL", "Open Source"],
    source: "wellfound",
    sourceUrl: "https://wellfound.com/jobs/supabase-staff-frontend",
    applyUrl: "https://supabase.com/careers",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    isFeatured: true
  },
  {
    id: "job-airbnb-senior-hybrid",
    title: "Backend Platform Engineer, Payments Infrastructure",
    company: "Airbnb",
    companyLogo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://airbnb.com",
    location: "Seattle, WA / San Francisco, CA (Hybrid)",
    workplaceType: "hybrid",
    jobType: "full-time",
    experienceLevel: "senior",
    minSalary: 175000,
    maxSalary: 230000,
    currency: "USD",
    salaryPeriod: "yearly",
    description: `Airbnb connects millions of travelers with unique hosts around the world. Our Payments Infrastructure team processes tens of billions of dollars across dozens of international currencies.

Responsibilities:
- Design fault-tolerant payment flows with idempotent state machines.
- Ensure strict transactional integrity and double-entry ledger bookkeeping.
- Optimize high-throughput microservices built in Java and Kotlin.

Requirements:
- 5+ years building transactional financial systems or high-throughput backends.
- Strong understanding of SQL, ACID guarantees, Kafka, and distributed consensus.`,
    requiredSkills: ["Java", "Kotlin", "Kafka", "SQL", "Distributed Systems", "Microservices", "REST APIs"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=Backend+Platform+Engineer+Payments+Infrastructure+Airbnb",
    applyUrl: "https://www.linkedin.com/jobs/search/?keywords=Backend+Platform+Engineer+Payments+Infrastructure+Airbnb",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString()
  },
  {
    id: "job-linear-senior-remote",
    title: "Product Engineer, Workflow & Automations",
    company: "Linear",
    companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://linear.app",
    location: "Remote (US / Europe)",
    workplaceType: "remote",
    jobType: "full-time",
    experienceLevel: "senior",
    minSalary: 170000,
    maxSalary: 220000,
    currency: "USD",
    salaryPeriod: "yearly",
    description: `Linear is the issue tracking tool built for high-performance software teams. It is designed to be ridiculously fast, delightful to use, and keyboard-centric.

What We Value:
- High taste in UI/UX craft, micro-interactions, and animations.
- Crafting client-first synchronization architectures with offline persistence.
- Working autonomously in a compact, highly focused product engineering team.

Required Skills & Background:
- 4+ years of product engineering experience.
- Deep familiarity with React, TypeScript, WebSockets, and browser persistence.`,
    requiredSkills: ["React", "TypeScript", "WebSockets", "CSS Animations", "UI/UX Design", "GraphQL"],
    source: "wellfound",
    sourceUrl: "https://wellfound.com/jobs/linear-product-engineer",
    applyUrl: "https://linear.app/careers",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },

  // ==========================================
  // ONSITE ROLES (Tech hubs)
  // ==========================================
  {
    id: "job-apple-onsite-entry",
    title: "Tools & Automation Engineer (Early Career)",
    company: "Apple",
    companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://apple.com",
    location: "Cupertino, CA (On-site)",
    workplaceType: "onsite",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 130000,
    maxSalary: 160000,
    currency: "USD",
    salaryPeriod: "yearly",
    description: `Apple's Hardware and Software Engineering teams are looking for an entry-level Tools & Automation Engineer at Apple Park in Cupertino.

Role:
- Develop automated continuous integration pipelines, telemetry dashboards, and test suites.
- Work closely with hardware and firmware engineers to qualify macOS and iOS releases.
- Write Python, Swift, and JavaScript test harnesses.

Requirements:
- 0-2 years experience with Python, Swift, or JavaScript.
- Passion for software quality, system automation, and Apple technologies.`,
    requiredSkills: ["Python", "Swift", "JavaScript", "CI/CD", "Git", "Bash"],
    source: "indeed",
    sourceUrl: "https://www.indeed.com/viewjob?jk=apple-tools-automation",
    applyUrl: "https://www.apple.com/careers",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString()
  },
  {
    id: "job-palantir-onsite-senior",
    title: "Senior Forward Deployed Software Engineer",
    company: "Palantir Technologies",
    companyLogo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://palantir.com",
    location: "Washington, DC (On-site)",
    workplaceType: "onsite",
    jobType: "full-time",
    experienceLevel: "senior",
    minSalary: 180000,
    maxSalary: 240000,
    currency: "USD",
    salaryPeriod: "yearly",
    description: `Forward Deployed Software Engineers (FDSE) work directly on the front lines with Palantir customers, deploying Foundry and Gotham to solve high-stakes operational problems.

What You'll Do:
- Architect distributed data pipelines, ontology models, and mission-critical data visualizations.
- Deploy secure enterprise software in air-gapped and specialized cloud environments.
- Write clean Java, TypeScript, and Python code.

Requirements:
- 5+ years building full-stack applications and distributed data pipelines.
- Deep expertise in Java or Python and TypeScript / React.`,
    requiredSkills: ["Java", "Python", "TypeScript", "React", "PostgreSQL", "Distributed Systems", "Security"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=Senior+Forward+Deployed+Software+Engineer+Palantir",
    applyUrl: "https://www.linkedin.com/jobs/search/?keywords=Senior+Forward+Deployed+Software+Engineer+Palantir",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString()
  },

  // ==========================================
  // PRODUCT MANAGEMENT ROLES
  // ==========================================
  {
    id: "job-airbnb-pm-senior",
    title: "Senior Product Manager, Guest Experience",
    company: "Airbnb",
    companyLogo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://airbnb.com",
    location: "San Francisco, CA / Remote",
    workplaceType: "hybrid",
    jobType: "full-time",
    experienceLevel: "senior",
    minSalary: 185000,
    maxSalary: 235000,
    currency: "USD",
    salaryPeriod: "yearly",
    description: `Airbnb is looking for a Senior Product Manager to lead our core Guest Search and Discovery experience. You will define the roadmap for how travelers discover unique stays and experiences across the globe.

Responsibilities:
- Define product strategy, metrics, and PRDs for search ranking, personalized recommendations, and checkout conversion.
- Partner with engineering, machine learning researchers, and design leaders to ship high-impact features.
- Run rigorous A/B experiments and present product insights to executive leadership.

Qualifications:
- 4+ years of Product Management experience shipping consumer mobile or web products.
- Strong analytical chops, SQL proficiency, and user research instincts.`,
    requiredSkills: ["Product Strategy", "A/B Testing", "SQL", "User Research", "Roadmapping", "Data Analysis"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=Senior+Product+Manager+Guest+Experience+Airbnb",
    applyUrl: "https://www.linkedin.com/jobs/search/?keywords=Senior+Product+Manager+Guest+Experience+Airbnb",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    isFeatured: true
  },
  {
    id: "job-linear-pm-mid",
    title: "Product Manager, Developer Workflows",
    company: "Linear",
    companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://linear.app",
    location: "Remote (Global)",
    workplaceType: "remote",
    jobType: "full-time",
    experienceLevel: "mid",
    minSalary: 150000,
    maxSalary: 190000,
    currency: "USD",
    salaryPeriod: "yearly",
    description: `Linear creates tools for modern software development. As a Product Manager, you will craft the features that keep software teams moving fast without administrative friction.

Responsibilities:
- Deeply understand developer habits, issue triage, and project management pain points.
- Collaborate closely with engineers and designers to sculpt tight, keyboard-first workflows.
- Keep specifications simple, clear, and action-oriented.

Qualifications:
- 2-4 years of product management experience at high-velocity tech companies.
- Strong technical literacy (you understand APIs, Git workflows, and engineering cycles).`,
    requiredSkills: ["Product Management", "Developer Experience", "UX Design", "Agile", "Roadmapping"],
    source: "wellfound",
    sourceUrl: "https://wellfound.com/jobs/linear-pm",
    applyUrl: "https://linear.app/careers",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString()
  },

  // ==========================================
  // DATA SCIENCE & ANALYTICS ROLES
  // ==========================================
  {
    id: "job-spotify-data-scientist",
    title: "Data Scientist, Personalization & Recommendations",
    company: "Spotify",
    companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://spotify.com",
    location: "New York, NY / Remote",
    workplaceType: "hybrid",
    jobType: "full-time",
    experienceLevel: "mid",
    minSalary: 140000,
    maxSalary: 180000,
    currency: "USD",
    salaryPeriod: "yearly",
    description: `Spotify's Personalization Mission builds the machine learning and algorithmic systems behind Discover Weekly, Daily Mix, and Home recommendations.

What You'll Do:
- Design, deploy, and evaluate recommendation models and collaborative filtering algorithms.
- Run large-scale offline model evaluations and online randomized controlled trials (A/B testing).
- Partner with product managers and engineers to scale telemetry and feature pipelines.

Requirements:
- 2-5 years experience applying machine learning or statistical modeling in production.
- Proficiency in Python, SQL, and ML libraries (PyTorch, scikit-learn, Spark).`,
    requiredSkills: ["Python", "Machine Learning", "SQL", "Statistics", "A/B Testing", "Spark", "PyTorch"],
    source: "indeed",
    sourceUrl: "https://www.indeed.com/viewjob?jk=spotify-data-scientist",
    applyUrl: "https://spotify.com/careers",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString()
  },
  {
    id: "job-scale-data-analyst",
    title: "Business Intelligence & Data Analyst",
    company: "Scale AI",
    companyLogo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://scale.com",
    location: "San Francisco, CA / Remote",
    workplaceType: "remote",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 95000,
    maxSalary: 125000,
    currency: "USD",
    salaryPeriod: "yearly",
    description: `Scale AI powers the AI models of the world. Our Data & Analytics team builds the dashboards, pipelines, and revenue models that guide strategic decisions.

What You'll Do:
- Write complex SQL queries and dbt transformations to model operational and financial metrics.
- Build clean executive dashboards in Metabase, Tableau, or Hex.
- Conduct exploratory data analysis to discover customer retention and pipeline bottlenecks.

Requirements:
- 0-3 years experience in data analytics, business intelligence, or data engineering.
- Advanced SQL skills and experience with Python or R for data analysis.`,
    requiredSkills: ["SQL", "Data Analysis", "Tableau", "Python", "Metabase", "dbt"],
    source: "wellfound",
    sourceUrl: "https://wellfound.com/jobs/scale-data-analyst",
    applyUrl: "https://scale.com/careers",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  },

  // ==========================================
  // DESIGN & UX ROLES
  // ==========================================
  {
    id: "job-figma-product-designer",
    title: "Product Designer, Core Systems",
    company: "Figma",
    companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://figma.com",
    location: "San Francisco, CA (Hybrid)",
    workplaceType: "hybrid",
    jobType: "full-time",
    experienceLevel: "senior",
    minSalary: 170000,
    maxSalary: 215000,
    currency: "USD",
    salaryPeriod: "yearly",
    description: `Figma is building the collaborative platform where teams design the future. We are hiring a Senior Product Designer to evolve our core canvas and design systems.

What You'll Do:
- Design intuitive workflows, tool palettes, and interaction models for millions of designers.
- Prototype micro-interactions and vector manipulation tools.
- Work directly with product managers and engineers from initial discovery through launch.

Requirements:
- 4+ years of product design / UX experience.
- World-class visual design craft, systems thinking, and interactive prototyping skills.`,
    requiredSkills: ["Product Design", "Figma", "UI/UX Design", "Design Systems", "Prototyping", "User Research"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=Product+Designer+Core+Systems+Figma",
    applyUrl: "https://www.linkedin.com/jobs/search/?keywords=Product+Designer+Core+Systems+Figma",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 34).toISOString(),
    isFeatured: true
  }
];

