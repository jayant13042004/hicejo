export interface BlogArticle {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  author: string;
  category: string;
  contentHtml: string;
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: "how-to-beat-ats-in-2026",
    title: "How to Beat Applicant Tracking Systems (ATS) in 2026: The Complete Guide",
    excerpt: "Over 75% of job applicants are rejected by ATS filters before a recruiter reviews their resume. Learn how modern AI scanners work and how to score 90+.",
    date: "August 15, 2026",
    readTime: "6 min read",
    author: "Hicejo Career Team",
    category: "ATS Optimization",
    contentHtml: `
      <h2>Why 75% of Resumes Fail Applicant Tracking Systems</h2>
      <p>Modern Applicant Tracking Systems like Workday, Greenhouse, Lever, and Taleo no longer rely on simple keyword counting. In 2026, enterprise ATS platforms use semantic parsing models to extract candidate competencies, career velocity, and quantifiable achievements.</p>
      
      <h3>The 4 Core Pillars of ATS Compliance</h3>
      <ol>
        <li><strong>Standardized Section Headings:</strong> Always use standard titles such as <em>Professional Summary</em>, <em>Work Experience</em>, <em>Education</em>, and <em>Skills & Technologies</em>. Quirky headers like "Where I've Been" or "My Superpowers" confuse parsers.</li>
        <li><strong>Clear Timeline Hierarchy:</strong> Format dates consistently (e.g. <code>Jan 2022 – Present</code>). Include Company Name, Position Title, and Location for every role.</li>
        <li><strong>Quantifiable Impact Metrics:</strong> Ensure your bullet points highlight business impact (% increase in revenue, % reduction in latency, team sizes led).</li>
        <li><strong>Single-Column Layout:</strong> Multi-column tables, graphics, text boxes, and icons frequently fail OCR extractors. Stick to a clean, single-column A4 document.</li>
      </ol>

      <h3>How to Test Your ATS Match Score</h3>
      <p>Before submitting your application, always test your document in an ATS auditing tool. Hicejo's free <strong>Resume ATS Score Checker</strong> highlights missing skills and calculates your exact percentage match against the job description.</p>
    `
  },
  {
    slug: "top-50-resume-action-verbs",
    title: "Top 50 High-Impact Resume Action Verbs That Recruiters Love",
    excerpt: "Ditch passive phrases like 'Responsible for' and 'Assisted with'. Use these 50 power verbs categorized by engineering, leadership, and growth achievements.",
    date: "August 12, 2026",
    readTime: "4 min read",
    author: "Hicejo Career Team",
    category: "Resume Writing",
    contentHtml: `
      <h2>Why Action Verbs Double Interview Callbacks</h2>
      <p>Recruiters spend an average of 6 seconds skimming a resume. Starting each bullet point with a decisive action verb immediately signals ownership, authority, and execution.</p>

      <h3>1. Engineering & Technical Leadership</h3>
      <p><em>Architected, Spearheaded, Engineered, Containerized, Automated, Refactored, Deployed, Benchmarked, Streamlined, Scaled.</em></p>

      <h3>2. Data & Analytics</h3>
      <p><em>Formulated, Quantified, Modeled, Uncovered, Forecasted, Standardized, Audited, Evaluated, Validated, Synthesized.</em></p>

      <h3>3. Product & Growth Management</h3>
      <p><em>Accelerated, Championed, Monetized, Negotiated, Optimized, Orchestrated, Conceptualized, Expanded, Surpassed, Revitalized.</em></p>

      <h3>The Google "X-Y-Z" Formula</h3>
      <p>For maximum impact, pair your action verb with Google's proven accomplishment formula: <strong>"Accomplished [X], as measured by [Y], by doing [Z]."</strong></p>
    `
  },
  {
    slug: "how-to-tailor-resume-for-job-description",
    title: "How to Tailor Your Resume for Any Job Description in 60 Seconds",
    excerpt: "Sending generic resumes yields a 2% callback rate. Tailored resumes yield a 20%+ callback rate. Here is the exact step-by-step framework to customize your resume fast.",
    date: "August 10, 2026",
    readTime: "5 min read",
    author: "Hicejo Career Team",
    category: "Job Search Strategy",
    contentHtml: `
      <h2>The Generic Resume Trap</h2>
      <p>Submitting the exact same resume to 50 companies rarely works in competitive job markets. Recruiters and hiring managers look for exact alignment with the job qualifications listed in their posting.</p>

      <h3>Step-by-Step 60-Second Tailoring Method</h3>
      <ol>
        <li><strong>Extract Core Keywords:</strong> Read the job description and extract the top 5 required skills (e.g. <em>Next.js, System Architecture, CI/CD, AWS, TypeScript</em>).</li>
        <li><strong>Adapt the Executive Summary:</strong> Rephrase your 2-3 sentence summary to mention the target role title and top competencies.</li>
        <li><strong>Rearrange Experience Bullets:</strong> Move the 2-3 most relevant bullet points to the top of your most recent role.</li>
        <li><strong>Use Hicejo AI Tailor:</strong> If you want to automate this process in seconds, paste the job posting into Hicejo's <strong>Resume Tailor</strong> to rewrite your bullets while preserving 100% truthful metrics.</li>
      </ol>
    `
  }
];
