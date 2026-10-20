import { NextRequest, NextResponse } from "next/server";
import { CURATED_JOB_LISTINGS } from "@/data/curatedJobs";
import { JobListing, ExperienceLevel, WorkplaceType } from "@/types/jobs";

// In-memory cache for live fetched jobs to avoid hitting remote APIs too frequently
let liveJobsCache: { jobs: JobListing[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes

// Live LinkedIn Guest Jobs Fetcher
async function fetchLiveLinkedInJobs(query = "software engineer", location = "remote"): Promise<JobListing[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const targetUrl = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(
      query || "developer"
    )}&location=${encodeURIComponent(location || "remote")}&start=0`;

    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];

    const html = await res.text();
    const cardChunks = html.split('<div class="base-card');
    const jobs: JobListing[] = [];

    for (let i = 1; i < Math.min(cardChunks.length, 12); i++) {
      const chunk = cardChunks[i];
      const titleMatch = chunk.match(/<span class="sr-only">([\s\S]*?)<\/span>/i);
      const compMatch = chunk.match(/<h4 class="base-search-card__subtitle"[\s\S]*?>([\s\S]*?)<\/h4>/i);
      const locMatch = chunk.match(/<span class="job-search-card__location"[\s\S]*?>([\s\S]*?)<\/span>/i);
      const linkMatch = chunk.match(/href="(https:\/\/[a-z0-9.-]*linkedin\.com\/jobs\/view\/[^"]+)"/i);
      const timeMatch = chunk.match(/datetime="([^"]+)"/i);

      if (titleMatch && linkMatch) {
        const title = titleMatch[1].trim();
        const company = compMatch ? compMatch[1].replace(/<[^>]+>/g, "").trim() : "Tech Company";
        const loc = locMatch ? locMatch[1].trim() : "Remote";
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
          lowerTitle.includes("intern") || lowerTitle.includes("junior") || lowerTitle.includes("associate") || lowerTitle.includes("entry")
            ? "entry"
            : lowerTitle.includes("lead") || lowerTitle.includes("staff") || lowerTitle.includes("principal") || lowerTitle.includes("director")
            ? "lead"
            : lowerTitle.includes("senior") || lowerTitle.includes("sr")
            ? "senior"
            : "mid";

        // Generate skills from title
        const possibleSkills = ["React", "TypeScript", "Node.js", "Python", "Java", "AWS", "SQL", "Go", "Kubernetes", "Next.js"];
        const matched = possibleSkills.filter((s) => lowerTitle.includes(s.toLowerCase()));
        const requiredSkills = matched.length > 0 ? matched : ["Software Engineering", "Problem Solving", "Web Architecture"];

        jobs.push({
          id: `linkedin-live-${jobs.length}-${Date.now()}`,
          title,
          company,
          location: loc,
          workplaceType,
          jobType: "full-time",
          experienceLevel,
          minSalary: experienceLevel === "entry" ? 95000 : experienceLevel === "senior" ? 165000 : 130000,
          maxSalary: experienceLevel === "entry" ? 125000 : experienceLevel === "senior" ? 215000 : 170000,
          currency: "USD",
          salaryPeriod: "yearly",
          description: `Live job posting aggregated directly from LinkedIn for ${title} at ${company}. View original application requirements and apply directly on LinkedIn.`,
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

// Live Remotive Jobs Fetcher
async function fetchLiveRemotiveJobs(): Promise<JobListing[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch("https://remotive.com/api/remote-jobs?category=software-dev&limit=15", {
      signal: controller.signal,
      next: { revalidate: 1800 }
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];

    const json = await res.json();
    if (!json.jobs || !Array.isArray(json.jobs)) return [];

    const transformed: JobListing[] = json.jobs.map((j: any) => {
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
        : lowerTitle.includes("junior")
        ? "entry"
        : "mid";

      return {
        id: `remotive-${j.id}`,
        title: j.title || "Software Engineer",
        company: j.company_name || "Tech Company",
        companyLogo: j.company_logo || undefined,
        location: j.candidate_required_location || "Remote",
        workplaceType: "remote" as const,
        jobType: "full-time" as const,
        experienceLevel: expLevel,
        minSalary: expLevel === "senior" ? 150000 : expLevel === "entry" ? 85000 : 120000,
        maxSalary: expLevel === "senior" ? 210000 : expLevel === "entry" ? 115000 : 160000,
        currency: "USD",
        salaryPeriod: "yearly",
        description: cleanDesc || `Remote role at ${j.company_name || "Tech Company"} for ${j.title}.`,
        descriptionHtml: j.description,
        requiredSkills: (j.tags && Array.isArray(j.tags) && j.tags.length > 0)
          ? j.tags.slice(0, 6)
          : ["Remote", "Software Engineering", "TypeScript", "React"],
        source: "remotive" as const,
        sourceUrl: j.url || "https://remotive.com",
        applyUrl: j.url || "https://remotive.com",
        postedAt: j.publication_date || new Date().toISOString(),
        isFeatured: false
      };
    });

    return transformed;
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

    const targetRole = searchParams.get("targetRole")?.trim() || "";
    const effectiveSearchTerm = query || targetRole || "Software Engineer";

    // 1. Gather live jobs from LinkedIn & Remotive keyed by search term
    let liveJobs: JobListing[] = [];
    const [linkedInJobs, remotiveJobs] = await Promise.all([
      fetchLiveLinkedInJobs(effectiveSearchTerm, workplace === "remote" ? "remote" : "worldwide"),
      fetchLiveRemotiveJobs()
    ]);
    liveJobs = [...linkedInJobs, ...remotiveJobs];

    // 2. Blend Curated Jobs (which contains rich LinkedIn, Wellfound, Indeed, and Direct Partner roles) with Live Feeds
    const allJobs = [...CURATED_JOB_LISTINGS, ...liveJobs];

    // 3. Deduplicate
    const seen = new Set<string>();
    const deduplicated = allJobs.filter((job) => {
      const key = `${job.company.toLowerCase().trim()}-${job.title.toLowerCase().trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // 4. Apply Filters
    let filtered = deduplicated.filter((job) => {
      // Keyword search
      if (query) {
        const titleMatch = job.title.toLowerCase().includes(query);
        const compMatch = job.company.toLowerCase().includes(query);
        const skillMatch = job.requiredSkills.some((s) => s.toLowerCase().includes(query));
        const descMatch = job.description.toLowerCase().includes(query);
        if (!titleMatch && !compMatch && !skillMatch && !descMatch) {
          return false;
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

      // Salary filter
      if (minSalary > 0) {
        const jobMaxSalary = job.maxSalary || job.minSalary || 0;
        if (jobMaxSalary < minSalary) {
          return false;
        }
      }

      return true;
    });

    // 5. Apply Sorting
    if (sortBy === "salary_high") {
      filtered.sort((a, b) => {
        const salB = b.maxSalary || b.minSalary || 0;
        const salA = a.maxSalary || a.minSalary || 0;
        return salB - salA;
      });
    } else {
      // Default: recent first, featured prioritized
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
    const { title, company, location, description, workplaceType, experienceLevel, source, applyUrl, minSalary, maxSalary, requiredSkills, isDirectPartner, employerContactEmail } = body;

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
      experienceLevel: experienceLevel || "mid",
      minSalary: minSalary ? Number(minSalary) : undefined,
      maxSalary: maxSalary ? Number(maxSalary) : undefined,
      currency: "USD",
      salaryPeriod: "yearly",
      description,
      requiredSkills: Array.isArray(requiredSkills) && requiredSkills.length > 0 ? requiredSkills : ["Software Engineering"],
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
