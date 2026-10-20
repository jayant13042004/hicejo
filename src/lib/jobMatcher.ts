import { JobListing, JobMatchAnalysis } from "@/types/jobs";
import { ResumeData } from "@/types/resume";

export function analyzeJobMatch(job: JobListing, resumeData?: ResumeData | null): JobMatchAnalysis {
  if (!resumeData) {
    return {
      jobId: job.id,
      score: 75,
      tier: "moderate",
      matchedSkills: job.requiredSkills.slice(0, Math.ceil(job.requiredSkills.length * 0.6)),
      missingSkills: job.requiredSkills.slice(Math.ceil(job.requiredSkills.length * 0.6)),
      matchSummary: "Estimated baseline match based on general engineering standards."
    };
  }

  // Aggregate resume text into a single searchable corpus
  const resumeSkills = (resumeData.skills || []).map((s) => s.name.toLowerCase().trim());
  const expText = (resumeData.experience || [])
    .map((e) => `${e.position} ${e.company} ${e.description}`)
    .join(" ")
    .toLowerCase();
  const projText = (resumeData.projects || [])
    .map((p) => `${p.name} ${p.role} ${p.description}`)
    .join(" ")
    .toLowerCase();
  const summaryText = (resumeData.summary || "").toLowerCase();

  const fullCorpus = `${resumeSkills.join(" ")} ${expText} ${projText} ${summaryText}`;

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  job.requiredSkills.forEach((skill) => {
    const sLower = skill.toLowerCase().trim();
    // Check direct skill match or presence in corpus
    const directMatch = resumeSkills.some((rs) => rs.includes(sLower) || sLower.includes(rs));
    const corpusMatch = fullCorpus.includes(sLower);

    if (directMatch || corpusMatch) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  // Calculate score
  const total = job.requiredSkills.length || 1;
  const matchRatio = matchedSkills.length / total;

  // Scale between 50 and 96
  const rawScore = Math.round(50 + matchRatio * 46);
  const score = Math.min(98, Math.max(45, rawScore));

  let tier: "strong" | "moderate" | "growth" = "growth";
  if (score >= 80) tier = "strong";
  else if (score >= 65) tier = "moderate";

  let matchSummary = "";
  if (tier === "strong") {
    matchSummary = `High alignment (${score}%): Your experience covers key requirements like ${matchedSkills.slice(0, 2).join(", ")}.`;
  } else if (tier === "moderate") {
    matchSummary = `Good baseline (${score}%): Matches ${matchedSkills.length} of ${total} core skills. Consider highlighting ${missingSkills.slice(0, 2).join(", ")}.`;
  } else {
    matchSummary = `Growth opportunity (${score}%): Missing several core tools (${missingSkills.slice(0, 3).join(", ")}). Resume tailoring recommended.`;
  }

  return {
    jobId: job.id,
    score,
    tier,
    matchedSkills,
    missingSkills,
    matchSummary
  };
}
