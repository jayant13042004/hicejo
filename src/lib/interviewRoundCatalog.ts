/**
 * Centralized catalog of role categories, company-specific hiring loop patterns,
 * and dynamic interview round options for Hicejo Mock Interview Studio.
 */

export type RoleCategory =
  | "software-engineering"
  | "data-science-ai"
  | "data-analytics"
  | "product-management"
  | "ui-ux-design"
  | "consulting-strategy"
  | "finance-banking"
  | "sales-bd"
  | "marketing-growth"
  | "hr-people"
  | "general";

export interface InterviewRoundOption {
  id: string;
  label: string;
  tag: string;
  desc: string;
  category: "full" | "technical" | "system_design" | "managerial" | "behavioral" | "case_study" | "domain";
  focusDirective?: string;
}

/**
 * Detect the professional discipline/category of a given target role title.
 */
export function detectRoleCategory(roleTitle: string): RoleCategory {
  const r = (roleTitle || "").toLowerCase().trim();
  if (!r) return "software-engineering";

  // 1. Software Engineering & Systems
  // Matches SDE, SWE, SDET, Software Engineer, Full Stack, Backend, Frontend, DevOps, etc.
  if (
    /\b(sde|swe|sdet|software|developer|frontend|front-end|backend|back-end|fullstack|full-stack|full stack|devops|sre|cloud engineer|platform engineer|systems engineer|mobile engineer|ios|android|embedded|firmware|qa engineer|automation engineer|programmer|coder|system architect|software architect|tech lead)\b/i.test(r) ||
    r === "sde" || r.startsWith("sde ") || r.startsWith("sde-") || r.startsWith("sde_") ||
    r === "swe" || r.startsWith("swe ") || r.startsWith("swe-") || r.startsWith("swe_")
  ) {
    return "software-engineering";
  }

  // 2. Data Science, Machine Learning & AI
  if (
    /\b(data scien|machine learning|ml engineer|ai engineer|deep learning|nlp|computer vision|artificial intelligence|research scientist|mlops|ai researcher|llm engineer|generative ai)\b/i.test(r)
  ) {
    return "data-science-ai";
  }

  // 3. Data Analytics & Business Intelligence
  if (
    /\b(data analyst|business intelligence|bi analyst|bi engineer|analytics engineer|data analytics|reporting analyst|insights analyst|sql analyst)\b/i.test(r)
  ) {
    return "data-analytics";
  }

  // 4. Product Management
  if (
    /\b(product manager|product management|pm|apm|tpm|technical product manager|group product manager|gpm|director of product|vp of product|product lead|associate product manager)\b/i.test(r) ||
    r === "pm" || r === "apm" || r === "tpm"
  ) {
    return "product-management";
  }

  // 5. Design & User Experience
  if (
    /\b(designer|ui\/ux|ux designer|ui designer|product designer|interaction designer|ux researcher|visual designer|graphic designer|design lead)\b/i.test(r)
  ) {
    return "ui-ux-design";
  }

  // 6. Consulting & Strategy
  if (
    /\b(consultant|consulting|strategy|business analyst|bizops|business operations|management consultant|operations manager|strategy analyst|chief of staff)\b/i.test(r)
  ) {
    return "consulting-strategy";
  }

  // 7. Finance & Accounting
  if (
    /\b(finance|financial|investment banking|private equity|venture capital|accounting|accountant|fp&a|valuation|equity research|portfolio manager|audit|treasury)\b/i.test(r)
  ) {
    return "finance-banking";
  }

  // 8. Sales & Business Development
  if (
    /\b(sales|account executive|sdr|bdr|business development|commercial|enterprise sales|inside sales|sales manager|client executive|sales director)\b/i.test(r)
  ) {
    return "sales-bd";
  }

  // 9. Marketing & Growth
  if (
    /\b(marketing|growth|growth marketer|product marketing|pmm|seo|content marketing|digital marketing|brand manager|copywriter|social media manager)\b/i.test(r)
  ) {
    return "marketing-growth";
  }

  // 10. HR & Talent Acquisition
  if (
    /\b(hr|human resources|recruiter|talent acquisition|sourcer|people ops|people operations|hrbp|talent partner|head of people)\b/i.test(r)
  ) {
    return "hr-people";
  }

  return "general";
}

/**
 * Backward compatibility helper for legacy code checks.
 */
export function isTechnicalRole(role: string): boolean {
  const cat = detectRoleCategory(role);
  return (
    cat === "software-engineering" ||
    cat === "data-science-ai" ||
    cat === "data-analytics"
  );
}

/**
 * Normalize and recognize top employer brands.
 */
