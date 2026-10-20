import { NextRequest, NextResponse } from "next/server";
import { JobListing, JobSource, WorkplaceType } from "@/types/jobs";

function detectSourceFromUrl(urlStr: string): Exclude<JobSource, "all"> {
  const lower = urlStr.toLowerCase();
  if (lower.includes("linkedin.com")) return "linkedin";
  if (lower.includes("wellfound.com") || lower.includes("angel.co")) return "wellfound";
  if (lower.includes("indeed.com")) return "indeed";
  if (lower.includes("remotive.com")) return "remotive";
  return "linkedin";
}

function extractSkillsFromText(text: string): string[] {
  const commonTech = [
    "React", "Next.js", "TypeScript", "JavaScript", "Node.js", "Python",
    "Go", "Golang", "Java", "Kotlin", "Ruby", "Rails", "PostgreSQL",
    "MySQL", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "GCP",
    "Azure", "GraphQL", "REST APIs", "Tailwind CSS", "Figma", "CI/CD",
    "Git", "FastAPI", "Django", "LLMs", "Vector Databases", "Kafka"
  ];
  const found: string[] = [];
  const lower = text.toLowerCase();
  for (const tech of commonTech) {
    if (lower.includes(tech.toLowerCase())) {
      found.push(tech);
      if (found.length >= 6) break;
    }
  }
  return found.length > 0 ? found : ["Software Engineering", "Problem Solving"];
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string" || !url.startsWith("http")) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid HTTP/HTTPS URL" },
        { status: 400 }
      );
    }

    const detectedSource = detectSourceFromUrl(url);

    // Fetch the webpage
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Could not access URL (Status: ${response.status}). The site may require authentication.`
        },
        { status: 400 }
      );
    }

    const html = await response.text();

    let extractedTitle = "";
    let extractedCompany = "";
    let extractedLocation = "Remote / Hybrid";
    let extractedDescription = "";
    let extractedMinSalary: number | undefined;
    let extractedMaxSalary: number | undefined;

    // Strategy 1: Check for schema.org/JobPosting in JSON-LD
    const jsonLdRegex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        const jobData = parsed["@type"] === "JobPosting"
          ? parsed
          : Array.isArray(parsed["@graph"])
          ? parsed["@graph"].find((item: any) => item["@type"] === "JobPosting")
          : null;

        if (jobData) {
          if (jobData.title) extractedTitle = jobData.title;
          if (jobData.hiringOrganization?.name) extractedCompany = jobData.hiringOrganization.name;
          if (jobData.description) {
            extractedDescription = jobData.description
              .replace(/<[^>]*>?/gm, " ")
              .replace(/\s+/g, " ")
              .trim();
          }
          if (jobData.jobLocation?.address?.addressLocality) {
            extractedLocation = jobData.jobLocation.address.addressLocality;
          }
          if (jobData.baseSalary?.value?.value) {
            extractedMinSalary = Number(jobData.baseSalary.value.value);
          } else if (jobData.baseSalary?.value?.minValue) {
            extractedMinSalary = Number(jobData.baseSalary.value.minValue);
            extractedMaxSalary = Number(jobData.baseSalary.value.maxValue);
          }
          break;
        }
      } catch {
        // Skip unparseable JSON-LD chunks
      }
    }

    // Strategy 2: OpenGraph & Meta tag fallback if JSON-LD missing
    if (!extractedTitle) {
      const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i) ||
                           html.match(/<meta\s+name=["']twitter:title["']\s+content=["'](.*?)["']/i) ||
                           html.match(/<title>(.*?)<\/title>/i);
      if (ogTitleMatch && ogTitleMatch[1]) {
        let rawTitle = ogTitleMatch[1].replace(/&amp;/g, "&").replace(/&#39;/g, "'");
        // Often in format "Title at Company" or "Title - Company"
        if (rawTitle.includes(" at ")) {
          const parts = rawTitle.split(" at ");
          extractedTitle = parts[0].trim();
          if (!extractedCompany) extractedCompany = parts[1].split("|")[0].split("-")[0].trim();
        } else if (rawTitle.includes(" - ")) {
          const parts = rawTitle.split(" - ");
          extractedTitle = parts[0].trim();
          if (!extractedCompany) extractedCompany = parts[1].trim();
        } else {
          extractedTitle = rawTitle.trim();
        }
      }
    }

    if (!extractedDescription) {
      const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i) ||
                          html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
      if (ogDescMatch && ogDescMatch[1]) {
        extractedDescription = ogDescMatch[1].replace(/&amp;/g, "&").replace(/&#39;/g, "'").trim();
      }
    }

    // Clean up defaults
    if (!extractedTitle) {
      extractedTitle = "Software Engineering Role";
    }
    if (!extractedCompany) {
      extractedCompany = detectedSource.toUpperCase();
    }
    if (!extractedDescription) {
      extractedDescription = `Job listing imported from ${url}. Review full details on ${detectedSource}.`;
    }

    const workplaceType: WorkplaceType =
      extractedLocation.toLowerCase().includes("remote") || extractedDescription.toLowerCase().includes("remote")
        ? "remote"
        : extractedDescription.toLowerCase().includes("hybrid")
        ? "hybrid"
        : "onsite";

    const importedJob: JobListing = {
      id: `imported-${Date.now()}`,
      title: extractedTitle,
      company: extractedCompany,
      location: extractedLocation,
      workplaceType,
      jobType: "full-time",
      experienceLevel: extractedTitle.toLowerCase().includes("senior")
        ? "senior"
        : extractedTitle.toLowerCase().includes("lead")
        ? "lead"
        : "mid",
      minSalary: extractedMinSalary,
      maxSalary: extractedMaxSalary,
      currency: "USD",
      salaryPeriod: "yearly",
      description: extractedDescription,
      requiredSkills: extractSkillsFromText(extractedTitle + " " + extractedDescription),
      source: detectedSource,
      sourceUrl: url,
      applyUrl: url,
      postedAt: new Date().toISOString(),
      isFeatured: false
    };

    return NextResponse.json({
      success: true,
      job: importedJob
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to parse job URL" },
      { status: 500 }
    );
  }
}
