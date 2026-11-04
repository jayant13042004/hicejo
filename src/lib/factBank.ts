/**
 * Verified Candidate Fact Bank — Single Source of Truth for Jayant Jagtap
 * 
 * Strict Anti-Hallucination Grounding:
 * Only facts verified here or in the candidate's saved resumes/fact bank
 * are permitted to be evaluated or included in tailored applications.
 */

export interface VerifiedProject {
  id?: string;
  name: string;
  role?: string;
  link?: string;
  technologies: string[];
  metrics: string;
  verifiedBullets: string[];
}

export interface VerifiedExperience {
  id?: string;
  company: string;
  title: string;
  duration: string;
  location?: string;
  verifiedBullets: string[];
  technologies: string[];
}

export interface VerifiedEducation {
  id?: string;
  institution: string;
  degree: string;
  field: string;
  duration: string;
  cgpa: string;
  highlights?: string[];
}

export interface VerifiedFactBank {
  candidate: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    portfolio?: string;
  };
  education: VerifiedEducation[];
  experience: VerifiedExperience[];
  projects: VerifiedProject[];
  skillGroups: Record<string, string[]>;
}

export const JAYANT_FACT_BANK: VerifiedFactBank = {
  candidate: {
    fullName: "Jayant Jagtap",
    email: "jayantjagtap2004@gmail.com",
    phone: "+91 9356934045",
    location: "Pune / Hyderabad, India",
    linkedin: "https://www.linkedin.com/in/jayantjagtap",
    github: "https://github.com/jayantjagtap",
    portfolio: "https://jayantjagtap.com"
  },
  education: [
    {
      id: "edu-1",
      institution: "Indian Institute of Technology Hyderabad (IITH)",
      degree: "B.Tech",
      field: "Chemical Engineering",
      duration: "2022 – 2026",
      cgpa: "7.99 / 10",
      highlights: ["Core engineering fundamentals", "Data & process modeling"]
    },
    {
      id: "edu-2",
      institution: "Indian Institute of Technology Hyderabad (IITH)",
      degree: "B.Tech (Double Major)",
      field: "Entrepreneurship",
      duration: "2022 – 2026",
      cgpa: "7.98 / 10",
      highlights: ["Business strategy", "Market validation", "Financial modeling"]
    }
  ],
  experience: [
    {
      id: "exp-1",
      company: "AVEVA",
      title: "Software Development Intern",
      duration: "May 2025 – July 2025",
      location: "India",
      technologies: ["C++", "C#", ".NET", "RESTful APIs", "Agile", "Unit Testing", "CI/CD"],
      verifiedBullets: [
        "Designed and built an HTTP client-server communication model between internal workflow services.",
        "Engineered and deployed a cross-platform FileReaderSDK in C++ and .NET parsing structured data formats.",
        "Collaborated in an Agile development environment, implementing automated unit tests and maintaining high reliability standards."
      ]
    }
  ],
  projects: [
    {
      id: "proj-1",
      name: "Customer Churn and Retention Intelligence",
      role: "Lead Analyst & Creator",
      link: "https://github.com/jayantjagtap",
      technologies: ["Python", "SQL", "Power BI", "Pandas", "Scikit-Learn", "FastAPI", "Streamlit"],
      metrics: "7,000+ customer records, 0.85+ ROC-AUC, 15+ Power BI KPIs",
      verifiedBullets: [
        "Analyzed 7,000+ customer records using SQL and Python to uncover churn patterns, customer behaviors, and revenue drivers.",
        "Executed cohort analysis, exploratory data analysis, and predictive customer segmentation achieving 0.85+ ROC-AUC.",
        "Engineered an interactive Power BI dashboard featuring 15+ real-time KPIs covering churn rate, retention, and customer lifetime value (LTV)."
      ]
    },
    {
      id: "proj-2",
      name: "Vendor Performance and Procurement Analytics",
      role: "Creator",
      link: "https://github.com/jayantjagtap",
      technologies: ["SQL", "Python", "Power BI", "Pandas", "NumPy", "Statistical Hypothesis Testing"],
      metrics: "50,000+ purchase transactions, 12+ scorecard KPIs",
      verifiedBullets: [
        "Analyzed 50,000+ purchase transactions using SQL and Python to evaluate vendor lead times, pricing stability, and inventory efficiency.",
        "Applied statistical hypothesis testing to detect vendor delivery anomalies and isolate procurement bottlenecks.",
        "Constructed a Power BI dashboard with dynamic vendor scorecards and 12+ KPIs to identify high-variance suppliers and cost optimization targets."
      ]
    },
    {
      id: "proj-3",
      name: "IKEA Customer Segmentation and RFM Analysis",
      role: "Analyst",
      link: "https://github.com/jayantjagtap",
      technologies: ["Python", "SQL", "K-Means Clustering", "Power BI", "Scikit-Learn"],
      metrics: "5 distinct customer clusters, RFM-based revenue contribution mapping",
      verifiedBullets: [
        "Architected an RFM (Recency, Frequency, Monetary) segmentation model in Python and SQL to classify purchasing behavior.",
        "Applied K-Means unsupervised clustering to segment customer base into 5 actionable tiers for targeted marketing strategy.",
        "Designed an interactive Power BI dashboard tracking cluster-level revenue, retention trends, and purchase frequencies."
      ]
    },
    {
      id: "proj-4",
      name: "Demand Forecasting System",
      role: "Creator",
      link: "https://github.com/jayantjagtap",
      technologies: ["Python", "ARIMA", "XGBoost", "FastAPI", "Pandas", "Time-Series"],
      metrics: "18–22% error reduction over baseline models",
      verifiedBullets: [
        "Designed automated time-series forecasting pipelines using ARIMA and lag-featured XGBoost models.",
        "Reduced prediction error metrics by 18–22% compared to baseline moving average models.",
        "Built FastAPI inference backend to serve real-time demand forecasts and generate executive trend reports."
      ]
    }
  ],
  skillGroups: {
    "Programming & Languages": ["Python", "SQL", "C++", "C#", ".NET"],
    "Data Analysis & Modeling": ["Pandas", "NumPy", "Exploratory Data Analysis (EDA)", "Cohort Analysis", "Hypothesis Testing", "Statistical Modeling", "RFM Analysis", "Customer Segmentation"],
    "Machine Learning & AI": ["Scikit-Learn", "ARIMA", "XGBoost", "K-Means Clustering", "Time-Series Forecasting", "Feature Engineering"],
    "Business Intelligence & Dashboards": ["Power BI", "Tableau", "Excel", "DAX", "KPI Scorecards", "Data Modeling"],
    "Databases & Tools": ["PostgreSQL", "MySQL", "FastAPI", "Git", "GitHub", "Jupyter Notebook", "Docker basics"]
  }
};

