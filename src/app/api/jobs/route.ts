import { NextRequest, NextResponse } from "next/server";
import { CURATED_JOB_LISTINGS } from "@/data/curatedJobs";
import { JobListing, ExperienceLevel, WorkplaceType } from "@/types/jobs";

// In-memory cache for live fetched jobs keyed by search query
const liveJobsCache: Map<string, { jobs: JobListing[]; timestamp: number }> = new Map();
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes cache unless refresh=true is requested

// Helper: normalize salary to INR for accurate cross-currency comparisons
export function getNormalizedInrSalary(job: JobListing): number {
  const raw = job.maxSalary || job.minSalary || 0;
  if (!raw) return 0;
  // If currency is USD, convert to INR (~₹85 per USD)
  if (job.currency === "USD") {
    return raw * 85;
  }
  return raw;
}

// 1. Live LinkedIn Guest Jobs Fetcher
async function fetchLiveLinkedInJobs(query = "Data Scientist", location = "India"): Promise<JobListing[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const targetUrl = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(
      query
    )}&location=${encodeURIComponent(location)}&start=0`;

    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];

    const html = await res.text();
    const cardChunks = html.split('<div class="base-card');
    const jobs: JobListing[] = [];

    for (let i = 1; i < Math.min(cardChunks.length, 25); i++) {
      const chunk = cardChunks[i];
      const titleMatch = chunk.match(/<span class="sr-only">([\s\S]*?)<\/span>/i);
      const compMatch = chunk.match(/<h4 class="base-search-card__subtitle"[\s\S]*?>([\s\S]*?)<\/h4>/i);
      const locMatch = chunk.match(/<span class="job-search-card__location"[\s\S]*?>([\s\S]*?)<\/span>/i);
      const linkMatch = chunk.match(/href="(https:\/\/[a-z0-9.-]*linkedin\.com\/jobs\/view\/[^"]+)"/i);
      const timeMatch = chunk.match(/datetime="([^"]+)"/i);

      if (titleMatch && linkMatch) {
        const title = titleMatch[1].trim();
        const company = compMatch ? compMatch[1].replace(/<[^>]+>/g, "").trim() : "Tech Company";
        const loc = locMatch ? locMatch[1].trim() : "Bengaluru, India";
        const link = linkMatch[1].split("?")[0];
        const postedAt = timeMatch ? timeMatch[1] : new Date().toISOString();

        const lowerTitle = title.toLowerCase();
        const lowerLoc = loc.toLowerCase();

        const workplaceType: WorkplaceType = lowerLoc.includes("remote")
          ? "remote"
          : lowerLoc.includes("hybrid")
          ? "hybrid"
          : "onsite";

        const experienceLevel: ExperienceLevel =
          lowerTitle.includes("intern") ||
          lowerTitle.includes("junior") ||
          lowerTitle.includes("associate") ||
          lowerTitle.includes("entry") ||
          lowerTitle.includes("graduate") ||
          lowerTitle.includes("fresher")
            ? "entry"
            : lowerTitle.includes("lead") ||
              lowerTitle.includes("staff") ||
              lowerTitle.includes("principal") ||
              lowerTitle.includes("director")
            ? "lead"
            : lowerTitle.includes("senior") || lowerTitle.includes("sr")
            ? "senior"
            : "entry";

        // Generate relevant skills from title
        const possibleSkills = [
          "Python",
          "Machine Learning",
          "Deep Learning",
          "SQL",
          "Pandas",
          "PyTorch",
          "Transformers",
          "LLMs",
          "Scikit-learn",
          "Statistics",
          "C++",
          "Java",
          "React",
          "AWS"
        ];
        const matched = possibleSkills.filter((s) => lowerTitle.includes(s.toLowerCase()));
        const requiredSkills =
          matched.length > 0 ? matched : ["Python", "Machine Learning", "SQL", "Problem Solving"];

        // Set realistic package estimation for top tier Indian roles (in INR)
        const isIndia = lowerLoc.includes("india") || lowerLoc.includes("bengaluru") || lowerLoc.includes("hyderabad") || lowerLoc.includes("pune") || lowerLoc.includes("delhi") || lowerLoc.includes("mumbai") || lowerLoc.includes("gurgaon");
        const currency = isIndia ? "INR" : "USD";
        const minSalary = isIndia
          ? experienceLevel === "entry" ? 1200000 : experienceLevel === "senior" ? 2800000 : 2000000
          : experienceLevel === "entry" ? 85000 : experienceLevel === "senior" ? 165000 : 125000;
        const maxSalary = isIndia
          ? experienceLevel === "entry" ? 2200000 : experienceLevel === "senior" ? 4500000 : 3200000
          : experienceLevel === "entry" ? 120000 : experienceLevel === "senior" ? 225000 : 175000;

        jobs.push({
          id: `linkedin-live-${Date.now()}-${i}`,
          title,
          company,
          location: loc,
          workplaceType,
          jobType: "full-time",
          experienceLevel,
          minSalary,
          maxSalary,
          currency,
          salaryPeriod: "yearly",
          description: `Live active job vacancy pulled directly from LinkedIn for ${title} at ${company} (${loc}). This role emphasizes ${requiredSkills.join(", ")}. Review full qualifications and apply directly on LinkedIn.`,
          requiredSkills,
          source: "linkedin",
          sourceUrl: link,
          applyUrl: link,
          postedAt,
          isFeatured: false
        });
      }
    }

    return jobs;
  } catch {
    return [];
  }
}

// 2. Live Remotive Jobs Fetcher (Queries both Data & Software categories)
async function fetchLiveRemotiveJobs(): Promise<JobListing[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const [dataRes, devRes] = await Promise.allSettled([
      fetch("https://remotive.com/api/remote-jobs?category=data&limit=25", {
        signal: controller.signal
      }),
      fetch("https://remotive.com/api/remote-jobs?category=software-dev&limit=25", {
        signal: controller.signal
      })
    ]);
    clearTimeout(timeoutId);

    const jobs: any[] = [];
    if (dataRes.status === "fulfilled" && dataRes.value.ok) {
      const json = await dataRes.value.json();
      if (Array.isArray(json.jobs)) jobs.push(...json.jobs);
    }
    if (devRes.status === "fulfilled" && devRes.value.ok) {
      const json = await devRes.value.json();
      if (Array.isArray(json.jobs)) jobs.push(...json.jobs);
    }

    return jobs.map((j: any) => {
      const cleanDesc = (j.description || "")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/(?:p|div|h[1-6]|tr)>/gi, "\n\n")
        .replace(/<li[^>]*>/gi, "\n• ")
        .replace(/<\/li>/gi, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/<[^>]*>?/gm, "")
        .replace(/\n\s*\n\s*\n/g, "\n\n")
        .trim();

      const lowerTitle = (j.title || "").toLowerCase();
      const expLevel: ExperienceLevel = lowerTitle.includes("senior")
        ? "senior"
        : lowerTitle.includes("lead")
        ? "lead"
        : lowerTitle.includes("junior") || lowerTitle.includes("entry") || lowerTitle.includes("associate")
        ? "entry"
        : "mid";

      return {
        id: `remotive-${j.id}`,
        title: j.title || "Data Scientist / Software Engineer",
        company: j.company_name || "Tech Company",
        companyLogo: j.company_logo || undefined,
        location: j.candidate_required_location || "Remote",
        workplaceType: "remote" as const,
        jobType: "full-time" as const,
        experienceLevel: expLevel,
        minSalary: expLevel === "senior" ? 150000 : expLevel === "entry" ? 85000 : 120000,
        maxSalary: expLevel === "senior" ? 220000 : expLevel === "entry" ? 125000 : 165000,
        currency: "USD",
        salaryPeriod: "yearly" as const,
        description: cleanDesc || `Remote role at ${j.company_name || "Tech Company"} for ${j.title}.`,
        descriptionHtml: j.description,
        requiredSkills:
          j.tags && Array.isArray(j.tags) && j.tags.length > 0
            ? j.tags.slice(0, 6)
            : ["Python", "SQL", "Machine Learning", "Data Analysis"],
        source: "remotive" as const,
        sourceUrl: j.url || "https://remotive.com",
        applyUrl: j.url || "https://remotive.com",
        postedAt: j.publication_date || new Date().toISOString(),
        isFeatured: false
      };
    });
  } catch {
    return [];
  }
}

// 3. Live Arbeitnow Tech Job Board API (Open & free)
async function fetchLiveArbeitnowJobs(): Promise<JobListing[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch("https://www.arbeitnow.com/api/job-board-api", {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];

    const json = await res.json();
    if (!json.data || !Array.isArray(json.data)) return [];

    return json.data.slice(0, 20).map((j: any) => {
      const lowerTitle = (j.title || "").toLowerCase();
      const expLevel: ExperienceLevel = lowerTitle.includes("senior")
        ? "senior"
        : lowerTitle.includes("lead")
        ? "lead"
        : lowerTitle.includes("junior") || lowerTitle.includes("graduate") || lowerTitle.includes("associate")
        ? "entry"
        : "entry";

      const cleanDesc = (j.description || "")
        .replace(/<[^>]*>?/gm, " ")
        .replace(/\s+/g, " ")
        .slice(0, 500);

      return {
        id: `arbeitnow-${j.slug || Date.now()}`,
        title: j.title || "Software Engineer",
        company: j.company_name || "Global Tech Employer",
        location: j.location || (j.remote ? "Remote" : "Hybrid"),
        workplaceType: (j.remote ? "remote" : "hybrid") as WorkplaceType,
        jobType: "full-time" as const,
        experienceLevel: expLevel,
        minSalary: 85000,
        maxSalary: 135000,
        currency: "USD",
        salaryPeriod: "yearly" as const,
        description: cleanDesc || `Position for ${j.title} at ${j.company_name}.`,
        requiredSkills: Array.isArray(j.tags) && j.tags.length > 0 ? j.tags : ["Engineering", "Problem Solving", "Tech"],
        source: "indeed" as const,
        sourceUrl: j.url,
        applyUrl: j.url,
        postedAt: j.created_at ? new Date(j.created_at * 1000).toISOString() : new Date().toISOString(),
        isFeatured: false
      };
    });
  } catch {
    return [];
  }
}

// 4. Live JSearch (RapidAPI) integration if user configures RAPIDAPI_KEY or JSEARCH_API_KEY
async function fetchLiveJSearchJobs(query: string, location: string): Promise<JobListing[]> {
  const apiKey = process.env.RAPIDAPI_KEY || process.env.JSEARCH_API_KEY;
  if (!apiKey) return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const searchUrl = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(
      `${query} in ${location}`
    )}&page=1&num_pages=1&date_posted=all`;

    const res = await fetch(searchUrl, {
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "jsearch.p.rapidapi.com"
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];

    const json = await res.json();
    if (!json.data || !Array.isArray(json.data)) return [];

    return json.data.map((j: any) => {
      const isIndia = (j.job_country || "").toUpperCase() === "IN" || (j.job_city || "").toLowerCase().includes("bangalore") || (j.job_city || "").toLowerCase().includes("hyderabad");
      const currency = isIndia ? "INR" : (j.job_salary_currency || "USD");

      return {
        id: `jsearch-${j.job_id || Date.now()}`,
        title: j.job_title || query,
        company: j.employer_name || "Hiring Company",
        companyLogo: j.employer_logo || undefined,
        companyWebsite: j.employer_website || undefined,
        location: `${j.job_city || "Remote"}, ${j.job_country || ""}`.trim(),
        workplaceType: (j.job_is_remote ? "remote" : "hybrid") as WorkplaceType,
        jobType: "full-time" as const,
        experienceLevel: "entry" as ExperienceLevel,
        minSalary: j.job_min_salary || (isIndia ? 1200000 : 85000),
        maxSalary: j.job_max_salary || (isIndia ? 2400000 : 135000),
        currency,
        salaryPeriod: "yearly" as const,
        description: j.job_description ? j.job_description.slice(0, 800) : `Job opening for ${j.job_title}`,
        requiredSkills: Array.isArray(j.job_required_skills) && j.job_required_skills.length > 0
          ? j.job_required_skills
          : ["Python", "Machine Learning", "SQL", "Data Structures"],
        source: (j.job_publisher?.toLowerCase().includes("linkedin") ? "linkedin" : "indeed") as any,
        sourceUrl: j.job_apply_link || "https://linkedin.com",
        applyUrl: j.job_apply_link || "https://linkedin.com",
        postedAt: j.job_posted_at_datetime_utc || new Date().toISOString(),
        isFeatured: true
      };
    });
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.toLowerCase().trim() || "";
    const source = searchParams.get("source") || "all";
    const workplace = searchParams.get("workplace") || "all";
    const experience = searchParams.get("experience") || "all";
    const jobType = searchParams.get("jobType") || "all";
    const minSalaryStr = searchParams.get("minSalary");
    const minSalary = minSalaryStr ? parseInt(minSalaryStr, 10) : 0;
    const sortBy = searchParams.get("sortBy") || "recent";
    const roleCategory = searchParams.get("roleCategory") || "all";
    const isRefreshRequested = searchParams.get("refresh") === "true";

    const targetRole = searchParams.get("targetRole")?.trim() || "";
    const effectiveSearchTerm = query || targetRole || "Data Scientist";

    const cacheKey = `${effectiveSearchTerm}-${workplace}`;
    let liveJobs: JobListing[] = [];

    // Check cache unless refresh was requested explicitly
    const cached = liveJobsCache.get(cacheKey);
    if (!isRefreshRequested && cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      liveJobs = cached.jobs;
    } else {
      // Gather live jobs from LinkedIn, Remotive, Arbeitnow & optional JSearch concurrently
      const [linkedInJobsIndia, linkedInJobsGlobal, remotiveJobs, arbeitnowJobs, jsearchJobs] =
        await Promise.allSettled([
          fetchLiveLinkedInJobs(effectiveSearchTerm, "India"),
          fetchLiveLinkedInJobs(effectiveSearchTerm, "Remote"),
          fetchLiveRemotiveJobs(),
          fetchLiveArbeitnowJobs(),
          fetchLiveJSearchJobs(effectiveSearchTerm, "India")
        ]);

      const gathered: JobListing[] = [];
      if (linkedInJobsIndia.status === "fulfilled") gathered.push(...linkedInJobsIndia.value);
      if (linkedInJobsGlobal.status === "fulfilled") gathered.push(...linkedInJobsGlobal.value);
      if (remotiveJobs.status === "fulfilled") gathered.push(...remotiveJobs.value);
      if (arbeitnowJobs.status === "fulfilled") gathered.push(...arbeitnowJobs.value);
      if (jsearchJobs.status === "fulfilled") gathered.push(...jsearchJobs.value);

      liveJobs = gathered;
      liveJobsCache.set(cacheKey, { jobs: gathered, timestamp: Date.now() });
    }

    // 2. Blend Curated Jobs (expanded with 10+ LPA Fresher roles) with Live Feeds
    const allJobs = [...CURATED_JOB_LISTINGS, ...liveJobs];

    // 3. Deduplicate by Company + Title
    const seen = new Set<string>();
    const deduplicated = allJobs.filter((job) => {
      const key = `${job.company.toLowerCase().trim()}-${job.title.toLowerCase().trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // 4. Apply Filters
    let filtered = deduplicated.filter((job) => {
      const titleLower = job.title.toLowerCase();
      const compLower = job.company.toLowerCase();
      const descLower = job.description.toLowerCase();
      const normalizedSalary = getNormalizedInrSalary(job);

      // Search keyword filter
      if (query) {
        const titleMatch = titleLower.includes(query);
        const compMatch = compLower.includes(query);
        const skillMatch = job.requiredSkills.some((s) => s.toLowerCase().includes(query));
        const descMatch = descLower.includes(query);
        if (!titleMatch && !compMatch && !skillMatch && !descMatch) {
          return false;
        }
      }

      // Role Category Filter
      if (roleCategory !== "all") {
        if (roleCategory === "data_science") {
          const isDs =
            titleLower.includes("data scientist") ||
            titleLower.includes("data science") ||
            titleLower.includes("machine learning") ||
            titleLower.includes("applied scientist") ||
            titleLower.includes("decision scientist");
          if (!isDs) return false;
        } else if (roleCategory === "ai_ml") {
          const isAi =
            titleLower.includes("ai engineer") ||
            titleLower.includes("artificial intelligence") ||
            titleLower.includes("machine learning") ||
            titleLower.includes("deep learning") ||
            titleLower.includes("llm") ||
            titleLower.includes("genai") ||
            titleLower.includes("nlp");
          if (!isAi) return false;
        } else if (roleCategory === "data_analyst") {
          const isDa =
            titleLower.includes("data analyst") ||
            titleLower.includes("business analyst") ||
            titleLower.includes("analytics") ||
            titleLower.includes("bi ") ||
            titleLower.includes("intelligence");
          if (!isDa) return false;
        } else if (roleCategory === "sde") {
          const isSde =
            titleLower.includes("software") ||
            titleLower.includes("sde") ||
            titleLower.includes("developer") ||
            titleLower.includes("engineer") ||
            titleLower.includes("backend") ||
            titleLower.includes("frontend") ||
            titleLower.includes("full stack");
          if (!isSde) return false;
        } else if (roleCategory === "fresher_high_package") {
          // 10+ LPA Fresher specific target
          const isFresher = job.experienceLevel === "entry" || job.experienceLevel === "any";
          const isHighPackage = normalizedSalary >= 1000000;
          if (!isFresher || !isHighPackage) return false;
        }
      }

      // Source filter
      if (source !== "all" && job.source !== source) {
        return false;
      }

      // Workplace filter
      if (workplace !== "all" && job.workplaceType !== workplace) {
        return false;
      }

      // Experience level filter
      if (experience !== "all" && job.experienceLevel !== experience && job.experienceLevel !== "any") {
        return false;
      }

      // Job type filter
      if (jobType !== "all" && job.jobType !== jobType) {
        return false;
      }

      // Normalized INR Salary filter (e.g. 10 LPA = 1,000,000 INR; $60k USD = ~5.1M INR)
      if (minSalary > 0) {
        if (normalizedSalary < minSalary) {
          return false;
        }
      }

      return true;
    });

    // 5. Apply Sorting
    if (sortBy === "salary_high") {
      filtered.sort((a, b) => {
        const salB = getNormalizedInrSalary(b);
        const salA = getNormalizedInrSalary(a);
        return salB - salA;
      });
    } else {
      // Default: recent first, with featured prioritized
      filtered.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
      });
    }

    return NextResponse.json({
      success: true,
      count: filtered.length,
      jobs: filtered
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      company,
      location,
      description,
      workplaceType,
      experienceLevel,
      source,
      applyUrl,
      minSalary,
      maxSalary,
      currency,
      requiredSkills,
      isDirectPartner,
      employerContactEmail
    } = body;

    if (!title || !company || !description) {
      return NextResponse.json(
        { success: false, error: "Title, company, and description are required" },
        { status: 400 }
      );
    }

    const newJob: JobListing = {
      id: `job-custom-${Date.now()}`,
      title,
      company,
      location: location || "Remote",
      workplaceType: workplaceType || "remote",
      jobType: "full-time",
      experienceLevel: experienceLevel || "entry",
      minSalary: minSalary ? Number(minSalary) : undefined,
      maxSalary: maxSalary ? Number(maxSalary) : undefined,
      currency: currency || "INR",
      salaryPeriod: "yearly",
      description,
      requiredSkills:
        Array.isArray(requiredSkills) && requiredSkills.length > 0 ? requiredSkills : ["Software Engineering"],
      source: source || (isDirectPartner ? "direct" : "linkedin"),
      sourceUrl: applyUrl || "#",
      applyUrl: applyUrl || "#",
      postedAt: new Date().toISOString(),
      isFeatured: Boolean(isDirectPartner),
      isDirectPartner: Boolean(isDirectPartner),
      commissionModel: isDirectPartner ? "placement_fee" : "none",
      commissionAmount: isDirectPartner ? 1000 : 0,
      employerContactEmail: employerContactEmail || undefined
    };

    CURATED_JOB_LISTINGS.unshift(newJob);

    return NextResponse.json({
      success: true,
      job: newJob
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create job listing" },
      { status: 500 }
    );
  }
}