export function normalizeCompany(company: string): string {
  const c = (company || "").trim();
  const lower = c.toLowerCase();

  if (!lower) return "";
  if (lower.includes("google") || lower.includes("alphabet")) return "Google";
  if (lower.includes("amazon") || lower.includes("aws")) return "Amazon";
  if (lower.includes("meta") || lower.includes("facebook") || lower.includes("instagram")) return "Meta";
  if (lower.includes("microsoft") || lower.includes("azure")) return "Microsoft";
  if (lower.includes("apple")) return "Apple";
  if (lower.includes("netflix")) return "Netflix";
  if (lower.includes("uber")) return "Uber";
  if (lower.includes("stripe")) return "Stripe";
  if (lower.includes("scale ai") || lower === "scale") return "Scale AI";
  if (lower.includes("mckinsey")) return "McKinsey";
  if (lower.includes("bcg") || lower.includes("boston consulting")) return "BCG";
  if (lower.includes("bain")) return "Bain";
  if (lower.includes("goldman")) return "Goldman Sachs";
  if (lower.includes("morgan stanley")) return "Morgan Stanley";
  if (lower.includes("jpmorgan") || lower.includes("jp morgan") || lower.includes("chase")) return "JPMorgan";
  if (lower.includes("airbnb")) return "Airbnb";
  if (lower.includes("databricks")) return "Databricks";
  if (lower.includes("startup") || lower.includes("yc")) return "High-Growth Startup";

  return c;
}

/**
 * Get accurate, highly targeted interview rounds specific to the role and company.
 */