/**
 * Merge saved fact bank data with baseline defaults
 */
export function mergeWithDefaultFactBank(customData?: Partial<VerifiedFactBank> | null): VerifiedFactBank {
  if (!customData) return JAYANT_FACT_BANK;

  // Merge projects: start with custom, or fallback to default
  const projects = customData.projects && customData.projects.length > 0
    ? customData.projects
    : JAYANT_FACT_BANK.projects;

  // Merge experience
  const experience = customData.experience && customData.experience.length > 0
    ? customData.experience
    : JAYANT_FACT_BANK.experience;

  // Merge education
  const education = customData.education && customData.education.length > 0
    ? customData.education
    : JAYANT_FACT_BANK.education;

  // Merge skills
  const skillGroups = {
    ...JAYANT_FACT_BANK.skillGroups,
    ...(customData.skillGroups || {})
  };

  return {
    candidate: {
      ...JAYANT_FACT_BANK.candidate,
      ...(customData.candidate || {})
    },
    education,
    experience,
    projects,
    skillGroups
  };
}

/**
 * Returns a compact, structured text summary of the Fact Bank
 * suitable for inclusion in AI analysis and tailoring prompts.
 */
export function getFactBankTextSummary(bank: VerifiedFactBank = JAYANT_FACT_BANK): string {
  const fb = bank;
  const eduStr = fb.education
    .map((e) => `${e.degree} in ${e.field} from ${e.institution} (${e.duration}, CGPA: ${e.cgpa})`)
    .join("\n");

  const expStr = fb.experience
    .map((exp) => `${exp.title} @ ${exp.company} (${exp.duration}) [Tech: ${exp.technologies.join(", ")}]\n${exp.verifiedBullets.map((b) => `  • ${b}`).join("\n")}`)
    .join("\n\n");

  const projStr = fb.projects
    .map((p) => `${p.name} [Tech: ${p.technologies.join(", ")} | Metrics: ${p.metrics || "N/A"}]\n${p.verifiedBullets.map((b) => `  • ${b}`).join("\n")}`)
    .join("\n\n");

  const skillsStr = Object.entries(fb.skillGroups)
    .map(([cat, list]) => `${cat}: ${list.join(", ")}`)
    .join("\n");

  return `=== VERIFIED CANDIDATE FACT BANK (SOURCE OF TRUTH) ===
Candidate: ${fb.candidate.fullName}
Education:
${eduStr}

Verified Professional Experience:
${expStr}

Verified Projects:
${projStr}

Verified Technical & Domain Skills:
${skillsStr}
======================================================`;
}
