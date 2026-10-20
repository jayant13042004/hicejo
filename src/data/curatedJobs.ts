import { JobListing } from "@/types/jobs";

export const CURATED_JOB_LISTINGS: JobListing[] = [
  // ==========================================
  // HYBRID + ENTRY-LEVEL (Matches user test!)
  // ==========================================
  {
    id: "job-bloomberg-hybrid-entry",
    title: "Senior Software Engineer - Compliance & AIM Platform",
    company: "Bloomberg",
    companyLogo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://bloomberg.com",
    location: "Pune, India (Hybrid)",
    workplaceType: "hybrid",
    jobType: "full-time",
    experienceLevel: "senior",
    minSalary: 135000,
    maxSalary: 180000,
    currency: "USD",
    salaryPeriod: "yearly",
    description: `About the job
Location: Pune, India
Business Area: Engineering and CTO
Ref #: 10051402

Description & Requirements:
Bloomberg AIM (Asset and Investment Manager) is a buy-side trading platform used by some of the biggest asset managers in capital markets. Our platform is a one-stop shop that enables everything from idea generation to trade execution and post-trade operations. It’s a large scale system – built by more than 400 engineers – used to manage trillions of dollars each day by 930 global firms across over 80 countries. We’re the market leading platform, and Bloomberg continues to invest in our growth as a product and engineering team – that’s where you come in!

Our Team:
In the Compliance team, we tackle problems associated with large distributed systems such as latency and scaling, balanced with the need for reliability and accuracy required for a business-critical system. Over the next 2-3 years, we have multiple projects focused on keeping our clients ahead of the competition as well as organically rebuilding the platform in order to serve the growing number of tier-1 clients with a global footprint that transact in volumes we currently cannot support. Solving problems on this scale is hard and we’re always looking for fresh ideas and new technologies to leverage.

What’s in it for you? 
The Compliance team builds systems which ensure that every transaction happening across the entire AIM platform is checked against 10s of thousands of rules. These rules ensure that no market regulation is violated, no illicit/manipulative activity is performed, and no activity that would put the client at financial risk takes place. We additionally provide the necessary tools to define and manage rules as well as deal with violations and provide trading supervisory overrides where applicable. Because our systems are in the critical path of real-time trading, throughput, latency and correctness are of paramount importance.

The impact of the Compliance product spans further than just AIM as it is also being used by the Sell-Side OMS (TOMS), various execution platforms and portfolio optimizers. The team is a core team under Compliance providing a solution for Creation, Business intelligence, Audit, Reporting, and Automation of Compliance Rules. Our team works closely with our business counterparts and quality engineering teams in an Agile environment. Our development processes include daily scrum, sprint planning, Github, developing unit/regression tests, conducting code reviews and automated coverage tests and CI/CD pipeline.

We are looking for a Senior Software Engineer with a strong background in system design, architecture, and the development of high-quality, modular, stable, and scalable software. Just as importantly, we value engineers who bring energy and enthusiasm - driving discussions, sharing fresh ideas, and championing best practices within their teams.

We'll Trust You To:
- Take full responsibility across the software development lifecycle - from business requirements and architecture design to implementation, deployment, and ongoing maintenance
- Deliver enterprise-grade solutions that directly impact clients’ investment workflows and firm-wide operations
- Build distributed, fault-tolerant, and highly scalable systems with strong observability, resilience, and automated testing from day one
- Design and implement technology that transforms complex client workflows into streamlined, high-impact solutions across global markets
- Partner with product managers, quantitative analysts, and infrastructure engineers to deliver measurable business value
- Manage technical projects and coordinate with multiple stakeholders to drive forward strategic initiatives

You'll Need To Have:
- 7+ years of demonstrated software engineering experience in C++
- BA, BS, MS, PhD in Computer Science, Engineering
- Experience designing, developing, and managing large-scale service-oriented systems
- Strong knowledge of object-oriented design, data structures and systems, and applications programming
- Experience with CI, CD and unit testing
- Experience building scalable systems with focus on code quality, system telemetry, and testing
- Excellent communication and collaboration skills
- A self-starter approach with a strong sense of ownership

We'd Love To See:
- Experience leading or contributing to platform migrations without disrupting production systems
- Experience with or strong interest in applying AI/LLM-based approaches to solve problems in the financial domain`,
    requiredSkills: ["C++", "System Design", "Distributed Systems", "Object-Oriented Design", "CI/CD", "Unit Testing", "System Telemetry", "Agile", "Low Latency / High Throughput", "Financial Systems"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=Senior+Software+Engineer+Bloomberg+Pune",
    applyUrl: "https://www.linkedin.com/jobs/search/?keywords=Senior+Software+Engineer+Bloomberg+Pune",
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
    description: `About the Role:
Capital One is a technology company inspired by financial services. We are hiring early-career Associate Full Stack Developers to join our Technology Development Program (TDP). In this role, you will help design and engineer resilient consumer banking applications, fraud-detection pipelines, and credit card management platforms used by over 100 million active customers.

Our Culture & Engineering Practices:
At Capital One, we operate 100% in the public cloud on AWS. We believe in microservices, serverless computing, open source, and continuous delivery. You will work within an empowered cross-functional squad comprising engineers, product managers, data scientists, and UX designers in two-week agile sprint cadences.

Key Responsibilities:
- Build, test, and deploy responsive web interfaces using React, Next.js, and TypeScript.
- Develop robust, containerized microservices and RESTful API endpoints using Node.js, Python, or Java.
- Leverage AWS services including Lambda, API Gateway, DynamoDB, S3, and CloudWatch for serverless application backends.
- Write thorough unit, integration, and end-to-end tests using Jest, Cypress, and Playwright to maintain high quality bars.
- Implement CI/CD automation pipelines using GitHub Actions and Jenkins for safe, zero-downtime releases.
- Participate in code reviews, daily standups, architectural discussions, and automated vulnerability scanning.

Basic Qualifications:
- Bachelor's degree in Computer Science, Computer Engineering, Information Technology, or equivalent practical software engineering experience (0-2 years).
- Practical experience with modern JavaScript, TypeScript, HTML5, and CSS3.
- Familiarity with at least one backend language (Node.js/JavaScript, Python, Java, or Go).
- Understanding of relational or NoSQL database concepts (e.g. PostgreSQL, MySQL, DynamoDB, MongoDB).
- Familiarity with version control workflows using Git and GitHub.

Preferred Qualifications:
- Prior internship or project experience working with AWS, GCP, or Azure cloud infrastructure.
- Experience building with React and component-driven UI architecture.
- Understanding of secure coding standards (OWASP Top 10) and automated testing best practices.
- Strong communication, problem-solving, and collaborative skills.`,
    requiredSkills: ["React", "TypeScript", "JavaScript", "Node.js", "AWS", "REST APIs", "PostgreSQL", "Git", "CI/CD"],
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
    description: `About Monzo:
Monzo is building the bank of the future. We've grown to over 9 million customers across the UK by creating intuitive, transparent money management tools. Our mission is to make money work for everyone, and exceptional product design is at the core of everything we do.

About the Design Systems Team:
The Design Systems team at Monzo builds the foundational UI components, tokens, and design infrastructure powering all customer-facing banking experiences on web and mobile. We bridge the gap between product designers and product engineering squads, ensuring that every interface is pixel-perfect, accessible, and performant.

What You'll Work On:
- Build and maintain reusable, accessible component primitives in React, TypeScript, and modern CSS/Tailwind.
- Author comprehensive component documentation, interactive Storybook stories, and usage guidelines for engineering squads.
- Implement automated visual regression tests and unit tests using Vitest and Chromatic.
- Partner closely with product designers in Figma to translate design tokens and variables into production code.
- Champion accessibility best practices (WCAG 2.1 AA compliance, ARIA attributes, keyboard navigation, and screen reader testing).
- Review pull requests from other squads contributing to the shared design system.

Requirements:
- Solid foundations in modern JavaScript (ES6+), TypeScript, HTML5 semantic structure, and CSS3.
- Hands-on experience building web user interfaces with React and modern build tooling.
- Demonstrated passion for web accessibility (a11y), responsive design, and component-driven development.
- Understanding of Git version control, branching, and pull request workflows.
- Strong attention to typographic detail, spacing, micro-interactions, and visual craftsmanship.

Nice to Have:
- Experience with Storybook, Tailwind CSS, or headless UI component libraries (e.g., Radix UI, Headless UI).
- Experience working with design tools such as Figma.
- Familiarity with visual regression testing and CI/CD pipelines.`,
    requiredSkills: ["React", "TypeScript", "Tailwind CSS", "Storybook", "HTML/CSS", "Figma", "Accessibility (WCAG)", "Git"],
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
    description: `About Apex Tech Labs:
Apex Tech Labs builds next-generation SaaS enterprise analytics and workflow orchestration applications. We have partnered directly with Hicejo to hire pre-screened frontend talent. Applications submitted through Hicejo bypass standard resume screening queues and go directly to technical hiring managers for an expedited review cycle.

The Role:
We are looking for an ambitious Junior to Mid-Level React Developer to join our core UI team. In this role, you will be responsible for creating modern, responsive user interfaces, dashboard visualizations, and reusable component libraries that serve over 50,000 daily active enterprise users.

Responsibilities:
- Build and maintain high-performance, customer-facing web applications using React, Next.js, and TypeScript.
- Translate detailed Figma mockups into clean, accessible, and responsive components using Tailwind CSS.
- Connect frontend components with RESTful APIs and GraphQL services, handling complex client-side state caching with React Query.
- Write maintainable unit tests and end-to-end integration tests using Vitest and Playwright.
- Participate in daily standups, code reviews, and pair programming sessions to maintain clean code standards.
- Troubleshoot client-side performance bottlenecks and optimize Core Web Vitals across modern browsers.

Requirements:
- 1-3 years of practical experience with JavaScript (ES6+), TypeScript, React, and CSS/Tailwind.
- Strong foundational understanding of component lifecycles, state management, and modern React hooks.
- Familiarity with version control using Git, branching strategies, and pull request workflows.
- Experience consuming RESTful APIs or GraphQL endpoints.
- Self-motivated, collaborative, and eager to learn in a high-velocity startup environment.

Nice to Have:
- Familiarity with Next.js App Router or Server Components.
- Basic understanding of web accessibility standards (WCAG 2.1).
- Experience with charting libraries (Recharts, Chart.js, or D3.js).`,
    requiredSkills: ["React", "TypeScript", "JavaScript", "HTML/CSS", "Tailwind CSS", "Git", "REST APIs", "Figma"],
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
    description: `About GitLab:
GitLab is the open DevOps platform delivered as a single application. As an all-remote company from day one, we empower thousands of organizations around the world to deliver software faster and more securely.

About the Growth Team:
Our Growth engineering squad is dedicated to improving customer onboarding, product activation, and conversion workflows across GitLab.com. We run rapid experimentation cycles, build interactive product tours, and optimize self-service upgrade paths used by millions of developers.

What You Will Do:
- Design, implement, and analyze rapid A/B experiments across user onboarding, registration, and billing workflows.
- Write full-stack code across our Ruby on Rails backend and Vue.js / React frontend services.
- Instrument telemetry and behavioral event tracking using Snowplow and PostgreSQL to measure feature adoption.
- Collaborate asynchronously with product managers, UX researchers, and data analysts across multiple timezones.
- Ensure all growth features comply with GitLab's high standards for security, test coverage, and documentation.
- Contribute directly to our open-source codebase through transparent merge requests and public issue tracking.

Requirements:
- 0-2 years of software engineering experience or relevant university/internship background.
- Proficiency in at least one modern backend language (Ruby, Python, Node.js, Go) and familiarity with relational databases (PostgreSQL/MySQL).
- Hands-on experience with modern frontend frameworks (Vue.js, React, or modern JavaScript/TypeScript).
- Strong written communication skills and the ability to thrive in an asynchronous, remote-first workplace.
- Understanding of Git version control and software testing methodologies (unit tests, integration tests).

Nice to Have:
- Experience running A/B experiments, statistical significance evaluations, or product telemetry.
- Open-source contributions or experience working on public developer tooling.`,
    requiredSkills: ["Vue.js", "React", "Ruby on Rails", "PostgreSQL", "Git", "A/B Testing", "CI/CD", "TypeScript"],
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
    description: `About Datadog:
Datadog is the monitoring and security platform for cloud applications. Our SaaS platform integrates and automates infrastructure monitoring, application performance monitoring, log management, and cloud security to provide unified real-time observability of our customers' entire technology stack.

About the Cloud Integrations Team:
The Cloud Integrations team builds the high-throughput telemetry pipelines and API connectors that ingest data from major public clouds (AWS, Google Cloud, Microsoft Azure) and container orchestration platforms (Kubernetes, ECS). Our systems process trillions of events each day with sub-second latency.

Your Impact:
- Design, build, and scale resilient data ingestion services handling massive streaming telemetry workloads.
- Develop automated cloud resource discoverers and metric scrapers for AWS, GCP, and Kubernetes ecosystems.
- Optimize Go and Python microservices for low latency, high throughput, and efficient CPU/memory utilization.
- Implement robust telemetry, health checks, and alerting for all production integration pipelines.
- Write comprehensive unit, integration, and load tests to safeguard system reliability under peak traffic.
- Partner with product managers and customer engineers to support new cloud services as they launch.

Candidate Profile:
- 2-5 years of professional software engineering experience with Go, Python, or TypeScript in production environments.
- Strong knowledge of distributed systems concepts, concurrency patterns, and microservices architecture.
- Solid understanding of Docker, container orchestration (Kubernetes), and Linux system internals.
- Hands-on experience with at least one major cloud provider (AWS, GCP, or Azure).
- Proven track record of debugging complex production issues, profiling CPU/memory bottlenecks, and maintaining CI/CD pipelines.

Nice to Have:
- Experience with streaming messaging brokers such as Apache Kafka or RabbitMQ.
- Deep familiarity with Prometheus, OpenTelemetry, or cloud monitoring APIs.`,
    requiredSkills: ["Go", "Python", "Docker", "Kubernetes", "AWS", "Linux", "CI/CD", "Distributed Systems", "Kafka"],
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
    description: `About Figma:
Figma is the collaborative interface design platform where teams create, test, and ship better designs together. From brainstorms in FigJam to production handoff in Dev Mode, Figma is used by millions of creators across the globe.

About the Collaboration Surfaces Team:
Our team is responsible for the interactive multiplayer surfaces inside Figma—including live cursor presence, commenting, audio huddles, and real-time document synchronization. We push the limits of what is possible in modern web browsers by combining C++, WebAssembly, WebGL, and React.

What You Will Work On:
- Develop fluid, responsive editing and collaboration tools that operate seamlessly at 60fps on consumer laptops.
- Implement multiplayer client-side synchronization and conflict-resolution algorithms (CRDTs/OT).
- Build accessible, keyboard-first React and TypeScript UI components for toolbars, inspectors, and comments.
- Optimize WebGL shaders and WebAssembly memory layouts to minimize frame drops on complex multi-page files.
- Collaborate closely with product designers to prototype and refine novel interaction paradigms.
- Write robust unit tests, browser performance benchmarks, and automated regression suites.

Requirements:
- 3+ years of frontend software engineering experience shipping complex, interactive web applications.
- Deep expertise in TypeScript, React, and modern DOM/browser performance optimization.
- Strong understanding of algorithms, data structures, and memory management.
- Experience with real-time architectures, WebSockets, or collaborative multi-user applications.
- High aesthetic sensibility and care for delightful micro-interactions.

Nice to Have:
- Experience with WebGL, Canvas API, or 2D/3D graphics rendering engines.
- Familiarity with WebAssembly (Wasm) and C++ integration in the browser.`,
    requiredSkills: ["TypeScript", "React", "WebGL", "WebAssembly", "Canvas", "Performance Optimization", "WebSockets"],
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
    description: `About Resend:
Resend is the email platform built for developers. We are building the next generation of transactional email infrastructure with modern APIs, React Email templates, webhooks, and real-time deliverability insights.

The Role:
We are looking for a Full Stack Engineer who loves craft, speed, and developer experience. You will work across our entire stack—from the Next.js customer dashboard to high-throughput email sending backends and open-source React Email components.

What You'll Do:
- Build developer-facing dashboard features using Next.js App Router, Tailwind CSS, Server Actions, and React Server Components.
- Design, optimize, and maintain high-throughput transactional email delivery endpoints capable of handling millions of requests.
- Contribute to and maintain open-source packages in the React Email ecosystem.
- Build real-time analytics graphs and webhook monitoring consoles for enterprise customers.
- Write elegant TypeScript APIs with strict type safety and detailed documentation.

Requirements:
- 2-5 years of full-stack engineering experience building production web applications.
- Strong mastery of Next.js, React, Node.js, and TypeScript.
- Experience designing RESTful APIs, webhook dispatch systems, and database schemas (PostgreSQL / Prisma).
- High product taste, attention to detail, and a deep appreciation for developer experience.

Nice to Have:
- Prior contributions to open-source developer tooling.
- Knowledge of email protocols (SMTP, DKIM, SPF, DMARC) and deliverability infrastructure.`,
    requiredSkills: ["Next.js", "React", "TypeScript", "Node.js", "Tailwind CSS", "REST APIs", "PostgreSQL"],
    source: "wellfound",
    sourceUrl: "https://wellfound.com/jobs/resend-full-stack",
    applyUrl: "https://resend.com/careers",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
    isFeatured: true
  },
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
    description: `About Stripe:
Stripe is a financial infrastructure platform for the internet. Millions of companies—from the world's largest enterprises to the most ambitious startups—use Stripe to accept payments, grow their revenue, and accelerate new business opportunities.

About the Developer Platform Team:
The Developer Platform organization creates the developer tools, SDKs, API documentation, and dashboard interfaces that millions of software engineers interact with every day. We treat developer experience as our primary product craft, maintaining the industry gold standard for API ergonomics and portal performance.

Key Responsibilities:
- Architect, build, and maintain high-performance, developer-facing dashboard surfaces using React, TypeScript, and distributed backend services.
- Optimize web application performance, asset streaming, and security across Stripe's global edge network.
- Design backwards-compatible REST and GraphQL API schemas that support millions of API calls per second.
- Partner with product managers and developer advocates to establish new developer tools and interactive API explorers.
- Mentor engineers, lead cross-functional architecture reviews, and champion engineering excellence across the organization.
- Drive high availability and operational reliability with automated canary deployments, telemetry alarms, and rigorous testing.

Requirements:
- 5+ years of production experience shipping high-scale web applications and distributed backend services.
- Deep expertise in TypeScript, modern React, Node.js, and CSS design systems.
- Demonstrated experience with distributed relational databases (PostgreSQL, MySQL) and caching architectures (Redis).
- Thorough understanding of web security fundamentals (OAuth, CSRF, CSP, token authentication).
- Strong track record of improving team velocity, code review quality, and system resilience.

Nice to Have:
- Experience building developer tools, public APIs, or open-source libraries.
- Familiarity with financial transactions, idempotency patterns, or PCI compliance.`,
    requiredSkills: ["TypeScript", "React", "Node.js", "PostgreSQL", "REST APIs", "GraphQL", "Distributed Systems", "CI/CD"],
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
    description: `About Supabase:
Supabase is an open source Firebase alternative. We provide developers with an instant Postgres database, Authentication, Edge Functions, Realtime subscriptions, Storage, and AI vector embeddings—all accessible via simple client libraries and a web management console.

The Role:
As a Staff Frontend Architect, you will lead the technical vision, architecture, and performance of the open-source Supabase Studio dashboard. Studio is used daily by hundreds of thousands of developers to manage tables, run SQL queries, inspect real-time logs, and configure authentication policies.

What You Will Do:
- Lead the architectural roadmap and design patterns across our open-source Next.js and React monorepo.
- Champion frontend best practices in Next.js App Router, React Server Components, Tailwind CSS, and state isolation.
- Design and optimize complex in-browser data viewers, Monaco SQL editors, and visual schema builders handling massive datasets.
- Profile and optimize frontend bundle sizes, memory consumption, and Core Web Vitals across low-bandwidth environments.
- Mentor senior engineers, author comprehensive RFCs, and collaborate closely with our open-source community contributors.
- Establish automated end-to-end testing pipelines using Playwright and continuous visual regression testing.

Requirements:
- 7+ years of experience engineering complex, enterprise-grade frontend applications or open-source software.
- World-class mastery of TypeScript, Next.js App Router, React, and modern browser APIs.
- Deep familiarity with SQL and PostgreSQL data modeling concepts.
- Proven experience architecting large frontend codebases, monorepos (Turborepo), and reusable UI design systems.
- Exceptional written technical communication and open-source collaboration skills.

Nice to Have:
- Active open-source maintainership experience.
- Experience with WebAssembly, virtualized tables, or code editor integrations (Monaco / CodeMirror).`,
    requiredSkills: ["Next.js", "React", "TypeScript", "Tailwind CSS", "PostgreSQL", "SQL", "Open Source", "Performance Optimization"],
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
    description: `About Airbnb:
Airbnb was born in 2007 and has grown to 5 million hosts who have welcomed over 1.5 billion guests across almost every country on earth. Every day, hosts offer unique stays and experiences that make it possible for guests to connect with communities in a more authentic way.

About the Payments Infrastructure Team:
Our Payments Infrastructure team is responsible for moving tens of billions of dollars each year across 70+ payment methods and 190+ countries. We engineer distributed, mission-critical ledger systems, settlement pipelines, currency conversion engines, and payout services where zero data loss, strict transactional consistency, and five-nines availability are paramount.

Key Responsibilities:
- Design, implement, and maintain high-throughput, fault-tolerant financial microservices in Java and Kotlin.
- Architect idempotent transaction pipelines and state machines ensuring exact-once execution across distributed systems.
- Ensure strict transactional integrity and double-entry ledger bookkeeping across multi-region datastores.
- Partner with infrastructure and data engineering teams to scale Apache Kafka event streams and MySQL / DynamoDB clusters.
- Build comprehensive telemetry, automated tracing, and alerting to proactively detect settlement discrepancies or anomalies.
- Participate in on-call rotations, disaster recovery testing, and post-mortem investigations.

Requirements:
- 5+ years of software engineering experience building distributed backend systems or financial platforms.
- Deep proficiency in modern Java or Kotlin, including concurrency models and garbage collection profiling.
- Strong knowledge of relational database design, ACID transactions, distributed locking, and schema migrations.
- Experience building event-driven architectures with Apache Kafka, RabbitMQ, or Amazon SQS.
- Strong problem-solving skills, architectural rigor, and attention to detail.

Nice to Have:
- Prior experience in fintech, payment gateways, banking ledgers, or high-volume e-commerce.
- Knowledge of service mesh architectures (Envoy, gRPC) and container orchestration.`,
    requiredSkills: ["Java", "Kotlin", "Kafka", "SQL", "Distributed Systems", "Microservices", "REST APIs", "gRPC", "CI/CD"],
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
    description: `About Linear:
Linear is a purposeful issue tracking and project management tool built for high-performance software teams. Linear is built from the ground up to feel ridiculously fast, fluid, and keyboard-centric, replacing legacy enterprise project management with modern craftsmanship.

The Role:
As a Senior Product Engineer on the Workflow & Automations squad, you will craft the features that keep software teams moving fast without administrative burden. You will design, build, and polish features spanning custom project workflows, GitHub/GitLab integrations, triage rules, and automation engines.

What We Value:
- Exceptional product taste: You care deeply about UI/UX craft, typography, 60fps animations, and tactile feedback.
- Client-first synchronization: You understand how to build local-first applications using IndexedDB, WebSockets, and optimistic client mutations.
- Autonomous ownership: You work comfortably in a compact, highly focused product engineering team without bureaucratic process.
- End-to-end impact: You work from initial design idea to production deployment and user analytics.

Required Skills & Background:
- 4+ years of product engineering experience shipping consumer or developer web applications.
- Deep familiarity with React, TypeScript, GraphQL, and modern CSS/styling techniques.
- Experience with real-time bidirectional communication using WebSockets and client-side database caching.
- Strong intuition for user workflows and ability to simplify complex interactions.

Nice to Have:
- Experience building keyboard-driven navigation systems or rich text editors.
- Prior experience working in high-growth, design-led startups.`,
    requiredSkills: ["React", "TypeScript", "WebSockets", "CSS Animations", "UI/UX Design", "GraphQL", "Performance Optimization"],
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
    description: `About Apple:
At Apple, new ideas have a way of becoming extraordinary products, services, and customer experiences very quickly. Bring passion and dedication to your job and there's no telling what you could accomplish.

About the Team:
Apple's Core OS and Hardware Engineering organizations build the foundations of macOS, iOS, watchOS, and visionOS. Our Tools & Automation squad develops the automated continuous qualification infrastructure, telemetry pipelines, and diagnostic suites that ensure flawless hardware-software interoperability before global manufacturing ramp.

Key Responsibilities:
- Design, implement, and maintain automated test harnesses in Python, Swift, and Bash to qualify firmware and operating system builds.
- Build continuous integration and deployment pipelines using GitHub Actions, Jenkins, and internal Apple build grids.
- Partner directly with hardware design engineers and firmware architects to diagnose subtle regression failures.
- Implement real-time telemetry dashboards and metric alerts tracking build pass rates and hardware performance benchmarks.
- Author robust unit tests, automated stress tests, and API validation suites for macOS and iOS system frameworks.

Basic Qualifications:
- Bachelor's or Master's degree in Computer Science, Computer Engineering, Electrical Engineering, or equivalent practical experience (0-2 years).
- Strong programming skills in Python, Swift, C++, or JavaScript.
- Experience with Unix/Linux shell scripting, terminal utilities, and Git version control.
- Solid understanding of software testing concepts (unit, integration, regression, and endurance testing).
- Exceptional curiosity and passion for software quality and consumer electronics.

Preferred Qualifications:
- Prior experience with macOS/iOS development (Xcode, Instruments, XCTest).
- Familiarity with continuous integration infrastructure and automated hardware-in-the-loop testing.`,
    requiredSkills: ["Python", "Swift", "C++", "CI/CD", "Git", "Bash", "Linux", "Automated Testing"],
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
    description: `About Palantir:
Palantir builds software that empowers organizations to effectively integrate their data, decisions, and operations. Our flagship platforms—Foundry, Gotham, and AIP—are deployed across defense, intelligence, healthcare, automotive, and commercial enterprises facing high-stakes operational challenges.

The Role:
Forward Deployed Software Engineers (FDSE) operate on the front lines with our most critical customers. You are part software architect, part systems engineer, and part mission strategist. You will embed with customer operational leaders to architect distributed data pipelines, define semantic ontology models, and build mission-critical analytical workflows directly on top of Palantir Foundry and AIP.

What You'll Do:
- Architect, build, and deploy distributed data pipelines, ontology models, and operational applications solving real-world customer problems.
- Write robust, modular code across backend data layers (Java, Python, Spark) and frontend mission interfaces (TypeScript, React).
- Deploy and configure enterprise software in air-gapped, government-classified, and specialized private cloud environments.
- Build LLM and AI agent workflows grounded in customer enterprise data using Palantir AIP.
- Partner with product engineers to translate battlefield and operational learnings into core platform enhancements.
- Own system stability, end-to-end data integrity, and strict access-control governance (RBAC/ABAC).

Requirements:
- 5+ years of software engineering experience building scalable backend services or distributed data processing pipelines.
- Strong proficiency in Java, Python, or Go, paired with modern frontend proficiency in TypeScript and React.
- Demonstrated experience with distributed databases, SQL, Apache Spark, or big data processing architectures.
- High degree of autonomy, technical leadership, and ability to navigate ambiguous customer environments.
- Willingness to work on-site with customers and undergo government security clearance vetting where applicable.

Nice to Have:
- Experience deploying AI/LLM applications, RAG pipelines, or autonomous agent frameworks.
- Prior experience working with defense, aerospace, or healthcare datasets.`,
    requiredSkills: ["Java", "Python", "TypeScript", "React", "PostgreSQL", "Distributed Systems", "Apache Spark", "Security", "CI/CD"],
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
    description: `About Airbnb:
Airbnb connects millions of guests with hosts in almost every corner of the world. Our mission is to create a world where anyone can belong anywhere.

About the Role:
We are seeking an experienced Senior Product Manager to lead our Guest Discovery and Search Experience. In this role, you will define the multi-year vision, product strategy, and execution roadmap for how hundreds of millions of travelers search, filter, discover, and book unique accommodations worldwide.

Responsibilities:
- Define product vision, customer journey maps, and detailed PRDs for personalized search ranking, map-based discovery, and category recommendations.
- Partner with machine learning researchers, data scientists, and engineering leaders to deploy state-of-the-art personalization algorithms.
- Run rigorous high-velocity A/B experiments and multivariate tests across web and mobile platforms to optimize booking conversion and guest retention.
- Conduct regular qualitative user research interviews and usability sessions to uncover traveler pain points.
- Align cross-functional stakeholders—including design, legal, localization, and customer support—around product launches.
- Establish north star metrics, OKRs, and executive dashboards reporting product impact directly to VP and C-level leadership.

Qualifications:
- 5+ years of product management experience shipping consumer-facing mobile and web applications at scale.
- Strong analytical chops, SQL proficiency, and expertise in experimental design and hypothesis testing.
- Proven track record of shipping complex, data-informed features that drove measurable business growth.
- Superb communication, stakeholder management, and product storytelling capabilities.
- Deep empathy for user experience and visual design craftsmanship.

Nice to Have:
- Experience with travel, marketplace, or e-commerce platforms.
- Background in computer science, statistics, or HCI.`,
    requiredSkills: ["Product Strategy", "A/B Testing", "SQL", "User Research", "Roadmapping", "Data Analysis", "Experimentation", "Growth"],
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
    description: `About Linear:
Linear is building the next standard for modern software engineering tools. We build products designed with care, speed, and craftsmanship.

The Role:
As a Product Manager for Developer Workflows at Linear, you will craft the tools that empower tens of thousands of engineering squads to ship high-quality software faster. You will own the core developer loop—including git branch automations, pull request syncing, release cycle management, and issue tracking integrations.

Responsibilities:
- Deeply understand software development rituals, git workflows, issue triage, and developer pain points.
- Collaborate closely with software engineers and designers to sculpt tight, keyboard-first, zero-latency workflows.
- Write concise, clear, and unambiguous product specifications that prioritize speed of iteration over administrative overhead.
- Engage with engineering leaders in our customer community to gather feedback and identify high-leverage product opportunities.
- Monitor feature adoption and usage metrics using privacy-conscious telemetry.

Qualifications:
- 3+ years of product management experience at high-velocity tech companies or developer tooling companies.
- Strong technical literacy: You understand modern software engineering lifecycles, Git, CI/CD, and REST/GraphQL APIs.
- Deep passion for minimalist, fluid user interfaces and exceptional tool craftsmanship.
- Ability to make decisive product calls grounded in intuition and qualitative customer insights.

Nice to Have:
- Prior experience as a software engineer or developer advocate.
- Experience with open-source communities or developer platform ecosystems.`,
    requiredSkills: ["Product Management", "Developer Experience", "UX Design", "Agile", "Roadmapping", "Git Workflows", "API Design"],
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
    description: `About Spotify:
Spotify transformed music listening forever when it launched in 2008. Today, we are the world's most popular audio streaming subscription service with over 600 million users across 180 markets.

About the Personalization Mission:
Our Personalization Mission matches every listener with audio content they will love. We build the machine learning models, sequential recommendation algorithms, and reinforcement learning systems behind Discover Weekly, Release Radar, Daily Mix, and the Spotify Home feed.

What You'll Do:
- Design, prototype, and train recommendation models, collaborative filtering algorithms, and graph embedding models in Python and PyTorch.
- Run large-scale offline model evaluations and online randomized controlled trials (A/B testing) with millions of listeners.
- Partner with product managers and backend engineers to deploy low-latency inference pipelines and feature stores.
- Analyze massive streaming telemetry datasets using BigQuery, Apache Spark, and SQL.
- Communicate experimental findings, model trade-offs, and algorithmic insights to cross-functional teams.

Requirements:
- 3-6 years of experience applying machine learning, statistical modeling, or recommendation systems in production environments.
- Strong proficiency in Python, SQL, and data science libraries (PyTorch, TensorFlow, scikit-learn, Pandas, NumPy).
- Experience processing large-scale datasets with Apache Spark, BigQuery, or Databricks.
- Deep understanding of causal inference, experimental design, and A/B test power analysis.
- Strong communication skills and enthusiasm for music, podcasting, and audio culture.

Nice to Have:
- Publications or contributions in RecSys, KDD, NeurIPS, or ICML.
- Experience with real-time vector search and approximate nearest neighbor (ANN) indexing.`,
    requiredSkills: ["Python", "Machine Learning", "SQL", "Statistics", "A/B Testing", "Spark", "PyTorch", "BigQuery"],
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
    description: `About Scale AI:
Scale AI provides the data infrastructure powering the world's most advanced frontier AI models. From generative AI fine-tuning to autonomous vehicle data labeling, Scale transforms raw data into actionable ground truth.

The Role:
As a Business Intelligence & Data Analyst at Scale, you will serve as the analytical engine behind our enterprise AI labeling pipelines and go-to-market decisions. You will model operational throughput, analyze unit economics, and build executive reporting dashboards.

What You'll Do:
- Write complex, optimized SQL queries and dbt transformations to model operational throughput and financial metrics.
- Build clean, real-time executive dashboards in Metabase, Tableau, and Hex tracking platform SLAs and margin efficiency.
- Conduct exploratory data analysis using Python (Pandas/Seaborn) to identify workflow bottlenecks and contractor quality trends.
- Partner with operations managers, product leaders, and finance executives to translate business questions into quantitative insights.
- Automate data validation checks and anomaly alerts to ensure high fidelity across analytical tables.

Requirements:
- 1-3 years of experience in data analytics, business intelligence, or consulting.
- Advanced SQL proficiency (window functions, CTEs, query plan optimization).
- Hands-on experience with BI visualization tools (Tableau, Metabase, PowerBI, or Looker).
- Practical experience using Python or R for exploratory data analysis and automation.
- Strong business acumen and the ability to synthesize data into actionable recommendations for leadership.

Nice to Have:
- Experience with dbt (data build tool), Snowflake, or BigQuery.
- Familiarity with AI/ML evaluation metrics and human-in-the-loop data labeling.`,
    requiredSkills: ["SQL", "Data Analysis", "Tableau", "Python", "Metabase", "dbt", "Business Intelligence", "Snowflake"],
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
    description: `About Figma:
Figma is the collaborative interface design platform where teams create together in real time. We believe design should be open, accessible, and collaborative.

About the Core Systems Design Team:
Our team is responsible for the bedrock design patterns and canvas manipulation tools of Figma. We design the toolbars, inspector properties, color systems, vector networks, and auto-layout primitives that millions of designers, developers, and product creators interact with every day.

What You'll Do:
- Design intuitive workflows, tool palettes, and interaction models for complex canvas and prototyping tools.
- Prototype micro-interactions, spring physics, and keyboard shortcuts using Figma, Principle, or code (React/TypeScript).
- Work directly with product managers and graphics engineers from initial discovery and user testing through final release.
- Evolve Figma's internal design system, maintaining high visual craft, typographic harmony, and dark/light mode parity.
- Conduct in-depth qualitative user research interviews and design critique sessions with the global design community.

Requirements:
- 4+ years of product design and UX experience shipping complex desktop or web software.
- World-class visual design craft, systems thinking, typography, and interactive prototyping skills.
- Demonstrated ability to simplify complex technical systems into intuitive, joyful user experiences.
- Strong collaboration and communication skills, with experience articulating design trade-offs to engineers and leaders.

Nice to Have:
- Frontend coding experience (HTML/CSS/React/TypeScript).
- Prior experience designing creative tools, 3D software, or developer environments.`,
    requiredSkills: ["Product Design", "Figma", "UI/UX Design", "Design Systems", "Prototyping", "User Research", "Interaction Design"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=Product+Designer+Core+Systems+Figma",
    applyUrl: "https://www.linkedin.com/jobs/search/?keywords=Product+Designer+Core+Systems+Figma",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 34).toISOString(),
    isFeatured: true
  }
];