export function getInterviewRoundsForRoleAndCompany(
  roleInput: string,
  companyInput?: string
): InterviewRoundOption[] {
  const category = detectRoleCategory(roleInput);
  const company = normalizeCompany(companyInput || "");
  const roleTitle = (roleInput || "Software Engineer").trim();
  const companyLabel = company ? `${company} ` : "";

  // =========================================================================
  // 1. SOFTWARE ENGINEERING / SDE / SWE TRACK
  // =========================================================================
  if (category === "software-engineering") {
    // 1A. Google Software Engineering
    if (company === "Google") {
      return [
        {
          id: "full_loop",
          label: "Google Full Hiring Loop",
          tag: "All 4-5 Stages",
          desc: "Complete Google on-site simulation: 2 coding rounds, system design, and Googleyness & Leadership.",
          category: "full"
        },
        {
          id: "technical",
          label: "Technical Round 1: DSA & Algorithms",
          tag: "Google Bar",
          desc: "Google-caliber algorithmic problem solving: trees, graphs, dynamic programming, complexity, clean recursion, zero library crutches.",
          category: "technical",
          focusDirective: "STRICT GOOGLE TECHNICAL ROUND 1: Focus purely on data structures, algorithmic optimality, big-O time/space complexity, and clean code logic without library shortcuts."
        },
        {
          id: "coding_2",
          label: "Technical Round 2: Advanced Coding",
          tag: "Code Rigor",
          desc: "Complex data structures, multi-threading, concurrency, memory limits, and rigorous test-case reasoning under pressure.",
          category: "technical",
          focusDirective: "STRICT GOOGLE TECHNICAL ROUND 2: Focus on advanced algorithmic design, concurrency, edge cases, and bug-free execution under pressure."
        },
        {
          id: "system_design",
          label: "System Design & Distributed Infrastructure",
          tag: "Google Scale",
          desc: "Google-scale distributed infrastructure: Bigtable/Spanner patterns, sharding, RPCs, caching, high throughput, and fault tolerance.",
          category: "system_design",
          focusDirective: "STRICT GOOGLE SYSTEM DESIGN ROUND: Distributed systems architecture, global multi-region consistency, high availability, RPCs, and fault tolerance."
        },
        {
          id: "managerial",
          label: "Managerial & Engineering Lead",
          tag: "Leadership",
          desc: "Sprint delivery under pressure, handling technical deadlocks, architectural trade-offs, and cross-functional leadership.",
          category: "managerial",
          focusDirective: "STRICT MANAGERIAL ROUND: Technical decision-making under ambiguity, engineering delivery, resolving architectural deadlocks, and mentoring."
        },
        {
          id: "behavioral",
          label: "Googleyness & Leadership",
          tag: "STAR Stories",
          desc: "Thriving in ambiguity, collaborative bias-to-action, intellectual humility, doing the right thing, and core Google values.",
          category: "behavioral",
          focusDirective: "STRICT GOOGLEYNESS & BEHAVIORAL ROUND: STAR format evaluation of navigating ambiguity, doing the right thing, intellectual humility, and values alignment."
        }
      ];
    }

    // 1B. Amazon Software Engineering
    if (company === "Amazon") {
      return [
        {
          id: "full_loop",
          label: "Amazon Full Hiring Loop",
          tag: "All Stages",
          desc: "Complete Amazon on-site loop: coding rounds, low-level design, high-level architecture, and the dedicated Bar Raiser.",
          category: "full"
        },
        {
          id: "technical",
          label: "Technical Round 1: Data Structures & Algorithms",
          tag: "Pure Coding",
          desc: "Algorithmic efficiency, time/space complexity optimization, edge cases, and bug-free implementation.",
          category: "technical",
          focusDirective: "STRICT AMAZON CODING ROUND 1: Algorithmic problem solving, clean syntax, optimal time/space complexity, and boundary condition validation."
        },
        {
          id: "coding_2",
          label: "Technical Round 2: Low-Level (LLD) / OOP",
          tag: "Clean OOP",
          desc: "Extensible object-oriented design, SOLID principles, design patterns, clean abstractions, and maintainable modular architecture.",
          category: "technical",
          focusDirective: "STRICT LOW-LEVEL DESIGN (LLD) ROUND: Object-oriented programming, design patterns, class modeling, SOLID principles, and clean modular code."
        },
        {
          id: "system_design",
          label: "System Architecture (HLD)",
          tag: "AWS Scale",
          desc: "Distributed microservices, asynchronous messaging, DynamoDB, high availability, and operational excellence.",
          category: "system_design",
          focusDirective: "STRICT HIGH-LEVEL DESIGN (HLD) ROUND: Scalable cloud architecture, microservices, decoupling with queues, NoSQL vs SQL, and operational excellence."
        },
        {
          id: "managerial",
          label: "Managerial & Technical Delivery",
          tag: "Deliver Results",
          desc: "Delivering under tight deadlines, managing technical debt, engineering velocity, and technical ownership.",
          category: "managerial",
          focusDirective: "STRICT MANAGERIAL ROUND: Engineering ownership, managing technical debt, delivery under pressure, and prioritizing features vs stability."
        },
        {
          id: "behavioral",
          label: "Bar Raiser & 16 Leadership Principles",
          tag: "Amazon LPs",
          desc: "Deep STAR probe against Customer Obsession, Ownership, Bias for Action, Dive Deep, and Have Backbone.",
          category: "behavioral",
          focusDirective: "STRICT AMAZON BAR RAISER ROUND: Relentless STAR questioning probing Customer Obsession, Ownership, Bias for Action, and Have Backbone."
        }
      ];
    }

    // 1C. Meta Software Engineering
    if (company === "Meta") {
      return [
        {
          id: "full_loop",
          label: "Meta Full Hiring Loop",
          tag: "All Stages",
          desc: "Fast-paced coding sprints, large-scale system design, and collaborative engineering behavioral evaluation.",
          category: "full"
        },
        {
          id: "technical",
          label: "Technical Round 1: Rapid DSA & Coding",
          tag: "Speed & Logic",
          desc: "Fast, bug-free algorithmic coding on LeetCode-medium/hard graphs, trees, dynamic programming, and binary search.",
          category: "technical",
          focusDirective: "STRICT META RAPID CODING ROUND 1: Speed, algorithmic precision, bug-free implementation, and rapid test verification."
        },
        {
          id: "coding_2",
          label: "Technical Round 2: Core Data Structures",
          tag: "Code Execution",
          desc: "Algorithmic complexity, space optimization, edge case dry-running, and modular code hygiene.",
          category: "technical",
          focusDirective: "STRICT META CODING ROUND 2: Advanced data structures, dry-running edge cases, and clean algorithmic execution."
        },
        {
          id: "system_design",
          label: "System Design: Feeds & Scalability",
          tag: "Meta Scale",
          desc: "High-concurrency social feeds, distributed caching layers, rate limiting, and real-time event streaming.",
          category: "system_design",
          focusDirective: "STRICT SYSTEM DESIGN ROUND: Massive user concurrency, feed generation, distributed caching, pub-sub architectures, and low-latency delivery."
        },
        {
          id: "managerial",
          label: "Managerial & Team Velocity",
          tag: "Leadership",
          desc: "Unblocking cross-functional bottlenecks, leading technical initiatives, and balancing speed with long-term quality.",
          category: "managerial",
          focusDirective: "STRICT MANAGERIAL ROUND: Fast iteration, resolving technical friction, leading high-velocity engineering, and cross-functional unblocking."
        },
        {
          id: "behavioral",
          label: "Behavioral & Culture (Move Fast)",
          tag: "STAR Stories",
          desc: "Demonstrating bold impact, resolving engineering conflicts, open communication, and alignment with Meta tenets.",
          category: "behavioral",
          focusDirective: "STRICT BEHAVIORAL ROUND: STAR format questions assessing bold impact, direct constructive conflict resolution, and moving fast."
        }
      ];
    }

    // 1D. Microsoft Software Engineering
    if (company === "Microsoft") {
      return [
        {
          id: "full_loop",
          label: "Microsoft Full Hiring Loop",
          tag: "All Stages",
          desc: "Technical depth, collaborative design, production resilience, and As-Appropriate partner evaluation.",
          category: "full"
        },
        {
          id: "technical",
          label: "Technical Round 1: Algorithms & Coding",
          tag: "DSA Foundations",
          desc: "Core data structures, clean code, algorithmic problem-solving, and time/space complexity.",
          category: "technical"
        },
        {
          id: "coding_2",
          label: "Technical Round 2: Design & Code Quality",
          tag: "Clean Architecture",
          desc: "Clean code architecture, unit testing, error resilience, debugging, and production readiness.",
          category: "technical"
        },
        {
          id: "system_design",
          label: "System Design & Azure Scale",
          tag: "Cloud Architecture",
          desc: "Azure-scale microservices, cloud patterns, scalability, security boundaries, and data partitioning.",
          category: "system_design"
        },
        {
          id: "managerial",
          label: "Managerial & Engineering Leadership",
          tag: "Leadership",
          desc: "Mentoring engineers, cross-functional collaboration, technical decision-making, and roadmaps.",
          category: "managerial"
        },
        {
          id: "behavioral",
          label: "As-Appropriate (AA) / Partner Round",
          tag: "Growth Mindset",
          desc: "Senior Director / Partner evaluation on growth mindset, customer empathy, technical vision, and cultural impact.",
          category: "behavioral"
        }
      ];
    }

    // 1E. General or other Company Software Engineering (e.g. Scale AI, Stripe, Netflix, Startups, etc.)
    return [
      {
        id: "full_loop",
        label: `${companyLabel}Full Hiring Loop`,
        tag: "All Stages",
        desc: `Multi-round sequence simulating the complete hiring pipeline${company ? ` at ${company}` : ""} from technical coding to final culture round.`,
        category: "full"
      },
      {
        id: "technical",
        label: "Technical Round 1: DSA & Problem Solving",
        tag: company ? `${company} Bar` : "Pure Coding",
        desc: `Algorithms, data structures, code reasoning, space/time complexity, and rigorous problem-solving${company ? ` for ${company}` : ""}.`,
        category: "technical",
        focusDirective: "STRICT TECHNICAL ROUND 1: Problem solving, data structures, algorithmic complexity, and clean code logic."
      },
      {
        id: "coding_2",
        label: "Technical Round 2: Architecture & LLD",
        tag: "Clean Code",
        desc: "Modular code design, OOP principles, design patterns, maintainability, and practical code execution.",
        category: "technical",
        focusDirective: "STRICT LOW-LEVEL DESIGN (LLD) ROUND: Modular code architecture, OOP design patterns, clean interfaces, and unit testability."
      },
      {
        id: "system_design",
        label: "Technical Round 3: System Design",
        tag: "Scalability",
        desc: `Distributed systems, scalability bottlenecks, caching, database partitioning, and fault tolerance${company ? ` at ${company}` : ""}.`,
        category: "system_design",
        focusDirective: "STRICT SYSTEM DESIGN ROUND: Scalable architecture, microservice boundaries, caching, database partitioning, and high availability."
      },
      {
        id: "managerial",
        label: "Managerial & Engineering Lead",
        tag: "Leadership",
        desc: "Sprint delivery under pressure, handling technical deadlocks, team mentoring, and cross-functional leadership.",
        category: "managerial",
        focusDirective: "STRICT MANAGERIAL ROUND: Engineering leadership, managing technical debt, sprint delivery, and unblocking engineers."
      },
      {
        id: "behavioral",
        label: "HR & Culture Alignment (STAR)",
        tag: company ? `${company} Values` : "STAR Stories",
        desc: `Behavioral delivery, personal ownership, culture fit, conflict resolution, and values alignment${company ? ` at ${company}` : ""}.`,
        category: "behavioral",
        focusDirective: "STRICT BEHAVIORAL ROUND: STAR format questions evaluating past impact, conflict resolution, ownership, and cultural alignment."
      }
    ];
  }

  // =========================================================================
  // 2. PRODUCT MANAGEMENT (PM / APM / TPM)
  // =========================================================================
  if (category === "product-management") {
    return [
      {
        id: "full_loop",
        label: `${companyLabel}Complete PM Loop`,
        tag: "All Stages",
        desc: `Comprehensive PM interview loop${company ? ` at ${company}` : ""}: product sense, execution metrics, strategy, and leadership.`,
        category: "full"
      },
      {
        id: "technical",
        label: "Product Sense & User Journey",
        tag: "Product Sense",
        desc: "Designing 10x products from first principles: user journeys, unmet needs, pain points, and wireframing.",
        category: "case_study",
        focusDirective: "STRICT PRODUCT SENSE ROUND: Product vision, user segmentation, identifying unmet pain points, feature prioritization, and user journey design."
      },
      {
        id: "system_design",
        label: "Analytical Execution & Metrics",
        tag: "A/B Testing",
        desc: "North Star metrics, conversion funnels, root-cause diagnosis, A/B testing trade-offs, and data-driven prioritization.",
        category: "case_study",
        focusDirective: "STRICT PRODUCT EXECUTION & METRICS ROUND: Metric definition, A/B test analysis, root-cause diagnosis of metric drops, and trade-off decisions."
      },
      {
        id: "coding_2",
        label: "Product Strategy & Go-To-Market",
        tag: "Strategy",
        desc: "Competitive positioning, market sizing, monetization, ecosystem dynamics, and long-term defensibility.",
        category: "domain",
        focusDirective: "STRICT PRODUCT STRATEGY ROUND: Market entry, monetization models, competitive moats, and platform ecosystem dynamics."
      },
      {
        id: "managerial",
        label: "Leadership & Stakeholder Alignment",
        tag: "Influence",
        desc: "Leading without authority, resolving engineering-design deadlocks, executive alignment, and customer empathy.",
        category: "managerial",
        focusDirective: "STRICT PM LEADERSHIP ROUND: Influencing without authority, resolving engineering-design deadlocks, and executive stakeholder alignment."
      },
      {
        id: "behavioral",
        label: "Behavioral & Culture Fit (STAR)",
        tag: company ? `${company} Values` : "STAR Stories",
        desc: `High-stakes delivery, navigating product failures, customer obsession, and values alignment${company ? ` at ${company}` : ""}.`,
        category: "behavioral",
        focusDirective: "STRICT BEHAVIORAL ROUND: STAR format questions probing handling product failures, customer obsession, and conflict resolution."
      }
    ];
  }

  // =========================================================================
  // 3. DATA ANALYTICS & BUSINESS INTELLIGENCE
  // =========================================================================
  if (category === "data-analytics") {
    return [
      {
        id: "full_loop",
        label: `${companyLabel}Complete Analytics Loop`,
        tag: "All Stages",
        desc: `Simulates the full analytics hiring pipeline${company ? ` at ${company}` : ""}: SQL coding, metrics case, dashboarding, and stakeholder communication.`,
        category: "full"
      },
      {
        id: "technical",
        label: "Technical Round 1: Advanced SQL & Wrangling",
        tag: "Pure SQL",
        desc: "Complex joins, window functions, CTEs, aggregation rollups, query performance tuning, and schema design.",
        category: "technical",
        focusDirective: "STRICT SQL TECHNICAL ROUND: Advanced SQL queries, window functions, complex joins, CTEs, query optimization, and schema design."
      },
      {
        id: "system_design",
        label: "Technical Round 2: Metrics & Business Case",
        tag: "Metrics Case",
        desc: "Diagnosing metric drops, cohort retention, funnel conversion, user segmentation, and root-cause analysis.",
        category: "case_study",
        focusDirective: "STRICT ANALYTICS CASE ROUND: Investigating metric drops, cohort retention analysis, conversion funnels, and data-driven business recommendations."
      },
      {
        id: "coding_2",
        label: "Dashboarding & Metric Architecture",
        tag: "KPI Design",
        desc: "Designing intuitive executive dashboards, data hygiene, metric definitions, and reporting pipelines.",
        category: "domain",
        focusDirective: "STRICT DASHBOARDING & KPI ROUND: Dashboard visual hierarchy, data modeling for reporting, establishing reliable data sources, and SLA tracking."
      },
      {
        id: "managerial",
        label: "Stakeholder Communication & Influence",
        tag: "Business Impact",
        desc: "Translating complex technical data into actionable executive insights, managing conflicting stakeholder requests.",
        category: "managerial",
        focusDirective: "STRICT STAKEHOLDER ROUND: Communicating insights to non-technical leaders, pushing back on misleading data interpretations, and prioritization."
      },
      {
        id: "behavioral",
        label: "HR & Culture (STAR)",
        tag: company ? `${company} Values` : "STAR Stories",
        desc: `Behavioral delivery, handling ambiguous data requests, integrity, and values alignment${company ? ` at ${company}` : ""}.`,
        category: "behavioral",
        focusDirective: "STRICT BEHAVIORAL ROUND: STAR format questions evaluating data integrity under pressure, navigating ambiguity, and teamwork."
      }
    ];
  }

  // =========================================================================
  // 4. DATA SCIENCE & MACHINE LEARNING / AI
  // =========================================================================
  if (category === "data-science-ai") {
    return [
      {
        id: "full_loop",
        label: `${companyLabel}Complete AI/ML Loop`,
        tag: "All Stages",
        desc: `Full hiring sequence${company ? ` at ${company}` : ""}: ML theory, applied coding, ML system design, and cross-functional alignment.`,
        category: "full"
      },
      {
        id: "technical",
        label: "Technical Round 1: ML Theory & Statistics",
        tag: "Math & Stats",
        desc: "Loss functions, bias-variance trade-off, regularization, hypothesis testing, probability, and optimization algorithms.",
        category: "technical",
        focusDirective: "STRICT ML THEORY ROUND: Statistical foundations, hypothesis testing, loss formulation, model trade-offs, and optimization mechanics."
      },
      {
        id: "coding_2",
        label: "Technical Round 2: Applied Python & Data Wrangling",
        tag: "Python & DSA",
        desc: "Python algorithmic coding, vectorized NumPy/Pandas data manipulation, and clean implementation.",
        category: "technical",
        focusDirective: "STRICT ML CODING ROUND: Vectorized computation, data preprocessing pipelines, algorithm implementation, and space/time efficiency."
      },
      {
        id: "system_design",
        label: "Technical Round 3: Machine Learning System Design",
        tag: "ML Systems",
        desc: "End-to-end ML architectures: feature stores, embeddings, recommendation/ranking, latency, and drift monitoring.",
        category: "system_design",
        focusDirective: "STRICT ML SYSTEM DESIGN ROUND: End-to-end production architecture: data pipelines, feature stores, inference latency, model evaluation, and drift handling."
      },
      {
        id: "managerial",
        label: "Managerial & Research Delivery",
        tag: "Project Delivery",
        desc: "Framing vague business problems into ML tasks, managing experimental risk, and cross-functional delivery.",
        category: "managerial",
        focusDirective: "STRICT MANAGERIAL ROUND: Managing uncertainty in ML projects, aligning models with business KPIs, and managing experimental timelines."
      },
      {
        id: "behavioral",
        label: "Behavioral & Culture Fit (STAR)",
        tag: company ? `${company} Values` : "STAR Stories",
        desc: `Explaining complex models to non-technical stakeholders, handling project setbacks, and culture fit${company ? ` at ${company}` : ""}.`,
        category: "behavioral",
        focusDirective: "STRICT BEHAVIORAL ROUND: STAR format questions probing stakeholder communication, ethical AI considerations, and resilience."
      }
    ];
  }

  // =========================================================================
  // 5. DESIGN & UI/UX
  // =========================================================================
  if (category === "ui-ux-design") {
    return [
      {
        id: "full_loop",
        label: `${companyLabel}Complete Design Loop`,
        tag: "All Stages",
        desc: `Full design hiring loop${company ? ` at ${company}` : ""}: portfolio deep dive, whiteboard challenge, design systems, and cross-functional critique.`,
        category: "full"
      },
      {
        id: "technical",
        label: "Portfolio Deep Dive & Case Walkthrough",
        tag: "Design Craft",
        desc: "End-to-end design journey: research synthesis, problem framing, iterative explorations, and measured impact.",
        category: "case_study"
      },
      {
        id: "system_design",
        label: "Whiteboard Challenge & Problem Solving",
        tag: "Live Design",
        desc: "Live problem breakdown, user journey mapping, wireframing, edge case considerations, and trade-offs.",
        category: "case_study"
      },
      {
        id: "coding_2",
        label: "Design Systems, Prototyping & Craft",
        tag: "Systems & UI",
        desc: "Component architecture, typography, accessibility (WCAG), micro-interactions, and developer handoff.",
        category: "domain"
      },
      {
        id: "managerial",
        label: "Cross-Functional Collaboration",
        tag: "Alignment",
        desc: "Partnering with product and engineering, defending design decisions with data, handling feedback, and culture.",
        category: "managerial"
      },
      {
        id: "behavioral",
        label: "HR & Culture (STAR)",
        tag: company ? `${company} Values` : "STAR Stories",
        desc: `Empathy, taking constructive feedback, navigating design compromises, and values alignment${company ? ` at ${company}` : ""}.`,
        category: "behavioral"
      }
    ];
  }

  // =========================================================================
  // 6. CONSULTING & STRATEGY
  // =========================================================================
  if (category === "consulting-strategy") {
    return [
      {
        id: "full_loop",
        label: `${companyLabel}Complete Case Loop`,
        tag: "All Stages",
        desc: `Full management consulting sequence${company ? ` at ${company}` : ""}: market sizing, profitability case, market entry, and personal fit (PEI).`,
        category: "full"
      },
      {
        id: "technical",
        label: "Market Sizing & Quantitative Guesstimate",
        tag: "Mental Math",
        desc: "Structured estimation, hypothesis trees, sanity checks, and quantitative reasoning under pressure.",
        category: "case_study"
      },
      {
        id: "system_design",
        label: "Business Profitability & Case Breakdown",
        tag: "Issue Trees",
        desc: "Issue trees, MECE structuring, cost vs revenue decomposition, root cause analysis, and actionable synthesis.",
        category: "case_study"
      },
      {
        id: "coding_2",
        label: "Strategy, M&A & Market Entry",
        tag: "Strategic Framing",
        desc: "Competitive dynamics, M&A synergies, regulatory hurdles, operational risk, and executive presentation.",
        category: "domain"
      },
      {
        id: "managerial",
        label: "Stakeholder Influence & Presentation",
        tag: "Client Ready",
        desc: "Navigating resistant C-level clients, synthesizing findings under ambiguity, and managing project workstreams.",
        category: "managerial"
      },
      {
        id: "behavioral",
        label: "Personal Experience Interview (PEI / STAR)",
        tag: company ? `${company} Fit` : "STAR Stories",
        desc: `Personal impact, inclusive leadership, overcoming major obstacles, entrepreneurial drive, and firm culture${company ? ` at ${company}` : ""}.`,
        category: "behavioral"
      }
    ];
  }

  // =========================================================================
  // 7. SALES & BUSINESS DEVELOPMENT
  // =========================================================================
  if (category === "sales-bd") {
    return [
      {
        id: "full_loop",
        label: `${companyLabel}Complete Sales Loop`,
        tag: "All Stages",
        desc: `Full sales interview loop${company ? ` at ${company}` : ""}: discovery call simulation, objection handling, pipeline strategy, and culture.`,
        category: "full"
      },
      {
        id: "technical",
        label: "Discovery Call & Pitch Simulation",
        tag: "Live Pitch",
        desc: "Uncovering customer pain points, MEDDPICC qualification, active listening, and solution framing.",
        category: "case_study"
      },
      {
        id: "system_design",
        label: "Objection Handling & Commercial Negotiation",
        tag: "Negotiation",
        desc: "Navigating budget freezes, procurement roadblocks, competitive FUD, and closing win-win contracts.",
        category: "case_study"
      },
      {
        id: "coding_2",
        label: "Territory & Pipeline Strategy",
        tag: "Quota Execution",
        desc: "Territory planning, outbound multi-threading, deal velocity, pipeline coverage, and forecasting accuracy.",
        category: "domain"
      },
      {
        id: "managerial",
        label: "Sales Leadership & Collaboration",
        tag: "Leadership",
        desc: "Working with sales engineers, customer success handoffs, internal deal escalation, and mentoring.",
        category: "managerial"
      },
      {
        id: "behavioral",
        label: "Culture, Drive & Resilience (STAR)",
        tag: company ? `${company} Values` : "STAR Stories",
        desc: `Resilience after losing major deals, internal team collaboration, work ethic, and values alignment${company ? ` at ${company}` : ""}.`,
        category: "behavioral"
      }
    ];
  }

  // =========================================================================
  // 8. MARKETING & GROWTH
  // =========================================================================
  if (category === "marketing-growth") {
    return [
      {
        id: "full_loop",
        label: `${companyLabel}Complete Marketing Loop`,
        tag: "All Stages",
        desc: `Full marketing interview loop${company ? ` at ${company}` : ""}: growth funnels, campaign strategy, messaging, and cross-functional leadership.`,
        category: "full"
      },
      {
        id: "technical",
        label: "Acquisition, Growth Funnels & CAC/LTV",
        tag: "Growth Metrics",
        desc: "Channel attribution, conversion rate optimization (CRO), paid/organic mix, CAC/LTV payback, and funnel drop-offs.",
        category: "case_study"
      },
      {
        id: "system_design",
        label: "Campaign Strategy, Positioning & GTM",
        tag: "GTM Strategy",
        desc: "Product positioning, customer persona segmentation, launch playbooks, and competitive differentiation.",
        category: "domain"
      },
      {
        id: "coding_2",
        label: "Brand Narrative & Copywriting",
        tag: "Creative Craft",
        desc: "Message testing, value proposition synthesis, content flywheel design, and brand resonance.",
        category: "case_study"
      },
      {
        id: "managerial",
        label: "Cross-Functional Execution & Leadership",
        tag: "Leadership",
        desc: "Aligning product, sales, and design teams, managing agency partners, budget allocation, and sprint delivery.",
        category: "managerial"
      },
      {
        id: "behavioral",
        label: "HR & Culture (STAR)",
        tag: company ? `${company} Values` : "STAR Stories",
        desc: `Navigating underperforming campaigns, team collaboration, continuous learning, and values alignment${company ? ` at ${company}` : ""}.`,
        category: "behavioral"
      }
    ];
  }

  // =========================================================================
  // 9. FINANCE & ACCOUNTING
  // =========================================================================
  if (category === "finance-banking") {
    return [
      {
        id: "full_loop",
        label: `${companyLabel}Complete Finance Loop`,
        tag: "All Stages",
        desc: `Full finance sequence${company ? ` at ${company}` : ""}: financial modeling, 3-statement analysis, market thesis, and behavioral fit.`,
        category: "full"
      },
      {
        id: "technical",
        label: "Financial Modeling, DCF & Valuation",
        tag: "Financial Models",
        desc: "Discounted Cash Flow (DCF), LBO mechanics, trading comps, WACC calculation, and sensitivity analysis.",
        category: "technical"
      },
      {
        id: "system_design",
        label: "Accounting Mechanics & 3-Statement Case",
        tag: "Accounting Rigor",
        desc: "Income statement, balance sheet, and cash flow linkage; working capital changes, depreciation, and debt schedules.",
        category: "case_study"
      },
      {
        id: "coding_2",
        label: "Market Trends & Commercial Thesis",
        tag: "Investment Thesis",
        desc: "Industry tailwinds, margin expansion drivers, capital allocation, risk assessment, and executive synthesis.",
        category: "domain"
      },
      {
        id: "managerial",
        label: "Stakeholder Communication & Leadership",
        tag: "Executive Poise",
        desc: "Presenting financial scenarios to senior leadership, defending valuation models, and managing junior analysts.",
        category: "managerial"
      },
      {
        id: "behavioral",
        label: "HR & Culture Fit (STAR)",
        tag: company ? `${company} Values` : "STAR Stories",
        desc: `Attention to detail under tight deadlines, high-stakes communication, ethics, and values alignment${company ? ` at ${company}` : ""}.`,
        category: "behavioral"
      }
    ];
  }

  // =========================================================================
  // 10. GENERAL / CUSTOM ROLE FALLBACK
  // =========================================================================
  return [
    {
      id: "full_loop",
      label: `${companyLabel}Full Hiring Loop`,
      tag: "All Stages",
      desc: `Multi-round sequence simulating the complete hiring pipeline${company ? ` at ${company}` : ""} tailored specifically for ${roleTitle}.`,
      category: "full"
    },
    {
      id: "technical",
      label: "Technical & Practical Domain Execution",
      tag: "Domain Mastery",
      desc: `Practical problem solving, scenario execution, key performance metrics, and core responsibilities for ${roleTitle}.`,
      category: "domain",
      focusDirective: `STRICT DOMAIN CASE ROUND: Focus purely on practical day-to-day execution, problem solving, workflows, and core technical skills for ${roleTitle}.`
    },
    {
      id: "system_design",
      label: "Strategy, Workflow & Scaling",
      tag: "Strategic Thinking",
      desc: `Workflow optimization, process scaling, operational efficiency, resource allocation, and continuous improvement for ${roleTitle}.`,
      category: "case_study",
      focusDirective: `STRICT STRATEGY & WORKFLOW ROUND: Evaluate strategic planning, process scalability, resource allocation, and workflow optimization.`
    },
    {
      id: "coding_2",
      label: "Operational Quality & Trade-offs",
      tag: "Execution Rigor",
      desc: "Quality control, handling operational edge cases, service delivery, and managing conflicting priorities.",
      category: "case_study"
    },
    {
      id: "managerial",
      label: "Stakeholder Alignment & Team Leadership",
      tag: "Leadership",
      desc: "Cross-functional influence, managing underperformance, negotiating priorities, and resolving conflict.",
      category: "managerial",
      focusDirective: "STRICT LEADERSHIP ROUND: Cross-functional communication, conflict resolution, prioritizing under constraints, and team leadership."
    },
    {
      id: "behavioral",
      label: "HR & Culture Fit (STAR)",
      tag: company ? `${company} Values` : "STAR Stories",
      desc: `Behavioral delivery, personal ownership, culture fit, conflict resolution, and values alignment${company ? ` at ${company}` : ""}.`,
      category: "behavioral",
      focusDirective: "STRICT BEHAVIORAL ROUND: STAR format evaluation of past accomplishments, handling mistakes, collaboration, and cultural values."
    }
  ];
}
