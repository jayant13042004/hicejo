import { ResumeData } from "@/types/resume";

export interface StarterTemplate {
  id: string;
  name: string;
  role: string;
  category: string;
  description: string;
  data: ResumeData;
}

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: "software-engineer",
    name: "Software & Full-Stack Engineer",
    role: "Senior Full Stack Engineer",
    category: "Engineering",
    description: "Tailored for frontend, backend, and full-stack software engineers with quantifiable performance metrics.",
    data: {
      personalInfo: {
        fullName: "Alex Johnson",
        email: "alex.johnson@example.com",
        phone: "(555) 019-2834",
        location: "San Francisco, CA",
        website: "https://alexjohnson.dev",
        linkedin: "https://linkedin.com/in/alexj-tech"
      },
      summary: "High-impact Full Stack Engineer with 5+ years of experience building distributed systems and high-throughput web applications using React, Next.js, TypeScript, and Node.js. Proven track record of optimizing page load times by 40% and leading agile teams to deliver customer-centric products.",
      experience: [
        {
          id: "exp-1",
          company: "Stripe",
          position: "Senior Software Engineer",
          location: "San Francisco, CA",
          startDate: "Jan 2022",
          endDate: "Present",
          current: true,
          description: "• Architected and deployed scalable payment checkout interfaces in Next.js/React, improving conversion by 14% across 2M+ daily transactions.\n• Reduced server-side response latencies by 35% through Redis caching layers and GraphQL query batching.\n• Mentored 4 junior developers and established automated CI/CD unit testing protocols achieving 92% code coverage."
        },
        {
          id: "exp-2",
          company: "Apex Cloud Technologies",
          position: "Full Stack Developer",
          location: "Austin, TX",
          startDate: "Jun 2019",
          endDate: "Dec 2021",
          current: false,
          description: "• Built modular React design systems adopted by 12 internal engineering squads, reducing frontend feature turnaround by 25%.\n• Designed RESTful microservices with Node.js and PostgreSQL handling 10M+ events per day with 99.99% uptime.\n• Collaborated closely with product designers to implement accessibility (WCAG AA) standards across core apps."
        }
      ],
      education: [
        {
          id: "edu-1",
          school: "University of California, Berkeley",
          degree: "Bachelor of Science",
          fieldOfStudy: "Computer Science",
          location: "Berkeley, CA",
          startDate: "Aug 2015",
          endDate: "May 2019",
          current: false
        }
      ],
      projects: [
        {
          id: "proj-1",
          name: "CloudMetrics AI",
          role: "Creator & Lead Developer",
          link: "https://github.com/alexj/cloudmetrics",
          startDate: "2023",
          endDate: "Present",
          description: "• Engineered open-source telemetry dashboard indexing Kubernetes cluster health metrics in real-time, starring 1,200+ times on GitHub."
        }
      ],
      skills: [
        { id: "sk-1", name: "TypeScript", category: "Languages" },
        { id: "sk-2", name: "JavaScript", category: "Languages" },
        { id: "sk-3", name: "Python", category: "Languages" },
        { id: "sk-4", name: "SQL", category: "Languages" },
        { id: "sk-5", name: "React / Next.js", category: "Frameworks & Tools" },
        { id: "sk-6", name: "Node.js / Express", category: "Frameworks & Tools" },
        { id: "sk-7", name: "PostgreSQL / Redis", category: "Database & Cloud" },
        { id: "sk-8", name: "Docker / AWS", category: "Database & Cloud" }
      ],
      design: {
        fontFamily: "font-sans",
        fontSize: "md",
        sectionOrder: ["summary", "experience", "projects", "education", "skills"],
        density: "normal",
        sectionSpacing: 1.0,
        itemSpacing: 1.0,
        lineHeight: 1.4
      }
    }
  },
  {
    id: "product-manager",
    name: "Product Manager & Tech Lead",
    role: "Senior Technical Product Manager",
    category: "Product Management",
    description: "Built for Technical Product Managers and Product Leaders driving roadmap vision, user retention, and ARR growth.",
    data: {
      personalInfo: {
        fullName: "Sarah Chen",
        email: "sarah.chen@example.com",
        phone: "(555) 349-8120",
        location: "New York, NY",
        website: "https://sarahchenpm.com",
        linkedin: "https://linkedin.com/in/sarahchen-pm"
      },
      summary: "Data-driven Senior Product Manager with 6+ years leading cross-functional teams to launch enterprise SaaS products from 0 to 1. Proven success scaling product ARR from $3M to $12M while increasing customer retention by 28%.",
      experience: [
        {
          id: "exp-1",
          company: "Notion",
          position: "Senior Product Manager",
          location: "New York, NY",
          startDate: "Mar 2021",
          endDate: "Present",
          current: true,
          description: "• Spearheaded end-to-end roadmap execution for AI workspace tools, driving 450K+ daily active user adoption in the first 90 days.\n• Conducted 80+ customer discovery interviews to identify core monetization opportunities, yielding a 22% increase in paid plan conversions.\n• Partnered with engineering leads and designers across 3 time zones to deliver quarterly sprints with a 96% on-time completion rate."
        },
        {
          id: "exp-2",
          company: "Datadog",
          position: "Product Manager",
          location: "Boston, MA",
          startDate: "Jul 2018",
          endDate: "Feb 2021",
          current: false,
          description: "• Defined product strategy for cloud monitoring dashboard, reducing customer onboarding time by 34%.\n• Analyzed product telemetry using SQL and Mixpanel to optimize user activation funnels and minimize churn."
        }
      ],
      education: [
        {
          id: "edu-1",
          school: "Columbia University",
          degree: "B.A. in Economics & Computer Science",
          fieldOfStudy: "Product Strategy",
          location: "New York, NY",
          startDate: "2014",
          endDate: "2018",
          current: false
        }
      ],
      projects: [
        {
          id: "proj-1",
          name: "SaaS Metrics Calculator",
          role: "Product Creator",
          link: "https://saasmetrics.io",
          startDate: "2022",
          endDate: "2023",
          description: "• Built interactive benchmarking tool used by 15,000+ startup founders to model LTV, CAC, and Net Retention Rate."
        }
      ],
      skills: [
        { id: "sk-1", name: "Roadmap Strategy", category: "Core Product" },
        { id: "sk-2", name: "User Research & Discovery", category: "Core Product" },
        { id: "sk-3", name: "Agile / Scrum Methodologies", category: "Execution" },
        { id: "sk-4", name: "SQL & Data Analytics", category: "Technical" },
        { id: "sk-5", name: "A/B Testing & Funnel Optimization", category: "Growth" },
        { id: "sk-6", name: "Jira / Figma / Amplitude", category: "Tools" }
      ],
      design: {
        fontFamily: "font-executive",
        fontSize: "md",
        sectionOrder: ["summary", "experience", "projects", "education", "skills"],
        density: "normal",
        sectionSpacing: 1.0,
        itemSpacing: 1.0,
        lineHeight: 1.4
      }
    }
  },
  {
    id: "data-scientist",
    name: "Data Scientist & ML Engineer",
    role: "Senior Data Scientist & Machine Learning Engineer",
    category: "Data & AI",
    description: "Designed for Data Scientists, ML Engineers, and AI Researchers showcasing statistical modeling and business impact.",
    data: {
      personalInfo: {
        fullName: "David Kumar",
        email: "david.kumar@example.com",
        phone: "(555) 782-9014",
        location: "Seattle, WA",
        website: "https://davidkumar.ai",
        linkedin: "https://linkedin.com/in/davidkumar-ml"
      },
      summary: "Machine Learning Engineer with 4+ years of experience designing, training, and deploying predictive ML pipelines and large language model workflows. Expert in PyTorch, Python, SQL, and AWS SageMaker with demonstrable revenue-driving deployments.",
      experience: [
        {
          id: "exp-1",
          company: "Amazon Web Services (AWS)",
          position: "Machine Learning Engineer",
          location: "Seattle, WA",
          startDate: "Aug 2021",
          endDate: "Present",
          current: true,
          description: "• Built recommendation ranking models utilizing PyTorch and LightGBM, increasing user engagement click-through rate by 18.5%.\n• Containerized ML inference services using Docker and FastAPI on Kubernetes, maintaining sub-45ms P99 latency at 15,000 QPS.\n• Reduced model training compute costs by 28% through gradient checkpointing and mixed-precision optimization."
        },
        {
          id: "exp-2",
          company: "Zillow Group",
          position: "Data Scientist",
          location: "Seattle, WA",
          startDate: "Jun 2019",
          endDate: "Jul 2021",
          current: false,
          description: "• Engineered geospatial valuation models predicting residential property trends with a 4.2% mean absolute error rate.\n• Automated ETL pipelines processing 50GB+ daily transaction logs with Apache Spark, Airflow, and Snowflake."
        }
      ],
      education: [
        {
          id: "edu-1",
          school: "University of Washington",
          degree: "Master of Science in Data Science",
          fieldOfStudy: "Machine Learning",
          location: "Seattle, WA",
          startDate: "2017",
          endDate: "2019",
          current: false
        }
      ],
      projects: [
        {
          id: "proj-1",
          name: "DeepSummarize NLP",
          role: "Author",
          link: "https://github.com/davidkumar/deepsummarize",
          startDate: "2023",
          endDate: "2023",
          description: "• Fine-tuned open-source LLM for domain-specific contract risk extraction with 91% F1 accuracy."
        }
      ],
      skills: [
        { id: "sk-1", name: "Python", category: "Languages" },
        { id: "sk-2", name: "SQL (Snowflake / PostgreSQL)", category: "Languages" },
        { id: "sk-3", name: "PyTorch / TensorFlow", category: "ML & AI" },
        { id: "sk-4", name: "Scikit-Learn / Pandas", category: "ML & AI" },
        { id: "sk-5", name: "Spark / Airflow", category: "Data Engineering" },
        { id: "sk-6", name: "Docker / Kubernetes / AWS", category: "Deployment" }
      ],
      design: {
        fontFamily: "font-mono",
        fontSize: "md",
        sectionOrder: ["summary", "experience", "projects", "education", "skills"],
        density: "normal",
        sectionSpacing: 1.0,
        itemSpacing: 1.0,
        lineHeight: 1.4
      }
    }
  },
  {
    id: "marketing-specialist",
    name: "Growth & Performance Marketer",
    role: "Growth Marketing Manager",
    category: "Marketing",
    description: "Optimized for Performance Marketers, Growth Leads, and SEO Specialists with campaign metrics and CAC/ROAS achievements.",
    data: {
      personalInfo: {
        fullName: "Emily Rodriguez",
        email: "emily.rodriguez@example.com",
        phone: "(555) 491-3029",
        location: "Chicago, IL",
        website: "https://emilyrodriguez.co",
        linkedin: "https://linkedin.com/in/emily-growth"
      },
      summary: "Data-driven Growth Marketing Manager with 5+ years managing $2.5M+ annual paid media budgets across Google, Meta, and LinkedIn. Proven track record of lowering customer acquisition cost (CAC) by 32% while scaling monthly inbound leads by 3x.",
      experience: [
        {
          id: "exp-1",
          company: "HubSpot Partner Agency",
          position: "Senior Growth Marketing Manager",
          location: "Chicago, IL",
          startDate: "Feb 2021",
          endDate: "Present",
          current: true,
          description: "• Managed $180K/month multi-channel ad spend, generating over 12,000 qualified enterprise leads at a 3.8x blended ROAS.\n• Designed and executed 40+ landing page A/B tests in Webflow, boosting visitor-to-demo conversion rate from 2.4% to 5.1%.\n• Implemented programmatic SEO strategy targeting 200+ bottom-of-funnel keywords, increasing organic organic traffic by 180% in 12 months."
        },
        {
          id: "exp-2",
          company: "Sprout Social",
          position: "Digital Marketing Specialist",
          location: "Chicago, IL",
          startDate: "Jun 2018",
          endDate: "Jan 2021",
          current: false,
          description: "• Optimized email marketing nurture drips in Marketo, boosting open rates to 38% and click-to-open rates to 14%.\n• Managed co-marketing webinar series with industry partners, driving 1,500+ registrations per event."
        }
      ],
      education: [
        {
          id: "edu-1",
          school: "Northwestern University",
          degree: "B.S. in Integrated Marketing Communications",
          fieldOfStudy: "Digital Strategy",
          location: "Evanston, IL",
          startDate: "2014",
          endDate: "2018",
          current: false
        }
      ],
      projects: [
        {
          id: "proj-1",
          name: "GrowthPlaybook Newsletter",
          role: "Founder",
          link: "https://growthplaybook.io",
          startDate: "2022",
          endDate: "Present",
          description: "• Grew bi-weekly B2B marketing newsletter to 8,500+ subscribers with organic LinkedIn content strategy."
        }
      ],
      skills: [
        { id: "sk-1", name: "Paid Acquisition (Google Ads, Meta, LinkedIn)", category: "Paid Media" },
        { id: "sk-2", name: "SEO & Programmatic Content Strategy", category: "Organic Growth" },
        { id: "sk-3", name: "Conversion Rate Optimization (CRO)", category: "Analytics" },
        { id: "sk-4", name: "Google Analytics 4 / Google Tag Manager", category: "Analytics" },
        { id: "sk-5", name: "HubSpot / Marketo / Klaviyo", category: "Automation" }
      ],
      design: {
        fontFamily: "font-geometric",
        fontSize: "md",
        sectionOrder: ["summary", "experience", "projects", "education", "skills"],
        density: "normal",
        sectionSpacing: 1.0,
        itemSpacing: 1.0,
        lineHeight: 1.4
      }
    }
  },
  {
    id: "college-student",
    name: "College Student / New Graduate",
    role: "Entry-Level Software Engineer / Associate",
    category: "Entry Level & Student",
    description: "Structured for university students, interns, and new grads highlighting coursework, leadership, projects, and hackathons.",
    data: {
      personalInfo: {
        fullName: "Marcus Vance",
        email: "marcus.vance@university.edu",
        phone: "(555) 612-8834",
        location: "Austin, TX",
        website: "https://marcusvance.me",
        linkedin: "https://linkedin.com/in/marcus-vance-cs"
      },
      summary: "Motivated Computer Science senior at University of Texas at Austin with hands-on internship experience in software engineering and cloud infrastructure. Passionate about building performant web applications and algorithms with Python, React, and PostgreSQL.",
      experience: [
        {
          id: "exp-1",
          company: "Dell Technologies",
          position: "Software Engineering Intern",
          location: "Round Rock, TX",
          startDate: "May 2024",
          endDate: "Aug 2024",
          current: false,
          description: "• Developed internal equipment tracking dashboard using React and Flask, saving the lab operations team 8 hours per week.\n• Wrote automated unit and integration tests using PyTest, raising coverage from 64% to 88% across core microservices.\n• Participated in daily standups and agile sprint reviews, presenting final deliverables to department VP."
        }
      ],
      education: [
        {
          id: "edu-1",
          school: "University of Texas at Austin",
          degree: "Bachelor of Science in Computer Science",
          fieldOfStudy: "GPA: 3.82 / 4.0",
          location: "Austin, TX",
          startDate: "Aug 2021",
          endDate: "May 2025",
          current: true
        }
      ],
      projects: [
        {
          id: "proj-1",
          name: "StudySync — Realtime Peer Collaboration",
          role: "Full Stack Developer",
          link: "https://github.com/marcusv/studysync",
          startDate: "2024",
          endDate: "2024",
          description: "• Built collaborative whiteboard app using Next.js, WebSockets, and Canvas API; won 1st Place at HackTX 2024 among 120 teams."
        },
        {
          id: "proj-2",
          name: "Campus Dining Sentiment Analyzer",
          role: "Lead Creator",
          link: "https://github.com/marcusv/dining-nlp",
          startDate: "2023",
          endDate: "2024",
          description: "• Scraped student reviews to classify food station ratings using Python and NLTK, published interactive dashboard used by 1,200+ students."
        }
      ],
      skills: [
        { id: "sk-1", name: "Python", category: "Languages" },
        { id: "sk-2", name: "JavaScript / TypeScript", category: "Languages" },
        { id: "sk-3", name: "C / C++", category: "Languages" },
        { id: "sk-4", name: "React / HTML / CSS", category: "Web Tech" },
        { id: "sk-5", name: "Git / GitHub / Linux", category: "Tools" }
      ],
      design: {
        fontFamily: "font-sans",
        fontSize: "md",
        sectionOrder: ["education", "projects", "experience", "skills", "summary"],
        density: "normal",
        sectionSpacing: 1.0,
        itemSpacing: 1.0,
        lineHeight: 1.4
      }
    }
  },
  {
    id: "devops-cloud-architect",
    name: "Cloud & DevOps Solutions Architect",
    role: "Senior DevOps / Platform Engineer",
    category: "DevOps & Cloud",
    description: "Designed for DevOps, SREs, and Cloud Architects showcasing Kubernetes orchestration, Terraform IaC, and 99.99% uptime achievements.",
    data: {
      personalInfo: {
        fullName: "Jordan Taylor",
        email: "jordan.taylor@example.com",
        phone: "(555) 839-2019",
        location: "Denver, CO",
        website: "https://jordantaylor.cloud",
        linkedin: "https://linkedin.com/in/jordantaylor-devops"
      },
      summary: "Results-driven Platform Engineer with 6+ years of experience architecting multi-region AWS and Kubernetes infrastructure. Proven track record reducing CI/CD build times by 65% and maintaining 99.99% SLA availability across 400+ microservices.",
      experience: [
        {
          id: "exp-1",
          company: "HashiCorp Cloud Ops",
          position: "Senior Platform / DevOps Engineer",
          location: "Remote",
          startDate: "Jan 2022",
          endDate: "Present",
          current: true,
          description: "• Engineered automated multi-region Kubernetes (EKS) clusters utilizing Terraform and Helm, cutting provisioning time from 4 days to 18 minutes.\n• Implemented GitHub Actions CI/CD pipelines with ArgoCD GitOps, increasing daily deployment frequency from 3 to 45 deployments with 0 downtime.\n• Reduced annual cloud compute expenditure by $320,000 (24%) via Karpenter autoscaling and spot instance orchestration."
        },
        {
          id: "exp-2",
          company: "Cloudflare Partner Networks",
          position: "DevOps Engineer",
          location: "Boulder, CO",
          startDate: "May 2019",
          endDate: "Dec 2021",
          current: false,
          description: "• Managed Prometheus and Grafana telemetry monitoring stack ingesting 25M metrics/minute with automated PagerDuty alert escalation.\n• Standardized Docker container base images, eliminating 80+ high-severity CVE vulnerabilities across 60 internal repositories."
        }
      ],
      education: [
        {
          id: "edu-1",
          school: "University of Colorado Boulder",
          degree: "B.S. in Computer Systems Engineering",
          fieldOfStudy: "Distributed Systems",
          location: "Boulder, CO",
          startDate: "2015",
          endDate: "2019",
          current: false
        }
      ],
      projects: [
        {
          id: "proj-1",
          name: "Terraform Multi-Cloud Boilerplate",
          role: "Maintainer",
          link: "https://github.com/jordantaylor/tf-multicloud",
          startDate: "2023",
          endDate: "2024",
          description: "• Open-source Infrastructure-as-Code modules with 1,200+ GitHub stars and 50,000+ registry downloads."
        }
      ],
      skills: [
        { id: "sk-1", name: "AWS & Google Cloud Platform", category: "Cloud" },
        { id: "sk-2", name: "Kubernetes (EKS / GKE) & Helm", category: "Orchestration" },
        { id: "sk-3", name: "Terraform & Ansible (IaC)", category: "Infrastructure" },
        { id: "sk-4", name: "Docker & Container Security", category: "Containers" },
        { id: "sk-5", name: "GitHub Actions / GitLab CI / ArgoCD", category: "CI/CD" },
        { id: "sk-6", name: "Prometheus / Grafana / Datadog", category: "Observability" }
      ],
      design: {
        fontFamily: "font-mono",
        fontSize: "md",
        sectionOrder: ["summary", "experience", "projects", "education", "skills"],
        density: "normal",
        sectionSpacing: 1.0,
        itemSpacing: 1.0,
        lineHeight: 1.4
      }
    }
  },
  {
    id: "ui-ux-designer",
    name: "Product Designer & UX Researcher",
    role: "Senior Product Designer (UI/UX)",
    category: "Design & UX",
    description: "Engineered for Product & UI/UX Designers featuring Figma design systems, usability research metrics, and cross-functional product delivery.",
    data: {
      personalInfo: {
        fullName: "Maya Lin",
        email: "maya.lin@example.com",
        phone: "(555) 204-9811",
        location: "San Francisco, CA",
        website: "https://mayalin.design",
        linkedin: "https://linkedin.com/in/mayalindesign"
      },
      summary: "Senior Product Designer with 5+ years crafting human-centered SaaS and mobile experiences. Expert in scalable Figma design systems, quantitative usability testing, and cross-functional collaboration that boosted onboarding completion by 34%.",
      experience: [
        {
          id: "exp-1",
          company: "Figma Community Labs",
          position: "Senior UI/UX Product Designer",
          location: "San Francisco, CA",
          startDate: "Mar 2022",
          endDate: "Present",
          current: true,
          description: "• Led end-to-end design for B2B collaboration workspace, raising weekly active user retention by 26% across 500K accounts.\n• Architected enterprise multi-brand design system with 240+ WCAG AAA tokens and components, reducing design-to-code drift by 40%.\n• Moderated 50+ remote unmoderated usability sessions via UserTesting, synthesizing insights that cut product checkout drop-off by 19%."
        },
        {
          id: "exp-2",
          company: "Canva Studio Partner",
          position: "UI/UX Designer",
          location: "San Francisco, CA",
          startDate: "Jun 2019",
          endDate: "Feb 2022",
          current: false,
          description: "• Redesigned mobile navigation IA for iOS and Android apps with 4.8-star App Store rating across 100K+ reviews.\n• Partnered with front-end engineers to ensure pixel-perfect CSS implementation and micro-interaction animations."
        }
      ],
      education: [
        {
          id: "edu-1",
          school: "Rhode Island School of Design (RISD)",
          degree: "B.F.A. in Graphic & Interactive Design",
          fieldOfStudy: "Human-Computer Interaction",
          location: "Providence, RI",
          startDate: "2015",
          endDate: "2019",
          current: false
        }
      ],
      projects: [
        {
          id: "proj-1",
          name: "OpenUI Tokens Library",
          role: "Lead Creator",
          link: "https://openuilib.dev",
          startDate: "2023",
          endDate: "2024",
          description: "• Universal design token schema used by over 3,000 Figma community designers."
        }
      ],
      skills: [
        { id: "sk-1", name: "Figma / FigJam / Tokens Studio", category: "Design Tools" },
        { id: "sk-2", name: "Design Systems & Token Architecture", category: "System Design" },
        { id: "sk-3", name: "User Research & Usability Testing", category: "Research" },
        { id: "sk-4", name: "Wireframing & High-Fidelity Prototyping", category: "Prototyping" },
        { id: "sk-5", name: "HTML5 / CSS3 / Tailwind / Micro-interactions", category: "Technical" }
      ],
      design: {
        fontFamily: "font-geometric",
        fontSize: "md",
        sectionOrder: ["summary", "experience", "projects", "education", "skills"],
        density: "normal",
        sectionSpacing: 1.0,
        itemSpacing: 1.0,
        lineHeight: 1.4
      }
    }
  },
  {
    id: "cybersecurity-analyst",
    name: "Cybersecurity & InfoSec Specialist",
    role: "Senior Security Operations / Threat Analyst",
    category: "Security & IT",
    description: "Formulated for SOC Analysts, Security Engineers, and Pen Testers highlighting threat detection, NIST compliance, and zero-day containment.",
    data: {
      personalInfo: {
        fullName: "Darius Thorne",
        email: "darius.thorne@example.com",
        phone: "(555) 714-3829",
        location: "Washington, DC",
        website: "https://darius-sec.io",
        linkedin: "https://linkedin.com/in/darius-thorne-infosec"
      },
      summary: "CISSP-certified Information Security Analyst with 6+ years specializing in SOC operations, incident response, SIEM engineering, and vulnerability remediation. Proven success reducing mean time to detect (MTTD) by 55% across 20,000 enterprise endpoints.",
      experience: [
        {
          id: "exp-1",
          company: "CrowdStrike Security Ops",
          position: "Senior Security Operations Analyst",
          location: "Reston, VA",
          startDate: "Feb 2022",
          endDate: "Present",
          current: true,
          description: "• Spearheaded incident triage and forensics across 25,000 corporate endpoints, achieving a 99.8% incident SLA containment rate.\n• Engineered 60+ custom Splunk and Falcon detection rules mapping to MITRE ATT&CK framework, decreasing false positives by 42%.\n• Executed automated SOAR playbooks in Python, accelerating phishing containment from 45 minutes to 30 seconds."
        },
        {
          id: "exp-2",
          company: "Booz Allen Hamilton",
          position: "Cybersecurity Analyst",
          location: "McLean, VA",
          startDate: "Jul 2018",
          endDate: "Jan 2022",
          current: false,
          description: "• Conducted quarterly vulnerability assessments (Qualys/Nessus) and remediation audits for federal enterprise clients under NIST 800-53.\n• Performed red/blue team penetration testing exercises identifying 14 critical privilege escalation attack vectors."
        }
      ],
      education: [
        {
          id: "edu-1",
          school: "George Mason University",
          degree: "B.S. in Cybersecurity Engineering",
          fieldOfStudy: "Network Defense & Cryptography",
          location: "Fairfax, VA",
          startDate: "2014",
          endDate: "2018",
          current: false
        }
      ],
      projects: [
        {
          id: "proj-1",
          name: "ThreatHunter CLI",
          role: "Author",
          link: "https://github.com/dthorne/threathunter",
          startDate: "2023",
          endDate: "2023",
          description: "• Automated IOC scanner analyzing PCAP files and memory dumps against AlienVault OTX intelligence."
        }
      ],
      skills: [
        { id: "sk-1", name: "SIEM (Splunk, Sentinel, Elastic)", category: "Detection" },
        { id: "sk-2", name: "EDR (CrowdStrike, SentinelOne)", category: "Detection" },
        { id: "sk-3", name: "Incident Response & Digital Forensics", category: "Operations" },
        { id: "sk-4", name: "NIST 800-53 / ISO 27001 / SOC 2", category: "Compliance" },
        { id: "sk-5", name: "Python / Bash / PowerShell Scripting", category: "Automation" }
      ],
      design: {
        fontFamily: "font-mono",
        fontSize: "md",
        sectionOrder: ["summary", "experience", "projects", "education", "skills"],
        density: "normal",
        sectionSpacing: 1.0,
        itemSpacing: 1.0,
        lineHeight: 1.4
      }
    }
  },
  {
    id: "finance-investment-analyst",
    name: "Financial Analyst & Corporate Finance",
    role: "Senior Financial Analyst (M&A / FP&A)",
    category: "Finance & Banking",
    description: "Built for Investment Banking Analysts, FP&A Managers, and FinTech leads with DCF valuation, variance modeling, and audit success.",
    data: {
      personalInfo: {
        fullName: "Victoria Sterling",
        email: "victoria.sterling@example.com",
        phone: "(555) 918-4022",
        location: "New York, NY",
        website: "https://vsterling-finance.com",
        linkedin: "https://linkedin.com/in/victoriasterling-cfa"
      },
      summary: "CFA charterholder and Senior Financial Analyst with 5+ years in financial planning & analysis (FP&A) and corporate M&A advisory. Expert in 3-statement financial modeling, LBO valuations, and executive board reporting driving $15M+ capital allocation decisions.",
      experience: [
        {
          id: "exp-1",
          company: "Goldman Sachs Asset Management",
          position: "Senior Financial Analyst (FP&A & Advisory)",
          location: "New York, NY",
          startDate: "Aug 2021",
          endDate: "Present",
          current: true,
          description: "• Developed dynamic multi-scenario financial forecasts for a $140M operating budget, reducing quarterly variance from 8.2% to 1.8%.\n• Modeled discounted cash flow (DCF) and leveraged buyout (LBO) valuations for 4 completed strategic acquisitions valued at $85M.\n• Automated monthly executive P&L dashboard in Power BI and SQL, saving 22 analyst hours per close cycle."
        },
        {
          id: "exp-2",
          company: "Morgan Stanley Wealth",
          position: "Financial Analyst",
          location: "New York, NY",
          startDate: "Jul 2019",
          endDate: "Jul 2021",
          current: false,
          description: "• Built quantitative risk assessment models analyzing equity and fixed income portfolios managing $450M in AUM.\n• Prepared comprehensive due diligence briefing decks presented directly to institutional investment committees."
        }
      ],
      education: [
        {
          id: "edu-1",
          school: "New York University (Stern)",
          degree: "B.S. in Finance & Statistics",
          fieldOfStudy: "Corporate Valuation",
          location: "New York, NY",
          startDate: "2015",
          endDate: "2019",
          current: false
        }
      ],
      projects: [
        {
          id: "proj-1",
          name: "SaaS Valuation Benchmark Index",
          role: "Author",
          link: "https://saasbenchmarkindex.com",
          startDate: "2023",
          endDate: "2024",
          description: "• Quarterly tracking of 65 public SaaS enterprise multiples (EV/ARR) cited by venture funds."
        }
      ],
      skills: [
        { id: "sk-1", name: "3-Statement Financial Modeling", category: "Core Modeling" },
        { id: "sk-2", name: "DCF / LBO / Comparable Company Analysis", category: "Valuation" },
        { id: "sk-3", name: "Advanced Excel (VBA / Macros) & Financial Modeling", category: "Analytics" },
        { id: "sk-4", name: "SQL & Power BI / Tableau", category: "Analytics" },
        { id: "sk-5", name: "Capital Allocation & Variance Analysis", category: "FP&A" }
      ],
      design: {
        fontFamily: "font-executive",
        fontSize: "md",
        sectionOrder: ["summary", "experience", "education", "projects", "skills"],
        density: "normal",
        sectionSpacing: 1.0,
        itemSpacing: 1.0,
        lineHeight: 1.4
      }
    }
  },
  {
    id: "executive-engineering-director",
    name: "Engineering Director & VP of Tech",
    role: "Director of Engineering / VP of Technology",
    category: "Executive Leadership",
    description: "Tailored for VPs of Engineering and Tech Directors leading multi-team orgs (40+ engineers), $10M+ tech budgets, and digital transformations.",
    data: {
      personalInfo: {
        fullName: "Robert H. Caldwell",
        email: "robert.caldwell@example.com",
        phone: "(555) 438-1920",
        location: "San Jose, CA",
        website: "https://rcaldwell-exec.tech",
        linkedin: "https://linkedin.com/in/robert-caldwell-vp"
      },
      summary: "Transformational Engineering Executive with 12+ years scaling high-performing software organizations from 15 to 75+ engineers. Proven leadership managing $12M annual R&D budgets, modernizing legacy monolithic platforms to microservices, and driving 99.99% system reliability.",
      experience: [
        {
          id: "exp-1",
          company: "Salesforce Platform Engineering",
          position: "Director of Engineering",
          location: "San Francisco, CA",
          startDate: "Jan 2021",
          endDate: "Present",
          current: true,
          description: "• Scaled engineering organization across 5 squads (48 engineers, 4 managers) while reducing voluntary annual attrition to under 4%.\n• Oversaw $14M annual cloud infrastructure and software tooling budget, optimizing vendor contracts to save $1.8M annually.\n• Championed agile engineering maturity, increasing sprint velocity predictability by 38% and reducing critical production bugs by 52%."
        },
        {
          id: "exp-2",
          company: "Twilio API Systems",
          position: "Senior Engineering Manager",
          location: "San Francisco, CA",
          startDate: "Mar 2017",
          endDate: "Dec 2020",
          current: false,
          description: "• Managed 2 squads (18 engineers) building real-time messaging pipelines processing 4B+ events per month.\n• Spearheaded zero-trust security re-architecture, achieving SOC 2 Type II and FedRAMP compliance ahead of schedule."
        }
      ],
      education: [
        {
          id: "edu-1",
          school: "Stanford University",
          degree: "M.S. in Computer Science & Management",
          fieldOfStudy: "Software Systems Engineering",
          location: "Stanford, CA",
          startDate: "2010",
          endDate: "2012",
          current: false
        }
      ],
      projects: [
        {
          id: "proj-1",
          name: "Engineering Leadership Playbook",
          role: "Author",
          link: "https://engleadershipbook.org",
          startDate: "2023",
          endDate: "2024",
          description: "• Framework for career ladders, OKR alignment, and engineering compensation benchmarks."
        }
      ],
      skills: [
        { id: "sk-1", name: "Engineering Org Scaling (50+ Engineers)", category: "Leadership" },
        { id: "sk-2", name: "Budget & P&L Management ($10M+)", category: "Executive" },
        { id: "sk-3", name: "Technical Strategy & Cloud Architecture", category: "Architecture" },
        { id: "sk-4", name: "Executive Hiring & Mentorship", category: "People" },
        { id: "sk-5", name: "SOC 2 / ISO 27001 / FedRAMP Governance", category: "Governance" }
      ],
      design: {
        fontFamily: "font-executive",
        fontSize: "md",
        sectionOrder: ["summary", "experience", "education", "projects", "skills"],
        density: "normal",
        sectionSpacing: 1.0,
        itemSpacing: 1.0,
        lineHeight: 1.4
      }
    }
  }
];
